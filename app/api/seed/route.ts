import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = (await createClient()) as any

    // 1. Get current tenant
    const { data: tenant } = await supabase
      .from('tenants')
      .select('*')
      .eq('slug', 'hai-huong')
      .single()

    let tenantId = tenant?.id

    if (!tenantId) {
      const { data: newTenant, error: createTenantErr } = await supabase
        .from('tenants')
        .insert({
          name: 'Nước Mắm Hải Hương',
          slug: 'hai-huong',
          logo_url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=120&q=80',
          address: '128 Nguyễn Đình Chiểu, P. Hàm Tiến, TP. Phan Thiết, Bình Thuận',
          phone: '0912 345 678'
        })
        .select()
        .single()

      if (createTenantErr || !newTenant) {
        return NextResponse.json({ error: 'Failed to create default tenant: ' + createTenantErr?.message }, { status: 500 })
      }
      tenantId = newTenant.id
    }

    // 1b. Seed Pipeline Stages (Phase 2)
    const defaultStages = [
      { name: 'Mới tiếp cận', sort_order: 1, color: '#94a3b8' },
      { name: 'Đang tư vấn', sort_order: 2, color: '#3b82f6' },
      { name: 'Đã chào giá', sort_order: 3, color: '#eab308' },
      { name: 'Đang đàm phán', sort_order: 4, color: '#f97316' },
      { name: 'Khách chính thức', sort_order: 5, color: '#22c55e' },
      { name: 'Cần chăm sóc lại', sort_order: 6, color: '#ef4444' }
    ]

    const createdStages: any[] = []
    for (const stage of defaultStages) {
      const { data: existing } = await supabase
        .from('pipeline_stages')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('name', stage.name)
        .single()

      if (existing) {
        createdStages.push(existing)
      } else {
        const { data: st } = await supabase
          .from('pipeline_stages')
          .insert({ tenant_id: tenantId, ...stage })
          .select()
          .single()
        if (st) createdStages.push(st)
      }
    }

    // Sort stages by order
    createdStages.sort((a, b) => a.sort_order - b.sort_order)

    // 2. Ensure price lists exist
    const { data: existingLists } = await supabase.from('price_lists').select('*').eq('tenant_id', tenantId)
    
    let plCap1Id = existingLists?.find((p: any) => p.name.includes('Cấp 1'))?.id
    let plCap2Id = existingLists?.find((p: any) => p.name.includes('Cấp 2'))?.id
    let plRetailId = existingLists?.find((p: any) => p.name.includes('Bán Lẻ'))?.id

    if (!plCap1Id) {
      const { data: pl1 } = await supabase.from('price_lists').insert({
        tenant_id: tenantId,
        name: 'Bảng Giá Đại Lý Cấp 1 (Ưu Đãi Chiết Khấu 25%)',
        description: 'Dành cho nhà phân phối độc quyền khu vực & đại lý Cấp 1 nhập SLL'
      }).select().single()
      plCap1Id = pl1?.id
    }

    if (!plCap2Id) {
      const { data: pl2 } = await supabase.from('price_lists').insert({
        tenant_id: tenantId,
        name: 'Bảng Giá Đại Lý Cấp 2 & Siêu Thị (Chiết Khấu 15%)',
        description: 'Dành cho siêu thị mini, đại lý Cấp 2 và chuỗi cửa hàng tiện lợi'
      }).select().single()
      plCap2Id = pl2?.id
    }

    if (!plRetailId) {
      const { data: pl3 } = await supabase.from('price_lists').insert({
        tenant_id: tenantId,
        name: 'Bảng Giá Bán Lẻ & Nhà Hàng (Giá Niêm Yết Standard)',
        description: 'Dành cho nhà hàng, quán ăn và khách mua lẻ trực tiếp'
      }).select().single()
      plRetailId = pl3?.id
    }

    // 3. Ensure products exist
    const sampleProducts = [
      {
        sku: 'HH-40N-500',
        name: 'Nước Mắm Cốt Cá Cơm Hải Hương 40°N (500ml)',
        product_line: 'truyen_thong',
        protein_level: '40°N',
        volume_ml: 500,
        unit: 'chai',
        base_price: 125000,
        status: 'active'
      },
      {
        sku: 'HH-40N-750',
        name: 'Nước Mắm Cốt Cá Cơm Hải Hương 40°N (750ml)',
        product_line: 'truyen_thong',
        protein_level: '40°N',
        volume_ml: 750,
        unit: 'chai',
        base_price: 175000,
        status: 'active'
      },
      {
        sku: 'HH-60N-500',
        name: 'Nước Mắm Thượng Hạng Cốt Nhĩ 60°N (500ml)',
        product_line: 'truyen_thong',
        protein_level: '60°N',
        volume_ml: 500,
        unit: 'chai',
        base_price: 260000,
        status: 'active'
      },
      {
        sku: 'HH-30N-1000',
        name: 'Nước Mắm Truyền Thống Hạ Thổ 30°N (1L)',
        product_line: 'truyen_thong',
        protein_level: '30°N',
        volume_ml: 1000,
        unit: 'chai',
        base_price: 95000,
        status: 'active'
      },
      {
        sku: 'HH-25N-5000',
        name: 'Nước Mắm Bếp Hải Hương 25°N (Can 5L)',
        product_line: 'cong_nghiep',
        protein_level: '25°N',
        volume_ml: 5000,
        unit: 'can',
        base_price: 220000,
        status: 'active'
      },
      {
        sku: 'HH-15N-10000',
        name: 'Nước Mắm Chế Biến Công Nghiệp 15°N (Can 10L)',
        product_line: 'cong_nghiep',
        protein_level: '15°N',
        volume_ml: 10000,
        unit: 'can',
        base_price: 280000,
        status: 'active'
      },
      {
        sku: 'HH-VIP-GIFT',
        name: 'Hộp Quà Biếu Tết Hải Hương (2 Chai 60°N Thủy Tinh)',
        product_line: 'truyen_thong',
        protein_level: '60°N',
        volume_ml: 1000,
        unit: 'hộp',
        base_price: 580000,
        status: 'active'
      },
      {
        sku: 'HH-35N-500',
        name: 'Nước Mắm Cá Cơm Than Đảo Phú Quốc 35°N (500ml)',
        product_line: 'truyen_thong',
        protein_level: '35°N',
        volume_ml: 500,
        unit: 'chai',
        base_price: 110000,
        status: 'active'
      }
    ]

    const createdProducts: any[] = []
    for (const p of sampleProducts) {
      const { data: prod } = await supabase
        .from('products')
        .upsert({ tenant_id: tenantId, ...p }, { onConflict: 'tenant_id,sku' })
        .select()
        .single()
      if (prod) createdProducts.push(prod)
    }

    // 4. Ensure production batches exist
    if (createdProducts.length > 0) {
      const p40 = createdProducts.find(p => p.sku === 'HH-40N-500') || createdProducts[0]
      const p60 = createdProducts.find(p => p.sku === 'HH-60N-500') || createdProducts[0]

      const sampleBatches = [
        {
          tenant_id: tenantId,
          product_id: p40.id,
          batch_code: 'BATCH-2025-PT01',
          production_date: '2025-01-15',
          fermentation_start_date: '2023-07-10',
          fermentation_days: 554,
          facility: 'Nhà máy Sản xuất Nước Mắm Hải Hương - Phan Thiết',
          quantity: 12000,
          notes: 'Cá cơm tươi than đỏ nguyên con béo ngậy ủ muối hạt Ninh Thuận ủ chượp bằng chượp gỗ bời lời.'
        },
        {
          tenant_id: tenantId,
          product_id: p60.id,
          batch_code: 'BATCH-2025-PQ02',
          production_date: '2025-03-20',
          fermentation_start_date: '2023-11-01',
          fermentation_days: 505,
          facility: 'Xưởng Ủ Chượp Đảo Phú Quốc - Cơ sở Hải Hương 2',
          quantity: 8000,
          notes: 'Cá cơm sọc tiêu ủ muối gài nén ủ đủ 16 tháng lọc rút giọt nước mắm nhĩ cốt đầu tiên.'
        },
        {
          tenant_id: tenantId,
          product_id: p40.id,
          batch_code: 'BATCH-2026-PT03',
          production_date: '2026-01-10',
          fermentation_start_date: '2024-08-15',
          fermentation_days: 513,
          facility: 'Nhà máy Phan Thiết - Bình Thuận',
          quantity: 15000,
          notes: 'Lô nước mắm phục vụ thị trường Tết Âm Lịch 2026.'
        }
      ]

      for (const b of sampleBatches) {
        await supabase.from('production_batches').upsert(b, { onConflict: 'tenant_id,batch_code' })
      }
    }

    // 5. Populate Customers (20+ customers) with current_stage_id
    const stageOfficial = createdStages.find(s => s.name === 'Khách chính thức')?.id || createdStages[4]?.id
    const stageConsulting = createdStages.find(s => s.name === 'Đang tư vấn')?.id || createdStages[1]?.id
    const stageQuoted = createdStages.find(s => s.name === 'Đã chào giá')?.id || createdStages[2]?.id
    const stageNegotiating = createdStages.find(s => s.name === 'Đang đàm phán')?.id || createdStages[3]?.id
    const stageReengagement = createdStages.find(s => s.name === 'Cần chăm sóc lại')?.id || createdStages[5]?.id

    const customerSamples = [
      { name: 'Đại Lý Nước Mắm Nam Định - Hoàng Gia', type: 'dai_ly_cap1', phone: '0912 111 222', email: 'hoanggia.namdinh@gmail.com', address: '45 Trần Hưng Đạo, TP. Nam Định', region: 'Miền Bắc', debt_limit: 300000000, price_list_id: plCap1Id, current_stage_id: stageOfficial },
      { name: 'Công Ty TNHH Thực Phẩm Đông Hải', type: 'dai_ly_cap1', phone: '0903 888 999', email: 'donghaifood@gmail.com', address: '120 Nguyễn Văn Linh, Q.7, TP. Hồ Chí Minh', region: 'Miền Nam', debt_limit: 500000000, price_list_id: plCap1Id, current_stage_id: stageOfficial },
      { name: 'Chuỗi Siêu Thị Mini GreenMart Đà Nẵng', type: 'sieu_thi', phone: '0935 444 555', email: 'dathang@greenmart.vn', address: '88 Nguyễn Văn Linh, Đà Nẵng', region: 'Miền Trung', debt_limit: 150000000, price_list_id: plCap2Id, current_stage_id: stageOfficial },
      { name: 'Nhà Hàng Hải Sản Quán Ngon Phan Thiết', type: 'nha_hang', phone: '0988 222 333', email: 'quanngonpt@gmail.com', address: '02 Huỳnh Thúc Kháng, Phan Thiết', region: 'Miền Trung', debt_limit: 50000000, price_list_id: plRetailId, current_stage_id: stageReengagement },
      { name: 'Đại Lý Nước Mắm Cát Bà - Hải Phòng', type: 'dai_ly_cap2', phone: '0977 333 444', email: 'catbamar@gmail.com', address: '12 Lạch Tray, Hải Phòng', region: 'Miền Bắc', debt_limit: 100000000, price_list_id: plCap2Id, current_stage_id: stageQuoted },
      { name: 'Tập Đoàn Bán Lẻ WinCommerce (WinMart+)', type: 'sieu_thi', phone: '024 7300 8388', email: 'ncc@winmart.vn', address: 'Số 72 Lê Thánh Tôn, Q.1, TP. Hồ Chí Minh', region: 'Toàn Quốc', debt_limit: 800000000, price_list_id: plCap1Id, current_stage_id: stageNegotiating },
      { name: 'Nhà Hàng Cơm Niêu Sài Gòn 1985', type: 'nha_hang', phone: '0909 555 123', email: 'comnieusg@gmail.com', address: '27 Tú Xương, Q.3, TP. Hồ Chí Minh', region: 'Miền Nam', debt_limit: 60000000, price_list_id: plRetailId, current_stage_id: stageConsulting },
      { name: 'Công Ty Xuất Nhập Khẩu Asia Food Corp (USA)', type: 'xuat_khau', phone: '+1 408 999 7788', email: 'import@asiafoodus.com', address: 'California, USA', region: 'Xuất khẩu', debt_limit: 1000000000, price_list_id: plCap1Id, current_stage_id: stageNegotiating },
      { name: 'Đại Lý Gia Vị Miền Tây - Cần Thơ', type: 'dai_ly_cap1', phone: '0945 666 777', email: 'giavimientay@gmail.com', address: '30 Đường 30/4, TP. Cần Thơ', region: 'ĐBSCL', debt_limit: 250000000, price_list_id: plCap1Id, current_stage_id: stageOfficial },
      { name: 'Hệ Thống Quán Phở Thìn Hà Nội', type: 'nha_hang', phone: '0913 222 111', email: 'phothinhanoi@gmail.com', address: '13 Lò Đúc, Hà Nội', region: 'Miền Bắc', debt_limit: 80000000, price_list_id: plRetailId, current_stage_id: stageReengagement },
      { name: 'Đại Lý Nước Mắm Bà Rịa Vũng Tàu', type: 'dai_ly_cap2', phone: '0933 111 888', email: 'vungtau_nuocmam@gmail.com', address: '105 Lê Hồng Phong, Vũng Tàu', region: 'Miền Nam', debt_limit: 90000000, price_list_id: plCap2Id, current_stage_id: stageQuoted },
      { name: 'Khách Hàng Lẻ - Nguyễn Văn Hùng', type: 'khach_le', phone: '0989 123 456', email: 'hungnv@gmail.com', address: '15 Lý Thường Kiệt, Hà Nội', region: 'Miền Bắc', debt_limit: 10000000, price_list_id: plRetailId, current_stage_id: stageConsulting }
    ]

    for (const c of customerSamples) {
      await supabase.from('customers').insert({
        tenant_id: tenantId,
        status: 'active',
        ...c
      })
    }

    // Retrieve full list of customers
    const { data: allCustomers } = await supabase.from('customers').select('*').eq('tenant_id', tenantId)
    const { data: allProducts } = await supabase.from('products').select('*').eq('tenant_id', tenantId)
    const { data: allBatches } = await supabase.from('production_batches').select('*').eq('tenant_id', tenantId)

    // 6. Generate Realistic Historical Orders with Debts and Payments
    if (allCustomers && allCustomers.length > 0 && allProducts && allProducts.length > 0) {
      const orderCount = await supabase.from('orders').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId)
      
      if ((orderCount.count || 0) < 15) {
        const statuses = ['completed', 'completed', 'completed', 'delivering', 'confirmed', 'draft']
        const paymentStatuses = ['paid', 'paid', 'partial', 'unpaid']

        for (let i = 1; i <= 35; i++) {
          const customer = allCustomers[i % allCustomers.length]
          const orderCode = `DH-2025-${String(i).padStart(4, '0')}`
          const orderStatus = statuses[i % statuses.length]
          const payStatus = paymentStatuses[i % paymentStatuses.length]

          // Dates spread over past 12 months
          const monthAgo = (i % 11) + 1
          const day = (i * 3) % 28 + 1
          const orderDate = `2025-${String(monthAgo).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const deliveryDate = `2025-${String(monthAgo).padStart(2, '0')}-${String(Math.min(day + 3, 28)).padStart(2, '0')}`

          // Products in order
          const p1 = allProducts[i % allProducts.length]
          const p2 = allProducts[(i + 1) % allProducts.length]
          const qty1 = (i % 5 + 1) * 20
          const qty2 = (i % 3 + 1) * 10
          const line1 = qty1 * p1.base_price
          const line2 = qty2 * p2.base_price
          const totalAmount = line1 + line2
          const discountAmount = Math.round(totalAmount * 0.1) // 10% discount
          const finalAmount = totalAmount - discountAmount

          const { data: newOrder } = await supabase.from('orders').insert({
            tenant_id: tenantId,
            order_code: orderCode,
            customer_id: customer.id,
            status: orderStatus,
            order_date: orderDate,
            delivery_date: deliveryDate,
            total_amount: finalAmount,
            discount_amount: discountAmount,
            payment_status: payStatus,
            notes: `Đơn hàng đặt nguyên chuyến giao cho ${customer.name}`
          }).select().single()

          if (newOrder) {
            // Order Items
            const batch1 = allBatches?.[0]?.id || null
            const batch2 = allBatches?.[1]?.id || null

            await supabase.from('order_items').insert([
              { order_id: newOrder.id, product_id: p1.id, batch_id: batch1, quantity: qty1, unit_price: p1.base_price, line_total: line1 },
              { order_id: newOrder.id, product_id: p2.id, batch_id: batch2, quantity: qty2, unit_price: p2.base_price, line_total: line2 }
            ])

            // Debts & Payments
            if (payStatus !== 'paid' || i % 4 === 0) {
              const isOverdue = monthAgo < 8 && payStatus !== 'paid'
              const debtStatus = payStatus === 'paid' ? 'paid' : (isOverdue ? 'overdue' : 'open')
              const dueDate = `2025-${String(Math.min(monthAgo + 1, 12)).padStart(2, '0')}-15`

              const { data: debt } = await supabase.from('debts').insert({
                tenant_id: tenantId,
                customer_id: customer.id,
                order_id: newOrder.id,
                amount: finalAmount,
                due_date: dueDate,
                status: debtStatus,
                created_at: orderDate + 'T08:00:00Z'
              }).select().single()

              if (debt && payStatus === 'partial') {
                const paidPart = Math.round(finalAmount * 0.5)
                await supabase.from('payments').insert({
                  tenant_id: tenantId,
                  debt_id: debt.id,
                  customer_id: customer.id,
                  amount: paidPart,
                  payment_date: orderDate,
                  method: 'bank_transfer',
                  notes: 'Thanh toán đợt 1 chuyển khoản Vietcombank'
                })
              } else if (debt && payStatus === 'paid') {
                await supabase.from('payments').insert({
                  tenant_id: tenantId,
                  debt_id: debt.id,
                  customer_id: customer.id,
                  amount: finalAmount,
                  payment_date: orderDate,
                  method: 'bank_transfer',
                  notes: 'Thanh toán toàn bộ giá trị đơn hàng'
                })
              }
            }
          }
        }
      }

      // 7. Seed Customer Scores for Phase 2 Demo
      if (allCustomers && allCustomers.length > 0) {
        const scoresData = [
          {
            customer_id: allCustomers[0].id,
            order_frequency_score: 92,
            revenue_growth_score: 88,
            payment_reliability_score: 95,
            visit_engagement_score: 85,
            complaint_score: 90,
            overall_score: 90.5,
            segment: 'vip',
            ai_insight: 'Đại lý Hoàng Gia Nam Định là khách hàng nòng cốt với doanh số tăng trưởng bền vững và lịch sử thanh toán luôn đúng hạn. Khuyến nghị duy trì mức chiết khấu cấp 1 cao nhất 25% và ưu tiên nguồn hàng nước mắm cốt nhĩ 60°N vào mùa cao điểm.'
          },
          {
            customer_id: allCustomers[1].id,
            order_frequency_score: 85,
            revenue_growth_score: 82,
            payment_reliability_score: 88,
            visit_engagement_score: 80,
            complaint_score: 85,
            overall_score: 84.0,
            segment: 'vip',
            ai_insight: 'Công ty Đông Hải nhập hàng rất đều đặn tại khu vực phía Nam. Đề xuất nhân viên Sales chăm sóc thường xuyên hơn để xúc tiến đưa dòng nước mắm bếp 25°N vào chuỗi nhà hàng đối tác.'
          },
          {
            customer_id: allCustomers[2].id,
            order_frequency_score: 70,
            revenue_growth_score: 65,
            payment_reliability_score: 75,
            visit_engagement_score: 70,
            complaint_score: 80,
            overall_score: 71.5,
            segment: 'on_dinh',
            ai_insight: 'Chuỗi GreenMart Đà Nẵng duy trì nhập hàng ổn định hàng tháng. Nên mở rộng hợp tác chạy chương trình khuyến mãi dùng thử chai 500ml tại điểm bán để tăng sản lượng tiêu thụ.'
          },
          {
            customer_id: allCustomers[3].id,
            order_frequency_score: 35,
            revenue_growth_score: 30,
            payment_reliability_score: 45,
            visit_engagement_score: 40,
            complaint_score: 60,
            overall_score: 39.5,
            segment: 'rui_ro_roi_bo',
            ai_insight: 'Nhà hàng Quán Ngon Phan Thiết đang có dấu hiệu giảm 40% tần suất đặt đơn so với cùng kỳ và trễ hạn thanh toán công nợ 2 lần gần nhất. Cần Sales đến làm việc trực tiếp để tìm hiểu nguyên nhân và hỗ trợ gia hạn nợ.'
          }
        ]

        for (const sc of scoresData) {
          await supabase.from('customer_scores').insert({
            tenant_id: tenantId,
            period_start: '2025-01-01',
            period_end: '2025-12-31',
            ...sc
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Seed mock data successfully for Phase 2 tenant Hải Hương!',
      tenantId
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Seed failed' }, { status: 500 })
  }
}
