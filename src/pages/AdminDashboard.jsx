import { useEffect, useState } from 'react';
import { Users, Building2, Stethoscope, ClipboardList, HandHeart, RefreshCw, Activity, CheckCircle2, AlertTriangle, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { adminAPI, queryAPI } from '../services/api';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [usersRoleFilter, setUsersRoleFilter] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');

  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [assignmentsError, setAssignmentsError] = useState('');

  const [queries, setQueries] = useState([]);
  const [queriesLoading, setQueriesLoading] = useState(false);
  const [queriesError, setQueriesError] = useState('');
  const [queryFilters, setQueryFilters] = useState({ status: '', category: '' });

  const fetchUsers = async (role = '') => {
    setUsersLoading(true);
    setUsersError('');
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
      setUsersError(err.message || 'Failed to load users');
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchAssignments = async () => {
    setAssignmentsLoading(true);
    setAssignmentsError('');
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
      setAssignmentsError(err.message || 'Failed to load assignments');
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
    setQueriesError('');
    try {
      const data = await queryAPI.adminList(queryFilters);
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setQueries(list);
    } catch (err) {
      setQueriesError(err.message || 'Failed to load queries');
      setQueries([]);
    } finally {
      setQueriesLoading(false);
    }
  };

  return (
    <DashboardLayout title="Admin Dashboard" onLogout={logout}>
      <div className="space-y-4 sm:space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <HandHeart className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600 shrink-0" aria-hidden />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome, {user?.name}!</h2>
          </div>
          <p className="text-sm sm:text-base text-gray-600">Manage users, owners, nurses, and assignments</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 sm:gap-2 border-b border-gray-200 overflow-x-auto">
          {['users', 'create-owner', 'create-nurse', 'assignments', 'queries'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2 sm:px-4 py-3 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'users' && (
                <span className="inline-flex items-center gap-1 sm:gap-2">
                  <Users className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Users</span>
                </span>
              )}
              {tab === 'create-owner' && (
                <span className="inline-flex items-center gap-1 sm:gap-2">
                  <Building2 className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Owner</span>
                </span>
              )}
              {tab === 'create-nurse' && (
                <span className="inline-flex items-center gap-1 sm:gap-2">
                  <Stethoscope className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Nurse</span>
                </span>
              )}
              {tab === 'assignments' && (
                <span className="inline-flex items-center gap-1 sm:gap-2">
                  <ClipboardList className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Assign</span>
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
          {activeTab === 'users' && (
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
          {activeTab === 'create-owner' && (
            <CreateOwnerSection
              onCreated={() => {
                fetchUsers(usersRoleFilter);
              }}
            />
          )}
          {activeTab === 'create-nurse' && (
            <CreateNurseSection
              onCreated={() => {
                fetchUsers(usersRoleFilter);
              }}
            />
          )}
          {activeTab === 'assignments' && (
            <AssignmentsSection
              assignments={assignments}
              loading={assignmentsLoading}
              error={assignmentsError}
              onRefresh={fetchAssignments}
              onAssignSuccess={fetchAssignments}
            />
          )}
          {activeTab === 'queries' && (
            <QueriesAdminSection
              queries={queries}
              loading={queriesLoading}
              error={queriesError}
              filters={queryFilters}
              onFiltersChange={(f) => {
                setQueryFilters(f);
                fetchQueries();
              }}
              onRefresh={fetchQueries}
              onUpdateStatus={async (id, status) => {
                await queryAPI.adminUpdateStatus(id, status);
                fetchQueries();
              }}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function QueriesAdminSection({ queries, loading, error, filters, onFiltersChange, onRefresh, onUpdateStatus }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">All Queries</h3>
          <p className="text-xs sm:text-sm text-gray-600">Filter, review, and update statuses</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <select
            value={filters.status}
            onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="priority">Priority</option>
            <option value="resolved">Resolved</option>
          </select>
          <select
            value={filters.category}
            onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
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
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">Loading queries...</div>
      ) : queries.length === 0 ? (
        <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">No queries found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Title</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">From</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Category</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {queries.map((q) => (
                <tr key={q._id || q.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    <div className="font-medium">{q.title}</div>
                    <div className="text-gray-600 mt-1 text-xs whitespace-pre-wrap">{q.message}</div>
                    {q.patientId?.name && (
                      <div className="text-xs text-gray-500 mt-1">Patient: {q.patientId.name}</div>
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {q.createdBy?.name} <span className="text-gray-500">({q.createdBy?.role})</span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700 capitalize">{q.category}</td>
                  <td className="px-4 py-2 text-sm text-gray-700 capitalize">{q.status}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <select
                        value={q.status}
                        onChange={(e) => onUpdateStatus(q._id || q.id, e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded-md text-sm"
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
      )}
    </div>
  );
}

function UsersSection({ users, loading, error, roleFilter, onRoleFilterChange, onRefresh }) {
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
        <div className="overflow-x-auto">
          <table className="min-w-full border divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Role</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u._id || u.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">{u.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{u.email}</td>
                  <td className="px-4 py-2 text-sm text-gray-700 capitalize">{u.role}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {u.isActive === false ? (
                      <span className="inline-flex items-center gap-1 text-red-600">
                        <AlertTriangle className="w-4 h-4" aria-hidden /> Inactive
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="w-4 h-4" aria-hidden /> Active
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

function CreateOwnerSection({ onCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    timezone: 'UTC',
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
      await adminAPI.createOwner(formData);
      setMessage('Owner created successfully');
      setFormData({ name: '', email: '', password: '', timezone: 'UTC' });
      onCreated?.();
    } catch (err) {
      setError(err.message || 'Failed to create owner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Create New Owner</h3>
      {message && <div className="p-3 rounded-md bg-green-50 text-green-700 text-sm">{message}</div>}
      {error && <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
          <select name="timezone" value={formData.timezone} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
            <option>UTC</option>
            <option>Asia/Kolkata</option>
            <option>America/New_York</option>
          </select>
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Creating...' : 'Create Owner'}
        </button>
      </form>
    </div>
  );
}

function CreateNurseSection({ onCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    aadhaarNumber: '',
    bankAccountNumber: '',
    bankIFSC: '',
    bankName: '',
    timezone: 'UTC',
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
      await adminAPI.createNurse(formData);
      setMessage('Nurse created successfully');
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        aadhaarNumber: '',
        bankAccountNumber: '',
        bankIFSC: '',
        bankName: '',
        timezone: 'UTC',
      });
      onCreated?.();
    } catch (err) {
      setError(err.message || 'Failed to create nurse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Create New Nurse</h3>
      {message && <div className="p-3 rounded-md bg-green-50 text-green-700 text-sm">{message}</div>}
      {error && <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
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

          <div>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Number (12 digits)</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account Number</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Bank IFSC Code</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select name="timezone" value={formData.timezone} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
              <option>UTC</option>
              <option>Asia/Kolkata</option>
              <option>America/New_York</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Creating...' : 'Create Nurse'}
        </button>
      </form>
    </div>
  );
}

function AssignmentsSection({ assignments, loading, error, onRefresh, onAssignSuccess }) {
  const [assignForm, setAssignForm] = useState({ nurseId: '', patientId: '' });
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignMessage, setAssignMessage] = useState('');
  const [assignError, setAssignError] = useState('');

  const handleAssign = async (e) => {
    e.preventDefault();
    setAssignLoading(true);
    setAssignError('');
    setAssignMessage('');

    try {
      await adminAPI.assignNurse(assignForm.patientId, assignForm.nurseId);
      setAssignMessage('Assignment created successfully');
      setAssignForm({ nurseId: '', patientId: '' });
      onAssignSuccess?.();
    } catch (err) {
      setAssignError(err.message || 'Failed to create assignment');
    } finally {
      setAssignLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Assignments</h3>
          <p className="text-gray-600">View and manage nurse to patient assignments</p>
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
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Create Assignment</h4>
        {assignMessage && <div className="p-3 rounded-md bg-green-50 text-green-700 text-sm mb-3">{assignMessage}</div>}
        {assignError && <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm mb-3">{assignError}</div>}
        <form onSubmit={handleAssign} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Nurse ID"
            value={assignForm.nurseId}
            onChange={(e) => setAssignForm({ ...assignForm, nurseId: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            required
          />
          <input
            type="text"
            placeholder="Patient ID"
            value={assignForm.patientId}
            onChange={(e) => setAssignForm({ ...assignForm, patientId: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            required
          />
          <button type="submit" className="btn-primary" disabled={assignLoading}>
            {assignLoading ? 'Assigning...' : 'Assign Nurse'}
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">Use nurse and patient IDs from the Users / Patients lists.</p>
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
        <div className="overflow-x-auto">
          <table className="min-w-full border divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Nurse</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Patient</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Assigned By</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {assignments.map((a) => (
                <tr key={a._id || a.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    <div>{typeof a.nurseId === 'object' && a.nurseId ? a.nurseId.name || 'N/A' : 'N/A'}</div>
                    <div className="text-xs text-gray-500">
                      {typeof a.nurseId === 'object' && a.nurseId ? a.nurseId._id : String(a.nurseId || 'N/A')}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    <div>{typeof a.patientId === 'object' && a.patientId ? a.patientId.name || 'N/A' : 'N/A'}</div>
                    <div className="text-xs text-gray-500">
                      {typeof a.patientId === 'object' && a.patientId ? a.patientId._id : String(a.patientId || 'N/A')}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    <div>{typeof a.assignedByAdmin === 'object' && a.assignedByAdmin ? a.assignedByAdmin.name || 'N/A' : 'N/A'}</div>
                    <div className="text-xs text-gray-500">
                      {typeof a.assignedByAdmin === 'object' && a.assignedByAdmin ? a.assignedByAdmin._id : String(a.assignedByAdmin || 'N/A')}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {a.active === false ? (
                      <span className="inline-flex items-center gap-1 text-red-600">
                        <Activity className="w-4 h-4 rotate-45" aria-hidden /> Inactive
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="w-4 h-4" aria-hidden /> Active
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
