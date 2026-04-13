import { motion } from 'framer-motion';
import { getProgressStory } from '../utils/habitUtils';

export default function ProgressStory({ habits }) {
  const story = getProgressStory(habits);
  
  if (!story) return null;

  const moodStyles = {
    celebration: 'from-amber-400 to-orange-500',
    fire: 'from-ember-400 to-rose-500',
    strong: 'from-sage-400 to-emerald-500',
    progress: 'from-ocean-400 to-cyan-500',
    growing: 'from-violet-400 to-purple-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-2xl mb-8"
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-r ${moodStyles[story.mood]} opacity-10`} />
      
      {/* Content */}
      <div className="relative p-6 flex items-center gap-4">
        <motion.span 
          className="text-5xl"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            repeatType: 'reverse'
          }}
        >
          {story.emoji}
        </motion.span>
        <div>
          <h3 className={`text-xl font-display font-bold bg-gradient-to-r ${moodStyles[story.mood]} 
                        bg-clip-text text-transparent`}>
            {story.headline}
          </h3>
          <p className="text-obsidian-600 dark:text-obsidian-300 mt-1">
            {story.story}
          </p>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${moodStyles[story.mood]} 
                      opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`} />
    </motion.div>
  );
}
