import { createClient } from '@/lib/supabase/client'

export async function getPipelineStages() {
  const supabase = createClient() as any
  const { data, error } = await supabase
    .from('pipeline_stages')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching pipeline stages:', error)
    return []
  }
  return data || []
}

export async function getPipelineCustomers() {
  const supabase = createClient() as any
  const { data, error } = await supabase
    .from('customers')
    .select(`
      *,
      pipeline_stages (*),
      profiles ( full_name ),
      orders ( id, total_amount, order_date ),
      customer_scores ( overall_score, segment )
    `)
    .eq('status', 'active')

  if (error) {
    console.error('Error fetching pipeline customers:', error)
    return []
  }

  // Map latest order & score
  return (data || []).map((c: any) => {
    const latestOrder = c.orders && c.orders.length > 0
      ? [...c.orders].sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())[0]
      : null

    const latestScore = c.customer_scores && c.customer_scores.length > 0
      ? c.customer_scores[c.customer_scores.length - 1]
      : null

    return {
      ...c,
      latestOrder,
      score: latestScore
    }
  })
}

export async function updateCustomerStage(customerId: string, fromStageId: string | null, toStageId: string, note?: string) {
  const supabase = createClient() as any

  // 1. Get current tenant
  const { data: customer } = await supabase
    .from('customers')
    .select('tenant_id')
    .eq('id', customerId)
    .single()

  if (!customer) throw new Error('Không tìm thấy thông tin khách hàng')

  // 2. Update customer's stage
  const { error: updateErr } = await supabase
    .from('customers')
    .update({ current_stage_id: toStageId })
    .eq('id', customerId)

  if (updateErr) throw updateErr

  // 3. Insert history record
  const { error: historyErr } = await supabase
    .from('pipeline_stage_history')
    .insert({
      tenant_id: customer.tenant_id,
      customer_id: customerId,
      from_stage_id: fromStageId || null,
      to_stage_id: toStageId,
      note: note || 'Chuyển giai đoạn chăm sóc trên Kanban Board'
    })

  if (historyErr) {
    console.warn('Could not insert stage history:', historyErr)
  }

  return true
}
