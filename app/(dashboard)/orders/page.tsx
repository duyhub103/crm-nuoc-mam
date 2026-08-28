'use client'

import { useState, useEffect } from 'react'
import { getOrders, createOrder } from '@/lib/supabase/queries/orders'
import { getCustomers } from '@/lib/supabase/queries/customers'
import { getProducts } from '@/lib/supabase/queries/products'
import { getProductionBatches } from '@/lib/supabase/queries/batches'
import { createClient } from '@/lib/supabase/client'
import {
  ShoppingCart,
  Search,
  Plus,
  Filter,
  X,
  Trash2
} from 'lucide-react'

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('')
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [customers, setCustomers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [batches, setBatches] = useState<any[]>([])

  // Form State
  const [customerId, setCustomerId] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [discountAmount, setDiscountAmount] = useState('0')
  const [notes, setNotes] = useState('')
  const [orderItems, setOrderItems] = useState<Array<{
    product_id: string
    batch_id: string
    quantity: number
    unit_price: number
  }>>([])

  const fetchOrders = async () => {
    setLoading(true)
    const data = await getOrders({
      search,
      status: selectedStatus ? (selectedStatus as any) : undefined,
      payment_status: selectedPaymentStatus ? (selectedPaymentStatus as any) : undefined,
    })
    setOrders(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [search, selectedStatus, selectedPaymentStatus])

  const openCreateModal = async () => {
    setIsModalOpen(true)
    const [cList, pList, bList] = await Promise.all([
      getCustomers(),
      getProducts(),
      getProductionBatches()
    ])
    setCustomers(cList)
    setProducts(pList)
    setBatches(bList)

    if (pList.length > 0) {
      setOrderItems([{
        product_id: pList[0].id,
        batch_id: bList[0]?.id || '',
        quantity: 50,
        unit_price: pList[0].base_price
      }])
    }
  }

  const handleAddItem = () => {
    if (products.length === 0) return
    setOrderItems([
      ...orderItems,
      {
        product_id: products[0].id,
        batch_id: batches[0]?.id || '',
        quantity: 20,
        unit_price: products[0].base_price
      }
    ])
  }

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, idx) => idx !== index))
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...orderItems]
    if (field === 'product_id') {
      const prod = products.find(p => p.id === value)
      updated[index].product_id = value
      if (prod) updated[index].unit_price = prod.base_price
    } else if (field === 'quantity') {
      updated[index].quantity = Number(value) || 1
    } else if (field === 'unit_price') {
      updated[index].unit_price = Number(value) || 0
    } else if (field === 'batch_id') {
      updated[index].batch_id = value
    }
    setOrderItems(updated)
  }

  const subtotal = orderItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
  const finalTotal = subtotal - (Number(discountAmount) || 0)

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerId) {
      alert('Vui lòng chọn khách hàng')
      return
    }
    if (orderItems.length === 0) {
      alert('Vui lòng thêm ít nhất 1 sản phẩm')
      return
    }

    setCreating(true)
    try {
      const supabase = createClient() as any
      const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', 'hai-huong').single()
      if (!tenant) throw new Error('Không tìm thấy Tenant Hải Hương')

      await createOrder({
        tenant_id: tenant.id,
        customer_id: customerId,
        delivery_date: deliveryDate || undefined,
        discount_amount: Number(discountAmount) || 0,
        notes: notes || undefined,
        items: orderItems
      })

      setIsModalOpen(false)
      fetchOrders()
    } catch (err: any) {
      alert('Lỗi tạo đơn hàng: ' + (err.message || 'Không thành công'))
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
            <ShoppingCart className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <span>Quản Lý Đơn Hàng Phân Phối</span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Theo dõi đơn đặt hàng nước mắm, gắn lô sản xuất và tự động tạo công nợ đại lý.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Đơn Hàng Mới</span>
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
            placeholder="Tìm theo mã đơn hàng (VD: DH-2025-0001)..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-200 placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-300 text-xs focus:outline-none"
          >
            <option value="">-- Trạng Thái Đơn --</option>
            <option value="draft">Nháp (Draft)</option>
            <option value="confirmed">Đã Xử Lý (Confirmed)</option>
            <option value="delivering">Đang Giao (Delivering)</option>
            <option value="completed">Hoàn Thành (Completed)</option>
            <option value="cancelled">Đã Hủy (Cancelled)</option>
          </select>

          <select
            value={selectedPaymentStatus}
            onChange={(e) => setSelectedPaymentStatus(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-300 text-xs focus:outline-none"
          >
            <option value="">-- Thanh Toán --</option>
            <option value="unpaid">Chưa Thanh Toán</option>
            <option value="partial">Thanh Toán 1 Phần</option>
            <option value="paid">Đã Thanh Toán</option>
          </select>
        </div>
      </div>

      {/* Orders List Table */}
      <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400 text-xs">Đang tải danh sách đơn hàng...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Mã Đơn</th>
                  <th className="p-4">Khách Hàng / Đại Lý</th>
                  <th className="p-4">Sản Phẩm & Lô</th>
                  <th className="p-4">Ngày Đặt</th>
                  <th className="p-4">Tổng Tiền</th>
                  <th className="p-4">Trạng Thái Đơn</th>
                  <th className="p-4">Thanh Toán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {orders.length > 0 ? (
                  orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-amber-700 dark:text-amber-400">{o.order_code}</td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{o.customers?.name || 'Khách Hàng'}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{o.customers?.phone} • {o.customers?.region}</div>
                      </td>
                      <td className="p-4 max-w-xs">
                        {o.order_items && o.order_items.length > 0 ? (
                          <div className="space-y-1">
                            {o.order_items.map((item: any) => (
                              <div key={item.id} className="text-[11px] text-slate-800 dark:text-slate-300 flex items-center justify-between gap-2">
                                <span className="truncate font-medium">{item.products?.name} x{item.quantity}</span>
                                {item.production_batches && (
                                  <span className="font-mono text-[9px] text-amber-700 dark:text-amber-400/80 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0 font-bold">
                                    {item.production_batches.batch_code}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-500">Chưa có dòng sản phẩm</span>
                        )}
                      </td>
                      <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">{o.order_date}</td>
                      <td className="p-4 font-bold text-slate-900 dark:text-slate-100">{formatVND(o.total_amount)}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            o.status === 'completed'
                              ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border-emerald-500/30'
                              : o.status === 'delivering'
                              ? 'bg-blue-500/15 text-blue-800 dark:text-blue-400 border-blue-500/30'
                              : o.status === 'confirmed'
                              ? 'bg-amber-500/15 text-amber-800 dark:text-amber-400 border-amber-500/30'
                              : 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/30'
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            o.payment_status === 'paid'
                              ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border-emerald-500/30'
                              : o.payment_status === 'partial'
                              ? 'bg-amber-500/15 text-amber-800 dark:text-amber-400 border-amber-500/30'
                              : 'bg-red-500/15 text-red-800 dark:text-red-400 border-red-500/30'
                          }`}
                        >
                          {o.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      Không tìm thấy đơn hàng phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Order Modal Drawer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl glass-panel p-6 rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 relative my-8 shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span>Tạo Đơn Hàng Mới & Phân Lô Nước Mắm</span>
            </h3>

            <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Khách Hàng / Đại Lý (*)</label>
                <select
                  required
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
                >
                  <option value="">-- Chọn Khách Hàng --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type} - {c.region}) - Hạn mức nợ: {formatVND(c.debt_limit)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Order Items list */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-slate-700 dark:text-slate-300 font-semibold">Danh Sách Sản Phẩm Trong Đơn</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Dòng Sản Phẩm</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {orderItems.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-4">
                        <select
                          value={item.product_id}
                          onChange={(e) => handleItemChange(idx, 'product_id', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-[11px] text-slate-900 dark:text-slate-100"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.sku} - {p.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-3">
                        <select
                          value={item.batch_id}
                          onChange={(e) => handleItemChange(idx, 'batch_id', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-[11px] text-amber-700 dark:text-amber-400 font-mono font-bold"
                        >
                          <option value="">-- Lô SX --</option>
                          {batches.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.batch_code} ({b.fermentation_days} ngày)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          placeholder="SL"
                          className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-[11px] text-slate-900 dark:text-slate-100 text-center font-bold"
                        />
                      </div>

                      <div className="col-span-2 text-right font-bold text-slate-900 dark:text-slate-200">
                        {formatVND(item.quantity * item.unit_price)}
                      </div>

                      <div className="col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Chiết Khấu Đơn Hàng (VND)</label>
                  <input
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Ngày Giao Dự Kiến</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Ghi Chú Đơn Hàng</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Giao chằng buộc pallet cẩn thận..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <span className="text-slate-900 dark:text-slate-200 font-bold">TỔNG GIÁ TRỊ ĐƠN HÀNG:</span>
                <span className="text-lg font-bold text-amber-700 dark:text-amber-400">{formatVND(finalTotal)}</span>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all cursor-pointer"
              >
                {creating ? 'Đang Khởi Tạo Đơn & Công Nợ...' : 'Xác Nhận Đặt Đơn Hàng'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
