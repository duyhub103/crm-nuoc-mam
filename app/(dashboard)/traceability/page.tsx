'use client'

import { useState, useEffect } from 'react'
import { getProductionBatches, getBatchTraceability } from '@/lib/supabase/queries/batches'
import {
  QrCode,
  Search,
  Calendar,
  MapPin,
  CheckCircle2,
  Package,
  ShoppingCart
} from 'lucide-react'

export default function TraceabilityPage() {
  const [batches, setBatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBatchId, setSelectedBatchId] = useState<string>('')
  const [traceData, setTraceData] = useState<any>(null)
  const [tracing, setTracing] = useState(false)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const data = await getProductionBatches()
      setBatches(data)
      if (data.length > 0) {
        setSelectedBatchId(data[0].id)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  useEffect(() => {
    if (!selectedBatchId) return
    async function fetchTrace() {
      setTracing(true)
      const res = await getBatchTraceability(selectedBatchId)
      setTraceData(res)
      setTracing(false)
    }
    fetchTrace()
  }, [selectedBatchId])

  const formatVND = (amt: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amt || 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <QrCode className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          <span>Truy Xuất Nguồn Gốc Lô Sản Xuất</span>
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          Tra cứu hành trình ủ chượp cá cơm tươi & muối Ninh Thuận, thời gian lên men tự nhiên 12-18 tháng và các đơn hàng xuất kho.
        </p>
      </div>

      {/* Batch Select Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3 shadow-sm">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <label className="text-xs text-slate-700 dark:text-slate-300 font-bold shrink-0">Chọn Mã Lô Ủ Chượp:</label>
        <select
          value={selectedBatchId}
          onChange={(e) => setSelectedBatchId(e.target.value)}
          className="w-full sm:w-auto flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-amber-700 dark:text-amber-400 font-mono font-bold text-xs focus:outline-none"
        >
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.batch_code} - {b.facility_location} ({b.fermentation_days} ngày ủ)
            </option>
          ))}
        </select>
      </div>

      {tracing || loading ? (
        <div className="py-16 text-center text-slate-500 dark:text-slate-400 text-xs">Đang truy xuất thông tin mã lô...</div>
      ) : traceData ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Batch Summary Card */}
          <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Mã Lô Sản Xuất</span>
              <span className="font-mono text-sm font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                {traceData.batch_code}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">Nhà Máy / Cơ Sở Ủ Chượp</span>
                  <span className="font-bold">{traceData.facility_location}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">Ngày Trộn Cá & Muối</span>
                  <span className="font-bold">{traceData.start_date}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">Ngày Rút Nhĩ Cốt</span>
                  <span className="font-bold">{traceData.bottling_date || 'Chưa đóng chai'}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block font-semibold">Tổng Thời Gian Ủ Lên Men</span>
              <span className="text-2xl font-extrabold text-amber-700 dark:text-amber-400">{traceData.fermentation_days} Ngày</span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-medium mt-1">Đạt chuẩn Nước Mắm Cốt Nhĩ Đặc Biệt</span>
            </div>
          </div>

          {/* Timeline & Distribution List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Fermentation Timeline */}
            <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Quy Trình Ủ Chượp Truyền Thống 5 Bước</span>
              </h3>

              <div className="relative pl-6 space-y-6 border-l-2 border-amber-500/40">
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-amber-500 border-2 border-white dark:border-slate-950" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">1. Tuyển chọn Cá Cơm Than tươi & Muối Ninh Thuận</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">Tỉ lệ 3 cá : 1 muối chuẩn truyền thống Phan Thiết.</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-amber-500 border-2 border-white dark:border-slate-950" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">2. Nạp Thùng Gỗ Bời Lời & Gài Nén</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">Gài nén bằng vỉ tre, phơi nắng tự nhiên đảo xịt nước bổi.</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-amber-500 border-2 border-white dark:border-slate-950" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">3. Lên Men Tự Nhiên {traceData.fermentation_days} Ngày</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">Thủy phân protein tự nhiên tạo hương vị đậm đà hậu vị ngọt.</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-amber-500 border-2 border-white dark:border-slate-950" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">4. Rút Nước Mắm Cốt Nhĩ Đầu Tiên</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">Nước mắm màu cánh gián, độ đạm chuẩn {traceData.notes || '40°N'}.</p>
                </div>
              </div>
            </div>

            {/* Distributed Orders */}
            <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Các Đơn Hàng Đã Đã Phân Phối Từ Lô Này</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Mã Đơn</th>
                      <th className="p-3">Sản Phẩm</th>
                      <th className="p-3">Số Lượng</th>
                      <th className="p-3">Thành Tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/40">
                    {traceData.order_items && traceData.order_items.length > 0 ? (
                      traceData.order_items.map((item: any) => (
                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
                          <td className="p-3 font-mono font-bold text-amber-700 dark:text-amber-400">
                            {item.orders?.order_code || 'N/A'}
                          </td>
                          <td className="p-3 font-semibold text-slate-900 dark:text-slate-200">{item.products?.name}</td>
                          <td className="p-3 font-bold">{item.quantity} {item.products?.unit}</td>
                          <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{formatVND(item.quantity * item.unit_price)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-slate-500">
                          Chưa có đơn hàng nào xuất sản phẩm từ lô này.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
