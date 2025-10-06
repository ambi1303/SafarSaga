"""
Script to restart the backend server
"""
import subprocess
import sys
import time
import os

def restart_backend():
    """Restart the backend server"""
    print("Restarting backend server...")
    print("=" * 50)
    
    # The server should auto-reload if running with --reload flag
    # Just touch the main.py file to trigger reload
    main_py = os.path.join(os.path.dirname(__file__), "app", "main.py")
    
    if os.path.exists(main_py):
        # Touch the file to trigger reload
        os.utime(main_py, None)
        print(f"Touched {main_py} to trigger auto-reload")
        print("\nIf the server is running with --reload flag, it should restart automatically.")
        print("Otherwise, please manually restart the server:")
        print("  cd backend")
        print("  uvicorn app.main:app --reload --port 8000")
    else:
        print(f"Error: Could not find {main_py}")
        return False
    
    return True

if __name__ == "__main__":
    restart_backend()
