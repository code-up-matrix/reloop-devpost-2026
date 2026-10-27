import { db } from "@/lib/db";
import { body, handle, json } from "@/lib/security";
import { guard } from "@/lib/portfolio";
import { ItemInput } from "@/lib/reloop";
export const runtime="nodejs";
export async function GET(request:Request){return handle(async()=>{
  const who=await guard(request,"reloop-read",30);const sql=db();
  const items=await sql`SELECT id,title,material,grams,remaining,district,expires_at,owner=${who.sub} AS mine FROM reloop_items WHERE remaining>0 AND expires_at>now() ORDER BY created_at DESC LIMIT 50`;
  const claims=await sql`SELECT c.id,c.units,c.confirmed,i.title,i.grams,i.district,i.owner=${who.sub} AS donor FROM reloop_claims c JOIN reloop_items i ON i.id=c.item_id WHERE c.owner=${who.sub} OR i.owner=${who.sub} ORDER BY c.created_at DESC LIMIT 100`;
  return json({items,claims});
});}
export async function POST(request:Request){return handle(async()=>{
  const who=await guard(request,"reloop",10);const input=await body(request,ItemInput);const sql=db();
  const [item]=await sql`INSERT INTO reloop_items(owner,title,material,grams,units,remaining,district,expires_at) VALUES(${who.sub},${input.title},${input.material},${input.grams},${input.units},${input.units},${input.district},now()+${input.days}*interval '1 day') RETURNING id`;
  return json(item,201);
});}
