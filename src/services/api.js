// API Service for Healthcare24R Dashboard
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper to make requests with token
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
};

// Authentication APIs
export const authAPI = {
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  getProfile: () => request('/auth/me'),
  
  updateProfile: (updates) =>
    request('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  
  changePassword: (currentPassword, newPassword) =>
    request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// Admin APIs
export const adminAPI = {
  createOwner: (ownerData) =>
    request('/admin/create-owner', {
      method: 'POST',
      body: JSON.stringify(ownerData),
    }),
  
  createNurse: (nurseData) =>
    request('/admin/create-nurse', {
      method: 'POST',
      body: JSON.stringify(nurseData),
    }),
  
  assignNurse: (patientId, nurseId) =>
    request('/admin/assign-nurse', {
      method: 'POST',
      body: JSON.stringify({ patientId, nurseId }),
    }),
  
  getAssignments: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.active !== undefined) params.append('active', filters.active);
    if (filters.nurseId) params.append('nurseId', filters.nurseId);
    if (filters.patientId) params.append('patientId', filters.patientId);
    
    return request(`/admin/assignments?${params}`);
  },
  
  getUsers: (role) =>
    request(`/admin/users${role ? `?role=${role}` : ''}`),
};

// Owner APIs
export const ownerAPI = {
  // Patient APIs
  createPatient: (patientData) =>
    request('/owner/patients', {
      method: 'POST',
      body: JSON.stringify(patientData),
    }),
  
  getPatients: (active = true) =>
    request(`/owner/patients?active=${active}`),
  
  getPatient: (id) => request(`/owner/patients/${id}`),
  
  updatePatient: (id, updates) =>
    request(`/owner/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  
  deletePatient: (id) =>
    request(`/owner/patients/${id}`, { method: 'DELETE' }),
  
  // Task APIs
  createTask: (taskData) =>
    request('/owner/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    }),
  
  getTasks: (active = true) =>
    request(`/owner/tasks?active=${active}`),
  
  getTask: (id) => request(`/owner/tasks/${id}`),
  
  updateTask: (id, updates) =>
    request(`/owner/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  
  deleteTask: (id) =>
    request(`/owner/tasks/${id}`, { method: 'DELETE' }),
  
  // Task Entry APIs
  getTaskEntries: (patientId) =>
    request(`/owner/patients/${patientId}/tasks`),
  
  getAllTaskEntries: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.taskId) params.append('taskId', filters.taskId);
    if (filters.limit) params.append('limit', filters.limit);
    
    return request(`/owner/tasks/entries?${params}`);
  },
};

// Nurse APIs
export const nurseAPI = {
  getPatients: () => request('/nurse/patients'),
  
  getPatient: (id) => request(`/nurse/patients/${id}`),
  
  getPatientTasks: (patientId) =>
    request(`/nurse/patients/${patientId}/tasks`),
  
  submitTask: (patientId, taskData) =>
    request(`/nurse/patients/${patientId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    }),
  
  getMyTasks: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.patientId) params.append('patientId', filters.patientId);
    if (filters.limit) params.append('limit', filters.limit);
    
    return request(`/nurse/my-tasks?${params}`);
  },
};
