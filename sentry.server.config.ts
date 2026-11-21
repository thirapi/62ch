// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://af98a07ce5dab0749a4eb532dcd76585@o4510968784879616.ingest.us.sentry.io/4510968804999169",

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Anonymous board: never send IPs or other PII to Sentry
  sendDefaultPii: false,
});
