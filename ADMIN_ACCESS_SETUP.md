# Admin Access Setup Guide

## 403 Forbidden Error - Admin Privileges Required

The `403 Forbidden` error occurs when a user tries to access admin-only endpoints without having admin privileges.

## How to Grant Admin Access

### Option 1: Update User in Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to **Table Editor** → **users** table

2. **Find Your User**
   - Locate the user account you want to make an admin
   - You can search by email or user ID

3. **Update is_admin Column**
   - Click on the `is_admin` field for that user
   - Change the value from `false` to `true`
   - Save the changes

4. **Log Out and Log Back In**
   - The user's JWT token contains their role information
   - Logging out and back in will generate a new token with the updated admin status
   - Clear browser cache/localStorage if needed

### Option 2: Update via SQL Query

Run this SQL query in the Supabase SQL Editor:

```sql
-- Replace 'user@example.com' with the actual email
UPDATE users 
SET is_admin = true 
WHERE email = 'user@example.com';
```

Or by user ID:

```sql
-- Replace 'user-id-here' with the actual user ID
UPDATE users 
SET is_admin = true 
WHERE id = 'user-id-here';
```

### Option 3: Create Admin User via API (For Development)

If you need to create a test admin user programmatically:

```sql
-- Insert a new admin user (adjust values as needed)
INSERT INTO users (email, full_name, is_admin, is_active)
VALUES ('admin@safarsaga.com', 'Admin User', true, true);
```

## Verify Admin Status

### Check in Database
```sql
SELECT id, email, full_name, is_admin, is_active 
FROM users 
WHERE email = 'your-email@example.com';
```

### Check JWT Token
1. Open browser DevTools → Network tab
2. Make any API request
3. Find the request in the Network tab
4. Look at the **Request Headers** → **Authorization** header
5. Copy the token (after "Bearer ")
6. Go to https://jwt.io
7. Paste the token to decode it
8. Check if the payload contains `"is_admin": true`

## Admin-Only Endpoints

The following endpoints require admin privileges:

### Destinations
- `POST /api/destinations/` - Create destination
- `PUT /api/destinations/{id}` - Update destination
- `DELETE /api/destinations/{id}` - Delete destination

### Users
- `GET /api/users/` - List all users
- `GET /api/users/{id}` - Get user details
- `POST /api/users/{id}/activate` - Activate user
- `POST /api/users/{id}/deactivate` - Deactivate user
- `DELETE /api/users/{id}` - Delete user

### Events (if applicable)
- `POST /api/events/` - Create event
- `PUT /api/events/{id}` - Update event
- `DELETE /api/events/{id}` - Delete event

## Troubleshooting

### Still Getting 403 After Making User Admin?

1. **Clear Token Cache**
   - Log out completely
   - Clear browser localStorage: `localStorage.clear()`
   - Clear browser cookies
   - Log back in

2. **Verify Database Update**
   ```sql
   SELECT is_admin FROM users WHERE email = 'your-email@example.com';
   ```
   Should return `true`

3. **Check Token Expiration**
   - JWT tokens have an expiration time
   - Wait for token to expire or force logout/login
   - New login will generate fresh token with updated claims

4. **Verify Backend is Reading Correct Field**
   - Check `backend/app/middleware/auth.py`
   - The `get_admin_user` function checks `current_user.is_admin`
   - Ensure your database column name matches

### Common Issues

**Issue**: User is admin in database but still getting 403
**Solution**: The JWT token was issued before the admin status was updated. Log out and log back in.

**Issue**: Can't find is_admin column in users table
**Solution**: Run the migration `002_user_management_improvements.sql` to add the column.

**Issue**: Getting 401 Unauthorized instead of 403 Forbidden
**Solution**: This means authentication failed. Check if the token is valid and not expired.

## Security Best Practices

1. **Limit Admin Users**: Only grant admin access to trusted users
2. **Use Strong Passwords**: Admin accounts should have strong, unique passwords
3. **Enable 2FA**: If Supabase Auth supports it, enable two-factor authentication
4. **Audit Admin Actions**: Log all admin operations for security auditing
5. **Rotate Credentials**: Periodically review and update admin access

## Development vs Production

### Development
- You can have multiple admin users for testing
- Use test email addresses like `admin@test.com`

### Production
- Minimize the number of admin users
- Use real, verified email addresses
- Implement additional security measures (IP whitelisting, 2FA, etc.)
- Consider role-based access control (RBAC) for more granular permissions

## Next Steps

After granting admin access:
1. Log out of the application
2. Log back in with the admin account
3. Try creating a destination again
4. The 403 error should be resolved

If you continue to experience issues, check the backend logs for more detailed error messages.
