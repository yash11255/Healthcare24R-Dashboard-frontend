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
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({ title, children, onLogout }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 sm:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-linear-to-b from-blue-600 to-indigo-700 text-white transition-all duration-300 z-40 ${
          mobileMenuOpen ? 'w-64' : 'hidden'
        } sm:block ${sidebarOpen ? 'sm:w-64' : 'sm:w-20'} overflow-hidden`}
      >
        {/* Logo Section */}
        <div className="p-2 sm:p-4 border-b border-blue-500">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-white rounded-lg flex items-center justify-center text-blue-600 shrink-0">
              <HeartPulse className="w-5 sm:w-6 h-5 sm:h-6" aria-hidden />
            </div>
            {(mobileMenuOpen || sidebarOpen) && <span className="font-bold text-sm sm:text-lg">H24R</span>}
          </div>
        </div>

        {/* User Info */}
        {(mobileMenuOpen || sidebarOpen) && (
          <div className="p-2 sm:p-4 border-b border-blue-500">
            <p className="text-xs sm:text-sm text-blue-100">Logged in as</p>
            <p className="font-semibold text-white mb-1 text-xs sm:text-sm">{user?.name}</p>
            <span className="inline-flex items-center gap-1 sm:gap-2 badge bg-blue-500 text-white text-xs">
              {getRoleIcon(user?.role)} {getRoleLabel(user?.role)}
            </span>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-2 sm:p-4 space-y-1 sm:space-y-2">
          <a href="#dashboard" className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm hover:bg-blue-500 transition-colors">
            <BarChart3 className="w-4 sm:w-5 h-4 sm:h-5 shrink-0" aria-hidden />
            {(sidebarOpen || mobileMenuOpen) && <span>Dashboard</span>}
          </a>
          <a href="#profile" className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm hover:bg-blue-500 transition-colors">
            <User className="w-4 sm:w-5 h-4 sm:h-5 shrink-0" aria-hidden />
            {(sidebarOpen || mobileMenuOpen) && <span>Profile</span>}
          </a>
          <a href="#settings" className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm hover:bg-blue-500 transition-colors">
            <Settings className="w-4 sm:w-5 h-4 sm:h-5 shrink-0" aria-hidden />
            {(sidebarOpen || mobileMenuOpen) && <span>Settings</span>}
          </a>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 space-y-1 sm:space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-medium transition-colors text-xs sm:text-sm"
          >
            <LogOut className="w-4 h-4 shrink-0" aria-hidden />
            {(sidebarOpen || mobileMenuOpen) && 'Logout'}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden sm:flex w-full items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition-colors text-xs sm:text-sm"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4 shrink-0" aria-hidden /> : <ChevronRight className="w-4 h-4 shrink-0" aria-hidden />}
            {sidebarOpen && 'Collapse'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'sm:ml-64' : 'sm:ml-20'}`}>
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4">
            {/* Hamburger Menu for Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-700 shrink-0"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 shrink-0" aria-hidden />
              ) : (
                <Menu className="w-5 h-5 shrink-0" aria-hidden />
              )}
            </button>

            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{title}</h1>
            <div className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
