import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, LockKeyhole, Sparkles } from "lucide-react";
import { useState } from "react";
import { supabase } from "../lib/supabase";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      if (!data?.user) {
        throw new Error("Login could not be completed.");
      }

      setMessage("Login successful. Opening your dashboard...");

      // Give Supabase a moment to save the session
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (err) {
      setError(
        err?.message ||
          "Unable to log in. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background:
        "radial-gradient(circle at 85% 10%, rgba(86,227,159,0.10), transparent 30%), #07111f",
      color: "#eef5fb",
      padding: "40px 20px",
      fontFamily: "Arial, sans-serif",
      boxSizing: "border-box",
    },

    container: {
      width: "100%",
      maxWidth: "500px",
      margin: "0 auto",
    },

    brand: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      marginBottom: "25px",
      fontSize: "23px",
      fontWeight: "700",
    },

    logo: {
      width: "42px",
      height: "42px",
      borderRadius: "12px",
      background: "#56e39f",
      color: "#07111f",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },

    card: {
      background: "rgba(12, 27, 43, 0.97)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "22px",
      padding: "32px",
      boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
      boxSizing: "border-box",
    },

    back: {
      display: "inline-flex",
      alignItems: "center",
      gap: "7px",
      color: "#8295aa",
      textDecoration: "none",
      fontSize: "13px",
      marginBottom: "28px",
    },

    icon: {
      width: "46px",
      height: "46px",
      borderRadius: "13px",
      background: "rgba(86,227,159,0.10)",
      color: "#56e39f",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "17px",
    },

    title: {
      fontSize: "31px",
      margin: "0 0 10px",
      letterSpacing: "-1px",
    },

    description: {
      color: "#8194a9",
      fontSize: "14px",
      lineHeight: "1.6",
      margin: "0 0 28px",
    },

    group: {
      marginBottom: "18px",
    },

    label: {
      display: "block",
      color: "#b9c7d5",
      fontSize: "12px",
      fontWeight: "600",
      marginBottom: "8px",
    },

    input: {
      width: "100%",
      height: "48px",
      boxSizing: "border-box",
      border: "1px solid rgba(255,255,255,0.09)",
      borderRadius: "10px",
      outline: "none",
      padding: "0 13px",
      background: "rgba(255,255,255,0.04)",
      color: "#ffffff",
      fontSize: "13px",
    },

    password: {
      position: "relative",
    },

    passwordInput: {
      width: "100%",
      height: "48px",
      boxSizing: "border-box",
      border: "1px solid rgba(255,255,255,0.09)",
      borderRadius: "10px",
      outline: "none",
      padding: "0 13px 0 40px",
      background: "rgba(255,255,255,0.04)",
      color: "#ffffff",
      fontSize: "13px",
    },

    forgot: {
      display: "block",
      textAlign: "right",
      marginTop: "8px",
      color: "#56e39f",
      fontSize: "11px",
      textDecoration: "none",
    },

    button: {
      width: "100%",
      height: "49px",
      marginTop: "8px",
      border: "none",
      borderRadius: "11px",
      background: loading ? "#3b9f70" : "#56e39f",
      color: "#06111c",
      fontSize: "14px",
      fontWeight: "700",
      cursor: loading ? "not-allowed" : "pointer",
      opacity: loading ? 0.8 : 1,
    },

    divider: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      margin: "25px 0 15px",
      color: "#617489",
      fontSize: "11px",
    },

    line: {
      flex: 1,
      height: "1px",
      background: "rgba(255,255,255,0.07)",
    },

    register: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "45px",
      borderRadius: "10px",
      border: "1px solid rgba(255,255,255,0.09)",
      color: "#d8e2eb",
      textDecoration: "none",
      fontSize: "12px",
      fontWeight: "700",
    },

    note: {
      textAlign: "center",
      color: "#63768a",
      fontSize: "10px",
      marginTop: "18px",
      lineHeight: "1.5",
    },

    error: {
      background: "rgba(255, 80, 80, 0.10)",
      border: "1px solid rgba(255, 80, 80, 0.25)",
      color: "#ff9b9b",
      padding: "11px 13px",
      borderRadius: "10px",
      fontSize: "12px",
      marginBottom: "18px",
      lineHeight: "1.5",
    },

    success: {
      background: "rgba(86,227,159,0.10)",
      border: "1px solid rgba(86,227,159,0.25)",
      color: "#56e39f",
      padding: "11px 13px",
      borderRadius: "10px",
      fontSize: "12px",
      marginBottom: "18px",
      lineHeight: "1.5",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* BRAND */}
        <div style={styles.brand}>
          <div style={styles.logo}>
            <Sparkles size={20} />
          </div>

          <div>
            HELM<span style={{ color: "#56e39f" }}>Ent</span>
          </div>
        </div>

        {/* LOGIN CARD */}
        <div style={styles.card}>

          <Link to="/" style={styles.back}>
            <ArrowLeft size={16} />
            Back to home
          </Link>

          <div style={styles.icon}>
            <LockKeyhole size={21} />
          </div>

          <h1 style={styles.title}>Welcome back</h1>

          <p style={styles.description}>
            Log in to your HELMEnt account to view your rewards, tasks,
            referrals and withdrawal status.
          </p>

          {/* ERROR MESSAGE */}
          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          {/* SUCCESS MESSAGE */}
          {message && (
            <div style={styles.success}>
              {message}
            </div>
          )}

          <form onSubmit={handleLogin}>

            {/* EMAIL */}
            <div style={styles.group}>
              <label style={styles.label}>
                Email address
              </label>

              <input
                style={styles.input}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {/* PASSWORD */}
            <div style={styles.group}>
              <label style={styles.label}>
                Password
              </label>

              <div style={styles.password}>

                <LockKeyhole
                  size={17}
                  style={{
                    position: "absolute",
                    left: "13px",
                    top: "15px",
                    color: "#66798d",
                  }}
                />

                <input
                  style={styles.passwordInput}
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />

              </div>

              <Link
                to="/forgot-password"
                style={styles.forgot}
              >
                Forgot password?
              </Link>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              style={styles.button}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </button>

          </form>

          {/* REGISTER */}
          <div style={styles.divider}>
            <span style={styles.line}></span>
            <span>New to HELMEnt?</span>
            <span style={styles.line}></span>
          </div>

          <Link
            to="/register"
            style={styles.register}
          >
            Create a free account
          </Link>

        </div>

        <div style={styles.note}>
          Your account information is used to manage your HELMEnt rewards
          securely.
        </div>

      </div>
    </div>
  );
}

export default Login;