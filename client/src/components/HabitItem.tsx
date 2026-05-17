import React from 'react';
import { CheckCircle, Flame, Clock, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface HabitItemProps {
  habit: any;
  onComplete: (id: string) => void;
}

const HabitItem: React.FC<HabitItemProps> = ({ habit, onComplete }) => {
  const isCompletedRecently = () => {
    if (!habit.lastCompleted) return false;
    const last = new Date(habit.lastCompleted).getTime();
    const now = new Date().getTime();
    const hoursSince = (now - last) / (1000 * 60 * 60);

    if (habit.refreshInterval) {
      return hoursSince < habit.refreshInterval;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return last >= today.getTime();
  };

  const completed = isCompletedRecently();

  const getButtonText = () => {
    if (!completed) return 'Check-in';
    if (habit.refreshInterval) return 'Refreshes soon';
    return 'Completed';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`card glass-card habit-item ${completed ? 'completed' : ''}`}
    >
      <div className="habit-info">
        <motion.div
          animate={completed ? { scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 0.4 }}
          className="icon-wrapper"
          style={{ backgroundColor: habit.color + '20', color: habit.color }}
        >
          <CheckCircle size={22} strokeWidth={2} />
        </motion.div>
        <div style={{ minWidth: 0 }}>
          <h3>{habit.name}</h3>
          <div className="habit-meta">
            <span className={`streak-badge ${habit.streak >= 15 ? 'super-saiyan' : ''}`}>
              <Flame size={13} strokeWidth={2} /> {habit.streak} day streak
            </span>
            {habit.refreshInterval && (
              <span className="refresh-tag">
                <RefreshCw size={10} strokeWidth={2} /> Every {habit.refreshInterval}h
              </span>
            )}
          </div>
        </div>
      </div>
      <motion.button
        className={`btn ${completed ? 'btn-success' : 'btn-primary'}`}
        onClick={() => !completed && onComplete(habit.id)}
        disabled={completed}
        whileHover={!completed ? { scale: 1.04 } : {}}
        whileTap={!completed ? { scale: 0.96 } : {}}
        style={{ flexShrink: 0 }}
      >
        {completed ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={14} strokeWidth={2} /> {getButtonText()}
          </span>
        ) : (
          getButtonText()
        )}
      </motion.button>
    </motion.div>
  );
};

export default HabitItem;
