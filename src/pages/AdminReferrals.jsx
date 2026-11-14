import {useEffect,useState} from "react";
import {useNavigate} from "react-router-dom";
import {ArrowLeft,RefreshCw,ShieldCheck} from "lucide-react";
import {supabase} from "../lib/supabase";

export default function AdminReferrals(){
 const navigate=useNavigate();const [rows,setRows]=useState([]);const [loading,setLoading]=useState(true);const [error,setError]=useState("");const [busy,setBusy]=useState(null);
 const load=async()=>{setLoading(true);setError("");try{
  const {data:{user},error:authError}=await supabase.auth.getUser();if(authError)throw authError;if(!user){navigate("/admin/login");return;}
  const {data:admin,error:adminError}=await supabase.from("admin_users").select("id").eq("id",user.id).maybeSingle();if(adminError)throw adminError;if(!admin){await supabase.auth.signOut();navigate("/admin/login");return;}
  const {data,error:e}=await supabase.from("referrals").select("*").order("created_at",{ascending:false});if(e)throw e;
  const ids=[...new Set((data||[]).flatMap(x=>[x.referrer_id,x.referred_user_id]))];let profiles=[];
  if(ids.length){const p=await supabase.from("profiles").select("id,first_name,last_name,phone").in("id",ids);if(p.error)throw p.error;profiles=p.data||[];}
  const map=new Map(profiles.map(p=>[p.id,p]));setRows((data||[]).map(x=>({...x,referrer:map.get(x.referrer_id),referred:map.get(x.referred_user_id)})));
 }catch(e){setError(e.message||"Unable to load referrals.");}finally{setLoading(false);}};
 useEffect(()=>{load();},[]);
 const update=async(row,status)=>{setBusy(row.id);setError("");try{const {error:e}=await supabase.from("referrals").update({status}).eq("id",row.id).eq("status","pending");if(e)throw e;await load();}catch(e){setError(e.message||"Unable to update referral.");}finally{setBusy(null);}};
 const name=p=>p?((p.first_name||"")+" "+(p.last_name||"")).trim()||p.phone||"User":"User";
 return <main style={{minHeight:"100vh",background:"#07111f",color:"#eef5fb",padding:24,fontFamily:"Arial,sans-serif"}}><div style={{maxWidth:1000,margin:"auto"}}>
 <button onClick={()=>navigate("/admin/dashboard")} style={{background:"none",border:0,color:"#56e39f",cursor:"pointer"}}><ArrowLeft size={16}/> Back to admin</button>
 <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap",margin:"22px 0"}}><div><span style={{color:"#56e39f"}}><ShieldCheck size={14}/> Administrator</span><h1 style={{margin:"8px 0"}}>Referral reviews</h1><p style={{color:"#8da1b5"}}>Approve qualifying referrals to credit the ₦500 reward once.</p></div><button onClick={load} style={{padding:10}}><RefreshCw size={16}/> Refresh</button></header>
 {error&&<p style={{background:"#421e29",padding:12}}>{error}</p>}
 {loading?<p>Loading referrals…</p>:rows.length===0?<p>No referrals yet.</p>:<div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:650}}><thead><tr>{["Referrer","New member","Date","Reward","Status","Action"].map(x=><th key={x} style={{textAlign:"left",padding:12,borderBottom:"1px solid #314357"}}>{x}</th>)}</tr></thead><tbody>{rows.map(row=><tr key={row.id}><td style={{padding:12,borderBottom:"1px solid #26394d"}}>{name(row.referrer)}</td><td style={{padding:12,borderBottom:"1px solid #26394d"}}>{name(row.referred)}</td><td style={{padding:12,borderBottom:"1px solid #26394d"}}>{new Date(row.created_at).toLocaleDateString("en-NG")}</td><td style={{padding:12,borderBottom:"1px solid #26394d"}}>₦{Number(row.reward||500).toLocaleString("en-NG")}</td><td style={{padding:12,borderBottom:"1px solid #26394d"}}>{row.status}</td><td style={{padding:12,borderBottom:"1px solid #26394d"}}>{row.status==="pending"?<div style={{display:"flex",gap:6}}><button disabled={busy===row.id} onClick={()=>update(row,"approved")}>Approve</button><button disabled={busy===row.id} onClick={()=>update(row,"rejected")}>Reject</button></div>:"—"}</td></tr>)}</tbody></table></div>}
 </div></main>;
}
