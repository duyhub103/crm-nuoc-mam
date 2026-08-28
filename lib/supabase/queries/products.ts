import { createClient } from '@/lib/supabase/client'
import type { ProductLine, ProductStatus } from '@/types/database.types'

export async function getProducts(filters?: {
  search?: string
  product_line?: ProductLine
  status?: ProductStatus
}) {
  const supabase = createClient() as any
  let query = supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`)
  }
  if (filters?.product_line) {
    query = query.eq('product_line', filters.product_line)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query
  if (error) console.error('Error fetching products:', error)
  return (data as any[]) || []
}

export async function getPriceLists() {
  const supabase = createClient() as any
  const { data, error } = await supabase
    .from('price_lists')
    .select(`
      *,
      price_list_items (
        id, price, product_id,
        products ( id, name, sku, base_price, unit )
      )
    `)
    .order('created_at', { ascending: false })

  if (error) console.error('Error fetching price lists:', error)
  return (data as any[]) || []
}

export async function createProduct(payload: {
  tenant_id: string
  sku: string
  name: string
  product_line?: ProductLine
  protein_level?: string
  volume_ml?: number
  unit?: string
  base_price: number
}) {
  const supabase = createClient() as any
  const { data, error } = await supabase
    .from('products')
    .insert({
      status: 'active',
      ...payload
    })
    .select()
    .single()

  if (error) throw error
  return data
}
