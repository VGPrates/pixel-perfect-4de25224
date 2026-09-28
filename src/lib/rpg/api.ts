import { supabase } from "@/integrations/supabase/client";
import type {
  AppliedCondition,
  AppliedEffect,
  BodySlot,
  Character,
  CharacterDraft,
  Condition,
  DiceRoll,
  Effect,
  Equipment,
  InventoryItem,
  Modifiers,
  Profile,
  Role,
  StatKey,
} from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */
const db = supabase as any;

function fail(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

export function mapEquipment(e: any): Equipment {
  return {
    id: Number(e.id),
    name: e.name,
    icon: e.icon,
    category: e.category,
    rarity: e.rarity,
    description: e.description,
    effects: e.effects,
    modifiers: (e.modifiers ?? {}) as Modifiers,
  };
}
export function mapEffect(e: any): Effect {
  return { id: Number(e.id), kind: e.kind, name: e.name, icon: e.icon, color: e.color, description: e.description, modifiers: e.modifiers ?? {} };
}
export function mapCondition(c: any): Condition {
  return { id: Number(c.id), name: c.name, icon: c.icon, color: c.color, description: c.description, effect: c.effect, modifiers: c.modifiers ?? {} };
}

function mapCharacter(row: any): Character {
  const inventory: InventoryItem[] = (row.inventory_items ?? [])
    .sort((a: any, b: any) => a.id - b.id)
    .map((i: any) => ({
      id: Number(i.id),
      name: i.equipment?.name ?? i.name,
      description: i.equipment?.description ?? i.description,
      quantity: i.quantity,
      kind: i.kind,
      equipment: i.equipment ? mapEquipment(i.equipment) : null,
      equippedSlot: i.equipped_slot,
    }));
  const effects: AppliedEffect[] = (row.character_effects ?? [])
    .filter((e: any) => e.effects)
    .map((e: any) => ({ id: Number(e.id), duration: e.duration, effect: mapEffect(e.effects) }));
  const conditions: AppliedCondition[] = (row.character_conditions ?? [])
    .filter((c: any) => c.conditions)
    .map((c: any) => ({ id: Number(c.id), duration: c.duration, condition: mapCondition(c.conditions) }));
  return {
    id: Number(row.id),
    userId: row.user_id,
    createdBy: row.created_by,
    name: row.name,
    race: row.race,
    className: row.class,
    age: row.age,
    backstory: row.backstory,
    hp: row.hp,
    hpMax: row.hp_max,
    mana: row.mana,
    manaMax: row.mana_max,
    stamina: row.stamina,
    staminaMax: row.stamina_max,
    strength: row.strength,
    agility: row.agility,
    resistance: row.resistance,
    intelligence: row.intelligence,
    presence: row.presence,
    unspentPoints: row.unspent_points,
    notes: row.notes,
    inventory,
    effects,
    conditions,
    updatedAt: row.updated_at,
  };
}

const CHAR_SELECT =
  "*, inventory_items(*, equipment(*)), character_effects(*, effects(*)), character_conditions(*, conditions(*))";

export type RpgState = { profile: Profile | null; character: Character | null; party: Character[] };

export async function getMyState(): Promise<RpgState> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) throw new Error("Não autenticado.");
  const [{ data: roleRow }, { data: prof }] = await Promise.all([
    db.from("user_roles").select("role").eq("user_id", uid).maybeSingle(),
    db.from("profiles").select("*").eq("user_id", uid).maybeSingle(),
  ]);
  if (!roleRow) return { profile: null, character: null, party: [] };
  const profile: Profile = {
    userId: uid,
    role: roleRow.role as Role,
    displayName: prof?.display_name ?? null,
    avatarUrl: prof?.avatar_url ?? null,
  };
  const { data: rows, error } = await db.from("characters").select(CHAR_SELECT).order("name");
  fail(error);
  const all = (rows ?? []).map(mapCharacter);
  if (profile.role === "gm") return { profile, character: null, party: all };
  return { profile, character: all.find((c: Character) => c.userId === uid) ?? null, party: [] };
}

export async function getLibrary() {
  const [eq, ef, co] = await Promise.all([
    db.from("equipment").select("*").order("name"),
    db.from("effects").select("*").order("name"),
    db.from("conditions").select("*").order("name"),
  ]);
  fail(eq.error || ef.error || co.error);
  return {
    equipment: (eq.data ?? []).map(mapEquipment) as Equipment[],
    effects: (ef.data ?? []).map(mapEffect) as Effect[],
    conditions: (co.data ?? []).map(mapCondition) as Condition[],
  };
}

export async function chooseRole(role: Role, displayName: string, character?: CharacterDraft) {
  const { error } = await db.rpc("choose_role", { _role: role, _display_name: displayName, _character: character ?? null });
  fail(error);
}

/** Identidade (nome, raça, classe, idade, história) só pode ser corrigida pelo Mestre.
 *  O banco bloqueia qualquer outra origem — esta função usa a rotina do Mestre. */
export async function gmUpdateIdentity(characterId: number, d: CharacterDraft) {
  const { error } = await db.rpc("gm_update_identity", {
    _character_id: characterId,
    _name: d.name,
    _race: d.race,
    _class: d.className,
    _age: d.age,
    _backstory: d.backstory,
  });
  fail(error);
}
export async function updateNotes(characterId: number, notes: string) {
  const { error } = await db.from("characters").update({ notes }).eq("id", characterId);
  fail(error);
}
export async function updateMyAvatar(avatar: string | null) {
  const { data: auth } = await supabase.auth.getUser();
  const { error } = await db.from("profiles").update({ avatar_url: avatar }).eq("user_id", auth.user!.id);
  fail(error);
}

export async function spendPoints(characterId: number, alloc: Partial<Record<StatKey, number>>) {
  const { error } = await db.rpc("spend_points", { _character_id: characterId, _alloc: alloc });
  fail(error);
}
export async function gmSetStats(characterId: number, s: Record<StatKey, number> & { unspent: number }) {
  const { error } = await db.rpc("gm_set_stats", {
    _character_id: characterId,
    _strength: s.strength,
    _agility: s.agility,
    _resistance: s.resistance,
    _intelligence: s.intelligence,
    _presence: s.presence,
    _unspent: s.unspent,
  });
  fail(error);
}
export async function gmGrantPoints(characterId: number, amount: number) {
  const { error } = await db.rpc("gm_grant_points", { _character_id: characterId, _amount: amount });
  fail(error);
}
export async function gmUpdateVitals(characterId: number, v: { hp: number; hpMax: number; mana: number; manaMax: number; stamina: number; staminaMax: number }) {
  const { error } = await db.rpc("gm_update_vitals", {
    _character_id: characterId,
    _hp: v.hp,
    _hp_max: v.hpMax,
    _mana: v.mana,
    _mana_max: v.manaMax,
    _stamina: v.stamina,
    _stamina_max: v.staminaMax,
  });
  fail(error);
}
export async function gmCreateCharacter(d: CharacterDraft) {
  const { data: auth } = await supabase.auth.getUser();
  const { data, error } = await db
    .from("characters")
    .insert({ created_by: auth.user!.id, name: d.name, race: d.race, class: d.className, age: d.age, backstory: d.backstory })
    .select("id, name")
    .single();
  fail(error);
  return { id: Number(data.id), name: data.name as string };
}
export async function gmDeleteCharacter(characterId: number) {
  const { error } = await db.from("characters").delete().eq("id", characterId);
  fail(error);
}

export async function addItem(characterId: number, item: { name: string; description: string; quantity: number; kind: "item" | "belonging" }) {
  const { error } = await db.from("inventory_items").insert({ character_id: characterId, ...item });
  fail(error);
}
export async function removeItem(itemId: number) {
  const { error } = await db.from("inventory_items").delete().eq("id", itemId);
  fail(error);
}
export async function equipItem(itemId: number, slot: BodySlot) {
  const { error } = await db.rpc("equip_item", { _item_id: itemId, _slot: slot });
  fail(error);
}
export async function unequipItem(itemId: number) {
  const { error } = await db.rpc("unequip_item", { _item_id: itemId });
  fail(error);
}
export async function gmGiveEquipment(characterId: number, equipmentId: number) {
  const { error } = await db.rpc("gm_give_equipment", { _character_id: characterId, _equipment_id: equipmentId });
  fail(error);
}

type Table = "equipment" | "effects" | "conditions";
export async function saveLibraryEntry(table: Table, id: number | null, values: Record<string, unknown>) {
  const q = id ? db.from(table).update(values).eq("id", id) : db.from(table).insert(values);
  const { error } = await q;
  fail(error);
}
export async function deleteLibraryEntry(table: Table, id: number) {
  const { error } = await db.from(table).delete().eq("id", id);
  fail(error);
}

export async function applyEffect(characterId: number, effectId: number, duration: string) {
  const { error } = await db.from("character_effects").insert({ character_id: characterId, effect_id: effectId, duration });
  fail(error);
}
export async function removeAppliedEffect(id: number) {
  const { error } = await db.from("character_effects").delete().eq("id", id);
  fail(error);
}
export async function applyCondition(characterId: number, conditionId: number, duration: string) {
  const { error } = await db.from("character_conditions").insert({ character_id: characterId, condition_id: conditionId, duration });
  fail(error);
}
export async function removeAppliedCondition(id: number) {
  const { error } = await db.from("character_conditions").delete().eq("id", id);
  fail(error);
}

export function mapRoll(r: any): DiceRoll {
  return { id: Number(r.id), userId: r.user_id, rollerName: r.roller_name, value: r.value, createdAt: r.created_at };
}
export async function rollD20(): Promise<DiceRoll> {
  const { data, error } = await db.rpc("roll_d20");
  fail(error);
  return mapRoll(data);
}
export async function recentRolls(): Promise<DiceRoll[]> {
  const { data, error } = await db.from("dice_rolls").select("*").order("id", { ascending: false }).limit(8);
  fail(error);
  return (data ?? []).map(mapRoll);
}
