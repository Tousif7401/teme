/**
 * API Service Layer — wired to the live DevMatch backend.
 *
 * Two kinds of session:
 *  - Logged-in (Google OAuth): tokens in localStorage → persists across reloads/tabs.
 *  - Guest (anonymous "just START"): tokens in sessionStorage → per-tab, easy to test.
 * The token getters prefer a real login over a guest session.
 */

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "https://13.206.6.189.nip.io").replace(/\/$/, "");
const V1 = `${API_BASE}/api/v1`;

const ACCESS = "teme_access";
const REFRESH = "teme_refresh";
const LS = () => (typeof window === "undefined" ? null : window.localStorage);
const SS = () => (typeof window === "undefined" ? null : window.sessionStorage);

export const tokens = {
  get access() {
    return LS()?.getItem(ACCESS) || SS()?.getItem(ACCESS) || null;
  },
  get refresh() {
    return LS()?.getItem(REFRESH) || SS()?.getItem(REFRESH) || null;
  },
  get isLoggedIn() {
    return !!LS()?.getItem(ACCESS);
  },
  saveLogin(a: string, r: string) {
    LS()?.setItem(ACCESS, a);
    LS()?.setItem(REFRESH, r);
  },
  saveGuest(a: string, r: string) {
    SS()?.setItem(ACCESS, a);
    SS()?.setItem(REFRESH, r);
  },
  /** Persist refreshed tokens to wherever the active session lives. */
  saveRefreshed(a: string, r: string) {
    if (this.isLoggedIn) this.saveLogin(a, r);
    else this.saveGuest(a, r);
  },
  clear() {
    [LS(), SS()].forEach((s) => {
      s?.removeItem(ACCESS);
      s?.removeItem(REFRESH);
    });
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

export interface Profile {
  displayName: string;
  techStack: string[];
  role: string;
  interestedIn: string[];
  region: string;
  languages: string[];
}

const DEFAULT_PROFILE = () => ({
  displayName: `dev_${rand().slice(0, 5)}`,
  techStack: [],
  role: "fullstack",
  interestedIn: [],
  region: "in",
  languages: ["en"],
});

async function ensureProfile() {
  try {
    await req("/profiles/me");
  } catch {
    await req("/profiles/me", { method: "PUT", body: DEFAULT_PROFILE() });
  }
}

export const backend = {
  /** Where the browser sends the user to start OAuth sign-in. */
  googleLoginUrl: () => `${V1}/auth/google`,
  githubLoginUrl: () => `${V1}/auth/github`,

  /** Store tokens received from the OAuth callback as a persistent login. */
  setLoginTokens(a: string, r: string) {
    tokens.saveLogin(a, r);
  },

  isLoggedIn: () => tokens.isLoggedIn,

  /** Make the CURRENT (logged-in) account match-ready: age gate + profile. Returns user id. */
  async ensureReady(): Promise<string> {
    await req("/auth/verify-age", { method: "POST" }).catch(() => undefined);
    // Refresh so the access token carries ageVerified=true.
    const refreshed = await req<{ accessToken: string; refreshToken: string }>("/auth/refresh", {
      method: "POST",
      body: { refreshToken: tokens.refresh },
      auth: false,
    });
    tokens.saveRefreshed(refreshed.accessToken, refreshed.refreshToken);
    const me = await req<AuthUser>("/auth/me");
    return me.id;
  },

  /** Read the caller's preferences (throws 404 if not set yet). */
  getProfile: () => req<Profile>("/profiles/me"),
  /** Has the user set their preferences? */
  async hasProfile(): Promise<boolean> {
    try {
      await req("/profiles/me");
      return true;
    } catch {
      return false;
    }
  },
  /** Save preferences. */
  saveProfile: (p: Profile) => req<Profile>("/profiles/me", { method: "PUT", body: p }),

  /** Create a ready-to-match guest account (register → verify age → profile). Returns user id. */
  async provisionGuest(): Promise<string> {
    const email = `guest_${rand()}${rand()}@devmatch.guest`;
    const password = `Px-${rand()}${rand()}!9`;
    const reg = await req<{ accessToken: string; refreshToken: string }>("/auth/register", {
      method: "POST",
      body: { email, password },
      auth: false,
    });
    tokens.saveGuest(reg.accessToken, reg.refreshToken);
    await req("/auth/verify-age", { method: "POST" });
    const login = await req<{ accessToken: string; refreshToken: string }>("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    });
    tokens.saveGuest(login.accessToken, login.refreshToken);
    const me = await req<AuthUser>("/auth/me");
    await ensureProfile();
    return me.id;
  },

  me: () => req<AuthUser>("/auth/me"),
  logout: () => {
    tokens.clear();
  },
  turnCredentials: () => req<{ iceServers: RTCIceServer[]; ttl: number }>("/turn/credentials"),
  report: (reportedId: string, reason: string) =>
    req("/reports", { method: "POST", body: { reportedId, reason } }),
};
