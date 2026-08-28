'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (stored) {
      setTheme(stored)
      if (stored === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    } else {
      // Default to light mode for best readability as requested
      setTheme('light')
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    localStorage.setItem('theme', nextTheme)
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
    )
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="p-2 rounded-xl bg-slate-200/80 dark:bg-slate-800/80 text-slate-700 dark:text-amber-400 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all flex items-center gap-2 cursor-pointer border border-slate-300/60 dark:border-slate-700/60"
      title={theme === 'light' ? 'Chuyển sang Chế độ Tối (Dark Mode)' : 'Chuyển sang Chế độ Sáng (Light Mode)'}
    >
      {theme === 'light' ? (
        <>
          <Moon className="w-4 h-4 text-slate-700" />
          <span className="text-xs font-semibold text-slate-700 hidden sm:inline">Chế độ Tối</span>
        </>
      ) : (
        <>
          <Sun className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-amber-400 hidden sm:inline">Chế độ Sáng</span>
        </>
      )}
    </button>
  )
}
