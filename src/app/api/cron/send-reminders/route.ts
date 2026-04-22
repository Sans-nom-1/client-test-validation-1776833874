import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendSms, buildReminderSms } from '@/lib/sms'
import { addHours } from 'date-fns'

// SMS type as string literal (not enum in Prisma schema)
type SmsType = 'CONFIRMATION' | 'REMINDER' | 'CANCELLATION' | 'MARKETING'

export async function GET(request: NextRequest) {
  try {
    // OBLIGATOIRE: Vérifier le CRON_SECRET
    const cronSecret = process.env.CRON_SECRET
    if (!cronSecret) {
      console.error('CRON_SECRET non défini')
      return NextResponse.json({ error: 'Configuration manquante' }, { status: 500 })
    }

    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reminderHoursBefore = parseInt(process.env.SMS_REMINDER_HOURS_BEFORE || '24')
    const now = new Date()
    const reminderWindowStart = addHours(now, reminderHoursBefore - 1)
    const reminderWindowEnd = addHours(now, reminderHoursBefore)

    const appointmentsNeedingReminders = await prisma.appointment.findMany({
      where: {
        status: 'BOOKED',
        startAt: {
          gte: reminderWindowStart,
          lte: reminderWindowEnd,
        },
      },
      include: {
        customer: true,
        service: true,
        salon: true,
      },
    })

    const sentReminders = []

    for (const appointment of appointmentsNeedingReminders) {
      // Check if a reminder was already sent for this appointment
      // payload is stored as JSON string, so we search for the appointmentId in it
      const existingReminder = await prisma.smsLog.findFirst({
        where: {
          customerId: appointment.customerId,
          type: 'REMINDER',
          payload: {
            contains: appointment.id,
          },
        },
      })

      if (existingReminder) {
        continue
      }

      const smsMessage = buildReminderSms({
        date: appointment.startAt,
        service: appointment.service.name,
      })

      const result = await sendSms({
        salonId: appointment.salonId,
        customerId: appointment.customerId,
        phone: appointment.customer.phone,
        type: 'REMINDER',
        message: smsMessage,
        metadata: {
          appointmentId: appointment.id,
        },
      })

      if (result.success) {
        sentReminders.push({
          appointmentId: appointment.id,
          customer: `${appointment.customer.firstName} ${appointment.customer.lastName}`,
          phone: appointment.customer.phone,
        })
      }
    }

    return NextResponse.json({
      success: true,
      remindersSent: sentReminders.length,
      reminders: sentReminders,
    })
  } catch (error) {
    console.error('Error sending reminders:', error)
    return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 })
  }
}
