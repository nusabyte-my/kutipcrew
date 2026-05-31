#!/bin/bash

set -e

echo "💀 Split or Sip - Deployment Script"
echo "===================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo -e "${RED}❌ Bun is not installed. Install it from https://bun.sh${NC}"
    exit 1
fi

# Build frontend
echo -e "\n${YELLOW}📦 Building frontend...${NC}"
cd web
bun install
bun run build
cd ..

# Install backend dependencies
echo -e "\n${YELLOW}📦 Installing backend dependencies...${NC}"
cd api
bun install
cd ..

# Check if .env exists for backend
if [ ! -f api/.env ]; then
    echo -e "\n${YELLOW}⚠️  No .env file found in api/. Creating from example...${NC}"
    cp api/.env.example api/.env
    echo -e "${YELLOW}   Please edit api/.env with your database credentials${NC}"
fi

# Initialize database (optional)
read -p "Initialize database schema? (y/N): " init_db
if [[ $init_db =~ ^[Yy]$ ]]; then
    echo -e "\n${YELLOW}🗄️  Initializing database...${NC}"
    cd api
    bun run db:init
    cd ..
fi

# Start with PM2
echo -e "\n${YELLOW}🚀 Starting backend with PM2...${NC}"
cd api
pm2 delete splitbill-api 2>/dev/null || true
pm2 start bun --name "splitbill-api" -- run start
cd ..

echo -e "\n${GREEN}✅ Deployment complete!${NC}"
echo -e "\nBackend: http://localhost:3000"
echo -e "Frontend: Serve web/dist/ with Nginx or similar"
echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Configure Nginx to serve web/dist/"
echo "2. Set up reverse proxy for /api -> localhost:3000"
echo "3. Add SSL certificate (Let's Encrypt)"
echo -e "\n💀 Pay up or face the consequences..."
