import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Zap, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          throw new Error('Please enter your name');
        }
        await signUp(name.trim(), email.trim(), password);
      } else {
        await signIn(email.trim(), password);
      }
      onClose();
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setError('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-obsidian-950/60 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', bounce: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-md pointer-events-auto bg-white dark:bg-obsidian-900 rounded-3xl p-8 shadow-2xl
                          border border-obsidian-200 dark:border-obsidian-800">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 
                                flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold text-obsidian-900 dark:text-white">
                      {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-sm text-obsidian-500">
                      {mode === 'signin' ? 'Sign in to continue' : 'Start your journey'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-obsidian-400 hover:text-obsidian-600 dark:hover:text-white 
                           hover:bg-obsidian-100 dark:hover:bg-obsidian-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-xl bg-rose-100 dark:bg-rose-500/20 
                           border border-rose-200 dark:border-rose-500/30
                           text-rose-700 dark:text-rose-300 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name (Sign Up only) */}
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block text-sm font-semibold text-obsidian-700 dark:text-obsidian-300 mb-2">
                      Your Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-obsidian-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-12 pr-4 py-3 bg-obsidian-50 dark:bg-obsidian-800 
                                 border border-obsidian-200 dark:border-obsidian-700
                                 rounded-xl text-obsidian-900 dark:text-white 
                                 placeholder-obsidian-400 dark:placeholder-obsidian-500 
                                 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 
                                 focus:border-emerald-500/50 transition-all font-medium"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-obsidian-700 dark:text-obsidian-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-obsidian-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-12 pr-4 py-3 bg-obsidian-50 dark:bg-obsidian-800 
                               border border-obsidian-200 dark:border-obsidian-700
                               rounded-xl text-obsidian-900 dark:text-white 
                               placeholder-obsidian-400 dark:placeholder-obsidian-500 
                               focus:outline-none focus:ring-2 focus:ring-emerald-500/50 
                               focus:border-emerald-500/50 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-obsidian-700 dark:text-obsidian-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-obsidian-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full pl-12 pr-12 py-3 bg-obsidian-50 dark:bg-obsidian-800 
                               border border-obsidian-200 dark:border-obsidian-700
                               rounded-xl text-obsidian-900 dark:text-white 
                               placeholder-obsidian-400 dark:placeholder-obsidian-500 
                               focus:outline-none focus:ring-2 focus:ring-emerald-500/50 
                               focus:border-emerald-500/50 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-obsidian-400 
                               hover:text-obsidian-600 dark:hover:text-obsidian-200"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 
                           text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30
                           hover:shadow-emerald-500/50 transition-shadow
                           disabled:opacity-70 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{mode === 'signin' ? 'Signing in...' : 'Creating account...'}</span>
                    </>
                  ) : (
                    <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                  )}
                </motion.button>
              </form>

              {/* Toggle Mode */}
              <div className="mt-6 text-center">
                <p className="text-obsidian-500">
                  {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
                  <button
                    onClick={toggleMode}
                    className="ml-2 text-emerald-600 dark:text-emerald-400 font-semibold 
                             hover:text-emerald-700 dark:hover:text-emerald-300"
                  >
                    {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
