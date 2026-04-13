import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { format, subDays } from 'date-fns';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import TodayView from './components/TodayView';
import CalendarView from './components/CalendarView';
import AnalyticsView from './components/AnalyticsView';
import WidgetView from './components/WidgetView';
import AddHabitModal from './components/AddHabitModal';
import AuthModal from './components/AuthModal';
import AIChatbot from './components/AIChatbot';
import { 
  createHabit, 
  toggleHabitCompletion 
} from './utils/habitUtils';

// Seed demo data for Zain Munir (run once)
const seedDemoData = () => {
  const DEMO_SEEDED_KEY = 'stride_demo_seeded_v2';
  
  // Check if already seeded
  if (localStorage.getItem(DEMO_SEEDED_KEY)) {
    return;
  }

  // Create demo user "Zain Munir"
  const demoUserId = 'demo_zain_munir';
  const users = JSON.parse(localStorage.getItem('stride_users') || '{}');
  
  if (!users[demoUserId]) {
    users[demoUserId] = {
      id: demoUserId,
      name: 'Zain Munir',
      email: 'zain@demo.com',
      password: 'demo123',
      createdAt: subDays(new Date(), 49).toISOString(),
      avatar: 'Z',
    };
    localStorage.setItem('stride_users', JSON.stringify(users));
  }

  // Generate 7 weeks of completion data
  const generateCompletedDates = (completionRate, weeksBack = 7) => {
    const dates = [];
    const today = new Date();
    const totalDays = weeksBack * 7;
    
    for (let i = 0; i < totalDays; i++) {
      const date = subDays(today, i);
      // Random completion based on rate, with some patterns
      const dayOfWeek = date.getDay();
      let adjustedRate = completionRate;
      
      // Weekends slightly lower for work habits
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        adjustedRate *= 0.7;
      }
      
      if (Math.random() < adjustedRate) {
        dates.push(format(date, 'yyyy-MM-dd'));
      }
    }
    return dates;
  };

  // Create demo habits with 7 weeks of data
  const demoHabits = [
    {
      id: 'demo_1',
      name: 'Morning Exercise',
      icon: '💪',
      color: 'ember',
      completedDates: generateCompletedDates(0.85),
      createdAt: subDays(new Date(), 49).toISOString(),
    },
    {
      id: 'demo_2',
      name: 'Read 30 Minutes',
      icon: '📚',
      color: 'ocean',
      completedDates: generateCompletedDates(0.75),
      createdAt: subDays(new Date(), 45).toISOString(),
    },
    {
      id: 'demo_3',
      name: 'Meditation',
      icon: '🧘',
      color: 'violet',
      completedDates: generateCompletedDates(0.65),
      createdAt: subDays(new Date(), 42).toISOString(),
    },
    {
      id: 'demo_4',
      name: 'Drink 8 Glasses Water',
      icon: '💧',
      color: 'sage',
      completedDates: generateCompletedDates(0.90),
      createdAt: subDays(new Date(), 49).toISOString(),
    },
    {
      id: 'demo_5',
      name: 'No Social Media Before Noon',
      icon: '📱',
      color: 'rose',
      completedDates: generateCompletedDates(0.55),
      createdAt: subDays(new Date(), 35).toISOString(),
    },
  ];

  // Save habits for demo user
  localStorage.setItem(`stride_habits_${demoUserId}`, JSON.stringify(demoHabits));
  
  // Set demo user as current user
  localStorage.setItem('stride_current_user', demoUserId);
  
  // Mark as seeded
  localStorage.setItem(DEMO_SEEDED_KEY, 'true');
  
  console.log('✅ Demo data seeded for Zain Munir with 7 weeks of habits!');
};

// Run seed on module load
seedDemoData();

function AppContent() {
  const [habits, setHabits] = useState([]);
  const [currentView, setCurrentView] = useState('today');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [focusMode, setFocusMode] = useState(false);
  
  const { user, getHabitsKey, isAuthenticated } = useAuth();

  // Load habits from localStorage on mount and when user changes
  useEffect(() => {
    const key = getHabitsKey();
    const stored = localStorage.getItem(key);
    setHabits(stored ? JSON.parse(stored) : []);
  }, [user, getHabitsKey]);

  // Save habits to localStorage whenever they change
  useEffect(() => {
    const key = getHabitsKey();
    if (habits.length > 0 || localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(habits));
    }
  }, [habits, getHabitsKey]);

  const handleAddHabit = () => {
    setEditingHabit(null);
    setIsModalOpen(true);
  };

  const handleEditHabit = (habit) => {
    setEditingHabit(habit);
    setIsModalOpen(true);
  };

  const handleSaveHabit = ({ name, icon, color, startDate }) => {
    if (editingHabit) {
      // Update existing habit
      setHabits(habits.map(h => 
        h.id === editingHabit.id 
          ? { ...h, name, icon, color }
          : h
      ));
    } else {
      // Create new habit with optional start date
      const newHabit = createHabit(name, icon, color, startDate);
      setHabits([...habits, newHabit]);
    }
    setEditingHabit(null);
  };

  // Function to add habit from AI chatbot
  const handleAIAddHabit = ({ name, icon, color }) => {
    const newHabit = createHabit(name, icon, color);
    setHabits(prev => [...prev, newHabit]);
  };

  const handleDeleteHabit = (habitId) => {
    setHabits(habits.filter(h => h.id !== habitId));
  };

  const handleToggleHabit = (habitId, date) => {
    setHabits(toggleHabitCompletion(habits, habitId, date));
  };

  const renderView = () => {
    switch (currentView) {
      case 'today':
        return (
          <TodayView
            habits={habits}
            onToggle={handleToggleHabit}
            onDelete={handleDeleteHabit}
            onEdit={handleEditHabit}
            focusMode={focusMode}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            habits={habits}
            onToggle={handleToggleHabit}
          />
        );
      case 'analytics':
        return (
          <AnalyticsView habits={habits} />
        );
      case 'widget':
        return (
          <WidgetView 
            habits={habits} 
            onToggle={handleToggleHabit}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-50 dark:bg-obsidian-950 transition-colors duration-300">
      {/* Background Effects - Light Mode */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden dark:hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-200/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-teal-200/30 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] 
                      bg-gradient-radial from-cyan-100/50 to-transparent rounded-full" />
      </div>

      {/* Background Effects - Dark Mode */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden hidden dark:block">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] 
                      bg-gradient-radial from-emerald-500/5 to-transparent rounded-full" />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <Header
          currentView={currentView}
          setCurrentView={setCurrentView}
          onAddHabit={handleAddHabit}
          focusMode={focusMode}
          setFocusMode={setFocusMode}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />
        
        <main>
          <AnimatePresence mode="wait">
            <div key={currentView}>
              {renderView()}
            </div>
          </AnimatePresence>
        </main>
      </div>

      {/* Add/Edit Habit Modal */}
      <AddHabitModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveHabit}
        editHabit={editingHabit}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* AI Chatbot */}
      <AIChatbot 
        habits={habits} 
        userName={user?.name}
        onAddHabit={handleAIAddHabit}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
