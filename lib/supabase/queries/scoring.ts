import { createClient } from '@/lib/supabase/client'

export async function getCustomerScore(customerId: string) {
  const supabase = createClient() as any
  const { data, error } = await supabase
    .from('customer_scores')
    .select('*')
    .eq('customer_id', customerId)
    .order('computed_at', { ascending: false })

  if (error) {
    console.error('Error fetching customer score:', error)
    return null
  }
  return data && data.length > 0 ? data[0] : null
}

export async function computeCustomerScore(customerId: string) {
  const supabase = createClient() as any

  // 1. Fetch customer details with orders, debts, payments, complaints
  const { data: customer } = await supabase
    .from('customers')
    .select(`
      *,
      orders (*),
      debts (*),
      complaints (*)
    `)
    .eq('id', customerId)
    .single()

  if (!customer) throw new Error('Không tìm thấy khách hàng')

  const orders = customer.orders || []
  const debts = customer.debts || []
  const complaints = customer.complaints || []

  // 2. Order Frequency Score (0-100)
  const orderCount = orders.length
  const orderFreqScore = Math.min(100, Math.round((orderCount / 6) * 100))

  // 3. Revenue Growth Score (0-100)
  const totalRevenue = orders.reduce((sum: number, o: any) => sum + (Number(o.total_amount) || 0), 0)
  const revGrowthScore = Math.min(100, Math.max(30, Math.round((totalRevenue / 100000000) * 100)))

  // 4. Payment Reliability Score (0-100)
  const totalDebts = debts.length
  const paidOrInTimeDebts = debts.filter((d: any) => d.status === 'paid' || d.status === 'open').length
  const paymentScore = totalDebts > 0 ? Math.round((paidOrInTimeDebts / totalDebts) * 100) : 90

  // 5. Visit Engagement Score (0-100)
  const visitScore = 80 // Default baseline visit rating

  // 6. Complaint Score (0-100, lower complaints = higher score)
  const complaintCount = complaints.length
  const complaintScore = Math.max(20, 100 - (complaintCount * 25))

  // 7. Overall Weighted Score (25% freq, 25% revenue, 30% payment, 10% visit, 10% complaint)
  const overallScore = Number((
    (orderFreqScore * 0.25) +
    (revGrowthScore * 0.25) +
    (paymentScore * 0.30) +
    (visitScore * 0.10) +
    (complaintScore * 0.10)
  ).toFixed(1))

  // 8. Determine segment
  let segment: 'vip' | 'on_dinh' | 'can_cham_soc' | 'rui_ro_roi_bo' = 'on_dinh'
  if (overallScore >= 80) segment = 'vip'
  else if (overallScore >= 60) segment = 'on_dinh'
  else if (overallScore >= 40) segment = 'can_cham_soc'
  else segment = 'rui_ro_roi_bo'

  // 9. Call AI Route Handler to generate AI Insight text
  let aiInsight = ''
  try {
    const aiRes = await fetch('/api/ai/scoring-insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: customer.name,
        customerType: customer.type,
        overallScore,
        segment,
        metrics: {
          orderFreqScore,
          revGrowthScore,
          paymentScore,
          visitScore,
          complaintScore
        }
      })
    })
    const aiData = await aiRes.json()
    aiInsight = aiData.insight || ''
  } catch (err) {
    console.warn('AI insight call failed, using rule-based insight:', err)
  }

  if (!aiInsight) {
    aiInsight = `Đại lý ${customer.name} đạt tổng điểm ${overallScore}/100 (Phân loại: ${segment.toUpperCase()}). ` +
      `Lịch sử mua hàng ${orderCount} đơn với tổng doanh số ${new Intl.NumberFormat('vi-VN').format(totalRevenue)} VND. Khuyến nghị duy trì chăm sóc định kỳ.`
  }

  // 10. Save score to database
  const todayStr = new Date().toISOString().split('T')[0]
  const { data: savedScore, error: insertErr } = await supabase
    .from('customer_scores')
    .insert({
      tenant_id: customer.tenant_id,
      customer_id: customer.id,
      period_start: '2025-01-01',
      period_end: todayStr,
      order_frequency_score: orderFreqScore,
      revenue_growth_score: revGrowthScore,
      payment_reliability_score: paymentScore,
      visit_engagement_score: visitScore,
      complaint_score: complaintScore,
      overall_score: overallScore,
      segment,
      ai_insight: aiInsight
    })
    .select()
    .single()

  if (insertErr) {
    console.error('Error inserting customer score:', insertErr)
  }

  return savedScore || {
    order_frequency_score: orderFreqScore,
    revenue_growth_score: revGrowthScore,
    payment_reliability_score: paymentScore,
    visit_engagement_score: visitScore,
    complaint_score: complaintScore,
    overall_score: overallScore,
    segment,
    ai_insight: aiInsight
  }
}
