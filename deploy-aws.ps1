# =============================================================================
# AuraFlow-AI — Windows PowerShell Helper for AWS EC2 Deployment
# Usage:
#   .\deploy-aws.ps1 -EC2IP "54.xxx.xxx.xxx" -KeyPath "C:\path\to\your-key.pem"
# =============================================================================

param (
    [Parameter(Mandatory=$false)]
    [string]$EC2IP,

    [Parameter(Mandatory=$false)]
    [string]$KeyPath,

    [Parameter(Mandatory=$false)]
    [string]$User = "ubuntu"
)

if (-not $EC2IP) {
    $EC2IP = Read-Host "Enter your AWS EC2 Public IP address (e.g. 54.210.12.34)"
}

if (-not $KeyPath) {
    $KeyPath = Read-Host "Enter path to your AWS SSH Key file (e.g. C:\Users\name\Downloads\my-key.pem)"
}

# Clean path quotes
$KeyPath = $KeyPath.Trim('"').Trim("'")

if (-not (Test-Path $KeyPath)) {
    Write-Error "SSH Key file not found at path: $KeyPath"
    exit 1
}

Write-Host "🚀 Connecting to AWS EC2 Instance ($EC2IP) and starting deployment..." -ForegroundColor Green

# Remote bash script to execute on EC2 via SSH
$RemoteScript = @'
set -e
echo "📦 [1/4] Updating EC2 packages and installing Docker..."
sudo apt-get update -y
sudo apt-get install -y docker.io docker-compose-plugin git curl

echo "⚙️ [2/4] Starting Docker service..."
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER || true

echo "📥 [3/4] Fetching latest repository code..."
if [ -d "AuraFlow-AI" ]; then
    cd AuraFlow-AI && git pull
else
    git clone https://github.com/Anamika-67/AuraFlow-AI.git && cd AuraFlow-AI
fi

echo "🏗️ [4/4] Building and launching Docker containers..."
sudo docker compose down --remove-orphans || true
sudo docker compose up -d --build

echo "✅ Verification:"
sudo docker compose ps
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com || echo "EC2_IP")

echo ""
echo "====================================================================="
echo "🎉 SUCCESS! AuraFlow-AI is now live on AWS EC2:"
echo "🌐 Frontend App: http://$PUBLIC_IP"
echo "⚡ Backend API:  http://$PUBLIC_IP:8000/docs"
echo "====================================================================="
'@

ssh -o StrictHostKeyChecking=no -i "$KeyPath" "${User}@${EC2IP}" "$RemoteScript"
