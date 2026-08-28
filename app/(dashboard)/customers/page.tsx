'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getCurrentProfile } from '@/lib/supabase/queries/auth'
import { getCustomers, createCustomer } from '@/lib/supabase/queries/customers'
import { getEmployees, assignCustomerSales } from '@/lib/supabase/queries/users'
import { createClient } from '@/lib/supabase/client'
import ConfirmModal from '@/components/ConfirmModal'
import {
  Users,
  Search,
  Plus,
  Filter,
  Phone,
  Mail,
  MapPin,
  X,
  ChevronRight,
  UserCheck
} from 'lucide-react'

export default function CustomersPage() {
  const [currentProfile, setCurrentProfile] = useState<any>(null)
  const [customers, setCustomers] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedRegion, setSelectedRegion] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  // Form State
  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState<any>('dai_ly_cap1')
  const [formPhone, setFormPhone] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formAddress, setFormAddress] = useState('')
  const [formRegion, setFormRegion] = useState('Miền Nam')
  const [formDebtLimit, setFormDebtLimit] = useState('200000000')
  const [formSalesId, setFormSalesId] = useState('')

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

  const fetchCustomers = async () => {
    setLoading(true)
    const [p, cData, eData] = await Promise.all([
      getCurrentProfile(),
      getCustomers({
        search,
        type: selectedType ? (selectedType as any) : undefined,
        region: selectedRegion || undefined,
      }),
      getEmployees()
    ])
    setCurrentProfile(p)

    // RBAC Data Filtering: If Sales role, only show customers assigned to this sales person
    if (p && p.role === 'sales') {
      const filteredForSales = cData.filter((c: any) => c.assigned_sales_id === p.id)
      setCustomers(filteredForSales)
    } else {
      setCustomers(cData)
    }

    setEmployees(eData)
    setLoading(false)
  }

  useEffect(() => {
    fetchCustomers()
  }, [search, selectedType, selectedRegion])

  const promptAssignSales = (customerId: string, customerName: string, salesId: string) => {
    // Only admin can reassign sales
    if (currentProfile?.role !== 'admin' && currentProfile?.role !== 'super_admin') {
      alert('Chỉ Admin có quyền phân công lại nhân viên phụ trách đại lý.')
      return
    }

    const selectedEmp = employees.find(e => e.id === salesId)
    const empName = selectedEmp ? selectedEmp.full_name : 'Bỏ phân công'

    setConfirmState({
      isOpen: true,
      title: 'Xác Nhận Phân Công Sales Phụ Trách',
      message: `Bạn có chắc chắn muốn phân công nhân viên Sales "${empName}" phụ trách chăm sóc đại lý "${customerName}" không?`,
      action: async () => {
        try {
          const val = salesId === 'none' ? null : salesId
          await assignCustomerSales(customerId, val)
          setCustomers(prev =>
            prev.map(c => c.id === customerId ? { ...c, assigned_sales_id: val, profiles: selectedEmp || null } : c)
          )
          setConfirmState(prev => ({ ...prev, isOpen: false }))
        } catch (err: any) {
          alert('Lỗi phân công Sales: ' + (err.message || 'Không thành công'))
        }
      }
    })
  }

  const promptCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault()
    setConfirmState({
      isOpen: true,
      title: 'Xác Nhận Thêm Đại Lý Mới',
      message: `Bạn có chắc chắn muốn khởi tạo thông tin đại lý "${formName}" vào hệ thống không?`,
      action: async () => {
        setCreating(true)
        try {
          const supabase = createClient() as any
          const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', 'hai-huong').single()
          if (!tenant) throw new Error('Không tìm thấy Tenant Hải Hương')

          await createCustomer({
            tenant_id: tenant.id,
            name: formName,
            type: formType,
            phone: formPhone,
            email: formEmail,
            address: formAddress,
            region: formRegion,
            debt_limit: Number(formDebtLimit) || 0,
            assigned_sales_id: formSalesId || undefined
          })

          setIsModalOpen(false)
          setFormName('')
          setFormPhone('')
          setFormEmail('')
          setFormAddress('')
          setConfirmState(prev => ({ ...prev, isOpen: false }))
          fetchCustomers()
        } catch (err: any) {
          alert('Lỗi tạo khách hàng: ' + (err.message || 'Không thành công'))
        } finally {
          setCreating(false)
        }
      }
    })
  }

  const formatVND = (amt: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amt || 0)

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'dai_ly_cap1':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30">Đại Lý Cấp 1</span>
      case 'dai_ly_cap2':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-800 dark:text-blue-400 border border-blue-500/30">Đại Lý Cấp 2</span>
      case 'sieu_thi':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-800 dark:text-purple-400 border border-purple-500/30">Siêu Thị</span>
      case 'nha_hang':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border border-emerald-500/30">Nhà Hàng / Quán</span>
      case 'xuat_khau':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-800 dark:text-indigo-400 border border-indigo-500/30">Xuất Khẩu</span>
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/15 text-slate-700 dark:text-slate-400 border border-slate-500/30">Khách Lẻ</span>
    }
  }

  const getSegmentBadge = (segment?: string) => {
    switch (segment) {
      case 'vip':
        return <span className="bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ml-1">👑 VIP</span>
      case 'on_dinh':
        return <span className="bg-blue-500/15 text-blue-800 dark:text-blue-400 border border-blue-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ml-1">🟢 Ổn Định</span>
      case 'can_cham_soc':
        return <span className="bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ml-1">⚡ Cần Chú Ý</span>
      case 'rui_ro_roi_bo':
        return <span className="bg-red-500/15 text-red-800 dark:text-red-400 border border-red-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ml-1">⚠️ Rủi Ro</span>
      default:
        return null
    }
  }

  const isAdmin = currentProfile?.role === 'admin' || currentProfile?.role === 'super_admin'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <span>Quản Lý Khách Hàng & Phụ Trách Sales</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Danh sách đại lý Cấp 1, Cấp 2, Siêu thị và phân công nhân viên Sales chăm sóc thị trường.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Khách Hàng Mới</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center gap-3 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên đại lý, số điện thoại, email..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-300 text-xs focus:outline-none"
          >
            <option value="">-- Loại Khách Hàng --</option>
            <option value="dai_ly_cap1">Đại Lý Cấp 1</option>
            <option value="dai_ly_cap2">Đại Lý Cấp 2</option>
            <option value="sieu_thi">Siêu Thị</option>
            <option value="nha_hang">Nhà Hàng</option>
            <option value="khach_le">Khách Lẻ</option>
            <option value="xuat_khau">Xuất Khẩu</option>
          </select>

          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-300 text-xs focus:outline-none"
          >
            <option value="">-- Khu Vực --</option>
            <option value="Miền Bắc">Miền Bắc</option>
            <option value="Miền Trung">Miền Trung</option>
            <option value="Miền Nam">Miền Nam</option>
            <option value="ĐBSCL">ĐBSCL</option>
            <option value="Xuất khẩu">Xuất khẩu</option>
          </select>
        </div>
      </div>

      {/* Customer List Table */}
      <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400 text-xs">Đang tải danh sách khách hàng...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Tên Đại Lý / Khách Hàng</th>
                  <th className="p-4">Phân Loại</th>
                  <th className="p-4">Sales Phụ Trách</th>
                  <th className="p-4">Khu Vực</th>
                  <th className="p-4">Hạn Mức Nợ</th>
                  <th className="p-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {customers.length > 0 ? (
                  customers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Link href={`/customers/${c.id}`} className="font-bold text-slate-900 dark:text-slate-100 hover:text-amber-600 dark:hover:text-amber-400">
                            {c.name}
                          </Link>
                          {getSegmentBadge(c.score?.segment)}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[220px]">{c.address || 'Chưa cập nhật địa chỉ'}</span>
                        </div>
                      </td>
                      <td className="p-4">{getTypeBadge(c.type)}</td>
                      <td className="p-4">
                        {/* RBAC Control: Dropdown for Admin, Static Badge for Kế Toán / Sales */}
                        {isAdmin ? (
                          <div className="relative inline-block">
                            <select
                              value={c.assigned_sales_id || 'none'}
                              onChange={(e) => promptAssignSales(c.id, c.name, e.target.value)}
                              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40 cursor-pointer"
                            >
                              <option value="none">-- Chưa phân công --</option>
                              {employees.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                  👤 {emp.full_name} ({emp.role})
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 font-bold text-xs">
                            👤 {c.profiles?.full_name || 'Chưa phân công'}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">
                          {c.region || 'Toàn quốc'}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-amber-700 dark:text-amber-400">
                        {formatVND(c.debt_limit)}
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/customers/${c.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/20 hover:text-amber-700 dark:hover:text-amber-400 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-300 rounded-lg text-[11px] font-semibold transition-colors"
                        >
                          <span>Xem Chi Tiết</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      Không tìm thấy khách hàng phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 relative shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span>Thêm Khách Hàng & Gán Sales Phụ Trách</span>
            </h3>

            <form onSubmit={promptCreateCustomer} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Tên Đại Lý / Khách Hàng (*)</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="VD: Đại lý Nước mắm Ninh Bình"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Loại Khách Hàng</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
                  >
                    <option value="dai_ly_cap1">Đại Lý Cấp 1</option>
                    <option value="dai_ly_cap2">Đại Lý Cấp 2</option>
                    <option value="sieu_thi">Siêu Thị</option>
                    <option value="nha_hang">Nhà Hàng</option>
                    <option value="khach_le">Khách Lẻ</option>
                    <option value="xuat_khau">Xuất Khẩu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Khu Vực</label>
                  <select
                    value={formRegion}
                    onChange={(e) => setFormRegion(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
                  >
                    <option value="Miền Bắc">Miền Bắc</option>
                    <option value="Miền Trung">Miền Trung</option>
                    <option value="Miền Nam">Miền Nam</option>
                    <option value="ĐBSCL">ĐBSCL</option>
                    <option value="Xuất khẩu">Xuất khẩu</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Nhân Viên Sales Phụ Trách</label>
                <select
                  value={formSalesId}
                  onChange={(e) => setFormSalesId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-bold"
                >
                  <option value="">-- Chọn Nhân Viên Phụ Trách --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      👤 {emp.full_name} ({emp.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Số Điện Thoại</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="0912..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Hạn Mức Nợ (VND)</label>
                  <input
                    type="number"
                    value={formDebtLimit}
                    onChange={(e) => setFormDebtLimit(e.target.value)}
                    placeholder="200000000"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="contact@daily.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Địa Chỉ Chi Tiết</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Số nhà, đường, phường, TP..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all cursor-pointer"
              >
                {creating ? 'Đang Lưu...' : 'Lưu Thông Tin Khách Hàng'}
              </button>
            </form>
          </div>
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
