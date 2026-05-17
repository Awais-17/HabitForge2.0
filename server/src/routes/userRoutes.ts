import express from 'express';
import { getContract } from '../services/blockchain.js';
import { seedUserHistory } from '../utils/seed.js';

const router = express.Router();

// Helper to format User struct
function formatUser(u: any) {
  return {
    id: u.id.toString(),
    name: u.name,
    email: u.email,
    xp: Number(u.xp),
    level: Number(u.level),
    badges: Array.from(u.badges) as string[],
    isPremium: u.isPremium,
    createdAt: new Date(Number(u.createdAt) * 1000).toISOString()
  };
}

router.post('/register', async (req, res) => {
  try {
    const { name, email } = req.body;
    const contract = getContract();
    
    // Try to create the user
    try {
      const tx = await contract.createUser(name, email);
      const receipt = await tx.wait();
      // Fetch fresh user data by email after creation
      const user = await contract.getUserByEmail(email);
      return res.status(201).json(formatUser(user));
    } catch (createErr: any) {
      // If 'Email already exists' revert, fetch existing user
      if (createErr.message?.includes('Email already exists') || createErr.reason === 'Email already exists') {
        const existing = await contract.getUserByEmail(email);
        return res.status(200).json(formatUser(existing));
      }
      throw createErr;
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:userId/seed', async (req, res) => {
  try {
    await seedUserHistory(req.params.userId);
    const contract = getContract();
    const user = await contract.getUser(req.params.userId);
    res.json(formatUser(user));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:userId/upgrade', async (req, res) => {
  try {
    const contract = getContract();
    const user = await contract.getUser(req.params.userId);
    
    if (!user || user.id.toString() === '0') return res.status(404).json({ message: 'User not found' });
    
    const tx = await contract.upgradeUser(req.params.userId);
    await tx.wait();
    
    const updatedUser = await contract.getUser(req.params.userId);
    res.json(formatUser(updatedUser));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:userId', async (req, res) => {
  try {
    const contract = getContract();
    const user = await contract.getUser(req.params.userId);
    
    if (!user || user.id.toString() === '0') return res.status(404).json({ message: 'User not found' });
    
    res.json(formatUser(user));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:userId', async (req, res) => {
  try {
    const { name, email } = req.body;
    const contract = getContract();
    const user = await contract.getUser(req.params.userId);
    
    if (!user || user.id.toString() === '0') return res.status(404).json({ message: 'User not found' });
    
    const tx = await contract.updateUser(req.params.userId, name, email);
    await tx.wait();
    
    const updatedUser = await contract.getUser(req.params.userId);
    res.json(formatUser(updatedUser));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
