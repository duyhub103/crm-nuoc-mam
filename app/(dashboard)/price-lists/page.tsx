'use client'

import { useState, useEffect } from 'react'
import { getPriceLists } from '@/lib/supabase/queries/products'
import { Tag, ShieldCheck, Info } from 'lucide-react'

export default function PriceListsPage() {
  const [priceLists, setPriceLists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const data = await getPriceLists()
      setPriceLists(data)
      setLoading(false)
    }
    loadData()
  }, [])

  const formatVND = (amt: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amt || 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Tag className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          <span>Quản Lý Bảng Giá & Chiết Khấu</span>
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          Bảng giá riêng biệt áp dụng tự động cho Đại lý Cấp 1, Đại lý Cấp 2, Siêu thị và Khách bán lẻ.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-500 dark:text-slate-400 text-xs">Đang tải cấu hình bảng giá...</div>
      ) : (
        <div className="space-y-6">
          {priceLists.length > 0 ? (
            priceLists.map((pl) => (
              <div key={pl.id} className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>{pl.name}</span>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{pl.description || 'Không có mô tả'}</p>
                  </div>
                  <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
                    ID: {pl.id.substring(0, 8)}
                  </span>
                </div>

                {pl.price_list_items && pl.price_list_items.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/80 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 uppercase font-semibold">
                        <tr>
                          <th className="p-3">Mã SKU</th>
                          <th className="p-3">Tên Sản Phẩm</th>
                          <th className="p-3">Giá Niêm Yết Standard</th>
                          <th className="p-3">Giá Trong Bảng Giá Này</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800/40">
                        {pl.price_list_items.map((item: any) => (
                          <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
                            <td className="p-3 font-mono font-bold text-amber-700 dark:text-amber-400">{item.products?.sku}</td>
                            <td className="p-3 font-semibold text-slate-900 dark:text-slate-200">{item.products?.name}</td>
                            <td className="p-3 text-slate-500 dark:text-slate-400 font-medium">{formatVND(item.products?.base_price)}</td>
                            <td className="p-3 font-bold text-emerald-700 dark:text-emerald-400">{formatVND(item.price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Info className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Bảng giá này áp dụng mức chiết khấu tỉ lệ % trực tiếp trên đơn hàng.</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="py-16 text-center text-slate-500 text-xs">
              Chưa có bảng giá nào. Nhấp nút "Nạp Mock Data Demo" ở trang Login để tự động tạo.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
