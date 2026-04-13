import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  subDays,
  subWeeks,
  isToday,
  parseISO,
  differenceInDays,
  getDay,
  getWeek,
  addDays
} from 'date-fns';

const STORAGE_KEY = 'momentum_habits';

export const getHabits = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveHabits = (habits) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
};

export const createHabit = (name, icon, color, startDate = null) => ({
  id: Date.now().toString(),
  name,
  icon,
  color,
  completedDates: [],
  createdAt: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
});

export const toggleHabitCompletion = (habits, habitId, date = new Date()) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  return habits.map(habit => {
    if (habit.id !== habitId) return habit;
    
    const hasDate = habit.completedDates.includes(dateStr);
    return {
      ...habit,
      completedDates: hasDate
        ? habit.completedDates.filter(d => d !== dateStr)
        : [...habit.completedDates, dateStr]
    };
  });
};

export const calculateStreak = (completedDates) => {
  if (!completedDates || completedDates.length === 0) return 0;
  
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');
  
  if (!completedDates.includes(todayStr) && !completedDates.includes(yesterdayStr)) {
    return 0;
  }
  
  let streak = 0;
  let checkDate = completedDates.includes(todayStr) ? today : subDays(today, 1);
  
  while (true) {
    const checkStr = format(checkDate, 'yyyy-MM-dd');
    if (completedDates.includes(checkStr)) {
      streak++;
      checkDate = subDays(checkDate, 1);
    } else {
      break;
    }
  }
  
  return streak;
};

export const getLongestStreak = (completedDates) => {
  if (!completedDates || completedDates.length === 0) return 0;
  
  const sortedDates = [...completedDates]
    .map(d => parseISO(d))
    .sort((a, b) => a - b);
  
  let maxStreak = 1;
  let currentStreak = 1;
  
  for (let i = 1; i < sortedDates.length; i++) {
    const diff = differenceInDays(sortedDates[i], sortedDates[i - 1]);
    if (diff === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else if (diff > 1) {
      currentStreak = 1;
    }
  }
  
  return maxStreak;
};

export const getCompletionRate = (completedDates, startDate) => {
  if (!completedDates || completedDates.length === 0) return 0;
  
  const start = parseISO(startDate);
  const today = new Date();
  const totalDays = differenceInDays(today, start) + 1;
  
  return Math.round((completedDates.length / totalDays) * 100);
};

export const getWeeklyData = (habits, weeksBack = 12) => {
  const today = new Date();
  const startDate = subDays(today, weeksBack * 7);
  
  const weeks = eachWeekOfInterval({
    start: startDate,
    end: today
  }, { weekStartsOn: 1 });
  
  return weeks.map(weekStart => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd > today ? today : weekEnd });
    
    let totalCompleted = 0;
    let totalPossible = habits.length * daysInWeek.length;
    
    habits.forEach(habit => {
      daysInWeek.forEach(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        if (habit.completedDates.includes(dayStr)) {
          totalCompleted++;
        }
      });
    });
    
    return {
      week: format(weekStart, 'MMM d'),
      completed: totalCompleted,
      rate: totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0
    };
  });
};

export const getMonthlyData = (habits, monthsBack = 12) => {
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth() - monthsBack + 1, 1);
  
  const months = eachMonthOfInterval({
    start: startDate,
    end: today
  });
  
  return months.map(monthStart => {
    const monthEnd = endOfMonth(monthStart);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd > today ? today : monthEnd });
    
    let totalCompleted = 0;
    let totalPossible = habits.length * daysInMonth.length;
    
    habits.forEach(habit => {
      daysInMonth.forEach(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        if (habit.completedDates.includes(dayStr)) {
          totalCompleted++;
        }
      });
    });
    
    return {
      month: format(monthStart, 'MMM'),
      completed: totalCompleted,
      rate: totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0
    };
  });
};

export const getYearlyData = (habits) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const years = [currentYear - 2, currentYear - 1, currentYear];
  
  return years.map(year => {
    const yearStart = new Date(year, 0, 1);
    const yearEnd = year === currentYear ? today : new Date(year, 11, 31);
    const daysInYear = eachDayOfInterval({ start: yearStart, end: yearEnd });
    
    let totalCompleted = 0;
    let totalPossible = habits.length * daysInYear.length;
    
    habits.forEach(habit => {
      daysInYear.forEach(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        if (habit.completedDates.includes(dayStr)) {
          totalCompleted++;
        }
      });
    });
    
    return {
      year: year.toString(),
      completed: totalCompleted,
      rate: totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0
    };
  });
};

export const getCalendarData = (habit, year, month) => {
  const startDate = new Date(year, month, 1);
  const endDate = endOfMonth(startDate);
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  return days.map(day => ({
    date: day,
    dateStr: format(day, 'yyyy-MM-dd'),
    completed: habit.completedDates.includes(format(day, 'yyyy-MM-dd')),
    isToday: isToday(day)
  }));
};

// GitHub-style heatmap data for the full year
export const getYearHeatmapData = (habits, weeksBack = 52) => {
  const today = new Date();
  const startDate = subWeeks(startOfWeek(today, { weekStartsOn: 0 }), weeksBack - 1);
  const days = eachDayOfInterval({ start: startDate, end: today });
  
  return days.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const completedCount = habits.filter(h => 
      h.completedDates.includes(dateStr)
    ).length;
    
    const intensity = habits.length > 0 
      ? completedCount / habits.length 
      : 0;
    
    return {
      date: day,
      dateStr,
      completedCount,
      totalHabits: habits.length,
      intensity,
      dayOfWeek: getDay(day),
      week: getWeek(day)
    };
  });
};

// AI Insights: Analyze patterns
export const getInsights = (habits) => {
  if (habits.length === 0) return [];
  
  const insights = [];
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  
  // Day of week analysis
  const dayStats = [0, 0, 0, 0, 0, 0, 0]; // Sun to Sat
  const dayTotals = [0, 0, 0, 0, 0, 0, 0];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  habits.forEach(habit => {
    habit.completedDates.forEach(dateStr => {
      const date = parseISO(dateStr);
      const dayOfWeek = getDay(date);
      dayStats[dayOfWeek]++;
    });
  });
  
  // Calculate totals for each day (how many times each day occurred)
  const startDate = subDays(today, 90);
  const days = eachDayOfInterval({ start: startDate, end: today });
  days.forEach(day => {
    dayTotals[getDay(day)]++;
  });
  
  const dayRates = dayStats.map((count, i) => ({
    day: dayNames[i],
    rate: dayTotals[i] > 0 ? (count / (dayTotals[i] * habits.length)) * 100 : 0
  }));
  
  const bestDay = dayRates.reduce((best, current) => 
    current.rate > best.rate ? current : best
  );
  const worstDay = dayRates.reduce((worst, current) => 
    current.rate < worst.rate ? current : worst
  );
  
  if (bestDay.rate > 0) {
    insights.push({
      type: 'pattern',
      icon: '📊',
      title: 'Best Day Pattern',
      message: `You're most consistent on ${bestDay.day}s with ${Math.round(bestDay.rate)}% completion rate`,
      color: 'sage'
    });
  }
  
  if (worstDay.rate < bestDay.rate) {
    insights.push({
      type: 'improvement',
      icon: '💡',
      title: 'Room for Growth',
      message: `${worstDay.day}s are your toughest — only ${Math.round(worstDay.rate)}% completion. Try setting a reminder!`,
      color: 'amber'
    });
  }
  
  // Streak risk alerts
  habits.forEach(habit => {
    const streak = calculateStreak(habit.completedDates);
    const completedToday = habit.completedDates.includes(todayStr);
    
    if (streak >= 7 && !completedToday) {
      insights.push({
        type: 'alert',
        icon: '🔥',
        title: 'Streak at Risk!',
        message: `Don't break your ${streak}-day streak on "${habit.name}"! Complete it today.`,
        color: 'ember',
        habitId: habit.id
      });
    }
  });
  
  // Weekly trend
  const thisWeekStart = startOfWeek(today, { weekStartsOn: 1 });
  const lastWeekStart = subWeeks(thisWeekStart, 1);
  const lastWeekEnd = subDays(thisWeekStart, 1);
  
  let thisWeekCount = 0;
  let lastWeekCount = 0;
  
  habits.forEach(habit => {
    habit.completedDates.forEach(dateStr => {
      const date = parseISO(dateStr);
      if (date >= thisWeekStart && date <= today) thisWeekCount++;
      if (date >= lastWeekStart && date <= lastWeekEnd) lastWeekCount++;
    });
  });
  
  if (lastWeekCount > 0) {
    const trend = ((thisWeekCount - lastWeekCount) / lastWeekCount) * 100;
    if (trend > 10) {
      insights.push({
        type: 'positive',
        icon: '🚀',
        title: 'Momentum Building!',
        message: `You're ${Math.round(trend)}% more active this week compared to last week. Keep it up!`,
        color: 'sage'
      });
    } else if (trend < -20) {
      insights.push({
        type: 'warning',
        icon: '📉',
        title: 'Activity Dip',
        message: `Your activity is down ${Math.round(Math.abs(trend))}% this week. Time to refocus!`,
        color: 'amber'
      });
    }
  }
  
  // Consistency champion
  const highStreakHabits = habits.filter(h => calculateStreak(h.completedDates) >= 14);
  if (highStreakHabits.length > 0) {
    insights.push({
      type: 'achievement',
      icon: '🏆',
      title: 'Consistency Champion!',
      message: `You have ${highStreakHabits.length} habit${highStreakHabits.length > 1 ? 's' : ''} with 14+ day streaks!`,
      color: 'violet'
    });
  }
  
  // Early morning vs evening pattern (based on typical habit times)
  const weekdayRate = dayRates.slice(1, 6).reduce((sum, d) => sum + d.rate, 0) / 5;
  const weekendRate = (dayRates[0].rate + dayRates[6].rate) / 2;
  
  if (weekdayRate > weekendRate + 15) {
    insights.push({
      type: 'pattern',
      icon: '💼',
      title: 'Weekday Warrior',
      message: `You're more productive on weekdays. Consider lighter weekend goals!`,
      color: 'ocean'
    });
  } else if (weekendRate > weekdayRate + 15) {
    insights.push({
      type: 'pattern',
      icon: '🌴',
      title: 'Weekend Champion',
      message: `Weekends are your prime time! Try to bring that energy to weekdays.`,
      color: 'ocean'
    });
  }
  
  return insights.slice(0, 5); // Limit to 5 insights
};

// Progress storytelling
export const getProgressStory = (habits) => {
  if (habits.length === 0) return null;
  
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  
  const completedToday = habits.filter(h => 
    h.completedDates.includes(todayStr)
  ).length;
  
  const totalStreak = habits.reduce((acc, h) => 
    acc + calculateStreak(h.completedDates), 0
  );
  
  const avgCompletionRate = habits.reduce((acc, h) => 
    acc + getCompletionRate(h.completedDates, h.createdAt), 0
  ) / habits.length;
  
  // Create a story based on current state
  if (completedToday === habits.length && habits.length > 0) {
    return {
      emoji: '🌟',
      headline: 'Perfect Day!',
      story: `You've completed all ${habits.length} habits today. You're building unstoppable momentum!`,
      mood: 'celebration'
    };
  }
  
  if (totalStreak >= habits.length * 7) {
    return {
      emoji: '🔥',
      headline: 'On Fire!',
      story: `With ${totalStreak} total streak days across your habits, you're absolutely crushing it!`,
      mood: 'fire'
    };
  }
  
  if (avgCompletionRate >= 80) {
    return {
      emoji: '💪',
      headline: 'Consistency Master',
      story: `Your ${Math.round(avgCompletionRate)}% average completion rate shows real dedication. Amazing work!`,
      mood: 'strong'
    };
  }
  
  if (avgCompletionRate >= 50) {
    return {
      emoji: '📈',
      headline: 'Making Progress',
      story: `You're at ${Math.round(avgCompletionRate)}% completion. Every small step counts!`,
      mood: 'progress'
    };
  }
  
  return {
    emoji: '🌱',
    headline: 'Growing Strong',
    story: `Every journey starts somewhere. Complete one habit today and build from there!`,
    mood: 'growing'
  };
};

export const habitIcons = [
  '🏃', '💪', '📚', '🧘', '💧', '🥗', '😴', '🎯',
  '✍️', '🎨', '🎸', '💻', '🧠', '🌅', '🚭', '💊',
  '🧹', '💰', '📱', '🌱', '🎵', '☕', '🚶', '🧪'
];

export const habitColors = [
  { name: 'ember', class: 'bg-ember-500', hex: '#ff7d10' },
  { name: 'sage', class: 'bg-sage-500', hex: '#22c55e' },
  { name: 'ocean', class: 'bg-ocean-500', hex: '#3b82f6' },
  { name: 'violet', class: 'bg-violet-500', hex: '#8b5cf6' },
  { name: 'rose', class: 'bg-rose-500', hex: '#f43f5e' },
  { name: 'amber', class: 'bg-amber-500', hex: '#f59e0b' },
];
