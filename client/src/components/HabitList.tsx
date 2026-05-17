import React from 'react';
import HabitItem from './HabitItem';
import { AnimatePresence, motion } from 'framer-motion';

interface HabitListProps {
  habits: any[];
  onComplete: (id: string) => void;
}

const HabitList: React.FC<HabitListProps> = ({ habits, onComplete }) => {
  return (
    <div className="habit-list">
      <AnimatePresence mode="popLayout">
        {habits.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card glass-card"
            style={{ textAlign: 'center', padding: '2.5rem' }}
          >
            <p className="text-dim" style={{ margin: 0 }}>No habits yet. Add one to start your journey!</p>
          </motion.div>
        ) : (
          habits.map((habit, index) => (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <HabitItem habit={habit} onComplete={onComplete} />
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  );
};

export default HabitList;
