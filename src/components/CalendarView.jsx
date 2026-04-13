import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, Flame, TrendingUp } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths
} from 'date-fns';
import { calculateStreak, getLongestStreak, getCompletionRate } from '../utils/habitUtils';
import Heatmap from './Heatmap';

export default function CalendarView({ habits, onToggle }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedHabit, setSelectedHabit] = useState(habits[0]?.id || null);

  const habit = habits.find(h => h.id === selectedHabit);
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const colorMap = {
    ember: { bg: 'bg-ember-500', light: 'bg-ember-100 dark:bg-ember-500/20', text: 'text-ember-600 dark:text-ember-400' },
    sage: { bg: 'bg-sage-500', light: 'bg-sage-100 dark:bg-sage-500/20', text: 'text-sage-600 dark:text-sage-400' },
    ocean: { bg: 'bg-ocean-500', light: 'bg-ocean-100 dark:bg-ocean-500/20', text: 'text-ocean-600 dark:text-ocean-400' },
    violet: { bg: 'bg-violet-500', light: 'bg-violet-100 dark:bg-violet-500/20', text: 'text-violet-600 dark:text-violet-400' },
    rose: { bg: 'bg-rose-500', light: 'bg-rose-100 dark:bg-rose-500/20', text: 'text-rose-600 dark:text-rose-400' },
    amber: { bg: 'bg-amber-500', light: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400' },
  };

  if (habits.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 pb-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-obsidian-100 dark:bg-obsidian-800 
                        flex items-center justify-center">
            <span className="text-5xl">📅</span>
          </div>
          <h3 className="text-xl font-display font-bold text-obsidian-900 dark:text-white mb-2">
            No habits to display
          </h3>
          <p className="text-obsidian-500">
            Add a habit first to see your calendar view.
          </p>
        </motion.div>
      </div>
    );
  }

  const colors = habit ? (colorMap[habit.color] || colorMap.ember) : colorMap.ember;

  return (
    <div className="max-w-4xl mx-auto px-6 pb-12">
      {/* Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Heatmap habits={habits} />
      </motion.div>

      {/* Habit Selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {habits.map((h) => (
          <motion.button
            key={h.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelectedHabit(h.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap
                       transition-all duration-200 ${
              selectedHabit === h.id
                ? 'glass-card shadow-lg text-obsidian-900 dark:text-white font-semibold'
                : 'bg-obsidian-100 dark:bg-obsidian-800/50 text-obsidian-500 hover:text-obsidian-700 dark:hover:text-obsidian-200'
            }`}
          >
            <span className="text-lg">{h.icon}</span>
            <span>{h.name}</span>
          </motion.button>
        ))}
      </div>

      {habit && (
        <>
          {/* Habit Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${colors.light} flex items-center justify-center`}>
                  <Flame className={`w-5 h-5 ${colors.text} streak-fire`} />
                </div>
                <div>
                  <div className="text-xl font-bold text-obsidian-900 dark:text-white">
                    {calculateStreak(habit.completedDates)}
                  </div>
                  <div className="text-xs text-obsidian-500 font-medium">Current Streak</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center">
                  <span className="text-lg">🏆</span>
                </div>
                <div>
                  <div className="text-xl font-bold text-obsidian-900 dark:text-white">
                    {getLongestStreak(habit.completedDates)}
                  </div>
                  <div className="text-xs text-obsidian-500 font-medium">Best Streak</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-ocean-100 dark:bg-ocean-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-ocean-600 dark:text-ocean-400" />
                </div>
                <div>
                  <div className="text-xl font-bold text-obsidian-900 dark:text-white">
                    {getCompletionRate(habit.completedDates, habit.createdAt)}%
                  </div>
                  <div className="text-xs text-obsidian-500 font-medium">Completion</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-6"
          >
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 rounded-xl text-obsidian-500 hover:text-obsidian-700 dark:hover:text-white 
                         hover:bg-obsidian-100 dark:hover:bg-obsidian-800 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-display font-bold text-obsidian-900 dark:text-white">
                {format(currentMonth, 'MMMM yyyy')}
              </h3>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 rounded-xl text-obsidian-500 hover:text-obsidian-700 dark:hover:text-white 
                         hover:bg-obsidian-100 dark:hover:bg-obsidian-800 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-sm font-semibold text-obsidian-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, index) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const isCompleted = habit.completedDates.includes(dateStr);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isTodayDate = isToday(day);
                const isFuture = day > new Date();

                return (
                  <motion.button
                    key={dateStr}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.008 }}
                    onClick={() => !isFuture && onToggle(habit.id, day)}
                    disabled={isFuture}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center
                               transition-all duration-200 relative ${
                      !isCurrentMonth 
                        ? 'opacity-30' 
                        : isFuture
                          ? 'opacity-30 cursor-not-allowed'
                          : 'hover:bg-obsidian-100 dark:hover:bg-obsidian-800'
                    } ${
                      isTodayDate ? 'ring-2 ring-ember-500' : ''
                    } ${
                      isCompleted && isCurrentMonth ? colors.light : ''
                    }`}
                  >
                    <span className={`text-sm font-medium ${
                      isCompleted && isCurrentMonth
                        ? colors.text
                        : 'text-obsidian-600 dark:text-obsidian-300'
                    }`}>
                      {format(day, 'd')}
                    </span>
                    
                    {isCompleted && isCurrentMonth && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mt-0.5"
                      >
                        <Check className={`w-3 h-3 ${colors.text}`} />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
