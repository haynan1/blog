/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Client ID do AdSense (`ca-pub-...`). Público por natureza. */
  readonly PUBLIC_ADSENSE_CLIENT?: string;
  readonly PUBLIC_ADSENSE_SLOT_SIDEBAR?: string;
  readonly PUBLIC_ADSENSE_SLOT_FOOTER?: string;
  readonly PUBLIC_ADSENSE_SLOT_IN_ARTICLE?: string;
  readonly PUBLIC_ADSENSE_SLOT_MID_CONTENT?: string;
  /** Endpoint do formulário (Formspree). Público — é um POST de terceiros. */
  readonly PUBLIC_FORMSPREE_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  /** Fila do AdSense. O script do Google a consome ao carregar. */
  adsbygoogle?: Array<Record<string, unknown>>;
}
