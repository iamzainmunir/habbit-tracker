import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Sparkles, Target, Flame, Trophy, Zap } from 'lucide-react';
import HabitCard from './HabitCard';
import InsightsCard from './InsightsCard';
import ProgressStory from './ProgressStory';
import { calculateStreak } from '../utils/habitUtils';

export default function TodayView({ habits, onToggle, onDelete, onEdit, focusMode }) {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  
  const completedToday = habits.filter(h => 
    h.completedDates.includes(todayStr)
  ).length;
  
  const totalStreakDays = habits.reduce((acc, h) => 
    acc + calculateStreak(h.completedDates), 0
  );
  
  const allCompletedToday = habits.length > 0 && completedToday === habits.length;

  // In focus mode, only show uncompleted habits
  const displayedHabits = focusMode 
    ? habits.filter(h => !h.completedDates.includes(todayStr))
    : habits;

  return (
    <div className="max-w-4xl mx-auto px-6 pb-12">
      {/* Date Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <p className="text-obsidian-500 text-sm uppercase tracking-wider mb-1 font-medium">
          {format(today, 'EEEE')}
        </p>
        <h2 className="text-4xl font-display font-bold text-obsidian-900 dark:text-white">
          {format(today, 'MMMM d, yyyy')}
        </h2>
      </motion.div>

      {/* Progress Story */}
      <ProgressStory habits={habits} />

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-5 text-center"
        >
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-sage-100 dark:bg-sage-500/20 
                        flex items-center justify-center">
            <Target className="w-6 h-6 text-sage-600 dark:text-sage-400" />
          </div>
          <div className="text-3xl font-bold text-obsidian-900 dark:text-white mb-1">
            {completedToday}/{habits.length}
          </div>
          <div className="text-sm text-obsidian-500 font-medium">Completed</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-5 text-center"
        >
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-ember-100 dark:bg-ember-500/20 
                        flex items-center justify-center">
            <Flame className="w-6 h-6 text-ember-600 dark:text-ember-400 streak-fire" />
          </div>
          <div className="text-3xl font-bold text-obsidian-900 dark:text-white mb-1">
            {totalStreakDays}
          </div>
          <div className="text-sm text-obsidian-500 font-medium">Streak Days</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-5 text-center"
        >
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-violet-100 dark:bg-violet-500/20 
                        flex items-center justify-center">
            <Trophy className="w-6 h-6 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="text-3xl font-bold text-obsidian-900 dark:text-white mb-1">
            {habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0}%
          </div>
          <div className="text-sm text-obsidian-500 font-medium">Progress</div>
        </motion.div>
      </div>

      {/* AI Insights */}
      {!focusMode && <InsightsCard habits={habits} />}

      {/* Focus Mode Indicator */}
      {focusMode && displayedHabits.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 mb-6 px-4 py-3 rounded-xl 
                   bg-violet-100 dark:bg-violet-500/20 border border-violet-200 dark:border-violet-500/30"
        >
          <Zap className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          <span className="font-medium text-violet-700 dark:text-violet-300">
            Focus Mode: Showing {displayedHabits.length} pending habit{displayedHabits.length !== 1 ? 's' : ''}
          </span>
        </motion.div>
      )}

      {/* All Complete Celebration */}
      <AnimatePresence>
        {allCompletedToday && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-sage-500/10 to-amber-500/10 
                     border border-sage-300 dark:border-sage-500/30 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-2xl mb-2">
              <Sparkles className="w-7 h-7 text-amber-500" />
              <span className="font-display font-bold text-obsidian-900 dark:text-white">
                Perfect Day!
              </span>
              <Sparkles className="w-7 h-7 text-amber-500" />
            </div>
            <p className="text-obsidian-600 dark:text-obsidian-300">
              You've completed all your habits today. Keep building that momentum!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Habits List */}
      {habits.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-obsidian-100 dark:bg-obsidian-800 
                        flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-obsidian-400" />
          </div>
          <h3 className="text-xl font-display font-bold text-obsidian-900 dark:text-white mb-2">
            No habits yet
          </h3>
          <p className="text-obsidian-500 max-w-sm mx-auto">
            Start building better habits by adding your first one. 
            Click the "New Habit" button to get started!
          </p>
        </motion.div>
      ) : displayedHabits.length === 0 && focusMode ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-display font-bold text-obsidian-900 dark:text-white mb-2">
            All caught up!
          </h3>
          <p className="text-obsidian-500">
            You've completed all your habits for today. Amazing work!
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {displayedHabits.map((habit, index) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                index={index}
                onToggle={onToggle}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
