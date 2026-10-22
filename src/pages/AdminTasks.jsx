import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Edit3,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Zap,
  X,
  ListChecks,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import "./AdminTasks.css";

export default function AdminTasks() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    reward: "",
    task_url: "",
    is_active: true,
  });

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/admin/login");
        return;
      }

      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (adminError) throw adminError;

      if (!admin) {
        await supabase.auth.signOut();
        navigate("/admin/login");
        return;
      }

      loadTasks();
    } catch (err) {
      setError(err.message || "Unable to verify admin access.");
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    setLoading(true);
    setError("");

    const { data, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .order("id", { ascending: true });

    if (tasksError) {
      setError(tasksError.message);
    } else {
      setTasks(data || []);
    }

    setLoading(false);
  };

  const openCreate = () => {
    setEditingTask(null);

    setForm({
      title: "",
      description: "",
      reward: "",
      task_url: "",
      is_active: true,
    });

    setError("");
    setMessage("");
    setShowForm(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);

    setForm({
      title: task.title || "",
      description: task.description || "",
      reward: task.reward ?? "",
      task_url: task.task_url || "",
      is_active: task.is_active ?? true,
    });

    setError("");
    setMessage("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingTask(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveTask = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const taskData = {
        title: form.title.trim(),
        description: form.description.trim(),
        reward: Number(form.reward),
        task_url: form.task_url.trim() || null,
        is_active: form.is_active,
      };

      if (!taskData.title) {
        throw new Error("Task title is required.");
      }

      if (!taskData.description) {
        throw new Error("Task description is required.");
      }

      if (!taskData.reward || taskData.reward <= 0) {
        throw new Error("Enter a valid reward amount.");
      }

      if (editingTask) {
        const { error: updateError } = await supabase
          .from("tasks")
          .update(taskData)
          .eq("id", editingTask.id);

        if (updateError) throw updateError;

        setMessage("Task updated successfully.");
      } else {
        const { error: insertError } = await supabase
          .from("tasks")
          .insert(taskData);

        if (insertError) throw insertError;

        setMessage("Task created successfully.");
      }

      await loadTasks();

      setShowForm(false);
      setEditingTask(null);
    } catch (err) {
      setError(err.message || "Unable to save task.");
    } finally {
      setSaving(false);
    }
  };

  const toggleTask = async (task) => {
    setError("");
    setMessage("");

    const { error: updateError } = await supabase
      .from("tasks")
      .update({
        is_active: !task.is_active,
      })
      .eq("id", task.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage(
      task.is_active
        ? "Task deactivated."
        : "Task activated."
    );

    loadTasks();
  };

  const deleteTask = async (task) => {
    const confirmed = window.confirm(
      `Delete "${task.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    const { error: deleteError } = await supabase
      .from("tasks")
      .delete()
      .eq("id", task.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setMessage("Task deleted successfully.");
    loadTasks();
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loader"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">

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

            <h1>Tasks</h1>

            <p>
              Create and manage HELMEnt platform tasks.
            </p>
          </div>

        </div>

        <div className="admin-task-header-actions">

          <button
            className="admin-refresh-button"
            onClick={loadTasks}
          >
            <RefreshCw size={17} />
            Refresh
          </button>

        </div>

      </header>

      <main className="admin-page-content">

        {error && (
          <div className="admin-tasks-error">
            {error}
          </div>
        )}

        {message && (
          <div className="admin-tasks-success">
            <CheckCircle2 size={17} />
            {message}
          </div>
        )}

        <section className="tasks-summary">

          <div className="task-summary-box">
            <span>Total Tasks</span>
            <strong>{tasks.length}</strong>
          </div>

          <div className="task-summary-box">
            <span>Active Tasks</span>
            <strong>
              {tasks.filter((task) => task.is_active).length}
            </strong>
          </div>

          <div className="task-summary-box">
            <span>Inactive Tasks</span>
            <strong>
              {tasks.filter((task) => !task.is_active).length}
            </strong>
          </div>

        </section>

        <section className="tasks-table-card">

          <div className="tasks-table-header">

            <div>
              <h2>Platform tasks</h2>
              <p>
                Manage the tasks users can complete for rewards.
              </p>
            </div>

          </div>

          {tasks.length === 0 ? (

            <div className="tasks-empty">

              <Zap size={30} />

              <h3>No tasks yet</h3>

              <p>
                Create your first HELMEnt task.
              </p>

              <button
                className="admin-add-task-button"
                onClick={openCreate}
              >
                <Plus size={17} />
                Add Task
              </button>

            </div>

          ) : (

            <div className="tasks-table-wrapper">

              <table className="tasks-table">

                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Reward</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {tasks.map((task) => (

                    <tr key={task.id}>

                      <td>
                        <div className="task-name-cell">

                          <div className="task-icon">
                            <Zap size={17} />
                          </div>

                          <div>
                            <strong>{task.title}</strong>

                            <span>
                              {task.description}
                            </span>

                            {task.task_url && (
                              <small>
                                {task.task_url}
                              </small>
                            )}
                          </div>

                        </div>
                      </td>

                      <td>
                        <strong className="task-reward">
                          ₦{Number(task.reward).toLocaleString()}
                        </strong>
                      </td>

                      <td>

                        <span
                          className={
                            task.is_active
                              ? "task-status active"
                              : "task-status inactive"
                          }
                        >
                          {task.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>

                      </td>

                      <td>

                        <div className="task-actions">

                          <button
                            className="task-action edit"
                            onClick={() => openEdit(task)}
                            title="Edit task"
                          >
                            <Edit3 size={15} />
                          </button>

                          <button
                            className="task-action toggle"
                            onClick={() => toggleTask(task)}
                            title={
                              task.is_active
                                ? "Deactivate task"
                                : "Activate task"
                            }
                          >
                            {task.is_active ? (
                              <X size={15} />
                            ) : (
                              <CheckCircle2 size={15} />
                            )}
                          </button>

                          <button
                            className="task-action delete"
                            onClick={() => deleteTask(task)}
                            title="Delete task"
                          >
                            <Trash2 size={15} />
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

      {/* CREATE / EDIT MODAL */}

      {showForm && (

        <div
          className="task-modal-overlay"
          onMouseDown={closeForm}
        >

          <div
            className="task-modal"
            onMouseDown={(e) => e.stopPropagation()}
          >

            <div className="task-modal-header">

              <div>
                <span className="admin-page-eyebrow">
                  <Zap size={14} />
                  Task Management
                </span>

                <h2>
                  {editingTask
                    ? "Edit task"
                    : "Create new task"}
                </h2>
              </div>

              <button
                className="task-modal-close"
                onClick={closeForm}
              >
                <X size={19} />
              </button>

            </div>

            <form onSubmit={saveTask}>

              <div className="task-form-group">

                <label>Task title</label>

                <input
                  name="title"
                  type="text"
                  placeholder="e.g. Follow HELMEnt on TikTok"
                  value={form.title}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="task-form-group">

                <label>Description</label>

                <textarea
                  name="description"
                  placeholder="Explain what the user needs to do."
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  required
                />

              </div>

              <div className="task-form-row">

                <div className="task-form-group">

                  <label>Reward (₦)</label>

                  <input
                    name="reward"
                    type="number"
                    min="1"
                    placeholder="50"
                    value={form.reward}
                    onChange={handleChange}
                    required
                  />

                </div>

                <div className="task-form-group">

                  <label>Task URL</label>

                  <input
                    name="task_url"
                    type="url"
                    placeholder="https://..."
                    value={form.task_url}
                    onChange={handleChange}
                  />

                </div>

              </div>

              <label className="task-active-toggle">

                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                />

                <span>
                  Make this task active
                </span>

              </label>

              {error && (
                <div className="admin-tasks-error">
                  {error}
                </div>
              )}

              <div className="task-form-actions">

                <button
                  type="button"
                  className="task-cancel-button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-add-task-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingTask
                    ? "Save Changes"
                    : "Create Task"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}