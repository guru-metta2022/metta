#!/usr/bin/env python3
"""Local runner script for Project Metta.

Starts the Metta backend server and serves both the API and the React Web App
on http://127.0.0.1:8000 with a single command.
"""

import os
import sys
import shutil
import subprocess
import pathlib

REPO_ROOT = pathlib.Path(__file__).parent.resolve()
WEB_DIST = REPO_ROOT / "apps" / "webapp" / "dist" / "index.html"


def print_banner():
    print("\n" + "=" * 65)
    print("🌿 Project Metta — Local Development & Simulation Server")
    print("=" * 65)
    print("• Web App UI:        http://127.0.0.1:8000")
    print("• REST API Gateway:  http://127.0.0.1:8000/api/health")
    print("• MCP SSE Endpoint:  http://127.0.0.1:8000/mcp/sse")
    print("=" * 65 + "\n")


def check_prerequisites():
    if not shutil.which("uv"):
        print("❌ 'uv' was not found on your system PATH.")
        print("   Please install uv: https://docs.astral.sh/uv/getting-started/installation/")
        print("   curl -LsSf https://astral.sh/uv/install.sh | sh")
        sys.exit(1)


def ensure_web_build():
    if not WEB_DIST.exists():
        print("📦 Web application build not detected. Building apps/webapp...")
        if shutil.which("npm"):
            try:
                subprocess.run(["npm", "run", "build", "--workspace=apps/webapp"], cwd=REPO_ROOT, check=True)
                print("✓ Web app built successfully.\n")
            except subprocess.CalledProcessError as e:
                print(f"⚠️ Warning: Could not pre-build webapp ({e}). The API will still run.\n")
        else:
            print("⚠️ Note: 'npm' not found. Pre-built UI will be skipped; backend API will still run.\n")


def main():
    check_prerequisites()
    ensure_web_build()
    print_banner()

    cmd = [
        "uv",
        "run",
        "--directory",
        str(REPO_ROOT / "packages" / "metta-server"),
        "uvicorn",
        "metta_server.main:app",
        "--host",
        "127.0.0.1",
        "--port",
        "8000",
    ]

    # Pass through reload if requested
    if "--reload" in sys.argv:
        cmd.append("--reload")

    print("🚀 Starting server... Press Ctrl+C to stop.\n")
    try:
        subprocess.run(cmd, cwd=REPO_ROOT)
    except KeyboardInterrupt:
        print("\n🌿 Metta server stopped. Walk in peace.")


if __name__ == "__main__":
    main()
