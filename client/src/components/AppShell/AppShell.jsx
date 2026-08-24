import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../store/authStore';
import {
  GraduationCap,
  MessageSquare,
  LayoutDashboard,
  BookOpen,
  Settings,
  LogOut,
  Shield,
  FileText,
  BarChart3,
  Sliders,
  Menu,
  X,
  Sparkles,
  PlusCircle,
} from 'lucide-react';

export default function AppShell({ children }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isFaculty = user?.role === 'faculty' || isAdmin;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'AI Chatbot', href: '/chat', icon: MessageSquare },
    { label: 'Knowledge Bases', href: '/knowledge-bases', icon: BookOpen },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const adminNavItems = [
    { label: 'Admin Overview', href: '/admin', icon: Shield },
    { label: 'Manage Documents', href: '/admin/documents', icon: FileText },
    { label: 'Collections / KBs', href: '/admin/knowledge-bases', icon: BookOpen },
    { label: 'RAG Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'System Health', href: '/admin/settings', icon: Sliders },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 flex-col border-r border-slate-800 bg-slate-900/60 backdrop-blur-xl">
        {/* Brand Logo */}
        <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 shadow-lg shadow-brand-500/20">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold font-display tracking-tight text-white">CampusIQ</span>
            <span className="block text-[10px] uppercase font-semibold tracking-wider text-brand-400">RAG Assistant</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4">
          <Link
            href="/chat"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 py-2.5 px-4 text-sm font-medium text-white shadow-md shadow-brand-500/25 transition hover:from-brand-500 hover:to-brand-400"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Chat</span>
          </Link>
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
          <div>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Student Hub</p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = router.pathname === item.href || (item.href !== '/dashboard' && router.pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? 'bg-brand-500/15 text-brand-300 font-semibold border-l-2 border-brand-400'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Admin / Faculty Section */}
          {isAdmin && (
            <div>
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-amber-400/90 mb-2 flex items-center gap-1.5">
                <Shield className="h-3 w-3" />
                <span>Administration</span>
              </p>
              <nav className="space-y-1">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = router.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition ${
                        isActive
                          ? 'bg-amber-500/15 text-amber-300 font-semibold border-l-2 border-amber-400'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* User Card */}
        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-brand-300 border border-slate-700">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'ST'}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-200">{user?.name || 'User'}</p>
                <span className="inline-block rounded px-1.5 py-0.2 text-[10px] font-semibold uppercase tracking-wider bg-slate-800 text-slate-400">
                  {user?.role || 'student'}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-800 px-4 md:px-8 bg-slate-950/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-medium text-slate-400 hidden sm:inline">RAG Knowledge Engine Online</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full bg-slate-900 border border-slate-800 px-3 py-1 text-xs text-slate-300">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Dept: {user?.department || 'General'}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
