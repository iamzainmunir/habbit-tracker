import { motion } from 'framer-motion';
import { format, getDay, startOfWeek, subWeeks } from 'date-fns';
import { getYearHeatmapData } from '../utils/habitUtils';

export default function Heatmap({ habits }) {
  const heatmapData = getYearHeatmapData(habits, 52);
  
  // Group data by weeks
  const weeks = [];
  let currentWeek = [];
  
  heatmapData.forEach((day, index) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || index === heatmapData.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  // Pad first week with empty cells if needed
  if (weeks.length > 0) {
    const firstDayOfWeek = getDay(weeks[0][0]?.date);
    if (firstDayOfWeek > 0) {
      const padding = Array(firstDayOfWeek).fill(null);
      weeks[0] = [...padding, ...weeks[0]];
    }
  }

  const dayLabels = ['Sun', '', 'Tue', '', 'Thu', '', 'Sat'];
  const months = [];
  let currentMonth = '';
  
  weeks.forEach((week, weekIndex) => {
    const firstValidDay = week.find(d => d !== null);
    if (firstValidDay) {
      const month = format(firstValidDay.date, 'MMM');
      if (month !== currentMonth) {
        months.push({ month, weekIndex });
        currentMonth = month;
      }
    }
  });

  const getIntensityClass = (intensity) => {
    if (intensity === 0) return 'heatmap-0';
    if (intensity <= 0.25) return 'heatmap-1';
    if (intensity <= 0.5) return 'heatmap-2';
    if (intensity <= 0.75) return 'heatmap-3';
    return 'heatmap-4';
  };

  if (habits.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-display font-bold text-obsidian-900 dark:text-white mb-4">
          Activity Heatmap
        </h3>
        <p className="text-obsidian-500 text-center py-8">
          Start tracking habits to see your activity heatmap
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-obsidian-900 dark:text-white">
          Activity Heatmap
        </h3>
        <div className="flex items-center gap-2 text-xs text-obsidian-500">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map(level => (
            <div key={level} className={`w-3 h-3 rounded-sm heatmap-${level}`} />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Month labels */}
      <div className="flex ml-8 mb-1 text-xs text-obsidian-500">
        {months.map(({ month, weekIndex }, i) => (
          <div 
            key={i} 
            className="font-medium"
            style={{ 
              marginLeft: i === 0 ? weekIndex * 14 : (weekIndex - months[i-1].weekIndex) * 14 - 28
            }}
          >
            {month}
          </div>
        ))}
      </div>

      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] text-[10px] text-obsidian-500 pr-1">
          {dayLabels.map((label, i) => (
            <div key={i} className="h-[11px] flex items-center justify-end font-medium">
              {label}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="flex gap-[3px] overflow-x-auto">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[3px]">
              {week.map((day, dayIndex) => (
                <motion.div
                  key={dayIndex}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (weekIndex * 7 + dayIndex) * 0.001 }}
                  className={`w-[11px] h-[11px] rounded-sm ${
                    day === null 
                      ? 'bg-transparent' 
                      : getIntensityClass(day.intensity)
                  } transition-colors hover:ring-1 hover:ring-obsidian-400 dark:hover:ring-obsidian-500`}
                  title={day ? `${day.dateStr}: ${day.completedCount}/${day.totalHabits} habits` : ''}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 text-sm text-obsidian-600 dark:text-obsidian-400">
        <span className="font-semibold text-sage-600 dark:text-sage-400">
          {heatmapData.filter(d => d.intensity > 0).length}
        </span> active days in the past year
      </div>
    </motion.div>
  );
}
