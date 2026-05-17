import React from 'react';
import { motion } from 'framer-motion';
import { Award, Crown, Zap, Target, Coffee, Lock } from 'lucide-react';

interface AchievementsProps {
  user: any;
}

const Achievements: React.FC<AchievementsProps> = ({ user }) => {
  const allBadges = [
    { id: 'rookie', name: 'Rookie', desc: 'Welcome to the Hero Academy!', icon: <Award size={28} color="#94a3b8" strokeWidth={2} /> },
    { id: 'consistency_king', name: 'Consistency King', desc: '7-day streak milestone', icon: <Crown size={28} color="#f59e0b" strokeWidth={2} /> },
    { id: 'habit_starter', name: 'Habit Starter', desc: 'Complete your first habit', icon: <Zap size={28} color="#0ea5e9" strokeWidth={2} /> },
    { id: 'century_club', name: 'Century Club', desc: '100 total completions', icon: <Target size={28} color="#ec4899" strokeWidth={2} /> },
    { id: 'early_bird', name: 'Early Bird', desc: 'Complete a habit before 8 AM', icon: <Coffee size={28} color="#10b981" strokeWidth={2} /> },
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <h1>Your Achievements</h1>
        </div>
        <p className="text-dim">Your collection of legendary milestones.</p>
      </div>

      <div className="productivity-grid">
        {allBadges.map((badge, index) => {
          const isUnlocked = user.badges?.includes(badge.id);
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              whileHover={isUnlocked ? { scale: 1.02, y: -4 } : {}}
              className={`card glass-card widget-card ${!isUnlocked ? 'locked' : ''}`}
              style={{ opacity: isUnlocked ? 1 : 0.65, position: 'relative', overflow: 'hidden' }}
            >
              <div className="badge-icon-large" style={{ background: isUnlocked ? `linear-gradient(135deg, ${badge.icon.props.color}15, ${badge.icon.props.color}08)` : undefined, borderColor: isUnlocked ? `${badge.icon.props.color}20` : undefined }}>
                {badge.icon}
              </div>
              <div className="badge-details">
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>{badge.name}</h3>
                <p className="text-dim" style={{ margin: 0, fontSize: '0.85rem' }}>{badge.desc}</p>
              </div>
              {!isUnlocked && (
                <div className="lock-overlay" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Lock size={10} strokeWidth={2.5} /> LOCKED
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Achievements;
