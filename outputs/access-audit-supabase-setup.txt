-- Access Audit Supabase setup
-- Paste this whole file into Supabase SQL Editor and run it once.

-- Access Audit Supabase schema
-- Enable pgcrypto for gen_random_uuid().
create extension if not exists pgcrypto;

create type compliance_mode as enum ('wcag22-aa', 'wcag21-aa', 'section508', 'custom');
create type scan_status as enum ('queued', 'running', 'completed', 'failed', 'cancelled');
create type finding_severity as enum ('critical', 'serious', 'moderate', 'minor', 'needs-review');
create type finding_status as enum ('open', 'in-progress', 'needs-review', 'fixed', 'accepted-risk', 'false-positive');
create type manual_status as enum ('pass', 'fail', 'not-applicable', 'not-started');

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  primary_url text not null,
  compliance_mode compliance_mode not null default 'wcag22-aa',
  allowed_domains text[] not null default '{}',
  tags text[] not null default '{}',
  responsible_use_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'auditor', 'developer', 'viewer')),
  unique (project_id, user_id)
);

create table scan_configs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  urls text[] not null,
  crawl_depth integer not null default 2,
  max_pages integer not null default 25,
  scan_mode compliance_mode not null default 'wcag22-aa',
  include_patterns text[] not null default '{}',
  exclude_patterns text[] not null default '{}',
  sitemap_url text,
  same_domain_only boolean not null default true,
  desktop_viewport jsonb not null default '{"width":1440,"height":1000}',
  mobile_viewport jsonb not null default '{"width":390,"height":844}',
  responsive_widths integer[] not null default '{320,390,768,1024,1440}',
  rate_limit_ms integer not null default 750,
  auth jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table scans (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  config_id uuid not null references scan_configs(id) on delete restrict,
  status scan_status not null default 'queued',
  started_at timestamptz,
  completed_at timestamptz,
  failed_reason text,
  pages_scanned integer not null default 0,
  urls_queued integer not null default 0,
  tool_version text not null,
  summary jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table scanned_pages (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references scans(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  url text not null,
  canonical_url text,
  title text,
  http_status integer,
  viewport text not null check (viewport in ('desktop', 'mobile', 'responsive')),
  screenshot_path text,
  dom_snapshot_path text,
  raw_axe_path text,
  discovered_links text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table findings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  scan_id uuid not null references scans(id) on delete cascade,
  title text not null,
  issue_key text not null,
  description text not null,
  why_it_matters text not null,
  who_it_affects text[] not null default '{}',
  severity finding_severity not null,
  confidence text not null check (confidence in ('high', 'medium', 'low')),
  source text not null check (source in ('automated', 'keyboard', 'visual', 'manual', 'needs-review')),
  wcag jsonb not null default '[]',
  ada_mapping text,
  section508_mapping text,
  selector text,
  html_snippet text,
  status finding_status not null default 'open',
  remediation jsonb not null default '{}',
  steps_to_reproduce text[] not null default '{}',
  template_key text,
  component_name text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table finding_instances (
  id uuid primary key default gen_random_uuid(),
  finding_id uuid not null references findings(id) on delete cascade,
  scan_id uuid not null references scans(id) on delete cascade,
  page_id uuid not null references scanned_pages(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  url text not null,
  selector text,
  html_snippet text,
  screenshot_path text,
  viewport text not null,
  impact finding_severity not null,
  created_at timestamptz not null default now()
);

create table manual_checks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  scan_id uuid references scans(id) on delete set null,
  principle text not null check (principle in ('perceivable', 'operable', 'understandable', 'robust')),
  title text not null,
  description text not null,
  wcag jsonb not null default '[]',
  status manual_status not null default 'not-started',
  notes text,
  assignee text,
  priority text not null check (priority in ('critical', 'high', 'medium', 'low')),
  due_date date,
  remediation_status finding_status not null default 'open',
  evidence_file_ids uuid[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table evidence_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  finding_id uuid references findings(id) on delete set null,
  manual_check_id uuid references manual_checks(id) on delete set null,
  file_name text not null,
  storage_path text not null,
  content_type text not null,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  finding_id uuid references findings(id) on delete cascade,
  manual_check_id uuid references manual_checks(id) on delete cascade,
  body text not null,
  author_name text not null,
  created_at timestamptz not null default now()
);

create table remediation_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  finding_id uuid not null references findings(id) on delete cascade,
  title text not null,
  owner text,
  due_date date,
  status text not null check (status in ('todo', 'doing', 'blocked', 'done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  scan_id uuid not null references scans(id) on delete cascade,
  kind text not null check (kind in ('executive-pdf', 'technical-pdf', 'csv', 'json', 'developer-checklist', 'vpat-draft')),
  title text not null,
  generated_at timestamptz not null default now(),
  artifact_path text
);

-- Shared application state for the local-first demo store when deployed across
-- separate web and worker containers. The normalized tables above remain the
-- long-term production model; this JSON state keeps the current app usable on
-- hosted services immediately.
create table audit_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create index findings_project_status_idx on findings(project_id, status);
create index findings_scan_severity_idx on findings(scan_id, severity);
create index scans_project_created_idx on scans(project_id, created_at desc);
create index pages_scan_idx on scanned_pages(scan_id);


-- Row Level Security policies
-- Access Audit Row Level Security policies.
alter table organizations enable row level security;
alter table user_profiles enable row level security;
alter table projects enable row level security;
alter table project_members enable row level security;
alter table scan_configs enable row level security;
alter table scans enable row level security;
alter table scanned_pages enable row level security;
alter table findings enable row level security;
alter table finding_instances enable row level security;
alter table manual_checks enable row level security;
alter table evidence_files enable row level security;
alter table comments enable row level security;
alter table remediation_tasks enable row level security;
alter table reports enable row level security;
alter table audit_state enable row level security;

create or replace function is_project_member(project_uuid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from project_members
    where project_members.project_id = project_uuid
      and project_members.user_id = auth.uid()
  );
$$;

create policy "profiles read self" on user_profiles for select using (id = auth.uid());
create policy "profiles update self" on user_profiles for update using (id = auth.uid());

create policy "members read own projects" on project_members
for select using (user_id = auth.uid() or is_project_member(project_id));

create policy "projects read members" on projects
for select using (is_project_member(id));

create policy "projects update owners auditors" on projects
for update using (
  exists (
    select 1 from project_members
    where project_members.project_id = projects.id
      and project_members.user_id = auth.uid()
      and project_members.role in ('owner', 'auditor')
  )
);

create policy "scan configs project members" on scan_configs
for all using (is_project_member(project_id))
with check (is_project_member(project_id));

create policy "scans project members" on scans
for all using (is_project_member(project_id))
with check (is_project_member(project_id));

create policy "scanned pages project members" on scanned_pages
for all using (is_project_member(project_id))
with check (is_project_member(project_id));

create policy "findings project members" on findings
for all using (is_project_member(project_id))
with check (is_project_member(project_id));

create policy "finding instances project members" on finding_instances
for all using (is_project_member(project_id))
with check (is_project_member(project_id));

create policy "manual checks project members" on manual_checks
for all using (is_project_member(project_id))
with check (is_project_member(project_id));

create policy "evidence project members" on evidence_files
for all using (is_project_member(project_id))
with check (is_project_member(project_id));

create policy "comments project members" on comments
for all using (is_project_member(project_id))
with check (is_project_member(project_id));

create policy "tasks project members" on remediation_tasks
for all using (is_project_member(project_id))
with check (is_project_member(project_id));

create policy "reports project members" on reports
for all using (is_project_member(project_id))
with check (is_project_member(project_id));

-- Accessed by the service role from the hosted web/worker services.
create policy "audit state service managed" on audit_state
for all using (false)
with check (false);

