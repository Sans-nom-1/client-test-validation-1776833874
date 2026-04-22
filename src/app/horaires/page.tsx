import Link from 'next/link'
import { Calendar } from 'lucide-react'
import FloatingNav from '@/components/navigation/FloatingNav'
import Footer from '@/components/Footer'
import { BUSINESS_HOURS } from '@/lib/business-hours'

const DAYS_FR: Record<number, string> = {
  1: 'Lundi', 2: 'Mardi', 3: 'Mercredi', 4: 'Jeudi',
  5: 'Vendredi', 6: 'Samedi', 7: 'Dimanche',
}
const DAYS_ORDER = [1, 2, 3, 4, 5, 6, 7]

function formatHour(h: number) {
  const hh = Math.floor(h)
  const mm = Math.round((h % 1) * 60)
  return `${hh}h${mm === 0 ? '00' : String(mm).padStart(2, '0')}`
}

export default function HorairesPage() {
  const todayJS = new Date().getDay()

  return (
    <div className="min-h-screen flex flex-col bg-background-primary text-label-primary">
      <FloatingNav />

      <main className="flex-1 px-4 py-20 pt-24 mx-auto w-full max-w-[600px]">
        <div className="text-center mb-12">
          <h1 className="ios-title-1 text-label-primary mb-2">Horaires d&apos;ouverture</h1>
          <p className="ios-body text-label-secondary">Retrouvez nos horaires ci-dessous</p>
        </div>

        <div className="bg-ios-elevated rounded-2xl overflow-hidden border border-ios-separator/20">
          {DAYS_ORDER.map((dayNum, i) => {
            const h = BUSINESS_HOURS[dayNum]
            const isToday = (dayNum === 7 ? 0 : dayNum) === todayJS
            return (
              <div
                key={dayNum}
                className={`flex justify-between items-center px-6 py-4 transition-colors ${
                  isToday ? 'bg-accent/5' : ''
                } ${i < 6 ? 'border-b border-ios-separator/15' : ''}`}
              >
                <span className={`ios-body ${isToday ? 'text-label-primary font-bold' : 'text-label-secondary'}`}>
                  {isToday && <span className="text-accent mr-2">▶</span>}
                  {DAYS_FR[dayNum]}
                </span>
                {h ? (
                  <span className={`ios-body font-semibold ${isToday ? 'text-accent' : 'text-label-primary'}`}>
                    {formatHour(h.open)} – {formatHour(h.close)}
                  </span>
                ) : (
                  <span className="ios-body italic text-label-tertiary">Fermé</span>
                )}
              </div>
            )
          })}
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
