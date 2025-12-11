import { useState } from 'react';
import { Hospital, ClipboardCheck, HandHeart, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

export default function NurseDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('patients');

  return (
    <DashboardLayout title="Nurse Dashboard" onLogout={logout}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <HandHeart className="w-6 h-6 text-blue-600" aria-hidden />
            <h2 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}!</h2>
          </div>
          <p className="text-gray-600">View assigned patients and complete tasks</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-gray-200">
          {['patients', 'my-tasks'].map((tab) => (
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
                  <Hospital className="w-4 h-4" aria-hidden /> My Patients
                </span>
              )}
              {tab === 'my-tasks' && (
                <span className="inline-flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4" aria-hidden /> My Tasks
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          {activeTab === 'patients' && <PatientsSection />}
          {activeTab === 'my-tasks' && <MyTasksSection />}
        </div>
      </div>
    </DashboardLayout>
  );
}

function PatientsSection() {
  const [selectedPatient, setSelectedPatient] = useState(null);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">My Assigned Patients</h3>
      <p className="text-gray-600">View patients assigned to you</p>

      {!selectedPatient ? (
        <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
          No patients assigned yet.
        </div>
      ) : (
        <div>
          <button
            onClick={() => setSelectedPatient(null)}
            className="mb-4 inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden /> Back to List
          </button>
          <div className="card border-2 border-blue-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Patient Details</h4>
            <p className="text-gray-600">Patient information will be displayed here</p>
          </div>
        </div>
      )}
    </div>
  );
}

function MyTasksSection() {
  const [selectedTask, setSelectedTask] = useState(null);
  const [formData, setFormData] = useState({
    notes: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitTask = (e) => {
    e.preventDefault();
    console.log('Submit task:', formData);
    setSelectedTask(null);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">My Tasks</h3>

      {!selectedTask ? (
        <>
          <p className="text-gray-600">View and complete your assigned tasks</p>
          <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
            No tasks assigned yet.
          </div>
        </>
      ) : (
        <>
          <button
            onClick={() => setSelectedTask(null)}
            className="mb-4 inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden /> Back to List
          </button>

          <div className="card border-2 border-blue-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-6">Submit Task Completion</h4>

            <form onSubmit={handleSubmitTask} className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-700">
                  Task details will appear here when selected.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Notes / Findings
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Document your observations and findings..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  rows="6"
                  required
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
                <p>
                  <strong>Timestamp:</strong> {new Date().toLocaleString()}
                </p>
                <p>
                  <strong>Timezone:</strong> UTC
                </p>
              </div>

              <button type="submit" className="btn-primary w-full">
                Submit Completion
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
