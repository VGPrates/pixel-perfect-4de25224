<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Auth: login/cadastro em `src/routes/login.tsx`; cada página (/painel, /mestre, /onboarding) redireciona para /login sem sessão. Dados do RPG via `src/lib/rpg/api.ts` direto no banco com RLS + funções RPC.
- Ícones: catálogo único em `src/lib/rpg/icons.ts` (embutidos por categoria: equipment/effect/condition) + ícones importados pelo Mestre na tabela `custom_icons` (arte aparada pela transparência, centralizada com margem em tela 256x256 e salva como data URL WebP comprimida). O registro usa mapas por chave e mutações otimistas; `GameIcon` observa apenas a origem resolvida e o seletor/gerenciador é `src/components/icon-picker.tsx`. Motivo: seleção imediata, escala visual consistente e uma só fonte de verdade sem re-renderizações amplas.
