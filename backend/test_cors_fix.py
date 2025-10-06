#!/usr/bin/env python3
"""
Test CORS configuration for localhost:3000 and safarsaga.co.in
"""

import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_cors_configuration():
    """Test CORS configuration"""
    
    print("🧪 Testing CORS Configuration...")
    print("=" * 50)
    
    # Test 1: Check environment variables
    print("1️⃣ Checking environment variables...")
    cors_origins = os.getenv("CORS_ORIGINS")
    environment = os.getenv("ENVIRONMENT", "development")
    
    print(f"   Environment: {environment}")
    print(f"   CORS Origins: {cors_origins}")
    
    # Test 2: Parse CORS origins
    print("\n2️⃣ Parsing CORS origins...")
    import ast
    try:
        origins = ast.literal_eval(cors_origins)
        print("✅ CORS origins parsed successfully:")
        for origin in origins:
            print(f"   - {origin}")
    except Exception as e:
        print(f"❌ Failed to parse CORS origins: {e}")
        return False
    
    # Test 3: Check required origins
    print("\n3️⃣ Checking required origins...")
    required_origins = [
        "http://localhost:3000",
        "https://safarsaga.co.in"
    ]
    
    missing_origins = []
    for required in required_origins:
        if required in origins:
            print(f"✅ {required} - Found")
        else:
            print(f"❌ {required} - Missing")
            missing_origins.append(required)
    
    if missing_origins:
        print(f"\n❌ Missing required origins: {missing_origins}")
        return False
    
    # Test 4: Check additional useful origins
    print("\n4️⃣ Checking additional origins...")
    additional_origins = [
        "https://localhost:3000",
        "http://127.0.0.1:3000",
        "https://www.safarsaga.co.in"
    ]
    
    for additional in additional_origins:
        if additional in origins:
            print(f"✅ {additional} - Found (good for compatibility)")
        else:
            print(f"⚠️  {additional} - Not found (optional)")
    
    print("\n🎉 CORS configuration test completed!")
    print("\nConfigured origins:")
    for origin in origins:
        print(f"  ✓ {origin}")
    
    print("\nNext steps:")
    print("1. Restart the backend server to apply changes")
    print("2. Test from frontend at localhost:3000")
    print("3. Test from production at safarsaga.co.in")
    
    return True

if __name__ == "__main__":
    success = test_cors_configuration()
    
    if success:
        print("\n✅ CORS configuration looks good!")
    else:
        print("\n❌ CORS configuration needs fixes!")
        sys.exit(1)