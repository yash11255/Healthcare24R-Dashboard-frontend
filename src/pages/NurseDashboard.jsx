import { useState, useEffect, useMemo } from "react";
import {
  Hospital,
  ClipboardCheck,
  HandHeart,
  ArrowLeft,
  MessageSquare,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  HelpCircle,
  Send,
  User,
  Trash2,
  AlertCircle,
  ClipboardList,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import { queryAPI, nurseAPI } from "../services/api";

export default function NurseDashboard() {
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

  return (
    <DashboardLayout
      title="Nurse Dashboard"
      onLogout={logout}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <HandHeart
              className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600"
              aria-hidden
            />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Welcome, {user?.name}!
            </h2>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            View assigned patients and complete tasks
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="hidden sm:flex gap-1 sm:gap-2 border-b border-gray-200 overflow-x-auto">
          {["patients", "tasks", "queries"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                window.location.hash = tab;
                setActiveTab(tab);
              }}
              className={`px-2 sm:px-4 py-3 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab === "patients" && (
                <span className="inline-flex items-center gap-1 sm:gap-2">
                  <Hospital className="h-4 w-4" aria-hidden />{" "}
                  <span className="hidden sm:inline">Patients</span>
                </span>
              )}
              {tab === "tasks" && (
                <span className="inline-flex items-center gap-1 sm:gap-2">
                  <ClipboardCheck className="h-4 w-4" aria-hidden />{" "}
                  <span className="hidden sm:inline">Tasks</span>
                </span>
              )}
              {tab === "queries" && (
                <span className="inline-flex items-center gap-1 sm:gap-2">
                  <MessageSquare className="h-4 w-4" aria-hidden />{" "}
                  <span className="hidden sm:inline">Queries</span>
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
          {activeTab === "patients" && <PatientsSection />}
          {activeTab === "tasks" && <MyTasksSection />}
          {activeTab === "queries" && <QueriesSection />}
        </div>
      </div>
    </DashboardLayout>
  );
}

function PatientsSection() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetail, setPatientDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await nurseAPI.getPatients();
      const list = Array.isArray(data?.data) ? data.data : [];
      setPatients(list);
    } catch (err) {
      setError(err.message || "Failed to load patients");
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = async (patient) => {
    setSelectedPatient(patient);
    setDetailLoading(true);
    try {
      const data = await nurseAPI.getPatient(patient.id || patient._id);
      setPatientDetail(data?.data || data);
    } catch (err) {
      console.error("Failed to load patient details:", err);
      setPatientDetail(patient); // Fallback to basic info
    } finally {
      setDetailLoading(false);
    }
  };

  if (selectedPatient) {
    const detail = patientDetail || selectedPatient;
    return (
      <div className="space-y-4">
        <button
          onClick={() => {
            setSelectedPatient(null);
            setPatientDetail(null);
          }}
          className="mb-4 inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden /> Back to List
        </button>

        <div className="grid grid-cols-1 gap-4">
          {/* Patient Info Card */}
          <div className="bg-linear-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 sm:p-6">
            <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              {detail.name}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Gender</p>
                <p className="text-sm sm:text-base font-semibold text-gray-900">
                  {detail.gender || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">
                  Date of Birth
                </p>
                <p className="text-sm sm:text-base font-semibold text-gray-900">
                  {detail.dob
                    ? new Date(detail.dob).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div className="col-span-1 sm:col-span-2">
                <p className="text-xs sm:text-sm text-gray-600">Address</p>
                <p className="text-sm sm:text-base font-semibold text-gray-900">
                  {detail.address || "N/A"}
                </p>
              </div>
              <div className="col-span-1 sm:col-span-2">
                <p className="text-xs sm:text-sm text-gray-600">Timezone</p>
                <p className="text-sm sm:text-base font-semibold text-gray-900">
                  {detail.patientTimezone || "UTC"}
                </p>
              </div>
            </div>
          </div>

          {/* Owner Info Card */}
          {detail.owner && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
              <h5 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                Patient Owner
              </h5>
              <div className="space-y-3">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Name</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-900">
                    {detail.owner.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Email</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-900 break-all">
                    {detail.owner.email}
                  </p>
                </div>
                {detail.owner.phone && (
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Phone</p>
                    <p className="text-sm sm:text-base font-semibold text-gray-900">
                      {detail.owner.phone}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Assignment Info */}
          {selectedPatient.assignedSince && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
              <h5 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                Assignment Details
              </h5>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">
                  Assigned Since
                </p>
                <p className="text-sm sm:text-base font-semibold text-gray-900">
                  {new Date(selectedPatient.assignedSince).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">
            My Assigned Patients
          </h3>
          <p className="text-sm text-slate-500">Click a row to view details</p>
        </div>
        <button
          type="button"
          onClick={fetchPatients}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 active:scale-95 disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-gray-50 p-5 rounded-lg text-center text-sm text-gray-500">
          Loading patients...
        </div>
      ) : patients.length === 0 ? (
        <div className="bg-gray-50 p-5 rounded-lg text-center text-sm text-gray-500">
          No patients assigned yet.
        </div>
      ) : (
        <div className="w-full">
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-max whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                    Timezone
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                    Assigned Since
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {patients.map((patient) => (
                  <tr
                    key={patient.id || patient._id}
                    className="hover:bg-slate-50 transition"
                  >
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center">
                        {patient.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {patient.name || "N/A"}
                        </div>
                        {patient.patientTimezone && (
                          <div className="text-xs text-slate-500">
                            TZ: {patient.patientTimezone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-block ${
                          patient.gender?.toLowerCase() === "male"
                            ? "bg-blue-100 text-blue-700"
                            : patient.gender?.toLowerCase() === "female"
                            ? "bg-pink-100 text-pink-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {patient.gender || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {patient.patientTimezone || "UTC"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {patient.owner?.name ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                            {patient.owner.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="text-sm font-medium text-slate-900">
                            {patient.owner.name}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {patient.assignedSince
                        ? new Date(patient.assignedSince).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleSelectPatient(patient)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 active:scale-95"
                      >
                        <Hospital className="w-4 h-4" aria-hidden />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {patients.map((patient) => (
              <div
                key={patient.id || patient._id}
                className="border border-slate-200 rounded-lg p-4 shadow-sm bg-white"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center">
                      {patient.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <div className="text-base font-semibold text-slate-900">
                        {patient.name || "N/A"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {patient.patientTimezone || "UTC"}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      patient.gender?.toLowerCase() === "male"
                        ? "bg-blue-100 text-blue-700"
                        : patient.gender?.toLowerCase() === "female"
                        ? "bg-pink-100 text-pink-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {patient.gender || "N/A"}
                  </span>
                </div>
                {patient.owner?.name && (
                  <div className="mt-2 text-sm text-slate-700">
                    Owner: {patient.owner.name}
                  </div>
                )}
                {patient.assignedSince && (
                  <div className="text-xs text-slate-500">
                    Assigned:{" "}
                    {new Date(patient.assignedSince).toLocaleDateString()}
                  </div>
                )}
                <button
                  onClick={() => handleSelectPatient(patient)}
                  className="mt-3 w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 active:scale-95"
                >
                  <Hospital className="w-4 h-4" aria-hidden />
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MyTasksSection() {
  const [view, setView] = useState("submit"); // 'submit' or 'history'
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [formData, setFormData] = useState({ note: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  // History view state
  const [myTasks, setMyTasks] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (view === "submit") {
      fetchPatients();
    } else {
      fetchMyTasks();
    }
  }, [view]);

  const fetchPatients = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await nurseAPI.getPatients();
      const list = Array.isArray(data?.data) ? data.data : [];
      setPatients(list);
    } catch (err) {
      setError(err.message || "Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (patientId) => {
    setTasksLoading(true);
    try {
      const data = await nurseAPI.getPatientTasks(patientId);
      const list = Array.isArray(data?.data) ? data.data : [];
      setTasks(list);
    } catch (err) {
      console.error("Failed to load tasks:", err);
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  };

  const fetchMyTasks = async () => {
    setHistoryLoading(true);
    try {
      const data = await nurseAPI.getMyTasks();
      const list = Array.isArray(data?.data) ? data.data : [];
      setMyTasks(list);
    } catch (err) {
      console.error("Failed to load task history:", err);
      setMyTasks([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    fetchTasks(patient.id || patient._id);
  };

  const handleSelectTask = (task) => {
    setSelectedTask(task);
    setFormData({ note: "" });
    setSubmitMessage("");
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  };

  const isTaskLate = (scheduledTime) => {
    if (!scheduledTime) return false;
    const current = getCurrentTime();
    return current > scheduledTime;
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMessage("");
    try {
      const payload = {
        ownerTaskId: selectedTask._id || selectedTask.id,
        note: formData.note,
      };
      const result = await nurseAPI.submitTask(
        selectedPatient.id || selectedPatient._id,
        payload
      );
      setSubmitMessage(result.message || "Task submitted successfully!");
      setFormData({ note: "" });
      setTimeout(() => {
        setSelectedTask(null);
        setSelectedPatient(null);
      }, 2000);
    } catch (err) {
      setSubmitMessage(err.message || "Failed to submit task");
    } finally {
      setSubmitting(false);
    }
  };

  // History view helpers
  const daysInMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const formatDateKey = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const entriesByDate = useMemo(() => {
    const grouped = {};
    myTasks.forEach((task) => {
      const dateStr = formatDateKey(new Date(task.timestampUTC));
      if (!grouped[dateStr]) grouped[dateStr] = [];
      grouped[dateStr].push(task);
    });
    return grouped;
  }, [myTasks]);

  const handlePreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
    setSelectedDate(null);
  };

  const monthName = currentMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  if (selectedTask && view === "submit") {
    const late = isTaskLate(selectedTask.scheduledTime);
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <button
          onClick={() => setSelectedTask(null)}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Task List</span>
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50">
            <h4 className="text-xl font-bold text-gray-900">Task Completion</h4>
            <p className="text-sm text-gray-500 mt-1">
              Submit findings for {selectedPatient?.name}
            </p>
          </div>

          <div className="p-6 space-y-6">
            {submitMessage && (
              <div
                className={`flex items-center gap-3 p-4 rounded-xl border ${
                  submitMessage.includes("Failed")
                    ? "bg-red-50 border-red-100 text-red-700"
                    : "bg-green-50 border-green-100 text-green-700"
                }`}
              >
                {submitMessage.includes("Failed") ? (
                  <AlertCircle className="w-5 h-5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
                <p className="font-medium text-sm">{submitMessage}</p>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  Task Detail
                </span>
                {selectedTask.scheduledTime && (
                  <div
                    className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full ${
                      late
                        ? "bg-orange-100 text-orange-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Expected: {selectedTask.scheduledTime}
                    {late && " (LATE)"}
                  </div>
                )}
              </div>
              <h5 className="text-lg font-bold text-gray-900">
                {selectedTask.name}
              </h5>
              {selectedTask.description && (
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                  {selectedTask.description}
                </p>
              )}
            </div>

            <form onSubmit={handleSubmitTask} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Observations & Notes
                </label>
                <textarea
                  required
                  value={formData.note}
                  onChange={(e) => setFormData({ note: e.target.value })}
                  placeholder="What was observed? e.g., 'Patient took meds without issues, BP stable at 120/80'..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none"
                  rows="5"
                />
              </div>

              <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Patient Reference</span>
                  <span className="font-semibold text-gray-900">
                    {selectedPatient?.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Submission Timestamp</span>
                  <span className="font-semibold text-gray-900">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
                {late && (
                  <div className="mt-2 flex items-center gap-2 text-xs font-bold text-orange-600 bg-orange-50 p-2 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    Schedules for {selectedTask.scheduledTime} - Submission is
                    late.
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:bg-blue-300"
              >
                {submitting ? "Processing Submission..." : "Confirm Completion"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (selectedPatient && view === "submit") {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setSelectedPatient(null);
              setTasks([]);
            }}
            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Patients</span>
          </button>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Selected Patient
            </p>
            <h3 className="text-lg font-bold text-gray-900">
              {selectedPatient.name}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <ClipboardList className="w-5 h-5 text-blue-500" />
          <h3 className="font-bold">Available Tasks</h3>
        </div>

        {tasksLoading ? (
          <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500 font-medium">
              Loading medical tasks...
            </p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-500">
              No pending tasks for this patient today.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => {
              const late = isTaskLate(task.scheduledTime);
              return (
                <div
                  key={task._id || task.id}
                  className={`group relative flex flex-col p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-xl hover:shadow-gray-100 ${
                    late
                      ? "border-orange-200 bg-orange-50/30"
                      : "border-gray-100 bg-white"
                  }`}
                  onClick={() => handleSelectTask(task)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                      {task.name}
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-300 group-hover:text-blue-400 transition-all" />
                  </div>
                  {task.description && (
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  <div className="mt-auto flex items-center justify-between">
                    {task.scheduledTime ? (
                      <div
                        className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-lg ${
                          late
                            ? "text-orange-700 bg-orange-100"
                            : "text-gray-600 bg-gray-100"
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        {task.scheduledTime} {late && "(LATE)"}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400">
                        Flexible Timing
                      </div>
                    )}
                    {late && (
                      <div className="animate-pulse w-2 h-2 bg-orange-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (view === "submit") {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => setView("submit")}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all ${
              view === "submit"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Submit Tasks
          </button>
          <button
            onClick={() => setView("history")}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all ${
              view === "history"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Task History
          </button>
        </div>

        <p className="text-lg font-semibold text-gray-900 m-0">
          My Assigned Patients
        </p>
        <p className="text-gray-600">
          Select a patient to view and complete tasks
        </p>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-28 bg-gray-100 rounded-2xl animate-pulse"
              ></div>
            ))}
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">
              No patients currently assigned to you.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {patients.map((patient) => (
              <div
                key={patient.id || patient._id}
                className="group bg-white border border-gray-100 rounded-3xl p-6 hover:shadow-2xl hover:shadow-blue-100 hover:border-blue-200 transition-all cursor-pointer relative"
                onClick={() => handleSelectPatient(patient)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                    <User className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-lg">
                      {patient.name}
                    </div>
                    {patient.owner && (
                      <p className="text-xs font-semibold text-gray-400 uppercase mt-0.5 tracking-tight">
                        Owner: {patient.owner.name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full group-hover:bg-blue-100">
                    View Routine
                  </span>
                  <ChevronDown className="w-5 h-5 text-gray-300 group-hover:text-blue-600 translate-x-0 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setView("submit")}
          className={`px-6 py-2.5 rounded-xl font-bold transition-all ${
            view === "submit"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Submit Tasks
        </button>
        <button
          onClick={() => setView("history")}
          className={`px-6 py-2.5 rounded-xl font-bold transition-all ${
            view === "history"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Task History
        </button>
      </div>

      <h3 className="text-lg font-semibold text-gray-900">Submitted Tasks</h3>
      <p className="text-gray-600">View your submitted tasks calendar</p>

      {historyLoading ? (
        <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
          Loading task history...
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6 mx-auto md:max-w-lg lg:max-w-xl">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-semibold text-gray-900">
                {monthName}
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={handlePreviousMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center font-semibold text-gray-600 text-sm py-2"
                >
                  {day}
                </div>
              ))}

              {Array.from({ length: firstDayOfMonth(currentMonth) }).map(
                (_, i) => (
                  <div key={`empty-${i}`} className="aspect-square"></div>
                )
              )}

              {Array.from({ length: daysInMonth(currentMonth) }).map((_, i) => {
                const date = new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth(),
                  i + 1
                );
                const dateStr = formatDateKey(date);
                const hasEntries = entriesByDate[dateStr];
                const isSelected = selectedDate === dateStr;

                return (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedDate(dateStr);
                      setShowModal(true);
                    }}
                    className={`aspect-square rounded-lg border-2 transition-colors flex items-center justify-center text-sm font-medium relative ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : hasEntries
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {i + 1}
                    {hasEntries && (
                      <div className="absolute bottom-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Submitted</p>
              <p className="text-2xl font-bold text-gray-900">
                {myTasks.length}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">On Time</p>
              <p className="text-2xl font-bold text-green-600">
                {myTasks.filter((t) => !t.isLate).length}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">Late</p>
              <p className="text-2xl font-bold text-orange-600">
                {myTasks.filter((t) => t.isLate).length}
              </p>
            </div>
          </div>
        </div>
      )}

      {showModal && selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h5 className="font-semibold text-gray-900">
                {new Date(selectedDate).toLocaleDateString("default", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h5>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedDate(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {entriesByDate[selectedDate] &&
              entriesByDate[selectedDate].length > 0 ? (
                entriesByDate[selectedDate].map((entry) => (
                  <div
                    key={entry.id || entry._id}
                    className="border rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {entry.task?.name}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Patient: {entry.patient?.name}
                        </p>
                      </div>
                      {entry.isLate ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                          <Clock className="w-3.5 h-3.5" />
                          Late
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Done
                        </span>
                      )}
                    </div>
                    {entry.note && (
                      <p className="text-sm text-gray-700 mt-2 p-2 bg-white rounded border border-gray-200">
                        {entry.note}
                      </p>
                    )}
                    {entry.expectedCompletionTime && (
                      <p className="text-xs text-gray-500 mt-2">
                        Expected: {entry.expectedCompletionTime}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Submitted:{" "}
                      {new Date(entry.submittedAt).toLocaleTimeString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">
                  No tasks submitted on this date
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QueriesSection() {
  const [formData, setFormData] = useState({ title: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [messageText, setMessageText] = useState("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessageText("");
    try {
      await queryAPI.create({
        title: formData.title,
        message: formData.message,
      });
      setMessageText("Query submitted successfully");
      setFormData({ title: "", message: "" });
      fetchMyQueries();
    } catch (err) {
      setError(err.message || "Failed to submit query");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this query?")) return;
    try {
      await queryAPI.delete(id);
      setMessageText("Query deleted successfully");
      fetchMyQueries();
    } catch (err) {
      setError(err.message || "Failed to delete query");
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

  useEffect(() => {
    fetchMyQueries();
  }, []);

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
            Encountering an issue or have a question? Submit a ticket and we'll
            get back to you shortly.
          </p>

          {messageText && (
            <div className="p-4 rounded-xl bg-[#84cc1610] border border-[#84cc1620] text-[#65a30d] text-sm font-bold flex items-center gap-2">
              <CheckCircle2 size={18} /> {messageText}
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
