-- ============================================================
-- CRM NƯỚC MẮM HẢI HƯƠNG - PHASE 2 MỞ RỘNG DATABASE SCHEMA
-- ============================================================

-- 1. ENUMS
do $$ begin
    create type customer_segment as enum ('vip', 'on_dinh', 'can_cham_soc', 'rui_ro_roi_bo');
exception
    when duplicate_object then null;
end $$;

-- 2. BẢNG: pipeline_stages (Giai đoạn quy trình chăm sóc khách hàng)
create table if not exists pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  color text default '#94a3b8',
  created_at timestamptz not null default now()
);

-- Thêm cột current_stage_id vào bảng customers nếu chưa có
do $$ begin
  alter table customers add column current_stage_id uuid references pipeline_stages (id) on delete set null;
exception
  when duplicate_column then null;
end $$;

-- 3. BẢNG: pipeline_stage_history (Lịch sử chuyển đổi giai đoạn)
create table if not exists pipeline_stage_history (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  customer_id uuid not null references customers (id) on delete cascade,
  from_stage_id uuid references pipeline_stages (id) on delete set null,
  to_stage_id uuid references pipeline_stages (id) on delete set null,
  changed_by uuid references profiles (id) on delete set null,
  note text,
  changed_at timestamptz not null default now()
);

create index if not exists idx_stage_history_customer on pipeline_stage_history (customer_id);

-- 4. BẢNG: customer_scores (Chấm điểm hành vi đại lý & AI Insight)
create table if not exists customer_scores (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  customer_id uuid not null references customers (id) on delete cascade,
  period_start date not null,
  period_end date not null,
  order_frequency_score numeric(5, 2),
  revenue_growth_score numeric(5, 2),
  payment_reliability_score numeric(5, 2),
  visit_engagement_score numeric(5, 2),
  complaint_score numeric(5, 2),
  overall_score numeric(5, 2),
  segment customer_segment,
  ai_insight text,
  computed_at timestamptz not null default now()
);

create index if not exists idx_customer_scores_customer on customer_scores (customer_id);

-- 5. CẤU HÌNH DISABLE RLS CHO CHẾ ĐỘ DEMO KẾT NỐI (Sẽ không còn bị lỗi "new row violates row-level security policy")
alter table tenants disable row level security;
alter table profiles disable row level security;
alter table customers disable row level security;
alter table products disable row level security;
alter table production_batches disable row level security;
alter table orders disable row level security;
alter table order_items disable row level security;
alter table debts disable row level security;
alter table payments disable row level security;
alter table price_lists disable row level security;
alter table price_list_items disable row level security;
alter table pipeline_stages disable row level security;
alter table pipeline_stage_history disable row level security;
alter table customer_scores disable row level security;
