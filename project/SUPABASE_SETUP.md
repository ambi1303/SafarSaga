# Supabase Setup Guide for SafarSaga Travel Platform

This guide will help you set up Supabase for the SafarSaga travel booking platform.

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: SafarSaga Travel Platform
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be ready (2-3 minutes)

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **Project API Keys**:
     - `anon` `public` key (for client-side)
     - `service_role` `secret` key (for server-side)

## 3. Update Environment Variables

Update your `project/.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 4. Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `project/database/schema.sql`
4. Paste it into the SQL editor
5. Click "Run" to execute the schema

This will create:
- ✅ All required tables (users, events, tickets, gallery_images)
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance
- ✅ Triggers for automatic updates
- ✅ Sample data (optional)

## 5. Configure Authentication

1. Go to **Authentication** → **Settings**
2. Configure the following:

### Email Settings
- **Enable email confirmations**: ON (recommended)
- **Enable email change confirmations**: ON
- **Enable secure email change**: ON

### Site URL
- **Site URL**: `http://localhost:3000` (for development)
- **Redirect URLs**: Add your production domain when deploying

### Email Templates (Optional)
Customize the email templates for:
- Confirm signup
- Reset password
- Email change confirmation

## 6. Set Up Row Level Security (RLS)

The schema already includes RLS policies, but verify they're enabled:

1. Go to **Database** → **Tables**
2. For each table (users, events, tickets, gallery_images):
   - Click on the table
   - Go to "RLS" tab
   - Ensure "Enable RLS" is ON
   - Verify policies are listed

## 7. Create Your Admin Account

1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000/auth/register`
3. Register with your admin email
4. Check your email and confirm the account
5. In Supabase dashboard, go to **Database** → **Table Editor** → **users**
6. Find your user record and set `is_admin` to `true`

## 8. Test the Setup

### Test Authentication
1. Try logging in at `http://localhost:3000/auth/login`
2. Try registering a new user
3. Verify user data appears in the `users` table

### Test Database Connection
1. Check that tables are created properly
2. Verify RLS policies are working
3. Test that admin users can access admin features

## 9. Optional: Set Up Realtime (for live updates)

1. Go to **Database** → **Replication**
2. Enable replication for tables you want real-time updates:
   - `tickets` (for booking updates)
   - `events` (for trip updates)
   - `gallery_images` (for new photos)

## 10. Production Setup

When deploying to production:

### Update Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
```

### Update Site URL
1. Go to **Authentication** → **Settings**
2. Update **Site URL** to your production domain
3. Add production domain to **Redirect URLs**

### Set Up Custom Domain (Optional)
1. Go to **Settings** → **Custom Domains**
2. Add your custom domain for the API

## 11. Backup and Monitoring

### Automatic Backups
- Supabase automatically backs up your database
- Pro plans have point-in-time recovery

### Monitoring
1. Go to **Reports** to monitor:
   - Database performance
   - API usage
   - Authentication metrics

## 12. Troubleshooting

### Common Issues

**"Invalid API key" error:**
- Check that environment variables are correct
- Restart your development server after updating .env.local

**RLS policy errors:**
- Verify RLS is enabled on tables
- Check that policies are correctly configured
- Ensure user is authenticated when accessing protected data

**Email confirmation not working:**
- Check spam folder
- Verify email settings in Supabase dashboard
- Ensure Site URL is correctly configured

**Database connection issues:**
- Verify Project URL is correct
- Check that database is not paused (free tier auto-pauses)
- Ensure network connectivity

### Getting Help

- **Supabase Docs**: https://supabase.com/docs
- **Community**: https://github.com/supabase/supabase/discussions
- **Discord**: https://discord.supabase.com

## 13. Next Steps

After Supabase is set up:

1. ✅ **Test Authentication**: Login/Register should work
2. ✅ **Create Admin User**: Set your account as admin
3. ✅ **Test Database**: Verify tables and policies work
4. 🚀 **Continue Implementation**: Move to next tasks in the spec

Your Supabase backend is now ready to power the SafarSaga travel booking platform! 🎉

## Security Notes

⚠️ **Important Security Reminders:**
- Never commit `.env.local` to version control
- Use service role key only on server-side
- Keep your database password secure
- Regularly review RLS policies
- Monitor authentication logs for suspicious activity

The platform now has a robust, scalable backend ready for the complete travel booking system!