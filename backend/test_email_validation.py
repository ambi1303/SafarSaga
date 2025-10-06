#!/usr/bin/env python3

import sys
import os

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

def test_email_validation():
    """Test the email validation function"""
    
    print("🧪 Testing Email Validation")
    print("=" * 40)
    
    try:
        from middleware.auth import AuthUtils
        
        # Test cases
        test_emails = [
            ("kallu@gmail.com", True, "Valid Gmail address"),
            ("test@example.com", True, "Valid standard email"),
            ("user.name+tag@domain.co.uk", True, "Valid complex email"),
            ("invalid-email", False, "Invalid - no @ symbol"),
            ("@domain.com", False, "Invalid - no local part"),
            ("user@", False, "Invalid - no domain"),
            ("user@domain", False, "Invalid - no TLD"),
            ("", False, "Invalid - empty string"),
        ]
        
        all_passed = True
        
        for email, expected, description in test_emails:
            try:
                result = AuthUtils.is_valid_email(email)
                status = "✅ PASS" if result == expected else "❌ FAIL"
                print(f"{status}: {description} - '{email}' -> {result}")
                
                if result != expected:
                    all_passed = False
                    
            except Exception as e:
                print(f"❌ ERROR: {description} - '{email}' -> Exception: {e}")
                all_passed = False
        
        return all_passed
        
    except Exception as e:
        print(f"❌ Failed to import AuthUtils: {e}")
        return False

if __name__ == "__main__":
    success = test_email_validation()
    
    if success:
        print("\n🎉 All email validation tests passed!")
    else:
        print("\n💥 Some email validation tests failed!")