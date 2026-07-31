---
title: 'Gabarito de formatação — como escrever um post neste site'
description: 'Referência viva de tudo que o Markdown deste projeto aceita: títulos, imagens, citações, listas, tabelas e código. Fica só no ambiente local.'
pubDate: 2026-07-31
category: 'tecnologia'
tags: ['referência', 'markdown']
image: '../../assets/blog/gabarito.jpg'
imageAlt: 'Círculo âmbar sobre fundo verde-musgo, imagem de exemplo do gabarito'
imageCredit: 'Imagem gerada para este gabarito'
draft: true
sources:
  - label: 'Guia de Markdown (CommonMark)'
    url: 'https://commonmark.org/help/'
---

Este post é uma referência, não um artigo. Ele está com `draft: true`, então
aparece no `npm run dev` e **nunca** vai para o site publicado. Deixe-o aqui e
consulte sempre que esquecer uma sintaxe — você vê o código no VS Code e o
resultado renderizado no navegador, lado a lado.

O primeiro parágrafo de todo post ganha uma capitular automática. Não precisa
fazer nada: a partir de telas médias, a primeira letra cresce e vira um gesto
editorial. É por isso que vale começar o texto com uma frase forte.

## Títulos e o sumário lateral

Use `##` para as seções principais e `###` para subdivisões. Os dois entram
automaticamente no sumário que aparece à direita em telas grandes, e a seção
que você está lendo fica destacada conforme rola a página.

Nunca use `#` (um só) dentro do texto — esse nível é reservado ao título do
post, que vem do `title` no frontmatter. Dois `<h1>` na mesma página confundem
o Google e os leitores de tela.

### Este é um h3

Ele aparece indentado no sumário. Não desça para `####`: o sumário ignora, e um
artigo que precisa de quatro níveis provavelmente deveria ser dois artigos.

## Imagens

A sintaxe é `![texto alternativo](caminho)`. O caminho é sempre relativo a
partir da pasta do post — o que dá `../../assets/blog/`.

![Círculo âmbar sobre fundo verde-musgo](../../assets/blog/gabarito.jpg)

A imagem acima foi escrita assim:

```markdown
![Círculo âmbar sobre fundo verde-musgo](../../assets/blog/gabarito.jpg)
```

O que acontece sozinho quando você faz isso:

- o arquivo é convertido para WebP em seis tamanhos, de 640px a 1600px;
- o navegador escolhe o tamanho certo para a tela de quem está lendo;
- as dimensões saem no HTML, então o texto abaixo nunca "pula" quando a imagem
  termina de carregar;
- a imagem só é baixada quando chega perto da tela.

O texto entre colchetes é o **alt**. Ele não aparece na tela: é o que leitores
de tela leem em voz alta e o que o Google usa para entender a imagem. Descreva
o que se vê, não o nome do arquivo.

> Guarde as imagens em `src/assets/blog/`, nunca em `public/`. O que está em
> `public/` é copiado cru para o site, sem otimização nenhuma — uma foto de
> 4 MB direto do celular chegaria com 4 MB no visitante.

### Legenda visível

O `alt` não aparece na página. Quando quiser uma legenda visível embaixo da
imagem, escreva o HTML direto — Markdown aceita:

<figure>
  <img src="../../assets/blog/gabarito.jpg" alt="A mesma imagem, agora com legenda" />
  <figcaption>Uma legenda aparece assim, centralizada e em corpo menor.</figcaption>
</figure>

```html
<figure>
  <img src="../../assets/blog/gabarito.jpg" alt="Descrição da imagem" />
  <figcaption>O texto da legenda vai aqui.</figcaption>
</figure>
```

## Ênfase e links

Texto em **negrito** com `**dois asteriscos**`, em _itálico_ com
`_um sublinhado_`. Use negrito para a ideia que a pessoa levaria se lesse só as
partes destacadas — e use pouco, senão nada se destaca.

Links são `[o texto](o-endereço)`. Interno assim: [veja o blog](/blog).
Externo assim: [CommonMark](https://commonmark.org/help/) — links externos
recebem sozinhos os atributos de segurança corretos.

## Citações

Use `>` no começo da linha:

> A diferença entre um time rápido e um time apressado não está na velocidade
> média. Está em saber quais são os poucos momentos em que vale desacelerar.

A citação sai em corpo maior, com uma barra na cor de acento à esquerda. Serve
para destacar a frase que resume o artigo, não para qualquer trecho.

## Listas

Com marcadores, usando `-`:

- primeiro item;
- segundo item;
- terceiro item.

Numeradas, usando `1.` (pode repetir `1.` em todas as linhas — o Markdown
numera sozinho):

1. primeiro passo;
2. segundo passo;
3. terceiro passo.

## Tabelas

| Coluna   | Para que serve                 |
| -------- | ------------------------------ |
| Primeira | Comparações lado a lado        |
| Segunda  | Dados curtos, nunca parágrafos |

```markdown
| Coluna   | Para que serve          |
| -------- | ----------------------- |
| Primeira | Comparações lado a lado |
```

Tabela grande fica ruim no celular. Se tiver mais de três colunas, considere
transformar em lista.

## Código

Trecho no meio da frase com crases: `npm run dev`.

Bloco inteiro com três crases e o nome da linguagem:

```bash
npm run build
```

O bloco acompanha o tema claro e escuro sozinho.

## Separador

Três traços numa linha sozinha criam uma divisão:

---

Serve para marcar uma virada no texto.

## Fontes no final

O bloco "Fontes" que aparece embaixo não é escrito no corpo — vem do
frontmatter:

```yaml
sources:
  - label: 'Nome da fonte'
    url: 'https://endereco-da-fonte'
```

Citar fontes tem dois efeitos: dá credibilidade ao leitor e é um sinal de
originalidade na revisão manual do AdSense.

## O que o build cobra de você

Se algum campo do frontmatter estiver errado, o build para e diz exatamente
qual arquivo e qual campo. Os limites:

| Campo         | Regra                                                 |
| ------------- | ----------------------------------------------------- |
| `title`       | entre 10 e 110 caracteres                             |
| `description` | entre 70 e 180 caracteres                             |
| `category`    | `tecnologia`, `negocios`, `produtividade` ou `design` |
| `tags`        | de 1 a 8                                              |
| `imageAlt`    | pelo menos 5 caracteres                               |

É proposital: um erro descoberto aqui custa dois segundos, o mesmo erro
descoberto depois do FTP custa uma página quebrada no ar.
