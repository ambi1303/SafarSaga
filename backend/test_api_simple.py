#!/usr/bin/env python3
"""
Simple API test using requests
Tests the API endpoints without complex dependencies
"""

import requests
import json
import time
import subprocess
import sys
from pathlib import Path

def start_server():
    """Start the FastAPI server in background"""
    print("🚀 Starting FastAPI server...")
    
    try:
        # Start server in background
        process = subprocess.Popen([
            sys.executable, "-m", "uvicorn", "app.main:app", 
            "--host", "127.0.0.1", "--port", "8001"
        ], cwd=Path(__file__).parent)
        
        # Wait for server to start
        time.sleep(3)
        
        # Test if server is running
        try:
            response = requests.get("http://127.0.0.1:8001/", timeout=5)
            print("✅ Server started successfully")
            return process
        except requests.exceptions.RequestException:
            print("❌ Server failed to start")
            process.terminate()
            return None
            
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        return None

def test_destinations_endpoint():
    """Test the destinations endpoint"""
    print("🧪 Testing /api/destinations endpoint...")
    
    try:
        response = requests.get("http://127.0.0.1:8001/api/destinations", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, dict) and 'items' in data:
                destinations = data['items']
                print(f"✅ Destinations endpoint works - found {len(destinations)} destinations")
                
                if destinations:
                    sample = destinations[0]
                    print(f"   Sample: {sample.get('name', 'Unknown')} - ₹{sample.get('average_cost_per_day', 0)}/day")
                
                return True
            else:
                print(f"❌ Unexpected response format: {data}")
                return False
        else:
            print(f"❌ Destinations endpoint failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Destinations endpoint error: {e}")
        return False

def test_health_endpoint():
    """Test basic health/root endpoint"""
    print("🧪 Testing root endpoint...")
    
    try:
        response = requests.get("http://127.0.0.1:8001/", timeout=5)
        
        if response.status_code == 200:
            print("✅ Root endpoint works")
            return True
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Root endpoint error: {e}")
        return False

def test_docs_endpoint():
    """Test API documentation endpoint"""
    print("🧪 Testing /docs endpoint...")
    
    try:
        response = requests.get("http://127.0.0.1:8001/docs", timeout=5)
        
        if response.status_code == 200:
            print("✅ API docs endpoint works")
            return True
        else:
            print(f"❌ API docs failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ API docs error: {e}")
        return False

def main():
    """Run API tests"""
    print("🚀 Starting API endpoint tests...\n")
    
    # Start server
    server_process = start_server()
    if not server_process:
        print("❌ Cannot start server, aborting tests")
        return False
    
    try:
        tests = [
            ("Health Check", test_health_endpoint),
            ("API Documentation", test_docs_endpoint),
            ("Destinations Endpoint", test_destinations_endpoint)
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            print(f"\n--- {test_name} ---")
            try:
                result = test_func()
                if result:
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"❌ Test '{test_name}' crashed: {e}")
                failed += 1
        
        # Summary
        print(f"\n📊 API Test Summary:")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📋 Total: {len(tests)}")
        
        if failed == 0:
            print(f"\n🎉 All API tests passed! Backend is working correctly.")
            return True
        else:
            print(f"\n⚠️  {failed} test(s) failed.")
            return False
            
    finally:
        # Stop server
        if server_process:
            print("\n🛑 Stopping server...")
            server_process.terminate()
            server_process.wait()

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n🛑 Tests interrupted by user")
        sys.exit(1)