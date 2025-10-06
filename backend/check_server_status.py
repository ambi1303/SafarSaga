#!/usr/bin/env python3
"""
Check if the backend server is running and accessible
"""

import subprocess
import sys
import time
import os

def check_server_status():
    """Check if the server is running"""
    
    print("🔍 Checking Backend Server Status...")
    print("=" * 40)
    
    # Check if uvicorn process is running
    try:
        if os.name == 'nt':  # Windows
            result = subprocess.run(['tasklist', '/FI', 'IMAGENAME eq python.exe'], 
                                  capture_output=True, text=True)
            if 'python.exe' in result.stdout:
                print("✅ Python processes found running")
            else:
                print("❌ No Python processes found")
        else:  # Unix/Linux/Mac
            result = subprocess.run(['pgrep', '-f', 'uvicorn'], 
                                  capture_output=True, text=True)
            if result.stdout.strip():
                print("✅ Uvicorn process found running")
            else:
                print("❌ No uvicorn process found")
    except Exception as e:
        print(f"⚠️  Could not check processes: {e}")
    
    # Try to connect to the server
    print("\n🌐 Testing server connectivity...")
    try:
        import urllib.request
        import urllib.error
        
        # Test health endpoint
        try:
            response = urllib.request.urlopen('http://localhost:8000/health', timeout=5)
            if response.getcode() == 200:
                print("✅ Server is responding on port 8000")
                data = response.read().decode('utf-8')
                print(f"   Health check response: {data[:100]}...")
                return True
            else:
                print(f"❌ Server responded with status: {response.getcode()}")
        except urllib.error.URLError as e:
            print(f"❌ Cannot connect to server: {e}")
        except Exception as e:
            print(f"❌ Connection error: {e}")
    
    except ImportError:
        print("⚠️  Cannot test connectivity (urllib not available)")
    
    print("\n📋 Server Status Summary:")
    print("❌ Backend server is not running or not accessible")
    print("\n🚀 To start the server:")
    print("1. cd backend")
    print("2. .\\venv\\Scripts\\Activate.ps1")
    print("3. python start_server.py")
    
    return False

if __name__ == "__main__":
    is_running = check_server_status()
    
    if not is_running:
        print("\n❌ Server is not running!")
        sys.exit(1)
    else:
        print("\n✅ Server is running and accessible!")