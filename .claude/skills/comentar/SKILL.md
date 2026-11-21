---
name: comentar
description: Roda a rodada de comentários dos 4 agentes comentaristas (O Cético, O Corretor, O Leitor Gentil e O Aleatório) nos artigos publicados ou rascunhos públicos do blog e grava os comentários, com data real, em data/comentarios/. Use antes de publicar algo, ou quando o dono pedir "/comentar".
argument-hint: "[pasta-do-artigo] [--forcar]"
---

# /comentar: rodada de comentários dos agentes

Esta skill coordena os 4 agentes comentaristas definidos em `.claude/agents/` e guarda o que eles
dizem em `data/comentarios/<pasta-do-artigo>.json` (os comentários aparecem na página do artigo).
Explicação completa: `docs/09-agentes-comentaristas.md`.

Argumentos opcionais (`$ARGUMENTS`):
- uma **pasta de artigo** (ex.: `2026-11-20-como-ando-estudando`) para comentar só ela;
- `--forcar` para comentar mesmo artigos que não mudaram desde a última rodada.

## Regras que não podem ser quebradas

1. **Só artigos publicados ou rascunhos públicos** (`draft: false`, ou `publicDraft: true`).
   O script `listar` já filtra isso: nunca comente algo fora da lista dele.
2. **Datas reais:** quem coloca a data é o script `anexar`, a partir do relógio do computador no
   momento da gravação. Nunca escreva datas à mão nem copie de outro lugar.
3. **O histórico só cresce:** nunca apague nem edite comentários antigos nos JSON.
4. **Nunca altere o texto dos artigos** (`content/`): são do dono. Esta skill só lê.
5. Os agentes só devolvem texto em JSON. Quem grava é o script `anexar`.

## Passo a passo

1. **Listar os elegíveis.** Rode, a partir da raiz do projeto:

   `python .claude/skills/comentar/comentarios.py listar`

   Cada item traz `pasta`, `titulo`, `caminho`, `tipo`, `mudou` (o texto mudou desde a última
   rodada?) e `comentarios_existentes`.
   - Se `$ARGUMENTS` trouxer uma pasta, fique só com ela.
   - Sem `--forcar`, **pule os artigos com `mudou: false`** e avise o dono quais foram pulados.
   - Se não sobrar nenhum, diga isso e termine.

2. **Para cada artigo a comentar**, junte o contexto: leia `data/comentarios/<pasta>.json`
   (se existir) e monte um resumo curto dos comentários anteriores (quem disse o quê em 1 linha)
   para os agentes não se repetirem. Se não houver comentários anteriores, diga "nenhum".

3. **Chame os 4 agentes em paralelo** (uma única mensagem com 4 chamadas da ferramenta Agent), com
   `subagent_type` igual a `critico-cetico`, `corretor`, `leitor-gentil` e `comentarista-aleatorio`.
   Em cada chamada, o prompt deve conter só estes dados:

   ```
   Artigo: <caminho do index.md, relativo à raiz do projeto>
   Título: <titulo>
   Comentários anteriores (não repita): <resumo ou "nenhum">
   Responda apenas com o JSON do seu formato.
   ```

4. **Grave cada resposta.** Para cada agente, passe a resposta (o JSON bruto) pela entrada padrão
   do script, usando um heredoc com aspas simples para o shell não interpretar nada:

   ```
   python .claude/skills/comentar/comentarios.py anexar <pasta> <agente> <<'AGENTE_JSON'
   <resposta do agente>
   AGENTE_JSON
   ```

   Se o script reclamar da resposta (JSON inválido, sem `comentario`), chame **esse agente de novo
   uma vez**, lembrando que a resposta deve ser somente o JSON. Se falhar de novo, registre a falha
   no resumo final e siga em frente. Não invente o comentário no lugar do agente.

5. **Resumo final** para o dono, em português: por artigo, o que cada agente comentou
   (1 linha cada), quais artigos foram pulados e por quê, e quais arquivos foram alterados
   (`data/comentarios/*.json`). Lembre que **nada foi commitado**: o dono decide se quer revisar
   e commitar.

## Observações

- O Leitor Gentil usa a internet (`WebSearch`); se ele vier sem referências, tudo bem.
- Os comentários dos agentes são fictícios e feitos para entreter e dar ângulos diferentes;
  não são leitores reais.
