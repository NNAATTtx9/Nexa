import { createGuestClient } from "@/lib/appwrite";
import { createAuthToken } from "@/lib/auth-session";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const { account } = await createGuestClient();
    const session = await account.createEmailPasswordSession(email, password);

    const response = NextResponse.json({ success: true });
    response.cookies.set("appwrite-session", session.$id, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error("Sign-in failed:", error);
    const message = error instanceof Error ? error.message : "Unable to sign in.";
    return NextResponse.json({ success: false, error: message }, { status: 401 });
  }
}
