#!/usr/bin/env python3
"""
Startup script for SafarSaga Backend API
"""

import os
import sys
import subprocess
from pathlib import Path

def check_environment():
    """Check if environment is properly set up"""
    print("🔍 Checking environment...")
    
    # Check if .env exists
    if not Path(".env").exists():
        print("❌ .env file not found")
        print("Please run: python install.py")
        return False
    
    # Check if required environment variables are set
    from dotenv import load_dotenv
    load_dotenv()
    
    required_vars = [
        "SUPABASE_URL",
        "SUPABASE_SERVICE_ROLE_KEY"
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var) or os.getenv(var).startswith("your_"):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing or placeholder environment variables: {', '.join(missing_vars)}")
        print("Please update your .env file with actual values")
        return False
    
    print("✅ Environment check passed")
    return True

def start_server():
    """Start the FastAPI server"""
    if not check_environment():
        sys.exit(1)
    
    print("🚀 Starting SafarSaga Backend API...")
    print("📍 Server will be available at: http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🔄 Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        # Start uvicorn server
        subprocess.run([
            "uvicorn", 
            "app.main:app", 
            "--reload", 
            "--port", "8000",
            "--host", "0.0.0.0"
        ], check=True)
    except KeyboardInterrupt:
        print("\n👋 Server stopped")
    except subprocess.CalledProcessError as e:
        print(f"❌ Server failed to start: {e}")
        sys.exit(1)
    except FileNotFoundError:
        print("❌ uvicorn not found. Please install dependencies:")
        print("   pip install -r requirements.txt")
        sys.exit(1)

if __name__ == "__main__":
    start_server()