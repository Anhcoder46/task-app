-- Bảng orders
create table orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  product_name text null,
  status text not null default 'pending'
    check (status in ('pending', 'shipping', 'delivered')),
  attachment_url text null,
  attachment_name text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Bảng messages (lưu lịch sử chat)
create table messages (
  id uuid primary key default gen_random_uuid(),
  user_name text not null,
  content text not null,
  created_at timestamptz not null default now()
);
