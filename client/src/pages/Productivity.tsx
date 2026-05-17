import React from 'react';
import { motion } from 'framer-motion';
import { Monitor, Bell, Dumbbell, Utensils, Zap, Clock } from 'lucide-react';

const Productivity: React.FC = () => {
  const reminders = [
    { time: '08:00', task: 'Morning Workout', icon: <Dumbbell size={18} strokeWidth={2} /> },
    { time: '13:00', task: 'Healthy Lunch', icon: <Utensils size={18} strokeWidth={2} /> },
    { time: '16:00', task: 'Focus Coding', icon: <Zap size={18} strokeWidth={2} /> },
    { time: '21:00', task: 'Night Reading', icon: <Clock size={18} strokeWidth={2} /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="page-container"
    >
      <div className="page-header">
        <h1>Productivity Hub</h1>
        <p className="text-dim">Optimize your daily flow and maximize efficiency.</p>
      </div>

      <div className="productivity-grid">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          whileHover={{ scale: 1.02, y: -4 }}
          className="card glass-card widget-card"
          style={{ cursor: 'default' }}
        >
          <div className="widget-header">
            <Monitor size={24} strokeWidth={2} />
            <h3 style={{ margin: 0 }}>Screen Timing</h3>
          </div>
          <div className="timing-circle">
            4h 22m
          </div>
          <p className="text-dim" style={{ textAlign: 'center', margin: 0, fontSize: '0.85rem' }}>
            <span style={{ color: '#22c55e', fontWeight: 600 }}>12% decrease</span> from yesterday
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02, y: -4 }}
          className="card glass-card widget-card"
          style={{ cursor: 'default' }}
        >
          <div className="widget-header">
            <Bell size={24} strokeWidth={2} />
            <h3 style={{ margin: 0 }}>Daily Reminders</h3>
          </div>
          <ul className="reminder-list">
            {reminders.map((r, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.05, duration: 0.3 }}
                className="reminder-item"
              >
                <span className="reminder-time">{r.time}</span>
                {r.icon}
                <span style={{ fontWeight: 500, color: '#e2e8f0', fontSize: '0.875rem' }}>{r.task}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Productivity;
