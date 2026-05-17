import { getContract } from '../services/blockchain.js';

export const BADGES = [
  {
    id: 'rookie',
    name: 'Rookie',
    description: 'Welcome to the Hero Academy!',
    criteria: 'account_created'
  },
  {
    id: 'consistency_king',
    name: 'Consistency King',
    description: 'Maintain a 7-day streak on any habit',
    criteria: 'streak >= 7'
  },
  {
    id: 'habit_starter',
    name: 'Habit Starter',
    description: 'Complete your first habit',
    criteria: 'total_completions >= 1'
  },
  {
    id: 'century_club',
    name: 'Century Club',
    description: 'Complete 100 habits total',
    criteria: 'total_completions >= 100'
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete a habit before 8 AM',
    criteria: 'completed_at < 8:00'
  }
];

export const checkBadges = async (userId: string) => {
  const contract = getContract();
  const user = await contract.getUser(userId);
  if (!user || user.id.toString() === '0') return [];

  const habits = await contract.getHabitsByUserId(userId);
  const logs = await contract.getLogsByUserId(userId);
  const habitsArr = Array.from(habits) as any[];
  const logsArr = Array.from(logs) as any[];
  const logsCount = logsArr.length;

  const userBadges = Array.from(user.badges) as string[];
  const newBadges: string[] = [];

  // Check Rookie
  if (!userBadges.includes('rookie')) {
    newBadges.push('rookie');
  }

  // Check Consistency King
  if (!userBadges.includes('consistency_king')) {
    const hasLongStreak = habitsArr.some((h: any) => Number(h.streak) >= 7);
    if (hasLongStreak) newBadges.push('consistency_king');
  }

  // Check Habit Starter
  if (!userBadges.includes('habit_starter')) {
    if (logsCount >= 1) newBadges.push('habit_starter');
  }

  // Check Century Club
  if (!userBadges.includes('century_club')) {
    if (logsCount >= 100) newBadges.push('century_club');
  }

  // Check Early Bird
  if (!userBadges.includes('early_bird')) {
    const hasEarlyLog = logsArr.some((log: any) => {
      const hours = new Date(Number(log.completedAt)).getHours();
      return hours < 8;
    });
    if (hasEarlyLog) newBadges.push('early_bird');
  }

  if (newBadges.length > 0) {
    const updatedBadges = [...userBadges, ...newBadges];
    const tx = await contract.updateUserStats(userId, user.xp, user.level, updatedBadges);
    await tx.wait();
  }

  return newBadges;
};
