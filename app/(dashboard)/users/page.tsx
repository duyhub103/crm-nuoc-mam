'use client'

import { useState, useEffect } from 'react'
import { getCurrentProfile } from '@/lib/supabase/queries/auth'
import { getEmployees, updateEmployeeRole, updateEmployeeInfo } from '@/lib/supabase/queries/users'
import ConfirmModal from '@/components/ConfirmModal'
import { UserCheck, Shield, Phone, Building2, UserCog, Edit3, X, Save, Eye, ShieldAlert } from 'lucide-react'
import type { UserRole } from '@/types/database.types'
import Link from 'next/link'

export default function UsersPage() {
  const [currentProfile, setCurrentProfile] = useState<any>(null)
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEmp, setSelectedEmp] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Edit Form State
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editRole, setEditRole] = useState<UserRole>('sales')

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
    const [p, data] = await Promise.all([
      getCurrentProfile(),
      getEmployees()
    ])
    setCurrentProfile(p)
    setEmployees(data)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const openDetailModal = (emp: any) => {
    setSelectedEmp(emp)
    setEditName(emp.full_name || '')
    setEditPhone(emp.phone || '')
    setEditRole(emp.role || 'sales')
    setIsDetailOpen(true)
  }

  const promptRoleChange = (profileId: string, empName: string, newRole: UserRole) => {
    setConfirmState({
      isOpen: true,
      title: 'Xác Nhận Thay Đổi Phân Quyền Nhân Viên',
      message: `Bạn có chắc chắn muốn thay đổi vai trò của nhân viên "${empName}" thành [${newRole.toUpperCase()}] không?`,
      action: async () => {
        try {
          await updateEmployeeRole(profileId, newRole)
          setEmployees(prev => prev.map(e => e.id === profileId ? { ...e, role: newRole } : e))
          setConfirmState(prev => ({ ...prev, isOpen: false }))
        } catch (err: any) {
          alert('Lỗi cập nhật quyền: ' + (err.message || 'Không thành công'))
        }
      }
    })
  }

  const promptSaveDetail = (e: React.FormEvent) => {
    e.preventDefault()
    setConfirmState({
      isOpen: true,
      title: 'Xác Nhận Cập Nhật Thông Tin Nhân Viên',
      message: `Bạn có chắc chắn muốn lưu các thay đổi thông tin của nhân viên "${editName}" không?`,
      action: async () => {
        setSaving(true)
        try {
          await updateEmployeeInfo(selectedEmp.id, {
            full_name: editName,
            phone: editPhone,
            role: editRole
          })
          setIsDetailOpen(false)
          setConfirmState(prev => ({ ...prev, isOpen: false }))
          loadData()
        } catch (err: any) {
          alert('Lỗi cập nhật thông tin: ' + (err.message || 'Không thành công'))
        } finally {
          setSaving(false)
        }
      }
    })
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30 uppercase">👑 Admin</span>
      case 'sales':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/15 text-blue-800 dark:text-blue-400 border border-blue-500/30 uppercase">💼 Sales</span>
      case 'ke_toan':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border border-emerald-500/30 uppercase">💵 Kế Toán</span>
      case 'super_admin':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/15 text-purple-800 dark:text-purple-400 border border-purple-500/30 uppercase">🌐 Super Admin</span>
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-500/15 text-slate-700 dark:text-slate-400 border border-slate-500/30 uppercase">Staff</span>
    }
  }

  // RBAC GUARD: Only Admin or Super Admin can access Quản Lý Nhân Viên
  if (!loading && currentProfile && currentProfile.role !== 'admin' && currentProfile.role !== 'super_admin') {
    return (
      <div className="py-16 max-w-md mx-auto text-center space-y-4">
        <div className="p-6 glass-card rounded-2xl border border-red-500/30 bg-red-500/5 space-y-3">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">TRUY CẬP BỊ TỪ CHỐI (RBAC)</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Tài khoản của bạn có vai trò <strong className="uppercase font-bold text-amber-600 dark:text-amber-400">[{currentProfile.role}]</strong>. Chức năng quản lý nhân sự & phân quyền chỉ dành riêng cho <strong className="font-bold">Quản Trị Viên Admin</strong>.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-block px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all"
            >
              Quay Về Trang Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const salesCount = employees.filter(e => e.role === 'sales').length
  const keToanCount = employees.filter(e => e.role === 'ke_toan').length
  const adminCount = employees.filter(e => e.role === 'admin').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <UserCog className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <span>Quản Lý Nhân Viên & Phân Quyền RBAC</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Quản lý đội ngũ nhân viên, vai trò truy cập (Admin, Sales, Kế toán) và xem danh sách đại lý phụ trách.
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Tổng Nhân Sự</span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-2">{employees.length} Người</h3>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Nhân Viên Sales</span>
          <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-2">{salesCount} Người</h3>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Kế Toán Tài Chính</span>
          <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{keToanCount} Người</h3>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">Quản Trị Viên Admin</span>
          <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-2">{adminCount} Người</h3>
        </div>
      </div>

      {/* Employee List Table */}
      <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>Danh Sách Nhân Viên & Phụ Trách Thị Trường</span>
          </h3>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400 text-xs">Đang tải danh sách nhân viên...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Họ Và Tên Nhân Viên</th>
                  <th className="p-4">Vai Trò Hiện Tại</th>
                  <th className="p-4">Số Điện Thoại</th>
                  <th className="p-4">Đại Lý Phụ Trách</th>
                  <th className="p-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {employees.length > 0 ? (
                  employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-bold text-amber-700 dark:text-amber-400 uppercase text-xs">
                            {emp.full_name?.substring(0, 2) || 'NV'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-slate-100 block">{emp.full_name || 'Nhân viên Hải Hương'}</span>
                            <span className="text-[10px] text-slate-500 font-mono">ID: {emp.id.substring(0, 8)}...</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{getRoleBadge(emp.role)}</td>
                      <td className="p-4 font-mono text-slate-700 dark:text-slate-300">
                        {emp.phone || 'Chưa cập nhật'}
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-200">
                          {emp.assignedCustomerCount} Đại Lý
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <select
                          value={emp.role}
                          onChange={(e) => promptRoleChange(emp.id, emp.full_name || 'Nhân viên', e.target.value as UserRole)}
                          className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/40 cursor-pointer inline-block"
                        >
                          <option value="admin">👑 Admin</option>
                          <option value="sales">💼 Sales</option>
                          <option value="ke_toan">💵 Kế Toán</option>
                          <option value="super_admin">🌐 Super Admin</option>
                        </select>

                        <button
                          onClick={() => openDetailModal(emp)}
                          className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Chi Tiết</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      Chưa có dữ liệu nhân viên.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Employee Detail / Edit Modal */}
      {isDetailOpen && selectedEmp && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 relative shadow-2xl space-y-4">
            <button
              onClick={() => setIsDetailOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold flex items-center gap-2">
              <UserCog className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span>Chi Tiết & Cập Nhật Hồ Sơ Nhân Viên</span>
            </h3>

            <form onSubmit={promptSaveDetail} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Họ Và Tên (*)</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Số Điện Thoại</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="0912..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Vai Trò (Role)</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-bold"
                  >
                    <option value="admin">👑 Admin (Quản trị)</option>
                    <option value="sales">💼 Sales (Kinh doanh)</option>
                    <option value="ke_toan">💵 Kế Toán (Thu nợ)</option>
                    <option value="super_admin">🌐 Super Admin</option>
                  </select>
                </div>
              </div>

              {/* List of Assigned Customers */}
              <div className="pt-2">
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2">
                  Danh Sách Đại Lý Đang Phụ Trách ({selectedEmp.customers?.length || 0})
                </label>
                <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  {selectedEmp.customers && selectedEmp.customers.length > 0 ? (
                    selectedEmp.customers.map((c: any) => (
                      <div key={c.id} className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{c.name}</span>
                        <span className="text-slate-500 font-medium">{c.region} • {c.type}</span>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center text-slate-400 text-[11px]">
                      Nhân viên này chưa được gán phụ trách đại lý nào.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDetailOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Đang Lưu...' : 'Lưu Thay Đổi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Confirmation Modal */}
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
