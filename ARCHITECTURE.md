# Arquitetura

Registro das decisões técnicas deste projeto e do motivo de cada uma. Se você
está se perguntando "por que isso é assim?", a resposta deveria estar aqui.

---

## A restrição que define tudo

**Hospedagem compartilhada Hostgator: Apache, cPanel, sem Node em produção.**

Isso não é um detalhe de infraestrutura — é a restrição de projeto. Ela elimina
de saída qualquer arquitetura com servidor de aplicação, banco de dados,
renderização sob demanda ou função serverless. O que sobra precisa caber em
"arquivos que o Apache entrega".

Duas arquiteturas atendem a isso:

|                      | Site estático compilado                 | PHP + MySQL + painel admin         |
| -------------------- | --------------------------------------- | ---------------------------------- |
| Publicar             | Escrever `.md`, compilar, subir por FTP | Escrever no navegador              |
| Performance          | Melhor possível — HTML pronto em disco  | Consulta ao banco a cada visita    |
| Superfície de ataque | Praticamente nenhuma                    | Login, sessão, SQL, upload         |
| Manutenção           | Nenhuma                                 | Patches de PHP e MySQL para sempre |
| Custo de operação    | Zero                                    | Backup e monitoramento do banco    |

**Escolhemos o estático.** O painel admin resolve um problema real (editar de
qualquer lugar) ao custo de manter, para sempre, uma aplicação PHP autenticada
exposta na internet — que é a origem da maioria dos sites invadidos em
hospedagem compartilhada. Num fluxo de trabalho que já passa pelo VS Code, esse
custo compra pouco.

E há um argumento direto de receita: a revisão manual do AdSense favorece sites
rápidos e limpos, e o Core Web Vitals influencia o valor pago por impressão. Um
site estático ganha essa disputa por construção.

---

## Stack

### Astro 7 — framework

> **Nota sobre a versão:** a especificação pedia Astro 5. Estamos no Astro 7,
> que é o major atual. Ficar dois majors atrás significaria abrir mão de
> correções de segurança e, especificamente aqui, das duas features que
> resolvem melhor os requisitos do projeto: a **Fonts API** e o processador de
> Markdown **Sätteri**. Nenhum requisito da especificação foi perdido na troca.

Por quê: gera HTML estático sem runtime de framework no cliente. O JavaScript
que chega ao navegador é só o que escrevemos — nenhum runtime de hidratação de
React ou Vue viajando junto. Para um site de conteúdo, é a diferença entre
~15 KB e ~150 KB de JS antes de qualquer funcionalidade.

Alternativas descartadas:

- **Next.js / Nuxt** — otimizados para SSR e para plataformas que a Hostgator
  não é. O modo de exportação estática existe, mas é o caminho secundário deles,
  e você carrega o peso do runtime de qualquer forma.
- **Hugo / Eleventy** — geram estático muito bem e são mais rápidos no build.
  Perdem em ergonomia de componentes e em otimização de imagens integrada, que
  é justamente onde um blog com muitas capas paga o preço.
- **WordPress** — o padrão de mercado para isso, e o motivo pelo qual metade dos
  sites em hospedagem compartilhada é invadida. Descartado por segurança e
  performance.

### Tailwind CSS 4 — estilos

Usado via `@tailwindcss/vite` (não PostCSS): o pipeline é mais rápido e a
configuração vive no próprio CSS.

O projeto usa Tailwind de forma deliberadamente contida. Os tokens de design
ficam em `@layer theme` como variáveis CSS puras, e o `@theme inline` apenas
expõe essas variáveis como utilitários. Consequência prática: **não existe uma
única variante `dark:` nos componentes.** `bg-paper` e `text-ink` mudam sozinhos
quando a classe `dark` entra no `<html>`, porque apontam para variáveis que
foram redefinidas.

Componentes recorrentes (`.card`, `.btn`, `.pill`, `.prose-editorial`) são
classes em `@layer components`, não sopas de utilitários repetidas em dez
arquivos.

### Sätteri — processador de Markdown

Motor nativo (Rust) que é o padrão do Astro 7, no lugar do pipeline
remark/rehype. Escolhido pela API de plugins hast, que é o que viabiliza a
injeção de anúncios no build (ver abaixo).

### Fonts API do Astro — tipografia

Baixa, subseta e hospeda **Fraunces**, **Newsreader** e **Inter** no próprio
domínio durante o build, e gera fallbacks com métricas ajustadas
(`size-adjust`, `ascent-override`) para que a troca da fonte não empurre o
layout.

Ganho duplo: elimina uma fonte de CLS, e nenhum IP de leitor vai para o Google
Fonts — o que torna a seção de privacidade da política uma afirmação verdadeira
em vez de uma formalidade.

Substituiu os pacotes `@fontsource-*` que estavam no plano inicial: mesma
função, menos dependências, e os fallbacks otimizados de brinde.

### GSAP — animação

Usado para a sequência do hero e para o reveal on scroll. Importado
**dinamicamente**, e só quando `prefers-reduced-motion` permite: quem pede menos
movimento nunca baixa os ~24 KB.

O estado inicial escondido é aplicado por CSS sob a classe `.motion`, escrita
pelo script inline do `<head>` antes do primeiro paint. Se o JS falhar, se
estiver bloqueado, ou se o usuário pedir menos movimento, **o conteúdo
simplesmente já está visível** — o modo de falha mais caro num site de conteúdo
é a página em branco, e ele está fechado por construção.

### sharp — imagens

Roda só no build local, convertendo as capas para WebP em vários tamanhos e
emitindo `width`/`height` no HTML. Nada disso vai para a Hostgator.

### Dependências que **não** estão aqui

| Não usado                          | Por quê                                                                                                                                              |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework de UI (React/Vue/Svelte) | Nenhuma interação justifica um runtime. O que existe são ~200 linhas de JS puro.                                                                     |
| Biblioteca de ícones               | Os poucos ícones são SVG inline. Um pacote de ícones seria mais peso que o conteúdo dele.                                                            |
| SDK de redes sociais               | Botões de compartilhar são âncoras `https://`. Os widgets oficiais custam centenas de KB e instalam rastreadores.                                    |
| Analytics                          | Nenhum coletado. Se precisar, prefira um sem cookies (Plausible, Umami) e atualize a política de privacidade.                                        |
| `reading-time` (npm)               | 30 linhas próprias em `src/lib/reading-time.ts`, ajustadas para pt-BR e para o Markdown deste projeto.                                               |
| Fonte mono (JetBrains, Fira)       | Blocos de código são raros num blog geral. A pilha mono do sistema custa 0 byte.                                                                     |
| ESLint                             | O `strictest` do TypeScript + `astro check` já pegam a classe de erro que importa aqui. ESLint entraria como superfície de configuração sem retorno. |

---

## Estrutura de pastas

```
src/
├── config/          Identidade do site e taxonomia. Editar aqui muda o site inteiro.
│   ├── site.ts      Marca, domínio, redes, paginação
│   └── categories.ts Taxonomia fechada, validada pelo schema
│
├── content/blog/    Os posts (.md/.mdx). Nome do arquivo = URL.
├── content.config.ts Schema Zod. Frontmatter inválido derruba o build.
├── assets/blog/     Imagens dos posts (otimizadas no build)
│
├── lib/             Lógica pura, sem JSX
│   ├── posts.ts     Consulta, ordenação, paginação, relacionados
│   ├── reading-time.ts
│   ├── format.ts    Datas em pt-BR, URLs absolutas
│   └── schema.ts    Construtores de JSON-LD
│
├── plugins/         Plugins do processador de Markdown
│   └── satteri-ad-slots.mjs
│
├── layouts/         Esqueletos de página
│   ├── BaseLayout.astro     <html>, head, header, rodapé, scripts
│   ├── ArchiveLayout.astro  Listagens (blog e categorias)
│   └── PageLayout.astro     Páginas institucionais
│
├── components/      Agrupados por papel, não por tipo
│   ├── layout/      Header, Footer, ThemeToggle
│   ├── post/        PostCard, TableOfContents, ShareButtons, ReadingProgress
│   ├── ads/         AdSlot, AdSenseLoader
│   ├── seo/         Seo
│   └── ui/          Breadcrumb, Pagination
│
├── pages/           Uma pasta por rota — o roteamento é a árvore de arquivos
└── styles/global.css Tokens, base, componentes, prose

public/              Copiado literalmente para dist/
├── .htaccess        Configuração do Apache
├── ads.txt robots.txt favicon.svg logo.png og-default.png rss.xsl
```

### Rotas

| Rota                                                            | Arquivo                                      |
| --------------------------------------------------------------- | -------------------------------------------- |
| `/`                                                             | `pages/index.astro`                          |
| `/blog`                                                         | `pages/blog/index.astro`                     |
| `/blog/pagina/2`                                                | `pages/blog/pagina/[page].astro`             |
| `/blog/[slug]`                                                  | `pages/blog/[slug].astro`                    |
| `/categoria/[slug]`                                             | `pages/categoria/[slug].astro`               |
| `/categoria/[slug]/pagina/2`                                    | `pages/categoria/[slug]/pagina/[page].astro` |
| `/sobre` `/contato` `/politica-de-privacidade` `/termos-de-uso` | páginas próprias                             |
| `/404`                                                          | `pages/404.astro`                            |
| `/rss.xml`                                                      | `pages/rss.xml.ts`                           |

**Por que a paginação mora em `/blog/pagina/2` e não em `/blog/2`:** um post com
slug `2` colidiria com a segunda página da listagem. A rota `[slug]` e a rota de
paginação nunca disputam a mesma forma de URL — o conflito é impossível por
construção, não evitado por convenção.

A página 1 existe em uma única URL (`/blog`, nunca `/blog/pagina/1`), e as
páginas seguintes são `noindex, follow`: o Google segue os links e indexa os
posts, sem que listas sem texto próprio compitam por crawl budget.

---

## CLS zero: como, e por que importa tanto

Layout shift entra duas vezes na conta deste projeto: penaliza o Core Web Vitals
(ranqueamento) e derruba o valor percebido do inventário no leilão do AdSense
(receita). Foi tratado como restrição de projeto, não como otimização posterior.

| Fonte de shift              | Como foi fechada                                                   |
| --------------------------- | ------------------------------------------------------------------ |
| Troca de fonte              | Fallbacks com métricas ajustadas, gerados pela Fonts API           |
| Imagens                     | `width`/`height` emitidos no build + `aspect-ratio` nos containers |
| Blocos de anúncio           | `min-height` reservada em CSS antes do anúncio carregar            |
| Animações                   | Só `opacity` e `transform` — nunca propriedades que causam layout  |
| Header que encolhe          | `transform`, com o elemento fora do fluxo do documento             |
| Barra de progresso          | `position: fixed` + `scaleX()`                                     |
| Barra de rolagem aparecendo | `scrollbar-gutter: stable` no `body`                               |

---

## Injeção de anúncios no artigo

O requisito — anúncio após o 2º parágrafo e no meio do texto — tem três
implementações possíveis:

1. **Inserir via JavaScript depois do paint.** Simples e errado: empurra todo o
   texto abaixo. CLS direto no elemento que mais importa.
2. **Marcadores manuais no Markdown.** Funciona, mas transfere para o autor uma
   decisão de layout, e some no primeiro post em que ele esquecer.
3. **Inserir na árvore HTML durante o build.** É o que fazemos.

`src/plugins/satteri-ad-slots.mjs` é um plugin hast do Sätteri. Ele visita os
parágrafos, identifica os de primeiro nível (nunca dentro de citação, lista ou
tabela) e insere o bloco completo do AdSense após o 2º parágrafo e no ponto
médio. O `<ins>` chega no HTML entregue, dentro de um container cuja altura já
está reservada em CSS.

Duas salvaguardas editoriais: artigos com menos de 5 parágrafos não recebem
anúncio nenhum, e o bloco do meio só aparece a partir de 12 parágrafos. Texto
curto sufocado por anúncios é exatamente o padrão que a revisão manual do
AdSense reprova.

Sem `PUBLIC_ADSENSE_CLIENT` configurado, o plugin é um no-op e o componente
`<AdSlot>` não renderiza nada — o site fica limpo para a avaliação do Google.

**Pegadinha conhecida:** o Astro guarda o Markdown renderizado em cache entre
builds, e a chave desse cache não inclui o `.env`. Trocar um ID de anúncio e
rodar um build incremental reaproveitaria o HTML antigo — você publicaria um
site sem anúncios sem receber nenhum aviso. Por isso `npm run build` usa
`--force`. `build:fast` existe para iteração de layout, quando isso não importa.

---

## Segurança

Um site estático não tem banco de dados, sessão, login nem entrada de usuário
renderizada. Isso fecha, de saída, quase toda a lista do OWASP Top 10. O que
sobra foi tratado assim:

**Sem segredos no repositório.** O `.env` está no `.gitignore`; o
`.env.example` só tem placeholders vazios. Todas as variáveis usam o prefixo
`PUBLIC_` — o que é correto aqui, porque um client ID de AdSense e um endpoint
de formulário são públicos por definição. **Não existe lugar onde um segredo de
verdade pudesse ficar escondido num site estático**, e o `.env.example`
diz isso explicitamente para que ninguém tente.

**Cabeçalhos de segurança** no `.htaccess`: `X-Content-Type-Options`,
`X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` (que recusa também a
Topics API do Chrome) e uma CSP.

**Sobre o `'unsafe-inline'` na CSP** — é uma concessão consciente e vale
registrar o raciocínio. O script do AdSense injeta trechos inline durante a
veiculação; uma CSP com hashes ou `strict-dynamic` quebraria a monetização, e o
Google não publica hashes estáveis para hashear. A decisão foi manter fechadas
as diretivas que de fato contêm dano — `object-src 'none'`, `base-uri 'self'`,
`frame-ancestors 'self'`, `form-action` restrito ao Formspree — e aceitar o
`'unsafe-inline'` em `script-src`. O risco residual é baixo por construção: não
há entrada de usuário renderizada, não há cookie próprio, não há sessão a
sequestrar. Se um dia os anúncios saírem, o `.htaccess` traz a versão estrita
comentada logo acima da diretiva.

**Sem terceiros além do necessário.** Fontes no próprio domínio, botões de
compartilhar como âncoras, nenhum analytics. Os únicos terceiros são o AdSense
(que sustenta o projeto) e o Formspree (só na página de contato) — ambos
declarados na política de privacidade.

**Links externos** levam `rel="noopener noreferrer"`, e os patrocinados também
`nofollow`.

**Formulário de contato** com honeypot, `maxlength` em todos os campos e envio
por `fetch`. Sem endpoint próprio: não existe alvo de spam ou de injeção nesta
hospedagem.

**Arquivos ocultos bloqueados** no Apache (`.env`, `.git`, `.htaccess`) — um
upload por FTP descuidado pode levar junto o que não deveria. Listagem de
diretório desabilitada.

**Zero vulnerabilidades** em `npm audit` no momento do commit inicial. O
lockfile está versionado.

> Não há Docker neste projeto: o artefato de deploy são arquivos estáticos e o
> ambiente de execução é o Apache da hospedagem. Não existe imagem a construir,
> logo não há `.dockerignore`, multi-stage build ou usuário não-root a definir.

---

## Custo de operação

| Item                | Custo                                              |
| ------------------- | -------------------------------------------------- |
| Hospedagem          | Plano compartilhado já existente                   |
| Build               | Roda na máquina local, ~4s                         |
| Fontes, imagens, JS | Servidos do próprio domínio — zero serviço externo |
| AdSense             | Gratuito; gera receita                             |
| Formspree           | Gratuito até 50 envios/mês                         |

**Custo marginal de um post novo: zero.** Nenhuma chamada de API, nenhum
processamento sob demanda, nenhuma linha em banco.

O único limite prático é a banda do plano de hospedagem. Como cada página serve
HTML comprimido e imagens WebP, uma visita custa entre 80 e 200 KB — algo como
5 a 12 GB por 60 mil visitas mensais, dentro de qualquer plano compartilhado.

---

## Decisões de design

**Paleta "Tinta & Brasa"** — neutros quentes de papel e tinta com um único
acento brasa (terracota). Cinzas quentes em vez de slate azulado fazem o site
ler como revista impressa, não como dashboard SaaS; e o acento único, usado com
parcimônia, cria hierarquia sem recorrer ao gradiente roxo/azul que denuncia
template.

**Tipografia em três vozes**, cada uma com uma função:

- **Fraunces** (serifada de alto contraste) nas manchetes — é de onde vem a
  personalidade;
- **Newsreader** (serifada de texto) no corpo do artigo — leitura de corrido em
  pt-BR;
- **Inter** na interface — navegação e metadados não devem competir com o texto.

**Estrutura pela borda, não pela sombra.** Cards têm borda de 1px e ganham
sombra só no hover. Sombra pesada em repouso é o gesto que mais rapidamente faz
uma interface parecer um template.

**Contraste verificado.** Todos os pares texto/fundo passam em WCAG AA nos dois
temas; a maioria passa em AAA. O acento sobre papel fica em 5,24:1 e sobre
tinta em 7,69:1.

**Capitular no primeiro parágrafo**, a partir de 640px. Gesto editorial
clássico, aplicado uma vez por artigo.

---

## Acessibilidade

- Link "pular para o conteúdo" como primeiro elemento focável
- Marcos semânticos (`header`, `main`, `nav`, `article`, `aside`, `footer`)
- Hierarquia de títulos correta em todas as rotas (`headingLevel` é prop do
  `PostCard` justamente para isso)
- `aria-current` na rota ativa, no item de paginação e na seção lida do sumário
- Foco visível com `:focus-visible`, nunca removido
- `prefers-reduced-motion` respeitado em toda animação, inclusive nas transições
  de CSS
- Área clicável do card estendida por pseudo-elemento, sem aninhar âncoras
- Estado do formulário anunciado por `aria-live`
- Sem `aria-*` decorativo: o HTML semântico faz o trabalho primeiro

---

## O que deliberadamente não foi construído

Escopo é decisão. Estes itens foram considerados e ficaram de fora:

- **Busca** — sem valor com 20 posts, e um índice client-side custa banda em
  toda visita. Quando o catálogo passar de ~50 artigos, Pagefind é a escolha
  natural (roda no build, gera índice estático).
- **Comentários** — exige moderação diária ou vira spam, e todo serviço embutido
  traz rastreadores que teriam que entrar na política de privacidade.
- **Newsletter** — só faz sentido com público. Adicionar quando houver.
- **Índice de categorias** (`/categorias`) — as quatro categorias já estão
  linkadas na home e no rodapé.
- **Banner de consentimento de cookies** — para tráfego do EEE/Reino Unido, a
  ferramenta de mensagens de privacidade do próprio AdSense cobre a exigência
  sem código adicional. Ativar no painel do AdSense se e quando esse tráfego
  aparecer.
- **Testes automatizados** — não há lógica de negócio para testar. O que poderia
  quebrar em silêncio já quebra o build: o schema valida o frontmatter, o
  TypeScript em `strictest` valida os tipos, e `astro check` roda antes de todo
  build de produção.
