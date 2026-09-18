import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const allCookies = (await cookies()).getAll();
  return NextResponse.json(allCookies);
}

