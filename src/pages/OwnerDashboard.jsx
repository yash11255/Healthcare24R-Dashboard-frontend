import { useEffect, useMemo, useState } from "react";
import {
  Hospital,
  UserPlus,
  ClipboardList,
  NotebookPen,
  HandHeart,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  X,
  Edit,
  GripVertical,
  User,
  Phone,
  HelpCircle,
  Send,
  Clock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import { ownerAPI, queryAPI } from "../services/api";

export default function OwnerDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.slice(1);
    return hash || "patients";
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

  // Patients
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientsError, setPatientsError] = useState("");

  // Tasks
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState("");

  // Entries
  const [entries, setEntries] = useState([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [entriesError, setEntriesError] = useState("");
  const [ownerTimezone, setOwnerTimezone] = useState("");

  const patientOptions = useMemo(
    () => patients.map((p) => ({ value: p._id || p.id, label: p.name })),
    [patients]
  );

  const fetchPatients = async () => {
    setPatientsLoading(true);
    setPatientsError("");
    try {
      const data = await ownerAPI.getPatients(true);
      const list = Array.isArray(data?.patients)
        ? data.patients
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      setPatients(list);
    } catch (err) {
      setPatientsError(err.message || "Failed to load patients");
      setPatients([]);
    } finally {
      setPatientsLoading(false);
    }
  };

  const fetchTasks = async () => {
    setTasksLoading(true);
    setTasksError("");
    try {
      const data = await ownerAPI.getTasks(true);
      const list = Array.isArray(data?.tasks)
        ? data.tasks
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      setTasks(list);
    } catch (err) {
      setTasksError(err.message || "Failed to load tasks");
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  };

  const fetchEntries = async () => {
    setEntriesLoading(true);
    setEntriesError("");
    try {
      const data = await ownerAPI.getAllTaskEntries({ limit: 50 });
      const list = Array.isArray(data?.entries)
        ? data.entries
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      // Capture owner timezone if provided by API
      if (data && typeof data.ownerTimezone === "string") {
        setOwnerTimezone(data.ownerTimezone);
      }
      setEntries(list);
    } catch (err) {
      setEntriesError(err.message || "Failed to load task entries");
      setEntries([]);
    } finally {
      setEntriesLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchTasks();
    fetchEntries();
  }, []);

  return (
    <DashboardLayout
      title="Owner Dashboard"
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
                Your facility overview is ready. Manage patients, track clinical
                tasks, and monitor recent entries.
              </p>
            </div>

            {/* Quick Stats or Actions could go here */}
            <div className="hidden lg:flex gap-4">
              <div className="text-center px-4 border-r border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase">
                  Total Patients
                </p>
                <p className="text-xl font-bold text-slate-800">
                  {patients?.length || 0}
                </p>
              </div>
              <div className="text-center px-4">
                <p className="text-xs font-bold text-slate-400 uppercase">
                  Open Tasks
                </p>
                <p className="text-xl font-bold text-[#84cc16]">
                  {tasks?.filter((t) => !t.completed)?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation - Modern Pill Style */}
        <div className="bg-slate-100/50 p-1.5 rounded-2xl hidden sm:inline-flex flex-wrap gap-1 border border-slate-200/60">
          {[
            { id: "patients", label: "Patients", icon: Hospital },
            { id: "create-patient", label: "Add Patient", icon: UserPlus },
            { id: "tasks", label: "Task Board", icon: ClipboardList },
            { id: "entries", label: "Recent Entries", icon: NotebookPen },
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
          <div className="py-5">
            {" "}
            {/* Vertical padding only, each section handles horizontal spacing */}
            {activeTab === "patients" && (
              <PatientsSection
                patients={patients}
                loading={patientsLoading}
                error={patientsError}
                onRefresh={fetchPatients}
              />
            )}
            {activeTab === "create-patient" && (
              <div className="px-4 sm:px-8">
                <div className="max-w-2xl mx-auto">
                  <CreatePatientSection onCreated={fetchPatients} />
                </div>
              </div>
            )}
            {activeTab === "tasks" && (
              <div className="px-4 sm:px-8">
                <TasksSection
                  tasks={tasks}
                  entries={entries}
                  ownerTimezone={ownerTimezone}
                  loading={tasksLoading}
                  error={tasksError}
                  onRefresh={() => {
                    fetchTasks();
                    fetchPatients();
                    fetchEntries();
                  }}
                />
              </div>
            )}
            {activeTab === "entries" && (
              <EntriesSection
                entries={entries}
                loading={entriesLoading}
                error={entriesError}
                onRefresh={fetchEntries}
              />
            )}
            {activeTab === "queries" && (
              <div className="px-4 sm:px-8">
                <QueriesSection patientOptions={patientOptions} />
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function PatientsSection({ patients, loading, error, onRefresh }) {
  return (
    <div className="space-y-6 px-4 sm:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">
            Patient Directory
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {patients.length} {patients.length === 1 ? "patient" : "patients"}{" "}
            registered
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-3" />
          <p className="text-sm font-medium">Loading patients...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && patients.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-300">
            <User className="w-6 h-6" />
          </div>
          <p className="text-slate-500 font-medium">No patients found</p>
          <p className="text-slate-400 text-sm mt-1">
            Create your first patient to get started
          </p>
        </div>
      )}

      {/* ================= DESKTOP TABLE ================= */}
      {!loading && patients.length > 0 && (
        <div className="hidden sm:block w-full overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-max">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 whitespace-nowrap">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 whitespace-nowrap">
                  Gender
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 whitespace-nowrap">
                  Age
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 whitespace-nowrap">
                  Assigned Nurse
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 whitespace-nowrap">
                  Nurse Contact
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 whitespace-nowrap">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {patients.map((p) => (
                <tr
                  key={p._id || p.id}
                  className="hover:bg-slate-50 transition"
                >
                  <td className="px-6 py-4 flex items-center gap-3 whitespace-nowrap">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {p.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <span className="font-medium text-slate-900">
                      {p.name || "N/A"}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-block ${
                        p.gender?.toLowerCase() === "male"
                          ? "bg-blue-100 text-blue-700"
                          : p.gender?.toLowerCase() === "female"
                          ? "bg-pink-100 text-pink-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {p.gender || "N/A"}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{p.age || "N/A"}</td>

                  <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                    {p.assignedNurse?.name ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold shrink-0">
                          {p.assignedNurse.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium">{p.assignedNurse.name}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">Not assigned</span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                    {p.assignedNurse?.phone ? (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-sm">{p.assignedNurse.phone}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        if (window.confirm("Delete this patient?")) {
                          ownerAPI
                            .deletePatient(p._id || p.id)
                            .then(onRefresh)
                            .catch(() => {});
                        }
                      }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 active:scale-95"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= MOBILE CARDS ================= */}
      {!loading && patients.length > 0 && (
        <div className="sm:hidden space-y-4">
          {patients.map((p) => (
            <div
              key={p._id || p.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              {/* Patient Header */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shrink-0">
                  {p.name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {p.name || "N/A"}
                  </p>
                  <p className="text-xs text-slate-500">Patient ID: {p._id?.slice(-6) || "N/A"}</p>
                </div>
              </div>

              {/* Patient Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm mb-4 pb-4 border-b border-slate-100">
                <div>
                  <p className="text-slate-400 text-xs font-medium">Gender</p>
                  <span className={`mt-1 inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                    p.gender?.toLowerCase() === "male"
                      ? "bg-blue-100 text-blue-700"
                      : p.gender?.toLowerCase() === "female"
                      ? "bg-pink-100 text-pink-700"
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    {p.gender || "N/A"}
                  </span>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-medium">Age</p>
                  <p className="font-semibold text-slate-900 mt-1">{p.age || "N/A"}</p>
                </div>
              </div>

              {/* Nurse Assignment */}
              <div className="mb-4 pb-4 border-b border-slate-100">
                <p className="text-slate-400 text-xs font-medium mb-2">Assigned Nurse</p>
                {p.assignedNurse?.name ? (
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold shrink-0">
                      {p.assignedNurse.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{p.assignedNurse.name}</p>
                      {p.assignedNurse.phone && (
                        <p className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" />
                          {p.assignedNurse.phone}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">Not assigned yet</p>
                )}
              </div>

              {/* Delete Button */}
              <button
                onClick={() => {
                  if (window.confirm("Delete this patient?")) {
                    ownerAPI
                      .deletePatient(p._id || p.id)
                      .then(onRefresh)
                      .catch(() => {});
                  }
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg active:scale-95 hover:bg-red-100"
              >
                <Trash2 className="w-4 h-4" />
                Delete Patient
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QueriesSection({ patientOptions }) {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    patientId: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [queries, setQueries] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  const fetchMyQueries = async () => {
    setListLoading(true);
    setError("");
    try {
      const data = await queryAPI.myQueries();
      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      setQueries(list);
    } catch (err) {
      setError(err.message || "Failed to load queries");
      setQueries([]);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchMyQueries();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        title: formData.title,
        message: formData.message,
        patientId: formData.patientId || undefined,
      };
      await queryAPI.create(payload);
      setMessage("Query submitted successfully");
      setFormData({ title: "", message: "", patientId: "" });
      fetchMyQueries();
    } catch (err) {
      setError(err.message || "Failed to submit query");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this query?')) return;
    try {
      await queryAPI.delete(id);
      setMessage('Query deleted successfully');
      fetchMyQueries();
    } catch (err) {
      setError(err.message || 'Failed to delete query');
    }
  };

  const statusBadge = (status) => {
    switch (status) {
      case "resolved":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#84cc1615] text-[#65a30d] text-xs font-bold border border-[#84cc1620]">
            <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
          </span>
        );
      case "priority":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-bold border border-orange-100">
            <AlertTriangle className="w-3.5 h-3.5" /> Priority
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold border border-slate-200">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Form Section */}
      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="p-3 bg-blue-50 w-fit rounded-2xl">
            <HelpCircle className="w-6 h-6 text-[#0070ba]" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Raise a Query
          </h3>
          <p className="text-slate-500 font-medium leading-relaxed">
            Encountering an issue or have a question for the admin? Submit a
            ticket and we'll get back to you shortly.
          </p>

          {message && (
            <div className="p-4 rounded-xl bg-[#84cc1610] border border-[#84cc1620] text-[#65a30d] text-sm font-bold flex items-center gap-2">
              <CheckCircle2 size={18} /> {message}
            </div>
          )}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center gap-2">
              <AlertTriangle size={18} /> {error}
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="lg:col-span-3 bg-white p-6 sm:p-8 rounded-4xl border border-slate-100 shadow-sm space-y-5"
        >
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              placeholder="Brief summary of the issue"
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-[#0070ba]/20 transition-all text-sm font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Description
            </label>
            <textarea
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              required
              rows={4}
              placeholder="Describe your issue or question in detail..."
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-[#0070ba]/20 transition-all text-sm font-medium resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Related Patient (Optional)
            </label>
            <select
              value={formData.patientId}
              onChange={(e) =>
                setFormData({ ...formData, patientId: e.target.value })
              }
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-[#0070ba]/20 transition-all text-sm font-medium text-slate-600 appearance-none"
            >
              <option value="">No specific patient</option>
              {patientOptions.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#0070ba] hover:bg-[#005a96] text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
          >
            <Send size={16} />
            {loading ? "Submitting..." : "Submit Query"}
          </button>
        </form>
      </div>

      <hr className="border-slate-100" />

      {/* List Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div>
            <h3 className="text-xl font-bold text-slate-800">My Queries</h3>
            <p className="text-sm text-slate-500 font-medium">
              History of your submitted tickets
            </p>
          </div>
          <button
            type="button"
            onClick={fetchMyQueries}
            className="p-2.5 bg-slate-50 text-slate-400 hover:text-[#0070ba] rounded-xl transition-all border border-transparent hover:border-slate-200"
          >
            <RefreshCw
              size={18}
              className={listLoading ? "animate-spin" : ""}
            />
          </button>
        </div>

        {listLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border border-slate-50">
            <div className="w-8 h-8 border-4 border-slate-100 border-t-[#0070ba] rounded-full animate-spin mb-3" />
            <p className="text-xs font-bold uppercase tracking-widest">
              Loading queries...
            </p>
          </div>
        ) : queries.length === 0 ? (
          <div className="py-12 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-medium">
              No queries submitted yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {queries.map((q) => (
              <div
                key={q._id || q.id}
                className="bg-white border border-slate-100 p-5 rounded-2xl hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="font-bold text-slate-800 group-hover:text-[#0070ba] transition-colors">
                    {q.title}
                  </div>
                  <div className="shrink-0">{statusBadge(q.status)}</div>
                </div>

                <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed font-medium">
                  {q.message}
                </p>

                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-4 border-t border-slate-50">
                  {q.patientId?.name && (
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0070ba] bg-blue-50 px-2 py-0.5 rounded-md uppercase">
                      <User size={12} /> {q.patientId.name}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase">
                    <Clock size={12} />{" "}
                    {new Date(q.createdAt).toLocaleDateString()}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(q._id || q.id)}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md uppercase border border-red-100 hover:bg-red-100 active:scale-95"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CreatePatientSection({ onCreated, ownerAPI }) {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "male",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Auto-clear success message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await ownerAPI.createPatient({
        name: formData.name,
        age: Number(formData.age),
        gender: formData.gender,
        phone: formData.phone,
        address: formData.address,
      });

      setMessage("Patient created successfully");

      // Reset form
      setFormData({
        name: "",
        age: "",
        gender: "male",
        phone: "",
        address: "",
      });

      // Trigger parent refresh
      onCreated?.();
    } catch (err) {
      setError(err.message || "Failed to create patient");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-bold text-gray-900">Add New Patient</h3>
        <p className="text-sm text-gray-500">
          Enter the patient's personal and medical details.
        </p>
      </div>

      {message && (
        <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm border border-green-100 animate-in fade-in duration-300">
          {message}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-100 animate-in fade-in duration-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Patient Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          {/* Age */}
          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Age
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="e.g. 45"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 234 567 890"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Current Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Full residential address"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors shadow-md disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creating...
            </>
          ) : (
            "Add Patient Record"
          )}
        </button>
      </form>
    </div>
  );
}

function TasksSection({ tasks, entries, ownerTimezone, loading, error, onRefresh }) {
  // Compute today's date key in owner's timezone (YYYY-MM-DD)
  const todayKey = (() => {
    try {
      if (ownerTimezone) {
        return new Date().toLocaleDateString('en-CA', { timeZone: ownerTimezone });
      }
      return new Date().toLocaleDateString('en-CA');
    } catch {
      return new Date().toLocaleDateString('en-CA');
    }
  })();

  // Build map of taskId -> { done: boolean, late: boolean } for today's entries
  const todayStatusByTask = (() => {
    const map = new Map();
    (entries || []).forEach((e) => {
      const timeStr = (e.ownerLocalTime || e.nurseLocalTime || e.timestampUTC || '').toString();
      const datePart = typeof timeStr === 'string' ? timeStr.slice(0, 10) : '';
      if (datePart !== todayKey) return;

      const taskObj = e.task || e.ownerTaskId || null;
      const taskId = taskObj ? (taskObj.id || taskObj._id || taskObj) : null;
      if (!taskId) return;

      const prev = map.get(taskId) || { done: false, late: false };
      const isLate = !!e.isLate;
      map.set(taskId, { done: true, late: prev.late || isLate });
    });
    return map;
  })();

  const getCardClasses = (taskId) => {
    const status = todayStatusByTask.get(taskId);
    if (status?.done) {
      return status.late
        ? 'border-red-300 bg-red-50'
        : 'border-emerald-300 bg-emerald-50';
    }
    return 'border-amber-300 bg-amber-50'; // pending
  };

  const getStatusPill = (taskId) => {
    const status = todayStatusByTask.get(taskId);
    if (status?.done) {
      return status.late ? (
        <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700">Late Today</span>
      ) : (
        <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">Done Today</span>
      );
    }
    return <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700">Pending Today</span>;
  };

  return (
    <div className="space-y-6">
      {/* Info Notice */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-1">
              Task Management by Admin
            </h3>
            <p className="text-sm text-blue-700">
              Tasks are managed by administrators. Owners can view today's task status here.
            </p>
          </div>
        </div>
      </div>

      {/* Task List with Today's Status */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Today's Task Board</h3>
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">Loading...</div>
        ) : error ? (
          <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
        ) : tasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed">
            No tasks found. Contact your admin to create tasks.
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((t) => {
              const id = t._id || t.id;
              return (
                <div
                  key={id}
                  className={`border rounded-xl p-4 flex items-start gap-4 shadow-sm ${getCardClasses(id)}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-gray-900 truncate">{t.name}</h4>
                      {getStatusPill(id)}
                    </div>
                    {t.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">{t.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      {t.scheduledTime && (
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">⏰ {t.scheduledTime}</span>
                      )}
                      <span className="text-xs text-gray-400">Order: {t.order}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


function EntriesSection({ entries, loading, error, onRefresh }) {
  const [viewMode, setViewMode] = useState("calendar"); // 'calendar' or 'list'
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [modalOpen]);

  // Helper: format local date as YYYY-MM-DD (no UTC shift)
  const formatDateKey = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // Group entries by local date (YYYY-MM-DD)
  const entriesByDate = useMemo(() => {
    const grouped = {};
    entries.forEach((e) => {
      const timestamp =
        e.ownerLocalTime || e.nurseLocalTime || e.timestampUTC || e.timestamp;
      if (timestamp) {
        const date = new Date(timestamp);
        const dateKey = formatDateKey(date);
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(e);
      }
    });
    return grouped;
  }, [entries]);

  const getDaysInMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const handleDateClick = (day) => {
    const selected = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    const dateKey = formatDateKey(selected);
    if (entriesByDate[dateKey]) {
      setSelectedDate({
        dateKey,
        date: selected,
        entries: entriesByDate[dateKey],
      });
      setModalOpen(true);
    }
  };

  const calendarDays = [];
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-4 px-4 sm:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Task Entries</h3>
          <p className="text-gray-600">
            View all task submissions and nurse entries
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex border border-gray-300 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-1 text-sm font-medium rounded ${
                viewMode === "calendar"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Calendar
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 text-sm font-medium rounded ${
                viewMode === "list"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              List
            </button>
          </div>
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
        <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
          Loading entries...
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
          No entries found.
        </div>
      ) : viewMode === "calendar" ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mx-auto md:max-w-lg lg:max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-gray-900">{monthName}</h4>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-gray-600 h-8 flex items-center justify-center"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => {
              const dateKey = day
                ? formatDateKey(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth(),
                      day
                    )
                  )
                : null;
              const dayEntries = dateKey ? entriesByDate[dateKey] : null;
              const hasEntries = dayEntries && dayEntries.length > 0;

              return (
                <div
                  key={idx}
                  onClick={() => day && hasEntries && handleDateClick(day)}
                  className={`aspect-square p-2 rounded-lg overflow-hidden border-2 flex flex-col items-center justify-center transition-all ${
                    !day
                      ? "bg-gray-50 border-transparent"
                      : hasEntries
                      ? "border-blue-500 bg-blue-50 hover:bg-blue-100 cursor-pointer font-semibold"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  {day && (
                    <>
                      <div className="text-sm font-medium text-gray-900">
                        {day}
                      </div>
                      {hasEntries && (
                        <div className="hidden sm:block text-xs text-blue-700 mt-1">
                          {dayEntries.length}{" "}
                          {dayEntries.length === 1 ? "entry" : "entries"}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-sm text-gray-500 mt-4">
            Click on a date with entries to view details
          </p>
        </div>
      ) : (
        <div className="-mx-4 sm:mx-0 overflow-x-auto rounded-xl border border-slate-100 shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-linear-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-widest whitespace-nowrap">
                  Date
                </th>
                <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-widest whitespace-nowrap">
                  Patient
                </th>
                <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-widest whitespace-nowrap">
                  Task
                </th>
                <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-widest whitespace-nowrap">
                  Nurse
                </th>
                <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-widest whitespace-nowrap">
                  Notes
                </th>
                <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-widest whitespace-nowrap">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {entries.map((e) => (
                <tr
                  key={e._id || e.id}
                  className="hover:bg-blue-50/50 transition-colors"
                >
                  <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-slate-700 whitespace-nowrap font-medium">
                    {e.ownerLocalTime ||
                    e.nurseLocalTime ||
                    e.timestampUTC ||
                    e.timestamp
                      ? new Date(
                          e.ownerLocalTime ||
                            e.nurseLocalTime ||
                            e.timestampUTC ||
                            e.timestamp
                        ).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-slate-900 whitespace-nowrap font-medium">
                    {e.patient?.name ||
                      (typeof e.patientId === "object" && e.patientId?.name) ||
                      e.patientName ||
                      "N/A"}
                  </td>
                  <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-slate-700 whitespace-nowrap font-medium">
                    {e.task?.name ||
                      (typeof e.ownerTaskId === "object" &&
                        e.ownerTaskId?.name) ||
                      e.task_name ||
                      e.taskName ||
                      "N/A"}
                  </td>
                  <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-slate-700 whitespace-nowrap font-medium">
                    {e.nurse?.name ||
                      (typeof e.nurseId === "object" && e.nurseId?.name) ||
                      e.nurseName ||
                      "N/A"}
                  </td>
                  <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-slate-600 whitespace-nowrap max-w-[150px] sm:max-w-xs truncate">
                    {e.note ?? e.notes ?? e.findings ?? "—"}
                  </td>
                  <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm whitespace-nowrap">
                    {e.isLate ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">
                        <AlertTriangle
                          className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0"
                          aria-hidden
                        />{" "}
                        <span className="hidden xs:inline">Late</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                        <CheckCircle2
                          className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0"
                          aria-hidden
                        />{" "}
                        <span className="hidden xs:inline">Done</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for date details */}
      {modalOpen && selectedDate && (
        <div className="fixed inset-0 backdrop-blur-xl bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">
                Entries for{" "}
                {selectedDate.date.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {selectedDate.entries.map((e) => (
                <div
                  key={e._id || e.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Patient
                      </p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {e.patient?.name ||
                          (typeof e.patientId === "object" &&
                            e.patientId?.name) ||
                          "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Task
                      </p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {e.task?.name ||
                          (typeof e.ownerTaskId === "object" &&
                            e.ownerTaskId?.name) ||
                          "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Nurse
                      </p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {e.nurse?.name ||
                          (typeof e.nurseId === "object" && e.nurseId?.name) ||
                          "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Time
                      </p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {e.ownerLocalTime ||
                        e.nurseLocalTime ||
                        e.timestampUTC ||
                        e.timestamp
                          ? new Date(
                              e.ownerLocalTime ||
                                e.nurseLocalTime ||
                                e.timestampUTC ||
                                e.timestamp
                            ).toLocaleTimeString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  {e.note || e.notes || e.findings ? (
                    <div className="mt-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Notes
                      </p>
                      <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                        {e.note || e.notes || e.findings}
                      </p>
                    </div>
                  ) : null}
                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">
                      Expected: {e.expectedCompletionTime || "—"}
                    </span>
                    {e.isLate ? (
                      <span className="inline-flex items-center gap-1 text-orange-600 text-sm font-medium">
                        <AlertTriangle className="w-4 h-4" /> Submitted Late
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4" /> On Time
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
