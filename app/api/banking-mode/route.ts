import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { setBankingMode, getLoggedInUser } from "@/lib/actions/user.action";
import { createBankingModeToken, verifyAuthToken } from "@/lib/auth-session";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let modeInput: FormDataEntryValue | null = null;

    if (contentType.includes("application/json")) {
      const body = await request.json();
      modeInput = body?.mode ?? null;
    } else {
      const formData = await request.formData();
      modeInput = formData.get("mode");
    }

    const mode = modeInput === "demo" || modeInput === "actual" ? modeInput : null;

    if (!mode) {
      return NextResponse.json({ success: false, error: "Invalid banking mode." }, { status: 400 });
    }

    const token = (await cookies()).get("nexa-session")?.value;
    const userId = verifyAuthToken(token);

    if (!userId) {
      return NextResponse.json({ success: false, error: "Not authenticated." }, { status: 401 });
    }

    const user = await getLoggedInUser();
    if (!user || (user.userId && user.userId !== userId)) {
      return NextResponse.json({ success: false, error: "Not authenticated." }, { status: 401 });
    }

    const response = NextResponse.redirect(new URL("/root", request.url));
    response.cookies.set("nexa-banking-mode", createBankingModeToken(userId, mode), {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
    });

    await setBankingMode({ userId, mode });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to select banking mode.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
