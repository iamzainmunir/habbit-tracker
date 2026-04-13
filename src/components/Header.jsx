import { motion } from 'framer-motion';
import { Flame, Calendar, BarChart3, Plus, Sun, Moon, Zap, LayoutGrid, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Header({ currentView, setCurrentView, onAddHabit, focusMode, setFocusMode, onOpenAuth }) {
  const { isDark, toggleTheme } = useTheme();
  const { user, signOut, isAuthenticated } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { id: 'today', label: 'Today', icon: Flame },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'widget', label: 'Widget', icon: LayoutGrid },
  ];

  const handleLogoClick = () => {
    setCurrentView('today');
  };

  return (
    <header className="relative z-10">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none dark:from-emerald-500/10" />
      
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          {/* Logo - Clickable */}
          <motion.button 
            onClick={handleLogoClick}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 
                            flex items-center justify-center shadow-lg shadow-emerald-500/30
                            group-hover:shadow-emerald-500/50 transition-shadow">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -inset-1 bg-emerald-500/20 rounded-2xl blur-xl -z-10 
                            group-hover:bg-emerald-500/30 transition-colors" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-obsidian-900 dark:text-white tracking-tight">
                Stride
              </h1>
              <p className="text-xs text-obsidian-500 dark:text-obsidian-400 font-medium tracking-wide">
                Build momentum daily
              </p>
            </div>
          </motion.button>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Focus Mode Toggle */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFocusMode(!focusMode)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl font-medium transition-all ${
                focusMode
                  ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
                  : 'bg-obsidian-100 dark:bg-obsidian-800 text-obsidian-600 dark:text-obsidian-300 hover:bg-obsidian-200 dark:hover:bg-obsidian-700'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Focus</span>
            </motion.button>

            {/* Theme Toggle */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-obsidian-100 dark:bg-obsidian-800 
                       text-obsidian-600 dark:text-obsidian-300
                       hover:bg-obsidian-200 dark:hover:bg-obsidian-700 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>

            {/* Add Habit Button */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAddHabit}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 
                       text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30
                       hover:shadow-emerald-500/50 transition-shadow"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">New</span>
            </motion.button>

            {/* User Menu / Auth */}
            <div className="relative">
              {isAuthenticated ? (
                <>
                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 
                             text-white font-bold flex items-center justify-center
                             shadow-lg shadow-violet-500/30"
                  >
                    {user?.avatar || user?.name?.charAt(0) || 'U'}
                  </motion.button>

                  {/* User dropdown */}
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="absolute right-0 top-14 w-56 bg-white dark:bg-obsidian-900 
                               rounded-xl shadow-xl border border-obsidian-200 dark:border-obsidian-800
                               overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-obsidian-200 dark:border-obsidian-800">
                        <p className="font-semibold text-obsidian-900 dark:text-white truncate">
                          {user?.name}
                        </p>
                        <p className="text-sm text-obsidian-500 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          signOut();
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-rose-600 dark:text-rose-400
                                 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </>
              ) : (
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onOpenAuth}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold
                           bg-obsidian-100 dark:bg-obsidian-800 text-obsidian-700 dark:text-obsidian-200
                           hover:bg-obsidian-200 dark:hover:bg-obsidian-700 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex gap-1 bg-obsidian-100 dark:bg-obsidian-900/50 p-1.5 rounded-2xl w-fit">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setCurrentView(item.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl font-medium
                           transition-all duration-200 ${
                  isActive
                    ? 'text-obsidian-900 dark:text-white'
                    : 'text-obsidian-500 dark:text-obsidian-400 hover:text-obsidian-700 dark:hover:text-obsidian-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white dark:bg-obsidian-800 rounded-xl shadow-sm"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10 text-sm">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)} 
        />
      )}
    </header>
  );
}
