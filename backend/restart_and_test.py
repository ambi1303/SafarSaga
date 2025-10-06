#!/usr/bin/env python3
"""
Restart server and test signup
"""

import subprocess
import time
import requests
import json
import sys
import os
from threading import Thread

def start_server():
    """Start the FastAPI server"""
    try:
        # Change to backend directory
        os.chdir(os.path.dirname(os.path.abspath(__file__)))
        
        # Start server
        process = subprocess.Popen([
            sys.executable, "-m", "uvicorn", 
            "app.main:app", 
            "--reload", 
            "--port", "8000",
            "--host", "0.0.0.0"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        return process
    except Exception as e:
        print(f"Failed to start server: {e}")
        return None

def test_signup():
    """Test signup after server starts"""
    
    # Wait for server to start
    print("Waiting for server to start...")
    for i in range(30):  # Wait up to 30 seconds
        try:
            response = requests.get("http://localhost:8000/health", timeout=2)
            if response.status_code == 200:
                print("✅ Server is ready!")
                break
        except:
            pass
        time.sleep(1)
        print(f"Waiting... ({i+1}/30)")
    else:
        print("❌ Server failed to start within 30 seconds")
        return
    
    # Test signup
    print("\nTesting signup...")
    signup_data = {
        "email": "newuser@example.com",
        "password": "TestPassword123!",
        "full_name": "New Test User"
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/auth/signup",
            json=signup_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"Signup response status: {response.status_code}")
        
        if response.status_code == 201:
            print("✅ Signup successful!")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ Signup failed")
            try:
                error_data = response.json()
                print(f"Error: {json.dumps(error_data, indent=2)}")
            except:
                print(f"Raw error: {response.text}")
                
    except Exception as e:
        print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    print("Starting server and testing signup...")
    
    # Kill any existing server process
    try:
        subprocess.run(["taskkill", "/F", "/IM", "python.exe"], 
                      capture_output=True, check=False)
        time.sleep(2)
    except:
        pass
    
    # Start server in background
    server_process = start_server()
    
    if server_process:
        try:
            # Test signup
            test_signup()
        finally:
            # Clean up
            print("\nStopping server...")
            server_process.terminate()
            try:
                server_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                server_process.kill()
    else:
        print("Failed to start server")