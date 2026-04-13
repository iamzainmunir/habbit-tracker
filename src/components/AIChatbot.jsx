import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles, Plus, Check } from 'lucide-react';
import { format } from 'date-fns';
import { calculateStreak, getCompletionRate, getInsights, habitIcons, habitColors } from '../utils/habitUtils';

// Extract habit name from user message
const extractHabitFromMessage = (message) => {
  const trimmedMessage = message.trim();
  
  // Patterns to detect habit creation - more flexible matching
  const patterns = [
    /add\s+(?:a\s+)?habit\s+(?:for\s+|to\s+|called\s+|named\s+)?(.+)/i,
    /create\s+(?:a\s+)?habit\s+(?:for\s+|to\s+|called\s+|named\s+)?(.+)/i,
    /add\s+(.+?)\s+habit/i,
    /create\s+(.+?)\s+habit/i,
    /new\s+habit\s*[:\s]+(.+)/i,
    /track\s+(?:my\s+)?(.+)/i,
    /i\s+want\s+to\s+(?:start\s+|begin\s+)?(?:tracking\s+)?(.+)/i,
    /help\s+me\s+(?:track|build|start)\s+(.+)/i,
    /^habit\s+(?:for\s+)?(.+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = trimmedMessage.match(pattern);
    if (match && match[1]) {
      let habitName = match[1].trim();
      // Remove trailing punctuation and common words
      habitName = habitName.replace(/[.!?,;:]+$/, '').trim();
      habitName = habitName.replace(/^(a|an|the|my)\s+/i, '').trim();
      // Capitalize first letter
      if (habitName.length > 0) {
        habitName = habitName.charAt(0).toUpperCase() + habitName.slice(1);
        return habitName;
      }
    }
  }
  
  return null;
};

// Suggest an icon based on habit name
const suggestIcon = (habitName) => {
  const lower = habitName.toLowerCase();
  
  if (lower.includes('run') || lower.includes('jog') || lower.includes('exercise')) return '🏃';
  if (lower.includes('gym') || lower.includes('workout') || lower.includes('strength')) return '💪';
  if (lower.includes('read') || lower.includes('book') || lower.includes('study')) return '📚';
  if (lower.includes('meditat') || lower.includes('yoga') || lower.includes('mindful')) return '🧘';
  if (lower.includes('water') || lower.includes('hydrat') || lower.includes('drink')) return '💧';
  if (lower.includes('eat') || lower.includes('diet') || lower.includes('healthy') || lower.includes('vegetable')) return '🥗';
  if (lower.includes('sleep') || lower.includes('bed') || lower.includes('rest')) return '😴';
  if (lower.includes('write') || lower.includes('journal') || lower.includes('diary')) return '✍️';
  if (lower.includes('art') || lower.includes('draw') || lower.includes('paint')) return '🎨';
  if (lower.includes('music') || lower.includes('guitar') || lower.includes('piano') || lower.includes('instrument')) return '🎸';
  if (lower.includes('code') || lower.includes('program') || lower.includes('computer')) return '💻';
  if (lower.includes('learn') || lower.includes('brain') || lower.includes('mental')) return '🧠';
  if (lower.includes('wake') || lower.includes('morning') || lower.includes('early')) return '🌅';
  if (lower.includes('smoke') || lower.includes('quit') || lower.includes('stop')) return '🚭';
  if (lower.includes('medicine') || lower.includes('pill') || lower.includes('vitamin')) return '💊';
  if (lower.includes('clean') || lower.includes('tidy') || lower.includes('organize')) return '🧹';
  if (lower.includes('save') || lower.includes('money') || lower.includes('budget')) return '💰';
  if (lower.includes('phone') || lower.includes('screen') || lower.includes('digital')) return '📱';
  if (lower.includes('plant') || lower.includes('garden') || lower.includes('nature')) return '🌱';
  if (lower.includes('walk') || lower.includes('step')) return '🚶';
  if (lower.includes('coffee') || lower.includes('tea')) return '☕';
  
  return '🎯';
};

// Suggest a color based on habit type
const suggestColor = (habitName) => {
  const lower = habitName.toLowerCase();
  
  if (lower.includes('exercise') || lower.includes('workout') || lower.includes('gym') || lower.includes('run')) return 'ember';
  if (lower.includes('health') || lower.includes('eat') || lower.includes('water') || lower.includes('sleep')) return 'sage';
  if (lower.includes('read') || lower.includes('learn') || lower.includes('study')) return 'ocean';
  if (lower.includes('meditat') || lower.includes('mindful') || lower.includes('mental')) return 'violet';
  if (lower.includes('quit') || lower.includes('stop') || lower.includes('avoid')) return 'rose';
  
  const colors = ['ember', 'sage', 'ocean', 'violet', 'amber'];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Check if user wants to view habits
const wantsToViewHabits = (message) => {
  const lower = message.toLowerCase().trim();
  
  // Skip if asking for pending or completed specifically (handled separately)
  if (lower.includes('pending') || lower.includes('remaining') || 
      lower.includes('completed') || lower.includes('done today')) {
    return false;
  }
  
  // Direct matches (handle both singular and plural)
  const directPatterns = [
    'list my habit', 'list habits', 'list my habits',
    'show my habit', 'show habits', 'show my habits',
    'view my habit', 'view habits', 'view my habits',
    'my habits', 'all habits', 'all my habits',
    'what are my habit', 'what are my habits',
    'which habit', 'which habits',
    'what habits', 'what habit',
    'habits today', 'today habits'
  ];
  
  if (directPatterns.some(p => lower.includes(p))) {
    return true;
  }
  
  // Pattern matches
  const viewPatterns = ['show', 'view', 'list', 'see', 'display', 'tell me'];
  const habitPatterns = ['habit', 'habits', 'tracking', 'them'];
  
  return viewPatterns.some(p => lower.includes(p)) && 
         habitPatterns.some(p => lower.includes(p));
};

// Check if user wants pending habits
const wantsPendingHabits = (message) => {
  const lower = message.toLowerCase().trim();
  return lower.includes('pending') || lower.includes('remaining') || 
         lower.includes('left today') || lower.includes('not done') ||
         lower.includes('incomplete') || lower.includes('yet to do') ||
         (lower.includes('what') && lower.includes('left'));
};

// Check if user wants completed habits
const wantsCompletedHabits = (message) => {
  const lower = message.toLowerCase().trim();
  return (lower.includes('completed') && lower.includes('habit')) ||
         (lower.includes('done') && lower.includes('today')) ||
         lower.includes('finished today') || 
         (lower.includes('what') && lower.includes('completed')) ||
         (lower.includes('which') && lower.includes('completed'));
};

// Generate habits list response
const generateHabitsListResponse = (habits) => {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  
  if (habits.length === 0) {
    return {
      text: "📋 You don't have any habits yet!\n\nLet's create your first one! Just say:\n• \"Add a habit for morning exercise\"\n• \"Create a reading habit\"\n• \"Track my meditation\"\n\nWhat would you like to track?",
      showHabits: false
    };
  }
  
  const completedHabits = habits.filter(h => h.completedDates.includes(todayStr));
  const pendingHabits = habits.filter(h => !h.completedDates.includes(todayStr));
  
  let response = `📋 **Your Habits** (${habits.length} total)\n\n`;
  
  // Show completed habits
  if (completedHabits.length > 0) {
    response += `✅ **Completed Today** (${completedHabits.length})\n`;
    completedHabits.forEach(habit => {
      const streak = calculateStreak(habit.completedDates);
      response += `   ${habit.icon} ${habit.name} • 🔥 ${streak} day streak\n`;
    });
    response += `\n`;
  }
  
  // Show pending habits
  if (pendingHabits.length > 0) {
    response += `⏳ **Pending Today** (${pendingHabits.length})\n`;
    pendingHabits.forEach(habit => {
      const streak = calculateStreak(habit.completedDates);
      response += `   ${habit.icon} ${habit.name} • 🔥 ${streak} day streak\n`;
    });
    response += `\n`;
  }
  
  // Summary
  if (pendingHabits.length === 0) {
    response += `🎉 Amazing! You've completed all habits for today!`;
  } else if (completedHabits.length > 0) {
    response += `💪 Great progress! ${pendingHabits.length} habit${pendingHabits.length > 1 ? 's' : ''} left to go!`;
  } else {
    response += `💪 Let's get started! ${pendingHabits.length} habit${pendingHabits.length > 1 ? 's' : ''} waiting for you!`;
  }
  
  return { text: response, showHabits: true };
};

// AI responses based on context
const generateAIResponse = (message, habits, userName, onAddHabit) => {
  const lowerMessage = message.toLowerCase();
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const completedToday = habits.filter(h => h.completedDates.includes(todayStr)).length;
  const totalHabits = habits.length;
  const insights = getInsights(habits);
  
  // PRIORITY 1: Check for pending habits
  if (wantsPendingHabits(message)) {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const pendingHabits = habits.filter(h => !h.completedDates.includes(todayStr));
    
    if (habits.length === 0) {
      return { text: "📋 You don't have any habits yet!\n\nUse the **\"Add new habit\"** button below or say \"Add a habit for...\"" };
    }
    
    if (pendingHabits.length === 0) {
      return { text: "🎉 **All Done!**\n\nYou've completed all your habits for today! Amazing work! 💪" };
    }
    
    let response = `⏳ **Pending Today** (${pendingHabits.length})\n\n`;
    pendingHabits.forEach(habit => {
      const streak = calculateStreak(habit.completedDates);
      response += `${habit.icon} **${habit.name}** • 🔥 ${streak} day streak\n`;
    });
    response += `\n💪 Let's knock these out!`;
    return { text: response };
  }
  
  // PRIORITY 2: Check for completed habits
  if (wantsCompletedHabits(message)) {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const completedHabits = habits.filter(h => h.completedDates.includes(todayStr));
    
    if (habits.length === 0) {
      return { text: "📋 You don't have any habits yet!\n\nUse the **\"Add new habit\"** button below or say \"Add a habit for...\"" };
    }
    
    if (completedHabits.length === 0) {
      return { text: "⏳ **No habits completed yet today**\n\nYou have " + habits.length + " habit" + (habits.length > 1 ? "s" : "") + " waiting. Let's get started! 🚀" };
    }
    
    let response = `✅ **Completed Today** (${completedHabits.length}/${habits.length})\n\n`;
    completedHabits.forEach(habit => {
      const streak = calculateStreak(habit.completedDates);
      response += `${habit.icon} **${habit.name}** ✓ • 🔥 ${streak} day streak\n`;
    });
    
    const remaining = habits.length - completedHabits.length;
    if (remaining > 0) {
      response += `\n📌 ${remaining} more to go!`;
    } else {
      response += `\n🌟 Perfect! All habits done!`;
    }
    return { text: response };
  }
  
  // PRIORITY 3: Check if user wants to view all habits
  if (wantsToViewHabits(message)) {
    return generateHabitsListResponse(habits);
  }
  
  // PRIORITY 4: Check if user wants to add a habit
  const wantsToAdd = (lowerMessage.includes('add') && lowerMessage.includes('habit')) || 
                     (lowerMessage.includes('create') && lowerMessage.includes('habit')) || 
                     lowerMessage.includes('track my') ||
                     lowerMessage.includes('track a') ||
                     lowerMessage.includes('new habit for') ||
                     lowerMessage.includes('start tracking');
  
  if (wantsToAdd) {
    const habitName = extractHabitFromMessage(message);
    if (habitName && onAddHabit) {
      const icon = suggestIcon(habitName);
      const color = suggestColor(habitName);
      
      // Call the callback to add the habit
      onAddHabit({ name: habitName, icon, color });
      
      return {
        text: `✨ Done! I've added "${habitName}" ${icon} to your habits!\n\nI picked the ${color} color theme for you. You can edit it anytime by clicking the ⋮ menu on the habit card.\n\nReady to start your streak? 🔥`,
        habitAdded: { name: habitName, icon, color }
      };
    } else {
      // User wants to add a habit but didn't specify which one
      return {
        text: `📝 What habit would you like to add?\n\n**Popular habits that change lives:**\n\n🌅 Wake up early\n💪 Exercise daily\n📚 Read 30 minutes\n🧘 Meditate\n💧 Drink 8 glasses of water\n📱 No phone first hour\n🙏 Evening reflection\n\n**Just type the habit name** and I'll add it for you!`,
        awaitingHabitName: true
      };
    }
  }
  
  // Greeting
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    const greetings = [
      `Hey ${userName || 'there'}! 👋 Ready to crush your habits today?\n\n💡 I can:\n• Add habits: "Add a habit for exercise"\n• Show habits: "Show my habits"\n• Track progress: "How am I doing?"`,
      `Hello ${userName || 'friend'}! How can I help you stay on track?\n\nTry saying "Show my habits" or "Add a habit for reading"!`,
      `Hi there! 🌟 You've got ${totalHabits - completedToday} habits waiting for you today!\n\nNeed a new habit? Just tell me what you want to track!`,
    ];
    return { text: greetings[Math.floor(Math.random() * greetings.length)] };
  }
  
  // Progress inquiry
  if (lowerMessage.includes('progress') || lowerMessage.includes('how am i doing') || lowerMessage.includes('stats')) {
    if (totalHabits === 0) {
      return { text: "You haven't added any habits yet! Tell me what you want to track - for example:\n\n• \"Add a habit for exercise\"\n• \"Create habit for reading\"\n• \"Track my meditation\"\n\nI'll set it up for you! 🎯" };
    }
    
    const avgCompletion = Math.round(
      habits.reduce((acc, h) => acc + getCompletionRate(h.completedDates, h.createdAt), 0) / totalHabits
    );
    const totalStreaks = habits.reduce((acc, h) => acc + calculateStreak(h.completedDates), 0);
    
    return { text: `📊 Here's your progress:\n\n• ${completedToday}/${totalHabits} habits done today\n• ${avgCompletion}% average completion rate\n• ${totalStreaks} total streak days\n\n${avgCompletion >= 70 ? "You're doing amazing! Keep it up! 🔥" : "Every day is a chance to improve. You got this! 💪"}\n\n💡 Say "Show my habits" to see the full list!` };
  }
  
  // Motivation
  if (lowerMessage.includes('motivat') || lowerMessage.includes('encourage') || lowerMessage.includes('inspire')) {
    const motivations = [
      "Remember: small daily improvements lead to stunning results. You're building something incredible! 🌱",
      "Every habit you complete is a vote for the person you want to become. Keep voting! 🗳️",
      "The secret to success? It's not about being perfect, it's about being consistent. And you're doing great! ⭐",
      "Think about how far you've come, not how far you have to go. Progress is progress! 🚀",
      "Your only competition is who you were yesterday. Keep pushing forward! 💪",
    ];
    return { text: motivations[Math.floor(Math.random() * motivations.length)] };
  }
  
  // Tips
  if (lowerMessage.includes('tip') || lowerMessage.includes('advice') || lowerMessage.includes('suggest')) {
    const tips = [
      "💡 Stack your habits! Attach a new habit to an existing one. Example: 'After I brush my teeth, I will meditate for 5 minutes.'\n\nWant me to add a meditation habit? Just say \"Add habit for meditation\"!",
      "💡 Start ridiculously small. Want to read more? Start with just one page. Success builds momentum!\n\nI can help you track it - say \"Create habit for reading\"!",
      "💡 Track your streak visibly. Seeing that number grow is powerful motivation!\n\nSay \"Show my habits\" to see your current streaks!",
      "💡 Don't break the chain! Missing one day is okay, but never miss twice.",
      "💡 Celebrate small wins! Every completed habit deserves a mental high-five. 🙌",
    ];
    return { text: tips[Math.floor(Math.random() * tips.length)] };
  }
  
  // Streak questions
  if (lowerMessage.includes('streak')) {
    if (totalHabits === 0) {
      return { text: "Add some habits first, and I'll help you build amazing streaks! 🔥\n\nJust say \"Add a habit for...\" followed by what you want to track!" };
    }
    
    const sortedByStreak = [...habits].sort((a, b) => 
      calculateStreak(b.completedDates) - calculateStreak(a.completedDates)
    );
    
    let response = "🔥 **Your Streaks:**\n\n";
    sortedByStreak.forEach(h => {
      const streak = calculateStreak(h.completedDates);
      response += `${h.icon} ${h.name}: ${streak} day${streak !== 1 ? 's' : ''}\n`;
    });
    
    const bestStreak = calculateStreak(sortedByStreak[0]?.completedDates || []);
    if (bestStreak >= 7) {
      response += `\n🏆 Amazing! ${sortedByStreak[0].name} is on fire!`;
    }
    
    return { text: response };
  }
  
  // Today's status
  if (lowerMessage.includes('today') || lowerMessage.includes('what should') || lowerMessage.includes('pending')) {
    if (totalHabits === 0) {
      return { text: "You don't have any habits yet! Would you like me to help you create some?\n\nJust say things like:\n• \"Add habit for morning workout\"\n• \"Track my water intake\"\n• \"Create a reading habit\"" };
    }
    
    const pendingHabits = habits.filter(h => !h.completedDates.includes(todayStr));
    const completedHabits = habits.filter(h => h.completedDates.includes(todayStr));
    
    if (pendingHabits.length === 0) {
      return { text: `🎉 Amazing! You've completed all ${totalHabits} habits for today!\n\n${completedHabits.map(h => `✅ ${h.icon} ${h.name}`).join('\n')}\n\nTake a moment to celebrate this win!` };
    }
    
    let response = `📋 **Today's Status:**\n\n`;
    
    if (completedHabits.length > 0) {
      response += `✅ **Completed (${completedHabits.length}):**\n`;
      completedHabits.forEach(h => {
        response += `   ${h.icon} ${h.name}\n`;
      });
      response += '\n';
    }
    
    response += `⏳ **Pending (${pendingHabits.length}):**\n`;
    pendingHabits.forEach(h => {
      response += `   ${h.icon} ${h.name}\n`;
    });
    
    response += `\nWhich one will you tackle first? 💪`;
    
    return { text: response };
  }
  
  // Habit suggestions
  if (lowerMessage.includes('habit idea') || lowerMessage.includes('what habit') || lowerMessage.includes('recommend')) {
    return { text: "Here are some powerful habit ideas:\n\n🧘 5-min morning meditation\n📚 Read 10 pages daily\n💧 Drink 8 glasses of water\n🏃 10-minute walk\n✍️ Write 3 gratitudes\n😴 Sleep by 10pm\n\nWant me to add any of these? Just say \"Add habit for [name]\"!" };
  }
  
  // Help command
  if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
    return { 
      text: `🤖 **I'm Stride AI, your habit coach!**\n\nHere's what I can do:\n\n📝 **Add habits:**\n   "Add a habit for exercise"\n   "Create reading habit"\n   "Track my meditation"\n\n👀 **View habits:**\n   "Show my habits"\n   "List all habits"\n   "What are my habits?"\n\n📊 **Check progress:**\n   "How am I doing?"\n   "Show my streaks"\n   "What's pending today?"\n\n💪 **Get motivated:**\n   "Give me motivation"\n   "Any tips?"\n\nWhat would you like to do?`
    };
  }
  
  // Default responses
  const defaults = [
    `I'm here to help you build better habits! 🎯\n\nTry saying:\n• "Add a habit for exercise"\n• "Show my habits"\n• "How am I doing?"\n• "Give me motivation"`,
    `Not sure what you mean, but I'm your habit coach! 💪\n\n💡 Try "Show my habits" to see your list, or "Add a habit for..." to create a new one!`,
    `I can help you with:\n• Adding habits → "Add habit for reading"\n• Viewing habits → "Show my habits"\n• Progress → "How am I doing?"\n• Motivation → "Motivate me"\n\nWhat would you like?`,
  ];
  return { text: defaults[Math.floor(Math.random() * defaults.length)] };
};

export default function AIChatbot({ habits, userName, onAddHabit }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'assistant',
      content: `Hey there! 👋 I'm Stride AI, your habit coach.\n\nUse the **quick buttons below** or type naturally:\n\n📋 List habits • ⏳ Pending • ✅ Completed\n➕ Add new habit • 📊 My progress\n\nHow can I help you today?`,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastAddedHabit, setLastAddedHabit] = useState(null);
  const [awaitingHabitName, setAwaitingHabitName] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Save the message before clearing input
    const userMessageText = input.trim();

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 400));

    let response;
    
    // Check if we're waiting for a habit name (user just typing the name after suggestions)
    if (awaitingHabitName && onAddHabit) {
      // Check if this looks like a habit name (not a command)
      const lowerText = userMessageText.toLowerCase();
      const isCommand = lowerText.includes('show') || lowerText.includes('list') || 
                       lowerText.includes('help') || lowerText.includes('how am i') ||
                       lowerText.includes('cancel') || lowerText.includes('nevermind') ||
                       lowerText.includes('never mind');
      
      if (!isCommand && userMessageText.length >= 2) {
        // Treat it as a habit name
        const habitName = userMessageText.charAt(0).toUpperCase() + userMessageText.slice(1);
        const icon = suggestIcon(habitName);
        const color = suggestColor(habitName);
        
        onAddHabit({ name: habitName, icon, color });
        setAwaitingHabitName(false);
        
        response = {
          text: `✨ Done! I've added "${habitName}" ${icon} to your habits!\n\nI picked the ${color} color theme for you. You can edit it anytime by clicking the ⋮ menu on the habit card.\n\nReady to start your streak? 🔥`,
          habitAdded: { name: habitName, icon, color }
        };
      } else if (isCommand) {
        setAwaitingHabitName(false);
        response = generateAIResponse(userMessageText, habits, userName, onAddHabit);
      } else {
        response = { text: "Please enter a valid habit name (at least 2 characters). What would you like to track?" };
      }
    } else {
      // Normal response generation
      response = generateAIResponse(userMessageText, habits, userName, onAddHabit);
      
      // Check if AI is now waiting for a habit name
      if (response.awaitingHabitName) {
        setAwaitingHabitName(true);
      }
    }
    
    if (response.habitAdded) {
      setLastAddedHabit(response.habitAdded);
      setTimeout(() => setLastAddedHabit(null), 3000);
    }

    const aiResponse = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.text || response,
      timestamp: new Date(),
      habitAdded: response.habitAdded,
    };

    setIsTyping(false);
    setMessages(prev => [...prev, aiResponse]);
  };

  const quickActions = [
    { label: "List my habits", icon: "📋", command: "list my habits" },
    { label: "Pending today", icon: "⏳", command: "show pending habits" },
    { label: "Completed today", icon: "✅", command: "show completed habits" },
    { label: "Add new habit", icon: "➕", command: "add new habit" },
    { label: "My progress", icon: "📊", command: "how am I doing?" },
  ];

  // Handle quick action click - sends the command directly
  const handleQuickAction = async (command) => {
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: command,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 300));

    let response;
    
    // Handle specific quick action commands
    if (command === "show pending habits") {
      response = generatePendingHabitsResponse(habits);
    } else if (command === "show completed habits") {
      response = generateCompletedHabitsResponse(habits);
    } else {
      response = generateAIResponse(command, habits, userName, onAddHabit);
      if (response.awaitingHabitName) {
        setAwaitingHabitName(true);
      }
    }
    
    if (response.habitAdded) {
      setLastAddedHabit(response.habitAdded);
      setTimeout(() => setLastAddedHabit(null), 3000);
    }

    const aiResponse = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.text || response,
      timestamp: new Date(),
      habitAdded: response.habitAdded,
    };

    setIsTyping(false);
    setMessages(prev => [...prev, aiResponse]);
  };

  // Generate pending habits response
  const generatePendingHabitsResponse = (habits) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const pendingHabits = habits.filter(h => !h.completedDates.includes(todayStr));
    
    if (habits.length === 0) {
      return { text: "📋 You don't have any habits yet!\n\nClick **\"Add new habit\"** below to create your first one!" };
    }
    
    if (pendingHabits.length === 0) {
      return { text: "🎉 **All Done!**\n\nYou've completed all your habits for today! Amazing work! 💪\n\nEnjoy your achievement and rest well!" };
    }
    
    let response = `⏳ **Pending Today** (${pendingHabits.length})\n\n`;
    pendingHabits.forEach(habit => {
      const streak = calculateStreak(habit.completedDates);
      response += `${habit.icon} **${habit.name}**\n`;
      response += `   🔥 ${streak} day streak\n\n`;
    });
    
    response += `💪 Let's knock these out! Which one first?`;
    return { text: response };
  };

  // Generate completed habits response
  const generateCompletedHabitsResponse = (habits) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const completedHabits = habits.filter(h => h.completedDates.includes(todayStr));
    
    if (habits.length === 0) {
      return { text: "📋 You don't have any habits yet!\n\nClick **\"Add new habit\"** below to create your first one!" };
    }
    
    if (completedHabits.length === 0) {
      return { text: "⏳ **No habits completed yet today**\n\nYou have " + habits.length + " habit" + (habits.length > 1 ? "s" : "") + " waiting for you.\n\nLet's get started! 🚀" };
    }
    
    let response = `✅ **Completed Today** (${completedHabits.length}/${habits.length})\n\n`;
    completedHabits.forEach(habit => {
      const streak = calculateStreak(habit.completedDates);
      response += `${habit.icon} **${habit.name}** ✓\n`;
      response += `   🔥 ${streak} day streak\n\n`;
    });
    
    const remaining = habits.length - completedHabits.length;
    if (remaining > 0) {
      response += `\n📌 ${remaining} more to go today!`;
    } else {
      response += `\n🌟 Perfect day! All habits completed!`;
    }
    
    return { text: response };
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full 
                   bg-gradient-to-r from-violet-500 to-purple-600 
                   text-white shadow-lg shadow-violet-500/40
                   flex items-center justify-center z-40
                   hover:shadow-violet-500/60 transition-shadow"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full 
                       flex items-center justify-center text-[10px] font-bold">
          AI
        </span>
      </motion.button>

      {/* Habit Added Toast */}
      <AnimatePresence>
        {lastAddedHabit && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50
                     bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg
                     flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">Habit Added!</p>
              <p className="text-sm text-emerald-100">{lastAddedHabit.icon} {lastAddedHabit.name}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-[400px] max-w-[calc(100vw-48px)] h-[550px] 
                       bg-white dark:bg-obsidian-900 rounded-2xl shadow-2xl 
                       border border-obsidian-200 dark:border-obsidian-800
                       flex flex-col overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 
                          bg-gradient-to-r from-violet-500 to-purple-600 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold">Stride AI</h3>
                  <p className="text-xs text-violet-200">Your habit coach</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400'
                  }`}>
                    {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`max-w-[80%] p-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-emerald-500 text-white rounded-tr-sm'
                      : 'bg-obsidian-100 dark:bg-obsidian-800 text-obsidian-900 dark:text-white rounded-tl-sm'
                  }`}>
                    <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                    {message.habitAdded && (
                      <div className="mt-2 pt-2 border-t border-white/20 flex items-center gap-2">
                        <span className="text-lg">{message.habitAdded.icon}</span>
                        <span className="text-xs font-medium">Added to your habits</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-500/20 
                                flex items-center justify-center text-violet-600 dark:text-violet-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-obsidian-100 dark:bg-obsidian-800 p-3 rounded-2xl rounded-tl-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-obsidian-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-obsidian-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-obsidian-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-2 flex gap-2 overflow-x-auto border-t border-obsidian-100 dark:border-obsidian-800">
              {quickActions.map((q) => (
                <motion.button
                  key={q.label}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleQuickAction(q.command)}
                  disabled={isTyping}
                  className="px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap
                           bg-obsidian-100 dark:bg-obsidian-800 text-obsidian-600 dark:text-obsidian-300
                           hover:bg-violet-100 dark:hover:bg-violet-500/20 
                           hover:text-violet-600 dark:hover:text-violet-300 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center gap-1.5"
                >
                  <span>{q.icon}</span>
                  {q.label}
                </motion.button>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-obsidian-200 dark:border-obsidian-800">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-2.5 bg-obsidian-100 dark:bg-obsidian-800 
                           rounded-xl text-obsidian-900 dark:text-white 
                           placeholder-obsidian-400 dark:placeholder-obsidian-500
                           focus:outline-none focus:ring-2 focus:ring-violet-500/50 
                           text-sm font-medium"
                />
                <motion.button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2.5 rounded-xl bg-violet-500 text-white
                           disabled:opacity-50 disabled:cursor-not-allowed
                           hover:bg-violet-600 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
