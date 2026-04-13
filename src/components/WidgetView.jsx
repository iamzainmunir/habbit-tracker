import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Check, Flame, Target, Zap } from 'lucide-react';
import { calculateStreak } from '../utils/habitUtils';

export default function WidgetView({ habits, onToggle }) {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  
  const completedToday = habits.filter(h => h.completedDates.includes(todayStr)).length;
  const pendingHabits = habits.filter(h => !h.completedDates.includes(todayStr));
  const totalStreak = habits.reduce((acc, h) => acc + calculateStreak(h.completedDates), 0);

  const colorMap = {
    ember: 'bg-ember-500',
    sage: 'bg-sage-500',
    ocean: 'bg-ocean-500',
    violet: 'bg-violet-500',
    rose: 'bg-rose-500',
    amber: 'bg-amber-500',
  };

  return (
    <div className="max-w-md mx-auto px-6 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <p className="text-obsidian-500 text-sm uppercase tracking-wider mb-1 font-medium">
          Minimal Widget
        </p>
        <h2 className="text-3xl font-display font-bold text-obsidian-900 dark:text-white">
          Quick View
        </h2>
      </motion.div>

      {/* Widget Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-3xl p-6 shadow-xl"
      >
        {/* Header Stats */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-ember-400 to-ember-600 
                          flex items-center justify-center shadow-lg shadow-ember-500/30">
              <Flame className="w-6 h-6 text-white streak-fire" />
            </div>
            <div>
              <div className="text-2xl font-bold text-obsidian-900 dark:text-white">
                {totalStreak}
              </div>
              <div className="text-xs text-obsidian-500 font-medium">Total Streaks</div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-1">
              <span className="text-3xl font-bold text-sage-600 dark:text-sage-400">
                {completedToday}
              </span>
              <span className="text-obsidian-400">/</span>
              <span className="text-xl text-obsidian-500">{habits.length}</span>
            </div>
            <div className="text-xs text-obsidian-500 font-medium">Today</div>
          </div>
        </div>

        {/* Progress Ring */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              className="fill-none stroke-obsidian-200 dark:stroke-obsidian-800"
              strokeWidth="8"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="56"
              className="fill-none stroke-sage-500"
              strokeWidth="8"
              strokeLinecap="round"
              initial={{ strokeDasharray: '0 352' }}
              animate={{ 
                strokeDasharray: `${(completedToday / Math.max(habits.length, 1)) * 352} 352`
              }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-obsidian-900 dark:text-white">
              {habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0}%
            </span>
            <span className="text-xs text-obsidian-500 font-medium">Complete</span>
          </div>
        </div>

        {/* Pending Habits Quick Toggle */}
        {pendingHabits.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-obsidian-700 dark:text-obsidian-300 mb-3">
              <Target className="w-4 h-4" />
              <span>Pending ({pendingHabits.length})</span>
            </div>
            {pendingHabits.map((habit) => (
              <motion.button
                key={habit.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onToggle(habit.id, today)}
                className="w-full flex items-center gap-3 p-3 rounded-xl 
                         bg-obsidian-100 dark:bg-obsidian-800/50 
                         hover:bg-obsidian-200 dark:hover:bg-obsidian-700/50 
                         transition-colors group"
              >
                <div className={`w-8 h-8 rounded-lg ${colorMap[habit.color] || colorMap.ember} 
                              flex items-center justify-center opacity-30 
                              group-hover:opacity-100 transition-opacity`}>
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-2xl">{habit.icon}</span>
                <span className="font-medium text-obsidian-700 dark:text-obsidian-200 flex-1 text-left">
                  {habit.name}
                </span>
                <Zap className="w-4 h-4 text-obsidian-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            ))}
          </div>
        ) : habits.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-4"
          >
            <div className="text-4xl mb-2">🎉</div>
            <p className="font-semibold text-sage-600 dark:text-sage-400">
              All done for today!
            </p>
            <p className="text-sm text-obsidian-500">
              You've completed all your habits
            </p>
          </motion.div>
        ) : (
          <div className="text-center py-4 text-obsidian-500">
            No habits yet. Add one to get started!
          </div>
        )}
      </motion.div>

      {/* Widget Instructions */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-sm text-obsidian-500 mt-6"
      >
        This is a minimal view perfect for quick check-ins
      </motion.p>
    </div>
  );
}
