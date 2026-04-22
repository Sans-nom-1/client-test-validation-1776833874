import Link from 'next/link'
import { MapPin, Phone, Mail, Map, Instagram, Calendar } from 'lucide-react'
import FloatingNav from '@/components/navigation/FloatingNav'
import Footer from '@/components/Footer'
import { SITE_CONFIG } from '@/lib/config'

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background-primary text-label-primary">
      <FloatingNav />

      <main className="flex-1 px-4 py-20 pt-24 mx-auto w-full max-w-[800px]">
        <div className="text-center mb-12">
          <h1 className="ios-title-1 text-label-primary mb-2">Contact &amp; Infos</h1>
          <p className="ios-body text-label-secondary">Retrouvez toutes nos coordonnées</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coordonnees */}
          <div className="bg-ios-elevated rounded-2xl p-7 border border-ios-separator/20">
            <h2 className="ios-headline text-accent mb-6">Coordonnées</h2>
            <div className="flex flex-col gap-5">
              <div className="flex gap-3.5 items-start">
                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="ios-body font-semibold text-label-primary">{SITE_CONFIG.address}</p>
                </div>
              </div>

              {SITE_CONFIG.phone && (
                <a href={`tel:${SITE_CONFIG.phone}`} className="flex gap-3.5 items-center group">
                  <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                    <Phone className="w-4 h-4 text-accent" />
                  </div>
                  <span className="ios-body font-semibold text-label-primary group-hover:text-accent transition-colors">
                    {SITE_CONFIG.phone}
                  </span>
                </a>
              )}

              {SITE_CONFIG.email && (
                <a href={`mailto:${SITE_CONFIG.email}`} className="flex gap-3.5 items-center group">
                  <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                    <Mail className="w-4 h-4 text-accent" />
                  </div>
                  <span className="ios-body text-label-primary group-hover:text-accent transition-colors">
                    {SITE_CONFIG.email}
                  </span>
                </a>
              )}

              {SITE_CONFIG.mapsUrl && (
                <a href={SITE_CONFIG.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex gap-3.5 items-center group">
                  <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                    <Map className="w-4 h-4 text-accent" />
                  </div>
                  <span className="ios-subheadline text-accent group-hover:underline transition-colors">
                    Voir sur Google Maps
                  </span>
                </a>
              )}
            </div>
          </div>

          {/* Reseaux sociaux */}
          {(SITE_CONFIG.instagram || SITE_CONFIG.facebook || SITE_CONFIG.tiktok) && (
            <div className="bg-ios-elevated rounded-2xl p-7 border border-ios-separator/20">
              <h2 className="ios-headline text-accent mb-6">Réseaux sociaux</h2>
              <div className="flex flex-col gap-4">
                {SITE_CONFIG.instagram && (
                  <a
                    href={SITE_CONFIG.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-3.5 items-center group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center shrink-0 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all">
                      <Instagram className="w-4 h-4 text-pink-400" />
                    </div>
                    <span className="ios-body text-label-primary group-hover:text-accent transition-colors">
                      {SITE_CONFIG.instagramHandle || 'Instagram'}
                    </span>
                  </a>
                )}

                {SITE_CONFIG.facebook && (
                  <a
                    href={SITE_CONFIG.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-3.5 items-center group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0 group-hover:bg-blue-500/25 transition-colors">
                      <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </div>
                    <span className="ios-body text-label-primary group-hover:text-accent transition-colors">Facebook</span>
                  </a>
                )}

                {SITE_CONFIG.tiktok && (
                  <a
                    href={SITE_CONFIG.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-3.5 items-center group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-label-primary/10 flex items-center justify-center shrink-0 group-hover:bg-label-primary/15 transition-colors">
                      <svg className="w-4 h-4 text-label-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.75a8.18 8.18 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.18z"/></svg>
                    </div>
                    <span className="ios-body text-label-primary group-hover:text-accent transition-colors">TikTok</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/booking"
            className="inline-flex items-center gap-2 font-bold text-sm px-8 py-3.5 rounded-2xl bg-accent text-white hover:opacity-90 active:scale-[0.98] transition-all"
          >
            <Calendar className="w-4 h-4" />
            Prendre rendez-vous
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
