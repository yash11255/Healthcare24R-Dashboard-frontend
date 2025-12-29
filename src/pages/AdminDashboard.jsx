import { useEffect, useState } from "react";
import {
  Users,
  Building2,
  Stethoscope,
  ClipboardList,
  HandHeart,
  RefreshCw,
  Activity,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  ListTodo,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import { adminAPI, queryAPI } from "../services/api";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.slice(1);
    return hash || "users";
  });

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) setActiveTab(hash);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);
  const [users, setUsers] = useState([]);
  const [usersRoleFilter, setUsersRoleFilter] = useState("");
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");

  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [assignmentsError, setAssignmentsError] = useState("");

  const [queries, setQueries] = useState([]);
  const [queriesLoading, setQueriesLoading] = useState(false);
  const [queriesError, setQueriesError] = useState("");
  const [queryFilters, setQueryFilters] = useState({
    status: "",
    category: "",
  });

  const fetchUsers = async (role = "") => {
    setUsersLoading(true);
    setUsersError("");
    try {
      const data = await adminAPI.getUsers(role || undefined);
      const safeUsers = Array.isArray(data?.users)
        ? data.users
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      setUsers(safeUsers);
    } catch (err) {
      setUsersError(err.message || "Failed to load users");
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchAssignments = async () => {
    setAssignmentsLoading(true);
    setAssignmentsError("");
    try {
      const data = await adminAPI.getAssignments({});
      const safeAssignments = Array.isArray(data?.assignments)
        ? data.assignments
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      setAssignments(safeAssignments);
    } catch (err) {
      setAssignmentsError(err.message || "Failed to load assignments");
      setAssignments([]);
    } finally {
      setAssignmentsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(usersRoleFilter);
    fetchAssignments();
    fetchQueries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchQueries = async () => {
    setQueriesLoading(true);
    setQueriesError("");
    try {
      const data = await queryAPI.adminList(queryFilters);
      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      setQueries(list);
    } catch (err) {
      setQueriesError(err.message || "Failed to load queries");
      setQueries([]);
    } finally {
      setQueriesLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Admin Dashboard"
      onLogout={logout}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Welcome Section - Professional Header Style */}
        <div className="relative overflow-hidden bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-60"></div>

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <HandHeart className="w-6 h-6 text-[#0070ba]" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Welcome, {user?.name}!
                </h2>
              </div>
              <p className="text-slate-500 font-medium max-w-md">
                Manage users, owners, nurses, and assignments across the
                platform.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="hidden lg:flex gap-4">
              <div className="text-center px-4 border-r border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase">
                  Total Users
                </p>
                <p className="text-xl font-bold text-slate-800">
                  {users?.length || 0}
                </p>
              </div>
              <div className="text-center px-4">
                <p className="text-xs font-bold text-slate-400 uppercase">
                  Assignments
                </p>
                <p className="text-xl font-bold text-[#84cc16]">
                  {assignments?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation - Modern Pill Style */}
        <div className="bg-slate-100/50 p-1.5 rounded-2xl hidden sm:inline-flex flex-wrap gap-1 border border-slate-200/60">
          {[
            { id: "users", label: "Users", icon: Users },
            { id: "create-owner", label: "Add Owner", icon: Building2 },
            { id: "create-nurse", label: "Add Nurse", icon: Stethoscope },
            { id: "assignments", label: "Assignments", icon: ClipboardList },
            { id: "tasks", label: "Manage Tasks", icon: ListTodo },
            { id: "queries", label: "Queries", icon: MessageSquare },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                window.location.hash = tab.id;
                setActiveTab(tab.id);
              }}
              className={`
            flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all
            ${
              activeTab === tab.id
                ? "bg-white text-[#0070ba] shadow-sm ring-1 ring-slate-200"
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            }
          `}
            >
              <tab.icon
                className={`h-4 w-4 ${
                  activeTab === tab.id ? "text-[#84cc16]" : ""
                }`}
              />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 min-h-[500px] overflow-hidden">
          <div className="py-5 px-8">
            {activeTab === "users" && (
              <UsersSection
                users={users}
                loading={usersLoading}
                error={usersError}
                roleFilter={usersRoleFilter}
                onRoleFilterChange={(role) => {
                  setUsersRoleFilter(role);
                  fetchUsers(role);
                }}
                onRefresh={() => fetchUsers(usersRoleFilter)}
              />
            )}
            {activeTab === "create-owner" && (
              <div className="px-4 sm:px-8">
                <div className="max-w-2xl mx-auto">
                  <CreateOwnerSection
                    onCreated={() => {
                      fetchUsers(usersRoleFilter);
                    }}
                  />
                </div>
              </div>
            )}
            {activeTab === "create-nurse" && (
              <div className="px-4 sm:px-8">
                <div className="max-w-2xl mx-auto">
                  <CreateNurseSection
                    onCreated={() => {
                      fetchUsers(usersRoleFilter);
                    }}
                  />
                </div>
              </div>
            )}
            {activeTab === "assignments" && (
              <div className="px-4 sm:px-8">
                <AssignmentsSection
                  assignments={assignments}
                  loading={assignmentsLoading}
                  error={assignmentsError}
                  onRefresh={fetchAssignments}
                  onAssignmentCreated={() => {
                    fetchAssignments();
                    fetchUsers(usersRoleFilter);
                  }}
                />
              </div>
            )}
            {activeTab === "tasks" && (
              <div className="px-4 sm:px-8">
                <TaskManagementSection
                  users={users}
                  onRefresh={() => fetchUsers(usersRoleFilter)}
                />
              </div>
            )}
            {activeTab === "queries" && (
              <div className="px-4 sm:px-8">
                <QueriesAdminSection
                  queries={queries}
                  loading={queriesLoading}
                  error={queriesError}
                  filters={queryFilters}
                  onFiltersChange={setQueryFilters}
                  onRefresh={fetchQueries}
                  onUpdateStatus={(queryId, status) => {
                    queryAPI
                      .updateQueryStatus(queryId, status)
                      .then(() => fetchQueries())
                      .catch((err) =>
                        console.error("Failed to update query:", err)
                      );
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function QueriesAdminSection({
  queries,
  loading,
  error,
  filters,
  onFiltersChange,
  onRefresh,
  onUpdateStatus,
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            All Queries
          </h3>
          <p className="text-xs sm:text-sm text-gray-600">
            Filter, review, and update statuses
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <select
            value={filters.status}
            onChange={(e) =>
              onFiltersChange({ ...filters, status: e.target.value })
            }
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="priority">Priority</option>
            <option value="resolved">Resolved</option>
          </select>
          <select
            value={filters.category}
            onChange={(e) =>
              onFiltersChange({ ...filters, category: e.target.value })
            }
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
          >
            <option value="">All categories</option>
            <option value="owner">Owner</option>
            <option value="nurse">Nurse</option>
          </select>
          <button
            type="button"
            onClick={onRefresh}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" aria-hidden /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
          Loading queries...
        </div>
      ) : queries.length === 0 ? (
        <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
          No queries found.
        </div>
      ) : (
        <div className="w-full">
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="min-w-max w-full whitespace-nowrap">
              <thead className="bg-linear-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 border-b-2 border-gray-200">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 border-b-2 border-gray-200">
                    From
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 border-b-2 border-gray-200">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 border-b-2 border-gray-200">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 border-b-2 border-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {queries.map((q) => (
                  <tr
                    key={q._id || q.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="font-semibold">{q.title}</div>
                      <div className="text-gray-600 mt-1.5 text-xs whitespace-pre-wrap line-clamp-2">
                        {q.message}
                      </div>
                      {q.patientId?.name && (
                        <div className="text-xs text-gray-500 mt-1.5 inline-block px-2 py-0.5 bg-blue-50 rounded">
                          Patient: {q.patientId.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="font-medium">{q.createdBy?.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5 capitalize">
                        ({q.createdBy?.role})
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize bg-purple-100 text-purple-700">
                        {q.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                          q.status === "resolved"
                            ? "bg-green-100 text-green-700"
                            : q.status === "priority"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <select
                          value={q.status}
                          onChange={(e) =>
                            onUpdateStatus(q._id || q.id, e.target.value)
                          }
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          <option value="pending">Pending</option>
                          <option value="priority">Priority</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {queries.map((q) => (
              <div
                key={q._id || q.id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-base font-semibold text-gray-900">
                      {q.title}
                    </div>
                    <div className="text-xs text-gray-600">
                      {q.createdBy?.name}{" "}
                      <span className="text-gray-500">
                        ({q.createdBy?.role})
                      </span>
                    </div>
                  </div>
                  <div className="text-xs capitalize text-gray-700">
                    {q.status}
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-600 whitespace-pre-wrap">
                  {q.message}
                </div>
                {q.patientId?.name && (
                  <div className="mt-1 text-xs text-gray-500">
                    Patient: {q.patientId.name}
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs capitalize text-gray-700">
                    Category: {q.category}
                  </div>
                  <select
                    value={q.status}
                    onChange={(e) =>
                      onUpdateStatus(q._id || q.id, e.target.value)
                    }
                    className="px-2 py-1 border border-gray-300 rounded-md text-xs"
                  >
                    <option value="pending">Pending</option>
                    <option value="priority">Priority</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function UsersSection({
  users,
  loading,
  error,
  roleFilter,
  onRoleFilterChange,
  onRefresh,
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">All Users</h3>
          <p className="text-gray-600">Filter by role or refresh the list</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => onRoleFilterChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="owner">Owner</option>
            <option value="nurse">Nurse</option>
          </select>
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" aria-hidden /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
          Loading users...
        </div>
      ) : users.length === 0 ? (
        <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
          No users found.
        </div>
      ) : (
        <div className="w-full">
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="min-w-max w-full whitespace-nowrap">
              <thead className="bg-linear-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 border-b-2 border-gray-200">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 border-b-2 border-gray-200">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 border-b-2 border-gray-200">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 border-b-2 border-gray-200">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {users.map((u) => (
                  <tr
                    key={u._id || u.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {u.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {u.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize bg-blue-100 text-blue-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {u.isActive === false ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                          <AlertTriangle className="w-3.5 h-3.5" aria-hidden />{" "}
                          Inactive
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden />{" "}
                          Active
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {users.map((u) => (
              <div
                key={u._id || u.id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-base font-semibold text-gray-900">
                      {u.name}
                    </div>
                    <div className="text-sm text-gray-600 capitalize">
                      {u.role}
                    </div>
                  </div>
                  <div className="text-sm">
                    {u.isActive === false ? (
                      <span className="inline-flex items-center gap-1 text-red-600">
                        <AlertTriangle className="w-4 h-4" aria-hidden />{" "}
                        Inactive
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="w-4 h-4" aria-hidden /> Active
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-700">
                  <div className="">Email: {u.email || "—"}</div>
                  <div className="">Phone: {u.phone || "—"}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CreateOwnerSection({ onCreated }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    timezone: "UTC",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await adminAPI.createOwner(formData);
      setMessage("Owner created successfully");
      setFormData({ name: "", email: "", password: "", timezone: "UTC" });
      onCreated?.();
    } catch (err) {
      setError(err.message || "Failed to create owner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Create New Owner</h3>
      {message && (
        <div className="p-3 rounded-md bg-green-50 text-green-700 text-sm">
          {message}
        </div>
      )}
      {error && (
        <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            name="timezone"
            value={formData.timezone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <option>UTC</option>
            <option>Asia/Kolkata</option>
            <option>America/New_York</option>
          </select>
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Creating..." : "Create Owner"}
        </button>
      </form>
    </div>
  );
}

function CreateNurseSection({ onCreated }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    aadhaarNumber: "",
    bankAccountNumber: "",
    bankIFSC: "",
    bankName: "",
    timezone: "UTC",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await adminAPI.createNurse(formData);
      setMessage("Nurse created successfully");
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        aadhaarNumber: "",
        bankAccountNumber: "",
        bankIFSC: "",
        bankName: "",
        timezone: "UTC",
      });
      onCreated?.();
    } catch (err) {
      setError(err.message || "Failed to create nurse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Create New Nurse</h3>
      {message && (
        <div className="p-3 rounded-md bg-green-50 text-green-700 text-sm">
          {message}
        </div>
      )}
      {error && (
        <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Jane Doe"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="jane@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 9876543210"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street address"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aadhaar Number (12 digits)
            </label>
            <input
              type="text"
              name="aadhaarNumber"
              value={formData.aadhaarNumber}
              onChange={handleChange}
              placeholder="123456789012"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              maxLength="12"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bank Account Number
            </label>
            <input
              type="text"
              name="bankAccountNumber"
              value={formData.bankAccountNumber}
              onChange={handleChange}
              placeholder="1234567890123456"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bank IFSC Code
            </label>
            <input
              type="text"
              name="bankIFSC"
              value={formData.bankIFSC}
              onChange={handleChange}
              placeholder="SBIN0001234"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bank Name
            </label>
            <input
              type="text"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              placeholder="State Bank of India"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option>UTC</option>
              <option>Asia/Kolkata</option>
              <option>America/New_York</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Creating..." : "Create Nurse"}
        </button>
      </form>
    </div>
  );
}

function AssignmentsSection({
  assignments,
  loading,
  error,
  onRefresh,
  onAssignSuccess,
}) {
  const [assignForm, setAssignForm] = useState({ nurseId: "", patientId: "" });
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignMessage, setAssignMessage] = useState("");
  const [assignError, setAssignError] = useState("");

  // Search and dropdown state
  const [nurses, setNurses] = useState([]);
  const [patients, setPatients] = useState([]);
  const [nurseSearch, setNurseSearch] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [nurseSearchResults, setNurseSearchResults] = useState([]);
  const [patientSearchResults, setPatientSearchResults] = useState([]);
  const [showNurseDropdown, setShowNurseDropdown] = useState(false);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [selectedNurseName, setSelectedNurseName] = useState("");
  const [selectedPatientName, setSelectedPatientName] = useState("");
  const [nurseSearchLoading, setNurseSearchLoading] = useState(false);
  const [patientSearchLoading, setPatientSearchLoading] = useState(false);

  // Debounced search for nurses
  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (nurseSearch.trim().length === 0) {
        setNurseSearchResults([]);
        return;
      }

      setNurseSearchLoading(true);
      try {
        const data = await adminAPI.getUsers("nurse");
        const nursesList = Array.isArray(data?.users)
          ? data.users
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];

        // Filter on client side for better UX
        const filtered = nursesList.filter(
          (n) =>
            n.name?.toLowerCase().includes(nurseSearch.toLowerCase()) ||
            n.email?.toLowerCase().includes(nurseSearch.toLowerCase()) ||
            n._id?.toLowerCase().includes(nurseSearch.toLowerCase())
        );

        setNurseSearchResults(filtered);
      } catch (err) {
        console.error("Failed to search nurses:", err);
        setNurseSearchResults([]);
      } finally {
        setNurseSearchLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceTimer);
  }, [nurseSearch]);

  // Debounced search for patients
  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (patientSearch.trim().length === 0) {
        setPatientSearchResults([]);
        return;
      }

      setPatientSearchLoading(true);
      try {
        const data = await adminAPI.getUsers("owner");
        const patientsList = Array.isArray(data?.users)
          ? data.users
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];

        // Filter on client side for better UX
        const filtered = patientsList.filter(
          (p) =>
            p.name?.toLowerCase().includes(patientSearch.toLowerCase()) ||
            p.email?.toLowerCase().includes(patientSearch.toLowerCase()) ||
            p._id?.toLowerCase().includes(patientSearch.toLowerCase())
        );

        setPatientSearchResults(filtered);
      } catch (err) {
        console.error("Failed to search patients:", err);
        setPatientSearchResults([]);
      } finally {
        setPatientSearchLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceTimer);
  }, [patientSearch]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".nurse-dropdown-container")) {
        setShowNurseDropdown(false);
      }
      if (!event.target.closest(".patient-dropdown-container")) {
        setShowPatientDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    setAssignLoading(true);
    setAssignError("");
    setAssignMessage("");

    try {
      await adminAPI.assignNurse(assignForm.patientId, assignForm.nurseId);
      setAssignMessage("Assignment created successfully");
      setAssignForm({ nurseId: "", patientId: "" });
      setSelectedNurseName("");
      setSelectedPatientName("");
      setNurseSearch("");
      setPatientSearch("");
      onAssignSuccess?.();
    } catch (err) {
      setAssignError(err.message || "Failed to create assignment");
    } finally {
      setAssignLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Assignments</h3>
          <p className="text-gray-600">
            View and manage nurse to patient assignments
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" aria-hidden /> Refresh
        </button>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Create Assignment
        </h4>
        {assignMessage && (
          <div className="p-3 rounded-md bg-green-50 text-green-700 text-sm mb-3">
            {assignMessage}
          </div>
        )}
        {assignError && (
          <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm mb-3">
            {assignError}
          </div>
        )}
        <form onSubmit={handleAssign} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nurse Search Dropdown */}
            <div className="relative nurse-dropdown-container">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Nurse <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search nurse by name, email, or ID..."
                    value={selectedNurseName || nurseSearch}
                    onChange={(e) => {
                      setNurseSearch(e.target.value);
                      setSelectedNurseName("");
                      setAssignForm({ ...assignForm, nurseId: "" });
                      setShowNurseDropdown(true);
                    }}
                    onFocus={() => setShowNurseDropdown(true)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                    autoComplete="off"
                  />
                  {nurseSearchLoading && (
                    <div className="absolute right-3 top-2.5">
                      <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>

                {showNurseDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {nurseSearchLoading ? (
                      <div className="px-4 py-8 text-center">
                        <div className="inline-block animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        <p className="text-sm text-gray-500 mt-2">
                          Searching nurses...
                        </p>
                      </div>
                    ) : nurseSearch.trim().length === 0 ? (
                      <div className="px-4 py-4 text-center">
                        <p className="text-sm text-gray-500">
                          Start typing to search nurses
                        </p>
                      </div>
                    ) : nurseSearchResults.length > 0 ? (
                      nurseSearchResults.map((nurse) => (
                        <div
                          key={nurse._id}
                          onClick={() => {
                            setAssignForm({
                              ...assignForm,
                              nurseId: nurse._id,
                            });
                            setSelectedNurseName(nurse.name);
                            setNurseSearch("");
                            setShowNurseDropdown(false);
                          }}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="font-medium text-gray-900">
                            {nurse.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {nurse.email}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            ID: {nurse._id}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-4 text-center">
                        <p className="text-sm text-gray-500">
                          No nurses found matching "{nurseSearch}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {selectedNurseName && (
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Selected: {selectedNurseName}
                </div>
              )}
            </div>

            {/* Patient Search Dropdown */}
            <div className="relative patient-dropdown-container">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Patient <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search patient by name, email, or ID..."
                    value={selectedPatientName || patientSearch}
                    onChange={(e) => {
                      setPatientSearch(e.target.value);
                      setSelectedPatientName("");
                      setAssignForm({ ...assignForm, patientId: "" });
                      setShowPatientDropdown(true);
                    }}
                    onFocus={() => setShowPatientDropdown(true)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                    autoComplete="off"
                  />
                  {patientSearchLoading && (
                    <div className="absolute right-3 top-2.5">
                      <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>

                {showPatientDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {patientSearchLoading ? (
                      <div className="px-4 py-8 text-center">
                        <div className="inline-block animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        <p className="text-sm text-gray-500 mt-2">
                          Searching patients...
                        </p>
                      </div>
                    ) : patientSearch.trim().length === 0 ? (
                      <div className="px-4 py-4 text-center">
                        <p className="text-sm text-gray-500">
                          Start typing to search patients
                        </p>
                      </div>
                    ) : patientSearchResults.length > 0 ? (
                      patientSearchResults.map((patient) => (
                        <div
                          key={patient._id}
                          onClick={() => {
                            setAssignForm({
                              ...assignForm,
                              patientId: patient._id,
                            });
                            setSelectedPatientName(patient.name);
                            setPatientSearch("");
                            setShowPatientDropdown(false);
                          }}
                          className="px-4 py-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="font-medium text-gray-900">
                            {patient.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {patient.email}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            ID: {patient._id}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-4 text-center">
                        <p className="text-sm text-gray-500">
                          No patients found matching "{patientSearch}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {selectedPatientName && (
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-md text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Selected: {selectedPatientName}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={
              assignLoading || !assignForm.nurseId || !assignForm.patientId
            }
          >
            {assignLoading ? "Assigning..." : "Assign Nurse to Patient"}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
          Loading assignments...
        </div>
      ) : assignments.length === 0 ? (
        <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
          No assignments found.
        </div>
      ) : (
        <div className="w-full">
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="min-w-max w-full whitespace-nowrap">
              <thead className="bg-linear-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 border-b-2 border-gray-200">
                    Nurse
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 border-b-2 border-gray-200">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 border-b-2 border-gray-200">
                    Assigned By
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 border-b-2 border-gray-200">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {assignments.map((a) => (
                  <tr
                    key={a._id || a.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="font-medium">
                        {typeof a.nurseId === "object" && a.nurseId
                          ? a.nurseId.name || "N/A"
                          : "N/A"}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {typeof a.nurseId === "object" && a.nurseId
                          ? a.nurseId._id
                          : String(a.nurseId || "N/A")}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="font-medium">
                        {typeof a.patientId === "object" && a.patientId
                          ? a.patientId.name || "N/A"
                          : "N/A"}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {typeof a.patientId === "object" && a.patientId
                          ? a.patientId._id
                          : String(a.patientId || "N/A")}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="font-medium">
                        {typeof a.assignedByAdmin === "object" &&
                        a.assignedByAdmin
                          ? a.assignedByAdmin.name || "N/A"
                          : "N/A"}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {typeof a.assignedByAdmin === "object" &&
                        a.assignedByAdmin
                          ? a.assignedByAdmin._id
                          : String(a.assignedByAdmin || "N/A")}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {a.active === false ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                          <Activity
                            className="w-3.5 h-3.5 rotate-45"
                            aria-hidden
                          />{" "}
                          Inactive
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden />{" "}
                          Active
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {assignments.map((a) => (
              <div
                key={a._id || a.id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    <div className="font-semibold text-gray-900">Nurse</div>
                    <div>
                      {typeof a.nurseId === "object" && a.nurseId
                        ? a.nurseId.name || "N/A"
                        : "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {typeof a.nurseId === "object" && a.nurseId
                        ? a.nurseId._id
                        : String(a.nurseId || "N/A")}
                    </div>
                  </div>
                  <div className="text-sm">
                    {a.active === false ? (
                      <span className="inline-flex items-center gap-1 text-red-600">
                        <Activity className="w-4 h-4 rotate-45" aria-hidden />{" "}
                        Inactive
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="w-4 h-4" aria-hidden /> Active
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3 text-sm text-gray-700">
                  <div>
                    <div className="font-semibold text-gray-900">Patient</div>
                    <div>
                      {typeof a.patientId === "object" && a.patientId
                        ? a.patientId.name || "N/A"
                        : "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {typeof a.patientId === "object" && a.patientId
                        ? a.patientId._id
                        : String(a.patientId || "N/A")}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      Assigned By
                    </div>
                    <div>
                      {typeof a.assignedByAdmin === "object" &&
                      a.assignedByAdmin
                        ? a.assignedByAdmin.name || "N/A"
                        : "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {typeof a.assignedByAdmin === "object" &&
                      a.assignedByAdmin
                        ? a.assignedByAdmin._id
                        : String(a.assignedByAdmin || "N/A")}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
// Task Management Section Component
function TaskManagementSection({ users, onRefresh }) {
  const [selectedOwnerId, setSelectedOwnerId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Fetch tasks when owner is selected
  const fetchTasks = async () => {
    if (!selectedOwnerId) {
      setTasks([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await adminAPI.getOwnerTasks(selectedOwnerId, true);
      const list = Array.isArray(data?.data) ? data.data : [];
      setTasks(list);
    } catch (err) {
      setError(err.message || "Failed to load tasks");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOwnerId]);

  // Form state for creating tasks
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    order: 0,
    scheduledTime: "",
    fromTemplate: "",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Fetch templates on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      setTemplatesLoading(true);
      try {
        const data = await adminAPI.getTaskTemplates();
        const list = Array.isArray(data?.data) ? data.data : [];
        setTemplates(list);
      } catch (err) {
        console.error("Failed to fetch templates:", err);
      } finally {
        setTemplatesLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "fromTemplate" && value) {
      const template = templates.find((t) => (t._id || t.id) === value);
      if (template) {
        setFormData({
          ...formData,
          fromTemplate: value,
          name: template.name,
          description: template.description || "",
          scheduledTime: template.scheduledTime || "",
        });
        return;
      }
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!selectedOwnerId) {
      setFormError("Please select a patient first");
      return;
    }
    setSaving(true);
    setFormError("");
    setMessage("");
    try {
      await adminAPI.createOwnerTask(selectedOwnerId, {
        name: formData.name,
        description: formData.description,
        order: Number(formData.order) || 0,
        scheduledTime: formData.scheduledTime || undefined,
        fromTemplate: formData.fromTemplate || undefined,
      });
      setMessage("Task created successfully");
      setFormData({
        name: "",
        description: "",
        order: 0,
        scheduledTime: "",
        fromTemplate: "",
      });
      fetchTasks();
    } catch (err) {
      setFormError(err.message || "Failed to create task");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await adminAPI.deleteOwnerTask(taskId);
      setMessage("Task deleted successfully");
      fetchTasks();
    } catch (err) {
      setError(err.message || "Failed to delete task");
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Task Management
          </h3>
          <p className="text-gray-600">Create and manage tasks for patients</p>
        </div>
        <button
          onClick={() => {
            fetchTasks();
            onRefresh();
          }}
          className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Owner Selection */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Owner/Facility
        </label>
        <select
          value={selectedOwnerId}
          onChange={(e) => setSelectedOwnerId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">-- Select an Owner --</option>
          {users
            .filter((u) => u.role === "owner")
            .map((owner) => (
              <option key={owner._id || owner.id} value={owner._id || owner.id}>
                {owner.name} ({owner.email})
              </option>
            ))}
        </select>
      </div>

      {selectedOwnerId && (
        <>
          {/* Create Task Form */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Create Task for Facility
            </h4>
            {message && (
              <div className="p-3 mb-4 rounded-md bg-green-50 text-green-700 text-sm border border-green-200">
                {message}
              </div>
            )}
            {formError && (
              <div className="p-3 mb-4 rounded-md bg-red-50 text-red-700 text-sm border border-red-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Template (Optional)
                  </label>
                  <select
                    name="fromTemplate"
                    value={formData.fromTemplate}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    disabled={templatesLoading}
                  >
                    <option value="">-- Custom Task --</option>
                    {templates.map((tpl) => (
                      <option key={tpl._id || tpl.id} value={tpl._id || tpl.id}>
                        {tpl.name}{" "}
                        {tpl.scheduledTime ? `(${tpl.scheduledTime})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="e.g., Morning Check-in"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    rows="2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="time"
                    name="scheduledTime"
                    value={formData.scheduledTime}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors disabled:bg-blue-300"
                disabled={saving}
              >
                {saving ? "Creating..." : "Create Task"}
              </button>
            </form>
          </div>

          {/* Task List */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              Tasks for Selected Owner
            </h4>
            {loading ? (
              <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
                Loading...
              </div>
            ) : error ? (
              <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm">
                {error}
              </div>
            ) : tasks.length === 0 ? (
              <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                No tasks found for this owner.
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((t) => (
                  <div
                    key={t._id || t.id}
                    className="border rounded-xl p-4 flex items-start gap-4 bg-white shadow-sm border-gray-200"
                  >
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold text-gray-900 truncate">
                        {t.name}
                      </h5>
                      {t.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                          {t.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        {t.scheduledTime && (
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                            ⏰ {t.scheduledTime}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          Order: {t.order}
                        </span>
                        {!t.active && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteTask(t._id || t.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Activity className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
