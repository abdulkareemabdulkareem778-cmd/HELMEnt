import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileCheck2,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import "./AdminSubmissions.css";

export default function AdminSubmissions() {
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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

      await loadSubmissions();
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to verify administrator access.");
      setLoading(false);
    }
  };

  const loadSubmissions = async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error: submissionError } = await supabase
        .from("task_completions")
        .select("*")
        .order("completed_at", { ascending: false });

      if (submissionError) {
        throw submissionError;
      }

      const completionRows = data || [];

      // Get users
      const userIds = [
        ...new Set(completionRows.map((item) => item.user_id)),
      ];

      let profiles = [];

      if (userIds.length > 0) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, phone")
          .in("id", userIds);

        if (profileError) {
          console.error("Profile loading error:", profileError);
        } else {
          profiles = profileData || [];
        }
      }

      // Get tasks
      const taskIds = [
        ...new Set(completionRows.map((item) => item.task_id)),
      ];

      let tasks = [];

      if (taskIds.length > 0) {
        const { data: taskData, error: taskError } = await supabase
          .from("tasks")
          .select("id, title, description, reward")
          .in("id", taskIds);

        if (taskError) {
          console.error("Task loading error:", taskError);
        } else {
          tasks = taskData || [];
        }
      }

      const profileMap = {};
      profiles.forEach((profile) => {
        profileMap[profile.id] = profile;
      });

      const taskMap = {};
      tasks.forEach((task) => {
        taskMap[task.id] = task;
      });

      const formatted = completionRows.map((submission) => ({
        ...submission,
        profile: profileMap[submission.user_id] || null,
        task: taskMap[submission.task_id] || null,
      }));

      setSubmissions(formatted);
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Unable to load submissions. Check your Supabase RLS policies."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateSubmission = async (submission, newStatus) => {
    setProcessingId(submission.id);
    setError("");
    setMessage("");

    try {
      const { error: updateError } = await supabase
        .from("task_completions")
        .update({
          status: newStatus,
        })
        .eq("id", submission.id);

      if (updateError) {
        throw updateError;
      }

      setMessage(
        newStatus === "approved"
          ? "Submission approved successfully."
          : "Submission rejected successfully."
      );

      await loadSubmissions();
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to update submission.");
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusClass = (status) => {
    if (status === "approved") return "status-approved";
    if (status === "rejected") return "status-rejected";

    return "status-pending";
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loader"></div>
        <p>Loading submissions...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">

      {/* HEADER */}
      <header className="admin-page-header">

        <div className="admin-page-title">

          <button
            className="admin-back-button"
            onClick={() => navigate("/admin/dashboard")}
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <span className="admin-page-eyebrow">
              <ShieldCheck size={14} />
              Administrator
            </span>

            <h1>Submissions</h1>

            <p>
              Review submitted task proofs from HELMEnt users.
            </p>
          </div>

        </div>

        <button
          className="admin-refresh-button"
          onClick={loadSubmissions}
        >
          <RefreshCw size={18} />
          Refresh
        </button>

      </header>

      <main className="admin-page-content">

        {error && (
          <div className="admin-submissions-error">
            {error}
          </div>
        )}

        {message && (
          <div className="admin-submissions-success">
            {message}
          </div>
        )}

        {/* SUMMARY */}
        <div className="submission-summary">

          <div className="submission-summary-card">
            <Clock3 size={21} />

            <div>
              <strong>
                {
                  submissions.filter(
                    (item) => item.status === "pending"
                  ).length
                }
              </strong>

              <span>Pending review</span>
            </div>
          </div>

          <div className="submission-summary-card">
            <CheckCircle2 size={21} />

            <div>
              <strong>
                {
                  submissions.filter(
                    (item) => item.status === "approved"
                  ).length
                }
              </strong>

              <span>Approved</span>
            </div>
          </div>

          <div className="submission-summary-card">
            <XCircle size={21} />

            <div>
              <strong>
                {
                  submissions.filter(
                    (item) => item.status === "rejected"
                  ).length
                }
              </strong>

              <span>Rejected</span>
            </div>
          </div>

          <div className="submission-summary-card">
            <FileCheck2 size={21} />

            <div>
              <strong>{submissions.length}</strong>
              <span>Total submissions</span>
            </div>
          </div>

        </div>

        {/* SUBMISSIONS */}
        <section className="submissions-card">

          <div className="submissions-card-header">

            <div>
              <h2>Task submissions</h2>

              <p>
                Review user proof before approving completed tasks.
              </p>
            </div>

          </div>

          {submissions.length === 0 ? (

            <div className="submissions-empty">

              <div className="submissions-empty-icon">
                <FileCheck2 size={28} />
              </div>

              <h3>No submissions yet</h3>

              <p>
                User task submissions will appear here.
              </p>

            </div>

          ) : (

            <div className="submissions-list">

              {submissions.map((submission) => {

                const user = submission.profile;
                const task = submission.task;

                return (
                  <div
                    className="submission-item"
                    key={submission.id}
                  >

                    {/* TOP */}
                    <div className="submission-top">

                      <div className="submission-user">

                        <div className="submission-avatar">
                          {(user?.first_name?.[0] || "U").toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {user?.first_name || "Unknown"}{" "}
                            {user?.last_name || ""}
                          </strong>

                          <small>
                            {user?.phone || "No phone provided"}
                          </small>
                        </div>

                      </div>

                      <span
                        className={`submission-status ${getStatusClass(
                          submission.status
                        )}`}
                      >
                        {submission.status || "pending"}
                      </span>

                    </div>

                    {/* TASK */}
                    <div className="submission-task">

                      <div>
                        <span>Task</span>

                        <strong>
                          {task?.title || `Task #${submission.task_id}`}
                        </strong>
                      </div>

                      <div>
                        <span>Reward</span>

                        <strong>
                          ₦{Number(task?.reward || 0).toLocaleString()}
                        </strong>
                      </div>

                      <div>
                        <span>Submitted</span>

                        <strong>
                          {formatDate(submission.completed_at)}
                        </strong>
                      </div>

                    </div>

                    {/* PROOF */}
                    <div className="submission-proof">

                      <span>Submitted proof</span>

                      {submission.proof ? (

                        <div className="proof-content">

                          <p>
                            {submission.proof}
                          </p>

                          {/^https?:\/\//i.test(
                            submission.proof
                          ) && (
                            <a
                              href={submission.proof}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="proof-link"
                            >
                              Open proof
                              <ExternalLink size={15} />
                            </a>
                          )}

                        </div>

                      ) : (

                        <p className="no-proof">
                          No proof was provided.
                        </p>

                      )}

                    </div>

                    {/* ACTIONS */}
                    {submission.status === "pending" && (

                      <div className="submission-actions">

                        <button
                          className="reject-button"
                          disabled={
                            processingId === submission.id
                          }
                          onClick={() =>
                            updateSubmission(
                              submission,
                              "rejected"
                            )
                          }
                        >
                          <XCircle size={17} />

                          {processingId === submission.id
                            ? "Processing..."
                            : "Reject"}
                        </button>

                        <button
                          className="approve-button"
                          disabled={
                            processingId === submission.id
                          }
                          onClick={() =>
                            updateSubmission(
                              submission,
                              "approved"
                            )
                          }
                        >
                          <CheckCircle2 size={17} />

                          {processingId === submission.id
                            ? "Processing..."
                            : "Approve"}
                        </button>

                      </div>

                    )}

                  </div>
                );
              })}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}