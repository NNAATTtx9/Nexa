import { createHmac, timingSafeEqual } from "node:crypto";

const getSigningSecret = () => process.env.APP_SESSION_SECRET || process.env.NEXT_APPWRITE_KEY || "development-session-secret";

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
