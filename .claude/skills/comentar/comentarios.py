#!/usr/bin/env python3
"""Ajudante da skill /comentar (somente biblioteca padrão do Python).

Comandos (rode a partir da raiz do projeto):

  python .claude/skills/comentar/comentarios.py listar
      Lista os artigos elegíveis (publicados ou rascunhos públicos) em JSON, com o hash da
      versão atual do texto e se ele mudou desde a última rodada de comentários.

  python .claude/skills/comentar/comentarios.py anexar <pasta-do-artigo> <agente>
      Lê da entrada padrão o JSON que o agente devolveu, valida e ACRESCENTA o comentário em
      data/comentarios/<pasta-do-artigo>.json com a data e hora reais. Nunca apaga nada.
"""
import hashlib
import json
import re
import sys
from datetime import datetime
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


def extrair_json(texto):
    """Pega o primeiro objeto JSON de uma resposta (tolera cercas ``` ao redor)."""
    texto = texto.strip()
    texto = re.sub(r"^```(?:json)?\s*|\s*```$", "", texto)
    inicio, fim = texto.find("{"), texto.rfind("}")
    if inicio == -1 or fim == -1:
        raise ValueError("a resposta do agente não contém um objeto JSON")
    return json.loads(texto[inicio : fim + 1])


def anexar(pasta, agente):
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

    agora = datetime.now().astimezone().replace(microsecond=0)
    entrada = {
        "id": f"{agora.strftime('%Y-%m-%dT%H-%M-%S')}-{agente}",
        "agente": agente,
        "data": agora.isoformat(),  # data e hora REAIS, com fuso
        "texto": texto,
        "referencias": [r for r in resposta.get("referencias", []) if r.get("url") and r.get("titulo")],
        "correcoes": [c for c in resposta.get("correcoes", []) if c.get("trecho") and c.get("sugestao")],
        "hash_do_texto": hash_do_texto(caminho_post),
    }

    COMENTARIOS.mkdir(parents=True, exist_ok=True)
    destino = COMENTARIOS / f"{pasta}.json"
    dados = ler_json(destino, {"artigo": pasta, "comentarios": []})
    dados.setdefault("comentarios", []).append(entrada)
    destino.write_text(json.dumps(dados, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"ok: {agente} comentou '{pasta}' em {entrada['data']}")


if __name__ == "__main__":
    # No Windows o console usa cp1252: sem isto, acentos saem trocados (e a entrada também).
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stdin.reconfigure(encoding="utf-8")
    if len(sys.argv) >= 2 and sys.argv[1] == "listar":
        listar()
    elif len(sys.argv) == 4 and sys.argv[1] == "anexar":
        anexar(sys.argv[2], sys.argv[3])
    else:
        sys.exit(__doc__)
