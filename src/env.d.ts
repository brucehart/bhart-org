interface Env {
  DB: D1Database;
  MEDIA_BUCKET: R2Bucket;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_OAUTH_REDIRECT_URI?: string;
  CODEX_API_TOKEN: string;
  SHOW_EMAIL_SUBSCRIBE?: string;
  RATE_LIMITER: DurableObjectNamespace;
  SEND_EMAIL: SendEmail;
}
