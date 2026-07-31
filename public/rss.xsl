<?xml version="1.0" encoding="UTF-8"?>
<!--
  Folha de estilo do feed RSS.

  Sem ela, quem clica em /rss.xml no navegador vê uma parede de XML cru e acha
  que o site quebrou. Com ela, o mesmo arquivo continua sendo RSS válido para
  os leitores de feed e vira uma página legível para pessoas.
-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes" />

  <xsl:template match="/">
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, follow" />
        <title><xsl:value-of select="/rss/channel/title" /> — Feed RSS</title>
        <style>
          :root {
            --paper: #faf8f4;
            --ink: #17120e;
            --muted: #5c534a;
            --subtle: #6f6559;
            --line: #e4dcd0;
            --ember: #b4432a;
            color-scheme: light dark;
          }

          @media (prefers-color-scheme: dark) {
            :root {
              --paper: #0c0a08;
              --ink: #f0eae2;
              --muted: #a79c90;
              --subtle: #8a7f71;
              --line: #2a2421;
              --ember: #ff7a55;
            }
          }

          * { box-sizing: border-box; }

          body {
            margin: 0;
            padding: 3rem 1.5rem 5rem;
            background: var(--paper);
            color: var(--ink);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            line-height: 1.6;
          }

          main { max-width: 44rem; margin: 0 auto; }

          .banner {
            padding: 1.25rem 1.5rem;
            margin-bottom: 3rem;
            border: 1px solid var(--line);
            border-left: 3px solid var(--ember);
            border-radius: 10px;
            font-size: 0.9375rem;
            color: var(--muted);
          }

          h1 {
            font-family: Georgia, 'Times New Roman', serif;
            font-size: clamp(2rem, 1.4rem + 2.6vw, 3rem);
            line-height: 1.1;
            letter-spacing: -0.03em;
            margin: 0 0 0.5rem;
          }

          .tagline { color: var(--muted); margin: 0 0 2.5rem; }

          ul { list-style: none; padding: 0; margin: 0; }

          li {
            padding: 1.75rem 0;
            border-bottom: 1px solid var(--line);
          }

          h2 {
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 1.375rem;
            line-height: 1.25;
            letter-spacing: -0.02em;
            margin: 0 0 0.5rem;
          }

          a { color: inherit; text-decoration: none; }
          h2 a:hover { color: var(--ember); }

          .date {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--subtle);
          }

          .summary { color: var(--muted); margin: 0.5rem 0 0; }

          .home {
            display: inline-block;
            margin-top: 3rem;
            font-weight: 600;
            color: var(--ember);
          }
        </style>
      </head>

      <body>
        <main>
          <p class="banner">
            Esta é a versão em RSS deste site. Cole o endereço desta página no seu
            leitor de feeds para acompanhar os artigos novos automaticamente.
          </p>

          <h1><xsl:value-of select="/rss/channel/title" /></h1>
          <p class="tagline"><xsl:value-of select="/rss/channel/description" /></p>

          <ul>
            <xsl:for-each select="/rss/channel/item">
              <li>
                <p class="date"><xsl:value-of select="pubDate" /></p>
                <h2>
                  <a>
                    <xsl:attribute name="href"><xsl:value-of select="link" /></xsl:attribute>
                    <xsl:value-of select="title" />
                  </a>
                </h2>
                <p class="summary"><xsl:value-of select="description" /></p>
              </li>
            </xsl:for-each>
          </ul>

          <a class="home">
            <xsl:attribute name="href"><xsl:value-of select="/rss/channel/link" /></xsl:attribute>
            ← Voltar ao site
          </a>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
