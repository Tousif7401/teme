// Verifies the exact flow the /video-chat page uses against the LIVE backend:
// guest provision -> socket -> match -> chat. Run: node scripts/guest-match-test.mjs
import { io } from "socket.io-client";

const BASE = "https://13.206.6.189.nip.io";
const V1 = `${BASE}/api/v1`;
const rand = () => Math.random().toString(36).slice(2, 12);
let fail = 0;
const ok = (m) => console.log("  ✅ " + m);
const bad = (m) => { console.log("  ❌ " + m); fail++; };

async function jpost(path, body, token) {
  const r = await fetch(V1 + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  return { status: r.status, data: await r.json().catch(() => null) };
}

async function provisionGuest() {
  const email = `guest_${rand()}${rand()}@devmatch.guest`;
  const password = `Px-${rand()}!9`;
  const reg = await jpost("/auth/register", { email, password });
  let token = reg.data.accessToken;
  await jpost("/auth/verify-age", {}, token);
  const login = await jpost("/auth/login", { email, password });
  token = login.data.accessToken;
  await fetch(`${V1}/profiles/me`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ displayName: `dev_${rand().slice(0,5)}`, techStack: [], role: "fullstack", interestedIn: [], region: "in", languages: ["en"] }),
  });
  const me = await (await fetch(`${V1}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })).json();
  return { token, id: me.id, email };
}

const connect = (token) => new Promise((res, rej) => {
  const s = io(BASE, { auth: { token }, transports: ["websocket"], reconnection: false });
  s.on("connect", () => res(s));
  s.on("connect_error", rej);
  setTimeout(() => rej(new Error("ws timeout")), 8000);
});
const waitFor = (s, ev, ms = 8000) => new Promise((res, rej) => {
  const t = setTimeout(() => rej(new Error("timeout " + ev)), ms);
  s.once(ev, (p) => { clearTimeout(t); res(p); });
});

async function main() {
  console.log("\nGuest-flow test against LIVE backend (what /video-chat does):\n");
  const a = await provisionGuest();
  const b = await provisionGuest();
  ok("provisioned two guest accounts (register → verify-age → profile)");

  const sa = await connect(a.token);
  const sb = await connect(b.token);
  ok("both guests connected over WSS");

  const aF = waitFor(sa, "match:found"), bF = waitFor(sb, "match:found");
  sa.emit("match:find");
  await waitFor(sa, "match:waiting", 3000).catch(() => null);
  sb.emit("match:find");
  const [pa, pb] = await Promise.all([aF, bF]);
  if (pa.roomId && pa.roomId === pb.roomId) ok(`matched in room ${pa.roomId.slice(0,8)}`); else bad("room mismatch");

  const bMsg = waitFor(sb, "chat:message");
  sa.emit("chat:message", { text: "hello from guest A" });
  const m = await bMsg;
  if (m.text === "hello from guest A") ok("chat delivered A → B"); else bad("chat failed");

  const turn = await (await fetch(`${V1}/turn/credentials`, { headers: { Authorization: `Bearer ${a.token}` } })).json();
  if (turn.iceServers?.length) ok("TURN credentials returned for the call"); else bad("no TURN creds");

  sa.close(); sb.close();
  for (const u of [a, b]) await fetch(`${V1}/users/me`, { method: "DELETE", headers: { Authorization: `Bearer ${u.token}` } });
  ok("cleaned up guest accounts");

  console.log(fail === 0 ? "\nPASS — the /video-chat wiring works on the live backend\n" : `\nFAIL — ${fail} issue(s)\n`);
  process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error("crashed:", e); process.exit(1); });
