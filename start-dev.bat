@echo off
echo Starting HabitForge...
echo.
echo Step 1: Starting Hardhat blockchain node in background...
start "Hardhat Node" cmd /k "cd /d "%~dp0server" && npx hardhat node --config hardhat.config.cjs"

echo Waiting for Hardhat node to start...
timeout /t 8 /nobreak > nul

echo.
echo Step 2: Starting API server...
start "HabitForge Server" cmd /k "cd /d "%~dp0server" && npm run dev"

echo.
echo Step 3: Starting frontend...
start "HabitForge Client" cmd /k "cd /d "%~dp0client" && npm run dev"

echo.
echo All services started! Open http://localhost:5173 in your browser.
pause
