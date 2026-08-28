import { createClient } from '@/lib/supabase/client'

export async function getDashboardStats() {
  const supabase = createClient() as any

  // 1. Total revenue
  const { data: orders } = await supabase
    .from('orders')
    .select('total_amount, status, created_at, order_date')

  const totalRevenue = ((orders as any[]) || [])
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0)

  const totalOrdersCount = orders?.length || 0

  // 2. Active Customers
  const { count: customersCount } = await supabase
    .from('customers')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active')

  // 3. Overdue Debts Total
  const { data: overdueDebts } = await supabase
    .from('debts')
    .select('amount, payments(amount)')
    .eq('status', 'overdue')

  const overdueAmount = ((overdueDebts as any[]) || []).reduce((sum, d) => {
    const paid = (d.payments || []).reduce((pSum: number, p: any) => pSum + Number(p.amount || 0), 0)
    return sum + (Number(d.amount || 0) - paid)
  }, 0)

  // 4. Monthly Revenue Aggregation (past 6 months)
  const monthlyRevenueMap: Record<string, number> = {}
  ;((orders as any[]) || []).forEach(o => {
    if (o.order_date) {
      const monthKey = o.order_date.substring(0, 7) // YYYY-MM
      monthlyRevenueMap[monthKey] = (monthlyRevenueMap[monthKey] || 0) + Number(o.total_amount || 0)
    }
  })

  const monthlyChartData = Object.entries(monthlyRevenueMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, amount]) => ({
      month: `Thg ${month.split('-')[1]}/${month.split('-')[0].substring(2)}`,
      doanhThu: amount
    }))

  // 5. Recent Orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select(`
      id, order_code, total_amount, status, payment_status, order_date,
      customers ( name, region )
    `)
    .order('order_date', { ascending: false })
    .limit(5)

  return {
    totalRevenue,
    totalOrdersCount,
    activeCustomersCount: customersCount || 0,
    overdueAmount,
    monthlyChartData,
    recentOrders: (recentOrders as any[]) || []
  }
}
