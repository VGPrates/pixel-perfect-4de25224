create table public.custom_icons (
  id bigint generated always as identity primary key,
  key text not null unique,
  label text not null,
  category text not null check (category in ('equipment','effect','condition')),
  url text not null,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now());

grant select, insert, update, delete on public.custom_icons to authenticated;
grant all on public.custom_icons to service_role;

alter table public.custom_icons enable row level security;

create policy "icons read" on public.custom_icons for select to authenticated using (true);
create policy "icons gm write" on public.custom_icons for all to authenticated using (public.is_gm(auth.uid())) with check (public.is_gm(auth.uid()));

alter publication supabase_realtime add table public.custom_icons;