import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { TrendingUp, Calendar, Target, Award, Flame } from 'lucide-react';
import { 
  getWeeklyData, 
  getMonthlyData, 
  getYearlyData,
  calculateStreak,
  getLongestStreak,
  getCompletionRate
} from '../utils/habitUtils';
import Heatmap from './Heatmap';
import { useTheme } from '../context/ThemeContext';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-xl px-4 py-3 shadow-lg">
        <p className="text-obsidian-500 text-sm mb-1 font-medium">{label}</p>
        <p className="text-obsidian-900 dark:text-white font-bold">
          {payload[0].value}% completion
        </p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsView({ habits }) {
  const [timeRange, setTimeRange] = useState('weekly');
  const { isDark } = useTheme();

  const weeklyData = getWeeklyData(habits);
  const monthlyData = getMonthlyData(habits);
  const yearlyData = getYearlyData(habits);

  const chartData = {
    weekly: weeklyData,
    monthly: monthlyData,
    yearly: yearlyData
  }[timeRange];

  const xKey = {
    weekly: 'week',
    monthly: 'month',
    yearly: 'year'
  }[timeRange];

  // Calculate overall stats
  const totalCompletions = habits.reduce((acc, h) => acc + h.completedDates.length, 0);
  const avgStreak = habits.length > 0 
    ? Math.round(habits.reduce((acc, h) => acc + calculateStreak(h.completedDates), 0) / habits.length)
    : 0;
  const bestHabit = habits.length > 0 
    ? habits.reduce((best, h) => {
        const rate = getCompletionRate(h.completedDates, h.createdAt);
        return rate > (best.rate || 0) ? { ...h, rate } : best;
      }, {})
    : null;

  const chartColors = {
    stroke: isDark ? '#ff7d10' : '#f06106',
    fill: isDark ? 'rgba(255, 125, 16, 0.2)' : 'rgba(240, 97, 6, 0.1)',
    grid: isDark ? '#27272a' : '#e4e4e7',
    text: isDark ? '#71717a' : '#71717a',
  };

  if (habits.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-6 pb-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-obsidian-100 dark:bg-obsidian-800 
                        flex items-center justify-center">
            <span className="text-5xl">📊</span>
          </div>
          <h3 className="text-xl font-display font-bold text-obsidian-900 dark:text-white mb-2">
            No data to analyze yet
          </h3>
          <p className="text-obsidian-500">
            Start tracking habits to see your analytics.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 pb-12">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="w-10 h-10 rounded-xl bg-ember-100 dark:bg-ember-500/20 
                        flex items-center justify-center mb-3">
            <Target className="w-5 h-5 text-ember-600 dark:text-ember-400" />
          </div>
          <div className="text-2xl font-bold text-obsidian-900 dark:text-white">
            {totalCompletions}
          </div>
          <div className="text-sm text-obsidian-500 font-medium">Total Check-ins</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="w-10 h-10 rounded-xl bg-sage-100 dark:bg-sage-500/20 
                        flex items-center justify-center mb-3">
            <Flame className="w-5 h-5 text-sage-600 dark:text-sage-400" />
          </div>
          <div className="text-2xl font-bold text-obsidian-900 dark:text-white">
            {avgStreak} days
          </div>
          <div className="text-sm text-obsidian-500 font-medium">Avg Streak</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-500/20 
                        flex items-center justify-center mb-3">
            <Calendar className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="text-2xl font-bold text-obsidian-900 dark:text-white">
            {habits.length}
          </div>
          <div className="text-sm text-obsidian-500 font-medium">Active Habits</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 
                        flex items-center justify-center mb-3">
            <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-obsidian-900 dark:text-white flex items-center gap-1">
            {bestHabit ? (
              <>
                <span>{bestHabit.icon}</span>
                <span className="text-lg">{bestHabit.rate}%</span>
              </>
            ) : '—'}
          </div>
          <div className="text-sm text-obsidian-500 font-medium">Best Habit</div>
        </motion.div>
      </div>

      {/* Chart Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-2xl p-6 mb-8"
      >
        {/* Time Range Selector */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-display font-bold text-obsidian-900 dark:text-white">
            Completion Rate
          </h3>
          <div className="flex gap-1 bg-obsidian-100 dark:bg-obsidian-800 p-1 rounded-xl">
            {['weekly', 'monthly', 'yearly'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === range
                    ? 'bg-white dark:bg-obsidian-700 text-obsidian-900 dark:text-white shadow-sm'
                    : 'text-obsidian-500 hover:text-obsidian-700 dark:hover:text-obsidian-200'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Area Chart */}
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.stroke} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={chartColors.stroke} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis 
                dataKey={xKey} 
                stroke={chartColors.text}
                fontSize={12}
                tickLine={false}
                fontWeight={500}
              />
              <YAxis 
                stroke={chartColors.text}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
                fontWeight={500}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="rate" 
                stroke={chartColors.stroke} 
                strokeWidth={3}
                fill="url(#colorRate)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Individual Habit Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card rounded-2xl p-6 mb-8"
      >
        <h3 className="text-xl font-display font-bold text-obsidian-900 dark:text-white mb-6">
          Habit Performance
        </h3>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={habits.map(h => ({
                name: h.name,
                icon: h.icon,
                rate: getCompletionRate(h.completedDates, h.createdAt),
                streak: calculateStreak(h.completedDates)
              }))}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} horizontal={false} />
              <XAxis 
                type="number" 
                stroke={chartColors.text}
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
                fontWeight={500}
              />
              <YAxis 
                type="category"
                dataKey="icon"
                stroke={chartColors.text}
                fontSize={16}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="glass-card rounded-xl px-4 py-3 shadow-lg">
                        <p className="text-obsidian-900 dark:text-white font-semibold mb-1">{data.name}</p>
                        <p className="text-obsidian-500 text-sm">
                          {data.rate}% completion • {data.streak} day streak
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="rate" 
                fill={chartColors.stroke}
                radius={[0, 8, 8, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Heatmap */}
      <Heatmap habits={habits} />
    </div>
  );
}
