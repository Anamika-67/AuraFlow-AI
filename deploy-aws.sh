#!/bin/bash
# =============================================================================
# AuraFlow-AI — Automated 1-Click AWS EC2 Deployment Script
# Usage: Run this script on your fresh AWS EC2 Ubuntu instance:
#   chmod +x deploy-aws.sh && ./deploy-aws.sh
# =============================================================================

set -e

echo "🚀 Starting AuraFlow-AI AWS EC2 Automated Deployment..."

# 1. Update system and install dependencies
echo "📦 [1/4] Updating packages and installing Docker & Git..."
sudo apt-get update -y
sudo apt-get install -y docker.io docker-compose-plugin git curl

# 2. Start and enable Docker
echo "⚙️ [2/4] Configuring Docker service..."
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER || true

# 3. Build and launch Docker Compose stack
echo "🏗️ [3/4] Building and launching AuraFlow containers..."
sudo docker compose down --remove-orphans || true
sudo docker compose up -d --build

# 4. Verify deployment health
echo "🔍 [4/4] Verifying container status..."
sleep 5
sudo docker compose ps

PUBLIC_IP=$(curl -s http://checkip.amazonaws.com || curl -s ifconfig.me || echo "YOUR_EC2_PUBLIC_IP")

echo ""
echo "====================================================================="
echo "🎉 AuraFlow-AI is SUCCESSFULLY DEPLOYED on AWS EC2!"
echo "====================================================================="
echo "🌐 Frontend Application: http://${PUBLIC_IP}"
echo "⚡ Backend REST API:     http://${PUBLIC_IP}:8000/docs"
echo "====================================================================="
