import "server-only";

import { SESClient } from "@aws-sdk/client-ses";

const region = process.env.AWS_SES_REGION ?? process.env.AWS_REGION ?? "us-east-1";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

declare global {
  // eslint-disable-next-line no-var
  var __sesClient: SESClient | undefined;
}

function createClient(): SESClient {
  return new SESClient({
    region,
    credentials: accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined,
  });
}

export const sesClient: SESClient = globalThis.__sesClient ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__sesClient = sesClient;
}
