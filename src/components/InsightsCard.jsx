import { motion } from 'framer-motion';
import { Lightbulb, X } from 'lucide-react';
import { getInsights } from '../utils/habitUtils';

export default function InsightsCard({ habits, onDismiss }) {
  const insights = getInsights(habits);
  
  if (insights.length === 0) return null;

  const colorMap = {
    sage: 'bg-sage-100 dark:bg-sage-500/20 border-sage-200 dark:border-sage-500/30',
    ember: 'bg-ember-100 dark:bg-ember-500/20 border-ember-200 dark:border-ember-500/30',
    amber: 'bg-amber-100 dark:bg-amber-500/20 border-amber-200 dark:border-amber-500/30',
    violet: 'bg-violet-100 dark:bg-violet-500/20 border-violet-200 dark:border-violet-500/30',
    ocean: 'bg-ocean-100 dark:bg-ocean-500/20 border-ocean-200 dark:border-ocean-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400 to-violet-600 
                      flex items-center justify-center">
          <Lightbulb className="w-4 h-4 text-white" />
        </div>
        <h3 className="font-display font-bold text-obsidian-900 dark:text-white">
          AI Insights
        </h3>
      </div>
      
      <div className="grid gap-3 sm:grid-cols-2">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl border ${colorMap[insight.color] || colorMap.sage}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{insight.icon}</span>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-obsidian-900 dark:text-white text-sm mb-0.5">
                  {insight.title}
                </h4>
                <p className="text-sm text-obsidian-600 dark:text-obsidian-300 leading-relaxed">
                  {insight.message}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
