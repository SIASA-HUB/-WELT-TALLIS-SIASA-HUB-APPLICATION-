#!/bin/bash

echo "==================================="
echo "🚀 Starting Ballot Microservices"
echo "==================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to start a service
start_service() {
    echo -e "${BLUE}Starting $1...${NC}"
    cd $2
    npm run dev > logs/$1.log 2>&1 &
    echo $! > pids/$1.pid
    echo -e "${GREEN}✓ $1 started (PID: $(cat pids/$1.pid))${NC}"
}

# Create logs and pids directories
mkdir -p logs pids

# Start services
start_service "global" "./global"
sleep 2
start_service "api-gateway" "./api-gateway"
start_service "wallet-service" "./wallet-service"
start_service "users-service" "./users-service"
start_service "leaders-service" "./leaders-service"
start_service "rally-service" "./rally-service"
start_service "media-service" "./media-service"
start_service "endorsement-service" "./endorsement-service"
start_service "marketplace-service" "./marketplace-service"
start_service "reaction-service" "./reaction-service"

echo -e "\n${GREEN}===================================${NC}"
echo -e "${GREEN}All services started!${NC}"
echo -e "${GREEN}===================================${NC}"
echo -e "View logs: tail -f logs/*.log"
echo -e " Stop all: ./stop-all.sh"
