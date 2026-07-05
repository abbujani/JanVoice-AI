import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../context/AuthContext';
import { useTheme } from './ThemeProvider';
import { 
  Vote, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  LogOut, 
  User, 
  Database,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  onPageChange: (page: 'landing' | 'citizen' | 'mp' | 'admin' | 'login' | 'simulator') => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onPageChange, currentPage }) => {
  const { user, logout, isStandalone, switchMockRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const handleNav = (page: 'landing' | 'citizen' | 'mp' | 'admin' | 'login' | 'simulator') => {
    onPageChange(page);
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    handleNav('landing');
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo brand */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNav('landing')}>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center shadow-md">
              <Vote size={18} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold font-display tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                JanVoice AI
              </span>
              <span className="text-[9px] text-slate-500 font-medium tracking-wide uppercase">Gov Decision Portal</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => handleNav('landing')}
              className={`text-sm font-semibold transition-colors cursor-pointer ${currentPage === 'landing' ? 'text-primary' : 'text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-white'}`}
            >
              Overview
            </button>

            {user && (
              <>
                <button
                  onClick={() => handleNav('citizen')}
                  className={`text-sm font-semibold transition-colors cursor-pointer ${currentPage === 'citizen' ? 'text-primary' : 'text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-white'}`}
                >
                  Citizen Panel
                </button>
                
                {(user.role === 'mp' || user.role === 'admin') && (
                  <>
                    <button
                      onClick={() => handleNav('mp')}
                      className={`text-sm font-semibold transition-colors cursor-pointer ${currentPage === 'mp' ? 'text-primary' : 'text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-white'}`}
                    >
                      MP Executive View
                    </button>
                    <button
                      onClick={() => handleNav('simulator')}
                      className={`text-sm font-semibold transition-colors cursor-pointer ${currentPage === 'simulator' ? 'text-primary' : 'text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-white'}`}
                    >
                      Decision Simulator
                    </button>
                  </>
                )}

                {user.role === 'admin' && (
                  <button
                    onClick={() => handleNav('admin')}
                    className={`text-sm font-semibold transition-colors cursor-pointer ${currentPage === 'admin' ? 'text-primary' : 'text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-white'}`}
                  >
                    Admin Panel
                  </button>
                )}
              </>
            )}
          </nav>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Standalone role-switch helper for reviewers */}
            {isStandalone && user && (
              <div className="relative">
                <button
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold rounded-xl hover:bg-amber-500/20 transition-all cursor-pointer"
                >
                  <Database size={12} />
                  Role: {user.role.toUpperCase()}
                </button>

                {roleMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg py-1 z-50">
                    <div className="px-3 py-1.5 text-[10px] text-slate-400 font-bold tracking-wider uppercase border-b border-slate-100 dark:border-slate-800">Switch Reviewer Role</div>
                    {(['citizen', 'mp', 'admin'] as UserRole[]).map(r => (
                      <button
                        key={r}
                        onClick={() => {
                          switchMockRole(r);
                          setRoleMenuOpen(false);
                          handleNav(r === 'citizen' ? 'citizen' : r === 'mp' ? 'mp' : 'admin');
                        }}
                        className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${user.role === r ? 'text-primary font-bold' : 'text-slate-600 dark:text-slate-300'}`}
                      >
                        {r.toUpperCase()}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Run Live Demo Trigger */}
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('run-live-demo'));
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white text-[10px] font-extrabold uppercase tracking-wide rounded-xl shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95 shrink-0"
              title="Run Live Hackathon Demo"
            >
              <Sparkles size={11} className="animate-pulse" />
              Demo Mode
            </button>

            {/* Dark Mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-primary dark:text-slate-300 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer shrink-0"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            {/* Auth section */}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{user.displayName}</span>
                  <span className="text-[9px] text-slate-400 capitalize">{user.role} Account</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNav('login')}
                className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-hover shadow-sm transition-all flex items-center gap-1 cursor-pointer"
              >
                <User size={13} />
                Sign In
              </button>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="md:hidden glass-panel border-t border-slate-200/50 dark:border-slate-800/50 px-4 pt-2 pb-4 space-y-2 flex flex-col shadow-lg">
          <button
            onClick={() => handleNav('landing')}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold ${currentPage === 'landing' ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-300'}`}
          >
            Overview
          </button>
          {user && (
            <>
              <button
                onClick={() => handleNav('citizen')}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold ${currentPage === 'citizen' ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-300'}`}
              >
                Citizen Panel
              </button>
              {(user.role === 'mp' || user.role === 'admin') && (
                <button
                  onClick={() => handleNav('mp')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold ${currentPage === 'mp' ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-300'}`}
                >
                  MP Executive View
                </button>
              )}
              {user.role === 'admin' && (
                <button
                  onClick={() => handleNav('admin')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold ${currentPage === 'admin' ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-300'}`}
                >
                  Admin Panel
                </button>
              )}

              {isStandalone && (
                <div className="border-t border-slate-200 dark:border-slate-800 pt-2 mt-2">
                  <span className="text-[10px] text-slate-400 font-bold px-3 uppercase block mb-1">Switch Role</span>
                  <div className="flex gap-2 px-3">
                    {(['citizen', 'mp', 'admin'] as UserRole[]).map(r => (
                      <button
                        key={r}
                        onClick={() => {
                          switchMockRole(r);
                          setMenuOpen(false);
                          handleNav(r === 'citizen' ? 'citizen' : r === 'mp' ? 'mp' : 'admin');
                        }}
                        className={`px-2.5 py-1 text-xs rounded-lg border ${user.role === r ? 'bg-amber-500 border-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                      >
                        {r.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-slate-200 dark:border-slate-800 pt-2 mt-2 flex items-center justify-between px-3">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{user.displayName}</span>
                  <span className="text-[9px] text-slate-400 capitalize">{user.role} Account</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-500 rounded-xl text-xs font-bold"
                >
                  <LogOut size={12} />
                  Sign Out
                </button>
              </div>
            </>
          )}
          {!user && (
            <button
              onClick={() => handleNav('login')}
              className="w-full text-center px-4 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
            >
              Sign In to Account
            </button>
          )}
        </div>
      )}
    </header>
  );
};
