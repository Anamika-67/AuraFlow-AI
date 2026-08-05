#!/usr/bin/env bash
# ===========================================================================
# AuraFlow-AI — AMD ROCm Setup Script
# ===========================================================================
# One-click setup for AMD Radeon GPU acceleration via ROCm.
#
# Supports:
#   - AMD Radeon RX 7900 XTX / 7900 XT / 7800 XT / 7700 XT / 7600
#   - AMD Radeon RX 6900 XT / 6800 XT / 6800 / 6700 XT / 6600 XT
#   - AMD Instinct MI300X / MI250X / MI210 / MI100
#
# Usage:
#   chmod +x deploy/rocm_setup.sh
#   sudo ./deploy/rocm_setup.sh
#
# ===========================================================================

set -euo pipefail

# ── Colors ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'  # No Color

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║         AuraFlow-AI — AMD ROCm GPU Setup Script            ║"
echo "║         Radeon GPU Acceleration for AI Inference            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ── Check if running as root ──
if [[ $EUID -ne 0 ]]; then
    echo -e "${RED}ERROR: This script must be run as root (sudo).${NC}"
    exit 1
fi

# ── Check OS ──
if ! grep -qi "ubuntu\|debian" /etc/os-release 2>/dev/null; then
    echo -e "${YELLOW}WARNING: This script is tested on Ubuntu 22.04/24.04. Other distros may need manual adjustments.${NC}"
fi

# ── Step 1: Detect AMD GPU ──
echo -e "\n${GREEN}[1/7] Detecting AMD GPU...${NC}"

GPU_INFO=$(lspci | grep -i "VGA\|Display" | grep -i "AMD\|Radeon\|ATI" || true)

if [[ -z "$GPU_INFO" ]]; then
    echo -e "${RED}ERROR: No AMD GPU detected. This script requires an AMD Radeon or Instinct GPU.${NC}"
    exit 1
fi

echo -e "  Found: ${CYAN}${GPU_INFO}${NC}"

# Detect GPU architecture from device ID
detect_gfx_version() {
    local gpu_lower
    gpu_lower=$(echo "$GPU_INFO" | tr '[:upper:]' '[:lower:]')

    if echo "$gpu_lower" | grep -qi "navi 31\|7900"; then
        echo "11.0.0"  # gfx1100
    elif echo "$gpu_lower" | grep -qi "navi 32\|7800\|7700"; then
        echo "11.0.1"  # gfx1101
    elif echo "$gpu_lower" | grep -qi "navi 33\|7600"; then
        echo "11.0.2"  # gfx1102
    elif echo "$gpu_lower" | grep -qi "navi 21\|6900\|6800"; then
        echo "10.3.0"  # gfx1030
    elif echo "$gpu_lower" | grep -qi "navi 22\|6700"; then
        echo "10.3.1"  # gfx1031
    elif echo "$gpu_lower" | grep -qi "navi 23\|6600"; then
        echo "10.3.2"  # gfx1032
    elif echo "$gpu_lower" | grep -qi "mi300"; then
        echo "9.4.2"   # gfx942
    elif echo "$gpu_lower" | grep -qi "mi250\|mi210"; then
        echo "9.0.10"  # gfx90a
    elif echo "$gpu_lower" | grep -qi "mi100"; then
        echo "9.0.8"   # gfx908
    else
        echo "11.0.0"  # Default to RDNA3
    fi
}

GFX_VERSION=$(detect_gfx_version)
echo -e "  Architecture: ${CYAN}GFX ${GFX_VERSION}${NC}"

# ── Step 2: Install ROCm 6.1 ──
echo -e "\n${GREEN}[2/7] Installing AMD ROCm 6.1...${NC}"

# Add ROCm repository
if [[ ! -f /etc/apt/sources.list.d/rocm.list ]]; then
    echo "  Adding ROCm APT repository..."
    wget -qO - https://repo.radeon.com/rocm/rocm.gpg.key | gpg --dearmor -o /etc/apt/keyrings/rocm.gpg
    echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/rocm.gpg] https://repo.radeon.com/rocm/apt/6.1 jammy main" \
        > /etc/apt/sources.list.d/rocm.list
    echo "  ROCm repository added."
else
    echo "  ROCm repository already configured."
fi

apt-get update -qq

# Install ROCm core packages
echo "  Installing ROCm packages (this may take a few minutes)..."
apt-get install -y --no-install-recommends \
    rocm-dev \
    rocm-libs \
    rocm-smi-lib \
    rocminfo \
    hip-runtime-amd \
    miopen-hip \
    rocblas \
    rocrand \
    rccl \
    2>&1 | tail -5

echo -e "  ${GREEN}ROCm 6.1 installed successfully.${NC}"

# ── Step 3: Configure GPU access permissions ──
echo -e "\n${GREEN}[3/7] Configuring GPU access permissions...${NC}"

# Add current user to video and render groups
REAL_USER=${SUDO_USER:-$(whoami)}
usermod -aG video "$REAL_USER" 2>/dev/null || true
usermod -aG render "$REAL_USER" 2>/dev/null || true
echo -e "  User '${REAL_USER}' added to video and render groups."

# ── Step 4: Install PyTorch for ROCm ──
echo -e "\n${GREEN}[4/7] Installing PyTorch with ROCm support...${NC}"

pip install --no-cache-dir \
    torch torchvision torchaudio \
    --index-url https://download.pytorch.org/whl/rocm6.1 \
    2>&1 | tail -3

echo -e "  ${GREEN}PyTorch (ROCm 6.1) installed.${NC}"

# ── Step 5: Install AuraFlow-AI Python dependencies ──
echo -e "\n${GREEN}[5/7] Installing AuraFlow-AI dependencies...${NC}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

if [[ -f "$PROJECT_ROOT/backend/requirements.txt" ]]; then
    pip install --no-cache-dir -r "$PROJECT_ROOT/backend/requirements.txt" 2>&1 | tail -3
    echo -e "  ${GREEN}Backend dependencies installed.${NC}"
else
    echo -e "  ${YELLOW}WARNING: backend/requirements.txt not found. Install manually.${NC}"
fi

# ── Step 6: Install FFmpeg ──
echo -e "\n${GREEN}[6/7] Installing FFmpeg...${NC}"
apt-get install -y --no-install-recommends ffmpeg 2>/dev/null
echo -e "  ${GREEN}FFmpeg installed.${NC}"

# ── Step 7: Set environment variables ──
echo -e "\n${GREEN}[7/7] Configuring environment variables...${NC}"

ENV_FILE="/etc/profile.d/auraflow-rocm.sh"
cat > "$ENV_FILE" <<EOF
# AuraFlow-AI — ROCm Environment Variables
export HSA_OVERRIDE_GFX_VERSION=${GFX_VERSION}
export PYTORCH_ROCM_ARCH=gfx$(echo ${GFX_VERSION} | tr '.' '')
export HIP_VISIBLE_DEVICES=0
export PYTORCH_HIP_ALLOC_CONF=max_split_size_mb:512
export TORCH_COMPILE_BACKEND=inductor
export ROCm_PATH=/opt/rocm
export PATH=\$PATH:/opt/rocm/bin:/opt/rocm/hip/bin
EOF

source "$ENV_FILE"
echo -e "  Environment variables written to ${ENV_FILE}"

# ── Verification ──
echo -e "\n${CYAN}══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  AMD ROCm Setup Complete!${NC}"
echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"

echo -e "\n${GREEN}Verifying installation...${NC}"

# Verify rocm-smi
echo -e "\n  ${YELLOW}rocm-smi:${NC}"
rocm-smi --showid 2>/dev/null || echo "    (rocm-smi not responding — reboot may be required)"

# Verify PyTorch ROCm
echo -e "\n  ${YELLOW}PyTorch ROCm:${NC}"
python3 -c "
import torch
print(f'    PyTorch Version:  {torch.__version__}')
print(f'    ROCm (HIP):      {torch.version.hip}')
print(f'    CUDA Available:   {torch.cuda.is_available()}')
if torch.cuda.is_available():
    print(f'    GPU Name:         {torch.cuda.get_device_name(0)}')
    props = torch.cuda.get_device_properties(0)
    vram_gb = props.total_mem / (1024**3)
    print(f'    VRAM:             {vram_gb:.1f} GB')
    print(f'    torch.compile:    Available')
" 2>/dev/null || echo "    (PyTorch verification failed)"

echo -e "\n${GREEN}Next steps:${NC}"
echo -e "  1. Log out and back in (for group permissions)"
echo -e "  2. cd $PROJECT_ROOT"
echo -e "  3. python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000"
echo -e "  4. Open http://localhost:8000/docs in your browser"
echo ""
