#!/bin/bash
echo "================================================================"
echo "          EMOJI ASTRAL: TURN-BASED RPG - LAUNCHER"
echo "================================================================"
echo ""

if ! command -v node &> /dev/null
then
    echo "[ERROR] Node.js is not installed."
    echo "Please install Node.js from https://nodejs.org or play directly online:"
    echo "https://ais-pre-pbdjde6nzrvvunxx4kxrr3-873081854110.asia-east1.run.app"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "[1/2] Installing dependencies for first-time setup..."
    npm install
fi

echo "[2/2] Starting local game server on http://localhost:3000..."
if command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:3000" &
elif command -v open &> /dev/null; then
    open "http://localhost:3000" &
fi

npm run dev
