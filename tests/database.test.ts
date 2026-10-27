import {PGlite} from "@electric-sql/pglite";
import {readFile} from "node:fs/promises";
import {beforeAll,afterAll,describe,it,expect,vi} from "vitest";
import {createHmac} from "node:crypto";
const state=vi.hoisted(()=>({db:null as unknown as PGlite}));
vi.mock("@neondatabase/serverless",()=>({neon:()=>{
 const tag=async(strings:TemplateStringsArray,...values:unknown[])=>{const text=strings.reduce((s,x,i)=>s+x+(i<values.length?`$${i+1}`:""),"");return(await state.db.query(text,values)).rows;};return tag;
}}));
import {sign} from "../lib/security";
import {GET as history,DELETE as removeRun} from "../app/api/lab/runs/route";
import {GET as cleanup} from "../app/api/internal/cleanup/route";
beforeAll(async()=>{state.db=new PGlite();process.env.DATABASE_URL="test-only-pglite";process.env.SESSION_SECRET="integration-test-session-secret-over-32-characters";process.env.TWITCH_WEBHOOK_SECRET="integration-test-webhook-secret-over-32-characters";process.env.TWITCH_BROADCASTER_ID="channel-1";process.env.APP_ORIGIN="https://test.example";await state.db.exec(await readFile("db/001_core.sql","utf8"));await state.db.exec(await readFile("db/002-portfolio.sql","utf8"));},30000);
afterAll(async()=>{await state.db.close();});
function req(path:string,owner:string,payload:unknown,method="POST"){return new Request("https://test.example"+path,{method,headers:{origin:"https://test.example","content-type":"application/json",cookie:"work_session="+sign({kind:"session",sub:owner,role:"judge",exp:Date.now()+60000})},body:JSON.stringify(payload)});}

import {POST as offer} from "../app/api/reloop/route";
import {POST as claim,PATCH as confirm} from "../app/api/reloop/claims/route";

describe("PostgreSQL product and ownership flows",()=>{
it("isolates saved work by owner and purges only expired records",async()=>{
  const rows=(await state.db.query<{id:string}>("INSERT INTO portfolio_runs(owner,app,payload,expires_at) VALUES ('owner-a','lessonscript','{\"title\":\"Current\"}',now()+interval '1 day'),('owner-b','lessonscript','{}',now()+interval '1 day'),('owner-a','lessonscript','{\"title\":\"Expired\"}',now()-interval '1 hour') RETURNING id")).rows;
  const token=sign({kind:"session",sub:"owner-a",role:"judge",exp:Date.now()+60000});
  const read=await history(new Request("https://test.example/api/lab/runs",{headers:{cookie:"work_session="+token}}));expect((await read.json()).runs.map((r:{id:string})=>r.id)).toEqual([rows[0].id]);
  await removeRun(req("/api/lab/runs","owner-b",{id:rows[0].id},"DELETE"));expect((await state.db.query("SELECT id FROM portfolio_runs WHERE id=$1",[rows[0].id])).rows).toHaveLength(1);
  process.env.CRON_SECRET="integration-cron-secret-at-least-32-characters";
  expect((await cleanup(new Request("https://test.example/api/internal/cleanup"))).status).toBe(401);
  const cleared=await cleanup(new Request("https://test.example/api/internal/cleanup",{headers:{authorization:`Bearer ${process.env.CRON_SECRET}`}}));expect(cleared.status).toBe(200);expect((await state.db.query("SELECT id FROM portfolio_runs")).rows).toHaveLength(2);
 });
it("prevents overclaiming and requires donor confirmation",async()=>{
  const created=await offer(req("/api/reloop","donor",{title:"Cardboard",material:"paper",grams:500,units:3,district:"Test district",days:1}));expect(created.status).toBe(201);const {id}=await created.json();
  const requests=await Promise.all([claim(req("/api/reloop/claims","alice",{itemId:id,units:2})),claim(req("/api/reloop/claims","bob",{itemId:id,units:2}))]);expect(requests.map(r=>r.status).sort()).toEqual([201,409]);
  const winner=requests.find(r=>r.status===201)!;const reservation=await winner.json();expect((await confirm(req("/api/reloop/claims","mallory",{id:reservation.id},"PATCH"))).status).toBe(409);expect((await confirm(req("/api/reloop/claims","donor",{id:reservation.id},"PATCH"))).status).toBe(200);expect((await confirm(req("/api/reloop/claims","donor",{id:reservation.id},"PATCH"))).status).toBe(409);
  const {rows}=await state.db.query<{remaining:number}>("SELECT remaining FROM reloop_items WHERE id=$1",[id]);expect(rows[0].remaining).toBe(1);
 });
it("rejects unauthenticated and cross-origin writes",async()=>{const r=await offer(new Request("https://test.example/api/reloop",{method:"POST",headers:{origin:"https://evil.example","content-type":"application/json"},body:"{}"}));expect(r.status).toBe(403);});
});
