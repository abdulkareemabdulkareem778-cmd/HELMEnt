import {useEffect,useState} from "react";
import {useNavigate} from "react-router-dom";
import {ArrowLeft,RefreshCw,ShieldCheck} from "lucide-react";
import {supabase} from "../lib/supabase";
import {notify} from "../components/ToastViewport";

export default function AdminWithdrawals(){
 const navigate=useNavigate();const [rows,setRows]=useState([]);const [loading,setLoading]=useState(true);const [error,setError]=useState("");const [busy,setBusy]=useState(null);
 const load=async()=>{setLoading(true);setError("");try{
  const {data:{user},error:authError}=await supabase.auth.getUser();if(authError)throw authError;if(!user){navigate("/admin/login");return;}
  const {data:admin,error:adminError}=await supabase.from("admin_users").select("id").eq("id",user.id).maybeSingle();if(adminError)throw adminError;if(!admin){await supabase.auth.signOut();navigate("/admin/login");return;}
  const {data,error:e}=await supabase.from("withdrawals").select("*").order("created_at",{ascending:false});if(e)throw e;
  const ids=[...new Set((data||[]).map(x=>x.user_id))];let profiles=[];
  if(ids.length){const p=await supabase.from("profiles").select("id,first_name,last_name,phone").in("id",ids);if(p.error)throw p.error;profiles=p.data||[];}
  const map=new Map(profiles.map(p=>[p.id,p]));setRows((data||[]).map(x=>({...x,profile:map.get(x.user_id)})));
 }catch(e){setError(e.message||"Unable to load withdrawals.");}finally{setLoading(false);}};
 useEffect(()=>{load();},[]);
 const update=async(row,status)=>{setBusy(row.id);setError("");try{const {error:e}=await supabase.from("withdrawals").update({status}).eq("id",row.id).eq("status","pending");if(e)throw e;notify(status==="approved"?"Withdrawal approved. Remember to complete the bank transfer.":"Withdrawal rejected and the reserved balance refunded.","success");await load();}catch(e){setError(e.message||"Unable to update request.");notify(e.message||"Unable to update request.","error");}finally{setBusy(null);}};
 return <main style={{minHeight:"100vh",background:"#07111f",color:"#eef5fb",padding:24,fontFamily:"Arial,sans-serif"}}><div style={{maxWidth:1050,margin:"auto"}}>
 <button onClick={()=>navigate("/admin/dashboard")} style={{background:"none",border:0,color:"#56e39f",cursor:"pointer"}}><ArrowLeft size={16}/> Back to admin</button>
 <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap",margin:"22px 0"}}><div><span style={{color:"#56e39f"}}><ShieldCheck size={14}/> Administrator</span><h1 style={{margin:"8px 0"}}>Withdrawal requests</h1><p style={{color:"#8da1b5"}}>Approve valid payouts or reject requests. Rejected requests are refunded automatically.</p></div><button onClick={load} style={{padding:10}}><RefreshCw size={16}/> Refresh</button></header>
 {error&&<p style={{background:"#421e29",padding:12}}>{error}</p>}
 {loading?<p>Loading requests…</p>:rows.length===0?<p>No withdrawal requests yet.</p>:<div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:780}}><thead><tr>{["User","Amount","Bank details","Requested","Status","Action"].map(x=><th key={x} style={{textAlign:"left",padding:12,borderBottom:"1px solid #314357"}}>{x}</th>)}</tr></thead><tbody>{rows.map(row=><tr key={row.id}><td style={{padding:12,borderBottom:"1px solid #26394d"}}>{row.profile?((row.profile.first_name||"")+" "+(row.profile.last_name||"")):"User"}<small style={{display:"block",color:"#8da1b5"}}>{row.profile?.phone||row.user_id}</small></td><td style={{padding:12}}>₦{Number(row.amount).toLocaleString("en-NG")}</td><td style={{padding:12}}>{row.bank_name}<small style={{display:"block",color:"#8da1b5"}}>{row.account_name} · {row.account_number}</small></td><td style={{padding:12}}>{new Date(row.created_at).toLocaleDateString("en-NG")}</td><td style={{padding:12}}>{row.status}</td><td style={{padding:12}}>{row.status==="pending"? <div style={{display:"flex",gap:6}}><button disabled={busy===row.id} onClick={()=>update(row,"approved")}>Approve</button><button disabled={busy===row.id} onClick={()=>update(row,"rejected")}>Reject</button></div>:"—"}</td></tr>)}</tbody></table></div>}
 </div></main>;
}
