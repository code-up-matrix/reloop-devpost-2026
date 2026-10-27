import { z } from "zod";
import { db } from "@/lib/db";
import { AppError, body, handle, json } from "@/lib/security";
import { guard } from "@/lib/portfolio";
import { ClaimInput } from "@/lib/reloop";
export const runtime="nodejs";
export async function POST(request:Request){return handle(async()=>{
  const who=await guard(request,"reloop-claim",10);const input=await body(request,ClaimInput);const sql=db();
  // Conditional decrement and claim insert are one atomic statement, including under contention.
  const rows=await sql`WITH item AS (UPDATE reloop_items SET remaining=remaining-${input.units} WHERE id=${input.itemId} AND remaining>=${input.units} AND expires_at>now() AND owner<>${who.sub} RETURNING id) INSERT INTO reloop_claims(item_id,owner,units) SELECT id,${who.sub},${input.units} FROM item RETURNING id`;
  if(!rows.length)throw new AppError(409,"That quantity is unavailable, expired, or belongs to you.");
  return json(rows[0],201);
});}
export async function PATCH(request:Request){return handle(async()=>{
  const who=await guard(request,"reloop-confirm",10);const {id}=await body(request,z.object({id:z.uuid()}));const sql=db();
  const rows=await sql`UPDATE reloop_claims c SET confirmed=true FROM reloop_items i WHERE c.id=${id} AND i.id=c.item_id AND i.owner=${who.sub} AND NOT c.confirmed RETURNING c.id`;
  if(!rows.length)throw new AppError(409,"Only the donor can confirm an unconfirmed handover.");
  return json({ok:true});
});}
