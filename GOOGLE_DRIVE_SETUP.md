# Google Drive Integration Setup Guide

## Overview
The EduAI platform now supports automatic backup of user data to Google Drive. This ensures that students can access their test history, progress, and analytics from any device.

## Features
- ✅ Automatic sync after each test completion
- ✅ Cross-device data access
- ✅ Secure storage in user's personal Google Drive
- ✅ Real-time updates
- ✅ One-click backup & restore

## Setup Instructions

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project name/ID

### 2. Enable Google Drive API
1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google Drive API"
3. Click **Enable**

### 3. Create OAuth 2.0 Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - Choose **External** user type
   - Add your app name: "EduAI Platform"
   - Add your email address
   - Add authorized domains (e.g., `localhost`, `yourapp.vercel.app`)
   - Add scopes: `https://www.googleapis.com/auth/drive.file`
   - Save and continue

4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: "EduAI Web Client"
   - Authorized JavaScript origins:
     ```
     http://localhost:5173
     https://yourdomain.com
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:5173
     https://yourdomain.com
     ```
   - Click **Create**
   - Copy the **Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)

### 4. Create API Key
1. In **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy the API key
4. (Optional) Click **Restrict Key**:
   - API restrictions: Select "Google Drive API"
   - Application restrictions: HTTP referrers
   - Add your domains

### 5. Configure Environment Variables
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your Google credentials to `.env`:
   ```env
   VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   VITE_GOOGLE_API_KEY=your_api_key_here
   ```

3. Make sure `.env` is in your `.gitignore` (should be there by default)

### 6. Test the Integration
1. Start the development server:
   ```bash
   npm run dev
   ```

2. Login to the competitive exam portal
3. Look for the "Google Drive Backup" card on your dashboard
4. Click "Connect Google Drive"
5. Authorize the app
6. Your data will automatically sync!

## How It Works

### Automatic Sync
- Data syncs automatically after:
  - User login
  - Test completion
  - Exam selection changes
  - Manual sync button click

### Data Storage
- Files are stored in a folder called `EduAI_CompetitiveExams` in the user's Google Drive
- File format: `user_data_{email}.json`
- Contains:
  - User profile information
  - Selected exams
  - Complete test history
  - Scores and analytics
  - Timestamps

### Cross-Device Access
1. Login from Device A → Take tests → Auto-sync to Drive
2. Login from Device B → Data automatically loads from Drive
3. Both devices stay in sync

## Security & Privacy

- ✅ Users must explicitly authorize the app
- ✅ Data is stored in the user's personal Google Drive
- ✅ Only the user can access their data
- ✅ App only requests `drive.file` scope (can only access files it creates)
- ✅ Users can revoke access anytime from Google account settings
- ✅ Local backup is maintained as fallback

## Troubleshooting

### "Failed to sync with Google Drive" Error
1. Check that both `VITE_GOOGLE_CLIENT_ID` and `VITE_GOOGLE_API_KEY` are set in `.env`
2. Verify the OAuth consent screen is configured correctly
3. Check browser console for detailed error messages
4. Make sure your domain is in the authorized origins

### Data Not Syncing
1. Check if you're signed in (green cloud icon should show)
2. Click "Sync Now" to manually trigger sync
3. Check browser console for errors
4. Verify Google Drive API is enabled in your project

### Can't Connect to Google
1. Clear browser cache and cookies
2. Try using incognito mode
3. Check if popup blocker is interfering
4. Verify OAuth credentials are correct

## API Quota & Limits

- Google Drive API has generous free quotas
- Default: 1,000,000,000 queries per day
- Your app usage: ~1-5 requests per user session
- No cost for typical educational use

## Benefits for Users

### Students
- 📱 Access progress from phone, tablet, or computer
- 💾 Never lose test history
- 🔄 Seamless experience across devices
- 🎯 Focus on studying, not data management

### Teachers/Admins
- 📊 Students can share their Drive backup for analysis
- 🔍 Easy troubleshooting (students can re-download their data)
- 💼 Professional data management solution

## Disconnecting Google Drive

Users can disconnect at any time:
1. Click "Disconnect" button
2. Data remains in local storage as backup
3. Can reconnect anytime without data loss
4. Revoke app access from [Google Account Settings](https://myaccount.google.com/permissions)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review browser console errors
3. Verify environment variables are correct
4. Ensure Google Drive API is enabled

## Privacy Policy Note

If you deploy this app publicly, add to your privacy policy:
- What data is stored (test results, user profile)
- That data is stored in user's personal Google Drive
- Users control their data and can delete/revoke access anytime
- App only accesses files it creates (not other Drive files)
