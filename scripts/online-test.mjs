import { io } from "socket.io-client";
const BASE = "https://13.206.6.189.nip.io", V1 = BASE + "/api/v1";
const rand = () => Math.random().toString(36).slice(2,12);
const count = async () => (await (await fetch(`${V1}/presence/online`)).json()).online;
async function guest() {
  const email = `g_${rand()}${rand()}@devmatch.guest`, password = `Px-${rand()}!9`;
  const r = await (await fetch(`${V1}/auth/register`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})})).json();
  let t = r.accessToken;
  await fetch(`${V1}/auth/verify-age`,{method:"POST",headers:{Authorization:`Bearer ${t}`}});
  const l = await (await fetch(`${V1}/auth/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})})).json();
  return { token: l.accessToken, email };
}
console.log("online before:", await count());
const a = await guest();
const s = await new Promise((res,rej)=>{ const x=io(BASE,{auth:{token:a.token},transports:["websocket"],reconnection:false}); x.on("connect",()=>res(x)); x.on("connect_error",rej); setTimeout(()=>rej(new Error("timeout")),6000); });
await new Promise(r=>setTimeout(r,800));
console.log("online with 1 socket connected:", await count());
s.close();
await new Promise(r=>setTimeout(r,1200));
console.log("online after disconnect:", await count());
await fetch(`${V1}/users/me`,{method:"DELETE",headers:{Authorization:`Bearer ${a.token}`}});
process.exit(0);
