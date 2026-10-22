import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Register from "./pages/register";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminTasks from "./pages/AdminTasks";
import AdminSubmissions from "./pages/AdminSubmissions";

import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Gift,
  Menu,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";

import { useState } from "react";

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      question: "Do I need to deposit money?",
      answer:
        "No. HELMEnt is designed so that users do not need to make a deposit to participate in the available rewards and tasks.",
    },
    {
      question: "How much can I withdraw?",
      answer:
        "Eligible users can request any withdrawal amount from ₦2,000 up to ₦50,000, subject to the platform's requirements.",
    },
    {
      question: "How much is each task worth?",
      answer:
        "Each successfully completed eligible task currently carries a reward of ₦50.",
    },
    {
      question: "How much do referrals earn?",
      answer:
        "A valid referral earns ₦500 when the referral meets the conditions defined by HELMEnt.",
    },
    {
      question: "How long does a withdrawal take?",
      answer:
        "Withdrawal requests are reviewed by the HELMEnt team and may take up to 5 business days to process.",
    },
  ];

  return (
    <div className="app">

      {/* =========================
          NAVBAR
      ========================= */}

      <header className="navbar">
        <div className="container nav-inner">

          <Link to="/" className="logo">
            <span className="logo-mark">
              <Sparkles size={18} />
            </span>

            <span>
              HELM<span>Ent</span>
            </span>
          </Link>

          <nav className={`nav-links ${menuOpen ? "open" : ""}`}>

            <a
              href="#home"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </a>

            <a
              href="#how-it-works"
              onClick={() => setMenuOpen(false)}
            >
              How it works
            </a>

            <a
              href="#rewards"
              onClick={() => setMenuOpen(false)}
            >
              Rewards
            </a>

            <a
              href="#faq"
              onClick={() => setMenuOpen(false)}
            >
              FAQ
            </a>

            {/* MOBILE ACTIONS */}

            <div className="mobile-actions">

              <Link
                to="/login"
                className="btn btn-secondary"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>

              <Link
                to="/register"
                className="btn btn-primary"
                onClick={() => setMenuOpen(false)}
              >
                Get Started
              </Link>

            </div>

          </nav>

          {/* DESKTOP ACTIONS */}

          <div className="nav-actions">

            <Link
              to="/login"
              className="login-btn"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="btn btn-primary small"
            >
              Get Started
            </Link>

          </div>

          {/* MOBILE MENU */}

          <button
            className="menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X size={25} />
            ) : (
              <Menu size={25} />
            )}
          </button>

        </div>
      </header>


      {/* =========================
          HERO
      ========================= */}

      <main>

        <section
          className="hero"
          id="home"
        >

          <div className="hero-glow glow-one"></div>
          <div className="hero-glow glow-two"></div>

          <div className="container hero-grid">

            <div className="hero-content">

              <div className="eyebrow">
                <span className="pulse-dot"></span>
                Simple tasks. Real rewards.
              </div>

              <h1>
                Complete tasks.
                <br />
                <span>Earn rewards.</span>
              </h1>

              <p className="hero-text">
                Welcome to HELMEnt — a rewards platform where you
                can complete eligible tasks, refer people and build
                your available balance.
              </p>

              <div className="hero-buttons">

                <Link
                  to="/register"
                  className="btn btn-primary hero-btn"
                >
                  Create Free Account
                  <ArrowRight size={18} />
                </Link>

                <a
                  href="#how-it-works"
                  className="learn-link"
                >
                  See how it works
                  <ArrowRight size={16} />
                </a>

              </div>

              <div className="trust-row">

                <div className="trust-item">
                  <ShieldCheck size={17} />
                  No deposit required
                </div>

                <div className="trust-item">
                  <CheckCircle2 size={17} />
                  Simple requirements
                </div>

              </div>

            </div>


            {/* EARNING CARD */}

            <div className="hero-card-wrapper">

              <div className="floating-badge badge-top">
                <CheckCircle2 size={15} />
                Rewards available
              </div>

              <div className="earning-card">

                <div className="card-top">

                  <div>

                    <p className="muted">
                      Available balance
                    </p>

                    <h2>₦9,750</h2>

                  </div>

                  <div className="wallet-icon">
                    <Wallet size={22} />
                  </div>

                </div>

                <div className="balance-line">
                  <span></span>
                </div>

                <div className="card-stats">

                  <div>
                    <span>Tasks</span>
                    <strong>5 × ₦50</strong>
                  </div>

                  <div>
                    <span>Referrals</span>
                    <strong>15 × ₦500</strong>
                  </div>

                </div>

                <div className="reward-highlight">

                  <div className="reward-icon">
                    <Gift size={19} />
                  </div>

                  <div>
                    <small>Social reward</small>
                    <strong>₦2,000</strong>
                  </div>

                  <CheckCircle2
                    className="reward-check"
                    size={20}
                  />

                </div>

                <Link
                  to="/login"
                  className="withdraw-preview"
                >
                  Withdrawal available
                  <ArrowRight size={17} />
                </Link>

              </div>

              <div className="floating-badge badge-bottom">
                <Users size={15} />
                Referral reward +₦500
              </div>

            </div>

          </div>

        </section>


        {/* =========================
            REWARDS
        ========================= */}

        <section
          className="rewards-section"
          id="rewards"
        >

          <div className="container">

            <div className="section-heading center">

              <div className="section-label">
                <Zap size={15} />
                Earning opportunities
              </div>

              <h2>
                Different ways to earn
              </h2>

              <p>
                Complete eligible activities and build your
                balance while working toward the withdrawal
                requirements.
              </p>

            </div>

            <div className="reward-grid">

              <RewardCard
                icon={<Gift size={23} />}
                amount="₦2,000"
                title="Social Reward"
                description="Receive the available social reward after completing the required verification."
              />

              <RewardCard
                icon={<Zap size={23} />}
                amount="₦50"
                title="Per Task"
                description="Complete eligible tasks and receive ₦50 for each successfully completed task."
              />

              <RewardCard
                icon={<Users size={23} />}
                amount="₦500"
                title="Per Referral"
                description="Invite people using your referral link and earn when their referral qualifies."
              />

              <RewardCard
                icon={<Wallet size={23} />}
                amount="₦50,000"
                title="Maximum Withdrawal"
                description="Eligible users can request any amount between ₦2,000 and ₦50,000."
              />

            </div>

          </div>

        </section>


        {/* =========================
            HOW IT WORKS
        ========================= */}

        <section
          className="steps-section"
          id="how-it-works"
        >

          <div className="container">

            <div className="section-heading">

              <div className="section-label">
                <Sparkles size={15} />
                Getting started
              </div>

              <h2>
                How HELMEnt works
              </h2>

              <p>
                Getting started is simple. Create an account,
                complete the requirements and manage your rewards
                from your dashboard.
              </p>

            </div>

            <div className="steps-grid">

              <Step
                number="01"
                title="Create your account"
                description="Register your HELMEnt account and access your personal rewards dashboard."
              />

              <Step
                number="02"
                title="Complete requirements"
                description="Complete at least 5 eligible tasks, meet the referral requirement and complete the social requirement."
              />

              <Step
                number="03"
                title="Build your balance"
                description="Your eligible task and referral rewards are reflected in your available balance."
              />

              <Step
                number="04"
                title="Request withdrawal"
                description="When eligible, request any amount from ₦2,000 to ₦50,000 and wait for review."
              />

            </div>

          </div>

        </section>


        {/* =========================
            REQUIREMENTS
        ========================= */}

        <section className="requirements-section">

          <div className="container requirement-box">

            <div className="requirement-content">

              <div className="section-label">
                <ShieldCheck size={15} />
                Withdrawal eligibility
              </div>

              <h2>
                Know the requirements before you withdraw.
              </h2>

              <p>
                To keep the reward system organized, withdrawals
                are only available to users who have completed
                the required conditions.
              </p>

              <div className="requirements-list">

                <Requirement
                  text="Follow the HELMEnt TikTok account"
                />

                <Requirement
                  text="Have at least 15 valid referrals"
                />

                <Requirement
                  text="Complete at least 5 eligible tasks"
                />

                <Requirement
                  text="Have at least ₦2,000 available"
                />

              </div>

            </div>

            <div className="withdraw-box">

              <Clock3 size={27} />

              <span>
                Processing time
              </span>

              <strong>
                Up to 5
              </strong>

              <small>
                business days
              </small>

              <p>
                Every withdrawal request is reviewed before
                it is approved.
              </p>

            </div>

          </div>

        </section>


        {/* =========================
            REFERRAL
        ========================= */}

        <section className="referral-section">

          <div className="container referral-card">

            <div className="referral-icon">
              <Users size={28} />
            </div>

            <div>

              <span className="mini-label">
                Referral program
              </span>

              <h2>
                Share HELMEnt with your network.
              </h2>

              <p>
                Every user gets a personal referral link.
                Eligible referrals can earn you{" "}
                <strong>₦500 each</strong>.
              </p>

            </div>

            <Link
              to="/register"
              className="btn btn-primary"
            >
              Get Started
              <ArrowRight size={17} />
            </Link>

          </div>

        </section>


        {/* =========================
            FAQ
        ========================= */}

        <section
          className="faq-section"
          id="faq"
        >

          <div className="container faq-grid">

            <div className="section-heading">

              <div className="section-label">
                <Sparkles size={15} />
                FAQ
              </div>

              <h2>
                Frequently asked questions
              </h2>

              <p>
                Everything you need to know before getting
                started with HELMEnt.
              </p>

            </div>

            <div className="faq-list">

              {faqs.map((faq, index) => (

                <div
                  className={`faq-item ${
                    openFaq === index ? "active" : ""
                  }`}
                  key={faq.question}
                >

                  <button
                    className="faq-question"
                    onClick={() =>
                      setOpenFaq(
                        openFaq === index
                          ? null
                          : index
                      )
                    }
                  >

                    <span>
                      {faq.question}
                    </span>

                    <ChevronDown size={19} />

                  </button>

                  {openFaq === index && (

                    <div className="faq-answer">
                      <p>
                        {faq.answer}
                      </p>
                    </div>

                  )}

                </div>

              ))}

            </div>

          </div>

        </section>

      </main>


      {/* =========================
          FOOTER
      ========================= */}

      <footer className="footer">

        <div className="container footer-grid">

          <div>

            <Link
              to="/"
              className="logo footer-logo"
            >

              <span className="logo-mark">
                <Sparkles size={18} />
              </span>

              <span>
                HELM<span>Ent</span>
              </span>

            </Link>

            <p>
              A simple rewards platform for eligible tasks,
              referrals and withdrawals.
            </p>

          </div>

          <div className="footer-links">

            <div>

              <strong>
                Platform
              </strong>

              <a href="#how-it-works">
                How it works
              </a>

              <a href="#rewards">
                Rewards
              </a>

              <a href="#faq">
                FAQ
              </a>

            </div>

            <div>

              <strong>
                Account
              </strong>

              <Link to="/login">
                Login
              </Link>

              <Link to="/register">
                Register
              </Link>

              <Link to="/dashboard">
                Dashboard
              </Link>

            </div>

            <div>

              <strong>
                Legal
              </strong>

              <a href="#home">
                Terms
              </a>

              <a href="#home">
                Privacy
              </a>

            </div>

          </div>

        </div>

        <div className="container copyright">

          © {new Date().getFullYear()} HELMEnt.
          All rights reserved.

        </div>

      </footer>

    </div>
  );
}


/* =========================
   REWARD CARD
========================= */

function RewardCard({
  icon,
  amount,
  title,
  description,
}) {
  return (
    <div className="reward-card">

      <div className="reward-card-icon">
        {icon}
      </div>

      <span className="reward-amount">
        {amount}
      </span>

      <h3>
        {title}
      </h3>

      <p>
        {description}
      </p>

      <ArrowRight
        className="card-arrow"
        size={18}
      />

    </div>
  );
}


/* =========================
   STEP
========================= */

function Step({
  number,
  title,
  description,
}) {
  return (
    <div className="step">

      <span className="step-number">
        {number}
      </span>

      <div className="step-line"></div>

      <h3>
        {title}
      </h3>

      <p>
        {description}
      </p>

    </div>
  );
}


/* =========================
   REQUIREMENT
========================= */

function Requirement({ text }) {
  return (
    <div className="requirement">

      <CheckCircle2 size={19} />

      <span>
        {text}
      </span>

    </div>
  );
}


/* =========================
   APP ROUTES
========================= */

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =========================
            PUBLIC WEBSITE
        ========================= */}

        <Route
          path="/"
          element={<Home />}
        />


        {/* =========================
            USER AUTHENTICATION
        ========================= */}

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/login"
          element={<Login />}
        />


        {/* =========================
            USER DASHBOARD
        ========================= */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />


        {/* =========================
            ADMIN
        ========================= */}

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/users"
          element={<AdminUsers />}
        />

        <Route
          path="/admin/tasks"
          element={<AdminTasks />}
        />

        <Route
          path="/admin/submissions"
          element={<AdminSubmissions />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;