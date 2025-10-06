#!/usr/bin/env python3
"""
Data validation and consistency checks for booking system
"""

import os
import sys
from pathlib import Path
from typing import List, Dict, Any

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.append(str(backend_dir))

try:
    from supabase import create_client
    from dotenv import load_dotenv
except ImportError:
    print("Error: Required packages not installed. Run: pip install supabase python-dotenv")
    sys.exit(1)


class BookingDataValidator:
    """Validates booking system data consistency"""
    
    def __init__(self):
        load_dotenv()
        
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file")
        
        self.client = create_client(self.supabase_url, self.supabase_key)
        self.issues = []
    
    def validate_destinations_table(self) -> Dict[str, Any]:
        """Validate destinations table structure and data"""
        print("🔍 Validating destinations table...")
        
        try:
            # Check if table exists and has data
            response = self.client.table('destinations').select('*').execute()
            destinations = response.data
            
            if not destinations:
                self.issues.append("❌ No destinations found in destinations table")
                return {"status": "error", "count": 0}
            
            # Validate each destination
            valid_destinations = 0
            for dest in destinations:
                issues = []
                
                # Check required fields
                if not dest.get('name'):
                    issues.append("Missing name")
                if not dest.get('state'):
                    issues.append("Missing state")
                if not dest.get('average_cost_per_day'):
                    issues.append("Missing average_cost_per_day")
                
                # Check data types
                if dest.get('average_cost_per_day') and not isinstance(dest['average_cost_per_day'], (int, float)):
                    issues.append("Invalid average_cost_per_day type")
                
                if issues:
                    self.issues.append(f"❌ Destination '{dest.get('name', 'Unknown')}': {', '.join(issues)}")
                else:
                    valid_destinations += 1
            
            print(f"✅ Found {len(destinations)} destinations, {valid_destinations} valid")
            return {"status": "success", "count": len(destinations), "valid": valid_destinations}
            
        except Exception as e:
            self.issues.append(f"❌ Error validating destinations table: {e}")
            return {"status": "error", "error": str(e)}
    
    def validate_tickets_table_structure(self) -> Dict[str, Any]:
        """Validate tickets table has required columns"""
        print("🔍 Validating tickets table structure...")
        
        try:
            # Try to select with new columns
            response = self.client.table('tickets').select('id, destination_id, contact_info, travel_date').limit(1).execute()
            
            print("✅ Tickets table has required columns (destination_id, contact_info, travel_date)")
            return {"status": "success"}
            
        except Exception as e:
            self.issues.append(f"❌ Tickets table missing required columns: {e}")
            return {"status": "error", "error": str(e)}
    
    def validate_booking_data_consistency(self) -> Dict[str, Any]:
        """Validate booking data consistency"""
        print("🔍 Validating booking data consistency...")
        
        try:
            # Get all bookings
            response = self.client.table('tickets').select('*').execute()
            bookings = response.data
            
            if not bookings:
                print("ℹ️  No bookings found (this is normal for new installations)")
                return {"status": "success", "count": 0}
            
            # Validate each booking
            valid_bookings = 0
            for booking in bookings:
                issues = []
                
                # Check that booking has either destination_id or event_id
                if not booking.get('destination_id') and not booking.get('event_id'):
                    issues.append("Missing both destination_id and event_id")
                
                # Check required fields
                if not booking.get('user_id'):
                    issues.append("Missing user_id")
                if not booking.get('seats') or booking['seats'] < 1:
                    issues.append("Invalid seats count")
                if not booking.get('total_amount') or booking['total_amount'] < 0:
                    issues.append("Invalid total_amount")
                
                # Check booking status
                valid_statuses = ['pending', 'confirmed', 'cancelled']
                if booking.get('booking_status') not in valid_statuses:
                    issues.append(f"Invalid booking_status: {booking.get('booking_status')}")
                
                # Check payment status
                valid_payment_statuses = ['unpaid', 'paid', 'refunded']
                if booking.get('payment_status') not in valid_payment_statuses:
                    issues.append(f"Invalid payment_status: {booking.get('payment_status')}")
                
                if issues:
                    self.issues.append(f"❌ Booking {booking.get('id', 'Unknown')}: {', '.join(issues)}")
                else:
                    valid_bookings += 1
            
            print(f"✅ Found {len(bookings)} bookings, {valid_bookings} valid")
            return {"status": "success", "count": len(bookings), "valid": valid_bookings}
            
        except Exception as e:
            self.issues.append(f"❌ Error validating booking data: {e}")
            return {"status": "error", "error": str(e)}
    
    def validate_foreign_key_relationships(self) -> Dict[str, Any]:
        """Validate foreign key relationships"""
        print("🔍 Validating foreign key relationships...")
        
        try:
            # Check bookings with destination_id have valid destinations
            response = self.client.table('tickets').select('id, destination_id').not_.is_('destination_id', 'null').execute()
            destination_bookings = response.data
            
            orphaned_bookings = 0
            for booking in destination_bookings:
                dest_response = self.client.table('destinations').select('id').eq('id', booking['destination_id']).execute()
                if not dest_response.data:
                    orphaned_bookings += 1
                    self.issues.append(f"❌ Booking {booking['id']} references non-existent destination {booking['destination_id']}")
            
            if orphaned_bookings == 0:
                print("✅ All destination bookings have valid destination references")
            else:
                print(f"❌ Found {orphaned_bookings} bookings with invalid destination references")
            
            return {"status": "success" if orphaned_bookings == 0 else "warning", "orphaned": orphaned_bookings}
            
        except Exception as e:
            self.issues.append(f"❌ Error validating foreign keys: {e}")
            return {"status": "error", "error": str(e)}
    
    def validate_booking_details_view(self) -> Dict[str, Any]:
        """Validate booking_details view works correctly"""
        print("🔍 Validating booking_details view...")
        
        try:
            response = self.client.table('booking_details').select('*').limit(5).execute()
            
            print("✅ booking_details view is accessible and working")
            return {"status": "success", "sample_count": len(response.data)}
            
        except Exception as e:
            self.issues.append(f"❌ booking_details view error: {e}")
            return {"status": "error", "error": str(e)}
    
    def run_all_validations(self) -> Dict[str, Any]:
        """Run all validation checks"""
        print("🚀 Starting booking system data validation...\n")
        
        results = {
            "destinations": self.validate_destinations_table(),
            "tickets_structure": self.validate_tickets_table_structure(),
            "booking_data": self.validate_booking_data_consistency(),
            "foreign_keys": self.validate_foreign_key_relationships(),
            "booking_view": self.validate_booking_details_view()
        }
        
        # Summary
        print("\n📊 Validation Summary:")
        
        success_count = sum(1 for r in results.values() if r.get("status") == "success")
        warning_count = sum(1 for r in results.values() if r.get("status") == "warning")
        error_count = sum(1 for r in results.values() if r.get("status") == "error")
        
        print(f"✅ Successful checks: {success_count}")
        if warning_count > 0:
            print(f"⚠️  Warnings: {warning_count}")
        if error_count > 0:
            print(f"❌ Errors: {error_count}")
        
        # Print issues
        if self.issues:
            print("\n🔍 Issues Found:")
            for issue in self.issues:
                print(f"  {issue}")
        else:
            print("\n🎉 No issues found! Booking system data is consistent.")
        
        overall_status = "success"
        if error_count > 0:
            overall_status = "error"
        elif warning_count > 0:
            overall_status = "warning"
        
        return {
            "overall_status": overall_status,
            "checks": results,
            "issues": self.issues,
            "summary": {
                "success": success_count,
                "warnings": warning_count,
                "errors": error_count
            }
        }


def main():
    """Main validation function"""
    try:
        validator = BookingDataValidator()
        results = validator.run_all_validations()
        
        # Exit with appropriate code
        if results["overall_status"] == "error":
            sys.exit(1)
        elif results["overall_status"] == "warning":
            sys.exit(2)
        else:
            sys.exit(0)
            
    except Exception as e:
        print(f"❌ Validation failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()