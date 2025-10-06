#!/usr/bin/env python3

# Script to fix the corrupted AuthUtils class in auth middleware

def fix_auth_middleware():
    """Fix the corrupted email validation in auth middleware"""
    
    print("🔧 Fixing AuthUtils email validation...")
    
    # Read the current file
    with open('app/middleware/auth.py', 'r') as f:
        content = f.read()
    
    # Find and replace the corrupted email validation method
    old_method = '''    @staticmethod
    def is_valid_email(email: str) -> bool:
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}
        return re.match(pattern, email) is not None
        return re.match(pattern, email) is not None'''
    
    new_method = '''    @staticmethod
    def is_valid_email(email: str) -> bool:
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None'''
    
    # Replace the corrupted method
    if old_method in content:
        content = content.replace(old_method, new_method)
        print("✅ Found and fixed the corrupted method")
    else:
        # Try alternative patterns that might exist
        patterns_to_try = [
            (r'pattern = r\'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^$]*\n.*return re\.match.*\n.*return re\.match.*', 
             '''pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None'''),
        ]
        
        import re as regex
        for pattern, replacement in patterns_to_try:
            if regex.search(pattern, content, regex.MULTILINE | regex.DOTALL):
                content = regex.sub(pattern, replacement, content, flags=regex.MULTILINE | regex.DOTALL)
                print("✅ Fixed using regex pattern matching")
                break
        else:
            print("❌ Could not find the corrupted method to fix")
            return False
    
    # Write the fixed content back
    with open('app/middleware/auth.py', 'w') as f:
        f.write(content)
    
    print("✅ Auth middleware file updated")
    
    # Test the syntax
    try:
        import py_compile
        py_compile.compile('app/middleware/auth.py', doraise=True)
        print("✅ Syntax check passed")
        return True
    except py_compile.PyCompileError as e:
        print(f"❌ Syntax error still exists: {e}")
        return False

if __name__ == "__main__":
    success = fix_auth_middleware()
    if success:
        print("\n🎉 Auth middleware fixed successfully!")
    else:
        print("\n💥 Failed to fix auth middleware!")