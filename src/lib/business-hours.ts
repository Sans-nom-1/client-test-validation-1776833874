// Configuration des horaires d'ouverture
// 0 = Dimanche, 1 = Lundi, ... 6 = Samedi

export const BUSINESS_HOURS = {

  // Dimanche ferme (pas d'entree = ferme)
} as const

export interface OpenStatus {
  isOpen: boolean
  message: string
}

const JOURS_SEMAINE = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']

export function getOpenStatus(): OpenStatus {
  const now = new Date()
  const day = now.getDay()
  const hour = now.getHours()
  const minutes = now.getMinutes()

  const todayHours = BUSINESS_HOURS[day as keyof typeof BUSINESS_HOURS]

  // Actuellement ouvert
  if (todayHours && hour >= todayHours.open && hour < todayHours.close) {
    return { isOpen: true, message: 'Ouvert maintenant' }
  }

  // Trouver la prochaine ouverture
  let daysToCheck = 0
  let nextOpenDay = day
  let nextOpenHour = 9

  // Verifier si on ouvre plus tard aujourd'hui
  if (todayHours && hour < todayHours.open) {
    const hoursUntilOpen = todayHours.open - hour - (minutes > 0 ? 1 : 0)
    const minutesUntilOpen = minutes > 0 ? 60 - minutes : 0

    if (hoursUntilOpen === 0) {
      return { isOpen: false, message: `Ouvre dans ${minutesUntilOpen} min` }
    } else if (hoursUntilOpen === 1 && minutesUntilOpen === 0) {
      return { isOpen: false, message: 'Ouvre dans 1h' }
    } else if (hoursUntilOpen < 1) {
      return { isOpen: false, message: "Ouvre dans moins d'une heure" }
    } else {
      return { isOpen: false, message: `Ouvre dans ${hoursUntilOpen}h` }
    }
  }

  // Trouver le prochain jour d'ouverture
  for (let i = 1; i <= 7; i++) {
    nextOpenDay = (day + i) % 7
    if (BUSINESS_HOURS[nextOpenDay as keyof typeof BUSINESS_HOURS]) {
      daysToCheck = i
      nextOpenHour = BUSINESS_HOURS[nextOpenDay as keyof typeof BUSINESS_HOURS].open
      break
    }
  }

  if (daysToCheck === 1) {
    // Demain
    const hoursUntilMidnight = 24 - hour
    const hoursAfterMidnight = nextOpenHour
    const totalHours = hoursUntilMidnight + hoursAfterMidnight

    if (totalHours <= 12) {
      return { isOpen: false, message: `Ouvre dans ${totalHours}h` }
    }
    return { isOpen: false, message: 'Ouvre demain a 9h' }
  }

  // Plus d'un jour
  return { isOpen: false, message: `Ouvre ${JOURS_SEMAINE[nextOpenDay]}` }
}

// Format des horaires pour l'affichage
export function getFormattedHours(): string {
  return ""
}
