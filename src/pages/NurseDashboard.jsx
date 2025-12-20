import { useState, useEffect, useMemo } from 'react';
import { Hospital, ClipboardCheck, HandHeart, ArrowLeft, MessageSquare, RefreshCw, CheckCircle2, AlertTriangle, Clock, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { queryAPI, nurseAPI } from '../services/api';

export default function NurseDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('patients');

  return (
    <DashboardLayout title="Nurse Dashboard" onLogout={logout}>
      <div className="space-y-4 sm:space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <HandHeart className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600" aria-hidden />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome, {user?.name}!</h2>
          </div>
          <p className="text-sm sm:text-base text-gray-600">View assigned patients and complete tasks</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 sm:gap-2 border-b border-gray-200 overflow-x-auto">
          {['patients', 'my-tasks', 'queries'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2 sm:px-4 py-3 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'patients' && (
                <span className="inline-flex items-center gap-1 sm:gap-2">
                  <Hospital className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Patients</span>
                </span>
              )}
              {tab === 'my-tasks' && (
                <span className="inline-flex items-center gap-1 sm:gap-2">
                  <ClipboardCheck className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Tasks</span>
                </span>
              )}
              {tab === 'queries' && (
                <span className="inline-flex items-center gap-1 sm:gap-2">
                  <MessageSquare className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Queries</span>
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
          {activeTab === 'patients' && <PatientsSection />}
          {activeTab === 'my-tasks' && <MyTasksSection />}
          {activeTab === 'queries' && <QueriesSection />}
        </div>
      </div>
    </DashboardLayout>
  );
}

function PatientsSection() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetail, setPatientDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await nurseAPI.getPatients();
      const list = Array.isArray(data?.data) ? data.data : [];
      setPatients(list);
    } catch (err) {
      setError(err.message || 'Failed to load patients');
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
      console.error('Failed to load patient details:', err);
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
            <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">{detail.name}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Gender</p>
                <p className="text-sm sm:text-base font-semibold text-gray-900">{detail.gender || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Date of Birth</p>
                <p className="text-sm sm:text-base font-semibold text-gray-900">
                  {detail.dob ? new Date(detail.dob).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="col-span-1 sm:col-span-2">
                <p className="text-xs sm:text-sm text-gray-600">Address</p>
                <p className="text-sm sm:text-base font-semibold text-gray-900">{detail.address || 'N/A'}</p>
              </div>
              <div className="col-span-1 sm:col-span-2">
                <p className="text-xs sm:text-sm text-gray-600">Timezone</p>
                <p className="text-sm sm:text-base font-semibold text-gray-900">{detail.patientTimezone || 'UTC'}</p>
              </div>
            </div>
          </div>

          {/* Owner Info Card */}
          {detail.owner && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
              <h5 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Patient Owner</h5>
              <div className="space-y-3">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Name</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-900">{detail.owner.name}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Email</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-900 break-all">{detail.owner.email}</p>
                </div>
                {detail.owner.phone && (
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Phone</p>
                    <p className="text-sm sm:text-base font-semibold text-gray-900">{detail.owner.phone}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Assignment Info */}
          {selectedPatient.assignedSince && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
              <h5 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Assignment Details</h5>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Assigned Since</p>
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
    <div className="space-y-4">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900">My Assigned Patients</h3>
      <p className="text-xs sm:text-sm text-gray-600">Click on a patient to view details</p>

      {error && <div className="p-3 rounded-md bg-red-50 text-red-700 text-xs sm:text-sm">{error}</div>}

      {loading ? (
        <div className="bg-gray-50 p-4 rounded-lg text-center text-xs sm:text-sm text-gray-500">Loading patients...</div>
      ) : patients.length === 0 ? (
        <div className="bg-gray-50 p-4 rounded-lg text-center text-xs sm:text-sm text-gray-500">No patients assigned yet.</div>
      ) : (
        <div className="grid gap-2 sm:gap-3">
          {patients.map((patient) => (
            <div
              key={patient.id || patient._id}
              className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer hover:border-blue-400"
              onClick={() => handleSelectPatient(patient)}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm sm:text-base text-gray-900 truncate">{patient.name}</div>
                  {patient.owner && (
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">Owner: {patient.owner.name}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Timezone: {patient.patientTimezone || 'UTC'}
                  </p>
                </div>
                <Hospital className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600 shrink-0" aria-hidden />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MyTasksSection() {
  const [view, setView] = useState('submit'); // 'submit' or 'history'
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [formData, setFormData] = useState({ note: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // History view state
  const [myTasks, setMyTasks] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (view === 'submit') {
      fetchPatients();
    } else {
      fetchMyTasks();
    }
  }, [view]);

  const fetchPatients = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await nurseAPI.getPatients();
      const list = Array.isArray(data?.data) ? data.data : [];
      setPatients(list);
    } catch (err) {
      setError(err.message || 'Failed to load patients');
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
      console.error('Failed to load tasks:', err);
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
      console.error('Failed to load task history:', err);
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
    setFormData({ note: '' });
    setSubmitMessage('');
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
    setSubmitMessage('');
    try {
      const payload = {
        ownerTaskId: selectedTask._id || selectedTask.id,
        note: formData.note,
      };
      const result = await nurseAPI.submitTask(selectedPatient.id || selectedPatient._id, payload);
      setSubmitMessage(result.message || 'Task submitted successfully!');
      setFormData({ note: '' });
      setTimeout(() => {
        setSelectedTask(null);
        setSelectedPatient(null);
      }, 2000);
    } catch (err) {
      setSubmitMessage(err.message || 'Failed to submit task');
    } finally {
      setSubmitting(false);
    }
  };

  // History view helpers
  const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  // Helper: format local date as YYYY-MM-DD (no UTC shift)
  const formatDateKey = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
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
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    setSelectedDate(null);
  };

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Submit Task View
  if (selectedTask && view === 'submit') {
    const late = isTaskLate(selectedTask.scheduledTime);
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedTask(null)}
          className="mb-4 inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden /> Back to Tasks
        </button>

        <div className="card border-2 border-blue-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-6">Submit Task Completion</h4>

          {submitMessage && (
            <div className={`p-3 rounded-md mb-4 text-sm ${submitMessage.includes('Failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {submitMessage}
            </div>
          )}

          <form onSubmit={handleSubmitTask} className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm font-semibold text-gray-900">{selectedTask.name}</p>
              {selectedTask.description && (
                <p className="text-sm text-gray-700 mt-1">{selectedTask.description}</p>
              )}
              {selectedTask.scheduledTime && (
                <div className={`mt-2 inline-flex items-center gap-1 text-sm ${late ? 'text-orange-700' : 'text-gray-700'}`}>
                  <Clock className="w-4 h-4" />
                  <span>Expected: {selectedTask.scheduledTime}</span>
                  {late && <span className="ml-2 font-semibold">(LATE)</span>}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Notes / Findings
              </label>
              <textarea
                name="note"
                value={formData.note}
                onChange={(e) => setFormData({ note: e.target.value })}
                placeholder="Document your observations and findings..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                rows="6"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
              <p><strong>Patient:</strong> {selectedPatient?.name}</p>
              <p><strong>Current Time:</strong> {new Date().toLocaleString()}</p>
              {late && (
                <p className="text-orange-700 font-semibold mt-2">
                  ⚠️ This task is being submitted after the scheduled time
                </p>
              )}
            </div>

            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Completion'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (selectedPatient && view === 'submit') {
    return (
      <div className="space-y-4">
        <button
          onClick={() => {
            setSelectedPatient(null);
            setTasks([]);
          }}
          className="mb-4 inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden /> Back to Patients
        </button>

        <h3 className="text-lg font-semibold text-gray-900">
          Tasks for {selectedPatient.name}
        </h3>

        {tasksLoading ? (
          <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">No tasks available.</div>
        ) : (
          <div className="grid gap-3">
            {tasks.map((task) => {
              const late = isTaskLate(task.scheduledTime);
              return (
                <div
                  key={task._id || task.id}
                  className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${late ? 'border-orange-300 bg-orange-50' : 'border-gray-200'}`}
                  onClick={() => handleSelectTask(task)}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-gray-900">{task.name}</div>
                    {task.scheduledTime && (
                      <div className={`inline-flex items-center gap-1 text-sm ${late ? 'text-orange-700 font-semibold' : 'text-gray-600'}`}>
                        <Clock className="w-4 h-4" />
                        {task.scheduledTime}
                      </div>
                    )}
                  </div>
                  {task.description && (
                    <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                  )}
                  {late && (
                    <p className="text-orange-700 text-xs mt-2 font-semibold">⚠️ Past scheduled time</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // View selector for submit vs history
  if (view === 'submit') {
    return (
      <div className="space-y-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setView('submit')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
          >
            Submit Tasks
          </button>
          <button
            onClick={() => setView('history')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
          >
            Task History
          </button>
        </div>

        <h3 className="text-lg font-semibold text-gray-900">My Assigned Patients</h3>
        <p className="text-gray-600">Select a patient to view and complete tasks</p>

        {error && <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">{error}</div>}

        {loading ? (
          <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">Loading patients...</div>
        ) : patients.length === 0 ? (
          <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">No patients assigned yet.</div>
        ) : (
          <div className="grid gap-3">
            {patients.map((patient) => (
              <div
                key={patient.id || patient._id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleSelectPatient(patient)}
              >
                <div className="font-semibold text-gray-900">{patient.name}</div>
                {patient.owner && (
                  <p className="text-sm text-gray-600 mt-1">Owner: {patient.owner.name}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // History View
  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setView('submit')}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
        >
          Submit Tasks
        </button>
        <button
          onClick={() => setView('history')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
        >
          Task History
        </button>
      </div>

      <h3 className="text-lg font-semibold text-gray-900">Submitted Tasks</h3>
      <p className="text-gray-600">View your submitted tasks calendar</p>

      {historyLoading ? (
        <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">Loading task history...</div>
      ) : (
        <div className="space-y-4">
          {/* Calendar View */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mx-auto md:max-w-lg lg:max-w-xl">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-semibold text-gray-900">{monthName}</h4>
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

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
                  {day}
                </div>
              ))}

              {Array.from({ length: firstDayOfMonth(currentMonth) }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square"></div>
              ))}

              {Array.from({ length: daysInMonth(currentMonth) }).map((_, i) => {
                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1);
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
                        ? 'border-blue-500 bg-blue-50'
                        : hasEntries
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
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

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Submitted</p>
              <p className="text-2xl font-bold text-gray-900">{myTasks.length}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">On Time</p>
              <p className="text-2xl font-bold text-green-600">{myTasks.filter(t => !t.isLate).length}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">Late</p>
              <p className="text-2xl font-bold text-orange-600">{myTasks.filter(t => t.isLate).length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal for date entries */}
      {showModal && selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h5 className="font-semibold text-gray-900">
                {new Date(selectedDate).toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
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
              {entriesByDate[selectedDate] && entriesByDate[selectedDate].length > 0 ? (
                entriesByDate[selectedDate].map((entry) => (
                  <div key={entry.id || entry._id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{entry.task?.name}</p>
                        <p className="text-sm text-gray-600 mt-1">Patient: {entry.patient?.name}</p>
                      </div>
                      {entry.isLate ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                          <Clock className="w-3 h-3" />
                          Late
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <CheckCircle2 className="w-3 h-3" />
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
                      Submitted: {new Date(entry.submittedAt).toLocaleTimeString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No tasks submitted on this date</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QueriesSection() {
  const [formData, setFormData] = useState({ title: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [error, setError] = useState('');
  const [queries, setQueries] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  const fetchMyQueries = async () => {
    setListLoading(true);
    setError('');
    try {
      const data = await queryAPI.myQueries();
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setQueries(list);
    } catch (err) {
      setError(err.message || 'Failed to load queries');
      setQueries([]);
    } finally {
      setListLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessageText('');
    try {
      await queryAPI.create({ title: formData.title, message: formData.message });
      setMessageText('Query submitted successfully');
      setFormData({ title: '', message: '' });
      fetchMyQueries();
    } catch (err) {
      setError(err.message || 'Failed to submit query');
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status) => {
    if (status === 'resolved') return (
      <span className="inline-flex items-center gap-1 text-green-700"><CheckCircle2 className="w-4 h-4"/> Resolved</span>
    );
    if (status === 'priority') return (
      <span className="inline-flex items-center gap-1 text-orange-700"><AlertTriangle className="w-4 h-4"/> Priority</span>
    );
    return <span className="inline-flex items-center gap-1 text-gray-700">Pending</span>;
  };

  useEffect(() => { fetchMyQueries(); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Raise a Query</h3>
        <p className="text-gray-600">Submit issues or questions to Admin</p>
      </div>

      {messageText && <div className="p-3 rounded-md bg-green-50 text-green-700 text-sm">{messageText}</div>}
      {error && <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Short summary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe the issue or question"
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Query'}
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
            <RefreshCw className="w-4 h-4"/> Refresh
          </button>
        </div>

        {listLoading ? (
          <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">Loading queries...</div>
        ) : queries.length === 0 ? (
          <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">No queries yet.</div>
        ) : (
          <div className="space-y-3">
            {queries.map((q) => (
              <div key={q._id || q.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-900">{q.title}</div>
                  {statusBadge(q.status)}
                </div>
                <p className="mt-2 text-gray-700 whitespace-pre-wrap">{q.message}</p>
                <p className="mt-2 text-xs text-gray-500">Created: {new Date(q.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
