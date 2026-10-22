import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  Phone,
  CalendarDays,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import "./AdminUsers.css";

export default function AdminUsers() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter((user) => {
      const firstName = user.first_name || "";
      const lastName = user.last_name || "";
      const phone = user.phone || "";

      return (
        firstName.toLowerCase().includes(value) ||
        lastName.toLowerCase().includes(value) ||
        phone.toLowerCase().includes(value)
      );
    });

    setFilteredUsers(filtered);
  }, [search, users]);

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

      await loadUsers();
    } catch (err) {
      console.error(err);
      setError("Unable to verify administrator access.");
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error: usersError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (usersError) {
        throw usersError;
      }

      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to load users. Check your Supabase RLS policy."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const formatted = new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    return formatted;
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loader"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">

      {/* HEADER */}
      <header className="admin-page-header">

        <div className="admin-page-title">

          <button
            type="button"
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

            <h1>Users</h1>

            <p>
              View registered HELMEnt users.
            </p>

          </div>

        </div>

        <button
          type="button"
          className="admin-refresh-button"
          onClick={loadUsers}
          title="Refresh users"
        >
          <RefreshCw size={18} />
          Refresh
        </button>

      </header>

      <main className="admin-page-content">

        {/* ERROR */}
        {error && (
          <div className="admin-users-error">
            {error}
          </div>
        )}

        {/* SUMMARY */}
        <section className="users-summary">

          <div className="users-summary-icon">
            <Users size={23} />
          </div>

          <div>
            <strong>{users.length}</strong>
            <span>Total registered users</span>
          </div>

        </section>

        {/* SEARCH */}
        <section className="users-toolbar">

          <div className="users-search">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

          </div>

          <span className="users-result-count">
            {filteredUsers.length} user
            {filteredUsers.length !== 1 ? "s" : ""}
          </span>

        </section>

        {/* USER TABLE */}
        <section className="users-table-card">

          <div className="users-table-header">

            <div>

              <h2>Registered users</h2>

              <p>
                Users currently stored in the HELMEnt profiles table.
              </p>

            </div>

          </div>

          {filteredUsers.length === 0 ? (

            <div className="users-empty">

              <div className="users-empty-icon">
                <Users size={27} />
              </div>

              <h3>
                {search
                  ? "No users found"
                  : "No registered users"}
              </h3>

              <p>
                {search
                  ? "Try another search term."
                  : "Registered users will appear here."}
              </p>

            </div>

          ) : (

            <div className="users-table-wrapper">

              <table className="users-table">

                <thead>

                  <tr>
                    <th>User</th>
                    <th>Phone</th>
                    <th>Joined</th>
                  </tr>

                </thead>

                <tbody>

                  {filteredUsers.map((user) => {

                    const firstName = user.first_name || "";
                    const lastName = user.last_name || "";

                    const fullName =
                      `${firstName} ${lastName}`.trim() ||
                      "Unknown User";

                    const avatarLetter =
                      firstName.charAt(0).toUpperCase() || "U";

                    return (
                      <tr key={user.id}>

                        <td>

                          <div className="user-cell">

                            <div className="user-avatar">
                              {avatarLetter}
                            </div>

                            <div>

                              <strong>
                                {fullName}
                              </strong>

                              <small>
                                ID:{" "}
                                {user.id
                                  ? `${user.id.slice(0, 8)}...`
                                  : "—"}
                              </small>

                            </div>

                          </div>

                        </td>

                        <td>

                          <div className="table-info">

                            <Phone size={15} />

                            <span>
                              {user.phone || "Not provided"}
                            </span>

                          </div>

                        </td>

                        <td>

                          <div className="table-info">

                            <CalendarDays size={15} />

                            <span>
                              {formatDate(user.created_at)}
                            </span>

                          </div>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}