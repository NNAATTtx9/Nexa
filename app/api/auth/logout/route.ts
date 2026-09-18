import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth-session";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(AUTH_COOKIE_NAME);
  response.cookies.delete("appwrite-session");
  response.cookies.delete("nexa-banking-mode");
  return response;
}
