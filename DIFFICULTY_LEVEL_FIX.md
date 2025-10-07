# Difficulty Level Case Sensitivity Fix

## Issue
Pydantic validation was failing because the database contains capitalized difficulty levels ("Easy", "Moderate", "Challenging") but the enum expects lowercase values ("easy", "moderate", "challenging").

## Error Message
```
Input should be 'easy', 'moderate' or 'challenging'
```

## Root Cause
The `DifficultyLevel` enum is defined as:
```python
class DifficultyLevel(str, Enum):
    EASY = "easy"
    MODERATE = "moderate"
    CHALLENGING = "challenging"
```

But the database contains:
- "Easy" instead of "easy"
- "Moderate" instead of "moderate"  
- "Challenging" instead of "challenging"

Pydantic's enum matching is case-sensitive, so validation fails.

## Solution Implemented

Added a `@validator` to the `Destination` model that normalizes the difficulty_level to lowercase before validation:

```python
class Destination(BaseModel):
    """Destination model"""
    id: str
    name: str
    location: Optional[str] = None
    state: Optional[str] = None
    description: Optional[str] = None
    average_cost_per_day: Optional[Decimal] = None
    difficulty_level: Optional[DifficultyLevel] = None
    is_active: bool = True
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    
    @validator("difficulty_level", pre=True)
    def normalize_difficulty(cls, v):
        """Normalize difficulty level to lowercase for case-insensitive matching"""
        if isinstance(v, str):
            return v.lower()
        return v
    
    class Config:
        extra = "ignore"  # Ignore extra fields from database
```

## How It Works

1. The `@validator` decorator runs **before** Pydantic validates the field
2. It checks if the value is a string
3. If it is, it converts it to lowercase
4. The lowercase value is then validated against the enum

This means:
- "Easy" → "easy" ✅
- "Moderate" → "moderate" ✅
- "Challenging" → "challenging" ✅
- "easy" → "easy" ✅ (already lowercase)

## Benefits

✅ **Backward compatible** - Works with both capitalized and lowercase values
✅ **No database changes needed** - Handles normalization at the application level
✅ **Consistent** - All difficulty levels are normalized to lowercase
✅ **Flexible** - Can accept any case variation from the database

## Optional: Database Normalization

For long-term consistency, you can also normalize the database values:

```sql
UPDATE destinations 
SET difficulty_level = LOWER(difficulty_level)
WHERE difficulty_level IS NOT NULL;
```

This ensures all future data is already in the correct format.

## Testing

After restarting the backend, test:

1. **GET /api/destinations/** - Should now return destinations without validation errors
2. **POST /api/bookings/** - Should accept bookings with valid destination IDs
3. Check that destinations with "Easy", "Moderate", or "Challenging" are properly loaded

## Files Changed

- `backend/app/models.py` - Added `@validator` to Destination model
