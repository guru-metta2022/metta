#!/usr/bin/env bash
set -e

# ==============================================================================
# 🌿 Metta — One-Liner Quick Installer & Local Runner
# ==============================================================================
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/guru-metta2022/metta/main/install.sh | bash
# Or locally:
#   chmod +x install.sh && ./install.sh
# ==============================================================================

BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "\n${GREEN}${BOLD}==================================================================${NC}"
echo -e "${GREEN}${BOLD}🌿 Project Metta — Local Installation & Setup${NC}"
echo -e "${GREEN}${BOLD}==================================================================${NC}\n"

# 1. Determine or clone working directory
if [ -f "run_local.py" ] && [ -d "packages/metta-core" ]; then
    PROJECT_DIR="$(pwd)"
    echo -e "${BLUE}ℹ Working inside existing repository:${NC} ${PROJECT_DIR}"
else
    REPO_URL="https://github.com/guru-metta2022/metta.git"
    TARGET_DIR="metta"
    if [ ! -d "$TARGET_DIR" ]; then
        echo -e "${BLUE}📦 Cloning Metta repository from ${REPO_URL}...${NC}"
        if ! command -v git &> /dev/null; then
            echo -e "${RED}❌ git is required to clone the repository. Please install git and retry.${NC}"
            exit 1
        fi
        git clone "$REPO_URL" "$TARGET_DIR"
    fi
    cd "$TARGET_DIR"
    PROJECT_DIR="$(pwd)"
    echo -e "${BLUE}ℹ Working directory:${NC} ${PROJECT_DIR}"
fi

# 2. Check for Python 3
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ python3 is not installed or not in PATH.${NC}"
    echo -e "   Please install Python 3.10+ (https://www.python.org/downloads/)."
    exit 1
fi
echo -e "✓ Python 3 found: $(python3 --version)"

# 3. Check / Install uv (Fast Python package manager)
export PATH="$HOME/.local/bin:$HOME/.cargo/bin:$PATH"
if ! command -v uv &> /dev/null; then
    echo -e "${YELLOW}⚡ 'uv' not found. Installing uv (fast Python package manager)...${NC}"
    curl -LsSf https://astral.sh/uv/install.sh | sh
    export PATH="$HOME/.local/bin:$HOME/.cargo/bin:$PATH"
fi

if command -v uv &> /dev/null; then
    echo -e "✓ uv found: $(uv --version)"
else
    echo -e "${RED}❌ Failed to configure 'uv'. Please install it manually:${NC}"
    echo -e "   https://docs.astral.sh/uv/getting-started/installation/"
    exit 1
fi

# 4. Check for Node & npm (for Web App UI)
HAS_NPM=false
if command -v node &> /dev/null && command -v npm &> /dev/null; then
    HAS_NPM=true
    echo -e "✓ Node.js & npm found: Node $(node --version), npm $(npm --version)"
else
    echo -e "${YELLOW}⚠️ Node.js / npm was not found on your system.${NC}"
    echo -e "   The Python backend API & MCP server will run, but the pre-built web UI requires Node."
    echo -e "   Install Node.js (v18+ recommended): https://nodejs.org/"
fi

# 5. Setup default .env if missing
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo -e "⚙ Creating default .env configuration from .env.example..."
    cp .env.example .env
fi

# 6. Install Node dependencies and build Web App
if [ "$HAS_NPM" = true ]; then
    echo -e "\n${BLUE}📦 Installing web application dependencies...${NC}"
    npm install --silent
    echo -e "${BLUE}🔨 Building web application distribution...${NC}"
    npm run build --workspace=apps/webapp
    echo -e "${GREEN}✓ Web app built successfully.${NC}"
fi

# 7. Sync Python environments
echo -e "\n${BLUE}🐍 Syncing Python core and server environments via uv...${NC}"
(cd packages/metta-core && uv sync --quiet)
(cd packages/metta-server && uv sync --quiet)
echo -e "${GREEN}✓ Python packages synced successfully.${NC}"

# 8. Start local server
echo -e "\n${GREEN}${BOLD}==================================================================${NC}"
echo -e "${GREEN}${BOLD}🚀 Setup complete! Starting Metta local server...${NC}"
echo -e "${GREEN}${BOLD}==================================================================${NC}"

if [ -t 0 ]; then
    exec python3 run_local.py "$@"
else
    # Connected via pipe (e.g. curl ... | bash)
    exec python3 run_local.py "$@" < /dev/tty 2>/dev/null || exec python3 run_local.py "$@"
fi
