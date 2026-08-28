'use client'

import { useState, useEffect } from 'react'
import { getCurrentProfile } from '@/lib/supabase/queries/auth'
import { getPipelineStages, getPipelineCustomers, updateCustomerStage } from '@/lib/supabase/queries/pipeline'
import ConfirmModal from '@/components/ConfirmModal'
import {
  Kanban,
  UserCheck,
  Building2,
  ChevronRight,
  ArrowRightLeft,
  Sparkles,
  Phone
} from 'lucide-react'

export default function PipelinePage() {
  const [currentProfile, setCurrentProfile] = useState<any>(null)
  const [stages, setStages] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [movingId, setMovingId] = useState<string | null>(null)

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
    setLoading(true)
    const [p, stData, cuData] = await Promise.all([
      getCurrentProfile(),
      getPipelineStages(),
      getPipelineCustomers()
    ])
    setCurrentProfile(p)
    setStages(stData)

    // If Sales role, only show customers assigned to them
    if (p && p.role === 'sales') {
      const filtered = cuData.filter((c: any) => c.assigned_sales_id === p.id)
      setCustomers(filtered)
    } else {
      setCustomers(cuData)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const promptStageMove = (customerId: string, customerName: string, fromStageId: string | null, toStageId: string) => {
    if (fromStageId === toStageId) return

    const targetStage = stages.find(s => s.id === toStageId)
    const stageName = targetStage ? targetStage.name : 'Giai đoạn mới'

    setConfirmState({
      isOpen: true,
      title: 'Xác Nhận Chuyển Giai Đoạn Chăm Sóc',
      message: `Bạn có chắc chắn muốn chuyển đại lý "${customerName}" sang giai đoạn [${stageName}] không?`,
      action: async () => {
        setMovingId(customerId)

        // Optimistic UI update
        setCustomers(prev =>
          prev.map((c: any) => c.id === customerId ? { ...c, current_stage_id: toStageId } : c)
        )

        try {
          await updateCustomerStage(customerId, fromStageId, toStageId)
          setConfirmState(prev => ({ ...prev, isOpen: false }))
        } catch (err: any) {
          alert('Lỗi cập nhật giai đoạn: ' + (err.message || 'Không thành công'))
          loadData()
        } finally {
          setMovingId(null)
        }
      }
    })
  }

  const formatVND = (amt: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amt || 0)

  const getSegmentBadge = (segment?: string) => {
    switch (segment) {
      case 'vip':
        return <span className="bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">👑 VIP</span>
      case 'on_dinh':
        return <span className="bg-blue-500/15 text-blue-800 dark:text-blue-400 border border-blue-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">🟢 Ổn Định</span>
      case 'can_cham_soc':
        return <span className="bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">⚡ Cần Chú Ý</span>
      case 'rui_ro_roi_bo':
        return <span className="bg-red-500/15 text-red-800 dark:text-red-400 border border-red-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">⚠️ Rủi Ro</span>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Kanban className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <span>Kanban Quy Trình Chăm Sóc Khách Hàng</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Theo dõi hành trình đại lý từ Mới tiếp cận ➔ Tư vấn ➔ Chào giá ➔ Khách chính thức.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-500 dark:text-slate-400 text-xs">Đang tải bảng Kanban quy trình...</div>
      ) : (
        /* Horizontal Kanban Columns Container */
        <div className="flex gap-4 overflow-x-auto pb-6 items-start min-h-[70vh]">
          {stages.map((stage) => {
            const stageCustomers = customers.filter(c => c.current_stage_id === stage.id || (!c.current_stage_id && stage.sort_order === 1))

            return (
              <div
                key={stage.id}
                className="w-72 shrink-0 glass-card rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[75vh] shadow-sm"
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/60 rounded-t-2xl">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: stage.color || '#f59e0b' }}
                    />
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs">{stage.name}</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {stageCustomers.length}
                  </span>
                </div>

                {/* Column Cards Drop Area */}
                <div className="p-3 space-y-3 overflow-y-auto flex-1">
                  {stageCustomers.length > 0 ? (
                    stageCustomers.map((c) => (
                      <div
                        key={c.id}
                        className={`p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2.5 transition-all hover:border-amber-500/60 ${
                          movingId === c.id ? 'opacity-50 scale-95' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs leading-snug">
                            {c.name}
                          </h4>
                          {getSegmentBadge(c.score?.segment)}
                        </div>

                        <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                          <div className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{c.region} • {c.type}</span>
                          </div>
                          {c.phone && (
                            <div className="flex items-center gap-1 font-mono text-[10px]">
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{c.phone}</span>
                            </div>
                          )}
                        </div>

                        {/* Latest Order & Sales Person */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                          <div>
                            <span className="text-slate-400 block font-semibold">Đơn mới nhất:</span>
                            <span className="font-bold text-slate-900 dark:text-slate-200">
                              {c.latestOrder ? formatVND(c.latestOrder.total_amount) : 'Chưa có đơn'}
                            </span>
                          </div>

                          {/* Quick Stage Move Dropdown */}
                          <div className="relative group/select">
                            <select
                              value={c.current_stage_id || stage.id}
                              onChange={(e) => promptStageMove(c.id, c.name, c.current_stage_id, e.target.value)}
                              className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-[10px] font-bold focus:outline-none cursor-pointer"
                            >
                              {stages.map((st) => (
                                <option key={st.id} value={st.id}>
                                  ➔ {st.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-slate-400 text-[11px] border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      Chưa có đại lý ở giai đoạn này
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

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
