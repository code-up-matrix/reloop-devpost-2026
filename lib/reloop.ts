import { z } from "zod";
export const ItemInput=z.object({title:z.string().trim().min(3).max(100),material:z.enum(["paper","wood","plastic","metal","fabric"]),grams:z.number().int().min(1).max(100000),units:z.number().int().min(1).max(10000),district:z.string().trim().min(2).max(80),days:z.number().int().min(1).max(30)});
export const ClaimInput=z.object({itemId:z.uuid(),units:z.number().int().min(1).max(10000)});
export function divertedKg(grams:number,units:number){return Math.round(grams*units)/1000;}
