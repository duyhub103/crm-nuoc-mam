'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { getCustomerById } from '@/lib/supabase/queries/customers'
import { getCustomerScore, computeCustomerScore } from '@/lib/supabase/queries/scoring'
import ConfirmModal from '@/components/ConfirmModal'
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  ShoppingCart,
  Sparkles,
  Award,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const id = resolvedParams?.id

  const [customer, setCustomer] = useState<any>(null)
  const [scoreData, setScoreData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)

  // Confirm Modal State
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean
    title: string
    message: string
    action: () => Promise<void>
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: async () => {}
  })

  const loadData = async () => {
    if (!id) return
    setLoading(true)
    const [cData, sData] = await Promise.all([
      getCustomerById(id),
      getCustomerScore(id)
    ])
    setCustomer(cData)
    setScoreData(sData)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [id])

  const promptComputeScore = () => {
    setConfirmState({
      isOpen: true,
      title: 'Xác Nhận Kích Hoạt Chấm Điểm AI',
      message: `Hệ thống sẽ tổng hợp lịch sử đơn hàng, công nợ và lượt chăm sóc để tính lại 5 chỉ số và tạo nhận xét AI cho khách hàng "${customer?.name}". Bạn có muốn tiếp tục không?`,
      action: async () => {
        setCalculating(true)
        try {
          const res = await computeCustomerScore(id)
          setScoreData(res)
          setConfirmState(prev => ({ ...prev, isOpen: false }))
        } catch (err: any) {
          alert('Lỗi tính điểm AI: ' + (err.message || 'Không thành công'))
        } finally {
          setCalculating(false)
        }
      }
    })
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 dark:text-slate-400 text-xs">
        Đang tải thông tin chi tiết khách hàng...
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="p-6 glass-card rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Không tìm thấy dữ liệu đại lý / khách hàng</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Khách hàng này có thể đã bị xóa hoặc chưa được khởi tạo dữ liệu mẫu trong cơ sở dữ liệu Supabase.
          </p>
          <div className="pt-2">
            <Link
              href="/customers"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay Lại Danh Sách Khách Hàng</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const formatVND = (amt: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amt || 0)

  const totalSpent = (customer.orders || [])
    .filter((o: any) => o.status !== 'cancelled')
    .reduce((sum: number, o: any) => sum + Number(o.total_amount || 0), 0)

  const currentDebt = (customer.debts || [])
    .filter((d: any) => d.status !== 'paid')
    .reduce((sum: number, d: any) => sum + Number(d.amount || 0), 0)

  const debtRatio = customer.debt_limit > 0 ? Math.min(Math.round((currentDebt / customer.debt_limit) * 100), 100) : 0

  const getSegmentBadge = (segment?: string) => {
    switch (segment) {
      case 'vip':
        return <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-800 dark:text-amber-400 border border-amber-500/40 uppercase">👑 Khách Hàng VIP Nòng Cốt</span>
      case 'on_dinh':
        return <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-500/20 text-blue-800 dark:text-blue-400 border border-blue-500/40 uppercase">🟢 Khách Hàng Ổn Định</span>
      case 'can_cham_soc':
        return <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-800 dark:text-amber-400 border border-amber-500/40 uppercase">⚡ Cần Chú Ý Chăm Sóc</span>
      case 'rui_ro_roi_bo':
        return <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-red-500/20 text-red-800 dark:text-red-400 border border-red-500/40 uppercase">⚠️ Rủi Ro Rời Bỏ</span>
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-500/20 text-slate-700 dark:text-slate-400 border border-slate-500/40 uppercase">Chưa Đánh Giá</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/customers"
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Danh sách Khách hàng</span>
        </Link>
      </div>

      {/* Profile Header */}
      <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-md shadow-amber-500/20">
            <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[14px] flex items-center justify-center font-bold text-amber-600 dark:text-amber-400 text-xl uppercase">
              {customer.name.substring(0, 2)}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{customer.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 uppercase">
                {customer.type}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {customer.phone || 'Chưa có SĐT'}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {customer.email || 'Chưa có Email'}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {customer.address || 'Chưa có địa chỉ'}
              </span>
            </div>
          </div>
        </div>

        {/* Credit Limit Meter */}
        <div className="w-full md:w-64 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-600 dark:text-slate-400 font-semibold">Công Nợ Hiện Tại:</span>
            <span className={`font-bold ${currentDebt > customer.debt_limit ? 'text-red-600 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'}`}>
              {formatVND(currentDebt)}
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden my-2">
            <div
              className={`h-full rounded-full transition-all ${
                debtRatio > 80 ? 'bg-red-500' : debtRatio > 50 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${debtRatio}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <span>Hạn mức: {formatVND(customer.debt_limit)}</span>
            <span>{debtRatio}%</span>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Tổng Doanh Số Đã Đặt</span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-2">{formatVND(totalSpent)}</h3>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Số Đơn Hàng</span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-2">{customer.orders?.length || 0} Đơn</h3>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Nhân Viên Phụ Trách</span>
          <h3 className="text-xl font-bold text-amber-700 dark:text-amber-400 mt-2">
            {customer.profiles?.full_name || 'Đội Ngũ Sales Hải Hương'}
          </h3>
        </div>
      </div>

      {/* PHASE 2: Customer Scoring & AI Insights Card */}
      <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Đánh Giá Hành Vi & AI Phân Tích Insight</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Chấm điểm 5 chỉ số hành vi đại lý và đưa ra khuyến nghị từ trí tuệ nhân tạo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {getSegmentBadge(scoreData?.segment)}
            <button
              onClick={promptComputeScore}
              disabled={calculating}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${calculating ? 'animate-spin' : ''}`} />
              <span>{calculating ? 'Đang Tính...' : 'Tính Lại Điểm & AI'}</span>
            </button>
          </div>
        </div>

        {scoreData ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 5 Quantitative Metrics */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase">5 Chỉ Số Định Lượng (Thang Điểm 0 - 100)</span>
                <span className="text-sm font-extrabold text-amber-700 dark:text-amber-400">
                  TỔNG ĐIỂM: {scoreData.overall_score || 0}/100
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-700 dark:text-slate-300">1. Tần suất mua hàng (Order Frequency)</span>
                    <span className="font-bold text-amber-700 dark:text-amber-400">{scoreData.order_frequency_score || 0}/100</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${scoreData.order_frequency_score || 0}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-700 dark:text-slate-300">2. Tăng trưởng doanh số (Revenue Growth)</span>
                    <span className="font-bold text-blue-700 dark:text-blue-400">{scoreData.revenue_growth_score || 0}/100</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${scoreData.revenue_growth_score || 0}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-700 dark:text-slate-300">3. Độ tin cậy thanh toán (Payment Reliability)</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">{scoreData.payment_reliability_score || 0}/100</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${scoreData.payment_reliability_score || 0}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-700 dark:text-slate-300">4. Mức độ được chăm sóc (Visit Engagement)</span>
                    <span className="font-bold text-purple-700 dark:text-purple-400">{scoreData.visit_engagement_score || 0}/100</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${scoreData.visit_engagement_score || 0}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-700 dark:text-slate-300">5. Tỷ lệ trải nghiệm dịch vụ & khiếu nại (Complaints)</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">{scoreData.complaint_score || 0}/100</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${scoreData.complaint_score || 0}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Natural Language Insight Box */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs">
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>AI Insight & Khuyến Nghị Cho Sales</span>
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {scoreData.ai_insight || 'Chưa có phân tích AI. Nhấp nút "Tính Lại Điểm & AI" ở trên.'}
                </p>
              </div>

              <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-2 border-t border-amber-500/20 font-mono">
                Cập nhật lúc: {scoreData.computed_at ? new Date(scoreData.computed_at).toLocaleString('vi-VN') : 'Mới tính toán'}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
            <span>Chưa có dữ liệu chấm điểm hành vi đại lý này.</span>
            <button
              onClick={promptComputeScore}
              disabled={calculating}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>Kích Hoạt Chấm Điểm AI Ngay</span>
            </button>
          </div>
        )}
      </div>

      {/* History Tabs / Order Table */}
      <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>Lịch Sử Đơn Hàng Của Khách Hàng</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-4">Mã Đơn</th>
                <th className="p-4">Ngày Đặt</th>
                <th className="p-4">Giá Trị Đơn</th>
                <th className="p-4">Trạng Thái Đơn</th>
                <th className="p-4">Thanh Toán</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {customer.orders && customer.orders.length > 0 ? (
                customer.orders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    <td className="p-4 font-mono font-bold text-amber-700 dark:text-amber-400">{o.order_code}</td>
                    <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">{new Date(o.created_at).toLocaleDateString('vi-VN')}</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-slate-100">{formatVND(o.total_amount)}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {o.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          o.payment_status === 'paid' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-red-500/10 text-red-700 dark:text-red-400'
                        }`}
                      >
                        {o.payment_status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Khách hàng này chưa phát sinh đơn hàng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.action}
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}
