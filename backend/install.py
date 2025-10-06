#!/usr/bin/env python3
"""
Installation script for SafarSaga Backend API
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Error: {e.stderr}")
        return False

def main():
    """Main installation process"""
    print("🚀 SafarSaga Backend API Installation")
    print("=" * 50)
    
    # Check Python version
    if sys.version_info < (3, 9):
        print("❌ Python 3.9 or higher is required")
        sys.exit(1)
    
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    
    # Check if we're in a virtual environment
    if not hasattr(sys, 'real_prefix') and not (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        print("⚠️  Warning: Not in a virtual environment")
        response = input("Continue anyway? (y/N): ")
        if response.lower() != 'y':
            print("Please create and activate a virtual environment first:")
            print("  python -m venv venv")
            print("  # On Windows:")
            print("  venv\\Scripts\\activate")
            print("  # On macOS/Linux:")
            print("  source venv/bin/activate")
            sys.exit(1)
    
    # Install dependencies
    if not run_command("pip install --upgrade pip", "Upgrading pip"):
        sys.exit(1)
    
    if not run_command("pip install -r requirements.txt", "Installing dependencies"):
        sys.exit(1)
    
    # Check if .env file exists
    if not Path(".env").exists():
        print("📝 Creating .env file from template...")
        try:
            with open(".env.example", "r") as source:
                content = source.read()
            with open(".env", "w") as target:
                target.write(content)
            print("✅ .env file created")
            print("⚠️  Please update .env with your actual credentials")
        except FileNotFoundError:
            print("❌ .env.example not found")
    else:
        print("✅ .env file already exists")
    
    # Test installation
    print("\n🧪 Testing installation...")
    test_command = "python -c \"from app.main import app; print('✅ FastAPI app imports successfully')\""
    if run_command(test_command, "Testing FastAPI import"):
        print("\n🎉 Installation completed successfully!")
        print("\nNext steps:")
        print("1. Update .env with your Supabase and Cloudinary credentials")
        print("2. Run the development server:")
        print("   uvicorn app.main:app --reload --port 8000")
        print("3. Visit http://localhost:8000/docs for API documentation")
    else:
        print("\n❌ Installation test failed")
        print("Please check the error messages above and try again")

if __name__ == "__main__":
    main()