'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ThemeToggle from '@/components/ThemeToggle'
import {
  Droplet,
  Lock,
  Mail,
  ArrowRight,
  Database,
  CheckCircle2,
  Sparkles
} from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [seedSuccess, setSeedSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')

    try {
      const supabase = createClient() as any
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setErrorMessage('Tài khoản hoặc mật khẩu không chính xác')
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setErrorMessage('Đã xảy ra lỗi hệ thống: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSeedMockData = async () => {
    setSeeding(true)
    setErrorMessage('')
    try {
      const res = await fetch('/api/seed', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setSeedSuccess(true)
        setTimeout(() => {
          router.push('/dashboard')
        }, 1200)
      } else {
        setErrorMessage(data.error || 'Seed thất bại')
      }
    } catch (err: any) {
      setErrorMessage('Lỗi gọi API Seed: ' + err.message)
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-200">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-600/10 dark:bg-amber-700/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Theme Switcher */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo Card Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 items-center justify-center shadow-xl shadow-amber-500/20 mb-3">
            <Droplet className="w-9 h-9 text-white dark:text-slate-950 fill-current" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Nước Mắm Hải Hương
          </h1>
          <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mt-1 uppercase tracking-widest">
            Hệ Thống CRM Phân Phối Multi-Tenant
          </p>
        </div>

        {/* Login Glass Panel */}
        <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold text-center">
              {errorMessage}
            </div>
          )}

          {seedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Nạp mock data thành công! Đang chuyển hướng...</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Email Quản Lý / Sales</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@haihuong.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Mật Khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>{loading ? 'Đang Đăng Nhập...' : 'Đăng Nhập CRM'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Seed Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-[10px] uppercase font-bold text-slate-400 shrink-0">
              Hoặc Dành Cho Trải Nghiệm Demo
            </span>
          </div>

          <button
            onClick={handleSeedMockData}
            disabled={seeding}
            type="button"
            className="w-full py-3 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-amber-400 border border-slate-300 dark:border-amber-500/30 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Database className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>{seeding ? 'Đang Nạp Mock Data Hải Hương...' : 'Nạp Mock Data Demo Hải Hương'}</span>
          </button>
        </div>

        <p className="text-center text-[11px] text-slate-500 dark:text-slate-400 mt-6 flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Hải Hương CRM Multi-Tenant © 2025</span>
        </p>
      </div>
    </div>
  )
}
