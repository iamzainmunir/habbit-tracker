import { motion } from 'framer-motion';
import { Check, Flame, TrendingUp, MoreVertical, Trash2, Edit } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { calculateStreak, getLongestStreak, getCompletionRate } from '../utils/habitUtils';

export default function HabitCard({ habit, onToggle, onDelete, onEdit, index, compact = false }) {
  const [showMenu, setShowMenu] = useState(false);
  
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const isCompletedToday = habit.completedDates.includes(todayStr);
  const currentStreak = calculateStreak(habit.completedDates);
  const longestStreak = getLongestStreak(habit.completedDates);
  const completionRate = getCompletionRate(habit.completedDates, habit.createdAt);

  const colorMap = {
    ember: { 
      bg: 'bg-ember-500', 
      light: 'bg-ember-100 dark:bg-ember-500/20',
      text: 'text-ember-600 dark:text-ember-400',
      ring: 'ring-ember-500/30' 
    },
    sage: { 
      bg: 'bg-sage-500', 
      light: 'bg-sage-100 dark:bg-sage-500/20',
      text: 'text-sage-600 dark:text-sage-400',
      ring: 'ring-sage-500/30' 
    },
    ocean: { 
      bg: 'bg-ocean-500', 
      light: 'bg-ocean-100 dark:bg-ocean-500/20',
      text: 'text-ocean-600 dark:text-ocean-400',
      ring: 'ring-ocean-500/30' 
    },
    violet: { 
      bg: 'bg-violet-500', 
      light: 'bg-violet-100 dark:bg-violet-500/20',
      text: 'text-violet-600 dark:text-violet-400',
      ring: 'ring-violet-500/30' 
    },
    rose: { 
      bg: 'bg-rose-500', 
      light: 'bg-rose-100 dark:bg-rose-500/20',
      text: 'text-rose-600 dark:text-rose-400',
      ring: 'ring-rose-500/30' 
    },
    amber: { 
      bg: 'bg-amber-500', 
      light: 'bg-amber-100 dark:bg-amber-500/20',
      text: 'text-amber-600 dark:text-amber-400',
      ring: 'ring-amber-500/30' 
    },
  };

  const colors = colorMap[habit.color] || colorMap.ember;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl p-4"
      >
        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => onToggle(habit.id, today)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`w-12 h-12 rounded-xl flex items-center justify-center 
                       habit-check transition-all duration-300 ${
              isCompletedToday
                ? `${colors.bg} shadow-lg`
                : `${colors.light} ring-2 ${colors.ring}`
            }`}
          >
            {isCompletedToday ? (
              <Check className="w-6 h-6 text-white" strokeWidth={3} />
            ) : (
              <span className="text-xl">{habit.icon}</span>
            )}
          </motion.button>
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold truncate ${
              isCompletedToday 
                ? 'text-obsidian-400 dark:text-obsidian-500 line-through' 
                : 'text-obsidian-900 dark:text-white'
            }`}>
              {habit.name}
            </h3>
            <div className="flex items-center gap-1 text-xs text-obsidian-500">
              <Flame className={`w-3 h-3 ${currentStreak > 0 ? 'text-ember-500' : ''}`} />
              <span>{currentStreak} days</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="glass-card rounded-2xl p-5 relative group"
    >
      {/* Menu Button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 rounded-lg text-obsidian-400 hover:text-obsidian-600 dark:hover:text-white 
                   hover:bg-obsidian-100 dark:hover:bg-obsidian-800
                   transition-colors opacity-0 group-hover:opacity-100"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
        
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute right-0 top-10 glass-card rounded-xl py-2 min-w-[140px] z-20 shadow-xl"
          >
            <button
              onClick={() => { onEdit(habit); setShowMenu(false); }}
              className="flex items-center gap-2 w-full px-4 py-2 text-left text-obsidian-700 dark:text-obsidian-200 
                       hover:bg-obsidian-100 dark:hover:bg-obsidian-800 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => { onDelete(habit.id); setShowMenu(false); }}
              className="flex items-center gap-2 w-full px-4 py-2 text-left text-rose-500 
                       hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </motion.div>
        )}
      </div>

      <div className="flex items-start gap-4">
        {/* Check Button */}
        <motion.button
          onClick={() => onToggle(habit.id, today)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`relative w-14 h-14 rounded-2xl flex items-center justify-center 
                     habit-check transition-all duration-300 ${
            isCompletedToday
              ? `${colors.bg} shadow-lg shadow-${habit.color}-500/30`
              : `${colors.light} ring-2 ${colors.ring}`
          }`}
        >
          {isCompletedToday ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
            >
              <Check className="w-7 h-7 text-white" strokeWidth={3} />
            </motion.div>
          ) : (
            <span className="text-2xl">{habit.icon}</span>
          )}
        </motion.button>

        {/* Habit Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-obsidian-900 dark:text-white mb-1 truncate">
            {habit.name}
          </h3>
          
          <div className="flex items-center gap-4 text-sm">
            {/* Current Streak */}
            <div className="flex items-center gap-1.5">
              <Flame className={`w-4 h-4 ${currentStreak > 0 ? 'text-ember-500 streak-fire' : 'text-obsidian-400'}`} />
              <span className={currentStreak > 0 ? 'text-ember-600 dark:text-ember-400 font-medium' : 'text-obsidian-500'}>
                {currentStreak} day{currentStreak !== 1 ? 's' : ''}
              </span>
            </div>
            
            {/* Best Streak */}
            <div className="flex items-center gap-1.5 text-obsidian-500">
              <TrendingUp className="w-4 h-4" />
              <span>Best: {longestStreak}</span>
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="text-right hidden sm:block">
          <div className="text-2xl font-bold text-obsidian-900 dark:text-white">
            {completionRate}%
          </div>
          <div className="text-xs text-obsidian-500">completion</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 h-1.5 bg-obsidian-200 dark:bg-obsidian-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${completionRate}%` }}
          transition={{ duration: 1, delay: index * 0.05 + 0.2 }}
          className={`h-full ${colors.bg} rounded-full`}
        />
      </div>

      {/* Last 7 Days - Clickable */}
      <div className="mt-4 flex justify-between">
        {Array.from({ length: 7 }).map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          const dateStr = format(date, 'yyyy-MM-dd');
          const isCompleted = habit.completedDates.includes(dateStr);
          const dayLabel = format(date, 'EEE').charAt(0);
          const isToday = i === 6;
          
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className={`text-[10px] font-medium ${isToday ? colors.text : 'text-obsidian-400'}`}>
                {dayLabel}
              </span>
              <motion.button
                onClick={() => onToggle(habit.id, date)}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  isCompleted
                    ? `${colors.bg} shadow-sm`
                    : `bg-obsidian-100 dark:bg-obsidian-800 hover:ring-2 hover:${colors.ring}`
                } ${isToday ? 'ring-2 ring-offset-1 ring-offset-white dark:ring-offset-obsidian-900 ' + colors.ring : ''}`}
                title={format(date, 'MMM d, yyyy')}
              >
                {isCompleted && <Check className="w-3 h-3 text-white" />}
              </motion.button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
