import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, LockKeyhole, Sparkles } from "lucide-react";
import { useState } from "react";
import { supabase } from "../lib/supabase";

function Register() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    referralCode: "",
    terms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    // Check terms
    if (!formData.terms) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }

    // Check password
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    // Check password contains letters and numbers
    const hasLetter = /[A-Za-z]/.test(formData.password);
    const hasNumber = /[0-9]/.test(formData.password);

    if (!hasLetter || !hasNumber) {
      setError("Password must contain both letters and numbers.");
      return;
    }

    try {
      setLoading(true);

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,

        options: {
          data: {
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
            phone: formData.phone.trim(),
            referral_code: formData.referralCode.trim(),
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      // If Supabase requires email confirmation
      if (data.user && !data.session) {
        setMessage(
          "Account created successfully! Please check your email to confirm your account before logging in."
        );

        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          password: "",
          referralCode: "",
          terms: false,
        });

        return;
      }

      // If user is immediately logged in
      if (data.session) {
        setMessage("Account created successfully! Redirecting...");

        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);

        return;
      }

      setMessage("Account created successfully! You can now log in.");
    } catch (err) {
      console.error("Registration error:", err);

      if (err.message?.toLowerCase().includes("user already registered")) {
        setError(
          "An account with this email already exists. Please log in instead."
        );
      } else if (err.message?.toLowerCase().includes("invalid email")) {
        setError("Please enter a valid email address.");
      } else if (err.message?.toLowerCase().includes("password")) {
        setError("Please choose a stronger password.");
      } else {
        setError(
          err.message || "Something went wrong. Please try again."
        );
      }
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

    row: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "13px",
    },

    group: {
      marginBottom: "17px",
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
      height: "46px",
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
      height: "46px",
      boxSizing: "border-box",
      border: "1px solid rgba(255,255,255,0.09)",
      borderRadius: "10px",
      outline: "none",
      padding: "0 13px 0 40px",
      background: "rgba(255,255,255,0.04)",
      color: "#ffffff",
      fontSize: "13px",
    },

    small: {
      display: "block",
      color: "#5e7185",
      fontSize: "10px",
      marginTop: "7px",
    },

    terms: {
      display: "flex",
      alignItems: "flex-start",
      gap: "9px",
      color: "#7d8fa3",
      fontSize: "11px",
      lineHeight: "1.5",
      margin: "4px 0 20px",
    },

    button: {
      width: "100%",
      height: "49px",
      border: "none",
      borderRadius: "11px",
      background: loading ? "#3b9f76" : "#56e39f",
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

    login: {
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
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "7px",
      color: "#63768a",
      fontSize: "10px",
      marginTop: "18px",
      textAlign: "center",
    },

    success: {
      background: "rgba(86,227,159,0.10)",
      border: "1px solid rgba(86,227,159,0.25)",
      color: "#56e39f",
      padding: "12px 14px",
      borderRadius: "10px",
      fontSize: "12px",
      lineHeight: "1.5",
      marginBottom: "18px",
    },

    error: {
      background: "rgba(255,80,80,0.10)",
      border: "1px solid rgba(255,80,80,0.25)",
      color: "#ff8d8d",
      padding: "12px 14px",
      borderRadius: "10px",
      fontSize: "12px",
      lineHeight: "1.5",
      marginBottom: "18px",
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
            HELM
            <span style={{ color: "#56e39f" }}>Ent</span>
          </div>
        </div>

        {/* CARD */}
        <div style={styles.card}>

          {/* BACK */}
          <Link to="/" style={styles.back}>
            <ArrowLeft size={16} />
            Back to home
          </Link>

          {/* ICON */}
          <div style={styles.icon}>
            <Sparkles size={21} />
          </div>

          {/* TITLE */}
          <h1 style={styles.title}>Create your account</h1>

          <p style={styles.description}>
            Join HELMEnt and start completing eligible tasks and earning
            rewards.
          </p>

          {/* SUCCESS MESSAGE */}
          {message && (
            <div style={styles.success}>
              <CheckCircle2
                size={15}
                style={{
                  verticalAlign: "middle",
                  marginRight: "6px",
                }}
              />
              {message}
            </div>
          )}

          {/* ERROR MESSAGE */}
          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit}>

            {/* FIRST + LAST NAME */}
            <div style={styles.row}>

              <div style={styles.group}>
                <label style={styles.label}>
                  First name
                </label>

                <input
                  style={styles.input}
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  required
                  autoComplete="given-name"
                />
              </div>

              <div style={styles.group}>
                <label style={styles.label}>
                  Last name
                </label>

                <input
                  style={styles.input}
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  required
                  autoComplete="family-name"
                />
              </div>

            </div>

            {/* EMAIL */}
            <div style={styles.group}>
              <label style={styles.label}>
                Email address
              </label>

              <input
                style={styles.input}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            {/* PHONE */}
            <div style={styles.group}>
              <label style={styles.label}>
                Phone number
              </label>

              <input
                style={styles.input}
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="08012345678"
                required
                autoComplete="tel"
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
                    top: "14px",
                    color: "#66798d",
                  }}
                />

                <input
                  style={styles.passwordInput}
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />

              </div>

              <small style={styles.small}>
                Use at least 8 characters with letters and numbers.
              </small>
            </div>

            {/* REFERRAL */}
            <div style={styles.group}>
              <label style={styles.label}>
                Referral code (optional)
              </label>

              <input
                style={styles.input}
                type="text"
                name="referralCode"
                value={formData.referralCode}
                onChange={handleChange}
                placeholder="Enter referral code"
              />
            </div>

            {/* TERMS */}
            <label style={styles.terms}>

              <input
                type="checkbox"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
                required
                style={{
                  accentColor: "#56e39f",
                  marginTop: "2px",
                }}
              />

              <span>
                I agree to HELMEnt's Terms of Service and
                Privacy Policy.
              </span>

            </label>

            {/* BUTTON */}
            <button
              type="submit"
              style={styles.button}
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

          </form>

          {/* LOGIN */}
          <div style={styles.divider}>
            <span style={styles.line}></span>

            <span>
              Already have an account?
            </span>

            <span style={styles.line}></span>
          </div>

          <Link
            to="/login"
            style={styles.login}
          >
            Log in to HELMEnt
          </Link>

        </div>

        {/* NOTE */}
        <div style={styles.note}>
          <CheckCircle2
            size={15}
            color="#56e39f"
          />

          No deposit is required to create an account.
        </div>

      </div>
    </div>
  );
}

export default Register;