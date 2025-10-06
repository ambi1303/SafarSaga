#!/usr/bin/env python3
"""
Fix event dates to be in the future so bookings can be created
"""

import os
import sys
import asyncio
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from services.supabase_service import SupabaseService

# Load environment variables
load_dotenv()

async def fix_event_dates():
    """Update event dates to be in the future"""
    
    print("🔧 Fixing event dates...")
    print("=" * 30)
    
    try:
        # Initialize service
        supabase_service = SupabaseService()
        
        # Get all events
        events, total = await supabase_service.get_events({}, limit=10, offset=0)
        
        if not events:
            print("❌ No events found")
            return False
        
        # Calculate future dates
        base_date = datetime.now(timezone.utc) + timedelta(days=30)
        
        for i, event in enumerate(events):
            print(f"Updating {event.name}...")
            
            # Calculate new dates
            start_date = base_date + timedelta(days=i*7)  # Space events 1 week apart
            end_date = start_date + timedelta(days=3)     # 3-day trips
            
            update_data = {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            }
            
            try:
                updated_event = await supabase_service.update_event(event.id, update_data)
                print(f"✅ Updated {event.name}: {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}")
            except Exception as e:
                print(f"❌ Failed to update {event.name}: {str(e)}")
        
        print("\n🎉 Event dates updated successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    success = asyncio.run(fix_event_dates())
    
    if success:
        print("\n✅ Event dates fixed! You can now create bookings.")
    else:
        print("\n❌ Failed to fix event dates!")
        sys.exit(1)