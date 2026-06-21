// Step 1 of Google login: redirect to Google's consent screen with a CSRF state cookie.
// Uses the redirect URI already registered on the Google client: <APP_URL>/api/auth/google/callback
import { NextResponse } from "next/server";

export const runtime = "nodejs";
const APP_URL = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return new NextResponse("GOOGLE_CLIENT_ID not set", { status: 500 });

  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${APP_URL}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
    state,
  });

  const res = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  // http://localhost can't store Secure cookies, so omit `secure` for local dev.
  res.cookies.set("g_state", state, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 600 });
  return res;
}
