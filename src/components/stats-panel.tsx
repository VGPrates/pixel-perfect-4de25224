import { useEffect, useState } from "react";
import { STATS } from "@/lib/rpg/constants";
import type { StatBreakdown } from "@/lib/rpg/stats";
import type { Character, StatKey } from "@/lib/rpg/types";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { ValueStepper } from "@/components/value-stepper";

type Alloc = Record<StatKey, number>;
const EMPTY: Alloc = { strength: 0, agility: 0, resistance: 0, intelligence: 0, presence: 0 };

/**
 * Attributes list. When `canSpend`, points are staged locally and only saved
 * after the player confirms the whole distribution.
 */
export function StatsPanel({
  character,
  stats,
  canSpend,
  pending,
  onConfirm,
}: {
  character: Character;
  stats: StatBreakdown;
  canSpend: boolean;
  pending?: boolean;
  onConfirm: (alloc: Partial<Alloc>) => Promise<unknown> | void;
}) {
  const [alloc, setAlloc] = useState<Alloc>(EMPTY);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const staged = Object.values(alloc).reduce((a, b) => a + b, 0);
  const left = character.unspentPoints - staged;

  // Server state changed (e.g. GM correction) → drop stale staging.
  useEffect(() => setAlloc(EMPTY), [character.updatedAt]);

  const bump = (k: StatKey, d: number) =>
    setAlloc((a) => ({ ...a, [k]: Math.max(0, a[k] + d) }));

  return (
    <div className="grid gap-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-lg">Atributos</h3>
          <p className="text-sm text-muted">Base · bônus de itens e efeitos.</p>
        </div>
        <p className="text-right">
          <span className="block text-xs tracking-wide text-muted uppercase">Pontos</span>
          <span className="font-display text-2xl tabular-nums leading-none">
            {canSpend && staged > 0 ? left : character.unspentPoints}
          </span>
        </p>
      </div>
      <ul className="grid gap-2">
        {STATS.map((stat) => {
          const s = stats[stat.key];
          const add = alloc[stat.key];
          return (
            <li
              key={stat.key}
              className={cn(
                "flex items-center gap-3 rounded-lg bg-elevated px-3 py-2.5 shadow-border transition-shadow",
                add > 0 && "ring-1 ring-ring/40",
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium leading-tight">{stat.label}</p>
                <p className="truncate text-xs text-subtle">{stat.hint}</p>
              </div>
              <div className="text-right">
                <span className="font-display text-xl tabular-nums">
                  {s.total + add}
                </span>
                <span className="block text-[11px] tabular-nums text-subtle">
                  {s.base}
                  {add > 0 ? <span className="text-ring"> +{add}</span> : null}
                  {s.bonus !== 0 ? (
                    <span className={s.bonus > 0 ? "text-stamina-bright" : "text-hp-bright"}>
                      {" "}
                      {s.bonus > 0 ? `+${s.bonus}` : s.bonus}
                    </span>
                  ) : null}
                </span>
              </div>
              {canSpend && character.unspentPoints > 0 ? (
                <ValueStepper
                  value={add}
                  min={0}
                  max={add + left}
                  disabled={pending}
                  ariaLabel={`ponto de ${stat.label}`}
                  onChange={(next) => bump(stat.key, next - add)}
                />
              ) : null}
            </li>
          );
        })}
      </ul>
      {canSpend && staged > 0 ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" className="flex-1" disabled={pending} onClick={() => setConfirmOpen(true)}>
            Confirmar distribuição ({staged})
          </Button>
          <Button type="button" variant="ghost" disabled={pending} onClick={() => setAlloc(EMPTY)}>
            Desfazer
          </Button>
        </div>
      ) : null}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="border-border bg-surface text-fg">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Deseja confirmar a sua distribuição?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted">
              Depois de confirmada, só o Mestre poderá corrigi-la.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ul className="grid gap-1 text-sm">
            {STATS.filter((s) => alloc[s.key] > 0).map((s) => (
              <li key={s.key} className="flex justify-between rounded-md bg-elevated px-3 py-1.5">
                <span>{s.label}</span>
                <span className="tabular-nums">
                  {character[s.key]} → <strong>{character[s.key] + alloc[s.key]}</strong>
                </span>
              </li>
            ))}
          </ul>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-border bg-transparent text-fg hover:bg-elevated"
              onClick={() => setAlloc(EMPTY)}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-primary text-primary-fg hover:bg-primary/90"
              onClick={async () => {
                const payload = { ...alloc };
                await onConfirm(payload);
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/** GM-only: rewrite base attributes and unspent points, showing the diff. */
export function GmStatsEditor({
  character,
  pending,
  onSave,
}: {
  character: Character;
  pending?: boolean;
  onSave: (v: Alloc & { unspent: number }) => void;
}) {
  const original = {
    strength: character.strength,
    agility: character.agility,
    resistance: character.resistance,
    intelligence: character.intelligence,
    presence: character.presence,
    unspent: character.unspentPoints,
  };
  const [v, setV] = useState(original);
  useEffect(() => setV(original), [character.updatedAt]); // eslint-disable-line react-hooks/exhaustive-deps
  const rows = [...STATS.map((s) => ({ key: s.key, label: s.label })), { key: "unspent" as const, label: "Pontos livres" }];
  const changed = rows.filter((r) => v[r.key] !== original[r.key]);

  return (
    <div className="grid gap-3">
      <div>
        <h3 className="font-display text-lg">Corrigir distribuição</h3>
        <p className="text-sm text-muted">Somente o Mestre. As mudanças ficam destacadas antes de salvar.</p>
      </div>
      <ul className="grid gap-1.5">
        {rows.map((r) => {
          const diff = v[r.key] - original[r.key];
          return (
            <li
              key={r.key}
              className={cn(
                "flex items-center gap-2 rounded-lg bg-elevated px-3 py-1.5 shadow-border",
                diff !== 0 && "ring-1 ring-ring/50",
              )}
            >
              <span className="flex-1 text-sm">{r.label}</span>
              <span className="w-8 text-right text-xs tabular-nums text-subtle">{original[r.key]}</span>
              <span className="text-subtle">→</span>
              <ValueStepper
                value={v[r.key]}
                min={0}
                disabled={pending}
                compact
                ariaLabel={r.label}
                onChange={(next) => setV((x) => ({ ...x, [r.key]: next }))}
              />
              <span className={cn("w-9 text-right text-xs tabular-nums", diff > 0 ? "text-stamina-bright" : diff < 0 ? "text-hp-bright" : "text-transparent")}>
                {diff > 0 ? `+${diff}` : diff}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="flex gap-2">
        <Button type="button" variant="secondary" className="flex-1" disabled={pending || changed.length === 0} onClick={() => onSave(v)}>
          Salvar correção{changed.length ? ` (${changed.length})` : ""}
        </Button>
        <Button type="button" variant="ghost" disabled={changed.length === 0} onClick={() => setV(original)}>
          Descartar
        </Button>
      </div>
    </div>
  );
}
