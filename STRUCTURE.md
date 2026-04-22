# LVL Up - Structure du Projet

> SaaS de reservation pour salons - Squelette replicable

**Pour creer un nouveau projet:** Voir `_systems/SKELETON.md`

## Organisation des dossiers

```
lvl-up/
├── _assets/                    # Ressources visuelles
│   ├── logos/                  # Logos de la marque
│   ├── screenshots/            # Captures d'ecran
│   └── design/                 # Maquettes et references
│
├── _documentation/             # Documentation complete
│   ├── INDEX.md                # Index de la doc
│   ├── QUICKSTART.md           # Demarrage rapide
│   ├── API.md                  # Reference API
│   ├── DEPLOIEMENT.md          # Guide deploiement
│   ├── SMS-SETUP.md            # Config SMS Brevo
│   └── AVAILABILITY_ENGINE_SPEC.md
│
├── _systems/                   # Documentation par systeme
│   ├── README.md               # Vue d'ensemble systemes
│   ├── sms/                    # Systeme notifications SMS
│   ├── reservation/            # Systeme de reservation
│   ├── authentification/       # Systeme auth JWT
│   ├── admin-dashboard/        # Interface admin
│   ├── fidelite-clients/       # Programme fidelite
│   └── database/               # Schema BDD Prisma
│
├── src/                        # CODE SOURCE (NE PAS MODIFIER LA STRUCTURE)
│   ├── app/                    # Pages + API Routes (Next.js App Router)
│   ├── components/             # Composants React
│   ├── lib/                    # Utilitaires (auth, sms, prisma...)
│   └── types/                  # Types TypeScript
│
├── prisma/                     # CONFIGURATION BDD
│   ├── schema.prisma           # Schema de la base
│   └── seed.ts                 # Donnees de demo
│
├── public/                     # FICHIERS STATIQUES
│   └── images/                 # Images publiques
│
├── scripts/                    # SCRIPTS UTILITAIRES
│   └── create-admin.ts         # Creation admin
│
└── [fichiers config]           # Configuration projet
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.ts
    ├── next.config.ts
    ├── vercel.json
    └── .env.local
```

## Les 6 Systemes

| Systeme | Description | Fichiers cles |
|---------|-------------|---------------|
| **SMS** | Notifications Brevo | `src/lib/sms.ts`, `src/app/api/cron/` |
| **Reservation** | Flux de prise de RDV | `src/app/booking/`, `src/app/api/slots/` |
| **Authentification** | JWT + sessions | `src/lib/auth.ts`, `src/app/api/auth/` |
| **Admin Dashboard** | Interface gestion | `src/app/admin/`, `src/app/api/admin/` |
| **Fidelite Clients** | Programme fidelite | `src/app/account/`, `src/app/api/customers/` |
| **Database** | PostgreSQL + Prisma | `prisma/schema.prisma`, `src/lib/prisma.ts` |

## Commandes utiles

```bash
# Developpement
npm run dev             # Serveur dev sur :3000

# Base de donnees
npm run db:push         # Appliquer schema
npm run db:studio       # Interface visuelle
npm run db:seed         # Charger donnees demo

# Production
npm run build           # Build production
```

## Deploiement

- **Hebergement:** Vercel
- **Base de donnees:** Neon PostgreSQL
- **SMS:** Brevo API
- **URL Production:** https://lvl-up-pi.vercel.app
