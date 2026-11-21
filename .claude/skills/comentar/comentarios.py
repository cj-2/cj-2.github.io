#!/usr/bin/env python3
"""Ajudante da skill /comentar (somente biblioteca padrão do Python).

Comandos (rode a partir da raiz do projeto):

  python .claude/skills/comentar/comentarios.py listar
      Lista os artigos elegíveis (publicados ou rascunhos públicos) em JSON, com o hash da
      versão atual do texto e se ele mudou desde a última rodada de comentários.

  python .claude/skills/comentar/comentarios.py agenda <pasta-do-artigo> <N>
      Gera N datas ISO crescentes para os próximos N comentários do artigo: espalhadas por poucos
      minutos (1 a 3 por comentário), terminando no momento atual. Nunca no futuro e sempre
      depois do último comentário que o artigo já tem. Evita que tudo fique "ao mesmo tempo".

  python .claude/skills/comentar/comentarios.py anexar <pasta-do-artigo> <agente> [--em-resposta-a <id>] [--data <ISO>]
      Lê da entrada padrão o JSON que o agente devolveu, valida e ACRESCENTA o comentário em
      data/comentarios/<pasta-do-artigo>.json. Nunca apaga nada. Sem --data, usa o momento atual;
      com --data (uma das datas do comando "agenda"), usa essa data, desde que não seja futura nem
      anterior ao último comentário do artigo.
      Com --em-resposta-a, o comentário vira uma resposta na thread do comentário indicado
      (se o indicado já for uma resposta, a resposta vai para o comentário principal dele).

  python .claude/skills/comentar/comentarios.py contexto <pasta-do-artigo>
      Mostra, em JSON, os comentários já existentes do artigo (com o nome de exibição de cada
      agente e a quem cada um respondeu), para dar contexto aos agentes.

  python .claude/skills/comentar/comentarios.py agentes
      Mostra, em JSON, o cadastro de data/agentes.json (id, nome, papel e subagente).
"""
import argparse
import hashlib
import json
import random
import re
import sys
from datetime import datetime, timedelta
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[3]
POSTS = RAIZ / "content" / "posts"
COMENTARIOS = RAIZ / "data" / "comentarios"
AGENTES = RAIZ / "data" / "agentes.json"


def front_matter(texto):
    """Devolve o texto do front matter YAML (entre os dois '---' do topo), ou ''."""
    m = re.match(r"^---\s*\n(.*?)\n---\s*(\n|$)", texto, re.S)
    return m.group(1) if m else ""


def valor_bool(fm, chave):
    m = re.search(rf"^{chave}:\s*(\S+)", fm, re.M)
    return bool(m) and m.group(1).strip("\"'").lower() == "true"


def valor_texto(fm, chave):
    m = re.search(rf"^{chave}:\s*(.+)$", fm, re.M)
    return m.group(1).strip().strip("\"'") if m else ""


def hash_do_texto(caminho):
    return hashlib.sha256(caminho.read_bytes()).hexdigest()[:12]


def ler_json(caminho, padrao):
    if caminho.exists():
        return json.loads(caminho.read_text(encoding="utf-8"))
    return padrao


def listar():
    saida = []
    for caminho in sorted(POSTS.glob("*/index.md")):
        fm = front_matter(caminho.read_text(encoding="utf-8"))
        rascunho = valor_bool(fm, "draft")
        publico = valor_bool(fm, "publicDraft")
        if rascunho and not publico:
            continue  # rascunho comum: não comenta
        pasta = caminho.parent.name
        dados = ler_json(COMENTARIOS / f"{pasta}.json", {"artigo": pasta, "comentarios": []})
        comentarios = dados.get("comentarios", [])
        ultimo = comentarios[-1].get("hash_do_texto") if comentarios else None
        atual = hash_do_texto(caminho)
        saida.append({
            "pasta": pasta,
            "titulo": valor_texto(fm, "title"),
            "caminho": caminho.relative_to(RAIZ).as_posix(),
            "tipo": "rascunho público" if publico else "publicado",
            "hash_atual": atual,
            "hash_ultima_rodada": ultimo,
            "mudou": atual != ultimo,
            "comentarios_existentes": len(comentarios),
        })
    print(json.dumps(saida, ensure_ascii=False, indent=2))


def raiz_da_thread(comentarios, id_alvo):
    """Devolve o comentário PRINCIPAL da thread a que id_alvo pertence (threads têm 1 nível só)."""
    por_id = {c["id"]: c for c in comentarios}
    atual = por_id.get(id_alvo)
    if atual is None:
        return None
    while atual.get("em_resposta_a") and atual["em_resposta_a"] in por_id:
        atual = por_id[atual["em_resposta_a"]]
    return atual


def contexto(pasta):
    agentes = json.loads(AGENTES.read_text(encoding="utf-8"))
    dados = ler_json(COMENTARIOS / f"{pasta}.json", {"artigo": pasta, "comentarios": []})
    saida = []
    for c in dados.get("comentarios", []):
        a = agentes.get(c["agente"], {})
        saida.append({
            "id": c["id"],
            "agente": c["agente"],
            "nome": a.get("nome", c["agente"]),
            "papel": a.get("papel", ""),
            "em_resposta_a": c.get("em_resposta_a"),
            "texto": c["texto"],
        })
    print(json.dumps(saida, ensure_ascii=False, indent=2))


def mostrar_agentes():
    agentes = json.loads(AGENTES.read_text(encoding="utf-8"))
    saida = [{"id": k, "nome": v.get("nome"), "papel": v.get("papel"), "subagente": v.get("subagente", k)}
             for k, v in agentes.items()]
    print(json.dumps(saida, ensure_ascii=False, indent=2))


def agora():
    return datetime.now().astimezone().replace(microsecond=0)


def ultima_data(comentarios):
    datas = [datetime.fromisoformat(c["data"]) for c in comentarios if c.get("data")]
    return max(datas) if datas else None


def agenda(pasta, n):
    """N datas crescentes, espalhadas por poucos minutos, terminando agora (nunca no futuro)."""
    dados = ler_json(COMENTARIOS / f"{pasta}.json", {"artigo": pasta, "comentarios": []})
    fim = agora()
    piso = ultima_data(dados.get("comentarios", []))
    janela = (fim - piso).total_seconds() - 5 if piso else float("inf")
    desejado = n * random.uniform(60, 180)  # 1 a 3 minutos por comentário
    intervalo = max(0.0, min(janela, desejado))
    base = intervalo / n if n else 0
    saltos = [random.uniform(0.6, 1.4) * base for _ in range(n)]
    total = sum(saltos) or 1
    saltos = [x * intervalo / total for x in saltos]  # normaliza: a soma é exatamente o intervalo
    datas, acumulado = [], 0.0
    for x in saltos:
        acumulado += x
        datas.append((fim - timedelta(seconds=intervalo - acumulado)).replace(microsecond=0))
    print(json.dumps([d.isoformat() for d in datas], indent=2))


def extrair_json(texto):
    """Pega o primeiro objeto JSON de uma resposta (tolera cercas ``` ao redor)."""
    texto = texto.strip()
    texto = re.sub(r"^```(?:json)?\s*|\s*```$", "", texto)
    inicio, fim = texto.find("{"), texto.rfind("}")
    if inicio == -1 or fim == -1:
        raise ValueError("a resposta do agente não contém um objeto JSON")
    return json.loads(texto[inicio : fim + 1])


def anexar(pasta, agente, em_resposta_a=None, data=None):
    caminho_post = POSTS / pasta / "index.md"
    if not caminho_post.exists():
        sys.exit(f"artigo não encontrado: {caminho_post}")
    agentes = json.loads(AGENTES.read_text(encoding="utf-8"))
    if agente not in agentes:
        sys.exit(f"agente desconhecido: {agente} (esperado: {', '.join(agentes)})")

    resposta = extrair_json(sys.stdin.read())
    texto = str(resposta.get("comentario", "")).strip()
    if not texto:
        sys.exit("o agente não devolveu o campo 'comentario'")

    COMENTARIOS.mkdir(parents=True, exist_ok=True)
    destino = COMENTARIOS / f"{pasta}.json"
    dados = ler_json(destino, {"artigo": pasta, "comentarios": []})
    existentes = dados.setdefault("comentarios", [])

    momento = agora()
    if data:
        momento = datetime.fromisoformat(data)
        if momento.tzinfo is None:
            sys.exit("a data precisa ter fuso horário (use as datas do comando 'agenda')")
        if momento > agora() + timedelta(seconds=5):
            sys.exit(f"a data está no futuro: {data}")
    anterior = ultima_data(existentes)
    if anterior and momento <= anterior:
        if data:
            sys.exit(f"a data {data} não é posterior ao último comentário do artigo ({anterior.isoformat()})")
        momento = anterior + timedelta(seconds=1)  # sem --data: mantém a ordem
    entrada = {
        "id": f"{momento.strftime('%Y-%m-%dT%H-%M-%S')}-{agente}",  # ajustado abaixo se já existir
        "agente": agente,
        "data": momento.isoformat(),  # com fuso; ver "agenda" para a variação de poucos minutos
        "texto": texto,
        "referencias": [r for r in resposta.get("referencias", []) if r.get("url") and r.get("titulo")],
        "correcoes": [c for c in resposta.get("correcoes", []) if c.get("trecho") and c.get("sugestao")],
        "hash_do_texto": hash_do_texto(caminho_post),
    }

    ids = {c["id"] for c in existentes}
    base, n = entrada["id"], 2
    while entrada["id"] in ids:  # mesmo agente no mesmo segundo: ids precisam ser únicos
        entrada["id"] = f"{base}-{n}"
        n += 1
    if em_resposta_a:
        pai = raiz_da_thread(existentes, em_resposta_a)
        if pai is None:
            sys.exit(f"comentário a responder não encontrado: {em_resposta_a}")
        entrada["em_resposta_a"] = pai["id"]
    existentes.append(entrada)
    destino.write_text(json.dumps(dados, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    verbo = f"respondeu a {entrada['em_resposta_a']} em" if em_resposta_a else "comentou"
    print(f"ok: {agente} {verbo} '{pasta}' em {entrada['data']}" if not em_resposta_a
          else f"ok: {agente} {verbo} '{pasta}' ({entrada['data']})")


if __name__ == "__main__":
    # No Windows o console usa cp1252: sem isto, acentos saem trocados (e a entrada também).
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
    sys.stdin.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser(description="Ajudante da skill /comentar", usage=__doc__)
    sp = ap.add_subparsers(dest="cmd", required=True)
    sp.add_parser("listar")
    sp.add_parser("agentes")
    p_ctx = sp.add_parser("contexto")
    p_ctx.add_argument("pasta")
    p_ag = sp.add_parser("agenda")
    p_ag.add_argument("pasta")
    p_ag.add_argument("n", type=int)
    p_an = sp.add_parser("anexar")
    p_an.add_argument("pasta")
    p_an.add_argument("agente")
    p_an.add_argument("--em-resposta-a", dest="resposta")
    p_an.add_argument("--data")
    a = ap.parse_args()
    if a.cmd == "listar":
        listar()
    elif a.cmd == "agentes":
        mostrar_agentes()
    elif a.cmd == "contexto":
        contexto(a.pasta)
    elif a.cmd == "agenda":
        agenda(a.pasta, a.n)
    else:
        anexar(a.pasta, a.agente, a.resposta, a.data)
