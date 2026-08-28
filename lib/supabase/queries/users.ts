import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/types/database.types'

export async function getEmployees() {
  const supabase = createClient() as any
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select(`
      *,
      customers:customers!assigned_sales_id ( id, name, type, region )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching employees:', error)
    return []
  }

  return (profiles || []).map((p: any) => ({
    ...p,
    assignedCustomerCount: p.customers?.length || 0
  }))
}

export async function getEmployeeById(id: string) {
  const supabase = createClient() as any
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      customers:customers!assigned_sales_id ( id, name, type, region, debt_limit )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching employee detail:', error)
    return null
  }

  return data
}

export async function updateEmployeeRole(profileId: string, role: UserRole) {
  const supabase = createClient() as any
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', profileId)

  if (error) throw error
  return true
}

export async function updateEmployeeInfo(profileId: string, payload: {
  full_name?: string
  phone?: string
  role?: UserRole
}) {
  const supabase = createClient() as any
  const { error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', profileId)

  if (error) throw error
  return true
}

export async function assignCustomerSales(customerId: string, salesId: string | null) {
  const supabase = createClient() as any
  const { error } = await supabase
    .from('customers')
    .update({ assigned_sales_id: salesId })
    .eq('id', customerId)

  if (error) throw error
  return true
}
