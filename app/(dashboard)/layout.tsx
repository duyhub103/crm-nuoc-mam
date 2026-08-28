'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { getCurrentProfile } from '@/lib/supabase/queries/auth'
import { createClient } from '@/lib/supabase/client'
import ThemeToggle from '@/components/ThemeToggle'
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  CreditCard,
  QrCode,
  Tag,
  LogOut,
  Menu,
  X,
  Droplet,
  Kanban,
  BarChart3,
  UserCog
} from 'lucide-react'

const allNavItems = [
  { name: 'Tổng Quan (Dashboard)', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'sales', 'ke_toan', 'super_admin'] },
  { name: 'Kanban Quy Trình', href: '/pipeline', icon: Kanban, roles: ['admin', 'sales', 'super_admin'] },
  { name: 'Báo Cáo & Thống Kê', href: '/reports', icon: BarChart3, roles: ['admin', 'ke_toan', 'super_admin'] },
  { name: 'Khách Hàng & Đại Lý', href: '/customers', icon: Users, roles: ['admin', 'sales', 'ke_toan', 'super_admin'] },
  { name: 'Quản Lý Nhân Viên', href: '/users', icon: UserCog, roles: ['admin', 'super_admin'] }, // ADMIN ONLY
  { name: 'Danh Mục Sản Phẩm', href: '/products', icon: Package, roles: ['admin', 'sales', 'ke_toan', 'super_admin'] },
  { name: 'Bảng Giá & Chiết Khấu', href: '/price-lists', icon: Tag, roles: ['admin', 'ke_toan', 'super_admin'] },
  { name: 'Đơn Hàng Phân Phối', href: '/orders', icon: ShoppingCart, roles: ['admin', 'sales', 'ke_toan', 'super_admin'] },
  { name: 'Quản Lý Công Nợ', href: '/debts', icon: CreditCard, roles: ['admin', 'ke_toan', 'super_admin'] },
  { name: 'Truy Xuất Nguồn Gốc', href: '/traceability', icon: QrCode, roles: ['admin', 'sales', 'ke_toan', 'super_admin'] },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    async function fetchProfile() {
      const p = await getCurrentProfile()
      setProfile(p)
    }
    fetchProfile()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient() as any
    await supabase.auth.signOut()
    router.push('/login')
  }

  const currentRole = profile?.role || 'admin'
  const filteredNavItems = allNavItems.filter(item => item.roles.includes(currentRole))

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return '👑 Admin'
      case 'sales': return '💼 Sales'
      case 'ke_toan': return '💵 Kế Toán'
      case 'super_admin': return '🌐 Super Admin'
      default: return role
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row antialiased selection:bg-amber-500 selection:text-slate-950 transition-colors duration-200">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 flex items-center justify-center shadow-md shadow-amber-500/20">
            <Droplet className="w-5 h-5 text-white dark:text-slate-950 fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm tracking-wide text-slate-900 dark:text-slate-100 uppercase">Hải Hương</span>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 tracking-wider">CRM NƯỚC MẮM</span>
          </div>
        </div>

        {/* Navigation Items Filtered by Role */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-500/30 dark:border-amber-500/20 shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Theme Toggle & Tenant Profile Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Giao diện</span>
            <ThemeToggle />
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-800 dark:text-amber-400 font-bold flex items-center justify-center text-xs uppercase">
              {profile?.full_name?.substring(0, 2) || 'HH'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-200 truncate">{profile?.full_name || 'Loading...'}</p>
              <p className="text-[10px] text-amber-700 dark:text-amber-400/90 font-extrabold truncate uppercase">
                {getRoleLabel(currentRole)}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Đăng xuất"
              className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Navigation */}
      <div className="md:hidden h-14 px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
            <Droplet className="w-4 h-4 text-white dark:text-slate-950 fill-current" />
          </div>
          <span className="font-bold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400">Hải Hương CRM</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-14 z-50 bg-white dark:bg-slate-950 p-4 flex flex-col justify-between">
          <nav className="space-y-2">
            {filteredNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${
                    isActive ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full py-3 bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng Xuất Tài Khoản</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
