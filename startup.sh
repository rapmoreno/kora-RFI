#!/bin/bash

if [ ! -f .env ]; then
  echo "Error: .env file not found."
  exit 1
fi

set -a
source .env
set +a

export PORT="${PORT:-3847}"
export API_PORT="${API_PORT:-3848}"

echo "Killing processes on port $PORT (Vite) and $API_PORT (Express)..."
lsof -ti:$PORT | xargs kill -9 2>/dev/null
lsof -ti:$API_PORT | xargs kill -9 2>/dev/null
sleep 1

echo "Installing dependencies..."
npm install

echo "Building TypeScript..."
npm run build:ts

echo "Starting full stack (Express API + Vite)..."
echo "  Vite:    http://localhost:$PORT"
echo "  API:     http://localhost:$API_PORT"
echo "  Health:  http://localhost:$API_PORT/api/health"
echo ""
npm run dev:full
