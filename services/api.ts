/**
 * API Service Layer — wired to the live DevMatch backend.
 * Uses bearer-token auth. Provisions a transparent guest account so the
 * UI "just works" without a separate login screen.
 */

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "https://13.206.6.189.nip.io").replace(/\/$/, "");
const V1 = `${API_BASE}/api/v1`;

const ACCESS = "teme_access";
const REFRESH = "teme_refresh";

export const tokens = {
  get access() {
    return typeof window === "undefined" ? null : sessionStorage.getItem(ACCESS);
  },
  get refresh() {
    return typeof window === "undefined" ? null : sessionStorage.getItem(REFRESH);
  },
  set(a: string, r: string) {
    sessionStorage.setItem(ACCESS, a);
    sessionStorage.setItem(REFRESH, r);
  },
  clear() {
    sessionStorage.removeItem(ACCESS);
    sessionStorage.removeItem(REFRESH);
  },
};

async function req<T>(path: string, opts: { method?: string; body?: unknown; auth?: boolean } = {}): Promise<T> {
  const { method = "GET", body, auth = true } = opts;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth && tokens.access) headers["Authorization"] = `Bearer ${tokens.access}`;
  const res = await fetch(`${V1}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);
  return data as T;
}

const rand = () => Math.random().toString(36).slice(2, 12);

export interface AuthUser {
  id: string;
  email: string;
  ageVerified: boolean;
}

export const backend = {
  /** Create a ready-to-match guest account (register → verify age → profile). Returns user id. */
  async provisionGuest(): Promise<string> {
    const email = `guest_${rand()}${rand()}@devmatch.guest`;
    const password = `Px-${rand()}${rand()}!9`;
    const reg = await req<{ accessToken: string; refreshToken: string }>("/auth/register", {
      method: "POST",
      body: { email, password },
      auth: false,
    });
    tokens.set(reg.accessToken, reg.refreshToken);

    await req("/auth/verify-age", { method: "POST" });
    // Re-login so the access token carries ageVerified=true.
    const login = await req<{ accessToken: string; refreshToken: string }>("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    });
    tokens.set(login.accessToken, login.refreshToken);

    const me = await req<AuthUser>("/auth/me");
    // A default profile so matchmaking accepts us. Region "in" so guests match each other.
    await req("/profiles/me", {
      method: "PUT",
      body: {
        displayName: `dev_${rand().slice(0, 5)}`,
        techStack: [],
        role: "fullstack",
        interestedIn: [],
        region: "in",
        languages: ["en"],
      },
    });
    return me.id;
  },

  turnCredentials: () => req<{ iceServers: RTCIceServer[]; ttl: number }>("/turn/credentials"),
  report: (reportedId: string, reason: string) =>
    req("/reports", { method: "POST", body: { reportedId, reason } }),
};
