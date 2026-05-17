# HabitForge

HabitForge is a gamified habit-tracking application that turns daily tasks into a role-playing game (RPG). Consistency is rewarded with XP, badges, and level-ups.

## Features

- **Core Habit Management**: Create, update, and delete habits with different colors and icons.
- **Streak Logic**: Built-in backend logic to track and reward daily consistency.
- **Gamification Engine**: Earn XP for every completion, level up, and unlock unique badges.
- **Visual Analytics**: Interactive line and bar charts using Recharts.
- **Completion Heatmap**: GitHub-style contribution graph for long-term consistency (Pro feature).
- **Freemium Model**: Core features are free; advanced analytics require a Pro upgrade.
- **Demo Mode**: One-click demo experience with 3 months of seeded historical data.

## Tech Stack

- **Frontend**: React (TypeScript), Vite, Recharts, Framer Motion, Lucide React.
- **Backend**: Node.js, Express.js, Ethers.js.
- **Database**: Solidity Smart Contracts on Hardhat Local Blockchain.
- **Date Math**: date-fns.

## Logic Documentation

### Streak Calculation Algorithm

The streak logic is implemented in the `calculateNextStreak` utility in the backend. 

**Rules:**
1. **First Completion**: If the habit has never been completed, the streak starts at 1.
2. **Same Day**: If the habit was already completed today, the streak remains the same.
3. **Consecutive Day**: If the last completion was yesterday (using `isYesterday` from date-fns), the streak increments by 1.
4. **Missed Day**: If the last completion was before yesterday, the streak resets to 1.

**Timezones:**
The application uses the server's local time for `startOfDay` comparisons. In a production environment, we recommend storing the user's timezone and calculating the "day" boundary relative to that timezone to ensure streaks don't break when users travel or live in different regions.

### XP Formula

- **Base Reward**: 10 XP per completion.
- **Streak Bonus**: +5 XP bonus for every full week (7 days) of streak maintained.
- **Level Formula**: `Level = floor(0.1 * sqrt(XP)) + 1`. This provides a progressive difficulty curve where leveling up becomes harder as you reach higher levels.

## Getting Started

1. Clone the repository.
2. Install dependencies in both `client` and `server` folders using `npm run install-all`.
3. Start the server: `cd server && npm run dev`. This will automatically compile the smart contracts and start an in-memory local blockchain.
4. Start the client: `cd client && npm run dev`.
5. Click "Start Demo Experience" on the landing page to see the app in action.
