import { NextRequest, NextResponse } from 'next/server'
import { autoCompleteAppointments } from '@/lib/auto-complete-appointments'

// Cron job quotidien qui:
// 1. Marque les rendez-vous passés comme DONE
// Exécuté tous les jours à 6h du matin via Vercel Cron

export async function GET(request: NextRequest) {
  try {
    // Vérifier le CRON_SECRET pour sécuriser l'endpoint
    const cronSecret = process.env.CRON_SECRET
    if (!cronSecret) {
      console.error('CRON_SECRET non défini')
      return NextResponse.json({ error: 'Configuration manquante' }, { status: 500 })
    }

    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()

    // 1. Auto-compléter tous les rendez-vous passés
    const completionResult = await autoCompleteAppointments()

    console.log(`[Daily Tasks] ${completionResult.completed} rendez-vous marqués comme DONE`)

    return NextResponse.json({
      success: true,
      executedAt: now.toISOString(),
      tasks: {
        completedAppointments: completionResult.completed,
      },
    })
  } catch (error) {
    console.error('Error running daily tasks:', error)
    return NextResponse.json({ error: 'Failed to run daily tasks' }, { status: 500 })
  }
}
