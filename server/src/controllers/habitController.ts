import type { Request, Response } from 'express';
import { getContract } from '../services/blockchain.js';
import { calculateNextStreak, calculateXPForCompletion, calculateLevel } from '../utils/gamification.js';
import { checkBadges } from '../utils/badges.js';
import { format } from 'date-fns';

export const createHabit = async (req: Request, res: Response) => {
  try {
    const { userId, name, frequency, color, icon, refreshInterval } = req.body;
    
    const contract = getContract();
    
    // Check habit limit for free tier
    const user = await contract.getUser(userId);
    if (!user || user.id.toString() === '0') return res.status(404).json({ message: 'User not found' });
    
    if (!user.isPremium && !user.email.startsWith('demo_')) {
      const habits = await contract.getHabitsByUserId(userId);
      if (Array.from(habits).length >= 5) {
        return res.status(403).json({ message: 'Free tier limit reached (max 5 habits). Upgrade to Pro for unlimited habits!' });
      }
    }

    const tx = await contract.createHabit(userId, name, frequency, color, icon, refreshInterval || 0);
    await tx.wait();

    // Fetch all habits and return the newly created last one
    const habitsArr = Array.from(await contract.getHabitsByUserId(userId)) as any[];
    const newHabit = habitsArr[habitsArr.length - 1];
    
    res.status(201).json(formatHabit(newHabit));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getHabits = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    const contract = getContract();
    const habits = await contract.getHabitsByUserId(userId);
    
    res.json(Array.from(habits).map(formatHabit));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateHabit = async (req: Request, res: Response) => {
  try {
    const { habitId } = req.params;
    const { name, frequency, color, icon } = req.body;
    
    const contract = getContract();
    const tx = await contract.updateHabit(habitId, name, frequency, color, icon);
    await tx.wait();
    
    const habit = await contract.getHabit(habitId);
    res.json(formatHabit(habit));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteHabit = async (req: Request, res: Response) => {
  try {
    const { habitId } = req.params;
    const contract = getContract();
    
    const tx = await contract.deleteHabit(habitId);
    await tx.wait();
    
    res.json({ message: 'Habit deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const completeHabit = async (req: Request, res: Response) => {
  try {
    const { habitId } = req.params;
    const { userId } = req.body;

    const contract = getContract();
    const habit = await contract.getHabit(habitId);
    
    if (!habit || habit.id.toString() === '0') return res.status(404).json({ message: 'Habit not found' });

    const refreshInterval = Number(habit.refreshInterval);
    const lastCompleted = Number(habit.lastCompleted);
    const now = Date.now();

    // Check if already completed recently based on refreshInterval
    if (refreshInterval > 0 && lastCompleted > 0) {
      const hoursSince = (now - lastCompleted) / (1000 * 60 * 60);
      
      if (hoursSince < refreshInterval) {
        const timeLeft = Math.ceil(refreshInterval - hoursSince);
        return res.status(400).json({ 
          message: `This habit refreshes every ${refreshInterval} hours. Please wait ${timeLeft} more hour(s).` 
        });
      }
    } else if (lastCompleted > 0) {
      // Standard daily check
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (lastCompleted >= today.getTime()) {
        return res.status(400).json({ message: 'Habit already completed today' });
      }
    }

    // Update Streak
    const lastCompletedDate = lastCompleted > 0 ? new Date(lastCompleted) : null;
    const nextStreak = calculateNextStreak(lastCompletedDate, Number(habit.streak));
    
    // Create Log & Update Habit in one transaction (or two)
    const tx = await contract.logCompletion(habitId, userId, now, nextStreak);
    await tx.wait();

    // Reward XP
    const user = await contract.getUser(userId);
    if (user && user.id.toString() !== '0') {
      const xpGained = calculateXPForCompletion(nextStreak);
      const newXp = Number(user.xp) + xpGained;
      const newLevel = calculateLevel(newXp);
      
      const tx2 = await contract.updateUserStats(userId, newXp, newLevel, Array.from(user.badges));
      await tx2.wait();
      
      const newBadges = await checkBadges(userId);
      
      const updatedHabit = await contract.getHabit(habitId);
      
      return res.json({ 
        habit: formatHabit(updatedHabit), 
        xpGained, 
        currentXP: newXp, 
        level: newLevel,
        newBadges 
      });
    }

    const updatedHabit = await contract.getHabit(habitId);
    res.json({ habit: formatHabit(updatedHabit) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const { userId, days = '30' } = req.query;
    
    const contract = getContract();
    const user = await contract.getUser(userId);
    if (!user || user.id.toString() === '0') return res.status(404).json({ message: 'User not found' });

    let requestedDays = parseInt(days as string);
    if (!user.isPremium && requestedDays > 7) {
      requestedDays = 7;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - requestedDays);
    startDate.setHours(0, 0, 0, 0);

    const logsRaw = await contract.getLogsByUserId(userId);
    const logs = Array.from(logsRaw) as any[];
    
    // Group logs by day
    const grouped: Record<string, number> = {};
    
    for (let i = 0; i < logs.length; i++) {
      const completedAt = Number((logs[i] as any).completedAt);
      if (completedAt >= startDate.getTime()) {
        const dateStr = format(new Date(completedAt), 'yyyy-MM-dd');
        grouped[dateStr] = (grouped[dateStr] || 0) + 1;
      }
    }
    
    const result = Object.keys(grouped).sort().map(key => ({
      _id: key,
      count: grouped[key] ?? 0
    }));

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Helper to format smart contract struct returns into nice JSON
function formatHabit(h: any) {
  return {
    id: h.id.toString(),
    userId: h.userId.toString(),
    name: h.name,
    frequency: h.frequency,
    color: h.color,
    icon: h.icon,
    streak: Number(h.streak),
    lastCompleted: Number(h.lastCompleted) > 0 ? new Date(Number(h.lastCompleted)).toISOString() : null,
    refreshInterval: Number(h.refreshInterval) > 0 ? Number(h.refreshInterval) : null,
    createdAt: new Date(Number(h.createdAt) * 1000).toISOString()
  };
}
