import { useState, type FormEvent } from "react";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/rpg/hooks";
import { APP_NAME } from "@/lib/rpg/constants";
import { LoadingScreen } from "@/components/app-chrome";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { mode?: "signup" } =>
    search["mode"] === "signup" ? { mode: "signup" } : {},
  head: () => ({
    meta: [
      { title: "Entrar — RPG Fallen Gods" },
      { name: "description", content: "Entre ou crie sua conta para participar da mesa." },
      { property: "og:title", content: "Entrar — RPG Fallen Gods" },
      { property: "og:description", content: "Entre ou crie sua conta para participar da mesa." },
    ],
  }),
  component: Login,
});

function Login() {
  const { user, isPending } = useSession();
  const search = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode === "signup" ? "signup" : "signin");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (isPending) return <LoadingScreen />;
  if (user) return <Navigate to="/" />;

  async function onEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "");
    try {
      if (false) {
        throw new Error("O Supabase ainda não foi configurado neste ambiente.");
      }
      if (mode === "signup") {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name }, emailRedirectTo: window.location.origin },
        });
        if (err) throw err;
        if (!data.session) {
          setInfo("Conta criada! Agora é só entrar.");
          setBusy(false);
          return;
        }
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw new Error("Email ou senha inválidos.");
      }
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no acesso.");
      setBusy(false);
    }
  }

  async function onGoogle() {
    setError(null);
    if (false) {
      setError("O Supabase ainda não foi configurado neste ambiente.");
      return;
    }
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (err) {
      setError("Não foi possível entrar com o Google.");
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <CardHeader className="mb-6">
          <p className="text-xs tracking-[0.24em] text-muted uppercase">{APP_NAME}</p>
          <CardTitle className="text-2xl">{mode === "signin" ? "Entrar na mesa" : "Criar conta"}</CardTitle>
          <CardDescription>Mestre ou jogador — o papel se escolhe depois do primeiro acesso.</CardDescription>
        </CardHeader>

        <div className="grid gap-6">
          <Button type="button" variant="outline" onClick={onGoogle}>
            Continuar com Google
          </Button>
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs tracking-wide text-subtle uppercase">ou email</span>
            <Separator className="flex-1" />
          </div>
          <form className="grid gap-3" onSubmit={onEmail}>
            {mode === "signup" ? (
              <div className="grid gap-1.5">
                <Label htmlFor="name">Seu nome</Label>
                <Input id="name" name="name" required autoComplete="name" />
              </div>
            ) : null}
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" name="password" type="password" required minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} />
            </div>
            {error ? <p className="text-sm text-hp-bright">{error}</p> : null}
            {info ? <p className="text-sm text-stamina-bright">{info}</p> : null}
            <Button type="submit" disabled={busy}>
              {busy ? "Aguarde..." : mode === "signin" ? "Entrar" : "Cadastrar"}
            </Button>
          </form>
          {mode === "signin" ? (
            <Link
              to="/recuperar-senha"
              className="text-center text-sm text-muted underline-offset-4 hover:text-fg hover:underline"
            >
              Esqueci minha senha
            </Link>
          ) : null}

          <button
            type="button"
            className="text-sm text-muted underline-offset-4 hover:text-fg hover:underline"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setInfo(null);
            }}
          >
            {mode === "signin" ? "Não tem conta? Cadastre-se" : "Já tem conta? Entre"}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-subtle">
          <Link to="/" className="underline-offset-4 hover:text-fg hover:underline">
            Voltar
          </Link>
        </p>
      </Card>
    </main>
  );
}
