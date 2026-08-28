'use client'

import { useState, useEffect } from 'react'
import { getPeriodicRevenueStats, PeriodType, PeriodicStatItem } from '@/lib/supabase/queries/analytics'
import { BarChart3, TrendingUp, Calendar, ShoppingBag, DollarSign, Filter } from 'lucide-react'

export default function ReportsPage() {
  const [period, setPeriod] = useState<PeriodType>('month')
  const [stats, setStats] = useState<PeriodicStatItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      setLoading(true)
      const data = await getPeriodicRevenueStats(period)
      setStats(data)
      setLoading(false)
    }
    loadStats()
  }, [period])

  const totalRevenue = stats.reduce((sum, item) => sum + item.revenue, 0)
  const totalOrders = stats.reduce((sum, item) => sum + item.orderCount, 0)
  const avgValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0
  const maxRevenue = Math.max(...stats.map(s => s.revenue), 1)

  const formatVND = (amt: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amt || 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <span>Báo Cáo & Thống Kê Kinh Doanh Phân Phối</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Phân tích chi tiết tổng doanh số, sản lượng đơn hàng và giá trị trung bình theo Ngày, Tuần, Tháng, Quý, Năm.
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="glass-card p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-1 shadow-sm self-start sm:self-auto">
          {[
            { id: 'day', label: 'Theo Ngày' },
            { id: 'week', label: 'Theo Tuần' },
            { id: 'month', label: 'Theo Tháng' },
            { id: 'quarter', label: 'Theo Quý' },
            { id: 'year', label: 'Theo Năm' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPeriod(tab.id as PeriodType)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                period === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Metric Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Tổng Doanh Số {period === 'day' ? 'Ngày' : period === 'week' ? 'Tuần' : period === 'month' ? 'Tháng' : period === 'quarter' ? 'Quý' : 'Năm'}</span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{formatVND(totalRevenue)}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Số Lượng Đơn Đặt Hàng</span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{totalOrders} Đơn</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-700 dark:text-blue-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Giá Trị Đơn Trung Bình</span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{formatVND(avgValue)}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Bar Visual & Table Report */}
      <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Biểu Đồ Doanh Số Nhóm {period === 'day' ? 'Theo Ngày' : period === 'week' ? 'Theo Tuần' : period === 'month' ? 'Theo Tháng' : period === 'quarter' ? 'Theo Quý' : 'Theo Năm'}</span>
          </h3>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{stats.length} Kỳ thống kê</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400 text-xs">Đang tổng hợp dữ liệu doanh số...</div>
        ) : stats.length > 0 ? (
          <div className="space-y-6">
            {/* Visual Bar Chart (Pure CSS & Dynamic SVG Bar) */}
            <div className="h-64 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
              {stats.map((item, idx) => {
                const heightPercent = Math.max(10, Math.round((item.revenue / maxRevenue) * 100))
                return (
                  <div key={idx} className="flex-1 min-w-[36px] flex flex-col items-center gap-2 group relative">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 text-[10px] font-bold py-1 px-2 rounded-lg pointer-events-none whitespace-nowrap shadow-lg z-10">
                      {formatVND(item.revenue)} ({item.orderCount} đơn)
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-900/60 rounded-t-xl flex items-end justify-center h-48 p-1">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full max-w-[28px] bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-lg transition-all group-hover:brightness-110 shadow-md shadow-amber-500/20"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate max-w-full">{item.periodLabel}</span>
                  </div>
                )
              })}
            </div>

            {/* Detailed Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Kỳ Thời Gian</th>
                    <th className="p-3">Số Lượng Đơn Đặt</th>
                    <th className="p-3">Giá Trị Đơn Trung Bình</th>
                    <th className="p-3 text-right">Tổng Doanh Số (VND)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/40">
                  {stats.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
                      <td className="p-3 font-bold text-slate-900 dark:text-slate-200">{item.periodLabel}</td>
                      <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{item.orderCount} Đơn hàng</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 font-medium">{formatVND(item.avgOrderValue)}</td>
                      <td className="p-3 text-right font-extrabold text-amber-700 dark:text-amber-400">{formatVND(item.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 text-xs">Chưa có dữ liệu đơn hàng trong kỳ này.</div>
        )}
      </div>
    </div>
  )
}
