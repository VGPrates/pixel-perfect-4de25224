import { useState } from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/app-chrome";
import { CharacterForm } from "@/components/character-form";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRpgState, useSession } from "@/lib/rpg/hooks";
import { chooseRole } from "@/lib/rpg/api";
import type { CharacterDraft, Role } from "@/lib/rpg/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Escolha seu papel — RPG Fallen Gods" },
      { name: "description", content: "Mestre ou jogador: escolha seu lugar na mesa e crie sua ficha." },
      { property: "og:title", content: "Escolha seu papel — RPG Fallen Gods" },
      { property: "og:description", content: "Mestre ou jogador: escolha seu lugar na mesa e crie sua ficha." },
    ],
  }),
  component: Onboarding,
});

function Onboarding() {
  const { user, isPending: authPending } = useSession();
  const { data, isPending } = useRpgState(!!user);
  const [role, setRole] = useState<Role | null>(null);
  const queryClient = useQueryClient();

  const createMut = useMutation({
    mutationFn: (payload: {
      role: Role;
      displayName?: string;
      character?: CharacterDraft;
    }) => chooseRole(payload.role, payload.displayName ?? "", payload.character),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["rpg-state"] });
      window.location.href = "/";
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (authPending || (user && isPending)) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" />;
  if (data?.profile) {
    return <Navigate to={data.profile.role === "gm" ? "/mestre" : "/painel"} />;
  }

  return (
    <main className="mx-auto grid min-h-dvh max-w-2xl place-items-center px-4 py-10">
      <Card className="w-full p-6 sm:p-8">
        <CardHeader>
          <p className="text-xs tracking-[0.24em] text-muted uppercase">Primeiro passo</p>
          <CardTitle className="text-2xl">Quem é você nesta mesa?</CardTitle>
          <CardDescription>
            O mestre vê todas as fichas. O jogador cria uma só — a sua — e vive por ela.
          </CardDescription>
        </CardHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <RoleCard
            title="Mestre da Mesa"
            body="Conduz a campanha, altera vida e mana, entrega itens e concede pontos."
            selected={role === "gm"}
            onSelect={() => setRole("gm")}
          />
          <RoleCard
            title="Jogador"
            body="Preenche a ficha, gira o D20, cuida do inventário e gasta os pontos recebidos."
            selected={role === "player"}
            onSelect={() => setRole("player")}
          />
        </div>

        {role === "gm" ? (
          <div className="mt-6">
            <Button
              type="button"
              disabled={createMut.isPending}
              onClick={() =>
                createMut.mutate({
                  role: "gm",
                  displayName: (user.user_metadata?.["name"] as string | undefined) ?? user.email ?? "Mestre",
                })
              }
            >
              {createMut.isPending ? "Abrindo a mesa..." : "Assumir o manto"}
            </Button>
          </div>
        ) : null}

        {role === "player" ? (
          <div className="mt-6 grid gap-4">
            <h2 className="font-display text-xl">Sua ficha</h2>
            <CharacterForm
              submitLabel="Entrar no painel"
              pending={createMut.isPending}
              onSubmit={(draft) =>
                createMut.mutate({
                  role: "player",
                  displayName: (user.user_metadata?.["name"] as string | undefined) ?? draft.name,
                  character: draft,
                })
              }
            />
          </div>
        ) : null}
      </Card>
    </main>
  );
}

function RoleCard({
  title,
  body,
  selected,
  onSelect,
}: {
  title: string;
  body: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "rounded-xl bg-elevated p-4 text-left shadow-border transition-[box-shadow,background-color] duration-150",
        selected ? "shadow-border-hover ring-1 ring-ring/40" : "hover:shadow-border-hover",
      )}
    >
      <p className="font-display text-lg">{title}</p>
      <p className="mt-1 text-sm text-muted">{body}</p>
    </button>
  );
}
