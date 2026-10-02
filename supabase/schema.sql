-- NaukariHit database. Paste this whole file into Supabase > SQL Editor > Run.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role text not null default 'student' check (role in ('student','admin')),
  phone text,
  branch text,
  cgpa numeric(4,2),
  grad_year int,
  skills text,
  resume_url text,
  created_at timestamptz default now()
);

create table public.drives (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  role text not null,
  description text,
  package_lpa numeric(5,2),
  location text,
  min_cgpa numeric(4,2) default 0,
  branches text[] default '{}',
  deadline timestamptz not null,
  created_at timestamptz default now()
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  drive_id uuid not null references public.drives(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'Applied'
    check (status in ('Applied','Shortlisted','Interview','Selected','Rejected')),
  applied_at timestamptz default now(),
  unique (drive_id, student_id)
);

-- Helper functions used by the security rules
create function public.is_admin() returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
$$;

create function public.my_role() returns text
language sql security definer set search_path = public stable as $$
  select role from public.profiles where id = auth.uid()
$$;

-- Auto-create a profile whenever someone signs up
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security: the database itself enforces who can do what
alter table public.profiles enable row level security;
alter table public.drives enable row level security;
alter table public.applications enable row level security;

create policy "read own profile or admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "update own profile" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid() and role = public.my_role());

create policy "anyone signed in can view drives" on public.drives
  for select using (auth.uid() is not null);
create policy "admin adds drives" on public.drives
  for insert with check (public.is_admin());
create policy "admin edits drives" on public.drives
  for update using (public.is_admin());
create policy "admin deletes drives" on public.drives
  for delete using (public.is_admin());

create policy "student sees own, admin sees all" on public.applications
  for select using (student_id = auth.uid() or public.is_admin());
create policy "student applies for self" on public.applications
  for insert with check (student_id = auth.uid());
create policy "admin updates status" on public.applications
  for update using (public.is_admin());
