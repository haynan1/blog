---
title: 'Como escolher a ferramenta certa quando todo mundo já escolheu por você'
description: 'Popularidade virou o principal critério de decisão técnica — e é o pior deles. Quatro perguntas para separar o que resolve o seu problema do que resolve o de outro.'
pubDate: 2026-07-24
category: 'tecnologia'
tags: ['arquitetura', 'decisão técnica', 'engenharia']
image: '../../assets/blog/ferramenta-certa.jpg'
imageAlt: 'Composição abstrata em tons de brasa e tinta, sugerindo caminhos divergentes'
featured: true
sources:
  - label: 'Fred Brooks — No Silver Bullet: Essence and Accidents of Software Engineering (1986)'
    url: 'https://ieeexplore.ieee.org/document/1663532'
  - label: 'Dan McKinley — Choose Boring Technology'
    url: 'https://mcfunley.com/choose-boring-technology'
---

Existe uma pergunta que aparece em toda decisão técnica e que quase ninguém faz em voz alta: _por que essa opção, e não outra?_ No lugar dela, aparece uma resposta pronta — "é o que todo mundo usa". A frase encerra a conversa antes de ela começar, e é exatamente por isso que ela é tão popular.

O problema não é a ferramenta popular. Muitas vezes a ferramenta popular é a certa, e é popular justamente porque resolve bem um problema comum. O problema é usar a popularidade como _critério_ em vez de como _evidência_. São coisas diferentes, e confundir as duas custa caro no ano seguinte.

## O que a popularidade realmente informa

Quando uma tecnologia é muito adotada, você aprende três coisas reais sobre ela. Primeiro: os casos de uso mais comuns estão razoavelmente cobertos, porque muita gente já bateu com a cara neles. Segundo: existe documentação, existem respostas no fórum, existe gente contratável. Terceiro: o projeto provavelmente não vai ser abandonado no mês que vem.

Isso é informação valiosa. Não é pouca coisa. Mas repare no que ela _não_ diz: nada sobre o seu problema específico. Popularidade mede quantas pessoas têm um problema parecido com o que a ferramenta resolve — não se você é uma delas.

O erro clássico é adotar a arquitetura de uma empresa mil vezes maior porque ela publicou um post técnico bonito. A empresa grande escolheu aquilo para resolver um problema de escala que você não tem, aceitando uma complexidade operacional que ela pode pagar e você não. Você importa o custo inteiro e nenhum dos benefícios.

## As quatro perguntas

Toda vez que uma decisão técnica aparece, quatro perguntas dão conta de 90% do trabalho. Elas são chatas de propósito: forçam a explicitar o que normalmente fica implícito.

**1. Que problema exatamente estou resolvendo?**

Não a categoria do problema. O problema. "Preciso de um banco de dados" não é uma resposta; "preciso guardar 40 mil registros com relações entre eles e consultar por três campos diferentes" é. A segunda formulação elimina metade das opções sozinha, sem que você precise comparar nada.

Quando a resposta é vaga, o problema geralmente é que ninguém entendeu o requisito ainda. Escolher a ferramenta nesse ponto é escolher no escuro e chamar de decisão.

**2. Qual é o custo de estar errado?**

Nem toda decisão tem o mesmo peso. Trocar uma biblioteca de formatação de datas é trabalho de uma tarde. Trocar o banco de dados principal é trabalho de um trimestre, com risco de perda de dados no meio.

Decisões baratas de reverter merecem decisões rápidas — deliberar três dias sobre algo que se troca em três horas é desperdício. Decisões caras de reverter merecem ceticismo proporcional. A pergunta prática é: _se em seis meses isso se mostrar errado, o que acontece?_ Se a resposta for "reescrevemos o produto", a barra sobe muito.

**3. Quem mantém isso, e o que acontece se pararem?**

Toda dependência é uma aposta em pessoas que você não conhece. Vale saber em quem você está apostando: um projeto com financiamento e time dedicado, um projeto mantido por uma pessoa nas horas vagas, ou um projeto de empresa que pode descontinuá-lo quando a estratégia mudar.

Nenhuma das três respostas é automaticamente desqualificante. A biblioteca de uma pessoa só pode ser exatamente a coisa certa se ela for pequena, estável e fácil de substituir. O que desqualifica é não ter olhado.

**4. Consigo explicar essa escolha para alguém que discorda?**

Este é o teste final, e o mais revelador. Se a única defesa que você consegue montar é apelo à autoridade — "a empresa X usa", "é o padrão do mercado" — você não decidiu nada. Você delegou.

Uma justificativa real tem a forma: _escolhi A em vez de B porque o nosso gargalo é C, e A resolve C ao custo de D, que a gente consegue pagar._ Repare que ela inclui o custo. Justificativa que só lista vantagens não é justificativa, é propaganda.

## O caso a favor do tédio

Existe um argumento forte, e frequentemente correto, a favor de escolher a opção mais entediante que resolve o problema. Dan McKinley formulou isso melhor que ninguém com a ideia de que todo time tem um orçamento limitado de inovação — algo como três "fichas" para gastar em tecnologia nova. Gaste-as no que diferencia o seu produto, e escolha o mais chato possível para todo o resto.

O raciocínio é sólido porque a tecnologia entediante tem uma propriedade rara: os seus modos de falha já são conhecidos. Você sabe como ela quebra, sabe o que fazer quando quebra, e existe alguém no Stack Overflow que já quebrou do mesmo jeito em 2019. Com a tecnologia nova, cada falha é uma descoberta — e descobertas em produção às três da manhã são caras.

Mas o argumento tem um limite, e ignorá-lo é o erro simétrico. "Entediante" não pode virar sinônimo de "o que eu já sei". Um time que se recusa sistematicamente a aprender qualquer coisa nova acaba mantendo, dez anos depois, um sistema que ninguém mais no mercado sabe operar — o que é exatamente o risco que a estratégia do tédio pretendia evitar.

O ponto de equilíbrio é escolher o novo _deliberadamente_, em poucos lugares, por razões que você consiga escrever numa frase. Não por inércia, e não por moda.

## O que fazer com isso na prática

Da próxima vez que uma decisão técnica aparecer, escreva três parágrafos antes de escrever qualquer código. O primeiro descreve o problema em termos concretos, com números se houver. O segundo lista as duas ou três opções reais e o que cada uma custa. O terceiro registra a escolha e a razão dela.

Isso leva vinte minutos e resolve dois problemas de uma vez. No presente, força a clareza — é surpreendentemente difícil escrever esses três parágrafos sobre uma decisão que você não entendeu. No futuro, quando alguém perguntar "por que a gente usa isso?", existe uma resposta que não é "sei lá, já estava aqui quando eu cheguei".

A diferença entre um sistema que envelhece bem e um que apodrece raramente está na tecnologia escolhida. Está em quantas das escolhas tinham um motivo que sobreviveu ao contato com o tempo.
