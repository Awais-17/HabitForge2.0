import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Crown } from 'lucide-react';

interface PremiumGateProps {
  isPremium: boolean;
  children: React.ReactNode;
  onUpgrade: () => void;
}

const PremiumGate: React.FC<PremiumGateProps> = ({ isPremium, children, onUpgrade }) => {
  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className="premium-gate">
      <div className="gate-content">
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Lock size={40} color="#60a5fa" strokeWidth={1.5} />
        </motion.div>
        <h3>Pro Feature</h3>
        <p style={{ color: '#94a3b8', margin: '0 auto', maxWidth: '340px', lineHeight: 1.6, fontSize: '0.95rem' }}>
          Unlock advanced analytics, heatmaps, and detailed habit insights available exclusively for Pro members.
        </p>
        <motion.button
          className="btn"
          onClick={onUpgrade}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: '#000',
            padding: '0.75rem 1.75rem',
            fontSize: '0.875rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)',
          }}
        >
          <Crown size={18} strokeWidth={2.5} />
          Upgrade to HabitForge Pro
        </motion.button>
      </div>
    </div>
  );
};

export default PremiumGate;
