import { ethers, NonceManager } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve server root: works in both dev (src/services/) and prod (dist/services/)
// dev:  server/src/services → up 3 = server root  ✓
// prod: server/dist/services → up 3 = server root ✓
const SERVER_DIR = path.resolve(__dirname, '../../..');
const HARDHAT_CONFIG = path.join(SERVER_DIR, 'hardhat.config.cjs');
// Fallback in case __dirname resolution differs
const SERVER_ROOT = fs.existsSync(HARDHAT_CONFIG)
  ? SERVER_DIR
  : path.resolve(__dirname, '../..');

let provider: ethers.JsonRpcProvider;
let wallet: ethers.Wallet;
let contract: ethers.Contract;

const HARDHAT_RPC = process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545';

const waitForNode = async (maxWaitMs = 30000): Promise<void> => {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    try {
      const temp = new ethers.JsonRpcProvider(HARDHAT_RPC);
      await temp.getNetwork();
      return; // node is up
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error(
    `Hardhat node not reachable at ${HARDHAT_RPC} after ${maxWaitMs / 1000}s.\n` +
    `Please start it in a separate terminal:\n  cd server && npx hardhat node --config hardhat.config.cjs`
  );
};

export const initBlockchain = async () => {
  const artifactPath = path.join(SERVER_ROOT, 'artifacts/contracts/HabitForge.sol/HabitForge.json');

  if (!fs.existsSync(artifactPath)) {
    throw new Error(
      `Contract artifact not found at:\n  ${artifactPath}\n` +
      `Run this once to compile:\n  cd server && npx hardhat compile --config hardhat.config.cjs`
    );
  }

  console.log('🔗 Connecting to Hardhat node at', HARDHAT_RPC, '...');
  await waitForNode();
  console.log('✅ Hardhat node is ready.');

  provider = new ethers.JsonRpcProvider(HARDHAT_RPC);
  const privateKey =
    process.env.PRIVATE_KEY ||
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
  // Use NonceManager to always get fresh nonce from network and handle concurrent txs
  const baseWallet = new ethers.Wallet(privateKey, provider);
  wallet = new NonceManager(baseWallet) as unknown as ethers.Wallet;

  const contractJson = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

  console.log('🚀 Deploying HabitForge contract...');
  const factory = new ethers.ContractFactory(contractJson.abi, contractJson.bytecode, wallet);
  const deployed = await factory.deploy();
  await deployed.waitForDeployment();

  const address = await deployed.getAddress();
  console.log('✅ HabitForge Smart Contract deployed to:', address);

  contract = new ethers.Contract(address, contractJson.abi, wallet);
  return contract;
};

export const getContract = () => {
  if (!contract) throw new Error('Contract not initialized. Did initBlockchain() complete?');
  return contract;
};

// No-op — the Hardhat node is now managed externally
export const shutdownBlockchain = () => {};
