"""Testes do ajudante da skill /comentar (.claude/skills/comentar/comentarios.py).

Rodar (da pasta tests/):  python -m unittest discover -s python -v
Usam só a biblioteca padrão do Python (unittest) e uma pasta temporária: nunca mexem nos
seus artigos nem nos comentários reais.
"""
import contextlib
import importlib.util
import io
import json
import shutil
import tempfile
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

CAMINHO = Path(__file__).resolve().parents[2] / ".claude" / "skills" / "comentar" / "comentarios.py"
FUSO = timezone(timedelta(hours=-3))
AGORA = datetime(2026, 11, 21, 15, 0, 0, tzinfo=FUSO)

AGENTES = {
    "critico-cetico": {"nome": "Otávio", "papel": "O Cético", "subagente": "critico-cetico"},
    "corretor": {"nome": "Rogério", "papel": "O Corretor", "subagente": "corretor"},
    "leitor-gentil": {"nome": "Davi", "papel": "O Leitor Gentil", "subagente": "leitor-gentil"},
}


def carregar_modulo():
    spec = importlib.util.spec_from_file_location("comentarios", CAMINHO)
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)
    return modulo


class Base(unittest.TestCase):
    """Cria um "projeto" temporário e aponta o módulo para ele."""

    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.tmp, ignore_errors=True)
        self.m = carregar_modulo()
        self.m.RAIZ = self.tmp
        self.m.POSTS = self.tmp / "content" / "posts"
        self.m.COMENTARIOS = self.tmp / "data" / "comentarios"
        self.m.AGENTES = self.tmp / "data" / "agentes.json"
        self.m.agora = lambda: AGORA  # relógio congelado: testes determinísticos
        self.m.POSTS.mkdir(parents=True)
        self.m.COMENTARIOS.mkdir(parents=True)
        self.m.AGENTES.write_text(json.dumps(AGENTES, ensure_ascii=False), encoding="utf-8")

    def criar_post(self, pasta, front):
        d = self.m.POSTS / pasta
        d.mkdir(parents=True, exist_ok=True)
        (d / "index.md").write_text(f"---\n{front}\n---\n\nCorpo do texto.\n", encoding="utf-8")

    def ler(self, pasta):
        return json.loads((self.m.COMENTARIOS / f"{pasta}.json").read_text(encoding="utf-8"))["comentarios"]

    def anexar(self, pasta, agente, resposta=None, **kw):
        resposta = resposta if resposta is not None else {"comentario": f"texto de {agente}"}
        entrada = resposta if isinstance(resposta, str) else json.dumps(resposta)
        self.m.sys.stdin = io.StringIO(entrada)
        with contextlib.redirect_stdout(io.StringIO()):  # o script imprime "ok: ..."; aqui não interessa
            self.m.anexar(pasta, agente, **kw)

    def capturar(self, funcao, *args):
        saida = io.StringIO()
        with contextlib.redirect_stdout(saida):
            funcao(*args)
        return json.loads(saida.getvalue())


class TestElegibilidade(Base):
    def test_so_artigos_publicados_ou_rascunhos_publicos(self):
        self.criar_post("a-publicado", "title: A\ndraft: false")
        self.criar_post("b-rascunho-comum", "title: B\ndraft: true")
        self.criar_post("c-rascunho-publico", "title: C\ndraft: true\npublicDraft: true")
        self.criar_post("d-publicado-e-publico", "title: D\ndraft: false\npublicDraft: true")
        pastas = [x["pasta"] for x in self.capturar(self.m.listar)]
        self.assertEqual(pastas, ["a-publicado", "c-rascunho-publico", "d-publicado-e-publico"])

    def test_tipo_rascunho_publico_tem_prioridade(self):
        self.criar_post("a", "title: A\ndraft: false\npublicDraft: true")
        self.assertEqual(self.capturar(self.m.listar)[0]["tipo"], "rascunho público")

    def test_detecta_se_o_texto_mudou_desde_a_ultima_rodada(self):
        self.criar_post("a", "title: A\ndraft: false")
        self.assertTrue(self.capturar(self.m.listar)[0]["mudou"])  # nunca comentado
        self.anexar("a", "corretor", data=(AGORA - timedelta(minutes=5)).isoformat())
        self.assertFalse(self.capturar(self.m.listar)[0]["mudou"])  # mesmo texto
        (self.m.POSTS / "a" / "index.md").write_text("---\ntitle: A\ndraft: false\n---\n\nTexto novo.\n", encoding="utf-8")
        self.assertTrue(self.capturar(self.m.listar)[0]["mudou"])  # texto alterado


class TestAgenda(Base):
    def test_datas_crescentes_terminando_agora_e_nunca_no_futuro(self):
        self.criar_post("a", "title: A\ndraft: false")
        datas = [datetime.fromisoformat(d) for d in self.capturar(self.m.agenda, "a", 4)]
        self.assertEqual(len(datas), 4)
        self.assertEqual(datas, sorted(datas))
        self.assertEqual(len(set(datas)), 4, "datas repetidas: tudo 'ao mesmo tempo'")
        self.assertEqual(datas[-1], AGORA)
        self.assertTrue(all(d <= AGORA for d in datas))

    def test_espalha_por_um_a_tres_minutos_por_comentario(self):
        self.criar_post("a", "title: A\ndraft: false")
        for _ in range(20):
            datas = [datetime.fromisoformat(d) for d in self.capturar(self.m.agenda, "a", 4)]
            span = (datas[-1] - datas[0]).total_seconds()
            self.assertGreater(span, 0)
            self.assertLessEqual(span, 4 * 180)

    def test_nunca_antes_do_ultimo_comentario_do_artigo(self):
        self.criar_post("a", "title: A\ndraft: false")
        ultimo = AGORA - timedelta(seconds=90)
        self.anexar("a", "corretor", data=ultimo.isoformat())
        for _ in range(20):
            datas = [datetime.fromisoformat(d) for d in self.capturar(self.m.agenda, "a", 5)]
            self.assertTrue(all(d > ultimo for d in datas), "uma data ficou antes do último comentário")
            self.assertTrue(all(d <= AGORA for d in datas))


class TestAnexar(Base):
    def setUp(self):
        super().setUp()
        self.criar_post("a", "title: A\ndraft: false")

    def test_grava_os_campos_esperados(self):
        self.anexar("a", "leitor-gentil", {
            "comentario": "Gostei.",
            "referencias": [{"titulo": "Ref", "url": "https://x.com"}],
            "correcoes": [],
        })
        c = self.ler("a")[0]
        self.assertEqual(c["agente"], "leitor-gentil")
        self.assertEqual(c["texto"], "Gostei.")
        self.assertEqual(c["referencias"], [{"titulo": "Ref", "url": "https://x.com"}])
        self.assertEqual(c["data"], AGORA.isoformat())
        self.assertEqual(len(c["hash_do_texto"]), 12)
        self.assertNotIn("em_resposta_a", c)

    def test_descarta_referencias_e_correcoes_incompletas(self):
        self.anexar("a", "corretor", {
            "comentario": "Ok",
            "referencias": [{"titulo": "sem url"}, {"url": "https://sem-titulo"}],
            "correcoes": [{"trecho": "x"}, {"trecho": "perca", "sugestao": "perda", "motivo": "grafia"}],
        })
        c = self.ler("a")[0]
        self.assertEqual(c["referencias"], [])
        self.assertEqual(c["correcoes"], [{"trecho": "perca", "sugestao": "perda", "motivo": "grafia"}])

    def test_aceita_resposta_dentro_de_cerca_de_codigo(self):
        self.anexar("a", "corretor", '```json\n{"comentario": "Com cerca"}\n```')
        self.assertEqual(self.ler("a")[0]["texto"], "Com cerca")

    def test_recusa_resposta_sem_comentario_ou_sem_json(self):
        with self.assertRaises(SystemExit):
            self.anexar("a", "corretor", {"comentario": "   "})
        with self.assertRaises(ValueError):
            self.anexar("a", "corretor", "isto não é json")
        self.assertFalse((self.m.COMENTARIOS / "a.json").exists())

    def test_recusa_agente_e_artigo_desconhecidos(self):
        with self.assertRaises(SystemExit):
            self.anexar("a", "fantasma")
        with self.assertRaises(SystemExit):
            self.anexar("nao-existe", "corretor")

    def test_data_no_futuro_e_recusada(self):
        with self.assertRaises(SystemExit):
            self.anexar("a", "corretor", data=(AGORA + timedelta(hours=1)).isoformat())

    def test_data_sem_fuso_e_recusada(self):
        with self.assertRaises(SystemExit):
            self.anexar("a", "corretor", data="2026-11-21T14:00:00")

    def test_data_anterior_ao_ultimo_comentario_e_recusada(self):
        self.anexar("a", "corretor", data=(AGORA - timedelta(minutes=1)).isoformat())
        with self.assertRaises(SystemExit):
            self.anexar("a", "leitor-gentil", data=(AGORA - timedelta(minutes=2)).isoformat())
        self.assertEqual(len(self.ler("a")), 1)

    def test_sem_data_mantem_a_ordem_mesmo_com_relogio_igual(self):
        self.anexar("a", "corretor")
        self.anexar("a", "leitor-gentil")  # o relógio congelado devolve o mesmo instante
        d = [datetime.fromisoformat(c["data"]) for c in self.ler("a")]
        self.assertLess(d[0], d[1])

    def test_mesmo_agente_no_mesmo_segundo_gera_ids_unicos(self):
        self.anexar("a", "corretor", data=(AGORA - timedelta(minutes=1)).isoformat())
        self.anexar("a", "corretor")
        self.anexar("a", "corretor")
        ids = [c["id"] for c in self.ler("a")]
        self.assertEqual(len(ids), len(set(ids)))

    def test_nunca_apaga_comentarios_antigos(self):
        self.anexar("a", "corretor", data=(AGORA - timedelta(minutes=3)).isoformat())
        antes = self.ler("a")
        self.anexar("a", "leitor-gentil")
        depois = self.ler("a")
        self.assertEqual(depois[:1], antes)
        self.assertEqual(len(depois), 2)


class TestThreads(Base):
    def setUp(self):
        super().setUp()
        self.criar_post("a", "title: A\ndraft: false")
        self.anexar("a", "critico-cetico", data=(AGORA - timedelta(minutes=10)).isoformat())
        self.principal = self.ler("a")[0]["id"]

    def test_resposta_guarda_o_id_do_comentario_principal(self):
        self.anexar("a", "leitor-gentil", em_resposta_a=self.principal)
        self.assertEqual(self.ler("a")[1]["em_resposta_a"], self.principal)

    def test_resposta_a_uma_resposta_vai_para_o_comentario_principal(self):
        # threads têm um nível só (como no Slack)
        self.anexar("a", "leitor-gentil", em_resposta_a=self.principal, data=(AGORA - timedelta(minutes=5)).isoformat())
        primeira_resposta = self.ler("a")[1]["id"]
        self.anexar("a", "corretor", em_resposta_a=primeira_resposta)
        self.assertEqual(self.ler("a")[2]["em_resposta_a"], self.principal)

    def test_responder_a_comentario_inexistente_falha_sem_gravar(self):
        with self.assertRaises(SystemExit):
            self.anexar("a", "corretor", em_resposta_a="nao-existe")
        self.assertEqual(len(self.ler("a")), 1)

    def test_contexto_mostra_nomes_atuais_e_a_quem_cada_um_respondeu(self):
        self.anexar("a", "leitor-gentil", em_resposta_a=self.principal)
        ctx = self.capturar(self.m.contexto, "a")
        self.assertEqual([c["nome"] for c in ctx], ["Otávio", "Davi"])
        self.assertIsNone(ctx[0]["em_resposta_a"])
        self.assertEqual(ctx[1]["em_resposta_a"], self.principal)

    def test_renomear_um_agente_nao_exige_mexer_nos_comentarios(self):
        AGENTES2 = json.loads(self.m.AGENTES.read_text(encoding="utf-8"))
        AGENTES2["critico-cetico"]["nome"] = "Otávio Novo"
        self.m.AGENTES.write_text(json.dumps(AGENTES2, ensure_ascii=False), encoding="utf-8")
        self.assertEqual(self.capturar(self.m.contexto, "a")[0]["nome"], "Otávio Novo")


if __name__ == "__main__":
    unittest.main()
