import { createGuestClient } from "@/lib/appwrite";
import { AUTH_COOKIE_NAME, createAuthToken, getAuthCookieOptions } from "@/lib/auth-session";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const { account } = await createGuestClient();
    const session = await account.createEmailPasswordSession(email, password);

    const response = NextResponse.json({ success: true });
    response.cookies.set(AUTH_COOKIE_NAME, createAuthToken(session.userId), getAuthCookieOptions());

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to sign in.";
    console.error("Sign-in failed:", error);
    const status = message.includes("APP_SESSION_SECRET") ? 500 : 401;
    return NextResponse.json({ success: false, error: status === 500 ? "Authentication is not configured on the server." : message }, { status });
  }
}
