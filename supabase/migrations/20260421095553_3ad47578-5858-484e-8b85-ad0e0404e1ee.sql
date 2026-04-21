
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin new.updated_at = now(); return new; end; $$;

drop policy if exists "scans_public_read" on storage.objects;
create policy "scans_read_files_only"
on storage.objects for select
using (bucket_id = 'scans' and name is not null and position('/' in name) > 0);
