import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { APP_NAME } from "@/lib/rpg/constants";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/recuperar-senha")({
  head: () => ({
    meta: [
      { title: "Recuperar senha — RPG Fallen Gods" },
      { name: "description", content: "Recupere o acesso à sua conta e defina uma nova senha." },
      { property: "og:title", content: "Recuperar senha — RPG Fallen Gods" },
      { property: "og:description", content: "Recupere o acesso à sua conta e defina uma nova senha." },
    ],
  }),
  component: RecoverPassword,
});

type Step = "email" | "code" | "password";

function RecoverPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Quem chega pelo link do email já vem com a sessão de recuperação pronta.
  useEffect(() => {
    if (false) {
      setError("O Supabase ainda não foi configurado neste ambiente.");
      return;
    }
    let alive = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (alive && data.session) setStep("password");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setStep("password");
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function onSendCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    if (false) {
      setError("O Supabase ainda não foi configurado neste ambiente.");
      return;
    }
    setBusy(true);
    const address = email.trim().toLowerCase();
    // Nunca revelamos se o email existe: a mensagem é sempre a mesma.
    await supabase.auth.resetPasswordForEmail(address, {
      redirectTo: `${window.location.origin}/recuperar-senha`,
    });
    setBusy(false);
    setInfo("Se existir uma conta com este email, enviamos as instruções de recuperação. Verifique também o lixo eletrônico.");
    setStep("code");
  }

  async function onVerifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (false) {
      setError("O Supabase ainda não foi configurado neste ambiente.");
      return;
    }
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const token = String(form.get("token") ?? "").replace(/\s+/g, "");
    const { error: err } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token,
      type: "recovery",
    });
    setBusy(false);
    if (err) {
      setError("Código inválido, já utilizado ou expirado. Peça um novo código.");
      return;
    }
    setInfo(null);
    setStep("password");
  }

  async function onNewPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (false) {
      setError("O Supabase ainda não foi configurado neste ambiente.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    if (password.length < 8) {
      setError("A nova senha precisa ter ao menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não são iguais.");
      return;
    }
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) {
      setBusy(false);
      setError("Não foi possível trocar a senha. Reinicie a recuperação.");
      return;
    }
    await supabase.auth.signOut();
    setBusy(false);
    void navigate({ to: "/login", search: {} });
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <CardHeader className="mb-6">
          <p className="text-xs tracking-[0.24em] text-muted uppercase">{APP_NAME}</p>
          <CardTitle className="text-2xl">
            {step === "password" ? "Defina a nova senha" : "Esqueci minha senha"}
          </CardTitle>
          <CardDescription>
            {step === "email"
              ? "Informe o email da sua conta para receber o código de recuperação."
              : step === "code"
                ? "Digite o código que chegou no seu email, ou abra o link da mensagem."
                : "Escolha uma nova senha. A senha antiga deixa de funcionar."}
          </CardDescription>
        </CardHeader>

        <div className="grid gap-4">
          {step === "email" ? (
            <form className="grid gap-3" onSubmit={onSendCode}>
              <div className="grid gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {error ? <p className="text-sm text-hp-bright">{error}</p> : null}
              <Button type="submit" disabled={busy}>
                {busy ? "Enviando..." : "Enviar código"}
              </Button>
            </form>
          ) : null}

          {step === "code" ? (
            <form className="grid gap-3" onSubmit={onVerifyCode}>
              {info ? <p className="text-sm text-stamina-bright">{info}</p> : null}
              <div className="grid gap-1.5">
                <Label htmlFor="token">Código de recuperação</Label>
                <Input
                  id="token"
                  name="token"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={10}
                  required
                  placeholder="000000"
                />
              </div>
              {error ? <p className="text-sm text-hp-bright">{error}</p> : null}
              <Button type="submit" disabled={busy}>
                {busy ? "Validando..." : "Validar código"}
              </Button>
              <button
                type="button"
                className="text-sm text-muted underline-offset-4 hover:text-fg hover:underline"
                onClick={() => {
                  setStep("email");
                  setError(null);
                  setInfo(null);
                }}
              >
                Usar outro email ou pedir novo código
              </button>
            </form>
          ) : null}

          {step === "password" ? (
            <form className="grid gap-3" onSubmit={onNewPassword}>
              <div className="grid gap-1.5">
                <Label htmlFor="password">Nova senha</Label>
                <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="confirm">Repita a nova senha</Label>
                <Input id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" />
              </div>
              {error ? <p className="text-sm text-hp-bright">{error}</p> : null}
              <Button type="submit" disabled={busy}>
                {busy ? "Salvando..." : "Salvar nova senha"}
              </Button>
            </form>
          ) : null}
        </div>

        <p className="mt-6 text-center text-sm text-subtle">
          <Link to="/login" className="underline-offset-4 hover:text-fg hover:underline">
            Voltar para o login
          </Link>
        </p>
      </Card>
    </main>
  );
}
