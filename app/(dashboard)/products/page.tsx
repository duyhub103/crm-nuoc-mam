'use client'

import { useState, useEffect } from 'react'
import { getProducts, createProduct } from '@/lib/supabase/queries/products'
import { createClient } from '@/lib/supabase/client'
import {
  Package,
  Search,
  Plus,
  Filter,
  Droplet,
  X,
  Sparkles
} from 'lucide-react'

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedLine, setSelectedLine] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  // Form State
  const [formSku, setFormSku] = useState('')
  const [formName, setFormName] = useState('')
  const [formLine, setFormLine] = useState<any>('truyen_thong')
  const [formProtein, setFormProtein] = useState('40°N')
  const [formVolume, setFormVolume] = useState('500')
  const [formUnit, setFormUnit] = useState('chai')
  const [formBasePrice, setFormBasePrice] = useState('150000')

  const fetchProducts = async () => {
    setLoading(true)
    const data = await getProducts({
      search,
      product_line: selectedLine ? (selectedLine as any) : undefined,
    })
    setProducts(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [search, selectedLine])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const supabase = createClient() as any
      const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', 'hai-huong').single()
      if (!tenant) throw new Error('Không tìm thấy Tenant Hải Hương')

      await createProduct({
        tenant_id: tenant.id,
        sku: formSku,
        name: formName,
        product_line: formLine,
        protein_level: formProtein,
        volume_ml: Number(formVolume) || 500,
        unit: formUnit,
        base_price: Number(formBasePrice) || 0
      })

      setIsModalOpen(false)
      setFormSku('')
      setFormName('')
      fetchProducts()
    } catch (err: any) {
      alert('Lỗi tạo sản phẩm: ' + (err.message || 'Không thành công'))
    } finally {
      setCreating(false)
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
            <Package className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <span>Danh Mục Sản Phẩm Nước Mắm</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Quản lý các dòng sản phẩm nước mắm truyền thống & công nghiệp, độ đạm, dung tích và giá niêm yết.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo SKU Sản Phẩm Mới</span>
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
            placeholder="Tìm theo tên sản phẩm, mã SKU..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-200 placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedLine}
            onChange={(e) => setSelectedLine(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-300 text-xs focus:outline-none"
          >
            <option value="">-- Dòng Sản Phẩm --</option>
            <option value="truyen_thong">Nước Mắm Truyền Thống</option>
            <option value="cong_nghiep">Nước Mắm Công Nghiệp</option>
          </select>
        </div>
      </div>

      {/* Product Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 dark:text-slate-400 text-xs">Đang tải danh mục sản phẩm...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.length > 0 ? (
            products.map((p) => (
              <div
                key={p.id}
                className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-amber-500/60 dark:hover:border-amber-500/40 transition-all group shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      {p.sku}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.product_line === 'truyen_thong'
                          ? 'bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/15 text-blue-800 dark:text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {p.product_line === 'truyen_thong' ? 'Truyền Thống' : 'Công Nghiệp'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug">
                    {p.name}
                  </h3>

                  <div className="grid grid-cols-3 gap-2 mt-4 text-[11px] p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase font-semibold">Độ Đạm</span>
                      <span className="font-bold text-amber-700 dark:text-amber-400">{p.protein_level || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase font-semibold">Dung Tích</span>
                      <span className="font-semibold">{p.volume_ml ? `${p.volume_ml}ml` : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase font-semibold">Đơn Vị</span>
                      <span className="font-semibold capitalize">{p.unit}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-semibold">Giá Niêm Yết Standard</span>
                    <span className="text-base font-bold text-slate-900 dark:text-slate-100">{formatVND(p.base_price)}</span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-amber-500 group-hover:text-slate-950 flex items-center justify-center transition-colors">
                    <Droplet className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-slate-500 text-xs">
              Chưa có sản phẩm nào. Nạp seed data hoặc tạo sản phẩm mới.
            </div>
          )}
        </div>
      )}

      {/* Add Product Modal */}
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
              <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span>Tạo Sản Phẩm Mới</span>
            </h3>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Mã SKU (*)</label>
                  <input
                    type="text"
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    placeholder="VD: HH-40N-500"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Dòng Sản Phẩm</label>
                  <select
                    value={formLine}
                    onChange={(e) => setFormLine(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
                  >
                    <option value="truyen_thong">Nước Mắm Truyền Thống</option>
                    <option value="cong_nghiep">Nước Mắm Công Nghiệp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Tên Sản Phẩm (*)</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="VD: Nước Mắm Cốt Cá Cơm Hải Hương 40°N (500ml)"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Độ Đạm</label>
                  <input
                    type="text"
                    value={formProtein}
                    onChange={(e) => setFormProtein(e.target.value)}
                    placeholder="40°N"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Dung Tích (ml)</label>
                  <input
                    type="number"
                    value={formVolume}
                    onChange={(e) => setFormVolume(e.target.value)}
                    placeholder="500"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Đơn Vị Tính</label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="chai"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Giá Bán Niêm Yết (VND)</label>
                <input
                  type="number"
                  required
                  value={formBasePrice}
                  onChange={(e) => setFormBasePrice(e.target.value)}
                  placeholder="150000"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all cursor-pointer"
              >
                {creating ? 'Đang Tạo...' : 'Lưu Sản Phẩm'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
