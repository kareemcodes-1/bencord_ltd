import "server-only";

import { BetaAnalyticsDataClient } from "@google-analytics/data";

const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
  : undefined;

export const analyticsDataClient =
  new BetaAnalyticsDataClient({
    credentials,
  });
  