create type public.app_role as enum ('gm','player');

create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, role public.app_role not null, unique(user_id));
create table public.profiles (user_id uuid primary key references auth.users(id) on delete cascade, display_name text, avatar_url text, created_at timestamptz not null default now());
create table public.characters (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  created_by uuid not null,
  name text not null, race text not null, class text not null, age int not null, backstory text not null default '',
  hp int not null default 20, hp_max int not null default 20, mana int not null default 10, mana_max int not null default 10,
  stamina int not null default 10, stamina_max int not null default 10,
  strength int not null default 1, agility int not null default 1, resistance int not null default 1, intelligence int not null default 1, presence int not null default 1,
  unspent_points int not null default 5, notes text not null default '',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.equipment (id bigint generated always as identity primary key, name text not null, icon text not null default 'sword', category text not null, rarity text not null default 'comum', description text not null default '', effects text not null default '', modifiers jsonb not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.effects (id bigint generated always as identity primary key, kind text not null, name text not null, icon text not null default 'sparkles', color text not null default '#d4a24c', description text not null default '', modifiers jsonb not null default '{}', created_at timestamptz not null default now());
create table public.conditions (id bigint generated always as identity primary key, name text not null, icon text not null default 'skull', color text not null default '#9b2c2c', description text not null default '', effect text not null default '', modifiers jsonb not null default '{}', created_at timestamptz not null default now());
create table public.inventory_items (id bigint generated always as identity primary key, character_id bigint not null references public.characters(id) on delete cascade, equipment_id bigint references public.equipment(id) on delete cascade, name text not null, description text not null default '', quantity int not null default 1, kind text not null, equipped_slot text, created_at timestamptz not null default now());
create table public.character_effects (id bigint generated always as identity primary key, character_id bigint not null references public.characters(id) on delete cascade, effect_id bigint not null references public.effects(id) on delete cascade, duration text not null default '', applied_at timestamptz not null default now());
create table public.character_conditions (id bigint generated always as identity primary key, character_id bigint not null references public.characters(id) on delete cascade, condition_id bigint not null references public.conditions(id) on delete cascade, duration text not null default '', applied_at timestamptz not null default now());
create table public.dice_rolls (id bigint generated always as identity primary key, user_id uuid not null references auth.users(id) on delete cascade, character_id bigint references public.characters(id) on delete set null, roller_name text not null, value int not null, created_at timestamptz not null default now());

grant select on public.user_roles to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.characters, public.equipment, public.effects, public.conditions, public.inventory_items, public.character_effects, public.character_conditions to authenticated;
grant select on public.dice_rolls to authenticated;
grant all on public.user_roles, public.profiles, public.characters, public.equipment, public.effects, public.conditions, public.inventory_items, public.character_effects, public.character_conditions, public.dice_rolls to service_role;

alter table public.user_roles enable row level security;
alter table public.profiles enable row level security;
alter table public.characters enable row level security;
alter table public.equipment enable row level security;
alter table public.effects enable row level security;
alter table public.conditions enable row level security;
alter table public.inventory_items enable row level security;
alter table public.character_effects enable row level security;
alter table public.character_conditions enable row level security;
alter table public.dice_rolls enable row level security;

create or replace function public.is_gm(_uid uuid) returns boolean language sql stable security definer set search_path=public as
$$ select exists(select 1 from public.user_roles where user_id=_uid and role='gm') $$;
create or replace function public.can_view_character(_cid bigint) returns boolean language sql stable security definer set search_path=public as
$$ select public.is_gm(auth.uid()) or exists(select 1 from public.characters where id=_cid and user_id=auth.uid()) $$;
create or replace function public.owns_character(_cid bigint) returns boolean language sql stable security definer set search_path=public as
$$ select exists(select 1 from public.characters where id=_cid and user_id=auth.uid()) $$;

create policy "own role" on public.user_roles for select to authenticated using (user_id=auth.uid() or public.is_gm(auth.uid()));
create policy "profiles read" on public.profiles for select to authenticated using (true);
create policy "profiles update own" on public.profiles for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());

create policy "chars read" on public.characters for select to authenticated using (public.is_gm(auth.uid()) or user_id=auth.uid());
create policy "chars gm insert" on public.characters for insert to authenticated with check (public.is_gm(auth.uid()));
create policy "chars update" on public.characters for update to authenticated using (public.is_gm(auth.uid()) or user_id=auth.uid());
create policy "chars gm delete" on public.characters for delete to authenticated using (public.is_gm(auth.uid()));

create policy "eq read" on public.equipment for select to authenticated using (true);
create policy "eq gm write" on public.equipment for all to authenticated using (public.is_gm(auth.uid())) with check (public.is_gm(auth.uid()));
create policy "ef read" on public.effects for select to authenticated using (true);
create policy "ef gm write" on public.effects for all to authenticated using (public.is_gm(auth.uid())) with check (public.is_gm(auth.uid()));
create policy "co read" on public.conditions for select to authenticated using (true);
create policy "co gm write" on public.conditions for all to authenticated using (public.is_gm(auth.uid())) with check (public.is_gm(auth.uid()));

create policy "inv read" on public.inventory_items for select to authenticated using (public.can_view_character(character_id));
create policy "inv insert" on public.inventory_items for insert to authenticated with check (public.is_gm(auth.uid()) or (public.owns_character(character_id) and equipment_id is null and equipped_slot is null));
create policy "inv delete" on public.inventory_items for delete to authenticated using (public.can_view_character(character_id));
create policy "inv gm update" on public.inventory_items for update to authenticated using (public.is_gm(auth.uid()));

create policy "ce read" on public.character_effects for select to authenticated using (public.can_view_character(character_id));
create policy "ce gm" on public.character_effects for all to authenticated using (public.is_gm(auth.uid())) with check (public.is_gm(auth.uid()));
create policy "cc read" on public.character_conditions for select to authenticated using (public.can_view_character(character_id));
create policy "cc gm" on public.character_conditions for all to authenticated using (public.is_gm(auth.uid())) with check (public.is_gm(auth.uid()));

create policy "dice read" on public.dice_rolls for select to authenticated using (true);

-- players may only change notes directly
create or replace function public.guard_character_update() returns trigger language plpgsql set search_path=public as $$
begin
  new.updated_at := now();
  if current_setting('app.rpc', true) = 'on' or public.is_gm(auth.uid()) or auth.uid() is null then return new; end if;
  if (to_jsonb(new) - 'notes' - 'updated_at') is distinct from (to_jsonb(old) - 'notes' - 'updated_at') then
    raise exception 'Somente o Mestre pode alterar isso.';
  end if;
  return new;
end $$;
create trigger characters_guard before update on public.characters for each row execute function public.guard_character_update();

create or replace function public.choose_role(_role public.app_role, _display_name text, _character jsonb default null) returns void language plpgsql security definer set search_path=public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Não autenticado.'; end if;
  if exists(select 1 from user_roles where user_id=uid) then raise exception 'Papel já escolhido.'; end if;
  insert into user_roles(user_id, role) values (uid, _role);
  insert into profiles(user_id, display_name) values (uid, nullif(_display_name,'')) on conflict (user_id) do update set display_name=excluded.display_name;
  if _role='player' then
    if _character is null then raise exception 'Ficha obrigatória.'; end if;
    insert into characters(user_id, created_by, name, race, class, age, backstory)
    values (uid, uid, _character->>'name', _character->>'race', _character->>'className', coalesce((_character->>'age')::int, 20), coalesce(_character->>'backstory',''));
  end if;
end $$;

create or replace function public.gm_update_identity(_character_id bigint, _name text, _race text, _class text, _age int, _backstory text) returns void language plpgsql security definer set search_path=public as $$
begin
  if not is_gm(auth.uid()) then raise exception 'Apenas o Mestre.'; end if;
  update characters set name=_name, race=_race, class=_class, age=_age, backstory=_backstory where id=_character_id;
end $$;

create or replace function public.spend_points(_character_id bigint, _alloc jsonb) returns void language plpgsql security definer set search_path=public as $$
declare s int:=coalesce((_alloc->>'strength')::int,0); a int:=coalesce((_alloc->>'agility')::int,0); r int:=coalesce((_alloc->>'resistance')::int,0); i int:=coalesce((_alloc->>'intelligence')::int,0); p int:=coalesce((_alloc->>'presence')::int,0); c characters;
begin
  select * into c from characters where id=_character_id;
  if c.id is null or c.user_id is distinct from auth.uid() then raise exception 'Ficha não encontrada.'; end if;
  if least(s,a,r,i,p) < 0 then raise exception 'Valores inválidos.'; end if;
  if s+a+r+i+p > c.unspent_points then raise exception 'Pontos insuficientes.'; end if;
  perform set_config('app.rpc','on',true);
  update characters set strength=strength+s, agility=agility+a, resistance=resistance+r, intelligence=intelligence+i, presence=presence+p, unspent_points=unspent_points-(s+a+r+i+p) where id=_character_id;
  perform set_config('app.rpc','off',true);
end $$;

create or replace function public.gm_set_stats(_character_id bigint, _strength int, _agility int, _resistance int, _intelligence int, _presence int, _unspent int) returns void language plpgsql security definer set search_path=public as $$
begin
  if not is_gm(auth.uid()) then raise exception 'Apenas o Mestre.'; end if;
  update characters set strength=_strength, agility=_agility, resistance=_resistance, intelligence=_intelligence, presence=_presence, unspent_points=_unspent where id=_character_id;
end $$;

create or replace function public.gm_grant_points(_character_id bigint, _amount int) returns void language plpgsql security definer set search_path=public as $$
begin
  if not is_gm(auth.uid()) then raise exception 'Apenas o Mestre.'; end if;
  update characters set unspent_points=greatest(0, unspent_points+_amount) where id=_character_id;
end $$;

create or replace function public.gm_update_vitals(_character_id bigint, _hp int, _hp_max int, _mana int, _mana_max int, _stamina int, _stamina_max int) returns void language plpgsql security definer set search_path=public as $$
begin
  if not is_gm(auth.uid()) then raise exception 'Apenas o Mestre.'; end if;
  update characters set hp=_hp, hp_max=_hp_max, mana=_mana, mana_max=_mana_max, stamina=_stamina, stamina_max=_stamina_max where id=_character_id;
end $$;

create or replace function public.equip_item(_item_id bigint, _slot text) returns void language plpgsql security definer set search_path=public as $$
declare it inventory_items; cat text; ok boolean;
begin
  select * into it from inventory_items where id=_item_id;
  if it.id is null or not can_view_character(it.character_id) then raise exception 'Item não encontrado.'; end if;
  select category into cat from equipment where id=it.equipment_id;
  if cat is null then raise exception 'Este item não pode ser equipado.'; end if;
  ok := case cat when 'elmo' then _slot='cabeca' when 'armadura' then _slot='torso' when 'calca' then _slot='pernas'
    when 'arma' then _slot in ('mao_direita','mao_esquerda') when 'escudo' then _slot in ('mao_direita','mao_esquerda')
    when 'bota' then _slot in ('pe_direito','pe_esquerdo') when 'acessorio' then _slot='acessorio' else false end;
  if not ok then raise exception 'Este item não cabe nesse espaço.'; end if;
  update inventory_items set equipped_slot=null where character_id=it.character_id and equipped_slot=_slot;
  update inventory_items set equipped_slot=_slot where id=_item_id;
end $$;

create or replace function public.unequip_item(_item_id bigint) returns void language plpgsql security definer set search_path=public as $$
declare cid bigint;
begin
  select character_id into cid from inventory_items where id=_item_id;
  if cid is null or not can_view_character(cid) then raise exception 'Item não encontrado.'; end if;
  update inventory_items set equipped_slot=null where id=_item_id;
end $$;

create or replace function public.gm_give_equipment(_character_id bigint, _equipment_id bigint) returns void language plpgsql security definer set search_path=public as $$
declare e equipment;
begin
  if not is_gm(auth.uid()) then raise exception 'Apenas o Mestre.'; end if;
  select * into e from equipment where id=_equipment_id;
  if e.id is null then raise exception 'Equipamento não encontrado.'; end if;
  insert into inventory_items(character_id, equipment_id, name, description, quantity, kind) values (_character_id, e.id, e.name, e.description, 1, 'item');
end $$;

create or replace function public.roll_d20() returns jsonb language plpgsql security definer set search_path=public as $$
declare uid uuid := auth.uid(); nm text; cid bigint; r dice_rolls;
begin
  if uid is null then raise exception 'Não autenticado.'; end if;
  select id, name into cid, nm from characters where user_id=uid limit 1;
  if nm is null then select coalesce(display_name,'Mestre') into nm from profiles where user_id=uid; end if;
  insert into dice_rolls(user_id, character_id, roller_name, value) values (uid, cid, coalesce(nm,'Aventureiro'), 1 + floor(random()*20)::int) returning * into r;
  return to_jsonb(r);
end $$;

revoke execute on all functions in schema public from anon, public;
grant execute on function public.is_gm(uuid), public.can_view_character(bigint), public.owns_character(bigint), public.choose_role(public.app_role,text,jsonb), public.gm_update_identity(bigint,text,text,text,int,text), public.spend_points(bigint,jsonb), public.gm_set_stats(bigint,int,int,int,int,int,int), public.gm_grant_points(bigint,int), public.gm_update_vitals(bigint,int,int,int,int,int,int), public.equip_item(bigint,text), public.unequip_item(bigint), public.gm_give_equipment(bigint,bigint), public.roll_d20() to authenticated;

alter publication supabase_realtime add table public.characters, public.inventory_items, public.character_effects, public.character_conditions, public.profiles, public.equipment, public.effects, public.conditions, public.dice_rolls;