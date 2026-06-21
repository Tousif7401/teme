// Step 2 of GitHub login: verify state, exchange the code for an access token, hand it to our
// DevMatch backend for a session, then bounce to /auth/callback with the tokens.
import { NextResponse } from "next/server";

export const runtime = "nodejs";
const APP_URL = process.env.APP_URL ?? "https://localhost:3000";
const REDIRECT_URI = `${APP_URL}/api/auth/github/callback`;
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? "https://13.206.6.189.nip.io").replace(/\/$/, "");

const fail = (reason: string) => NextResponse.redirect(new URL(`/login?error=${reason}`, APP_URL));

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = req.headers.get("cookie")?.match(/(?:^|;\s*)gh_state=([^;]+)/)?.[1];
  if (!code || !state || state !== cookieState) return fail("state");

  try {
    // 1. Exchange the auth code for a GitHub access token.
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
      body: new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID ?? "",
        client_secret: process.env.GITHUB_CLIENT_SECRET ?? "",
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });
    const tok = (await tokenRes.json()) as { access_token?: string };
    if (!tok.access_token) return fail("token");

    // 2. Exchange the GitHub token for OUR backend session.
    const beRes = await fetch(`${API_BASE}/api/v1/auth/external/github`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ accessToken: tok.access_token }),
    });
    const session = (await beRes.json()) as { accessToken?: string; refreshToken?: string };
    if (!beRes.ok || !session.accessToken || !session.refreshToken) return fail("backend");

    // 3. Bounce to the client page that persists the tokens (in the URL fragment).
    const redirect = new URL("/auth/callback", APP_URL);
    redirect.hash = `accessToken=${encodeURIComponent(session.accessToken)}&refreshToken=${encodeURIComponent(session.refreshToken)}`;
    const res = NextResponse.redirect(redirect);
    res.cookies.delete("gh_state");
    return res;
  } catch {
    return fail("server");
  }
}
