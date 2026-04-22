import { prisma } from './prisma'
import { formatDateParis, formatTimeParis } from './timezone'

// Message types
type SmsType = 'CONFIRMATION' | 'REMINDER' | 'CANCELLATION' | 'MARKETING'

// Nettoyer les variables d'environnement (enlever les \n et espaces)
const brevoApiKey = process.env.BREVO_API_KEY?.trim().replace(/\\n/g, '')
const brevoSender = (process.env.BREVO_SENDER || 'LVL UP FD').trim().replace(/\\n/g, '')
const isSMSConfigured = !!brevoApiKey

// Numero du salon pour les notifications proprio
const SALON_PHONE = process.env.SALON_PHONE || ''

// Adresse et infos du salon
const SALON_ADDRESS = process.env.SALON_ADDRESS || ''
const SALON_SONNETTE = process.env.SALON_SONNETTE || ''

// Nom du salon pour les messages
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Salon'

// ============================================================
// FONCTION D'ENVOI SMS VIA BREVO
// ============================================================

async function sendSMSViaBrovo(to: string, message: string): Promise<{ success: boolean; messageId?: string }> {
  console.log('[BREVO] Tentative envoi SMS a:', to)
  console.log('[BREVO] API Key configuree:', !!brevoApiKey)

  if (!isSMSConfigured) {
    console.warn('[BREVO] API non configuree - SMS simule')
    return { success: true, messageId: 'mock' }
  }

  try {
    let formattedPhone = to.replace(/\s/g, '')
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '33' + formattedPhone.slice(1)
    } else if (formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.slice(1)
    }

    console.log('[BREVO] Numero formate:', formattedPhone)

    const response = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey!,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: brevoSender,
        recipient: formattedPhone,
        content: message,
        type: 'transactional',
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[BREVO] Erreur API:', response.status, error)
      return { success: false }
    }

    const result = await response.json()
    console.log('[BREVO] SMS envoye avec succes, messageId:', result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('[BREVO] Erreur envoi:', error)
    return { success: false }
  }
}

// ============================================================
// FONCTIONS SIMPLES D'ENVOI SMS
// ============================================================

export async function sendSimpleSms(to: string, message: string): Promise<boolean> {
  const result = await sendSMSViaBrovo(to, message)
  return result.success
}

export async function sendSMS(params: { to: string; message: string }): Promise<boolean> {
  return sendSimpleSms(params.to, params.message)
}

// ============================================================
// FONCTION AVEC LOGGING
// ============================================================

interface SendSmsParams {
  salonId: string
  customerId?: string
  phone: string
  type: SmsType
  message: string
  metadata?: Record<string, unknown>
}

export async function sendSms(params: SendSmsParams): Promise<{ success: boolean }> {
  const { salonId, customerId, phone, type, message, metadata = {} } = params

  const smsResult = await sendSMSViaBrovo(phone, message)

  // Logger le message
  try {
    await prisma.smsLog.create({
      data: {
        salonId,
        customerId,
        phone,
        type,
        payload: JSON.stringify({ message, ...metadata }),
        status: smsResult.success ? 'SENT' : 'FAILED',
        provider: isSMSConfigured ? 'brevo' : 'mock',
        providerMessageId: smsResult.messageId,
      },
    })
  } catch (logError) {
    console.error('[SMS LOG ERROR]', logError)
  }

  return { success: smsResult.success }
}

// ============================================================
// HELPERS - FORMATAGE DE DATE (utilise timezone Paris)
// ============================================================

function formatDateFr(date: Date): string {
  return formatDateParis(date)
}

function formatTimeFr(date: Date): string {
  return formatTimeParis(date)
}

// ============================================================
// MESSAGE BUILDERS
// ============================================================

export function buildConfirmationSms(data: {
  date: Date
  service: string
  salonName: string
}) {
  const dateStr = formatDateFr(data.date)
  const timeStr = formatTimeFr(data.date)
  return `RDV confirme!\n\n${dateStr} a ${timeStr}\n${data.service}\n\nAdresse: ${SALON_ADDRESS}\n\nMerci pour ta confiance!\nA tres vite!\n\n- ${SITE_NAME}`
}

export function buildReminderSms(data: {
  date: Date
  service: string
}) {
  const timeStr = formatTimeFr(data.date)
  return `Rappel RDV demain!\n\n${timeStr}\n${data.service}\n\nAdresse: ${SALON_ADDRESS}\n\nOn t'attend avec impatience!\nA demain!\n\n- ${SITE_NAME}`
}

export function buildCancellationSms(data: {
  date: Date
  cancelledBy: 'CUSTOMER' | 'ADMIN'
}) {
  const dateStr = formatDateFr(data.date)
  const timeStr = formatTimeFr(data.date)

  if (data.cancelledBy === 'CUSTOMER') {
    return `RDV annule!\n\nTon RDV du ${dateStr} a ${timeStr} a bien ete annule.\n\nPas de soucis, on comprend!\nReprends vite un nouveau RDV en ligne.\n\nA tres bientot!\n\n- ${SITE_NAME}`
  } else {
    return `RDV annule\n\nDesole, ton RDV du ${dateStr} a ${timeStr} a du etre annule.\n\nOn s'excuse pour ce desagrement!\nReprends vite un nouveau creneau en ligne.\n\nMerci de ta comprehension!\n\n- ${SITE_NAME}`
  }
}

// ============================================================
// FONCTIONS HAUT NIVEAU - CONFIRMATION
// ============================================================

export async function sendConfirmationSMS(
  phone: string,
  data: {
    customerName: string
    serviceName: string
    date: Date
    salonName: string
    salonAddress?: string
  }
): Promise<boolean> {
  const message = buildConfirmationSms({
    date: data.date,
    service: data.serviceName,
    salonName: data.salonName,
  })

  return sendSimpleSms(phone, message)
}

export async function sendBookingConfirmationSms(appointment: {
  id: string
  salonId: string
  customerId: string
  startAt: Date
  customer: { phone: string; firstName: string }
  service: { name: string }
  salon: { name: string }
}): Promise<{ success: boolean }> {
  const message = buildConfirmationSms({
    date: new Date(appointment.startAt),
    service: appointment.service.name,
    salonName: appointment.salon.name,
  })

  return sendSms({
    salonId: appointment.salonId,
    customerId: appointment.customerId,
    phone: appointment.customer.phone,
    type: 'CONFIRMATION',
    message,
    metadata: {
      appointmentId: appointment.id,
      serviceName: appointment.service.name,
      startAt: appointment.startAt,
    },
  })
}

// ============================================================
// FONCTIONS HAUT NIVEAU - RAPPEL
// ============================================================

export async function sendReminderSMS(
  phone: string,
  data: {
    customerName: string
    serviceName: string
    date: Date
    salonName: string
    salonAddress?: string
  }
): Promise<boolean> {
  const message = buildReminderSms({
    date: data.date,
    service: data.serviceName,
  })

  return sendSimpleSms(phone, message)
}

// ============================================================
// FONCTIONS HAUT NIVEAU - ANNULATION
// ============================================================

export async function sendCancellationSms(appointment: {
  id: string
  salonId: string
  customerId: string
  startAt: Date
  customer: { phone: string }
}, cancelledBy: 'CUSTOMER' | 'ADMIN'): Promise<{ success: boolean }> {
  const message = buildCancellationSms({
    date: new Date(appointment.startAt),
    cancelledBy,
  })

  return sendSms({
    salonId: appointment.salonId,
    customerId: appointment.customerId,
    phone: appointment.customer.phone,
    type: 'CANCELLATION',
    message,
    metadata: {
      appointmentId: appointment.id,
      cancelledBy,
      startAt: appointment.startAt,
    },
  })
}

// ============================================================
// NOTIFICATIONS SALON
// ============================================================

// Notifier le salon d'une nouvelle reservation
export async function notifySalonOfNewBooking(appointment: {
  id: string
  salonId: string
  startAt: Date
  customer: { firstName: string; lastName: string; phone: string }
  service: { name: string }
}): Promise<{ success: boolean }> {
  const dateStr = formatDateFr(new Date(appointment.startAt))
  const timeStr = formatTimeFr(new Date(appointment.startAt))
  const message = `[Reservation client]\n\nClient: ${appointment.customer.firstName} ${appointment.customer.lastName}\nTel: ${appointment.customer.phone}\nPresta: ${appointment.service.name}\nDate: ${dateStr}\nHeure: ${timeStr}`

  const sent = await sendSimpleSms(SALON_PHONE, message)
  return { success: sent }
}

// Notifier le salon d'une annulation client
export async function notifySalonOfCancellation(appointment: {
  id: string
  salonId: string
  startAt: Date
  customer: { firstName: string; lastName: string; phone: string }
  service?: { name: string }
}): Promise<{ success: boolean }> {
  const dateStr = formatDateFr(new Date(appointment.startAt))
  const timeStr = formatTimeFr(new Date(appointment.startAt))
  const serviceName = appointment.service?.name || 'N/A'
  const message = `[Annulation client]\n\nClient: ${appointment.customer.firstName} ${appointment.customer.lastName}\nTel: ${appointment.customer.phone}\nPresta: ${serviceName}\nDate: ${dateStr}\nHeure: ${timeStr}`

  const sent = await sendSimpleSms(SALON_PHONE, message)
  return { success: sent }
}

// ============================================================
// FONCTIONS MODIFICATION RDV
// ============================================================

export function buildModificationSms(data: {
  oldDate: Date
  newDate: Date
  service: string
}) {
  const oldDateStr = formatDateFr(data.oldDate)
  const oldTimeStr = formatTimeFr(data.oldDate)
  const newDateStr = formatDateFr(data.newDate)
  const newTimeStr = formatTimeFr(data.newDate)

  return `RDV modifie!\n\nAncien: ${oldDateStr} a ${oldTimeStr}\nNouveau: ${newDateStr} a ${newTimeStr}\n${data.service}\n\nAdresse: ${SALON_ADDRESS}${SALON_SONNETTE ? `\nSonnette: ${SALON_SONNETTE}` : ''}\n\nA bientot!\n\n- ${SITE_NAME}`
}

export async function sendModificationSms(
  phone: string,
  data: {
    oldDate: Date
    newDate: Date
    service: string
  }
): Promise<boolean> {
  const message = buildModificationSms(data)
  return sendSimpleSms(phone, message)
}

// Notifier le salon d'une modification de RDV
export async function notifySalonOfModification(appointment: {
  id: string
  salonId: string
  oldStartAt: Date
  newStartAt: Date
  customer: { firstName: string; lastName: string; phone: string }
  service: { name: string }
}): Promise<{ success: boolean }> {
  const oldDateStr = formatDateFr(new Date(appointment.oldStartAt))
  const oldTimeStr = formatTimeFr(new Date(appointment.oldStartAt))
  const newDateStr = formatDateFr(new Date(appointment.newStartAt))
  const newTimeStr = formatTimeFr(new Date(appointment.newStartAt))

  const message = `[Modification RDV]\n\nClient: ${appointment.customer.firstName} ${appointment.customer.lastName}\nTel: ${appointment.customer.phone}\nPresta: ${appointment.service.name}\n\nAncien: ${oldDateStr} a ${oldTimeStr}\nNouveau: ${newDateStr} a ${newTimeStr}`

  const sent = await sendSimpleSms(SALON_PHONE, message)
  return { success: sent }
}
