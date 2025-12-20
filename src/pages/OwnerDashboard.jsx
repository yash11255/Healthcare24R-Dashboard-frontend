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
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import { ownerAPI, queryAPI } from "../services/api";

export default function OwnerDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("patients");

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
    <DashboardLayout title="Owner Dashboard" onLogout={logout}>
      <div className="space-y-4 sm:space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <HandHeart className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600 shrink-0" aria-hidden />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Welcome, {user?.name}!
            </h2>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            Manage patients, create tasks, and track entries
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 sm:gap-2 border-b border-gray-200 overflow-x-auto">
          {["patients", "create-patient", "tasks", "entries", "queries"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-2 sm:px-4 py-3 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab === "patients" && (
                  <span className="inline-flex items-center gap-1 sm:gap-2">
                    <Hospital className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Patients</span>
                  </span>
                )}
                {tab === "create-patient" && (
                  <span className="inline-flex items-center gap-1 sm:gap-2">
                    <UserPlus className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Add</span>
                  </span>
                )}
                {tab === "tasks" && (
                  <span className="inline-flex items-center gap-1 sm:gap-2">
                    <ClipboardList className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Tasks</span>
                  </span>
                )}
                {tab === "entries" && (
                  <span className="inline-flex items-center gap-1 sm:gap-2">
                    <NotebookPen className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Entries</span>
                  </span>
                )}
                {tab === "queries" && (
                  <span className="inline-flex items-center gap-1 sm:gap-2">
                    <MessageSquare className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Queries</span>
                  </span>
                )}
              </button>
            )
          )}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
          {activeTab === "patients" && (
            <PatientsSection
              patients={patients}
              loading={patientsLoading}
              error={patientsError}
              onRefresh={fetchPatients}
            />
          )}
          {activeTab === "create-patient" && (
            <CreatePatientSection
              onCreated={() => {
                fetchPatients();
              }}
            />
          )}
          {activeTab === "tasks" && (
            <TasksSection
              patients={patientOptions}
              tasks={tasks}
              loading={tasksLoading}
              error={tasksError}
              onRefresh={() => {
                fetchTasks();
                fetchPatients();
              }}
            />
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
            <QueriesSection patientOptions={patientOptions} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function PatientsSection({ patients, loading, error, onRefresh }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Your Patients</h3>
          <p className="text-gray-600">View and manage all patients</p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" aria-hidden /> Refresh
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
          Loading patients...
        </div>
      ) : patients.length === 0 ? (
        <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
          No patients found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Name
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Phone
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Gender
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {patients.map((p) => (
                <tr key={p._id || p.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">{p.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {p.phone || "N/A"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700 capitalize">
                    {p.gender || "N/A"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 px-3 py-2 text-xs border border-red-200 text-red-700 rounded-lg hover:bg-red-50"
                      onClick={() => {
                        if (window.confirm("Delete this patient?")) {
                          ownerAPI
                            .deletePatient(p._id || p.id)
                            .then(onRefresh)
                            .catch(() => {});
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" aria-hidden /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

  const statusBadge = (status) => {
    if (status === "resolved")
      return (
        <span className="inline-flex items-center gap-1 text-green-700">
          <CheckCircle2 className="w-4 h-4" /> Resolved
        </span>
      );
    if (status === "priority")
      return (
        <span className="inline-flex items-center gap-1 text-orange-700">
          <AlertTriangle className="w-4 h-4" /> Priority
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 text-gray-700">
        Pending
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Raise a Query</h3>
        <p className="text-gray-600">Submit issues or questions to Admin</p>
      </div>

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
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Short summary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message
          </label>
          <textarea
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe the issue or question"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Related Patient (optional)
          </label>
          <select
            value={formData.patientId}
            onChange={(e) =>
              setFormData({ ...formData, patientId: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">None</option>
            {patientOptions.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Submitting..." : "Submit Query"}
        </button>
      </form>

      <div className="pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">My Queries</h3>
          <button
            type="button"
            onClick={fetchMyQueries}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {listLoading ? (
          <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
            Loading queries...
          </div>
        ) : queries.length === 0 ? (
          <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
            No queries yet.
          </div>
        ) : (
          <div className="space-y-3">
            {queries.map((q) => (
              <div key={q._id || q.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-900">{q.title}</div>
                  {statusBadge(q.status)}
                </div>
                <p className="mt-2 text-gray-700 whitespace-pre-wrap">
                  {q.message}
                </p>
                {q.patientId?.name && (
                  <p className="mt-2 text-sm text-gray-600">
                    Patient: {q.patientId.name}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Created: {new Date(q.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CreatePatientSection({ onCreated }) {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "male",
    phone: "",
    address: "",
    medical_history: "",
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
      await ownerAPI.createPatient({
        name: formData.name,
        age: Number(formData.age),
        gender: formData.gender,
        phone: formData.phone,
        address: formData.address,
        medical_history: formData.medical_history,
      });
      setMessage("Patient created successfully");
      setFormData({
        name: "",
        age: "",
        gender: "male",
        phone: "",
        address: "",
        medical_history: "",
      });
      onCreated?.();
    } catch (err) {
      setError(err.message || "Failed to create patient");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Add New Patient</h3>
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
              Patient Name
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
              Age
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="45"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
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

          <div className="col-span-2">
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

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medical History
            </label>
            <textarea
              name="medical_history"
              value={formData.medical_history}
              onChange={handleChange}
              placeholder="Any relevant medical history..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              rows="4"
            />
          </div>
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Creating..." : "Add Patient"}
        </button>
      </form>
    </div>
  );
}

function TasksSection({ patients, tasks, loading, error, onRefresh }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    order: "0",
    scheduledTime: "",
    fromTemplate: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  
  // Edit modal state
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", scheduledTime: "" });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  
  // Drag reorder state
  const [draggedTask, setDraggedTask] = useState(null);
  const [draggedOverTask, setDraggedOverTask] = useState(null);
  const [localTasks, setLocalTasks] = useState([]);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    setLocalTasks([...tasks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
  }, [tasks]);

  const fetchTemplates = async () => {
    setTemplatesLoading(true);
    try {
      const data = await ownerAPI.getTaskTemplates();
      const list = Array.isArray(data?.data) ? data.data : [];
      setTemplates(list);
    } catch (err) {
      console.error("Failed to fetch templates:", err);
    } finally {
      setTemplatesLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If selecting a template, auto-fill fields
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    setMessage("");

    try {
      await ownerAPI.createTask({
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
        order: "0",
        scheduledTime: "",
        fromTemplate: "",
      });
      onRefresh?.();
    } catch (err) {
      setFormError(err.message || "Failed to create task");
    } finally {
      setSaving(false);
    }
  };

  // Edit task handlers
  const openEditModal = (task) => {
    setEditingTask(task);
    setEditForm({
      name: task.name,
      description: task.description || "",
      scheduledTime: task.scheduledTime || "",
    });
    setEditError("");
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    setEditError("");
    try {
      await ownerAPI.updateTask(editingTask._id || editingTask.id, {
        name: editForm.name,
        description: editForm.description,
        scheduledTime: editForm.scheduledTime || undefined,
      });
      setEditingTask(null);
      onRefresh?.();
    } catch (err) {
      setEditError(err.message || "Failed to update task");
    } finally {
      setEditSaving(false);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (task, e) => {
    e.dataTransfer.effectAllowed = "move";
    setDraggedTask(task);
  };

  const handleDragOver = (task, e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedTask && (draggedTask._id || draggedTask.id) !== (task._id || task.id)) {
      setDraggedOverTask(task);
    }
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDraggedOverTask(null);
  };

  const handleDrop = async (task, e) => {
    e.preventDefault();
    if (!draggedTask || (draggedTask._id || draggedTask.id) === (task._id || task.id)) {
      setDraggedTask(null);
      setDraggedOverTask(null);
      return;
    }

    const draggedId = draggedTask._id || draggedTask.id;
    const targetId = task._id || task.id;

    const draggedIndex = localTasks.findIndex(
      (t) => (t._id || t.id) === draggedId
    );
    const targetIndex = localTasks.findIndex((t) => (t._id || t.id) === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newTasks = [...localTasks];
    const [movedTask] = newTasks.splice(draggedIndex, 1);
    newTasks.splice(targetIndex, 0, movedTask);

    // Update order values
    const updatedTasks = newTasks.map((t, idx) => ({
      ...t,
      order: idx,
    }));

    setLocalTasks(updatedTasks);
    setDraggedTask(null);
    setDraggedOverTask(null);

    // Save reorder to backend
    setReordering(true);
    try {
      const reorderData = updatedTasks.map((t) => ({
        id: t._id || t.id,
        order: t.order,
      }));
      await ownerAPI.reorderTasks(reorderData);
      onRefresh?.();
    } catch (err) {
      console.error("Failed to reorder tasks:", err);
      setLocalTasks([...tasks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    } finally {
      setReordering(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Create New Task
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Create tasks from templates or custom. Optionally set a scheduled
          time.
        </p>
        {message && (
          <div className="p-3 rounded-md bg-green-50 text-green-700 text-sm">
            {message}
          </div>
        )}
        {formError && (
          <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">
            {formError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Template (Optional)
              </label>
              <select
                name="fromTemplate"
                value={formData.fromTemplate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={templatesLoading}
              >
                <option value="">-- Create Custom or Select Template --</option>
                {templates.map((tpl) => (
                  <option key={tpl._id || tpl.id} value={tpl._id || tpl.id}>
                    {tpl.name}{" "}
                    {tpl.scheduledTime ? `(${tpl.scheduledTime})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Morning Medicine, Blood Pressure Check"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Task details and instructions..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scheduled Time (Optional)
              </label>
              <input
                type="time"
                name="scheduledTime"
                value={formData.scheduledTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Expected completion time for nurses
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Order
              </label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={saving}
          >
            {saving ? "Creating..." : "Create Task"}
          </button>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Tasks</h3>
        <p className="text-sm text-gray-600 mb-4">
          Drag tasks to reorder them. Click edit to modify.
        </p>
        {error && (
          <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm mb-3">
            {error}
          </div>
        )}
        {loading ? (
          <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
            Loading tasks...
          </div>
        ) : localTasks.length === 0 ? (
          <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
            No tasks found.
          </div>
        ) : (
          <div className="space-y-2">
            {localTasks.map((t) => (
              <div
                key={t._id || t.id}
                draggable
                onDragStart={(e) => handleDragStart(t, e)}
                onDragOver={(e) => handleDragOver(t, e)}
                onDragEnd={handleDragEnd}
                onDrop={(e) => handleDrop(t, e)}
                onDragLeave={() => setDraggedOverTask(null)}
                className={`border rounded-lg p-4 flex items-start gap-4 cursor-move transition-all ${
                  draggedTask && (draggedTask._id || draggedTask.id) === (t._id || t.id)
                    ? "opacity-50 bg-gray-100"
                    : draggedOverTask && (draggedOverTask._id || draggedOverTask.id) === (t._id || t.id)
                    ? "bg-blue-50 border-2 border-blue-400"
                    : "hover:border-gray-400 border-gray-200"
                }`}
              >
                <GripVertical className="w-5 h-5 text-gray-400 mt-1 shrink-0" aria-hidden />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900">
                    {t.name}
                  </h4>
                  {t.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {t.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                    {t.scheduledTime && (
                      <span>⏰ {t.scheduledTime}</span>
                    )}
                    <span>Order: {t.order ?? 0}</span>
                    <span
                      className={`inline-flex px-2 py-1 rounded-full font-medium ${
                        t.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {t.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditModal(t)}
                    className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-blue-50 text-blue-600"
                  >
                    <Edit className="w-4 h-4" aria-hidden /> Edit
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-3 py-2 border border-red-200 rounded-lg text-sm hover:bg-red-50 text-red-600"
                    onClick={() => {
                      if (
                        window.confirm("Are you sure you want to delete this task?")
                      ) {
                        ownerAPI
                          .deleteTask(t._id || t.id)
                          .then(onRefresh)
                          .catch(() => {});
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden /> Delete
                  </button>
                </div>
              </div>
            ))}
            {reordering && (
              <div className="text-center text-sm text-gray-500 py-2">
                Saving order...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingTask && (
        <div className="fixed inset-0 backdrop-blur-lg bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Task</h3>
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" aria-hidden />
              </button>
            </div>

            {editError && (
              <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm mb-4">
                {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduled Time
                </label>
                <input
                  type="time"
                  name="scheduledTime"
                  value={editForm.scheduledTime}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  disabled={editSaving}
                >
                  {editSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
    <div className="space-y-4">
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
        <div className="overflow-x-auto">
          <table className="min-w-full border divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Date
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Patient
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Task
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Nurse
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Notes
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {entries.map((e) => (
                <tr key={e._id || e.id}>
                  <td className="px-4 py-2 text-sm text-gray-700">
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
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {e.patient?.name ||
                      (typeof e.patientId === "object" && e.patientId?.name) ||
                      e.patientName ||
                      "N/A"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {e.task?.name ||
                      (typeof e.ownerTaskId === "object" &&
                        e.ownerTaskId?.name) ||
                      e.task_name ||
                      e.taskName ||
                      "N/A"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {e.nurse?.name ||
                      (typeof e.nurseId === "object" && e.nurseId?.name) ||
                      e.nurseName ||
                      "N/A"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {e.note ?? e.notes ?? e.findings ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {e.isLate ? (
                      <span className="inline-flex items-center gap-1 text-orange-600">
                        <AlertTriangle className="w-4 h-4" aria-hidden /> Late
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="w-4 h-4" aria-hidden /> Done
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
