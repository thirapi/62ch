// Client-side bootstrapping. Error monitoring (Sentry) runs on the server only
// (see instrumentation.ts), so no monitoring SDK ships in the browser bundle.

import { initAnalytics } from "@/lib/analytics";

initAnalytics();
