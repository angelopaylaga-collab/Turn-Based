@echo off
title Emoji Astral: Turn-Based RPG
echo ================================================================
echo           EMOJI ASTRAL: TURN-BASED RPG - LAUNCHER
echo ================================================================
echo.

node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed on your computer!
    echo.
    echo To run this project locally, please install Node.js from:
    echo   https://nodejs.org/
    echo.
    echo OR play instantly in your browser without installing anything:
    echo   https://ais-pre-pbdjde6nzrvvunxx4kxrr3-873081854110.asia-east1.run.app
    echo.
    pause
    exit /b
)

if not exist node_modules (
    echo [1/2] Installing dependencies for first-time setup...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b
    )
)

echo [2/2] Starting local game server...
echo.
echo The game will open automatically in your browser at http://localhost:3000
echo Leave this terminal window open while playing.
echo.

start "" "http://localhost:3000"
npm run dev

pause
