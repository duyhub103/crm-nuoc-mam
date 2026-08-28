import { createClient } from '@/lib/supabase/client'
import type { CustomerType, CustomerStatus } from '@/types/database.types'

export async function getCustomers(filters?: {
  search?: string
  type?: CustomerType
  region?: string
  status?: CustomerStatus
}) {
  const supabase = createClient() as any
  let query = supabase
    .from('customers')
    .select(`
      *,
      price_lists ( id, name ),
      profiles:assigned_sales_id ( id, full_name ),
      customer_scores ( overall_score, segment )
    `)
    .order('created_at', { ascending: false })

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
  }
  if (filters?.type) {
    query = query.eq('type', filters.type)
  }
  if (filters?.region) {
    query = query.eq('region', filters.region)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query
  if (error) console.error('Error fetching customers:', error)

  return (data as any[] || []).map((c: any) => {
    const score = c.customer_scores && c.customer_scores.length > 0
      ? c.customer_scores[c.customer_scores.length - 1]
      : null
    return {
      ...c,
      score
    }
  })
}

export async function getCustomerById(id: string) {
  if (!id) return null
  const supabase = createClient() as any
  const { data, error } = await supabase
    .from('customers')
    .select(`
      *,
      price_lists ( id, name ),
      profiles:assigned_sales_id ( id, full_name, phone ),
      orders ( id, order_code, total_amount, status, payment_status, created_at ),
      debts ( id, amount, due_date, status, created_at )
    `)
    .eq('id', id)

  if (error) {
    console.error('Error fetching customer detail:', error)
    return null
  }

  return data && data.length > 0 ? data[0] : null
}

export async function createCustomer(payload: {
  tenant_id: string
  name: string
  type?: CustomerType
  phone?: string
  email?: string
  address?: string
  region?: string
  debt_limit?: number
  price_list_id?: string
  assigned_sales_id?: string
}) {
  const supabase = createClient() as any
  const { data, error } = await supabase
    .from('customers')
    .insert({
      status: 'active',
      ...payload
    })
    .select()
    .single()

  if (error) throw error
  return data
}
