import { createClient } from '@/lib/supabase/client'

export async function getProductionBatches(search?: string) {
  const supabase = createClient() as any
  let query = supabase
    .from('production_batches')
    .select(`
      *,
      products ( id, name, sku, protein_level, volume_ml, base_price ),
      order_items (
        id, quantity, unit_price,
        orders ( id, order_code, order_date, customers ( id, name ) )
      )
    `)
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`batch_code.ilike.%${search}%,facility_location.ilike.%${search}%`)
  }

  const { data, error } = await query
  if (error) console.error('Error fetching production batches:', error)
  return (data as any[]) || []
}

export async function getBatchByCode(batchCode: string) {
  const supabase = createClient() as any
  const { data, error } = await supabase
    .from('production_batches')
    .select(`
      *,
      products ( id, name, sku, protein_level, volume_ml, unit ),
      order_items (
        id, quantity, unit_price,
        orders ( id, order_code, order_date, status, customers ( id, name, type, region ) )
      )
    `)
    .eq('batch_code', batchCode)
    .single()

  if (error) console.error('Error fetching batch detail:', error)
  return data
}

export async function getBatchTraceability(id: string) {
  const supabase = createClient() as any
  const { data, error } = await supabase
    .from('production_batches')
    .select(`
      *,
      products ( id, name, sku, protein_level, volume_ml, unit ),
      order_items (
        id, quantity, unit_price,
        products ( id, name, unit ),
        orders ( id, order_code, order_date, status, customers ( id, name, type, region ) )
      )
    `)
    .eq('id', id)
    .single()

  if (error) console.error('Error fetching batch traceability:', error)
  return data
}
