// Step 2 of Google login: verify state, exchange the code with Google for an id_token, hand that
// id_token to our DevMatch backend for a session, then bounce to /auth/callback with the tokens.
import { NextResponse } from "next/server";

export const runtime = "nodejs";
const APP_URL = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
const REDIRECT_URI = `${APP_URL}/api/auth/google/callback`;
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? "https://13.206.6.189.nip.io").replace(/\/$/, "");

const fail = (reason: string) => NextResponse.redirect(new URL(`/login?error=${reason}`, APP_URL));

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = req.headers.get("cookie")?.match(/(?:^|;\s*)g_state=([^;]+)/)?.[1];
  if (!code || !state || state !== cookieState) return fail("state");

  try {
    // 1. Exchange the auth code for tokens with Google.
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID ?? "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });
    const tok = (await tokenRes.json()) as { id_token?: string };
    if (!tok.id_token) return fail("token");

    // 2. Exchange the Google id_token for OUR backend session tokens.
    const beRes = await fetch(`${API_BASE}/api/v1/auth/external/google`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ idToken: tok.id_token }),
    });
    const session = (await beRes.json()) as { accessToken?: string; refreshToken?: string };
    if (!beRes.ok || !session.accessToken || !session.refreshToken) return fail("backend");

    // 3. Bounce to the client page that persists the tokens (in the URL fragment).
    const redirect = new URL("/auth/callback", APP_URL);
    redirect.hash = `accessToken=${encodeURIComponent(session.accessToken)}&refreshToken=${encodeURIComponent(session.refreshToken)}`;
    const res = NextResponse.redirect(redirect);
    res.cookies.delete("g_state");
    return res;
  } catch (err) {
    console.error("Google OAuth error:", err);
    return fail("server");
  }
}
