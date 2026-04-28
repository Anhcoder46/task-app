-- Bảng tasks
create table tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text null,
  status text not null default 'open'
    check (status in ('open', 'in_progress', 'done')),
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
