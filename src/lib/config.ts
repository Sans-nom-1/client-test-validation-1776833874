// Configuration centralisee du site - Genere par SaaS Factory

export const SITE_CONFIG = {
  name: "Test Health Check",
  slogan: "Test e2e automatique",
  instagram: "",
  instagramHandle: "",
  facebook: "",
  tiktok: "",
  location: "Paris",
  address: "1 rue du Test, 75001 Paris",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=1%20rue%20du%20Test%2C%2075001%20Paris",
  phone: "0100000000",
  email: "test-healthcheck@example.com",
} as const

// Stats affichees sur le Hero
export const HERO_STATS = {
  rating: {
    value: "5.0",
    label: "Note moyenne",
  },
  clients: {
    value: "500+",
    label: "Clients satisfaits",
  },
  responseTime: {
    value: "2h",
    label: "Temps de reponse",
  },
} as const

// Textes Hero personnalisables
export const HERO_CONTENT = {
  title: "L'excellence, simplifiee.",
  cta: "Reserver maintenant",
  ctaSecondary: "Voir nos services",
} as const

// Annee de creation (pour stats)
export const SITE_CREATION_YEAR = 2021

// Copyright
export const COPYRIGHT_TEXT = "© 2026 Test Health Check. Tous droits reserves."

// Liens de navigation
export const NAV_LINKS = [
  { href: '/', label: 'Accueil' },
  { href: '/services', label: 'Services' },
  { href: '/horaires', label: 'Horaires' },
  { href: '/contact', label: 'Contact' },
] as const

// Liens legaux
export const LEGAL_LINKS = [
  { href: '/mentions-legales', label: 'Mentions legales' },
  { href: '/politique-confidentialite', label: 'Confidentialite' },
  { href: '/politique-cookies', label: 'Cookies' },
] as const

// ID du salon
export const SALON_ID = "cmo9l0ijd00000mpca7ol829y"
