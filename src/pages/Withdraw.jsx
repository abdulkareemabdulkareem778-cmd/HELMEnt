import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Wallet, Clock3, CheckCircle2 } from "lucide-react";
import { supabase } from "../lib/supabase";

const money = (n) => "₦" + Number(n || 0).toLocaleString("en-NG");
const shell = { minHeight:"100vh", background:"#07111f", color:"#eef5fb", padding:"28px 16px", fontFamily:"Arial,sans-serif" };
const card = { maxWidth:760, margin:"0 auto", background:"#0c1b2b", border:"1px solid rgba(255,255,255,.09)", borderRadius:18, padding:24 };
const field = { width:"100%", padding:13, borderRadius:9, border:"1px solid #26394d", background:"#081523", color:"#fff", boxSizing:"border-box", marginTop:6 };

export default function Withdraw() {
  const navigate = useNavigate();
  const [user,setUser]=useState(null);
  const [profile,setProfile]=useState(null);
  const [history,setHistory]=useState([]);
  const [requirements,setRequirements]=useState({tiktok:false,tasks:0,referrals:0});
  const [form,setForm]=useState({amount:"",bank_name:"",account_name:"",account_number:""});
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const {data:{user:current},error:userError}=await supabase.auth.getUser();
      if(userError) throw userError;
      if(!current){navigate("/login");return;}
      setUser(current);
      const [p,w,c,r,t] = await Promise.all([
        supabase.from("profiles").select("balance").eq("id",current.id).single(),
        supabase.from("withdrawals").select("*").eq("user_id",current.id).order("created_at",{ascending:false}),
        supabase.from("task_completions").select("task_id,status").eq("user_id",current.id),
        supabase.from("referrals").select("status").eq("referrer_id",current.id),
        supabase.from("tasks").select("id,title,reward")
      ]);
      for (const result of [p,w,c,r,t]) if(result.error) throw result.error;
      setProfile(p.data); setHistory(w.data||[]);
      const approved=(c.data||[]).filter(x=>x.status==="approved");
      const taskMap=new Map((t.data||[]).map(x=>[x.id,x]));
      const tiktok=approved.some(x=>{const task=taskMap.get(x.task_id);return task && (/tiktok|tik tok/i.test(task.title||"") || Number(task.reward)>=2000);});
      const tasks=new Set(approved.filter(x=>{const task=taskMap.get(x.task_id);return task && !(/tiktok|tik tok/i.test(task.title||"") || Number(task.reward)>=2000);}).map(x=>x.task_id)).size;
      const referrals=(r.data||[]).filter(x=>["approved","valid","completed"].includes(String(x.status).toLowerCase())).length;
      setRequirements({tiktok,tasks,referrals});
    } catch(e){setError(e.message||"Unable to load withdrawal details.");}
    finally{setLoading(false);}
  };

  useEffect(()=>{load();},[]);

  const eligible=requirements.tiktok && requirements.tasks>=5 && requirements.referrals>=15;
  const submit=async(e)=>{
    e.preventDefault(); setError("");setMessage("");
    const amount=Number(form.amount);
    if(!Number.isFinite(amount)||amount<2000||amount>50000){setError("Enter an amount between ₦2,000 and ₦50,000.");return;}
    if(amount>Number(profile?.balance||0)){setError("Your available balance is not enough for this withdrawal.");return;}
    setSaving(true);
    try{
      const {error:insertError}=await supabase.from("withdrawals").insert({
        user_id:user.id,amount,bank_name:form.bank_name.trim(),
        account_name:form.account_name.trim(),account_number:form.account_number.trim(),status:"pending"
      });
      if(insertError) throw insertError;
      setMessage("Withdrawal request submitted. Your balance has been reserved while the request is reviewed.");
      setForm({amount:"",bank_name:"",account_name:"",account_number:""});
      await load();
    }catch(e){setError(e.message||"Could not submit your withdrawal.");}
    finally{setSaving(false);}
  };

  if(loading)return <div style={shell}><div style={card}>Loading your withdrawal details…</div></div>;
  return <div style={shell}><div style={card}>
    <Link to="/dashboard" style={{color:"#56e39f",textDecoration:"none",display:"inline-flex",gap:8,alignItems:"center"}}><ArrowLeft size={17}/> Back to dashboard</Link>
    <div style={{display:"flex",alignItems:"center",gap:12,marginTop:24}}><Wallet color="#56e39f" size={28}/><div><h1 style={{margin:"0 0 5px"}}>Withdraw rewards</h1><span style={{color:"#8da1b5"}}>Request a payout to your Nigerian bank account.</span></div></div>
    {error&&<p role="alert" style={{background:"#421e29",padding:12,borderRadius:8,color:"#ffb7c2"}}>{error}</p>}
    {message&&<p role="status" style={{background:"#12382e",padding:12,borderRadius:8,color:"#8df0bd"}}>{message}</p>}
    <div style={{margin:"22px 0",padding:18,background:"#10253a",borderRadius:12}}>
      <div style={{color:"#8da1b5"}}>Available balance</div><div style={{fontSize:30,fontWeight:700,color:"#56e39f"}}>{money(profile?.balance)}</div>
      <small style={{color:"#8da1b5"}}>Minimum ₦2,000 · Maximum ₦50,000 per request</small>
    </div>
    <h3>Eligibility checklist</h3>
    {[[requirements.tiktok,"TikTok/social task approved"],[requirements.tasks>=5,requirements.tasks+" / 5 other approved tasks"],[requirements.referrals>=15,requirements.referrals+" / 15 valid referrals"]].map(([ok,label])=><div key={label} style={{display:"flex",gap:9,alignItems:"center",padding:"7px 0",color:ok?"#70e6a7":"#aab8c6"}}><CheckCircle2 size={17} color={ok?"#56e39f":"#68788a"}/>{label}</div>)}
    {!eligible&&<p style={{color:"#e8bf79",fontSize:13}}>You must complete all three requirements before submitting a withdrawal. The server checks these conditions again when you submit.</p>}
    <form onSubmit={submit} style={{marginTop:22,display:"grid",gap:14}}>
      <label>Withdrawal amount (₦)<input style={field} type="number" min="2000" max="50000" step="1" required value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/></label>
      <label>Bank name<input style={field} required maxLength="80" placeholder="e.g. Access Bank" value={form.bank_name} onChange={e=>setForm({...form,bank_name:e.target.value})}/></label>
      <label>Account name<input style={field} required maxLength="120" value={form.account_name} onChange={e=>setForm({...form,account_name:e.target.value})}/></label>
      <label>10-digit account number<input style={field} required inputMode="numeric" pattern="[0-9]{10}" maxLength="10" value={form.account_number} onChange={e=>setForm({...form,account_number:e.target.value.replace(/\D/g,"").slice(0,10)})}/></label>
      <button disabled={saving||!eligible} style={{padding:14,border:0,borderRadius:9,background:saving||!eligible?"#486052":"#56e39f",fontWeight:700,cursor:saving||!eligible?"not-allowed":"pointer"}}>{saving?"Submitting…":"Submit withdrawal request"}</button>
    </form>
    <h2 style={{marginTop:32}}>Withdrawal history</h2>
    {history.length===0?<p style={{color:"#8da1b5"}}>No withdrawal requests yet.</p>:history.map(item=><div key={item.id} style={{display:"flex",justifyContent:"space-between",gap:12,borderTop:"1px solid #26394d",padding:"13px 0"}}><div><strong>{money(item.amount)}</strong><div style={{fontSize:12,color:"#8da1b5"}}>{new Date(item.created_at).toLocaleString("en-NG")}</div></div><span style={{color:item.status==="approved"?"#56e39f":item.status==="rejected"?"#ff9b9b":"#e8bf79"}}>{item.status}</span></div>)}
    <p style={{color:"#71869a",fontSize:12,marginTop:22}}><Clock3 size={14} style={{verticalAlign:"middle"}}/> Requests are reviewed by the HELMEnt team. Rejected requests return the reserved amount to your balance.</p>
  </div></div>;
}
