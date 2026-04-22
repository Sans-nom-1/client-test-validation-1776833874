'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface CancellationStatsProps {
  stats: {
    totalCancellations: number
    avgDelayHours: number
    cancellationRate: number
    problematicCustomers: Array<{
      customer: {
        id: string
        firstName: string
        lastName: string
        phone: string
      }
      cancellationCount: number
      totalAppointments: number
      cancellationRate: number
    }>
  }
}

export function CancellationStats({ stats }: CancellationStatsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total annulations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{stats.totalCancellations}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Délai moyen</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{stats.avgDelayHours}h</p>
            <p className="text-sm text-white/70 mt-1">avant le RDV</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Taux global</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{stats.cancellationRate}%</p>
          </CardContent>
        </Card>
      </div>

      {stats.problematicCustomers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Clients problématiques (&gt;30% annulations)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-2 px-4">Client</th>
                    <th className="text-left py-2 px-4">Téléphone</th>
                    <th className="text-right py-2 px-4">Annulations</th>
                    <th className="text-right py-2 px-4">Total RDV</th>
                    <th className="text-right py-2 px-4">Taux</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.problematicCustomers.map((item) => (
                    <tr key={item.customer.id} className="border-b border-white/10">
                      <td className="py-2 px-4">
                        {item.customer.firstName} {item.customer.lastName}
                      </td>
                      <td className="py-2 px-4">{item.customer.phone}</td>
                      <td className="text-right py-2 px-4">{item.cancellationCount}</td>
                      <td className="text-right py-2 px-4">{item.totalAppointments}</td>
                      <td className="text-right py-2 px-4 font-bold text-red-400">
                        {item.cancellationRate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
