#!/usr/bin/env python3
"""
Script to fix service calls in router files
"""

import os
import re
from pathlib import Path

def fix_service_calls(file_path):
    """Fix service calls in a router file"""
    print(f"Fixing {file_path}...")
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Replace supabase_service calls
    content = re.sub(r'supabase_service\.', 'get_supabase_service().', content)
    
    # Replace cloudinary_service calls
    content = re.sub(r'cloudinary_service\.', 'get_cloudinary_service().', content)
    
    with open(file_path, 'w') as f:
        f.write(content)
    
    print(f"✅ Fixed {file_path}")

def main():
    """Fix all router files"""
    router_files = [
        "backend/app/routers/events.py",
        "backend/app/routers/bookings.py", 
        "backend/app/routers/gallery.py"
    ]
    
    for file_path in router_files:
        if os.path.exists(file_path):
            fix_service_calls(file_path)
        else:
            print(f"⚠️  File not found: {file_path}")
    
    print("\n🎉 All service calls fixed!")

if __name__ == "__main__":
    main()