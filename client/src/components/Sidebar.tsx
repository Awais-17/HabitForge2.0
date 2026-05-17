import React, { useState } from 'react';
import { User, Award, Crown, Zap, Target, Coffee, Edit2, Check, X, LayoutDashboard, Trophy, Clock, Sparkles } from 'lucide-react';

interface SidebarProps {
  user: any;
  onUpdateProfile?: (updates: { name?: string; email?: string }) => void;
  activePage?: string;
  setActivePage?: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onUpdateProfile, activePage, setActivePage }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');

  const xpToNextLevel = (Math.pow((user.level + 1) / 0.2, 2));
  const xpCurrentLevel = (Math.pow((user.level) / 0.2, 2));
  const progress = Math.min(100, Math.max(0, ((user.xp - xpCurrentLevel) / (xpToNextLevel - xpCurrentLevel)) * 100));

  const getBadgeIcon = (badgeId: string) => {
    switch (badgeId) {
      case 'rookie': return <Award size={16} color="#94a3b8" strokeWidth={2} />;
      case 'consistency_king': return <Crown size={16} color="#f59e0b" strokeWidth={2} />;
      case 'habit_starter': return <Zap size={16} color="#0ea5e9" strokeWidth={2} />;
      case 'century_club': return <Target size={16} color="#ec4899" strokeWidth={2} />;
      case 'early_bird': return <Coffee size={16} color="#10b981" strokeWidth={2} />;
      default: return <Award size={16} color="#60a5fa" strokeWidth={2} />;
    }
  };

  const getBadgeName = (badgeId: string) => {
    return badgeId.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const handleSaveProfile = () => {
    if (onUpdateProfile && editName.trim()) {
      onUpdateProfile({ name: editName.trim() });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditName(user.name);
  };

  return (
    <aside className="sidebar">
      {/* User Profile */}
      <div className="card glass-card user-profile" style={{ position: 'relative', overflow: 'hidden' }}>
        {user.isPremium && (
          <div className="premium-tag" style={{ position: 'absolute', top: '1rem', right: '1rem', borderRadius: '999px', padding: '0.25rem 0.75rem', fontSize: '0.65rem', width: 'auto' }}>
            <Sparkles size={10} strokeWidth={2.5} />
            PRO
          </div>
        )}
        <div className="avatar">
          <User size={32} color="#bfdbfe" strokeWidth={1.5} />
        </div>

        {isEditing ? (
          <div className="edit-profile-form">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="profile-input"
              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveProfile(); if (e.key === 'Escape') handleCancel(); }}
              autoFocus
            />
            <div className="edit-actions">
              <button onClick={handleSaveProfile} className="btn btn-success" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}>
                <Check size={16} />
              </button>
              <button onClick={handleCancel} className="btn" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>
                <X size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="profile-header">
            <h2>{user.name}</h2>
            <button onClick={() => { setIsEditing(true); setEditName(user.name); }} className="btn-icon" title="Edit Profile">
              <Edit2 size={14} strokeWidth={2} />
            </button>
          </div>
        )}

        <div className="level-badge" style={{ marginTop: '0.25rem' }}>
          Level {user.level}
        </div>
      </div>

      {/* XP Section */}
      <div className="card glass-card xp-section">
        <div className="xp-info">
          <span>XP</span>
          <span>{Math.floor(user.xp)} / {Math.floor(xpToNextLevel)}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Badges */}
      <div className="card glass-card badges-collection">
        <h3>Badges</h3>
        <div className="badges-grid">
          {user.badges && user.badges.length > 0 ? (
            user.badges.map((badgeId: string) => (
              <div key={badgeId} className="badge-item" title={getBadgeName(badgeId)}>
                {getBadgeIcon(badgeId)}
              </div>
            ))
          ) : (
            <p className="text-dim small" style={{ gridColumn: 'span 5', fontSize: '0.75rem', textAlign: 'center', padding: '0.5rem' }}>
              No badges yet. Start checking off habits!
            </p>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <ul>
          <li className={activePage === 'dashboard' ? 'active' : ''} onClick={() => setActivePage?.('dashboard')}>
            <LayoutDashboard size={20} strokeWidth={2} /> <span>Dashboard</span>
          </li>
          <li className={activePage === 'achievements' ? 'active' : ''} onClick={() => setActivePage?.('achievements')}>
            <Trophy size={20} strokeWidth={2} /> <span>Achievements</span>
          </li>
          <li className={activePage === 'productivity' ? 'active' : ''} onClick={() => setActivePage?.('productivity')}>
            <Clock size={20} strokeWidth={2} /> <span>Productivity</span>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
