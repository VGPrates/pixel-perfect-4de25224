# Ícones mais rápidos e gerenciamento

## O que será melhorado
- Tornar a seleção instantânea, mantendo a moldura do item escolhido sem esperar sincronizações ou carregamentos externos.
- Exibir um carregamento discreto e coerente com a estética medieval apenas enquanto cada imagem ainda não estiver pronta.
- Reduzir o peso dos novos ícones importados sem deformá-los, usando enquadramento quadrado e compressão adequada.
- Substituir as pequenas lixeiras misturadas à grade por uma opção clara **Gerenciar ícones**.
- Dentro do gerenciamento, listar somente ícones importados pelo Mestre, separados por categoria, com ação **Excluir** e confirmação antes da remoção.
- Atualizar a lista imediatamente após importar ou excluir; em caso de erro, restaurar o estado e avisar o Mestre.

## Limites
- Ícones originais do sistema não poderão ser excluídos.
- Nenhuma outra parte do layout ou das regras do RPG será alterada.

## Detalhes técnicos
- Atualização otimista do registro local para eliminar esperas visuais.
- Cache e busca por chave para evitar varreduras repetidas da lista em cada renderização.
- Estado individual de carregamento por imagem, com transição curta e respeito à redução de movimento.
- Confirmação de exclusão usando os componentes visuais já existentes no projeto.
