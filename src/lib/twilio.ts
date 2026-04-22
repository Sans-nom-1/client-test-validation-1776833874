import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const brevoApiKey = process.env.BREVO_API_KEY
const brevoSender = process.env.BREVO_SENDER || process.env.NEXT_PUBLIC_SITE_NAME || 'Salon'
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Salon'
const SALON_ADDRESS = process.env.SALON_ADDRESS || ''

// Vérifier si Brevo est configuré
const isSMSConfigured = !!brevoApiKey

interface SendSMSParams {
  to: string
  message: string
}

export async function sendSMS({ to, message }: SendSMSParams): Promise<boolean> {
  if (!isSMSConfigured) {
    console.warn('⚠️  Brevo non configuré - SMS non envoyé')
    console.log(`📱 SMS simulé vers ${to}: ${message}`)
    return false
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey!,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: brevoSender,
        recipient: to,
        content: message,
        type: 'transactional',
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('❌ Erreur Brevo:', error)
      throw new Error(`Erreur Brevo: ${response.status} ${error}`)
    }

    const result = await response.json()
    console.log('✅ SMS envoyé via Brevo:', result.messageId)
    return true
  } catch (error) {
    console.error('❌ Erreur envoi SMS:', error)
    throw error
  }
}

interface AppointmentDetails {
  customerName: string
  serviceName: string
  date: Date
  salonName: string
  salonAddress?: string
}

export async function sendConfirmationSMS(
  phone: string,
  details: AppointmentDetails
): Promise<boolean> {
  const dateStr = format(details.date, "EEEE d MMMM 'à' HH'h'mm", { locale: fr })

  const message = `Salut ${details.customerName},

Ton rendez-vous est confirmé :
📅 ${dateStr}
✂️ ${details.serviceName}
📍 ${SALON_ADDRESS}

Annuler ou déplacer ? Rends-toi sur ton compte sur mon site de réservation

À très vite !
${SITE_NAME}`

  return sendSMS({ to: phone, message })
}

export async function sendReminderSMS(
  phone: string,
  details: AppointmentDetails
): Promise<boolean> {
  const dateStr = format(details.date, "EEEE d MMMM 'à' HH'h'mm", { locale: fr })

  const message = `Rappel - Rendez-vous demain !

Salut ${details.customerName},

On t'attend demain :
📅 ${dateStr}
✂️ ${details.serviceName}
📍 ${SALON_ADDRESS}

Annuler ou déplacer ? Rends-toi sur ton compte sur mon site de réservation

À demain !
${SITE_NAME}`

  return sendSMS({ to: phone, message })
}

export { isSMSConfigured }
