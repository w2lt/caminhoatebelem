/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
  /** "required" exige ativação comercial; qualquer outro valor (ou vazio) dispensa. */
  readonly VITE_ACTIVATION_MODE?: string;
  /** Chave PÚBLICA ECDSA P-256 em JSON (JWK). Nunca coloque a chave privada aqui. */
  readonly VITE_ACTIVATION_PUBLIC_JWK?: string;
  readonly VITE_ACTIVATION_ENDPOINT?: string;
  /** Contato de suporte exibido no app (ex.: link do WhatsApp ou e-mail). */
  readonly VITE_SUPPORT_URL?: string;
}

declare module 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url' {
  const url: string;
  export default url;
}

declare const __APP_VERSION__: string;
