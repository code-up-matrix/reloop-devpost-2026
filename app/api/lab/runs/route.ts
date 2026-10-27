import {z} from "zod";
import {db} from "@/lib/db";
import {body,handle,json} from "@/lib/security";
import {guard} from "@/lib/portfolio";
export const runtime="nodejs";
export async function GET(request:Request){return handle(async()=>{
 const who=await guard(request,"history",20);const sql=db();
 const runs=await sql`SELECT id,app,payload,created_at,expires_at FROM portfolio_runs WHERE owner=${who.sub} AND expires_at>now() ORDER BY created_at DESC LIMIT 50`;
 return json({runs});
});}
export async function DELETE(request:Request){return handle(async()=>{
 const who=await guard(request,"history-delete",10);const {id}=await body(request,z.object({id:z.uuid()}));const sql=db();
 await sql`DELETE FROM portfolio_runs WHERE id=${id} AND owner=${who.sub}`;
 return json({ok:true,notice:"Local record removed. This does not remove copies retained by an external provider."});
});}
