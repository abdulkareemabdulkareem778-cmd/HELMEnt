import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ProtectedRoute({ children, loginPath = "/login" }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let active = true;

    const verifySession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;
      setStatus(error || !data?.session ? "unauthenticated" : "authenticated");
    };

    verifySession();
    return () => { active = false; };
  }, []);

  if (status === "checking") {
    return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#07111f", color: "#dce5ee", fontFamily: "DM Sans, sans-serif" }}>Checking your session…</main>;
  }

  if (status === "unauthenticated") return <Navigate to={loginPath} replace />;
  return children;
}