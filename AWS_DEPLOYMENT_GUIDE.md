# 🚀 AWS Deployment Guide — AuraFlow-AI

This document provides a comprehensive, step-by-step walkthrough to deploy **AuraFlow-AI** on **Amazon Web Services (AWS)**.

---

## 🛠️ Overview of Deployment Options

| Option | Architecture | Best For | Setup Time | Cost Efficiency |
|---|---|---|---|---|
| **Method 1 (Recommended)** | **AWS EC2 + Docker Compose** | Complete App (Frontend + FastAPI Backend + GPU support) | ~10 mins | 🟢 High (Single Instance) |
| **Method 2 (Cloud Native)** | **AWS App Runner / ECS + S3 + CloudFront** | Production Serverless & Scalable Web Frontend | ~25 mins | 🟡 Moderate |

---

# 📍 Method 1: Deploy on AWS EC2 using Docker Compose (Recommended)

This is the fastest and most seamless way to deploy AuraFlow-AI with all services, persistent storage, and WebSocket telemetry included.

---

### Step 1: Launch an AWS EC2 Instance

1. Log into your **AWS Management Console** and navigate to **EC2**.
2. Click **Launch Instance**.
3. **Name**: `AuraFlow-AI-Server`
4. **AMI (Amazon Machine Image)**: Select **Ubuntu 22.04 LTS (64-bit x86)**.
5. **Instance Type**:
   - **For Testing / CPU-only**: `t3.medium` or `t3.large` (2-4 vCPUs, 4-8 GB RAM).
   - **For GPU Acceleration (NVIDIA)**: `g4dn.xlarge` or `g5.xlarge`.
   - **For GPU Acceleration (AMD Radeon / ROCm)**: `g4ad.xlarge`.
6. **Key Pair**: Select an existing key pair or create a new one (save the `.pem` file to connect via SSH).

---

### Step 2: Configure AWS Security Group Rules

Under **Network Settings**, edit or create a Security Group with the following **Inbound Rules**:

| Type | Port Range | Source | Purpose |
|---|---|---|---|
| **SSH** | `22` | My IP / `0.0.0.0/0` | Secure shell access |
| **HTTP** | `80` | `0.0.0.0/0` | Web Frontend access |
| **HTTPS** | `443` | `0.0.0.0/0` | Secure SSL Web access |
| **Custom TCP** | `8000` | `0.0.0.0/0` | FastAPI Backend API & WebSockets |

*Click **Launch Instance**.*

---

### Step 3: Connect to your EC2 Instance

Open your terminal or PowerShell and SSH into your instance using your EC2 public IP address:

```bash
ssh -i /path/to/your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

---

### Step 4: Install Docker & Docker Compose on EC2

Run the following commands on your EC2 terminal:

```bash
# Update package list and install Docker & Git
sudo apt update && sudo apt install -y docker.io docker-compose-plugin git curl

# Start and enable Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Allow non-root user to run Docker
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker compose version
```

---

### Step 5: Clone the Repository & Start the Containers

1. Clone your project repository onto the EC2 instance:
   ```bash
   git clone https://github.com/Anamika-67/AuraFlow-AI.git
   cd AuraFlow-AI
   ```

2. Build and launch all services with Docker Compose:
   ```bash
   docker compose up -d --build
   ```

3. Check running containers:
   ```bash
   docker compose ps
   ```

4. View backend logs to verify startup:
   ```bash
   docker compose logs -f backend
   ```

---

### Step 6: Access your Deployed Web App

Once the containers are running, open your web browser:
- **Frontend Dashboard**: `http://YOUR_EC2_PUBLIC_IP`
- **FastAPI API Documentation**: `http://YOUR_EC2_PUBLIC_IP:8000/docs`
- **System Health Check**: `http://YOUR_EC2_PUBLIC_IP:8000/`

---

# 🔒 Step 7: Setup Custom Domain & Free SSL (HTTPS) with Certbot (Optional)

If you own a domain name (e.g. `auraflow.yourdomain.com`), point your A record in Route53 / Namecheap / GoDaddy to your **EC2 Public IP**, then run:

```bash
# Install Certbot & Nginx plugin
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL Certificate
sudo certbot --nginx -d auraflow.yourdomain.com
```

Certbot will automatically update Nginx to enable **HTTPS (Port 443)** with auto-renewing SSL certificates!

---

# ☁️ Method 2: Deploy Backend to AWS App Runner / ECS & Frontend to S3 + CloudFront

If you prefer serverless / managed cloud components:

### 1. Frontend (Static Hosting on Amazon S3 + CloudFront)
1. Build frontend static assets locally or in CI/CD:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
2. Create an **AWS S3 Bucket** (e.g. `auraflow-frontend-bucket`) and upload all files from `frontend/dist`.
3. Enable **Static Website Hosting** on S3.
4. Create an **Amazon CloudFront Distribution** pointing to your S3 bucket for global CDN caching and HTTPS.

### 2. Backend (Container on AWS ECR & AWS App Runner)
1. Push backend Docker image to AWS Elastic Container Registry (ECR):
   ```bash
   aws ecr create-repository --repository-name auraflow-backend
   docker build -t auraflow-backend -f backend/Dockerfile .
   docker tag auraflow-backend:latest <AWS_ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/auraflow-backend:latest
   docker push <AWS_ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/auraflow-backend:latest
   ```
2. Go to **AWS App Runner** -> Create Service -> Select your ECR image -> Expose Port `8000`.

---

## ⚙️ Environment Variables Reference

| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `8000` | Port for FastAPI Backend |
| `HOST` | `0.0.0.0` | Binding host IP |
| `ALLOWED_ORIGINS` | `*` | Allowed CORS origins (comma-separated for specific domains) |
| `VITE_API_BASE_URL` | `""` (relative) | Base URL for REST API calls from Frontend |
| `VITE_WS_BASE_URL` | Auto-detected | Base URL for WebSocket connections |

---

## 🛠️ Operational Commands Cheat Sheet

```bash
# View live logs for all services
docker compose logs -f

# Restart services
docker compose restart

# Stop all services
docker compose down

# Rebuild after pulling latest code
git pull
docker compose up -d --build
```
