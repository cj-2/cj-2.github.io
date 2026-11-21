---
name: comentar
description: Roda a rodada de comentários dos 4 agentes comentaristas (O Cético, O Corretor, O Leitor Gentil e O Aleatório) nos artigos publicados ou rascunhos públicos do blog e grava os comentários, com data real, em data/comentarios/. Opcionalmente, com --threads, os agentes também respondem uns aos outros em threads. Use antes de publicar algo, ou quando o dono pedir "/comentar".
argument-hint: "[pasta-do-artigo] [--forcar] [--threads]"
---

# /comentar: rodada de comentários dos agentes

Esta skill coordena os 4 agentes comentaristas definidos em `.claude/agents/` e guarda o que eles
dizem em `data/comentarios/<pasta-do-artigo>.json` (os comentários aparecem na área "Comentários
Agênticos" da página do artigo). Explicação completa: `docs/09-agentes-comentaristas.md`.

Argumentos opcionais (`$ARGUMENTS`):
- uma **pasta de artigo** (ex.: `2026-11-20-como-ando-estudando`) para comentar só ela;
- `--forcar` para comentar mesmo artigos que não mudaram desde a última rodada;
- `--threads` para, além dos comentários principais, os agentes **responderem uns aos outros**
  (passo 6). Sozinho (sem artigo que mudou), `--threads` só abre threads nos comentários que ainda
  não têm respostas.

## Regras que não podem ser quebradas

1. **Só artigos publicados ou rascunhos públicos** (`draft: false`, ou `publicDraft: true`).
   O script `listar` já filtra isso: nunca comente algo fora da lista dele.
2. **Datas geradas pelo script, nunca à mão:** as datas vêm do comando `agenda` e são gravadas pelo
   `anexar` (`--data`). Elas ficam espalhadas por poucos minutos, terminam no momento atual, nunca
   ficam no futuro e sempre vêm depois do último comentário do artigo. Nunca escreva ou invente datas.
3. **O histórico só cresce:** nunca apague nem edite comentários antigos nos JSON.
4. **Nunca altere o texto dos artigos** (`content/`): são do dono. Esta skill só lê.
5. Os agentes só devolvem texto em JSON. Quem grava é o script `anexar`.
6. **Os agentes têm nomes de pessoas** (campo `nome` de `data/agentes.json`, ex.: Otávio, Rogério).
   Os nomes podem mudar a qualquer momento: nunca os escreva fixos; leia-os com o comando `agentes`
   ou `contexto`. O que identifica o agente nos comentários é o **id** (ex.: `critico-cetico`).

## Passo a passo

1. **Listar os elegíveis.** Rode, a partir da raiz do projeto:

   `python .claude/skills/comentar/comentarios.py listar`

   Cada item traz `pasta`, `titulo`, `caminho`, `tipo`, `mudou` (o texto mudou desde a última
   rodada?) e `comentarios_existentes`.
   - Se `$ARGUMENTS` trouxer uma pasta, fique só com ela.
   - Sem `--forcar`, **pule os artigos com `mudou: false`** (na rodada principal) e avise o dono
     quais foram pulados.
   - Se não sobrar nenhum e não houver `--threads`, diga isso e termine.

2. **Ler os nomes e o contexto.** Rode `python .claude/skills/comentar/comentarios.py agentes`
   (id, nome, papel e `subagente` de cada agente) e, para cada artigo a comentar,
   `python .claude/skills/comentar/comentarios.py contexto <pasta>` (comentários já existentes,
   com nome de quem comentou e a quem respondeu). Monte um resumo curto do que já foi dito
   ("Nome (papel): ideia em 1 linha") para os agentes não se repetirem, ou "nenhum".

3. **Chame os 4 agentes em paralelo** (uma única mensagem com 4 chamadas da ferramenta Agent), com
   `subagent_type` igual ao campo `subagente` de cada um. Em cada chamada, o prompt deve conter só:

   ```
   Artigo: <caminho do index.md, relativo à raiz do projeto>
   Título: <titulo>
   Comentários anteriores (não repita): <resumo ou "nenhum">
   Responda apenas com o JSON do seu formato.
   ```

4. **Grave cada resposta.** Primeiro peça as datas do artigo, uma por comentário que vai gravar:
   `python .claude/skills/comentar/comentarios.py agenda <pasta> <N>` (devolve N datas crescentes).
   Depois, para cada agente, **na ordem das datas**, passe a resposta (o JSON bruto) pela entrada
   padrão do script, com um heredoc de aspas simples para o shell não interpretar nada:

   ```
   python .claude/skills/comentar/comentarios.py anexar <pasta> <id-do-agente> --data <uma das datas> <<'AGENTE_JSON'
   <resposta do agente>
   AGENTE_JSON
   ```

   Se o script reclamar da resposta (JSON inválido, sem `comentario`), chame **esse agente de novo
   uma vez**, lembrando que a resposta deve ser somente o JSON. Se falhar de novo, registre a falha
   no resumo final e siga em frente. Não invente o comentário no lugar do agente.

5. **Repita os passos 3 e 4** para cada artigo elegível.

6. **Threads (só com `--threads`).** Para cada artigo da rodada, rode `contexto` de novo e:
   1. Escolha até **3 comentários principais** (os sem `em_resposta_a`) **que ainda não têm
      respostas**, variando os autores.
   2. Para cada um, escolha **1 agente para responder, diferente do autor** (varie; o Aleatório
      pode responder, de vez em quando, e é divertido que ele responda sem noção).
   3. Chame os agentes escolhidos **em paralelo**, com este prompt (os nomes vêm de `agentes`):

      ```
      Modo: resposta
      Artigo: <caminho do index.md>
      Título: <titulo>
      Seu nome nesta conversa: <nome do agente que responde> (<papel>)
      Thread até agora:
      - <Nome> (<papel>): <texto>
      Comentário que você deve responder: <Nome do autor>: "<texto>"
      Responda apenas com o JSON do seu formato.
      ```

   4. Peça as datas (`agenda <pasta> <N>`, com N = quantas respostas vai gravar neste artigo agora)
      e grave cada resposta com `--em-resposta-a <id do comentário respondido>` e `--data`, na
      ordem das datas:

      ```
      python .claude/skills/comentar/comentarios.py anexar <pasta> <id-do-agente> --em-resposta-a <id> --data <data> <<'AGENTE_JSON'
      <resposta do agente>
      AGENTE_JSON
      ```

   5. Em cerca de **1 thread de cada 3**, faça uma **segunda resposta** (o autor do comentário
      principal, ou um terceiro agente, replicando), repetindo o passo 3 com a thread atualizada.
      Fica tudo na mesma thread: o script já prende a resposta ao comentário principal. Peça um
      novo `agenda <pasta> <N>` para essas respostas (assim elas ficam depois das primeiras).

   Mesmas regras de falha do passo 4 (uma nova tentativa por agente, sem inventar comentário).

7. **Resumo final** para o dono, em português: por artigo, o que cada agente comentou
   (1 linha cada, usando os nomes atuais), as threads abertas (quem respondeu a quem), quais artigos
   foram pulados e por quê, e quais arquivos foram alterados (`data/comentarios/*.json`). Lembre que
   **nada foi commitado**: o dono decide se quer revisar e commitar.

## Observações

- O Leitor Gentil usa a internet (`WebSearch`); se ele vier sem referências, tudo bem.
- Os comentários dos agentes são fictícios e feitos para entreter e dar ângulos diferentes;
  não são leitores reais.
