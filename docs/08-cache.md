# 8. Cache: por que o navegador às vezes mostra o site velho

Você publica uma mudança, abre o site e... nada mudou. Ou pior: metade mudou. Quase sempre
isso é **cache**. Este capítulo explica o que é, como ele afeta este blog e o que o projeto
faz para contorná-lo.

## O que é cache

Baixar um arquivo da internet custa tempo. Então o navegador **guarda uma cópia** de tudo o
que baixa (HTML, CSS, JavaScript, imagens) e, na próxima vez que precisar do mesmo arquivo,
**reaproveita a cópia** em vez de pedir de novo. Isso deixa os sites muito mais rápidos.

O problema: se o arquivo mudou no servidor, o navegador pode continuar usando a cópia velha
sem saber.

## Quem diz por quanto tempo guardar

O servidor responde a cada arquivo com *cabeçalhos HTTP*. Dois importam aqui:

- **`Cache-Control: max-age=600`**: "pode reutilizar esta cópia por 600 segundos (10 min)
  sem nem perguntar".
- **`ETag`**: uma "impressão digital" do arquivo. Passados os 10 minutos, o navegador
  pergunta "ainda é a versão `6b01b7ba`?" e o servidor responde "sim" (sem reenviar nada) ou
  manda a versão nova.

Dá para ver isso no seu site com:

```bash
curl -sI https://cj-2.github.io/ | grep -i "cache-control\|etag"
```

O **GitHub Pages** fixa `max-age=600` para tudo e **não deixa mudar**. Ou seja: depois de um
deploy, quem já tinha aberto o site pode ver o HTML antigo por até 10 minutos.

## O problema dos arquivos que mudam de conteúdo, mas não de nome

O HTML de 10 minutos atrás pode aparecer, tudo bem: é curto. O perigo é o **arquivo
referenciado** com um nome que nunca muda:

```html
<script src="/js/tema.js"></script>
```

Se o navegador já tem uma cópia de `/js/tema.js` e o servidor tem uma versão nova, o
visitante pode ficar com **HTML novo + JavaScript velho**, uma combinação que ninguém testou.
Foi exatamente o risco de uma regra nova do tema (o estilo temático) não funcionar para quem
tinha o `tema.js` antigo guardado.

## A solução: *cache busting* (quebrar o cache)

A ideia é simples: **se o conteúdo muda, o nome muda**. Um nome novo nunca está no cache,
então o navegador é obrigado a baixar. O nome vem de um **hash** (uma "impressão digital"
calculada a partir do conteúdo do arquivo):

```
/css/estilo.min.40112eb2dccc….css      ← mudou o CSS? o hash muda, o nome muda
/js/tema.555d828a7702….js              ← mudou o JS? idem
```

No Hugo isso se chama **fingerprint**. Está em `themes/lume/layouts/_partials/head.html`:

```go-html-template
{{ $js := resources.Get "js/tema.js" | js.Build (dict "minify" hugo.IsProduction) }}
{{ if hugo.IsProduction }}{{ $js = $js | fingerprint }}{{ end }}
<script src="{{ $js.RelPermalink }}" defer{{ with $js.Data.Integrity }} integrity="{{ . }}"{{ end }}></script>
```

Três detalhes:

- `hugo.IsProduction` é verdadeiro no `hugo --gc --minify` (o build do deploy) e falso no
  `hugo server`. Em desenvolvimento o nome fica fixo, para facilitar; em produção ganha hash.
- `fingerprint` também calcula o `Data.Integrity`, que vira o atributo `integrity` (*Subresource
  Integrity*): o navegador confere se o arquivo baixado é mesmo o esperado e recusa se alguém
  tiver alterado no caminho.
- O CSS já usava a mesma técnica (`minify | fingerprint`); o JS só foi incluído depois.

Resultado: **só o HTML**, que vive pouco, fica sujeito aos 10 minutos de cache. CSS e JS
são sempre os certos para aquele HTML.

Referência: <https://gohugo.io/functions/resources/fingerprint/>

## Como testar sem esperar

- **Recarregar sem cache**: `Ctrl+F5` (ou `Ctrl+Shift+R`) ignora a cópia guardada naquela aba.
- **DevTools → aba Network → "Disable cache"**: desliga o cache enquanto o painel está aberto.
- **Aba anônima**: começa sem nenhuma cópia nem `localStorage`: ótima para ver "o que um
  visitante novo vê".
- **`curl`**: não usa cache nenhum. `curl -s https://cj-2.github.io/ | grep -o '/js/[^"]*'`
  mostra qual JS o HTML publicado referencia.

## Cache não é o mesmo que `localStorage`

Os dois "guardam coisas no navegador", mas são muito diferentes:

| | Cache HTTP | `localStorage` |
|---|---|---|
| Quem guarda | o navegador, sozinho | o **nosso JavaScript**, de propósito |
| O que guarda | arquivos baixados (HTML, CSS, JS...) | textos: estilo, largura, cor, `estiloTematicoVisto` |
| Quem decide a validade | o servidor (`Cache-Control`) | ninguém: fica até alguém apagar |
| Efeito | pode mostrar a versão velha do site | lembra preferências do visitante |

O "o site abriu no estilo errado" pode ser qualquer um dos dois. Se o JS e o CSS estão certos
(cache resolvido) e mesmo assim o estilo é outro, olhe o `localStorage`: no console do
navegador, `localStorage.getItem("estilo")` mostra o que está salvo, e `localStorage.clear()`
simula um visitante novo. A regra do estilo temático (`estiloTematicoVisto`) é explicada no
[histórico](historico.md).

## Resumo

1. O navegador guarda cópias dos arquivos; o servidor diz por quanto tempo (`Cache-Control`).
2. O GitHub Pages fixa 10 minutos e não dá para mudar.
3. Arquivos que mudam de conteúdo sem mudar de nome podem aparecer velhos: use **hash no nome**
   (*cache busting*; no Hugo, `fingerprint`).
4. Só o HTML continua em cache, e por pouco tempo.
5. Para testar: `Ctrl+F5`, "Disable cache" nas DevTools, aba anônima ou `curl`.

Voltar: [07-comandos.md](07-comandos.md) · Índice: [README.md](README.md)
