import {db} from "@/lib/db";
import {AppError,equal,handle,json,required} from "@/lib/security";
export const runtime="nodejs";
export async function GET(request:Request){return handle(async()=>{
 const secret=required("CRON_SECRET");
 if(secret.length<32||!equal(request.headers.get("authorization")||"",`Bearer ${secret}`))throw new AppError(401,"Unauthorized.");
 const sql=db();
 const [counts]=await sql`WITH runs AS (DELETE FROM portfolio_runs WHERE expires_at<=now() RETURNING id), limits AS (DELETE FROM rate_limits WHERE bucket<floor(extract(epoch from now())/60)-1440 RETURNING key), receipts AS (DELETE FROM twitch_receipts WHERE received_at<now()-interval '2 days' RETURNING id) SELECT (SELECT count(*) FROM runs) AS expired_runs,(SELECT count(*) FROM limits) AS old_limits,(SELECT count(*) FROM receipts) AS old_receipts`;
 return json({ok:true,counts});
});}
