import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Mic, MicOff, ArrowRight, Check, Calendar } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { habitIcons, habitColors } from '../utils/habitUtils';

export default function AddHabitModal({ isOpen, onClose, onSave, editHabit }) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [color, setColor] = useState('ember');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setVoiceSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setName(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (editHabit) {
      setName(editHabit.name);
      setIcon(editHabit.icon);
      setColor(editHabit.color);
      setStartDate(editHabit.createdAt ? format(new Date(editHabit.createdAt), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
    } else {
      setName('');
      setIcon('🎯');
      setColor('ember');
      setStartDate(format(new Date(), 'yyyy-MM-dd'));
    }
  }, [editHabit, isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const toggleVoice = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setName('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!name.trim()) return;
    
    // Stop listening if still active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    
    onSave({ name: name.trim(), icon, color, startDate });
    onClose();
  };

  const colorStyles = {
    ember: { bg: 'bg-ember-500', ring: 'ring-ember-500', shadow: 'shadow-ember-500/30' },
    sage: { bg: 'bg-sage-500', ring: 'ring-sage-500', shadow: 'shadow-sage-500/30' },
    ocean: { bg: 'bg-ocean-500', ring: 'ring-ocean-500', shadow: 'shadow-ocean-500/30' },
    violet: { bg: 'bg-violet-500', ring: 'ring-violet-500', shadow: 'shadow-violet-500/30' },
    rose: { bg: 'bg-rose-500', ring: 'ring-rose-500', shadow: 'shadow-rose-500/30' },
    amber: { bg: 'bg-amber-500', ring: 'ring-amber-500', shadow: 'shadow-amber-500/30' },
  };

  const selectedColorStyle = colorStyles[color] || colorStyles.ember;

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
            className="fixed inset-0 bg-obsidian-950/60 backdrop-blur-sm z-40"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', bounce: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-md pointer-events-auto bg-white dark:bg-obsidian-900 rounded-3xl p-6 shadow-2xl
                          border border-obsidian-200 dark:border-obsidian-800
                          max-h-[85vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl ${selectedColorStyle.bg} 
                                flex items-center justify-center shadow-lg ${selectedColorStyle.shadow}
                                transition-colors duration-300`}>
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold text-obsidian-900 dark:text-white">
                      {editHabit ? 'Edit Habit' : 'New Habit'}
                    </h2>
                    <p className="text-sm text-obsidian-500">Build something great</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2.5 rounded-xl text-obsidian-400 hover:text-obsidian-600 dark:hover:text-white 
                           hover:bg-obsidian-100 dark:hover:bg-obsidian-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Habit Name with Voice Input */}
                <div>
                  <label className="block text-sm font-semibold text-obsidian-700 dark:text-obsidian-300 mb-3">
                    What habit do you want to build?
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        ref={inputRef}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={isListening ? "Listening..." : "e.g., Morning Meditation"}
                        className={`w-full px-4 py-3.5 bg-obsidian-50 dark:bg-obsidian-800 
                                 border-2 ${isListening ? 'border-rose-500 dark:border-rose-500' : 'border-obsidian-200 dark:border-obsidian-700'}
                                 rounded-xl text-obsidian-900 dark:text-white 
                                 placeholder-obsidian-400 dark:placeholder-obsidian-500 
                                 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500
                                 transition-all font-medium text-base`}
                      />
                    </div>
                    
                    {/* Voice Button */}
                    {voiceSupported && (
                      <motion.button
                        type="button"
                        onClick={toggleVoice}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center
                                  transition-all duration-300 ${
                          isListening 
                            ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40 animate-pulse' 
                            : 'bg-obsidian-100 dark:bg-obsidian-800 text-obsidian-500 dark:text-obsidian-400 hover:bg-obsidian-200 dark:hover:bg-obsidian-700 hover:text-obsidian-700 dark:hover:text-white'
                        }`}
                      >
                        {isListening ? (
                          <div className="relative">
                            <MicOff className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping" />
                          </div>
                        ) : (
                          <Mic className="w-5 h-5" />
                        )}
                      </motion.button>
                    )}
                  </div>
                  
                  {voiceSupported && (
                    <p className={`mt-2 text-xs font-medium flex items-center gap-1.5 ${
                      isListening ? 'text-rose-500' : 'text-obsidian-400'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-rose-500 animate-pulse' : 'bg-obsidian-300 dark:bg-obsidian-600'}`} />
                      {isListening ? 'Listening... Tap mic to stop' : 'Tap mic for voice input'}
                    </p>
                  )}
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="block text-sm font-semibold text-obsidian-700 dark:text-obsidian-300 mb-3">
                    Pick an icon
                  </label>
                  <div className="grid grid-cols-8 gap-2">
                    {habitIcons.map((emoji) => (
                      <motion.button
                        key={emoji}
                        type="button"
                        onClick={() => setIcon(emoji)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl
                                   transition-all duration-200 ${
                          icon === emoji
                            ? `${selectedColorStyle.bg}/20 ring-2 ${selectedColorStyle.ring}`
                            : 'bg-obsidian-100 dark:bg-obsidian-800 hover:bg-obsidian-200 dark:hover:bg-obsidian-700'
                        }`}
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-sm font-semibold text-obsidian-700 dark:text-obsidian-300 mb-3">
                    Choose a color
                  </label>
                  <div className="flex gap-3">
                    {habitColors.map((c) => (
                      <motion.button
                        key={c.name}
                        type="button"
                        onClick={() => setColor(c.name)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`w-11 h-11 rounded-xl ${c.class} transition-all duration-200 
                                  flex items-center justify-center ${
                          color === c.name
                            ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-obsidian-900 ring-obsidian-400 dark:ring-white shadow-lg'
                            : 'opacity-60 hover:opacity-100'
                        }`}
                      >
                        {color === c.name && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', bounce: 0.5 }}
                          >
                            <Check className="w-5 h-5 text-white" strokeWidth={3} />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Start Date Picker */}
                {!editHabit && (
                  <div>
                    <label className="block text-sm font-semibold text-obsidian-700 dark:text-obsidian-300 mb-3">
                      Start tracking from
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-obsidian-400" />
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        max={format(new Date(), 'yyyy-MM-dd')}
                        min={format(subDays(new Date(), 365), 'yyyy-MM-dd')}
                        className="w-full pl-12 pr-4 py-3 bg-obsidian-50 dark:bg-obsidian-800 
                                 border-2 border-obsidian-200 dark:border-obsidian-700
                                 rounded-xl text-obsidian-900 dark:text-white 
                                 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500
                                 transition-all font-medium cursor-pointer
                                 [&::-webkit-calendar-picker-indicator]:dark:invert"
                      />
                    </div>
                    <p className="mt-2 text-xs text-obsidian-400">
                      Set an earlier date to backdate your habit start
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={!name.trim()}
                  whileHover={{ scale: name.trim() ? 1.02 : 1 }}
                  whileTap={{ scale: name.trim() ? 0.98 : 1 }}
                  className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg
                           flex items-center justify-center gap-2
                           transition-all duration-300 ${
                    name.trim()
                      ? `bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/30 hover:shadow-emerald-500/50`
                      : 'bg-obsidian-200 dark:bg-obsidian-800 text-obsidian-400 cursor-not-allowed'
                  }`}
                >
                  {editHabit ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Save Changes</span>
                    </>
                  ) : (
                    <>
                      <span>Create Habit</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
