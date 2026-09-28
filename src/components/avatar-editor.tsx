import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { updateMyAvatar } from "@/lib/rpg/api";
import type { Profile } from "@/lib/rpg/types";
import { cn } from "@/lib/utils";

const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];
const MAX_INPUT_BYTES = 5 * 1024 * 1024; // 5 MB antes do redimensionamento
const OUTPUT_SIZE = 256;

/** Reads an image file, center-crops it square and resizes to 256px JPEG. */
async function fileToAvatarDataUrl(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Não foi possível ler a imagem."));
      el.src = url;
    });
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - side) / 2;
    const sy = (img.naturalHeight - side) / 2;
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Seu navegador não suporta o recorte da imagem.");
    ctx.drawImage(img, sx, sy, side, side, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    return canvas.toDataURL("image/jpeg", 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function ProfileAvatar({
  profile,
  size = "md",
  className,
}: {
  profile: Pick<Profile, "avatarUrl" | "displayName">;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dims = size === "lg" ? "size-16 text-xl" : size === "sm" ? "size-8 text-sm" : "size-10 text-base";
  const initial = (profile.displayName ?? "?").trim().charAt(0).toUpperCase() || "?";
  return profile.avatarUrl ? (
    <img
      src={profile.avatarUrl}
      alt={profile.displayName ? `Foto de ${profile.displayName}` : "Foto de perfil"}
      className={cn("shrink-0 rounded-full object-cover shadow-border", dims, className)}
    />
  ) : (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-elevated font-display text-muted shadow-border",
        dims,
        className,
      )}
    >
      {initial}
    </span>
  );
}

/** Header avatar: click to add/change the photo; menu to remove it. */
export function AvatarEditor({ profile }: { profile: Profile }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const mut = useMutation({
    mutationFn: (avatar: string | null) => updateMyAvatar(avatar),
    onSuccess: (_res, avatar) => {
      toast.success(avatar ? "Foto de perfil atualizada." : "Foto de perfil removida.");
      void queryClient.invalidateQueries({ queryKey: ["rpg-state"] });
      setOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      toast.error("Formato não suportado. Use PNG, JPG ou WEBP.");
      return;
    }
    if (file.size > MAX_INPUT_BYTES) {
      toast.error("A imagem deve ter no máximo 5 MB.");
      return;
    }
    try {
      mut.mutate(await fileToAvatarDataUrl(file));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao processar a imagem.");
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={mut.isPending}
        aria-label="Foto de perfil"
        className="group relative block rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        <ProfileAvatar profile={profile} size="sm" className={mut.isPending ? "animate-pulse" : ""} />
        <span className="absolute -right-1 -bottom-1 grid size-4 place-items-center rounded-full bg-primary text-primary-fg shadow-border">
          <Camera className="size-2.5" />
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="hidden"
        onChange={(e) => {
          void onFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {open ? (
        <div className="absolute right-0 z-30 mt-2 grid w-52 gap-1 rounded-lg bg-elevated p-1.5 shadow-border">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex min-h-10 items-center gap-2 rounded-md px-2.5 text-left text-sm text-fg hover:bg-surface"
          >
            <Upload className="size-4 text-muted" />
            {profile.avatarUrl ? "Trocar foto" : "Adicionar foto"}
          </button>
          {profile.avatarUrl ? (
            <button
              type="button"
              onClick={() => mut.mutate(null)}
              className="flex min-h-10 items-center gap-2 rounded-md px-2.5 text-left text-sm text-fg hover:bg-surface"
            >
              <Trash2 className="size-4 text-muted" />
              Remover foto
            </button>
          ) : null}
          <p className="px-2.5 pt-1 pb-0.5 text-xs text-subtle">PNG, JPG ou WEBP · até 5 MB</p>
        </div>
      ) : null}
    </div>
  );
}
