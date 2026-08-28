'use client'

import { useState, useEffect } from 'react'
import { getDebts, recordPayment } from '@/lib/supabase/queries/debts'
import { createClient } from '@/lib/supabase/client'
import {
  CreditCard,
  Filter,
  PlusCircle,
  X,
  DollarSign
} from 'lucide-react'

export default function DebtsPage() {
  const [debts, setDebts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [recording, setRecording] = useState(false)
  const [selectedDebt, setSelectedDebt] = useState<any>(null)
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState<any>('bank_transfer')
  const [payNotes, setPayNotes] = useState('')

  const fetchDebts = async () => {
    setLoading(true)
    const data = await getDebts({
      status: selectedStatus ? (selectedStatus as any) : undefined,
    })
    setDebts(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchDebts()
  }, [selectedStatus])

  const openPaymentModal = (debt: any) => {
    setSelectedDebt(debt)
    const paidSum = (debt.payments || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
    const remaining = Math.max(0, debt.amount - paidSum)
    setPayAmount(String(remaining))
    setIsModalOpen(true)
  }

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDebt) return

    setRecording(true)
    try {
      const supabase = createClient() as any
      const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', 'hai-huong').single()
      if (!tenant) throw new Error('Không tìm thấy Tenant Hải Hương')

      await recordPayment({
        tenant_id: tenant.id,
        debt_id: selectedDebt.id,
        customer_id: selectedDebt.customer_id,
        amount: Number(payAmount) || 0,
        method: payMethod,
        notes: payNotes || undefined
      })

      setIsModalOpen(false)
      fetchDebts()
    } catch (err: any) {
      alert('Lỗi ghi nhận thanh toán: ' + (err.message || 'Không thành công'))
    } finally {
      setRecording(false)
    }
  }

  const formatVND = (amt: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amt || 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <span>Quản Lý Công Nợ & Thanh Toán</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Theo dõi nợ trong hạn, nợ quá hạn và ghi nhận thanh toán ngân hàng / tiền mặt từ đại lý.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-sm">
        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-300 text-xs focus:outline-none"
        >
          <option value="">-- Tất Cả Trạng Thái Nợ --</option>
          <option value="open">Đang Mở (Trong Hạn)</option>
          <option value="overdue">Quá Hạn (Overdue)</option>
          <option value="paid">Đã Thanh Toán Đủ</option>
        </select>
      </div>

      {/* Debts Table */}
      <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400 text-xs">Đang tải danh sách công nợ...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Khách Hàng / Đại Lý</th>
                  <th className="p-4">Đơn Hàng Gốc</th>
                  <th className="p-4">Tổng Nợ Gốc</th>
                  <th className="p-4">Đã Thanh Toán</th>
                  <th className="p-4">Hạn Thanh Toán</th>
                  <th className="p-4">Trạng Thái</th>
                  <th className="p-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {debts.length > 0 ? (
                  debts.map((d) => {
                    const paidSum = (d.payments || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0)

                    return (
                      <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-900 dark:text-slate-100">{d.customers?.name || 'Khách Hàng'}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{d.customers?.region} • Hạn mức: {formatVND(d.customers?.debt_limit)}</div>
                        </td>
                        <td className="p-4 font-mono font-bold text-amber-700 dark:text-amber-400">
                          {d.orders?.order_code || 'Đơn nợ đính kèm'}
                        </td>
                        <td className="p-4 font-bold text-slate-900 dark:text-slate-100">{formatVND(d.amount)}</td>
                        <td className="p-4 text-emerald-700 dark:text-emerald-400 font-bold">{formatVND(paidSum)}</td>
                        <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">{d.due_date || 'N/A'}</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              d.status === 'paid'
                                ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border-emerald-500/30'
                                : d.status === 'overdue'
                                ? 'bg-red-500/15 text-red-800 dark:text-red-400 border-red-500/30'
                                : 'bg-amber-500/15 text-amber-800 dark:text-amber-400 border-amber-500/30'
                            }`}
                          >
                            {d.status === 'paid' ? 'Đã Trả Hết' : d.status === 'overdue' ? 'Quá Hạn' : 'Đang Mở'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {d.status !== 'paid' && (
                            <button
                              onClick={() => openPaymentModal(d)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-md shadow-amber-500/20"
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>Ghi Trả Tiền</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      Không tìm thấy dữ liệu công nợ.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {isModalOpen && selectedDebt && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 relative shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span>Ghi Nhận Thanh Toán Công Nợ</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              Khách hàng: <span className="text-slate-900 dark:text-slate-200 font-semibold">{selectedDebt.customers?.name}</span>
            </p>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Mã Đơn Nợ:</span>
                  <span className="font-mono text-amber-700 dark:text-amber-400 font-bold">{selectedDebt.orders?.order_code}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Tổng Nợ Ban Đầu:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">{formatVND(selectedDebt.amount)}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Số Tiền Thanh Toán Lần Này (VND) (*)</label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-amber-700 dark:text-amber-400 font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Hình Thức Thanh Toán</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
                >
                  <option value="bank_transfer">Chuyển Khoản Ngân Hàng (Bank Transfer)</option>
                  <option value="cash">Tiền Mặt (Cash)</option>
                  <option value="other">Hình Thức Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Ghi Chú Thanh Toán</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="UNC Vietcombank / Tiền thu trực tiếp..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                disabled={recording}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all cursor-pointer"
              >
                {recording ? 'Đang Lưu...' : 'Xác Nhận Thu Nợ'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
