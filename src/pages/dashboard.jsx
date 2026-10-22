import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Copy,
  ExternalLink,
  Gift,
  Info,
  LogOut,
  Menu,
  Send,
  Sparkles,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { supabase } from "../lib/supabase";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskCompletions, setTaskCompletions] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);

  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [selectedTask, setSelectedTask] = useState(null);
  const [proof, setProof] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        navigate("/login");
        return;
      }

      setUser(user);

      const [
        profileResult,
        tasksResult,
        completionsResult,
        referralsResult,
        withdrawalsResult,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle(),

        supabase
          .from("tasks")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: true }),

        supabase
          .from("task_completions")
          .select("*")
          .eq("user_id", user.id)
          .order("completed_at", { ascending: false }),

        supabase
          .from("referrals")
          .select("*")
          .or(`referrer_id.eq.${user.id},referred_user_id.eq.${user.id}`)
          .order("created_at", { ascending: false }),

        supabase
          .from("withdrawals")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (profileResult.error) {
        throw profileResult.error;
      }

      if (tasksResult.error) {
        throw tasksResult.error;
      }

      if (completionsResult.error) {
        throw completionsResult.error;
      }

      if (referralsResult.error) {
        throw referralsResult.error;
      }

      if (withdrawalsResult.error) {
        throw withdrawalsResult.error;
      }

      setProfile(profileResult.data);
      setTasks(tasksResult.data || []);
      setTaskCompletions(completionsResult.data || []);
      setReferrals(referralsResult.data || []);
      setWithdrawals(withdrawalsResult.data || []);
    } catch (err) {
      console.error("Dashboard loading error:", err);
      setError(
        err?.message ||
          "Unable to load your dashboard. Please refresh the page."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const referralCode =
    profile?.referral_code ||
    (user?.id ? `HELM${user.id.replace(/-/g, "").substring(0, 8).toUpperCase()}` : "HELMENT");

  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  const copyReferral = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setError("Unable to copy your referral link.");
    }
  };

  const approvedStatuses = ["approved", "completed", "valid"];

  const validReferrals = useMemo(() => {
    return referrals.filter(
      (referral) =>
        referral.referrer_id === user?.id &&
        approvedStatuses.includes(
          String(referral.status || "").toLowerCase()
        )
    );
  }, [referrals, user]);

  const completedTasks = useMemo(() => {
    return taskCompletions.filter((completion) =>
      approvedStatuses.includes(
        String(completion.status || "").toLowerCase()
      )
    );
  }, [taskCompletions]);

  const balance = Number(profile?.balance || 0);

  const tiktokTask = tasks.find((task) => {
    const title = String(task.title || "").toLowerCase();

    return (
      title.includes("tiktok") ||
      title.includes("tik tok") ||
      Number(task.reward) >= 2000
    );
  });

  const tiktokCompletion = taskCompletions.find(
    (completion) => completion.task_id === tiktokTask?.id
  );

  const tiktokApproved =
    tiktokCompletion &&
    approvedStatuses.includes(
      String(tiktokCompletion.status || "").toLowerCase()
    );

  const taskRequirementCount = completedTasks.filter((completion) => {
    if (!tiktokTask) return true;
    return completion.task_id !== tiktokTask.id;
  }).length;

  const tasksRequirementMet = taskRequirementCount >= 5;
  const referralsRequirementMet = validReferrals.length >= 15;
  const balanceRequirementMet = balance >= 2000;
  const tiktokRequirementMet = Boolean(tiktokApproved);

  const completedRequirements = [
    tiktokRequirementMet,
    referralsRequirementMet,
    tasksRequirementMet,
    balanceRequirementMet,
  ].filter(Boolean).length;

  const getTaskCompletion = (taskId) => {
    return taskCompletions.find(
      (completion) => Number(completion.task_id) === Number(taskId)
    );
  };

  const getTaskStatus = (task) => {
    const completion = getTaskCompletion(task.id);

    if (!completion) {
      return {
        type: "available",
        label: "Available",
      };
    }

    const status = String(completion.status || "").toLowerCase();

    if (approvedStatuses.includes(status)) {
      return {
        type: "approved",
        label: "Completed",
      };
    }

    if (status === "pending") {
      return {
        type: "pending",
        label: "Pending Review",
      };
    }

    if (status === "rejected") {
      return {
        type: "rejected",
        label: "Rejected",
      };
    }

    return {
      type: "pending",
      label: "Pending Review",
    };
  };

  const openTask = (task) => {
    setError("");
    setMessage("");

    if (!task.task_url) {
      setError(
        "This task does not have a task link yet. Please check back later."
      );
      return;
    }

    window.open(task.task_url, "_blank", "noopener,noreferrer");
  };

  const startSubmission = (task) => {
    setError("");
    setMessage("");
    setProof("");
    setSelectedTask(task);
  };

  const closeSubmission = () => {
    if (submitting) return;

    setSelectedTask(null);
    setProof("");
  };

  const submitTask = async () => {
    if (!selectedTask || !user) return;

    setError("");
    setMessage("");

    const existingCompletion = getTaskCompletion(selectedTask.id);

    if (existingCompletion) {
      const existingStatus = String(
        existingCompletion.status || ""
      ).toLowerCase();

      if (
        existingStatus === "pending" ||
        approvedStatuses.includes(existingStatus)
      ) {
        setError("You have already submitted this task.");
        return;
      }
    }

    if (!proof.trim()) {
      setError("Please provide proof or a short description of how you completed the task.");
      return;
    }

    setSubmitting(true);

    try {
      const { error: insertError } = await supabase
        .from("task_completions")
        .insert({
          user_id: user.id,
          task_id: selectedTask.id,
          status: "pending",
          proof: proof.trim(),
          completed_at: new Date().toISOString(),
        });

      if (insertError) {
        if (insertError.code === "23505") {
          throw new Error(
            "You have already submitted this task. Please wait for review."
          );
        }

        throw insertError;
      }

      setMessage(
        "Task submitted successfully. Your submission is now pending review."
      );

      setSelectedTask(null);
      setProof("");

      await loadDashboard();
    } catch (err) {
      console.error("Task submission error:", err);

      setError(
        err?.message ||
          "Unable to submit this task. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return `₦${Number(amount || 0).toLocaleString("en-NG")}`;
  };

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingBox}>
          <div style={styles.loadingIcon}>
            <Sparkles size={28} />
          </div>

          <h3 style={styles.loadingTitle}>HELMEnt</h3>

          <p style={styles.loadingText}>
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #07111f;
        }

        button,
        input,
        textarea {
          font-family: inherit;
        }

        .helment-nav-desktop {
          display: flex;
        }

        .helment-menu-button {
          display: none;
        }

        .helment-mobile-menu {
          display: none;
        }

        .helment-task-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .helment-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .helment-requirements-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        @media (max-width: 900px) {
          .helment-requirements-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .helment-task-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .helment-nav-desktop {
            display: none;
          }

          .helment-menu-button {
            display: flex !important;
          }

          .helment-mobile-menu {
            display: block;
          }

          .helment-stats-grid {
            grid-template-columns: 1fr;
          }

          .helment-requirements-grid {
            grid-template-columns: 1fr;
          }

          .helment-welcome {
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          .helment-balance-footer {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 15px !important;
          }

          .helment-referral-card {
            flex-direction: column !important;
          }

          .helment-referral-box {
            flex-direction: column !important;
          }

          .helment-referral-box input {
            width: 100% !important;
          }

          .helment-modal-card {
            width: calc(100% - 30px) !important;
            max-height: 90vh;
            overflow-y: auto;
          }
        }
      `}</style>

      {/* NAVBAR */}
      <header style={styles.navbar}>
        <div style={styles.navInner}>
          <Link to="/" style={styles.logo}>
            <span style={styles.logoMark}>
              <Sparkles size={18} />
            </span>

            <span>
              HELM<span style={{ color: "#56e39f" }}>Ent</span>
            </span>
          </Link>

          <div className="helment-nav-desktop" style={styles.desktopNav}>
            <Link to="/dashboard" style={styles.navActive}>
              Dashboard
            </Link>

            <button
              onClick={handleLogout}
              style={styles.logoutButton}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="helment-menu-button"
            style={styles.menuButton}
            aria-label="Open menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {menuOpen && (
          <div className="helment-mobile-menu" style={styles.mobileMenu}>
            <Link
              to="/dashboard"
              style={styles.mobileLink}
              onClick={() => setMenuOpen(false)}
            >
              Dashboard
            </Link>

            <button
              onClick={handleLogout}
              style={styles.mobileLogout}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </header>

      {/* MAIN */}
      <main style={styles.main}>
        {/* ALERTS */}
        {error && (
          <div style={styles.errorAlert}>
            <Info size={18} />
            <span>{error}</span>

            <button
              onClick={() => setError("")}
              style={styles.alertClose}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {message && (
          <div style={styles.successAlert}>
            <CheckCircle2 size={18} />
            <span>{message}</span>

            <button
              onClick={() => setMessage("")}
              style={styles.alertClose}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* WELCOME */}
        <section
          className="helment-welcome"
          style={styles.welcome}
        >
          <div>
            <span style={styles.welcomeLabel}>
              HELMEnt MEMBER DASHBOARD
            </span>

            <h1 style={styles.heading}>
              Welcome back 👋
            </h1>

            <p style={styles.subheading}>
              {profile?.first_name
                ? `Hello ${profile.first_name}`
                : user?.email}
            </p>
          </div>

          <div style={styles.accountStatus}>
            <CheckCircle2 size={17} />
            Account active
          </div>
        </section>

        {/* BALANCE */}
        <section style={styles.balanceCard}>
          <div style={styles.balanceContent}>
            <div>
              <span style={styles.balanceLabel}>
                Available balance
              </span>

              <h2 style={styles.balance}>
                {formatCurrency(balance)}
              </h2>

              <p style={styles.balanceText}>
                Minimum withdrawal: ₦2,000
              </p>
            </div>

            <div style={styles.walletCircle}>
              <Wallet size={30} />
            </div>
          </div>

          <div
            className="helment-balance-footer"
            style={styles.balanceFooter}
          >
            <span>
              Maximum withdrawal: ₦50,000
            </span>

            <Link
              to="/withdraw"
              style={styles.withdrawButton}
            >
              Withdraw
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>

        {/* STAT CARDS */}
        <section
          className="helment-stats-grid"
          style={styles.statsGrid}
        >
          <StatCard
            icon={<Gift size={21} />}
            title="Social reward"
            value={
              tiktokApproved
                ? formatCurrency(tiktokTask?.reward || 2000)
                : "₦0"
            }
            description={
              tiktokApproved
                ? "Approved reward"
                : "Complete the TikTok task"
            }
          />

          <StatCard
            icon={<Zap size={21} />}
            title="Tasks"
            value={taskRequirementCount}
            description="Approved eligible tasks"
          />

          <StatCard
            icon={<Users size={21} />}
            title="Referrals"
            value={validReferrals.length}
            description="Valid referrals"
          />
        </section>

        {/* REQUIREMENTS */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <span style={styles.sectionLabel}>
                <CheckCircle2 size={15} />
                Withdrawal requirements
              </span>

              <h2 style={styles.sectionTitle}>
                Complete your requirements
              </h2>
            </div>

            <span style={styles.progressText}>
              {completedRequirements} / 4 completed
            </span>
          </div>

          <div
            className="helment-requirements-grid"
            style={styles.requirementsGrid}
          >
            <RequirementCard
              icon={<Gift size={20} />}
              title="Follow TikTok"
              description="Complete and submit the official HELMEnt TikTok task."
              status={
                tiktokRequirementMet
                  ? "Completed"
                  : tiktokCompletion?.status === "pending"
                  ? "Pending review"
                  : "Not completed"
              }
              complete={tiktokRequirementMet}
            />

            <RequirementCard
              icon={<Users size={20} />}
              title="15 Referrals"
              description="Get at least 15 valid referrals."
              status={`${Math.min(validReferrals.length, 15)} / 15`}
              complete={referralsRequirementMet}
            />

            <RequirementCard
              icon={<Zap size={20} />}
              title="5 Tasks"
              description="Complete at least 5 eligible tasks."
              status={`${Math.min(taskRequirementCount, 5)} / 5`}
              complete={tasksRequirementMet}
            />

            <RequirementCard
              icon={<Wallet size={20} />}
              title="₦2,000 Balance"
              description="Reach the minimum withdrawal balance."
              status={`${formatCurrency(Math.min(balance, 2000))} / ₦2,000`}
              complete={balanceRequirementMet}
            />
          </div>
        </section>

        {/* REFERRAL */}
        <section
          className="helment-referral-card"
          style={styles.referralCard}
        >
          <div style={styles.referralIcon}>
            <Users size={26} />
          </div>

          <div style={styles.referralContent}>
            <span style={styles.sectionLabel}>
              Referral program
            </span>

            <h2 style={styles.referralTitle}>
              Earn ₦500 for every valid referral
            </h2>

            <p style={styles.referralText}>
              Share your referral link with people you know.
              You need 15 valid referrals to meet the withdrawal
              requirement.
            </p>

            <div
              className="helment-referral-box"
              style={styles.referralBox}
            >
              <input
                value={referralLink}
                readOnly
                style={styles.referralInput}
              />

              <button
                onClick={copyReferral}
                style={styles.copyButton}
              >
                {copied ? (
                  <>
                    <CheckCircle2 size={16} />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy
                  </>
                )}
              </button>
            </div>

            <div style={styles.referralCode}>
              Your referral code:
              <strong style={{ color: "#56e39f", marginLeft: "5px" }}>
                {referralCode}
              </strong>
            </div>
          </div>
        </section>

        {/* TASKS */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <span style={styles.sectionLabel}>
                <Zap size={15} />
                Available tasks
              </span>

              <h2 style={styles.sectionTitle}>
                Complete tasks and earn
              </h2>
            </div>

            <span style={styles.progressText}>
              {tasks.length} available
            </span>
          </div>

          {tasks.length === 0 ? (
            <div style={styles.emptyCard}>
              <div style={styles.emptyIcon}>
                <Clock3 size={25} />
              </div>

              <h3 style={styles.emptyTitle}>
                No tasks available
              </h3>

              <p style={styles.emptyText}>
                New eligible tasks will appear here when they
                become available.
              </p>
            </div>
          ) : (
            <div
              className="helment-task-grid"
              style={styles.taskGrid}
            >
              {tasks.map((task) => {
                const status = getTaskStatus(task);
                const completion = getTaskCompletion(task.id);

                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    status={status}
                    completion={completion}
                    onOpen={() => openTask(task)}
                    onSubmit={() => startSubmission(task)}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* HOW TASK SUBMISSION WORKS */}
        <section style={styles.infoCard}>
          <div style={styles.infoIcon}>
            <Info size={23} />
          </div>

          <div>
            <h3 style={styles.infoTitle}>
              How task review works
            </h3>

            <p style={styles.infoText}>
              Open a task, complete the instructions, then submit
              your proof. Your submission will remain pending until
              it is reviewed. Rewards are only credited after
              approval.
            </p>
          </div>
        </section>

        {/* WITHDRAWAL INFO */}
        <section style={styles.infoCard}>
          <div style={styles.infoIcon}>
            <Clock3 size={23} />
          </div>

          <div>
            <h3 style={styles.infoTitle}>
              Withdrawal processing
            </h3>

            <p style={styles.infoText}>
              Once you meet all withdrawal requirements and submit
              a request, your withdrawal will be reviewed.
              Processing may take up to 5 business days.
            </p>
          </div>
        </section>

        {/* WITHDRAWAL HISTORY */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <span style={styles.sectionLabel}>
                <Wallet size={15} />
                Transactions
              </span>

              <h2 style={styles.sectionTitle}>
                Withdrawal history
              </h2>
            </div>
          </div>

          {withdrawals.length === 0 ? (
            <div style={styles.emptyCard}>
              <div style={styles.emptyIcon}>
                <Wallet size={25} />
              </div>

              <h3 style={styles.emptyTitle}>
                No withdrawals yet
              </h3>

              <p style={styles.emptyText}>
                Your withdrawal history will appear here after
                you submit your first withdrawal request.
              </p>
            </div>
          ) : (
            <div style={styles.transactionsCard}>
              {withdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  style={styles.transactionRow}
                >
                  <div style={styles.transactionLeft}>
                    <div style={styles.transactionIcon}>
                      <Wallet size={17} />
                    </div>

                    <div>
                      <strong style={styles.transactionTitle}>
                        Withdrawal
                      </strong>

                      <span style={styles.transactionDate}>
                        {formatDate(withdrawal.created_at)}
                      </span>
                    </div>
                  </div>

                  <div style={styles.transactionRight}>
                    <strong style={styles.transactionAmount}>
                      {formatCurrency(withdrawal.amount)}
                    </strong>

                    <StatusBadge
                      status={withdrawal.status}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <span>
          © {new Date().getFullYear()} HELMEnt
        </span>

        <span>
          No deposit required
        </span>
      </footer>

      {/* TASK SUBMISSION MODAL */}
      {selectedTask && (
        <div
          style={styles.modalOverlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeSubmission();
            }
          }}
        >
          <div
            className="helment-modal-card"
            style={styles.modalCard}
          >
            <div style={styles.modalHeader}>
              <div>
                <span style={styles.modalLabel}>
                  TASK SUBMISSION
                </span>

                <h2 style={styles.modalTitle}>
                  {selectedTask.title}
                </h2>
              </div>

              <button
                onClick={closeSubmission}
                disabled={submitting}
                style={styles.modalClose}
              >
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalReward}>
              <Gift size={18} />
              <span>
                Reward:{" "}
                <strong>
                  {formatCurrency(selectedTask.reward)}
                </strong>
              </span>
            </div>

            <div style={styles.modalInstructions}>
              <h3 style={styles.instructionsTitle}>
                Before submitting
              </h3>

              <p style={styles.instructionsText}>
                Complete the task using the instructions provided.
                Then describe what you completed or provide the
                available proof below.
              </p>
            </div>

            <label style={styles.proofLabel}>
              Proof / completion details
            </label>

            <textarea
              value={proof}
              onChange={(event) => setProof(event.target.value)}
              placeholder="Example: I completed the task as instructed. Add any relevant details or proof information here."
              rows={6}
              style={styles.proofTextarea}
              disabled={submitting}
            />

            <p style={styles.proofHint}>
              Your submission will be reviewed by HELMEnt before
              the reward is credited.
            </p>

            <div style={styles.modalActions}>
              <button
                onClick={closeSubmission}
                disabled={submitting}
                style={styles.cancelButton}
              >
                Cancel
              </button>

              <button
                onClick={submitTask}
                disabled={submitting}
                style={{
                  ...styles.submitButton,
                  opacity: submitting ? 0.65 : 1,
                }}
              >
                {submitting ? (
                  <>
                    <Clock3 size={17} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={17} />
                    Submit Task
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================
   STAT CARD
========================= */

function StatCard({
  icon,
  title,
  value,
  description,
}) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statTop}>
        <div style={styles.statIcon}>
          {icon}
        </div>

        <span style={styles.statTitle}>
          {title}
        </span>
      </div>

      <strong style={styles.statValue}>
        {value}
      </strong>

      <span style={styles.statDescription}>
        {description}
      </span>
    </div>
  );
}

/* =========================
   REQUIREMENT CARD
========================= */

function RequirementCard({
  icon,
  title,
  description,
  status,
  complete,
}) {
  return (
    <div
      style={{
        ...styles.requirementCard,
        border: complete
          ? "1px solid rgba(86,227,159,0.25)"
          : "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div style={styles.requirementTop}>
        <div
          style={{
            ...styles.requirementIcon,
            background: complete
              ? "rgba(86,227,159,0.14)"
              : "rgba(86,227,159,0.08)",
          }}
        >
          {complete ? (
            <CheckCircle2 size={20} />
          ) : (
            icon
          )}
        </div>

        <span
          style={{
            ...styles.requirementStatus,
            color: complete ? "#56e39f" : "#65798d",
          }}
        >
          {status}
        </span>
      </div>

      <h3 style={styles.requirementTitle}>
        {title}
      </h3>

      <p style={styles.requirementDescription}>
        {description}
      </p>
    </div>
  );
}

/* =========================
   TASK CARD
========================= */

function TaskCard({
  task,
  status,
  completion,
  onOpen,
  onSubmit,
  formatCurrency,
  formatDate,
}) {
  const isAvailable = status.type === "available";
  const isPending = status.type === "pending";
  const isApproved = status.type === "approved";
  const isRejected = status.type === "rejected";

  return (
    <div style={styles.taskCard}>
      <div style={styles.taskTop}>
        <div style={styles.taskIcon}>
          <Zap size={21} />
        </div>

        <StatusBadge status={status.label} />
      </div>

      <div style={styles.taskBody}>
        <h3 style={styles.taskTitle}>
          {task.title}
        </h3>

        <p style={styles.taskDescription}>
          {task.description ||
            "Complete this task according to the provided instructions."}
        </p>

        <div style={styles.taskMeta}>
          <span style={styles.taskReward}>
            <Gift size={15} />
            {formatCurrency(task.reward)}
          </span>

          {completion?.completed_at && (
            <span style={styles.taskDate}>
              {formatDate(completion.completed_at)}
            </span>
          )}
        </div>

        {isPending && (
          <div style={styles.pendingBox}>
            <Clock3 size={16} />

            <span>
              Your submission is waiting for review.
            </span>
          </div>
        )}

        {isApproved && (
          <div style={styles.approvedBox}>
            <CheckCircle2 size={16} />

            <span>
              Task approved successfully.
            </span>
          </div>
        )}

        {isRejected && (
          <div style={styles.rejectedBox}>
            <Info size={16} />

            <span>
              This submission was not approved. Please review
              the task instructions before trying again.
            </span>
          </div>
        )}
      </div>

      <div style={styles.taskActions}>
        {task.task_url ? (
          <button
            onClick={onOpen}
            style={styles.openTaskButton}
          >
            <ExternalLink size={16} />
            Open Task
          </button>
        ) : (
          <button
            onClick={onOpen}
            style={styles.disabledTaskButton}
          >
            <ExternalLink size={16} />
            No Link
          </button>
        )}

        {isAvailable && (
          <button
            onClick={onSubmit}
            style={styles.submitTaskButton}
          >
            Submit Task
            <ArrowRight size={16} />
          </button>
        )}

        {isPending && (
          <button
            disabled
            style={styles.pendingButton}
          >
            <Clock3 size={16} />
            Pending Review
          </button>
        )}

        {isApproved && (
          <button
            disabled
            style={styles.completedButton}
          >
            <CheckCircle2 size={16} />
            Completed
          </button>
        )}

        {isRejected && (
          <button
            onClick={onSubmit}
            style={styles.submitTaskButton}
          >
            Resubmit
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

/* =========================
   STATUS BADGE
========================= */

function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();

  let background = "rgba(255,255,255,0.05)";
  let color = "#8193a5";
  let border = "1px solid rgba(255,255,255,0.08)";

  if (
    normalized.includes("complete") ||
    normalized.includes("approved") ||
    normalized.includes("valid")
  ) {
    background = "rgba(86,227,159,0.10)";
    color = "#56e39f";
    border = "1px solid rgba(86,227,159,0.18)";
  }

  if (normalized.includes("pending")) {
    background = "rgba(255,193,92,0.09)";
    color = "#ffc15c";
    border = "1px solid rgba(255,193,92,0.16)";
  }

  if (normalized.includes("reject")) {
    background = "rgba(255,104,104,0.09)";
    color = "#ff8c8c";
    border = "1px solid rgba(255,104,104,0.16)";
  }

  return (
    <span
      style={{
        ...styles.statusBadge,
        background,
        color,
        border,
      }}
    >
      {status || "Pending"}
    </span>
  );
}

/* =========================
   STYLES
========================= */

const styles = {
  page: {
    minHeight: "100vh",
    background: "#07111f",
    color: "#eef5fb",
    fontFamily: "Arial, sans-serif",
  },

  loadingPage: {
    minHeight: "100vh",
    background: "#07111f",
    color: "#56e39f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Arial, sans-serif",
  },

  loadingBox: {
    textAlign: "center",
  },

  loadingIcon: {
    width: "62px",
    height: "62px",
    borderRadius: "18px",
    background: "rgba(86,227,159,0.10)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 15px",
  },

  loadingTitle: {
    margin: "0 0 6px",
    fontSize: "22px",
  },

  loadingText: {
    margin: 0,
    color: "#6d8195",
    fontSize: "12px",
  },

  navbar: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "rgba(7,17,31,0.95)",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    backdropFilter: "blur(14px)",
  },

  navInner: {
    maxWidth: "1180px",
    margin: "0 auto",
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#eef5fb",
    textDecoration: "none",
    fontSize: "21px",
    fontWeight: "700",
  },

  logoMark: {
    width: "38px",
    height: "38px",
    borderRadius: "11px",
    background: "#56e39f",
    color: "#07111f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  desktopNav: {
    alignItems: "center",
    gap: "25px",
  },

  navActive: {
    color: "#56e39f",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: "700",
  },

  logoutButton: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    color: "#c5d2de",
    borderRadius: "9px",
    padding: "10px 14px",
    cursor: "pointer",
  },

  menuButton: {
    background: "transparent",
    border: "none",
    color: "#ffffff",
    cursor: "pointer",
    alignItems: "center",
    justifyContent: "center",
  },

  mobileMenu: {
    padding: "15px 20px 20px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },

  mobileLink: {
    display: "block",
    color: "#ffffff",
    textDecoration: "none",
    padding: "12px 0",
  },

  mobileLogout: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    background: "transparent",
    border: "none",
    color: "#ff9b9b",
    padding: "12px 0",
    cursor: "pointer",
  },

  main: {
    maxWidth: "1180px",
    margin: "0 auto",
    padding: "45px 20px 80px",
  },

  errorAlert: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "rgba(255,90,90,0.08)",
    border: "1px solid rgba(255,90,90,0.18)",
    color: "#ff9c9c",
    borderRadius: "12px",
    padding: "13px 15px",
    marginBottom: "20px",
    fontSize: "12px",
  },

  successAlert: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "rgba(86,227,159,0.08)",
    border: "1px solid rgba(86,227,159,0.18)",
    color: "#56e39f",
    borderRadius: "12px",
    padding: "13px 15px",
    marginBottom: "20px",
    fontSize: "12px",
  },

  alertClose: {
    marginLeft: "auto",
    background: "transparent",
    border: "none",
    color: "inherit",
    cursor: "pointer",
    display: "flex",
  },

  welcome: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "30px",
  },

  welcomeLabel: {
    color: "#56e39f",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "1.5px",
  },

  heading: {
    fontSize: "34px",
    margin: "8px 0",
    letterSpacing: "-1px",
  },

  subheading: {
    color: "#73879b",
    fontSize: "13px",
    margin: 0,
  },

  accountStatus: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    color: "#56e39f",
    background: "rgba(86,227,159,0.08)",
    border: "1px solid rgba(86,227,159,0.16)",
    borderRadius: "20px",
    padding: "9px 13px",
    fontSize: "11px",
    fontWeight: "600",
  },

  balanceCard: {
    background:
      "linear-gradient(135deg, rgba(86,227,159,0.13), rgba(12,27,43,0.96))",
    border: "1px solid rgba(86,227,159,0.18)",
    borderRadius: "20px",
    padding: "28px",
    marginBottom: "20px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.22)",
  },

  balanceContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  balanceLabel: {
    color: "#8ba0b3",
    fontSize: "12px",
  },

  balance: {
    fontSize: "43px",
    margin: "7px 0",
    letterSpacing: "-2px",
  },

  balanceText: {
    color: "#6e8398",
    fontSize: "11px",
    margin: 0,
  },

  walletCircle: {
    width: "62px",
    height: "62px",
    borderRadius: "18px",
    background: "rgba(86,227,159,0.12)",
    color: "#56e39f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  balanceFooter: {
    marginTop: "25px",
    paddingTop: "18px",
    borderTop: "1px solid rgba(255,255,255,0.07)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: "#71869a",
    fontSize: "11px",
  },

  withdrawButton: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    background: "#56e39f",
    color: "#07111f",
    textDecoration: "none",
    borderRadius: "10px",
    padding: "11px 16px",
    fontSize: "12px",
    fontWeight: "700",
  },

  statsGrid: {
    marginBottom: "45px",
  },

  statCard: {
    background: "rgba(12,27,43,0.95)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "17px",
    padding: "20px",
  },

  statTop: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "17px",
  },

  statIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background: "rgba(86,227,159,0.08)",
    color: "#56e39f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  statTitle: {
    color: "#a2b2c2",
    fontSize: "12px",
  },

  statValue: {
    display: "block",
    fontSize: "25px",
    marginBottom: "5px",
  },

  statDescription: {
    color: "#61758a",
    fontSize: "10px",
  },

  section: {
    marginBottom: "45px",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: "18px",
  },

  sectionLabel: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "#56e39f",
    fontSize: "10px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
  },

  sectionTitle: {
    fontSize: "22px",
    margin: "7px 0 0",
  },

  progressText: {
    color: "#6c8094",
    fontSize: "11px",
  },

  requirementsGrid: {},

  requirementCard: {
    background: "rgba(12,27,43,0.95)",
    borderRadius: "16px",
    padding: "18px",
  },

  requirementTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
  },

  requirementIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    color: "#56e39f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  requirementStatus: {
    fontSize: "9px",
  },

  requirementTitle: {
    fontSize: "14px",
    margin: "17px 0 7px",
  },

  requirementDescription: {
    color: "#65798d",
    fontSize: "11px",
    lineHeight: "1.5",
    margin: 0,
  },

  referralCard: {
    display: "flex",
    gap: "20px",
    alignItems: "flex-start",
    background:
      "linear-gradient(135deg, rgba(86,227,159,0.10), rgba(12,27,43,0.95))",
    border: "1px solid rgba(86,227,159,0.14)",
    borderRadius: "19px",
    padding: "25px",
    marginBottom: "45px",
  },

  referralIcon: {
    minWidth: "52px",
    height: "52px",
    borderRadius: "15px",
    background: "rgba(86,227,159,0.12)",
    color: "#56e39f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  referralContent: {
    flex: 1,
  },

  referralTitle: {
    fontSize: "22px",
    margin: "8px 0",
  },

  referralText: {
    color: "#708498",
    fontSize: "12px",
    lineHeight: "1.6",
    marginBottom: "18px",
  },

  referralBox: {
    display: "flex",
    gap: "8px",
  },

  referralInput: {
    flex: 1,
    minWidth: 0,
    height: "43px",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "9px",
    background: "rgba(255,255,255,0.04)",
    color: "#a9b8c7",
    padding: "0 12px",
    outline: "none",
    fontSize: "11px",
  },

  copyButton: {
    height: "43px",
    padding: "0 15px",
    border: "none",
    borderRadius: "9px",
    background: "#56e39f",
    color: "#07111f",
    fontWeight: "700",
    fontSize: "11px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
  },

  referralCode: {
    marginTop: "10px",
    color: "#64798c",
    fontSize: "10px",
  },

  taskGrid: {},

  taskCard: {
    background: "rgba(12,27,43,0.95)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "18px",
    padding: "20px",
    transition: "0.2s ease",
  },

  taskTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "18px",
  },

  taskIcon: {
    width: "43px",
    height: "43px",
    borderRadius: "12px",
    background: "rgba(86,227,159,0.09)",
    color: "#56e39f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  statusBadge: {
    borderRadius: "20px",
    padding: "7px 10px",
    fontSize: "9px",
    fontWeight: "700",
    whiteSpace: "nowrap",
  },

  taskBody: {
    minHeight: "150px",
  },

  taskTitle: {
    fontSize: "17px",
    margin: "0 0 8px",
  },

  taskDescription: {
    color: "#71869a",
    fontSize: "11px",
    lineHeight: "1.6",
    margin: "0 0 15px",
  },

  taskMeta: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
  },

  taskReward: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    color: "#56e39f",
    fontSize: "11px",
    fontWeight: "700",
  },

  taskDate: {
    color: "#53677b",
    fontSize: "9px",
  },

  pendingBox: {
    marginTop: "15px",
    padding: "10px 11px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    borderRadius: "9px",
    background: "rgba(255,193,92,0.07)",
    border: "1px solid rgba(255,193,92,0.12)",
    color: "#d6ae6b",
    fontSize: "10px",
    lineHeight: "1.4",
  },

  approvedBox: {
    marginTop: "15px",
    padding: "10px 11px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    borderRadius: "9px",
    background: "rgba(86,227,159,0.07)",
    border: "1px solid rgba(86,227,159,0.12)",
    color: "#56e39f",
    fontSize: "10px",
  },

  rejectedBox: {
    marginTop: "15px",
    padding: "10px 11px",
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    borderRadius: "9px",
    background: "rgba(255,104,104,0.07)",
    border: "1px solid rgba(255,104,104,0.12)",
    color: "#ff9c9c",
    fontSize: "10px",
    lineHeight: "1.4",
  },

  taskActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    marginTop: "18px",
  },

  openTaskButton: {
    height: "42px",
    borderRadius: "9px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    color: "#d6e0e8",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    fontSize: "10px",
    fontWeight: "700",
  },

  disabledTaskButton: {
    height: "42px",
    borderRadius: "9px",
    border: "1px solid rgba(255,255,255,0.05)",
    background: "rgba(255,255,255,0.025)",
    color: "#52677b",
    cursor: "not-allowed",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    fontSize: "10px",
    fontWeight: "700",
  },

  submitTaskButton: {
    height: "42px",
    borderRadius: "9px",
    border: "none",
    background: "#56e39f",
    color: "#07111f",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    fontSize: "10px",
    fontWeight: "700",
  },

  pendingButton: {
    height: "42px",
    borderRadius: "9px",
    border: "1px solid rgba(255,193,92,0.13)",
    background: "rgba(255,193,92,0.06)",
    color: "#c9a55f",
    cursor: "not-allowed",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    fontSize: "10px",
    fontWeight: "700",
  },

  completedButton: {
    height: "42px",
    borderRadius: "9px",
    border: "1px solid rgba(86,227,159,0.13)",
    background: "rgba(86,227,159,0.06)",
    color: "#56e39f",
    cursor: "not-allowed",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    fontSize: "10px",
    fontWeight: "700",
  },

  emptyCard: {
    background: "rgba(12,27,43,0.8)",
    border: "1px dashed rgba(255,255,255,0.09)",
    borderRadius: "17px",
    padding: "40px 20px",
    textAlign: "center",
  },

  emptyIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    margin: "0 auto 15px",
    background: "rgba(255,255,255,0.04)",
    color: "#63788d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    fontSize: "15px",
    margin: "0 0 7px",
  },

  emptyText: {
    color: "#62768a",
    fontSize: "11px",
    lineHeight: "1.5",
    maxWidth: "400px",
    margin: "0 auto",
  },

  infoCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "15px",
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "25px",
  },

  infoIcon: {
    minWidth: "43px",
    height: "43px",
    borderRadius: "12px",
    background: "rgba(86,227,159,0.08)",
    color: "#56e39f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  infoTitle: {
    fontSize: "14px",
    margin: "0 0 6px",
  },

  infoText: {
    color: "#697d91",
    fontSize: "11px",
    lineHeight: "1.6",
    margin: 0,
  },

  transactionsCard: {
    background: "rgba(12,27,43,0.95)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "17px",
    overflow: "hidden",
  },

  transactionRow: {
    padding: "17px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },

  transactionLeft: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
  },

  transactionIcon: {
    width: "37px",
    height: "37px",
    borderRadius: "10px",
    background: "rgba(86,227,159,0.08)",
    color: "#56e39f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  transactionTitle: {
    display: "block",
    fontSize: "11px",
    marginBottom: "4px",
  },

  transactionDate: {
    display: "block",
    color: "#596d80",
    fontSize: "9px",
  },

  transactionRight: {
    display: "flex",
    alignItems: "flex-end",
    flexDirection: "column",
    gap: "5px",
  },

  transactionAmount: {
    fontSize: "12px",
  },

  footer: {
    borderTop: "1px solid rgba(255,255,255,0.06)",
    padding: "20px",
    display: "flex",
    justifyContent: "space-between",
    maxWidth: "1180px",
    margin: "0 auto",
    color: "#53677b",
    fontSize: "10px",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    background: "rgba(0,0,0,0.72)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "15px",
  },

  modalCard: {
    width: "520px",
    maxWidth: "100%",
    background: "#0c1b2b",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: "19px",
    padding: "23px",
    boxShadow: "0 30px 100px rgba(0,0,0,0.45)",
  },

  modalHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "15px",
  },

  modalLabel: {
    color: "#56e39f",
    fontSize: "9px",
    fontWeight: "700",
    letterSpacing: "1px",
  },

  modalTitle: {
    fontSize: "21px",
    margin: "7px 0 0",
  },

  modalClose: {
    width: "35px",
    height: "35px",
    borderRadius: "9px",
    border: "1px solid rgba(255,255,255,0.07)",
    background: "rgba(255,255,255,0.04)",
    color: "#a8b8c7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },

  modalReward: {
    marginTop: "20px",
    padding: "12px 13px",
    borderRadius: "10px",
    background: "rgba(86,227,159,0.07)",
    border: "1px solid rgba(86,227,159,0.12)",
    color: "#56e39f",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "11px",
  },

  modalInstructions: {
    marginTop: "20px",
  },

  instructionsTitle: {
    fontSize: "12px",
    margin: "0 0 7px",
  },

  instructionsText: {
    color: "#71869a",
    fontSize: "11px",
    lineHeight: "1.6",
    margin: 0,
  },

  proofLabel: {
    display: "block",
    marginTop: "20px",
    marginBottom: "8px",
    color: "#aab9c7",
    fontSize: "11px",
    fontWeight: "700",
  },

  proofTextarea: {
    width: "100%",
    resize: "vertical",
    minHeight: "130px",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "11px",
    background: "rgba(255,255,255,0.035)",
    color: "#eef5fb",
    padding: "12px",
    outline: "none",
    fontSize: "11px",
    lineHeight: "1.6",
  },

  proofHint: {
    color: "#586d80",
    fontSize: "9px",
    lineHeight: "1.5",
    margin: "8px 0 0",
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
    marginTop: "20px",
  },

  cancelButton: {
    height: "42px",
    padding: "0 17px",
    borderRadius: "9px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    color: "#aab9c7",
    cursor: "pointer",
    fontSize: "10px",
    fontWeight: "700",
  },

  submitButton: {
    height: "42px",
    padding: "0 18px",
    borderRadius: "9px",
    border: "none",
    background: "#56e39f",
    color: "#07111f",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    fontSize: "10px",
    fontWeight: "700",
  },
};

export default Dashboard;