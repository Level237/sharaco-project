import * as Sentry from "@sentry/nextjs";

export async function register() {
  // En dev, on ne charge pas du tout Sentry (aucune instrumentation HTTP)
  if (process.env.NODE_ENV !== "production") return;

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
