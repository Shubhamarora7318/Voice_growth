import React from 'react';
import {
  Sparkles,
  User as UserIcon,
  LogOut,
  Shield,
  Building,
  BarChart3,
  BookOpen,
  PlusCircle,
  Smartphone,
  Mail,
  Sun,
  Moon
} from 'lucide-react';
import { User, UserProfile } from '../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  user: User | null;
  profile: UserProfile | null;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
  onOpenRules: () => void;
  isDark?: boolean;
  onToggleDark?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  user,
  profile,
  onOpenAuth,
  onOpenProfile,
  onLogout,
  onOpenRules,
  isDark = false,
  onToggleDark
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white font-display">
                  Voice<span className="text-emerald-600 dark:text-emerald-400">2</span>Growth
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 dark:border dark:border-emerald-800/50">
                  MySQL
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-tight leading-none hidden sm:block">
                Every Voice Can Create Change
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                currentView === 'home'
                  ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('share')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                currentView === 'share'
                  ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Share Voice</span>
            </button>
            <button
              onClick={() => onNavigate('ideas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                currentView === 'ideas'
                  ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
              }`}
            >
              Ideas
            </button>
            <button
              onClick={() => onNavigate('business')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                currentView === 'business'
                  ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
              }`}
            >
              Business Feedback
            </button>
            <button
              onClick={() => onNavigate('community')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                currentView === 'community'
                  ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
              }`}
            >
              Community
            </button>
            <button
              onClick={() => onNavigate('insights')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                currentView === 'insights'
                  ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Insights</span>
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

            {/* Portal Switchers */}
            <button
              onClick={() => onNavigate('org')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                currentView === 'org'
                  ? 'text-indigo-700 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-950/60 font-semibold'
                  : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-950/40'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Org View</span>
            </button>
            <button
              onClick={() => onNavigate('admin')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                currentView === 'admin'
                  ? 'text-purple-700 bg-purple-50 dark:text-purple-300 dark:bg-purple-950/60 font-semibold'
                  : 'text-slate-500 hover:text-purple-600 hover:bg-purple-50/50 dark:text-slate-400 dark:hover:text-purple-400 dark:hover:bg-purple-950/40'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </nav>

          {/* User & Actions Area */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Dark Mode Toggle */}
            <button
              id="theme-toggle-button"
              onClick={onToggleDark}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-amber-400 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer flex items-center justify-center"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform duration-200" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 hover:-rotate-12 transition-transform duration-200" />
              )}
            </button>

            {/* Community Guidelines */}
            <button
              onClick={onOpenRules}
              title="Community Guidelines"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
            </button>

            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                    currentView === 'dashboard'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold max-w-[130px] truncate" title={user.email || user.mobile_number || profile?.display_name}>
                    {profile?.display_name || user.email || 'My Account'}
                  </span>
                </button>

                <button
                  onClick={onOpenProfile}
                  title="Edit Profile"
                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <UserIcon className="w-4 h-4" />
                </button>

                <button
                  onClick={onLogout}
                  title="Logout"
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign in with Gmail</span>
                <span className="sm:hidden">Gmail Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Submenu Bar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 dark:border-slate-800 scrollbar-none text-xs">
          <button
            onClick={() => onNavigate('home')}
            className={`px-2.5 py-1 rounded-md shrink-0 font-medium ${
              currentView === 'home'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('share')}
            className={`px-2.5 py-1 rounded-md shrink-0 font-medium ${
              currentView === 'share'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            + Share Voice
          </button>
          <button
            onClick={() => onNavigate('ideas')}
            className={`px-2.5 py-1 rounded-md shrink-0 font-medium ${
              currentView === 'ideas'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Ideas
          </button>
          <button
            onClick={() => onNavigate('business')}
            className={`px-2.5 py-1 rounded-md shrink-0 font-medium ${
              currentView === 'business'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Outlets
          </button>
          <button
            onClick={() => onNavigate('community')}
            className={`px-2.5 py-1 rounded-md shrink-0 font-medium ${
              currentView === 'community'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Community
          </button>
          <button
            onClick={() => onNavigate('insights')}
            className={`px-2.5 py-1 rounded-md shrink-0 font-medium ${
              currentView === 'insights'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Insights
          </button>
          {user && (
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-2.5 py-1 rounded-md shrink-0 font-medium ${
                currentView === 'dashboard'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              My Dashboard
            </button>
          )}
          <button
            onClick={() => onNavigate('org')}
            className={`px-2.5 py-1 rounded-md shrink-0 font-medium ${
              currentView === 'org'
                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-semibold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Org View
          </button>
          <button
            onClick={() => onNavigate('admin')}
            className={`px-2.5 py-1 rounded-md shrink-0 font-medium ${
              currentView === 'admin'
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-semibold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Admin
          </button>
        </div>
      </div>
    </header>
  );
};
