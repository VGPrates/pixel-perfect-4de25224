import { useState, type DragEvent } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { BODY_SLOTS, CATEGORY, RARITY, slotAccepts } from "@/lib/rpg/constants";
import { formatModifiers } from "@/lib/rpg/stats";
import type { BodySlot, InventoryItem } from "@/lib/rpg/types";
import { GameIcon } from "@/components/game-icon";
import { cn } from "@/lib/utils";

/** Figure box inside the HUD (percent of container). Container aspect keeps the 120×220 figure undistorted. */
const FIG = { left: 30, width: 40, top: 2, height: 96 };
const toX = (fx: number) => FIG.left + (fx / 120) * FIG.width;
const toY = (fy: number) => FIG.top + (fy / 220) * FIG.height;

const LAYOUT: Record<BodySlot, { side: "left" | "right"; top: number; anchor: [number, number] }> = {
  cabeca: { side: "left", top: 10, anchor: [60, 19] },
  acessorio: { side: "right", top: 13, anchor: [60, 38] },
  torso: { side: "right", top: 33, anchor: [72, 80] },
  mao_direita: { side: "left", top: 57, anchor: [28, 134] },
  mao_esquerda: { side: "right", top: 60, anchor: [92, 134] },
  pernas: { side: "left", top: 74, anchor: [50, 150] },
  pe_direito: { side: "left", top: 92, anchor: [46, 207] },
  pe_esquerdo: { side: "right", top: 92, anchor: [74, 207] },
};

export const DRAG_MIME = "application/x-mesa-item";
const SILHOUETTE_SRC = `${import.meta.env.BASE_URL}references/equipment-silhouette.png`;

/**
 * Equipment silhouette from the supplied reference. The image remains a
 * purely visual layer: slot cards and their anchors stay separate so drag/drop
 * hit targets never depend on the artwork's pixels.
 */
function Humanoid({ equipped, hover }: { equipped: Set<BodySlot>; hover: BodySlot | null }) {
  const active = equipped.size > 0 || hover !== null;
  return (
    <div className="relative h-full w-full" aria-hidden="true">
      <div className="absolute inset-[4%] rounded-full bg-primary/10 blur-2xl" />
      <img
        src={SILHOUETTE_SRC}
        alt=""
        className={cn("relative left-1/2 h-full w-auto max-w-none -translate-x-1/2 object-contain equipment-silhouette", active && "is-active")}
        draggable={false}
      />
    </div>
  );
}


type Props = {
  items: InventoryItem[];
  canEquip: boolean;
  onEquip: (itemId: number, slot: BodySlot) => void;
  onUnequip: (itemId: number) => void;
};

export function BodyFigure({ items, canEquip, onEquip, onUnequip }: Props) {
  const [hover, setHover] = useState<BodySlot | null>(null);
  const [rejected, setRejected] = useState<BodySlot | null>(null);
  const equipped = new Map<BodySlot, InventoryItem>();
  for (const it of items) if (it.equippedSlot) equipped.set(it.equippedSlot, it);

  function handleDrop(slot: BodySlot, e: DragEvent) {
    e.preventDefault();
    setHover(null);
    const id = Number(e.dataTransfer.getData(DRAG_MIME));
    const item = items.find((i) => i.id === id);
    if (!item?.equipment) return;
    if (!slotAccepts(item.equipment.category, slot)) {
      setRejected(slot);
      window.setTimeout(() => setRejected(null), 320);
      const label = BODY_SLOTS.find((s) => s.key === slot)?.label ?? slot;
      toast.error(`${item.name} não pode ser usado em "${label}". Encaixe correto: ${CATEGORY[item.equipment.category].where}.`);
      return;
    }
    onEquip(item.id, slot);
  }

  const card = (slotKey: BodySlot, className?: string) => {
    const slot = BODY_SLOTS.find((s) => s.key === slotKey)!;
    const item = equipped.get(slotKey);
    const rarity = item?.equipment ? RARITY[item.equipment.rarity] : null;
    const side = LAYOUT[slotKey].side;
    return (
      <div
        key={slotKey}
        onDragOver={canEquip ? (e) => { e.preventDefault(); setHover(slotKey); } : undefined}
        onDragLeave={canEquip ? () => setHover((h) => (h === slotKey ? null : h)) : undefined}
        onDrop={canEquip ? (e) => handleDrop(slotKey, e) : undefined}
        title={item?.equipment ? [item.equipment.description, formatModifiers(item.equipment.modifiers)].filter(Boolean).join(" — ") : undefined}
        className={cn(
          "group relative flex min-h-16 items-center gap-3 rounded-lg px-3 py-2 shadow-border transition-[background-color,box-shadow] duration-150",
          side === "right" && "sm:flex-row-reverse sm:text-right",
          item ? cn("bg-elevated ring-1", rarity?.ring, rarity?.glow) : "border border-dashed border-border bg-surface/80",
          hover === slotKey && "bg-elevated ring-2 ring-ring",
          rejected === slotKey && "animate-slot-reject ring-2 ring-hp-bright",
          className,
        )}
      >
        <span className={cn("grid size-12 shrink-0 place-items-center rounded-md", item ? "bg-bg/50" : "bg-bg/30 opacity-40")}>
          <GameIcon
            name={item?.equipment?.icon ?? slot.icon}
            className="size-10"
            rarity={item ? rarity?.key : undefined}
            muted={!item}
          />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-muted uppercase">{slot.label}</p>
          <p className={cn("truncate text-sm leading-tight", item ? cn("font-medium", rarity?.text) : "text-xs italic text-subtle")}>
            {item ? item.name : canEquip ? "arraste aqui" : "vazio"}
          </p>
        </div>
        {item && canEquip ? (
          <button
            type="button"
            onClick={() => onUnequip(item.id)}
            aria-label={`Desequipar ${item.name}`}
            className="grid size-7 shrink-0 place-items-center rounded-md text-muted opacity-70 hover:bg-surface hover:text-fg hover:opacity-100"
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>
    );
  };

  return (
    <div className="grid gap-4">
      {/* Desktop / tablet: slots anchored to the body */}
      <div className="relative mx-auto hidden aspect-[131/100] w-full max-w-[760px] rounded-xl bg-bg/40 shadow-border sm:block">
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {BODY_SLOTS.map((s) => {
            const l = LAYOUT[s.key];
            const x1 = l.side === "left" ? 27.5 : 72.5;
            const x2 = toX(l.anchor[0]);
            const y2 = toY(l.anchor[1]);
            const on = equipped.has(s.key) || hover === s.key;
            return (
              <g key={s.key}>
                <polyline
                  points={`${x1},${l.top} ${x1 + (l.side === "left" ? 2 : -2)},${l.top} ${x2},${y2}`}
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                  strokeWidth={on ? 1.4 : 1}
                  strokeDasharray={on ? undefined : "3 3"}
                  className={on ? "stroke-ring/70" : "stroke-muted/30"}
                />
                <circle cx={x2} cy={y2} r="0.7" className={on ? "fill-ring" : "fill-muted/40"} />
              </g>
            );
          })}
        </svg>
        <div
          className="absolute"
          style={{ left: `${FIG.left}%`, width: `${FIG.width}%`, top: `${FIG.top}%`, height: `${FIG.height}%` }}
        >
          <Humanoid equipped={new Set(equipped.keys())} hover={hover} />
        </div>
        {BODY_SLOTS.map((s) => {
          const l = LAYOUT[s.key];
          return (
            <div
              key={s.key}
              className={cn("absolute w-[27%] -translate-y-1/2", l.side === "left" ? "left-[0.5%]" : "right-[0.5%]")}
              style={{ top: `${l.top}%` }}
            >
              {card(s.key)}
            </div>
          );
        })}
      </div>

      {/* Mobile: figure + stacked slots */}
      <div className="grid gap-3 sm:hidden">
        <div className="mx-auto h-56 w-32">
          <Humanoid equipped={new Set(equipped.keys())} hover={hover} />
        </div>
        <div className="grid grid-cols-2 gap-2">{BODY_SLOTS.map((s) => card(s.key))}</div>
      </div>
    </div>
  );
}
