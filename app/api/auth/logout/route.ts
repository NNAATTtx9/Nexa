import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("nexa-session");
  response.cookies.delete("appwrite-session");
  response.cookies.delete("nexa-banking-mode");
  return response;
}
