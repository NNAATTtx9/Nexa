import { createHmac, timingSafeEqual } from "node:crypto";

export const AUTH_COOKIE_NAME = "nexa-session";

export const getAuthCookieOptions = () => ({
  path: "/",
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 30,
});

const getSigningSecret = () => {
  const secret = process.env.APP_SESSION_SECRET;
  if (secret) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error("APP_SESSION_SECRET is required in production.");
  }

  return "development-session-secret";
};

export function createAuthToken(userId: string) {
  const signature = createHmac("sha256", getSigningSecret()).update(userId).digest("hex");
  return `${userId}.${signature}`;
}

export function verifyAuthToken(token: string | undefined) {
  if (!token) return null;

  const separator = token.lastIndexOf(".");
  if (separator < 1) return null;

  const userId = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  const expectedSignature = createHmac("sha256", getSigningSecret()).update(userId).digest("hex");

  if (signature.length !== expectedSignature.length) return null;

  return timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature)) ? userId : null;
}

export function createBankingModeToken(userId: string, mode: "demo" | "actual" | "unset") {
  const payload = `${userId}:${mode}`;
  const signature = createHmac("sha256", getSigningSecret()).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

export function verifyBankingModeToken(token: string | undefined): { userId: string; mode: "demo" | "actual" | "unset" } | null {
  if (!token) return null;

  const separator = token.lastIndexOf(".");
  if (separator < 1) return null;

  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  const expectedSignature = createHmac("sha256", getSigningSecret()).update(payload).digest("hex");

  if (signature.length !== expectedSignature.length) return null;

  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  const [userId, mode] = payload.split(":");
  if (!userId || (mode !== "demo" && mode !== "actual" && mode !== "unset")) {
    return null;
  }

  return { userId, mode };
}
