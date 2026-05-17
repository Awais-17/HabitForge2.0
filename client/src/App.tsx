import React, { useState, useEffect } from 'react';
import { habitService, userService } from './services/api';
import Sidebar from './components/Sidebar';
import HabitList from './components/HabitList';
import Dashboard from './components/Dashboard';
import Heatmap from './components/Heatmap';
import PremiumGate from './components/PremiumGate';
import Achievements from './pages/Achievements';
import Productivity from './pages/Productivity';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');

  useEffect(() => {
    const savedUserId = localStorage.getItem('habitforge_user_id');
    if (savedUserId) {
      fetchUserData(savedUserId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      const userRes = await userService.getUser(userId);
      setUser(userRes.data);
      const habitsRes = await habitService.getHabits(userId);
      setHabits(habitsRes.data);
    } catch (error) {
      // Stale user ID (e.g. server restarted and blockchain reset) — clear and show landing
      console.warn('User not found on blockchain, clearing session.');
      localStorage.removeItem('habitforge_user_id');
    } finally {
      setLoading(false);
    }
  };

  const createDemoUser = async () => {
    try {
      setLoading(true);
      localStorage.removeItem('habitforge_user_id');

      const res = await userService.register('Demo User', `demo_${Date.now()}@example.com`);
      const newUser = res.data;
      localStorage.setItem('habitforge_user_id', newUser.id);
      setUser(newUser);

      const defaultHabits = [
        { name: 'Hydrate Immediately', frequency: 'daily', color: '#3b82f6', refreshInterval: null },
        { name: 'Make Your Bed', frequency: 'daily', color: '#6366f1', refreshInterval: null },
        { name: 'Morning Sunlight', frequency: 'daily', color: '#f59e0b', refreshInterval: null },
        { name: 'Move Your Body', frequency: 'daily', color: '#10b981', refreshInterval: null },
        { name: 'Practice Gratitude', frequency: 'daily', color: '#ec4899', refreshInterval: null },
        { name: 'Nutritious Breakfast', frequency: 'daily', color: '#f97316', refreshInterval: null },
        { name: 'Prioritize Tasks', frequency: 'daily', color: '#8b5cf6', refreshInterval: null },
        { name: 'Time Management', frequency: 'daily', color: '#06b6d4', refreshInterval: null },
        { name: 'Take Movement Breaks', frequency: 'daily', color: '#14b8a6', refreshInterval: 2 },
        { name: 'Limit Technology', frequency: 'daily', color: '#ef4444', refreshInterval: null },
        { name: 'Reflect & Plan', frequency: 'daily', color: '#475569', refreshInterval: null },
        { name: 'Stay Active', frequency: 'daily', color: '#22c55e', refreshInterval: null },
        { name: 'Unwind & Disconnect', frequency: 'daily', color: '#475569', refreshInterval: null },
        { name: 'Read a Book', frequency: 'daily', color: '#d946ef', refreshInterval: null },
        { name: '7-9h Sleep', frequency: 'daily', color: '#1e3a8a', refreshInterval: null },
        { name: 'Balanced Diet', frequency: 'daily', color: '#84cc16', refreshInterval: null },
        { name: 'Social Interaction', frequency: 'daily', color: '#facc15', refreshInterval: null },
        { name: 'Hygiene', frequency: 'daily', color: '#94a3b8', refreshInterval: null },
      ];

      await Promise.all(defaultHabits.map(habit =>
        habitService.createHabit({ userId: newUser.id, ...habit })
      ));

      await userService.seedHistory(newUser.id);

      const [userRes, habitsRes] = await Promise.all([
        userService.getUser(newUser.id),
        habitService.getHabits(newUser.id)
      ]);
      setUser(userRes.data);
      setHabits(habitsRes.data);
    } catch (error: any) {
      console.error('Error creating demo user:', error);
      alert(`Failed to create demo experience. Please ensure the backend server is running.\nError: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (habitId: string) => {
    try {
      const res = await habitService.completeHabit(habitId, user.id);
      const { habit, currentXP, level, newBadges } = res.data;

      setHabits(habits.map(h => h.id === habitId ? habit : h));
      setUser({ ...user, xp: currentXP, level, badges: [...(user.badges || []), ...(newBadges || [])] });

      if (newBadges && newBadges.length > 0) {
        const toastMsg = newBadges.length === 1 
          ? `New Badge Earned: ${newBadges[0]}!` 
          : `New Badges Earned: ${newBadges.join(', ')}!`;
        setNotification(toastMsg);
        setTimeout(() => setNotification(null), 6000);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error completing habit');
    }
  };

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim() || !user) return;
    try {
      const res = await habitService.createHabit({
        userId: user.id,
        name: newHabitName,
        frequency: 'daily',
        color: '#3b82f6',
        icon: 'star',
        refreshInterval: null
      });
      setHabits([...habits, res.data]);
      setNewHabitName('');
      setIsAddingHabit(false);
      setNotification('Habit added successfully!');
      setTimeout(() => setNotification(null), 3000);
    } catch (error: any) {
      alert(error.response?.data?.message || error.message || 'Error adding habit');
    }
  };

  const handleUpgrade = async () => {
    try {
      const res = await userService.upgradeToPremium(user.id);
      setUser(res.data);
      setNotification('Welcome to HabitForge Pro!');
      setTimeout(() => setNotification(null), 5000);
    } catch (error: any) {
      console.error('Error upgrading:', error);
      alert(`Upgrade failed: ${error.message}`);
    }
  };

  const handleUpdateProfile = async (updates: { name?: string; email?: string }) => {
    try {
      const res = await userService.updateUser(user.id, updates);
      setUser(res.data);
      setNotification('Profile updated successfully!');
      setTimeout(() => setNotification(null), 5000);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert(`Update failed: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1.5rem' }}>
        <div style={{ width: '48px', height: '48px', border: '3px solid #1e293b', borderTopColor: '#60a5fa', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '1.125rem', color: '#94a3b8', margin: 0 }}>Loading HabitForge...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="auth-screen">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: 'relative', zIndex: 1, maxWidth: '480px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'linear-gradient(135deg, #1d4ed8, #1e3a8a)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(37, 99, 235, 0.3)' }}>
              <Sparkles size={40} color="#60a5fa" strokeWidth={1.5} />
            </div>
          </div>
          <h1>HabitForge</h1>
          <p style={{ fontSize: '1.05rem', color: '#94a3b8', maxWidth: '380px', margin: '0 auto 2.5rem' }}>
            Transform your daily routine into an epic quest. Build habits, earn XP, level up.
          </p>
          <motion.button
            className="btn btn-glow"
            style={{ padding: '0.875rem 2.25rem', fontSize: '1.05rem', gap: '0.5rem' }}
            onClick={createDemoUser}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Zap size={20} strokeWidth={2.5} />
            Start Your Journey
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <AnimatePresence mode="wait">
        {notification && (
          <motion.div
            key="toast"
            initial={{ x: 100, opacity: 0, scale: 0.9 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 100, opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="notification-toast"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      <Sidebar
        user={user}
        onUpdateProfile={handleUpdateProfile}
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main className="main-content">
        <AnimatePresence mode="wait">
          {activePage === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <h1>My Habits</h1>
                  </div>
                  <p className="text-dim">Consistency is your superpower.</p>
                </div>
                <button className="btn btn-glow" onClick={() => setIsAddingHabit(!isAddingHabit)}>
                  {isAddingHabit ? 'Cancel' : '+ Add Habit'}
                </button>
              </div>

              <AnimatePresence>
                {isAddingHabit && (
                  <motion.form 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleAddHabit}
                    style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', overflow: 'hidden' }}
                  >
                    <input 
                      type="text" 
                      value={newHabitName}
                      onChange={(e) => setNewHabitName(e.target.value)}
                      placeholder="e.g. Read 10 pages"
                      className="glass-card"
                      style={{ flex: 1, padding: '0.75rem 1rem', border: '1px solid rgba(96, 165, 250, 0.2)', borderRadius: '12px', background: 'rgba(17, 24, 39, 0.7)', color: 'white', outline: 'none' }}
                      autoFocus
                    />
                    <button type="submit" className="btn btn-glow" style={{ padding: '0 1.5rem', borderRadius: '12px' }}>
                      Save
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              <HabitList habits={habits} onComplete={handleComplete} />

              <div className="analytics-section">
                <h2>Your Progress</h2>
                <Dashboard userId={user.id} refreshTrigger={habits} />
                <PremiumGate isPremium={user.isPremium} onUpgrade={handleUpgrade}>
                  <Heatmap userId={user.id} refreshTrigger={habits} />
                </PremiumGate>
              </div>
            </motion.div>
          )}

          {activePage === 'achievements' && (
            <Achievements key="achievements" user={user} />
          )}

          {activePage === 'productivity' && (
            <Productivity key="productivity" />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;
