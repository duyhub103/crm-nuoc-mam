'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getDashboardStats } from '@/lib/supabase/queries/dashboard'
import {
  DollarSign,
  ShoppingCart,
  Users,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ChevronRight,
  Package,
  Sparkles
} from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const res = await getDashboardStats()
      setStats(res)
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500 dark:text-slate-400 gap-3">
        <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <span>Đang tải số liệu CRM Nước Mắm...</span>
      </div>
    )
  }

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0)
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl glass-card p-6 border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/30">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                Hải Hương Fish Sauce CRM
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Bảng Điều Khiển Tổng Quan</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Theo dõi doanh số phân phối nước mắm truyền thống & công nghiệp, công nợ đại lý và lô sản xuất.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/orders"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Tạo Đơn Mới</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tổng Doanh Thu</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatVND(stats?.totalRevenue)}</h3>
            <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Tăng trưởng đều đặn</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Số Đơn Hàng</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats?.totalOrdersCount} Đơn</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">Gồm đơn hoàn tất & đang giao</span>
          </div>
        </div>

        {/* Active Customers */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Khách Hàng Active</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats?.activeCustomersCount} Đại lý</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">Đại lý Cấp 1, Cấp 2, Siêu thị, Nhà hàng</span>
          </div>
        </div>

        {/* Overdue Debt */}
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Công Nợ Quá Hạn</span>
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">{formatVND(stats?.overdueAmount)}</h3>
            <span className="text-xs text-red-600/80 dark:text-red-400/80 block mt-1 font-medium">Cần đôn đốc thanh toán</span>
          </div>
        </div>
      </div>

      {/* Revenue Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Doanh Số Theo Thời Gian</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tăng trưởng các tháng gần nhất (VND)</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
              Tính mùa vụ
            </span>
          </div>

          <div className="space-y-4">
            {stats?.monthlyChartData && stats.monthlyChartData.length > 0 ? (
              stats.monthlyChartData.map((item: any, idx: number) => {
                const maxVal = Math.max(...stats.monthlyChartData.map((m: any) => m.doanhThu || 1))
                const percentage = Math.round((item.doanhThu / maxVal) * 100)
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700 dark:text-slate-300 font-semibold">{item.month}</span>
                      <span className="text-amber-700 dark:text-amber-400 font-bold">{formatVND(item.doanhThu)}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700/50">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 8)}%` }}
                      />
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="py-12 text-center text-slate-500 text-sm">
                Chưa có dữ liệu biểu đồ. Nhấp "Nạp Mock Data Demo" ở trang Login để tự động tạo.
              </div>
            )}
          </div>
        </div>

        {/* Quick Traceability & Batch Alert */}
        <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Truy Xuất Nguồn Gốc</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              Theo dõi quy trình ủ chượp cá cơm Phan Thiết & Phú Quốc trong 12-18 tháng theo từng mã lô sản xuất.
            </p>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Mã Lô Nổi Bật:</span>
                <span className="font-mono text-amber-700 dark:text-amber-400 font-bold">BATCH-2025-PT01</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Thời gian ủ:</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold">554 Ngày (18 tháng)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Cơ sở:</span>
                <span className="text-slate-800 dark:text-slate-200 truncate max-w-[150px]">Phan Thiết, Bình Thuận</span>
              </div>
            </div>
          </div>

          <Link
            href="/traceability"
            className="mt-6 w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Tra Cứu Lô Sản Xuất</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Đơn Hàng Gần Đây</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Danh sách các đơn hàng mới cập nhật</p>
          </div>
          <Link
            href="/orders"
            className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-600 flex items-center gap-1"
          >
            <span>Xem Tất Cả</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Mã Đơn</th>
                <th className="p-4">Khách Hàng / Đại Lý</th>
                <th className="p-4">Ngày Đặt</th>
                <th className="p-4">Tổng Tiền</th>
                <th className="p-4">Trạng Thái Đơn</th>
                <th className="p-4">Thanh Toán</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-amber-700 dark:text-amber-400">{o.order_code}</td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-200">{o.customers?.name || 'Khách Hàng'}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{o.customers?.region || 'Toàn quốc'}</div>
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">{o.order_date}</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-slate-100">{formatVND(o.total_amount)}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          o.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                            : o.status === 'delivering'
                            ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30'
                            : o.status === 'confirmed'
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                            : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          o.payment_status === 'paid'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                            : o.payment_status === 'partial'
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                            : 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30'
                        }`}
                      >
                        {o.payment_status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Chưa có đơn hàng nào. Hãy vào trang Đơn Hàng để tạo đơn đầu tiên.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
