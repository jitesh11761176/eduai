# 🔐 Admin Guide - EduAI Platform

## Secure Admin Access

### Authentication
**Admin Email:** `jiteshshahpgtcs2@gmail.com`

**How to Login:**
1. Click "School Login" or "Competitive Exams" on homepage
2. Click **"Continue with Google"** button
3. Sign in with your Google account (`jiteshshahpgtcs2@gmail.com`)
4. You'll be automatically redirected to the Unified Admin Dashboard

**Security Features:**
- ✅ **Google OAuth Authentication** - Secure login via Google
- ✅ **Email Verification** - Only the specified admin email has access
- ✅ **Case-Insensitive Matching** - Works regardless of email case
- ✅ **Session Management** - Persistent login with Firebase Auth
- ✅ **Data Encryption** - All data secured through Firebase

---

## 📊 Unified Admin Dashboard

Upon login, you get access to **TWO MAIN SECTIONS**:

### 1️⃣ School Section (Balvatika - XII)
**Access:** Click "School Section (Balvatika - XII)" tab

#### Overview Tab
- **Real-time Statistics:**
  - Total Courses count
  - Total Students count
  - Total Teachers count
  - Total Tests count
- Quick navigation to School Dashboard

#### Manage Courses Tab
- **Actions:**
  - ➕ Create new courses
  - ✏️ Edit existing courses
  - 🗑️ Delete courses
  - 👁️ View all courses
- Navigate to course management interface

#### Manage Users Tab
- **Full User Control:**
  - ➕ **Add New Users** - Create student, teacher, or principal accounts
  - ✏️ **Edit Users** - Update name, email, enrolled courses
  - 🗑️ **Delete Users** - Remove user and ALL associated data
  - 🔍 **Search/Filter** - Find users quickly
  - 📊 **View Stats** - Live student/teacher counts

**User Management Interface:**
- Separate tabs for Students and Teachers
- Search functionality
- Bulk course enrollment
- Confirmation dialogs for deletions

#### Manage Tests Tab
- **Test Management:**
  - ➕ Create assessments
  - 📝 Configure test parameters
  - 🗑️ Delete tests
  - 📊 View all tests

---

### 2️⃣ Competitive Exams Section
**Access:** Click "Competitive Exams (SSC, NDA, etc.)" tab

#### Overview Tab
- **Dashboard Stats:**
  - Total Exams (SSC, KVS, NDA, CUET, AFCAT, Bank PO)
  - Total Categories per exam
  - Total Tests available
  - Total User Attempts
- **Per-Exam Analytics:**
  - Categories count
  - Tests count
  - User attempts count

#### Manage Exams Tab
**Complete Hierarchical Control:** Exam → Category → Test

**➕ Add New Exam:**
- Exam Name (Short) - e.g., "UPSC"
- Full Name - e.g., "Union Public Service Commission"
- Description - Brief overview
- Icon - Emoji representation (📚, 🎓, etc.)
- **Saved to localStorage** - Persists across sessions

**➕ Add New Category (per exam):**
- Category Name - e.g., "General Intelligence & Reasoning"
- Description - What this category covers
- Linked to parent exam
- **Persisted automatically**

**➕ Add New Test (per category):**
- Test Title - e.g., "Reasoning Basics - Test 1"
- Difficulty - Easy/Medium/Hard
- Duration - Minutes (5-180)
- Number of Questions - (5-200)
- **Dynamically generates questions when taken**

**🗑️ Delete Functions:**
- Delete entire exams (removes all categories and tests)
- Delete specific categories (removes all tests within)
- Delete individual tests
- **Confirmation dialogs** prevent accidental deletions

#### Users Data Tab
- **View All Competitive Exam Users:**
  - User name and email
  - Selected exams for preparation
  - Total test attempts
- **🗑️ Delete User Data:**
  - Remove user completely
  - Deletes all test results
  - Confirmation required

---

## 🔑 Admin Powers Summary

### School Section Powers:
1. ✅ **Full CRUD Operations** on courses, users, tests
2. ✅ **User Account Management** - Create, edit, delete any user
3. ✅ **Data Deletion** - Remove users and their complete data
4. ✅ **Course Assignment** - Enroll students in courses
5. ✅ **Test Management** - Create and manage assessments
6. ✅ **Analytics Access** - View all platform statistics

### Competitive Exams Powers:
1. ✅ **Exam Creation** - Add new competitive exams
2. ✅ **Category Management** - Organize tests by subject areas
3. ✅ **Test Creation** - Add unlimited practice tests
4. ✅ **Content Deletion** - Remove exams, categories, tests
5. ✅ **User Management** - View and delete user data
6. ✅ **Data Persistence** - All changes saved to localStorage
7. ✅ **Dynamic Question Generation** - Tests auto-generate questions

### Security Powers:
1. ✅ **Google OAuth Required** - Must authenticate via Google
2. ✅ **Email Verification** - Only admin email has access
3. ✅ **Audit Trail** - Console logs for debugging
4. ✅ **Confirmation Dialogs** - Prevents accidental data loss
5. ✅ **Session Persistence** - Stay logged in across sessions

---

## 🎯 Common Admin Tasks

### Task 1: Add a New Competitive Exam
1. Login with Google using `jiteshshahpgtcs2@gmail.com`
2. Go to Competitive Exams Section → Manage Exams Tab
3. Click "+ Add New Exam"
4. Fill in: Name, Full Name, Description, Icon
5. Click "Add Exam"
6. ✅ Exam appears immediately in the list

### Task 2: Create Test Series
1. Navigate to Manage Exams Tab
2. Find your exam, click "+ Add Category"
3. Enter category name and description
4. Click "Add Category"
5. Find the new category, click "+ Add Test"
6. Fill in test details (title, difficulty, duration, questions)
7. Click "Add Test"
8. ✅ Test is now available for users

### Task 3: Delete User Account
**School Section:**
1. Go to School Section → Manage Users Tab
2. Click "Manage All Users"
3. Search for user by name or email
4. Click red "Delete" button
5. Confirm deletion
6. ✅ User and all data removed

**Competitive Section:**
1. Go to Competitive Exams Section → Users Data Tab
2. Find user in table
3. Click "Delete User" button
4. Confirm deletion
5. ✅ User data removed from localStorage

### Task 4: Monitor Platform Usage
1. View Overview tabs in both sections
2. See real-time statistics
3. Per-exam analytics in Competitive section
4. Navigate to detailed views as needed

---

## 💾 Data Management

### School Section Data:
- **Stored in:** Firebase Firestore
- **Includes:** Users, courses, tests, submissions, announcements
- **Persistence:** Cloud-based, permanent until deleted
- **Backup:** Managed by Firebase

### Competitive Exams Data:
- **Stored in:** Browser localStorage
- **Includes:** User accounts, test results, custom exams/tests
- **Persistence:** Local to browser, survives page refresh
- **Clearing:** Use browser's "Clear Site Data" or admin delete functions

### Admin Session:
- **Auth Method:** Firebase Authentication (Google OAuth)
- **Session Duration:** Persistent until manual logout
- **Auto-refresh:** Yes, on page reload
- **Security:** Token-based authentication

---

## 🚨 Important Notes

### Security:
- **Never share admin credentials**
- **Always logout from shared computers**
- **Deletions are permanent** - cannot be undone
- **Use confirmation dialogs** - Read carefully before confirming

### Best Practices:
- **Test in small batches** - Create one exam/category/test at a time
- **Verify data** - Check that creations appear correctly
- **Use descriptive names** - Make content easy to identify
- **Regular monitoring** - Check user activity periodically
- **Data cleanup** - Remove outdated content regularly

### Limitations:
- **localStorage limit** - ~5-10MB per domain
- **No undo** - Deletions are permanent
- **Browser-specific** - Competitive data doesn't sync across devices
- **Client-side** - Currently no backend API for competitive data

---

## 🛠️ Troubleshooting

### "Access Denied" Message
- **Cause:** Not logged in with admin email
- **Fix:** Logout and sign in with `jiteshshahpgtcs2@gmail.com` via Google

### Changes Not Saving
- **Cause:** Browser storage full or disabled
- **Fix:** Clear browser cache/localStorage, try again

### User Data Not Appearing
- **Cause:** Data stored in different browser/device
- **Fix:** Use same browser where users registered

### Google Login Fails
- **Cause:** Firebase config issue or popup blocked
- **Fix:** Check console for errors, allow popups, check .env file

### Admin Dashboard Not Showing
- **Cause:** Email mismatch or not authenticated
- **Fix:** Clear localStorage, login again with correct email

---

## 📞 Support

For any admin-related issues:
1. Check browser console for error messages
2. Verify you're using `jiteshshahpgtcs2@gmail.com`
3. Clear browser cache and try again
4. Check that Firebase is properly configured (.env file)

---

**Last Updated:** December 3, 2025  
**Version:** 2.0 - Secure OAuth Admin
