
-- profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  language text not null default 'en',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

-- scan_history
create table public.scan_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  image_url text,
  plant_name text,
  disease_name text,
  confidence numeric,
  is_healthy boolean default false,
  remedies jsonb,
  prevention jsonb,
  description text,
  created_at timestamptz not null default now()
);
alter table public.scan_history enable row level security;
create index scan_history_user_idx on public.scan_history(user_id, created_at desc);

create policy "scan_select_own" on public.scan_history for select using (auth.uid() = user_id);
create policy "scan_insert_own" on public.scan_history for insert with check (auth.uid() = user_id);
create policy "scan_update_own" on public.scan_history for update using (auth.uid() = user_id);
create policy "scan_delete_own" on public.scan_history for delete using (auth.uid() = user_id);

-- diseases reference library
create table public.diseases (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plant text not null,
  description text not null,
  symptoms text[] not null default '{}',
  treatment text[] not null default '{}',
  image_url text,
  created_at timestamptz not null default now()
);
alter table public.diseases enable row level security;
create policy "diseases_public_read" on public.diseases for select using (true);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1), 'Guest'))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- storage bucket for scan images
insert into storage.buckets (id, name, public)
values ('scans', 'scans', true)
on conflict (id) do nothing;

create policy "scans_public_read" on storage.objects for select using (bucket_id = 'scans');
create policy "scans_auth_upload" on storage.objects for insert with check (bucket_id = 'scans' and auth.uid() is not null);
create policy "scans_owner_delete" on storage.objects for delete using (bucket_id = 'scans' and auth.uid() = owner);
