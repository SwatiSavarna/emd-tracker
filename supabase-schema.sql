-- Run this entire file in your Supabase SQL editor
-- supabase.com > your project > SQL Editor > New Query > paste > Run

-- COMPANIES table (one per paying customer)
create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text,
  subscription_status text default 'trial', -- trial | active | expired
  trial_ends_at timestamptz default now() + interval '14 days',
  razorpay_subscription_id text,
  created_at timestamptz default now()
);

-- USERS table (linked to Supabase auth)
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid references companies(id) on delete cascade,
  name text,
  email text not null,
  role text default 'admin', -- admin | viewer
  created_at timestamptz default now()
);

-- GUARANTEES table (the core product)
create table guarantees (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade not null,
  
  -- Tender info
  tender_name text not null,
  tender_number text,
  department text, -- e.g. "CPWD Delhi", "Assam PWD"
  
  -- Guarantee details
  type text not null, -- EMD | Performance BG | Bid Bond | Advance BG
  amount numeric not null,
  bank_name text not null,
  bg_number text, -- Bank Guarantee reference number
  
  -- Key dates
  submission_date date,
  expiry_date date not null,
  
  -- Status
  status text default 'active', -- active | renewed | released | forfeited
  notes text,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ALERT LOGS (track which alerts were sent, avoid duplicates)
create table alert_logs (
  id uuid primary key default gen_random_uuid(),
  guarantee_id uuid references guarantees(id) on delete cascade,
  days_before int not null, -- 30, 15, or 7
  sent_at timestamptz default now(),
  channel text default 'email' -- email | whatsapp
);

-- ROW LEVEL SECURITY — companies only see their own data
alter table companies enable row level security;
alter table guarantees enable row level security;
alter table alert_logs enable row level security;

-- Policy: users can only see their company's guarantees
create policy "Users see own company guarantees"
  on guarantees for all
  using (
    company_id = (
      select company_id from users where id = auth.uid()
    )
  );

-- Policy: users see their own company
create policy "Users see own company"
  on companies for all
  using (
    id = (
      select company_id from users where id = auth.uid()
    )
  );

-- Function: auto-update updated_at on guarantees
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger guarantees_updated_at
  before update on guarantees
  for each row execute function update_updated_at();

-- Index for fast expiry queries (used by alert cron job)
create index guarantees_expiry_status_idx on guarantees(expiry_date, status);
create index guarantees_company_idx on guarantees(company_id);
