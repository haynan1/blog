# Contracorrente

Blog editorial estático em pt-BR, monetizado com Google AdSense, publicado por FTP em hospedagem Apache compartilhada (Hostgator / cPanel).

O site é compilado na sua máquina e enviado como HTML, CSS, JS e imagens puros. **Não existe Node, PHP ou banco de dados em produção** — o servidor só entrega arquivos.

---

## Sumário

- [Começar](#começar)
- [Comandos](#comandos)
- [Escrever um post](#escrever-um-post)
- [Configurar o AdSense](#configurar-o-adsense)
- [Publicar na Hostgator](#publicar-na-hostgator)
- [Checklist antes de pedir aprovação no AdSense](#checklist-antes-de-pedir-aprovação-no-adsense)
- [Personalizar](#personalizar)
- [Solução de problemas](#solução-de-problemas)

---

## Começar

Requisito: **Node.js 22.12+ na linha 22, 24.x ou 26+**, conforme o Vitest 5. Node 20 e 23/25 não são suportados (só na sua máquina — a Hostgator não precisa de nada disso).

```bash
npm install
cp .env.example .env    # no Windows: copy .env.example .env
npm run dev
```

Abra <http://localhost:4321>. O servidor recarrega sozinho ao salvar qualquer arquivo.

O `.env` pode ficar vazio no começo. Sem `PUBLIC_ADSENSE_CLIENT`, nenhum bloco de anúncio é renderizado — que é exatamente o que você quer antes da aprovação.

---

## Comandos

| Comando           | O que faz                                                                     |
| ----------------- | ----------------------------------------------------------------------------- |
| `npm run dev`     | Servidor local com recarga automática. Mostra rascunhos.                      |
| `npm run build`   | Verifica tipos e gera `dist/` pronto para upload. **Use este para publicar.** |
| `npm run preview` | Serve o `dist/` gerado, para conferir antes do upload.                        |
| `npm run check`   | Só a verificação de tipos.                                                    |
| `npm run format`  | Formata todo o código com Prettier.                                           |
| `npm run verify`  | Formatação + tipos + testes + build. Rode antes de publicar.                  |

> **Por que `npm run build` usa `--force`:** os blocos de anúncio dentro do artigo são gravados no HTML em tempo de compilação, e o Astro guarda o Markdown já renderizado em cache. Sem `--force`, mudar um ID de anúncio no `.env` não teria efeito — o build reaproveitaria o HTML antigo e você publicaria um site sem anúncios sem perceber. `npm run build:fast` existe para iteração rápida quando só o layout mudou.

---

## Escrever um post

Crie um arquivo `.md` em `src/content/blog/`. **O nome do arquivo vira a URL**: `minha-ideia.md` → `/blog/minha-ideia`.

```markdown
---
title: 'Um título entre 10 e 110 caracteres'
description: 'Resumo entre 70 e 180 caracteres. Vira a meta description do Google e o texto do card na listagem.'
pubDate: 2026-08-15
category: 'tecnologia'
tags: ['arquitetura', 'decisão técnica']
image: '../../assets/blog/minha-imagem.jpg'
imageAlt: 'Descrição objetiva da imagem, para leitores de tela'
draft: false
featured: false
---

O texto do artigo começa aqui, em Markdown normal.

## Um subtítulo

Subtítulos `##` e `###` entram automaticamente no sumário lateral.
```

### Campos do frontmatter

| Campo         | Obrigatório | Observação                                             |
| ------------- | ----------- | ------------------------------------------------------ |
| `title`       | sim         | 10–110 caracteres                                      |
| `description` | sim         | 70–180 caracteres                                      |
| `pubDate`     | sim         | `AAAA-MM-DD`                                           |
| `category`    | sim         | Um dos slugs de `src/config/categories.ts`             |
| `tags`        | sim         | 1 a 8 tags                                             |
| `image`       | sim         | Caminho relativo para um arquivo em `src/assets/blog/` |
| `imageAlt`    | sim         | Mínimo 5 caracteres                                    |
| `updatedDate` | não         | Data da última revisão relevante                       |
| `draft`       | não         | `true` esconde o post do build de produção             |
| `featured`    | não         | `true` coloca o post no destaque da home               |
| `author`      | não         | Sobrescreve o autor padrão                             |
| `imageCredit` | não         | Crédito da foto, obrigatório em imagem de terceiro     |
| `sources`     | não         | Lista de `{ label, url }` renderizada ao final do post |

**O schema é validado no build.** Um campo faltando ou fora do tamanho derruba a compilação com uma mensagem dizendo exatamente qual arquivo e qual campo. É de propósito: melhor falhar aqui do que publicar uma página quebrada.

### Imagens

Coloque em `src/assets/blog/` (**não** em `public/`). Assim o Astro gera versões WebP em vários tamanhos, emite `width`/`height` no HTML e evita que a imagem empurre o layout ao carregar.

Use JPG ou PNG de pelo menos 1600px de largura. O resto é automático.

### Tempo de leitura, sumário e relacionados

Nada a fazer — os três são calculados a partir do texto e do frontmatter.

---

## Configurar o AdSense

### 1. Antes da aprovação

Deixe `PUBLIC_ADSENSE_CLIENT` vazio no `.env`. O site fica sem nenhum bloco de anúncio, que é a condição em que o Google prefere avaliá-lo.

Publique de 15 a 20 artigos originais e substanciais antes de solicitar a revisão. **Site com poucos posts é a causa nº 1 de reprovação** — mais até que problemas técnicos.

### 2. Depois de aprovado

No painel do AdSense, crie quatro unidades **Display responsivo** e anote o ID de cada uma:

```dotenv
PUBLIC_ADSENSE_CLIENT=ca-pub-0000000000000000
PUBLIC_ADSENSE_SLOT_IN_ARTICLE=1111111111
PUBLIC_ADSENSE_SLOT_MID_CONTENT=2222222222
PUBLIC_ADSENSE_SLOT_FOOTER=3333333333
PUBLIC_ADSENSE_SLOT_SIDEBAR=4444444444
```

### 3. Atualize o `ads.txt`

Abra `public/ads.txt` e troque `pub-0000000000000000` pelo seu publisher ID (sem o prefixo `ca-`). Sem isso, parte dos compradores não dá lance no seu inventário e a receita cai.

### 4. Gere e publique

```bash
npm run build
```

### Onde os anúncios aparecem

| Posição       | Onde                                          | Altura reservada |
| ------------- | --------------------------------------------- | ---------------- |
| `in-article`  | Após o 2º parágrafo (posts com 5+ parágrafos) | 280–300px        |
| `mid-content` | No meio do artigo (posts com 12+ parágrafos)  | 280–300px        |
| `footer`      | Fim do post                                   | 280–300px        |
| `sidebar`     | Coluna lateral da listagem, telas ≥1180px     | 620px            |

Toda posição tem **altura reservada em CSS antes do anúncio carregar**. É o que mantém o CLS em zero — critério de Core Web Vitals e fator no valor pago por impressão. Para ajustar as alturas, edite a seção "Blocos de anúncio" em `src/styles/global.css`.

---

## Publicar na Hostgator

### Passo 1 — Gerar o site

```bash
npm run verify
```

Isso confere formatação, tipos e compila. O resultado fica em `dist/`.

### Passo 2 — Conferir localmente

```bash
npm run preview
```

Abra <http://localhost:4321> e navegue pelo site como um visitante. É a última chance de pegar um link quebrado antes de subir.

### Passo 3 — Conectar por FTP

Pegue as credenciais no cPanel em **Contas de FTP**.

| Campo        | Valor                                          |
| ------------ | ---------------------------------------------- |
| Host         | `ftp.seudominio.com.br`                        |
| Usuário      | o da conta de FTP do cPanel                    |
| Porta        | 21 (FTP) ou 22 (SFTP, se disponível — prefira) |
| Pasta remota | `/public_html`                                 |

Clientes recomendados: [FileZilla](https://filezilla-project.org/) ou a extensão **SFTP/FTP** do VS Code.

### Passo 4 — Enviar

Envie **o conteúdo de dentro de `dist/`** para `public_html/` — não a pasta `dist` em si.

```
dist/index.html        →  public_html/index.html
dist/blog/             →  public_html/blog/
dist/_astro/           →  public_html/_astro/
dist/.htaccess         →  public_html/.htaccess
...
```

> **Atenção ao `.htaccess`:** ele começa com ponto, então a maioria dos clientes de FTP o esconde por padrão. No FileZilla: **Servidor → Forçar exibição de arquivos ocultos**. Sem esse arquivo, o site funciona pela metade — sem HTTPS forçado, sem cache, sem 404 personalizada.

### Passo 5 — Verificar em produção

Abra e confirme cada item:

- [ ] `https://seudominio.com.br` carrega e redireciona de `http://` para `https://`
- [ ] `seudominio.com.br/blog/algum-post` abre sem barra final
- [ ] `seudominio.com.br/uma-url-inexistente` mostra a 404 personalizada (com header e rodapé), não a do Apache
- [ ] `seudominio.com.br/sitemap-index.xml` abre
- [ ] `seudominio.com.br/robots.txt` abre
- [ ] `seudominio.com.br/ads.txt` abre como texto puro
- [ ] `seudominio.com.br/rss.xml` abre formatado
- [ ] O alternador de tema funciona e a escolha sobrevive ao recarregar

### Atualizações seguintes

Só envie o que mudou:

- **Post novo ou editado:** a pasta correspondente em `blog/`, mais `index.html`, `blog/index.html`, `sitemap-*.xml` e `rss.xml`.
- **Mudança de layout ou CSS:** tudo, incluindo `_astro/` (os nomes dos arquivos mudam a cada build).

Na dúvida, envie tudo. Os arquivos antigos de `_astro/` podem ser apagados depois — o cache de um ano só vale para arquivos ainda referenciados.

---

## Checklist antes de pedir aprovação no AdSense

**Conteúdo** — de longe o que mais pesa:

- [ ] 15 a 20 artigos originais publicados
- [ ] Cada artigo com pelo menos 800 palavras de texto próprio
- [ ] Nenhum conteúdo copiado, traduzido de outro site ou gerado sem revisão
- [ ] Publicação com alguma regularidade nas últimas semanas

**Páginas obrigatórias** — já prontas neste projeto:

- [ ] `/sobre` preenchida com informação real sobre quem publica
- [ ] `/contato` com um canal que funciona de verdade
- [ ] `/politica-de-privacidade` mencionando cookies, DoubleClick, LGPD e GDPR
- [ ] `/termos-de-uso`
- [ ] Todas linkadas no rodapé de todas as páginas

**Técnico**:

- [ ] Domínio próprio apontado e com HTTPS ativo
- [ ] `ads.txt` com o seu publisher ID real
- [ ] Sitemap enviado ao [Google Search Console](https://search.google.com/search-console)
- [ ] Nenhum erro no console do navegador
- [ ] Site testado no celular

**Personalização** — a marca de exemplo precisa sair antes:

- [ ] `src/config/site.ts` com nome, domínio, e-mail e redes reais
- [ ] Página `/sobre` reescrita com o seu texto
- [ ] Categorias em `src/config/categories.ts` ajustadas ao seu nicho
- [ ] Os 3 posts de exemplo substituídos ou apagados

---

## Personalizar

| O quê                                                  | Onde                                                |
| ------------------------------------------------------ | --------------------------------------------------- |
| Nome, domínio, e-mail, redes sociais, posts por página | `src/config/site.ts`                                |
| Categorias                                             | `src/config/categories.ts`                          |
| Cores, tipografia, espaçamento                         | `src/styles/global.css` (bloco `@layer theme`)      |
| Fontes                                                 | `astro.config.mjs` (chave `fonts`)                  |
| Alturas dos blocos de anúncio                          | `src/styles/global.css` (seção "Blocos de anúncio") |
| Regras do Apache                                       | `public/.htaccess`                                  |

**Nenhuma cor está escrita direto num componente.** Toda a paleta vive em variáveis CSS num único bloco: trocar a identidade visual inteira é editar aquele bloco, e o modo claro e o escuro acompanham juntos.

### Trocar o domínio

Edite `url` em `src/config/site.ts` e atualize a linha `Sitemap:` em `public/robots.txt`. Esses dois pontos alimentam canonical, sitemap, RSS e JSON-LD.

---

## Solução de problemas

**Os anúncios não aparecem depois de configurar o `.env`**
Rode `npm run build` (com `--force`, que é o padrão do script), não `npm run build:fast`. O HTML dos anúncios dentro do artigo fica em cache entre builds.

**O build reclama de um campo do frontmatter**
A mensagem diz o arquivo e o campo. Confira os limites de tamanho na tabela acima. Isso é o schema funcionando, não um bug.

**Erro 500 depois de enviar o `.htaccess`**
Alguma diretiva não é suportada pelo seu plano. Renomeie o arquivo para `.htaccess.bak` pelo gerenciador de arquivos do cPanel para confirmar, e então reintroduza os blocos aos poucos. Todos já estão dentro de `<IfModule>`, então o suspeito mais provável é `Options -Indexes`.

**As URLs abrem com barra final ou dão 404**
O `.htaccess` não foi enviado, ou foi enviado para a pasta errada. Ele precisa estar em `public_html/.htaccess`.

**A fonte demora a aparecer / o texto pisca**
Não deveria: as fontes são hospedadas no próprio domínio e têm fallback com métricas ajustadas. Se acontecer, confirme que a pasta `_astro/` foi enviada por completo.

**O tema volta ao claro ao navegar entre páginas**
Confirme que `dist/_astro/` foi enviado inteiro — o script que reaplica o tema nas transições vive lá.

---

## Arquitetura

Decisões técnicas, o porquê de cada dependência e as escolhas de segurança estão em [ARCHITECTURE.md](./ARCHITECTURE.md).
