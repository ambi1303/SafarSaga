#!/usr/bin/env python3
"""
Start the FastAPI server
"""

import uvicorn
import sys
import os

if __name__ == "__main__":
    try:
        print("🚀 Starting SafarSaga FastAPI server...")
        print("📍 Server will be available at: http://localhost:8000")
        print("📖 API docs will be available at: http://localhost:8000/docs")
        print("🔄 Auto-reload is enabled for development")
        print("-" * 50)
        
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Failed to start server: {str(e)}")
        sys.exit(1)