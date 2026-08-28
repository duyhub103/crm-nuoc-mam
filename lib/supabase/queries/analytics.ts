import { createClient } from '@/lib/supabase/client'

export type PeriodType = 'day' | 'week' | 'month' | 'quarter' | 'year'

export interface PeriodicStatItem {
  periodLabel: string
  revenue: number
  orderCount: number
  avgOrderValue: number
}

export async function getPeriodicRevenueStats(period: PeriodType = 'month') {
  const supabase = createClient() as any
  
  // Query all orders with order_date and total_amount
  const { data: orders, error } = await supabase
    .from('orders')
    .select('order_date, total_amount, status')
    .order('order_date', { ascending: true })

  if (error) {
    console.error('Error fetching periodic revenue stats:', error)
    return []
  }

  // Client-side date grouping to support all periods flexibly without requiring custom Postgres functions
  const grouped: Record<string, { revenue: number; count: number }> = {}

  orders?.forEach((o: any) => {
    if (!o.order_date) return
    const dateObj = new Date(o.order_date)
    let key = ''

    if (period === 'day') {
      key = o.order_date // YYYY-MM-DD
    } else if (period === 'week') {
      // Calculate week number of year
      const firstDayOfYear = new Date(dateObj.getFullYear(), 0, 1)
      const pastDaysOfYear = (dateObj.getTime() - firstDayOfYear.getTime()) / 86400000
      const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
      key = `T${weekNum}/${dateObj.getFullYear()}`
    } else if (period === 'month') {
      const m = String(dateObj.getMonth() + 1).padStart(2, '0')
      key = `Thg ${m}/${dateObj.getFullYear()}`
    } else if (period === 'quarter') {
      const q = Math.floor(dateObj.getMonth() / 3) + 1
      key = `Quý ${q}/${dateObj.getFullYear()}`
    } else if (period === 'year') {
      key = `Năm ${dateObj.getFullYear()}`
    }

    if (!grouped[key]) {
      grouped[key] = { revenue: 0, count: 0 }
    }
    grouped[key].revenue += Number(o.total_amount) || 0
    grouped[key].count += 1
  })

  const result: PeriodicStatItem[] = Object.keys(grouped).map((label) => ({
    periodLabel: label,
    revenue: grouped[label].revenue,
    orderCount: grouped[label].count,
    avgOrderValue: grouped[label].count > 0 ? Math.round(grouped[label].revenue / grouped[label].count) : 0
  }))

  return result
}
