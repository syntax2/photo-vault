import { NextRequest, NextResponse } from "next/server";
import { oAuth2Client } from "@/lib/google-auth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/auth/error", request.url));
  }

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    // Store tokens securely (you might want to use a session store or secure cookie)
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.set("auth_token", tokens.access_token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    return NextResponse.redirect(new URL("/auth/error", request.url));
  }
}
