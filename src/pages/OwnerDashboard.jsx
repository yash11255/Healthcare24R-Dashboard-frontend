import { useEffect, useMemo, useState } from 'react';
import { Hospital, UserPlus, ClipboardList, NotebookPen, HandHeart, RefreshCw, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { ownerAPI } from '../services/api';

export default function OwnerDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('patients');

  // Patients
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientsError, setPatientsError] = useState('');

  // Tasks
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState('');

  // Entries
  const [entries, setEntries] = useState([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [entriesError, setEntriesError] = useState('');

  const patientOptions = useMemo(
    () => patients.map((p) => ({ value: p._id || p.id, label: p.name })),
    [patients]
  );

  const fetchPatients = async () => {
    setPatientsLoading(true);
    setPatientsError('');
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
      setPatientsError(err.message || 'Failed to load patients');
      setPatients([]);
    } finally {
      setPatientsLoading(false);
    }
  };

  const fetchTasks = async () => {
    setTasksLoading(true);
    setTasksError('');
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
      setTasksError(err.message || 'Failed to load tasks');
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  };

  const fetchEntries = async () => {
    setEntriesLoading(true);
    setEntriesError('');
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
      setEntriesError(err.message || 'Failed to load task entries');
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
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <HandHeart className="w-6 h-6 text-blue-600" aria-hidden />
            <h2 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}!</h2>
          </div>
          <p className="text-gray-600">Manage patients, create tasks, and track entries</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-gray-200">
          {['patients', 'create-patient', 'tasks', 'entries'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'patients' && (
                <span className="inline-flex items-center gap-2">
                  <Hospital className="w-4 h-4" aria-hidden /> Patients
                </span>
              )}
              {tab === 'create-patient' && (
                <span className="inline-flex items-center gap-2">
                  <UserPlus className="w-4 h-4" aria-hidden /> Add Patient
                </span>
              )}
              {tab === 'tasks' && (
                <span className="inline-flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" aria-hidden /> Tasks
                </span>
              )}
              {tab === 'entries' && (
                <span className="inline-flex items-center gap-2">
                  <NotebookPen className="w-4 h-4" aria-hidden /> Entries
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          {activeTab === 'patients' && (
            <PatientsSection
              patients={patients}
              loading={patientsLoading}
              error={patientsError}
              onRefresh={fetchPatients}
            />
          )}
          {activeTab === 'create-patient' && (
            <CreatePatientSection
              onCreated={() => {
                fetchPatients();
              }}
            />
          )}
          {activeTab === 'tasks' && (
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
          {activeTab === 'entries' && (
            <EntriesSection
              entries={entries}
              loading={entriesLoading}
              error={entriesError}
              onRefresh={fetchEntries}
            />
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

      {error && <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">{error}</div>}

      {loading ? (
        <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">Loading patients...</div>
      ) : patients.length === 0 ? (
        <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">No patients found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Phone</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Gender</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {patients.map((p) => (
                <tr key={p._id || p.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">{p.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{p.phone || 'N/A'}</td>
                  <td className="px-4 py-2 text-sm text-gray-700 capitalize">{p.gender || 'N/A'}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 px-3 py-2 text-xs border border-red-200 text-red-700 rounded-lg hover:bg-red-50"
                      onClick={() => {
                        if (window.confirm('Delete this patient?')) {
                          ownerAPI.deletePatient(p._id || p.id).then(onRefresh).catch(() => {});
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

function CreatePatientSection({ onCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    phone: '',
    address: '',
    medical_history: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await ownerAPI.createPatient({
        name: formData.name,
        age: Number(formData.age),
        gender: formData.gender,
        phone: formData.phone,
        address: formData.address,
        medical_history: formData.medical_history,
      });
      setMessage('Patient created successfully');
      setFormData({ name: '', age: '', gender: 'male', phone: '', address: '', medical_history: '' });
      onCreated?.();
    } catch (err) {
      setError(err.message || 'Failed to create patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Add New Patient</h3>
      {message && <div className="p-3 rounded-md bg-green-50 text-green-700 text-sm">{message}</div>}
      {error && <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Medical History</label>
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
          {loading ? 'Creating...' : 'Add Patient'}
        </button>
      </form>
    </div>
  );
}

function TasksSection({ patients, tasks, loading, error, onRefresh }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    order: '0',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    setMessage('');

    try {
      await ownerAPI.createTask({
        name: formData.name,
        description: formData.description,
        order: Number(formData.order) || 0,
      });
      setMessage('Task template created successfully');
      setFormData({ name: '', description: '', order: '0' });
      onRefresh?.();
    } catch (err) {
      setFormError(err.message || 'Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Task Template</h3>
        <p className="text-sm text-gray-600 mb-4">Create reusable task templates that nurses can use when logging patient care activities.</p>
        {message && <div className="p-3 rounded-md bg-green-50 text-green-700 text-sm">{message}</div>}
        {formError && <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">{formError}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Task Name</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={saving}>
            {saving ? 'Creating...' : 'Create Task Template'}
          </button>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Templates</h3>
        {error && <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm mb-3">{error}</div>}
        {loading ? (
          <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">No tasks found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Task Name</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Description</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Order</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tasks.map((t) => (
                  <tr key={t._id || t.id}>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{t.name || 'N/A'}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{t.description || '—'}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{t.order ?? 0}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${t.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {t.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function EntriesSection({ entries, loading, error, onRefresh }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Task Entries</h3>
          <p className="text-gray-600">View all task submissions and nurse entries</p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" aria-hidden /> Refresh
        </button>
      </div>

      {error && <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">{error}</div>}

      {loading ? (
        <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">Loading entries...</div>
      ) : entries.length === 0 ? (
        <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">No entries found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Patient</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Task</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Nurse</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Notes</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Timestamp</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {entries.map((e) => (
                <tr key={e._id || e.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {e.patient?.name
                      || (typeof e.patientId === 'object' && e.patientId?.name)
                      || e.patientName
                      || 'N/A'}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {e.task?.name
                      || (typeof e.ownerTaskId === 'object' && e.ownerTaskId?.name)
                      || e.task_name
                      || e.taskName
                      || 'N/A'}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {e.nurse?.name
                      || (typeof e.nurseId === 'object' && e.nurseId?.name)
                      || e.nurseName
                      || 'N/A'}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">{e.note ?? e.notes ?? e.findings ?? '—'}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {e.ownerLocalTime || e.nurseLocalTime || e.timestampUTC || e.timestamp
                      ? new Date(e.ownerLocalTime || e.nurseLocalTime || e.timestampUTC || e.timestamp).toLocaleString()
                      : 'N/A'}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {e.completed === false ? (
                      <span className="inline-flex items-center gap-1 text-red-600">
                        <AlertTriangle className="w-4 h-4" aria-hidden /> Pending
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
    </div>
  );
}
