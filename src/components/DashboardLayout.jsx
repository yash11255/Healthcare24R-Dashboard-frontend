import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  User,
  Settings,
  HeartPulse,
  ShieldCheck,
  Hospital,
  Stethoscope,
  UserRound,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({ title, children, onLogout }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <ShieldCheck className="w-4 h-4" aria-hidden />;
      case 'owner':
        return <Hospital className="w-4 h-4" aria-hidden />;
      case 'nurse':
        return <Stethoscope className="w-4 h-4" aria-hidden />;
      default:
        return <UserRound className="w-4 h-4" aria-hidden />;
    }
  };

  const getRoleLabel = (role) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-blue-600 to-indigo-700 text-white transition-all duration-300 z-40 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-blue-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600">
              <HeartPulse className="w-6 h-6" aria-hidden />
            </div>
            {sidebarOpen && <span className="font-bold text-lg">H24R</span>}
          </div>
        </div>

        {/* User Info */}
        {sidebarOpen && (
          <div className="p-4 border-b border-blue-500">
            <p className="text-sm text-blue-100">Logged in as</p>
            <p className="font-semibold text-white mb-1">{user?.name}</p>
            <span className="inline-flex items-center gap-2 badge bg-blue-500 text-white text-xs">
              {getRoleIcon(user?.role)} {getRoleLabel(user?.role)}
            </span>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          <a href="#dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-500 transition-colors">
            <BarChart3 className="w-5 h-5" aria-hidden />
            {sidebarOpen && <span>Dashboard</span>}
          </a>
          <a href="#profile" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-500 transition-colors">
            <User className="w-5 h-5" aria-hidden />
            {sidebarOpen && <span>Profile</span>}
          </a>
          <a href="#settings" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-500 transition-colors">
            <Settings className="w-5 h-5" aria-hidden />
            {sidebarOpen && <span>Settings</span>}
          </a>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-medium transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" aria-hidden />
            {sidebarOpen && 'Logout'}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition-colors text-sm"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" aria-hidden /> : <ChevronRight className="w-4 h-4" aria-hidden />}
            {sidebarOpen && 'Collapse'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <div className="text-sm text-gray-600">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
