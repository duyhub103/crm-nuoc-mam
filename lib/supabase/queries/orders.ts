import { createClient } from '@/lib/supabase/client'
import type { OrderStatus, PaymentStatus } from '@/types/database.types'

export async function getOrders(filters?: {
  search?: string
  status?: OrderStatus
  payment_status?: PaymentStatus
}) {
  const supabase = createClient() as any
  let query = supabase
    .from('orders')
    .select(`
      *,
      customers ( id, name, phone, type, region ),
      profiles:sales_id ( id, full_name ),
      order_items (
        id, quantity, unit_price, line_total,
        products ( id, name, sku, unit ),
        production_batches ( id, batch_code, facility )
      )
    `)
    .order('order_date', { ascending: false })

  if (filters?.search) {
    query = query.or(`order_code.ilike.%${filters.search}%`)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.payment_status) {
    query = query.eq('payment_status', filters.payment_status)
  }

  const { data, error } = await query
  if (error) console.error('Error fetching orders:', error)
  return (data as any[]) || []
}

export async function createOrder(payload: {
  tenant_id: string
  customer_id: string
  sales_id?: string
  delivery_date?: string
  discount_amount?: number
  notes?: string
  items: Array<{
    product_id: string
    batch_id?: string
    quantity: number
    unit_price: number
  }>
}) {
  const supabase = createClient() as any
  
  // Calculate total amount
  const subtotal = payload.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
  const discount = payload.discount_amount || 0
  const finalTotal = subtotal - discount

  // Generate order code
  const codeSuffix = Math.floor(1000 + Math.random() * 9000)
  const orderCode = `DH-${new Date().getFullYear()}-${codeSuffix}`

  // Insert Order
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      tenant_id: payload.tenant_id,
      order_code: orderCode,
      customer_id: payload.customer_id,
      sales_id: payload.sales_id,
      status: 'confirmed',
      order_date: new Date().toISOString().split('T')[0],
      delivery_date: payload.delivery_date,
      total_amount: finalTotal,
      discount_amount: discount,
      payment_status: 'unpaid',
      notes: payload.notes
    })
    .select()
    .single()

  if (orderErr || !order) throw orderErr

  // Insert Order Items
  const orderItemsData = payload.items.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    batch_id: item.batch_id || null,
    quantity: item.quantity,
    unit_price: item.unit_price,
    line_total: item.quantity * item.unit_price
  }))

  const { error: itemsErr } = await supabase.from('order_items').insert(orderItemsData)
  if (itemsErr) console.error('Error inserting order items:', itemsErr)

  // Automatically record a Debt entry for this confirmed order
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 30) // Default 30 days credit

  await supabase.from('debts').insert({
    tenant_id: payload.tenant_id,
    customer_id: payload.customer_id,
    order_id: order.id,
    amount: finalTotal,
    due_date: dueDate.toISOString().split('T')[0],
    status: 'open'
  })

  return order
}
