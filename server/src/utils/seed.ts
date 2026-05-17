import { getContract } from '../services/blockchain.js';
import { calculateLevel } from './gamification.js';
import { subDays, eachDayOfInterval } from 'date-fns';

// Split an array into chunks of size n
function chunk<T>(arr: T[], n: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += n) {
    chunks.push(arr.slice(i, i + n));
  }
  return chunks;
}

export const seedUserHistory = async (userId: string) => {
  const contract = getContract();
  const habitsRaw = await contract.getHabitsByUserId(userId);
  const habits = Array.from(habitsRaw) as any[];
  if (habits.length === 0) return;

  const endDate = new Date();
  const startDate = subDays(endDate, 90); // 3 months of history
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const daysCount = days.length;

  // Pre-compute per-habit data
  const habitMeta: {
    id: bigint;
    completedAts: bigint[];
    finalStreak: bigint;
    lastCompleted: bigint;
    xpContrib: number;
  }[] = [];

  for (const habit of habits) {
    let currentStreak = 0;
    let lastCompleted = 0;
    let xpContrib = 0;
    const completedAts: bigint[] = [];

    for (let d = 0; d < daysCount; d++) {
      if (Math.random() > 0.2) {
        const completedAt = new Date(days[d]!);
        completedAt.setHours(Math.floor(Math.random() * 12) + 8);
        const timeMs = completedAt.getTime();
        completedAts.push(BigInt(timeMs));
        currentStreak++;
        lastCompleted = timeMs;
        xpContrib += 10 + Math.floor(currentStreak / 7) * 5;
      } else {
        // Skip day — push 0
        completedAts.push(BigInt(0));
        currentStreak = 0;
      }
    }

    habitMeta.push({
      id: BigInt(habit.id.toString()),
      completedAts,
      finalStreak: BigInt(currentStreak),
      lastCompleted: BigInt(lastCompleted),
      xpContrib,
    });
  }

  // Send in batches of 5 habits to stay under block gas limit
  const BATCH_SIZE = 5;
  const batches = chunk(habitMeta, BATCH_SIZE);

  for (const batch of batches) {
    const habitIds = batch.map((h) => h.id);
    const flatCompletedAts = batch.flatMap((h) => h.completedAts);
    const finalStreaks = batch.map((h) => h.finalStreak);
    const lastCompletedList = batch.map((h) => h.lastCompleted);

    // Use 0 for XP/level in batch calls, we'll update once at the end
    const tx = await contract.batchSeedHistory(
      userId,
      habitIds,
      flatCompletedAts,
      finalStreaks,
      lastCompletedList,
      BigInt(0),  // XP updated in final call
      BigInt(1)   // Level updated in final call
    );
    await tx.wait();
  }

  // Update XP & level once at the end
  const totalXp = habitMeta.reduce((sum, h) => sum + h.xpContrib, 0);
  const user = await contract.getUser(userId);
  const currentXp = Number(user.xp);
  const newXp = currentXp + totalXp;
  const newLevel = calculateLevel(newXp);

  const tx = await contract.updateUserStats(
    userId,
    BigInt(newXp),
    BigInt(newLevel),
    Array.from(user.badges) as string[]
  );
  await tx.wait();
};
