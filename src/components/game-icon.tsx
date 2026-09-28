import type { ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

import sword from "@/assets/icons/sword.webp";
import dagger from "@/assets/icons/dagger.webp";
import axe from "@/assets/icons/axe.webp";
import bow from "@/assets/icons/bow.webp";
import shield from "@/assets/icons/shield.webp";
import helmet from "@/assets/icons/helmet.webp";
import crown from "@/assets/icons/crown.webp";
import armor from "@/assets/icons/armor.webp";
import pants from "@/assets/icons/pants.webp";
import boot from "@/assets/icons/boot.webp";
import amulet from "@/assets/icons/amulet.webp";
import ring from "@/assets/icons/ring.webp";
import potion from "@/assets/icons/potion.webp";
import scroll from "@/assets/icons/scroll.webp";
import bag from "@/assets/icons/bag.webp";
import gem from "@/assets/icons/gem.webp";
import muscle from "@/assets/icons/muscle.webp";
import aegis from "@/assets/icons/aegis.webp";
import flame from "@/assets/icons/flame.webp";
import wilt from "@/assets/icons/wilt.webp";
import blood from "@/assets/icons/blood.webp";
import bone from "@/assets/icons/bone.webp";
import stun from "@/assets/icons/stun.webp";
import frost from "@/assets/icons/frost.webp";
import poison from "@/assets/icons/poison.webp";
import sparkles from "@/assets/icons/sparkles.webp";
import droplet from "@/assets/icons/droplet.webp";
import heart from "@/assets/icons/heart.webp";
import dice from "@/assets/icons/dice.webp";

/**
 * Illustrated medieval/fantasy icon set for RPG Fallen Gods.
 * No emoji anywhere in the UI — every pictogram comes from this single set so
 * buttons, slots, library entries and effects share one painted visual identity.
 * Icon keys are unchanged, so stored icon names keep working.
 */
const ICONS: Record<string, string> = {
  sword,
  dagger,
  axe,
  bow,
  shield,
  helmet,
  crown,
  armor,
  pants,
  boot,
  amulet,
  ring,
  potion,
  scroll,
  bag,
  gem,
  muscle,
  aegis,
  flame,
  wilt,
  blood,
  bone,
  stun,
  frost,
  poison,
  sparkles,
  droplet,
  heart,
  dice,
};

export type GameIconName = keyof typeof ICONS;

export const GAME_ICON_NAMES = Object.keys(ICONS) as GameIconName[];

export const GAME_ICON_LABEL: Record<string, string> = {
  sword: "Espada",
  dagger: "Adaga",
  axe: "Machado",
  bow: "Arco",
  shield: "Escudo",
  helmet: "Elmo",
  crown: "Coroa",
  armor: "Armadura",
  pants: "Grevas",
  boot: "Bota",
  amulet: "Amuleto",
  ring: "Anel",
  potion: "Poção",
  scroll: "Pergaminho",
  bag: "Bolsa",
  gem: "Gema",
  muscle: "Vigor",
  aegis: "Proteção",
  flame: "Chama",
  wilt: "Definhar",
  blood: "Sangramento",
  bone: "Fratura",
  stun: "Atordoado",
  frost: "Gelo",
  poison: "Veneno",
  sparkles: "Arcano",
  droplet: "Gota",
  heart: "Vida",
  dice: "Dado",
};

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "name" | "src" | "alt"> & {
  name: string | null | undefined;
  className?: string;
  title?: string;
  /** Rarity key (comum | incomum | raro | epico | lendario) for an elegant tinted glow. */
  rarity?: string | null;
  /** Dim the icon (used for empty equipment slots). */
  muted?: boolean;
};

export function GameIcon({ name, className, title, rarity, muted, ...rest }: Props) {
  const src = ICONS[(name ?? "") as GameIconName] ?? ICONS["sparkles"];
  return (
    <img
      src={src}
      alt={title ?? ""}
      title={title}
      loading="lazy"
      draggable={false}
      data-game-icon=""
      className={cn(
        "fantasy-icon size-7 shrink-0 object-contain select-none",
        rarity ? `fantasy-icon--${rarity}` : null,
        muted ? "fantasy-icon--muted" : null,
        className,
      )}
      aria-hidden={title ? undefined : true}
      {...rest}
    />
  );
}
