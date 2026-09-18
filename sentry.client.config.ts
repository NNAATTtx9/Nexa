// This file configures Sentry for browser-side errors and performance monitoring.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://1e1f006048c37106c87d0f1b716956fa@o4512084625457152.ingest.us.sentry.io/4512084627161088",
  tracesSampleRate: 1,
  dataCollection: {
    // userInfo: false,
    // httpBodies: [],
  },
});
