// Step 1 of GitHub login: redirect to GitHub's consent screen with a CSRF state cookie.
// Uses the callback already registered on the GitHub OAuth app: <APP_URL>/api/auth/github/callback
import { NextResponse } from "next/server";

export const runtime = "nodejs";
const APP_URL = process.env.APP_URL ?? "https://localhost:3000";

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) return NextResponse.redirect(new URL("/login?error=github_not_configured", APP_URL));

  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${APP_URL}/api/auth/github/callback`,
    scope: "read:user user:email",
    state,
  });

  const res = NextResponse.redirect(`https://github.com/login/oauth/authorize?${params}`);
  res.cookies.set("gh_state", state, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 600 });
  return res;
}
