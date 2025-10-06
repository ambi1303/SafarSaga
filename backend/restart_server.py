#!/usr/bin/env python3
"""
Restart the SafarSaga backend server with updated CORS configuration
"""

import os
import sys
import subprocess
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def restart_server():
    """Restart the backend server"""
    
    print("🔄 Restarting SafarSaga Backend Server...")
    print("=" * 50)
    
    # Check if server is running and kill it
    print("1️⃣ Stopping existing server...")
    try:
        # Kill any existing uvicorn processes
        if os.name == 'nt':  # Windows
            subprocess.run(['taskkill', '/f', '/im', 'python.exe'], 
                         capture_output=True, check=False)
        else:  # Unix/Linux/Mac
            subprocess.run(['pkill', '-f', 'uvicorn'], 
                         capture_output=True, check=False)
        print("✅ Existing server processes stopped")
    except Exception as e:
        print(f"⚠️  Could not stop existing processes: {e}")
    
    # Wait a moment
    time.sleep(2)
    
    # Start the server
    print("\n2️⃣ Starting server with updated CORS configuration...")
    
    try:
        # Get configuration
        port = int(os.getenv("PORT", 8000))
        environment = os.getenv("ENVIRONMENT", "development")
        
        print(f"   Environment: {environment}")
        print(f"   Port: {port}")
        print(f"   CORS Origins: {os.getenv('CORS_ORIGINS', 'default')}")
        
        # Start uvicorn
        print(f"\n🚀 Starting server on http://localhost:{port}")
        print("   Press Ctrl+C to stop the server")
        print("   API Documentation: http://localhost:8000/docs")
        print("=" * 50)
        
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "app.main:app",
            "--reload",
            "--host", "0.0.0.0", 
            "--port", str(port),
            "--log-level", "info"
        ])
        
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    restart_server()