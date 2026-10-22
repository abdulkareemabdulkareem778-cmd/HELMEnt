import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  ListTodo,
  ClipboardCheck,
  Wallet,
  UserPlus,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  RefreshCw,
  Clock3,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    users: 0,
    tasks: 0,
    pendingSubmissions: 0,
    pendingWithdrawals: 0,
    referrals: 0,
    completedSubmissions: 0,
    rejectedSubmissions: 0,
  });

  const [error, setError] = useState("");

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        navigate("/admin/login");
        return;
      }

      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (adminError) {
        throw adminError;
      }

      if (!admin) {
        await supabase.auth.signOut();
        navigate("/admin/login");
        return;
      }

      await loadStats();
    } catch (err) {
      console.error(err);
      setError("Unable to load admin dashboard.");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const [
        usersResult,
        tasksResult,
        pendingTasksResult,
        pendingWithdrawalsResult,
        referralsResult,
        completedResult,
        rejectedResult,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("tasks")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("task_completions")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),

        supabase
          .from("withdrawals")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),

        supabase
          .from("referrals")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("task_completions")
          .select("*", { count: "exact", head: true })
          .eq("status", "approved"),

        supabase
          .from("task_completions")
          .select("*", { count: "exact", head: true })
          .eq("status", "rejected"),
      ]);

      const results = [
        usersResult,
        tasksResult,
        pendingTasksResult,
        pendingWithdrawalsResult,
        referralsResult,
        completedResult,
        rejectedResult,
      ];

      const failed = results.find((result) => result.error);

      if (failed) {
        throw failed.error;
      }

      setStats({
        users: usersResult.count || 0,
        tasks: tasksResult.count || 0,
        pendingSubmissions: pendingTasksResult.count || 0,
        pendingWithdrawals: pendingWithdrawalsResult.count || 0,
        referrals: referralsResult.count || 0,
        completedSubmissions: completedResult.count || 0,
        rejectedSubmissions: rejectedResult.count || 0,
      });
    } catch (err) {
      console.error(err);

      setError(
        "Some dashboard statistics could not be loaded. Check your Supabase policies."
      );
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const goTo = (path) => {
    setSidebarOpen(false);
    navigate(path);
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loader"></div>
        <p>Loading HELMEnt Admin...</p>
      </div>
    );
  }

  return (
    <div className="admin-layout">

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="admin-overlay"
          onClick={closeSidebar}
        ></div>
      )}

      {/* SIDEBAR */}
      <aside
        className={`admin-sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >

        <div className="admin-brand">

          <div className="admin-brand-icon">
            <ShieldCheck size={21} />
          </div>

          <div>
            <strong>HELMEnt</strong>
            <span>ADMIN PANEL</span>
          </div>

          <button
            className="sidebar-close"
            onClick={closeSidebar}
          >
            <X size={21} />
          </button>

        </div>

        <nav className="admin-nav">

          {/* DASHBOARD */}
          <button
            className="admin-nav-item active"
            onClick={() => goTo("/admin/dashboard")}
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </button>

          {/* USERS */}
          <button
            className="admin-nav-item"
            onClick={() => goTo("/admin/users")}
          >
            <Users size={19} />
            <span>Users</span>
          </button>

          {/* TASKS */}
          <button
            className="admin-nav-item"
            onClick={() => goTo("/admin/tasks")}
          >
            <ListTodo size={19} />
            <span>Tasks</span>
          </button>

          {/* SUBMISSIONS */}
          <button
            className="admin-nav-item"
            onClick={() => goTo("/admin/submissions")}
          >
            <ClipboardCheck size={19} />
            <span>Submissions</span>

            {stats.pendingSubmissions > 0 && (
              <span className="nav-badge">
                {stats.pendingSubmissions}
              </span>
            )}
          </button>

          {/* WITHDRAWALS */}
          <button
            className="admin-nav-item"
            onClick={() => goTo("/admin/withdrawals")}
          >
            <Wallet size={19} />
            <span>Withdrawals</span>

            {stats.pendingWithdrawals > 0 && (
              <span className="nav-badge">
                {stats.pendingWithdrawals}
              </span>
            )}
          </button>

          {/* REFERRALS */}
          <button
            className="admin-nav-item"
            onClick={() => goTo("/admin/referrals")}
          >
            <UserPlus size={19} />
            <span>Referrals</span>
          </button>

          {/* SETTINGS */}
          <button
            className="admin-nav-item"
            onClick={() => goTo("/admin/settings")}
          >
            <Settings size={19} />
            <span>Settings</span>
          </button>

        </nav>

        <div className="admin-sidebar-bottom">

          <button
            className="admin-logout"
            onClick={handleLogout}
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>

        </div>

      </aside>

      {/* MAIN */}
      <main className="admin-main">

        {/* TOP BAR */}
        <header className="admin-topbar">

          <button
            className="admin-menu-button"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={23} />
          </button>

          <div>
            <h1>Dashboard</h1>
            <p>Manage your HELMEnt rewards platform.</p>
          </div>

          <button
            className="refresh-button"
            onClick={loadStats}
            title="Refresh statistics"
          >
            <RefreshCw size={18} />
          </button>

        </header>

        <div className="admin-content">

          {/* ERROR */}
          {error && (
            <div className="admin-alert">

              <span>{error}</span>

              <button onClick={loadStats}>
                Try again
              </button>

            </div>
          )}

          {/* WELCOME */}
          <section className="admin-welcome">

            <div>

              <span className="admin-eyebrow">
                <ShieldCheck size={15} />
                Administrator
              </span>

              <h2>
                Welcome to HELMEnt Admin
              </h2>

              <p>
                Monitor users, tasks, submissions and
                withdrawals from one place.
              </p>

            </div>

            <div className="admin-status">
              <span className="status-dot"></span>
              System active
            </div>

          </section>

          {/* STATISTICS */}
          <section className="stats-grid">

            <StatCard
              icon={<Users size={21} />}
              label="Total Users"
              value={stats.users}
              description="Registered accounts"
            />

            <StatCard
              icon={<ListTodo size={21} />}
              label="Total Tasks"
              value={stats.tasks}
              description="Available tasks"
              onClick={() => goTo("/admin/tasks")}
            />

            <StatCard
              icon={<ClipboardCheck size={21} />}
              label="Pending Submissions"
              value={stats.pendingSubmissions}
              description="Need review"
              highlight
              onClick={() => goTo("/admin/submissions")}
            />

            <StatCard
              icon={<Wallet size={21} />}
              label="Pending Withdrawals"
              value={stats.pendingWithdrawals}
              description="Need processing"
              highlight
              onClick={() => goTo("/admin/withdrawals")}
            />

          </section>

          {/* SECONDARY STATS */}
          <section className="secondary-grid">

            <MiniCard
              icon={<UserPlus size={19} />}
              label="Referrals"
              value={stats.referrals}
              onClick={() => goTo("/admin/referrals")}
            />

            <MiniCard
              icon={<CheckCircle2 size={19} />}
              label="Approved Tasks"
              value={stats.completedSubmissions}
              onClick={() => goTo("/admin/submissions")}
            />

            <MiniCard
              icon={<XCircle size={19} />}
              label="Rejected Tasks"
              value={stats.rejectedSubmissions}
              onClick={() => goTo("/admin/submissions")}
            />

          </section>

          {/* QUICK ACTIONS */}
          <section className="dashboard-section">

            <div className="section-title">

              <div>

                <h3>Admin sections</h3>

                <p>
                  Manage different parts of the platform.
                </p>

              </div>

            </div>

            <div className="quick-actions">

              <QuickAction
                icon={<Users size={22} />}
                title="Manage Users"
                description="View registered HELMEnt users."
                onClick={() => goTo("/admin/users")}
              />

              <QuickAction
                icon={<ListTodo size={22} />}
                title="Manage Tasks"
                description="Create and manage platform tasks."
                onClick={() => goTo("/admin/tasks")}
              />

              <QuickAction
                icon={<ClipboardCheck size={22} />}
                title="Review Submissions"
                description="Approve or reject submitted tasks."
                badge={stats.pendingSubmissions}
                onClick={() => goTo("/admin/submissions")}
              />

              <QuickAction
                icon={<Wallet size={22} />}
                title="Process Withdrawals"
                description="Review user withdrawal requests."
                badge={stats.pendingWithdrawals}
                onClick={() => goTo("/admin/withdrawals")}
              />

            </div>

          </section>

          {/* SYSTEM INFO */}
          <section className="dashboard-section">

            <div className="section-title">

              <div>

                <h3>Platform status</h3>

                <p>
                  Current HELMEnt system information.
                </p>

              </div>

            </div>

            <div className="system-card">

              <div className="system-item">
                <span>Minimum withdrawal</span>
                <strong>₦2,000</strong>
              </div>

              <div className="system-item">
                <span>Maximum withdrawal</span>
                <strong>₦50,000</strong>
              </div>

              <div className="system-item">
                <span>Task reward</span>
                <strong>₦50</strong>
              </div>

              <div className="system-item">
                <span>Referral reward</span>
                <strong>₦500</strong>
              </div>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}


/* =========================
   STAT CARD
========================= */

function StatCard({
  icon,
  label,
  value,
  description,
  highlight = false,
  onClick,
}) {
  return (
    <button
      className={`stat-card ${
        highlight ? "stat-highlight" : ""
      }`}
      onClick={onClick}
      type="button"
    >

      <div className="stat-card-top">

        <div className="stat-icon">
          {icon}
        </div>

        {highlight && (
          <Clock3 size={17} />
        )}

      </div>

      <strong className="stat-value">
        {value}
      </strong>

      <span className="stat-label">
        {label}
      </span>

      <small>
        {description}
      </small>

    </button>
  );
}


/* =========================
   MINI CARD
========================= */

function MiniCard({
  icon,
  label,
  value,
  onClick,
}) {
  return (
    <button
      className="mini-card"
      onClick={onClick}
      type="button"
    >

      <div className="mini-icon">
        {icon}
      </div>

      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>

    </button>
  );
}


/* =========================
   QUICK ACTION
========================= */

function QuickAction({
  icon,
  title,
  description,
  badge,
  onClick,
}) {
  return (
    <button
      className="quick-action"
      onClick={onClick}
      type="button"
    >

      <div className="quick-action-icon">
        {icon}
      </div>

      <div className="quick-action-content">

        <strong>{title}</strong>

        <span>{description}</span>

      </div>

      {badge > 0 && (
        <span className="quick-badge">
          {badge}
        </span>
      )}

    </button>
  );
}