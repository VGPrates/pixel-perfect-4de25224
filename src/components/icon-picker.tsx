import { useMemo, useRef, useState } from "react";
import { Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { GameIcon, useIconRegistry } from "@/components/game-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  ICON_CATEGORIES,
  ICON_CATEGORY_LABEL,
  createCustomIcon,
  deleteCustomIcon,
  fetchCustomIcons,
  normalizeIconFile,
  type IconCategory,
} from "@/lib/rpg/icons";
import { cn } from "@/lib/utils";

/**
 * Icon picker split in shelves (gear / buffs & debuffs / conditions).
 * The GM can import new art: it is centre-cropped to the standard square
 * canvas so every icon keeps the same weight on screen.
 */
export function IconPicker({
  value,
  onChange,
  defaultCategory = "equipment",
  canImport = true,
}: {
  value: string;
  onChange: (key: string) => void;
  defaultCategory?: IconCategory;
  canImport?: boolean;
}) {
  const icons = useIconRegistry();
  const [tab, setTab] = useState<IconCategory>(defaultCategory);
  const [importing, setImporting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState<IconCategory>(defaultCategory);
  const fileRef = useRef<HTMLInputElement>(null);

  const shelf = useMemo(() => icons.filter((i) => i.category === tab), [icons, tab]);

  async function importIcon() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error("Escolha uma imagem.");
      return;
    }
    if (!label.trim()) {
      toast.error("Dê um nome ao ícone.");
      return;
    }
    setBusy(true);
    try {
      const dataUrl = await normalizeIconFile(file);
      const key = await createCustomIcon({ label: label.trim(), category, dataUrl });
      await fetchCustomIcons();
      setTab(category);
      onChange(key);
      setLabel("");
      if (fileRef.current) fileRef.current.value = "";
      setImporting(false);
      toast.success("Ícone importado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao importar o ícone.");
    } finally {
      setBusy(false);
    }
  }

  async function removeIcon(key: string) {
    setBusy(true);
    try {
      await deleteCustomIcon(key);
      await fetchCustomIcons();
      toast.success("Ícone removido.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao remover o ícone.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-2">
        <Label>Ícone</Label>
        {canImport ? (
          <button
            type="button"
            onClick={() => setImporting((v) => !v)}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted hover:bg-surface hover:text-fg"
          >
            <Upload className="size-3.5" />
            Importar ícone
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-1 rounded-lg bg-surface p-1 shadow-border">
        {ICON_CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setTab(c.key)}
            className={cn(
              "min-h-9 flex-1 rounded-md px-2 text-xs transition-colors duration-150",
              tab === c.key ? "bg-elevated text-fg" : "text-muted hover:text-fg",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="flex items-start gap-2">
        <span className="grid size-14 shrink-0 place-items-center rounded-md bg-bg/50 text-fg ring-1 ring-ring/40">
          <GameIcon name={value} className="size-11" />
        </span>
        <div className="flex flex-1 flex-wrap gap-1.5 rounded-lg bg-bg/30 p-2">
          {shelf.length === 0 ? (
            <p className="px-1 py-2 text-xs text-subtle">Nenhum ícone nesta categoria.</p>
          ) : null}
          {shelf.map((i) => {
            const selected = value === i.key;
            return (
              <span key={i.key} className="relative">
                <button
                  type="button"
                  title={i.label}
                  aria-label={i.label}
                  aria-pressed={selected}
                  onClick={() => onChange(i.key)}
                  className={cn(
                    "grid size-11 place-items-center rounded-md text-muted transition-colors duration-150",
                    selected
                      ? "bg-elevated text-fg ring-2 ring-primary shadow-[0_0_12px_-4px_var(--color-primary)]"
                      : "ring-1 ring-border/60 hover:bg-surface hover:text-fg",
                  )}
                >
                  <GameIcon name={i.key} className="size-8" />
                </button>
                {i.custom && canImport ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void removeIcon(i.key)}
                    aria-label={`Excluir ícone ${i.label}`}
                    className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-elevated text-muted shadow-border hover:text-hp-bright"
                  >
                    <Trash2 className="size-3" />
                  </button>
                ) : null}
              </span>
            );
          })}
        </div>
      </div>

      {importing && canImport ? (
        <div className="grid gap-2 rounded-lg bg-surface p-3 shadow-border">
          <p className="text-xs text-subtle">
            A imagem é recortada no centro e ajustada ao tamanho padrão dos ícones, sem deformar.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="icon-import-label">Nome do ícone</Label>
              <Input
                id="icon-import-label"
                value={label}
                maxLength={40}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ex.: Lança élfica"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="icon-import-cat">Categoria</Label>
              <Select
                id="icon-import-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value as IconCategory)}
              >
                {ICON_CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {ICON_CATEGORY_LABEL[c.key]}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="text-xs text-muted file:mr-3 file:rounded-md file:border-0 file:bg-elevated file:px-3 file:py-2 file:text-xs file:text-fg"
          />
          <div className="flex gap-2">
            <Button type="button" onClick={() => void importIcon()} disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              Importar
            </Button>
            <Button type="button" variant="ghost" onClick={() => setImporting(false)} disabled={busy}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
