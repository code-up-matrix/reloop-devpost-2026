"use client";
import Link from "next/link";
import type {ReactNode} from "react";
export async function request<T>(path:string,body?:unknown,method=body?"POST":"GET"):Promise<T>{
  const r=await fetch(path,{method,headers:body?{"Content-Type":"application/json"}:undefined,body:body?JSON.stringify(body):undefined});
  const data=await r.json();if(!r.ok)throw new Error(data.error||"Request failed.");return data as T;
}
export function ErrorNote({message}:{message:string}){return message?<p className="lab-error" role="alert">{message} {message.includes("access code")&&<Link href="/access">Open workspace access →</Link>}</p>:null;}
export function Shell({name,tagline,eyebrow,children}:{name:string;tagline:string;eyebrow:string;children:ReactNode}){return <main className="lab-shell"><nav><Link href="/" className="lab-brand"><span className="lab-symbol">↗</span> ReLoop</Link><div><Link href="/history">Recent work</Link><Link href="/access">Workspace access</Link></div></nav><header className="lab-hero"><span className="lab-eyebrow">{eyebrow}</span><h1>{name}<span>.</span></h1><p>{tagline}</p></header>{children}<footer>Built for a useful next step. <Link href="/">Back to ReLoop ↗</Link></footer></main>;}
export function Download({data,name}:{data:unknown;name:string}){return <button className="lab-secondary" onClick={()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));const a=document.createElement("a");a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);}}>Download evidence JSON ↓</button>;}
