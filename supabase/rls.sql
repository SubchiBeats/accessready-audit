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
