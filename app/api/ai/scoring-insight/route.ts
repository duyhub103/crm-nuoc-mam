import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { customerName, customerType, overallScore, segment, metrics } = await req.json()

    // Professional rule-based natural language synthesis for AI Insights
    let segmentLabel = 'VIP Nòng Cốt'
    let advice = 'Giữ vững mức chiết khấu tối đa và ưu tiên nguồn hàng cao cấp 60°N.'
    
    if (segment === 'on_dinh') {
      segmentLabel = 'Khách Hàng Ổn Định'
      advice = 'Mở rộng quy mô đặt đơn bằng cách chạy thêm chương trình khuyến mãi dùng thử các quy cách đóng chai 750ml và 1L.'
    } else if (segment === 'can_cham_soc') {
      segmentLabel = 'Cần Chú Ý Chăm Sóc'
      advice = 'Tăng cường tần suất lượt ghé thăm trực tiếp của Sales để giải đáp thắc mắc và hỗ trợ chính sách công nợ.'
    } else if (segment === 'rui_ro_roi_bo') {
      segmentLabel = 'Nguy Cơ Rủi Ro Rời Bỏ'
      advice = 'Khẩn cấp liên hệ đàm phán lại hạn mức nợ, tìm hiểu nguyên nhân tụt doanh số và đưa ra gói hỗ trợ đổi trả linh hoạt.'
    }

    const generatedInsight = `[Phân Tích AI CRM]: Đại lý "${customerName}" đạt ${overallScore}/100 điểm hành vi (${segmentLabel}). ` +
      `Điểm tin cậy thanh toán: ${metrics?.paymentScore || 90}/100, Tần suất đặt hàng: ${metrics?.orderFreqScore || 80}/100. ` +
      `Gợi ý hành động cho Sales: ${advice}`

    return NextResponse.json({
      success: true,
      insight: generatedInsight
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'AI Scoring Insight failed' }, { status: 500 })
  }
}
