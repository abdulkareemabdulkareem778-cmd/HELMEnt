import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import "./ToastViewport.css";

export function notify(message, type = "success") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("helment:toast", { detail: { message, type } }));
}

export default function ToastViewport() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const add = (event) => {
      const item = { id: Date.now() + Math.random(), message: event.detail?.message || "Something happened.", type: event.detail?.type || "info" };
      setItems((current) => [...current.slice(-2), item]);
      window.setTimeout(() => setItems((current) => current.filter((entry) => entry.id !== item.id)), 4200);
    };
    const onError = () => add({ detail: { message: "Something went wrong. Please try again.", type: "error" } });
    const onReject = () => add({ detail: { message: "We couldn't complete that action. Please try again.", type: "error" } });
    window.addEventListener("helment:toast", add);
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onReject);
    return () => {
      window.removeEventListener("helment:toast", add);
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onReject);
    };
  }, []);
  return <div className="toast-viewport" aria-live="polite" aria-atomic="false">
    {items.map((item) => {
      const Icon = item.type === "error" ? AlertCircle : item.type === "info" ? Info : CheckCircle2;
      return <div className={`helment-toast toast-${item.type}`} role={item.type === "error" ? "alert" : "status"} key={item.id}>
        <Icon size={19}/><span>{item.message}</span><button aria-label="Dismiss notification" onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))}><X size={16}/></button>
      </div>;
    })}
  </div>;
}