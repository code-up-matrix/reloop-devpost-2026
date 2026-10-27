import { z } from "zod";
import { db, rateLimit } from "./db";
import { AppError, sameOrigin, session } from "./security";

export async function guard(request: Request, app: string, limit = 8) {
  if (request.method !== "GET") sameOrigin(request);
  const who = session(request);
  await rateLimit(`portfolio:${app}:${who.sub}`, limit);
  await rateLimit(`portfolio:global:${app}`, 30);
  return who;
}
export async function saveRun(owner: string, app: string, payload: unknown) {
  const sql = db();
  const [run] = await sql`INSERT INTO portfolio_runs(owner,app,payload) VALUES(${owner},${app},${JSON.stringify(payload)}::jsonb) RETURNING id,created_at`;
  return run;
}
export async function ownedRun(id: string, owner: string, app: string) {
  if (!z.uuid().safeParse(id).success) throw new AppError(400, "Invalid record ID.");
  const sql = db();
  const [run] = await sql`SELECT * FROM portfolio_runs WHERE id=${id} AND owner=${owner} AND app=${app} AND expires_at>now()`;
  if (!run) throw new AppError(404, "Record unavailable or expired.");
  return run;
}
export async function providerJson(url: string, init: RequestInit = {}) {
  const response = await fetch(url, { ...init, redirect: "error", cache: "no-store", signal: AbortSignal.timeout(45000) });
  if (!response.ok) throw new AppError(response.status === 429 ? 429 : 502, `Provider request failed (${response.status}). No simulated result was substituted.`);
  const reader=response.body?.getReader();
  if(!reader)throw new AppError(502,"Provider returned no response body.");
  let bytes=0;const chunks:Uint8Array[]=[];
  while(true){const part=await reader.read();if(part.done)break;bytes+=part.value.length;if(bytes>2_000_000){await reader.cancel();throw new AppError(502,"Provider response was too large.");}chunks.push(part.value);}
  const text=Buffer.concat(chunks).toString("utf8");
  try { return JSON.parse(text); } catch { throw new AppError(502, "Provider returned invalid JSON."); }
}
