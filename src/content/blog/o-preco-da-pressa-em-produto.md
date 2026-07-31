---
title: 'O preço da pressa: quando lançar rápido sai mais caro que lançar certo'
description: 'Velocidade virou virtude inquestionável em produto. Mas existe uma classe de decisão em que apressar multiplica o custo — e dá para identificá-la antes, não depois do prejuízo.'
pubDate: 2026-06-28
category: 'negocios'
tags: ['produto', 'estratégia', 'dívida técnica', 'gestão']
image: '../../assets/blog/preco-da-pressa.jpg'
imageAlt: 'Composição abstrata em vermelho brasa sobre fundo escuro, sugerindo movimento acelerado'
sources:
  - label: 'Ward Cunningham — Debt Metaphor (2009)'
    url: 'https://www.youtube.com/watch?v=pqeJFYwnkjE'
  - label: 'Jeff Bezos — 2015 Letter to Shareholders (decisões tipo 1 e tipo 2)'
    url: 'https://www.sec.gov/Archives/edgar/data/1018724/000119312516530910/d168744dex991.htm'
---

"Melhor feito que perfeito." "Se você não tem vergonha da primeira versão, lançou tarde demais." "Velocidade é a única vantagem competitiva sustentável." Essas frases têm algo em comum além de aparecerem em toda apresentação de produto: todas são verdadeiras em um contexto específico e desastrosas fora dele.

O contexto em que são verdadeiras é bem definido — e raramente é dito junto com a frase.

## Duas classes de decisão

Jeff Bezos ofereceu a distinção mais útil que existe sobre isso na carta aos acionistas de 2015. Decisões tipo 2 são portas de vaivém: você passa, olha, e se não gostou volta. Decisões tipo 1 são portas de mão única — atravessou, não volta, ou volta a um custo proibitivo.

A tese dele é que organizações grandes tendem a tratar tudo como tipo 1, o que as torna lentas e avessas a risco. Verdade. Mas a inversão também acontece, e em empresa jovem ela é mais comum: tratar tudo como tipo 2, decidir tudo rápido, e descobrir tarde demais que aquela porta não tinha maçaneta do outro lado.

O trabalho real não é escolher entre rápido e cuidadoso. É classificar corretamente qual decisão é qual — e essa classificação leva dez minutos, não dez dias.

## O que costuma ser porta de mão única

Algumas categorias aparecem repetidamente do lado caro, e vale reconhecê-las de longe.

**Modelo de dados.** Uma coluna mal modelada é fácil de trocar na semana um. Depois de trezentos mil registros, cinco integrações lendo aquele campo e um relatório financeiro construído em cima dele, é um projeto com risco de perda de dados. O custo de mudar um esquema cresce com o cubo do tempo — não é uma métrica precisa, é uma boa intuição.

**Contratos públicos de API.** No instante em que um cliente externo integra, a sua API deixou de ser sua. Toda mudança incompatível passa a exigir versionamento, período de transição e comunicação. Isso não é um argumento para projetar a API por seis meses; é um argumento para não publicá-la antes de estar razoavelmente certo do formato.

**Promessas ao cliente.** Preço, política de privacidade, garantia, condições de cancelamento. Voltar atrás numa promessa custa confiança, e confiança não tem plano de rollback. Uma decisão de precificação tomada em vinte minutos numa reunião pode limitar o negócio por anos.

**Escolhas que definem cultura.** As primeiras dez contratações e o que se tolera nelas definem o que a empresa vai ser. Isso não aparece em nenhum roadmap, e é a mais irreversível de todas.

## O que quase sempre é vaivém

Do outro lado, a lista é maior — e é por isso que o viés a favor da velocidade está certo na maior parte do tempo.

Cor de botão, texto de interface, ordem de campos num formulário, qual biblioteca de gráficos, layout de uma tela interna, nome de uma funcionalidade antes do lançamento. Tudo isso se troca numa tarde. Deliberar três dias sobre qualquer um desses itens é queimar tempo caro em decisão barata — e o pior é que a deliberação geralmente produz uma resposta pior que simplesmente testar.

A regra prática: se a pergunta pode ser respondida por dados que você conseguiria em uma semana de uso real, não vale a pena discutir por mais de uma hora. Lance e olhe.

## A dívida que ninguém contratou

Ward Cunningham cunhou a metáfora da dívida técnica e passou anos corrigindo o uso errado dela. A ideia original é específica: você entrega uma versão que reflete o entendimento incompleto que tem hoje, para aprender com ela — e **refatora assim que o entendimento melhora**. A dívida é um empréstimo consciente com plano de pagamento.

O que virou prática comum é outra coisa. Entrega-se mal por pressa, chama-se de dívida técnica, e nunca se paga. Isso não é dívida, é inadimplência. E como toda inadimplência, os juros aparecem no lugar mais inconveniente: o time desacelera, e ninguém sabe apontar exatamente onde, porque a lentidão está distribuída em cem lugares pequenos.

O sinal de que isso aconteceu é específico e fácil de reconhecer: estimativas que começam a esticar sem que as tarefas tenham ficado maiores. Quando "isso é simples" passa a levar três dias de forma consistente, a dívida não é mais uma metáfora — é o orçamento.

## Uma heurística que cabe numa frase

Antes de acelerar, pergunte: _se isso estiver errado, quanto custa consertar em seis meses?_

Se a resposta é "algumas horas", vá rápido. Não delibere, não peça três opiniões, não faça documento. Decida e siga.

Se a resposta é "reescrevemos uma parte do sistema", "quebramos a integração de todo cliente" ou "perdemos a confiança de quem já comprou", pare. Não por muito tempo — um dia, talvez dois. O suficiente para escrever o que você está assumindo e conferir se a suposição se sustenta.

A diferença entre um time rápido e um time apressado não está na velocidade média. Está em saber quais são os poucos momentos em que vale desacelerar — e em ter a disciplina de desacelerar exatamente ali, quando toda a pressão do calendário aponta para o outro lado.
