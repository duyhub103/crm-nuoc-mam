import { createClient } from '@/lib/supabase/client'
import type { DebtStatus, PaymentMethod } from '@/types/database.types'

export async function getDebts(filters?: {
  status?: DebtStatus
  search?: string
}) {
  const supabase = createClient() as any
  let query = supabase
    .from('debts')
    .select(`
      *,
      customers ( id, name, phone, debt_limit, region, type ),
      orders ( id, order_code, total_amount, order_date ),
      payments ( id, amount, payment_date, method, notes )
    `)
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query
  if (error) console.error('Error fetching debts:', error)
  return (data as any[]) || []
}

export async function recordPayment(payload: {
  tenant_id: string
  debt_id: string
  customer_id: string
  amount: number
  method: PaymentMethod
  notes?: string
}) {
  const supabase = createClient() as any

  // 1. Insert Payment entry
  const { data: payment, error: payErr } = await supabase
    .from('payments')
    .insert({
      tenant_id: payload.tenant_id,
      debt_id: payload.debt_id,
      customer_id: payload.customer_id,
      amount: payload.amount,
      payment_date: new Date().toISOString().split('T')[0],
      method: payload.method,
      notes: payload.notes
    })
    .select()
    .single()

  if (payErr || !payment) throw payErr

  // 2. Fetch debt and existing payments to determine new status
  const { data: debt } = await supabase
    .from('debts')
    .select('*, payments(*)')
    .eq('id', payload.debt_id)
    .single()

  if (debt) {
    const totalPaid = (debt.payments || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
    
    let newStatus: DebtStatus = debt.status
    if (totalPaid >= debt.amount) {
      newStatus = 'paid'
    } else {
      const isPastDue = debt.due_date && new Date(debt.due_date) < new Date()
      newStatus = isPastDue ? 'overdue' : 'open'
    }

    await supabase
      .from('debts')
      .update({ status: newStatus })
      .eq('id', debt.id)

    // Also update associated Order payment_status
    if (debt.order_id) {
      const orderPayStatus = totalPaid >= debt.amount ? 'paid' : 'partial'
      await supabase
        .from('orders')
        .update({ payment_status: orderPayStatus })
        .eq('id', debt.order_id)
    }
  }

  return payment
}
