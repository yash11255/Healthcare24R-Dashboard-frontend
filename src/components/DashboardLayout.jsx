import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  User,
  Settings,
  ShieldCheck,
  Hospital,
  Stethoscope,
  UserRound,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bell,
  Search,
  Users,
  FileText,
  ClipboardList,
  MessageSquare,
  UserPlus,
  HandHeart,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout({ title, children, onLogout, activeTab, onTabChange }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Listen for hash changes
  const handleTabClick = (tabId) => {
    window.location.hash = tabId;
    onTabChange?.(tabId);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin": return <ShieldCheck className="w-4 h-4" />;
      case "owner": return <Hospital className="w-4 h-4" />;
      case "nurse": return <Stethoscope className="w-4 h-4" />;
      default: return <UserRound className="w-4 h-4" />;
    }
  };

  const getNavigation = () => {
    switch (user?.role) {
      case "admin":
        return [
          { id: 'users', label: "Users", icon: <Users className="w-5 h-5" /> },
          { id: 'create-owner', label: "Add Owner", icon: <UserPlus className="w-5 h-5" /> },
          { id: 'create-nurse', label: "Add Nurse", icon: <Stethoscope className="w-5 h-5" /> },
          { id: 'assignments', label: "Assignments", icon: <FileText className="w-5 h-5" /> },
          { id: 'tasks', label: "Manage Tasks", icon: <ClipboardList className="w-5 h-5" /> },
          { id: 'queries', label: "Queries", icon: <MessageSquare className="w-5 h-5" /> },
        ];
      case "owner":
        return [
          { id: 'patients', label: "Patients", icon: <Hospital className="w-5 h-5" /> },
          { id: 'create-patient', label: "Add Patient", icon: <UserPlus className="w-5 h-5" /> },
          { id: 'tasks', label: "Tasks", icon: <ClipboardList className="w-5 h-5" /> },
          { id: 'entries', label: "Entries", icon: <FileText className="w-5 h-5" /> },
          { id: 'queries', label: "Queries", icon: <MessageSquare className="w-5 h-5" /> },
        ];
      case "nurse":
        return [
          { id: 'patients', label: "Patients", icon: <Hospital className="w-5 h-5" /> },
          { id: 'tasks', label: "My Tasks", icon: <ClipboardList className="w-5 h-5" /> },
          { id: 'queries', label: "Queries", icon: <MessageSquare className="w-5 h-5" /> },
        ];
      default:
        return [
          { id: 'dashboard', label: "Dashboard", icon: <BarChart3 className="w-5 h-5" /> },
        ];
    }
  };

  const navigationItems = getNavigation();

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 sm:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen transition-all duration-300 z-60 bg-white border-r border-slate-200 shadow-xl sm:shadow-none ${
          mobileMenuOpen ? "translate-x-0 w-72" : "-translate-x-full sm:translate-x-0"
        } ${sidebarOpen ? "sm:w-72" : "sm:w-20"}`}
      >
        {/* Logo Container */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src="/logo.png"
              alt="Logo"
              className={`transition-all duration-500 h-10 object-contain ${sidebarOpen ? "w-auto" : "w-10"}`}
            />
          </div>
          <button 
             onClick={() => setMobileMenuOpen(false)} 
             className="sm:hidden p-2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Card */}
        <div className={`mt-6 px-4 transition-all duration-300 ${!sidebarOpen && "sm:px-2 opacity-0 sm:opacity-100"}`}>
          <div className={`p-4 rounded-2xl bg-linear-to-br from-slate-50 to-blue-50/50 border border-slate-100 ${!sidebarOpen && "sm:p-2 sm:items-center"}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0 shadow-lg shadow-blue-200">
                {user?.name?.charAt(0) || "U"}
              </div>
              {sidebarOpen && (
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[#84cc16]">{getRoleIcon(user?.role)}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {user?.role}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3 space-y-1">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all group relative ${
                activeTab === item.id
                  ? "bg-blue-50 text-[#0070ba] font-semibold"
                  : "text-slate-500 hover:bg-slate-50 hover:text-[#0070ba]"
              }`}
            >
              <div className="shrink-0 transition-transform duration-300 group-hover:scale-110">
                {item.icon}
              </div>
              {(sidebarOpen || mobileMenuOpen) && (
                <span className="font-semibold text-[14px]">{item.label}</span>
              )}
              {activeTab === item.id && (
                <div className="absolute left-0 w-1 h-6 bg-[#0070ba] rounded-r-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-6 left-0 right-0 px-4 space-y-3">
          <button
            onClick={handleLogout}
            className="group w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-100 bg-red-50 transition-all font-semibold text-sm"
          >
            <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            {(sidebarOpen || mobileMenuOpen) && "Sign Out"}
          </button>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden sm:flex w-full items-center justify-center py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "sm:ml-72" : "sm:ml-20"}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 h-20 flex items-center">
          <div className="w-full px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="sm:hidden p-2 bg-slate-100 rounded-lg text-slate-600"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
                  {title}
                </h1>
                <p className="hidden sm:block text-xs text-slate-500 mt-1 font-medium">
                  Welcome back to Healthcare 24hr Panel
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search Bar (Desktop) */}
              <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-2 w-64 border border-transparent focus-within:border-[#0070ba]/20 focus-within:bg-white transition-all">
                <Search className="w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Search..." className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full text-slate-600" />
              </div>
              
              <button className="p-2.5 bg-slate-50 text-slate-500 rounded-full hover:bg-blue-50 hover:text-[#0070ba] transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              
              <div className="hidden sm:block h-8 w-px bg-slate-200 mx-1"></div>
              
              <div className="text-right hidden lg:block">
                 <p className="text-xs font-bold text-slate-700">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</p>
                 <p className="text-[11px] text-slate-400 font-medium">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="p-6 lg:p-10 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}