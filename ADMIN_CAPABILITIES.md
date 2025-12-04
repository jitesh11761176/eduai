# Admin Dashboard - Complete Capabilities Guide

## Authentication
- **Admin Email**: jiteshshahpgtcs2@gmail.com
- **Login Method**: Google OAuth (Sign in with Google)
- **Security**: Only the specified admin email can access the unified admin dashboard

## Two Main Sections

### 1. SCHOOL EDUCATION SECTION

#### Overview Tab
- Quick statistics dashboard showing:
  - Total courses count
  - Total students count
  - Total teachers count
  - Total tests count
- Visual cards with real-time data

#### Manage Courses Tab
**Capabilities:**
- ✅ **Create New Course**
  - Click "+ Add New Course" button
  - Fill in: Title, Description, Subject, Class Level (1-12), Chapters
  - AI-powered course generation (automatically fills description and chapters)
  - Validation: All fields required, must have at least one chapter
  
- ✅ **View All Courses**
  - Grid view of all courses with details
  - Shows: Title, Description, Teacher name
  - Quick navigation to course details
  
- ✅ **Delete Courses**
  - Click "Delete" button on any course card
  - Confirmation dialog prevents accidental deletion
  - Permanently removes course and all associated data
  
**Data Persistence:**
- All course changes are immediately saved
- Changes reflect across all user roles (students, teachers)

#### Manage Users Tab
**Capabilities:**
- ✅ **Add New Users**
  - Students: Name, email, class, enrollment date
  - Teachers: Name, email, subjects taught
  - Principals: Name, email, school information
  
- ✅ **Edit Existing Users**
  - Update any user information
  - Change roles and permissions
  
- ✅ **Delete Users**
  - Remove students, teachers, or principals
  - Confirmation required
  - All user data and associations are removed
  
- ✅ **View User Statistics**
  - Total students count
  - Total teachers count
  - Visual statistics cards

**Access Method:**
- Click "Manage All Users" button
- Opens dedicated user management interface

#### Manage Tests Tab
**Capabilities:**
- ✅ **Create New Tests**
  - Click "+ Create New Test" button
  - Opens test creation page
  - Set: Title, Course, Due Date, Total Marks, Questions
  
- ✅ **View All Tests**
  - Grid view showing all tests across all courses
  - Displays: Test title, Course name, Due date, Total marks
  
- ✅ **Navigate to Tests**
  - Click "View Test" to see full test details
  - Access submissions and grading interface
  
**Data Display:**
- Tests are organized by course
- Shows test count per course
- Empty state message when no tests exist

---

### 2. COMPETITIVE EXAMS SECTION

#### Exams Management
**Capabilities:**
- ✅ **Create New Exam**
  - Click "+ Add New Exam" button
  - Fill in form: Exam Name, Description, Duration, Pattern Details
  - Form validation (all fields required)
  
- ✅ **View All Exams**
  - List view showing all competitive exams
  - Displays: Name, Description, Total subjects
  
- ✅ **Delete Exams**
  - Click "Delete" button next to exam
  - Confirmation dialog
  - Removes exam and all associated categories and tests

#### Categories Management
**Capabilities:**
- ✅ **Add Categories to Exams**
  - Select exam from dropdown
  - Enter category name
  - Click "Add Category"
  
- ✅ **View Categories**
  - Organized by exam
  - Shows all categories under each exam
  
- ✅ **Delete Categories**
  - Click "Delete" button next to category
  - Confirmation required
  - Removes category and all associated tests

#### Tests Management
**Capabilities:**
- ✅ **Create Tests for Categories**
  - Select exam and category
  - Enter test details: Name, Questions, Duration
  - Validation: All fields required
  
- ✅ **View All Tests**
  - Organized by exam and category
  - Shows: Test name, Questions count, Duration
  
- ✅ **Delete Tests**
  - Click "Delete" button next to test
  - Confirmation required
  - Removes test permanently

#### Users Management
**Capabilities:**
- ✅ **View Competitive Users**
  - List of all users registered for competitive exams
  - Shows: Name, Email, Registered exams
  
- ✅ **Delete Users**
  - Click "Delete" button next to user
  - Confirmation required
  - Removes user account and all progress data

---

## Data Synchronization

### School Section
- **Storage**: Firebase Firestore (real-time database)
- **Sync**: Automatic, real-time across all devices
- **Persistence**: Cloud-based, permanent storage

### Competitive Section
- **Storage**: Browser localStorage (local storage)
- **Sync**: Immediate updates across admin and user views
- **Persistence**: Survives page refresh, stored locally
- **Data Function**: `getCompetitiveExams()` ensures data consistency

---

## Admin Powers Summary

| Feature | School Section | Competitive Section |
|---------|----------------|---------------------|
| Create | ✅ Courses, Users, Tests | ✅ Exams, Categories, Tests |
| View | ✅ All data in grid/list | ✅ All data organized |
| Update | ✅ User information | ⚠️ Delete & recreate |
| Delete | ✅ All entities | ✅ All entities |
| User Management | ✅ Full CRUD | ✅ View & Delete |

---

## Important Notes

1. **Data Validation**: All forms have built-in validation to prevent invalid data entry
2. **Confirmation Dialogs**: Destructive actions (delete) require confirmation
3. **AI Integration**: School courses can use AI to auto-generate descriptions and chapters
4. **Real-time Updates**: Changes reflect immediately for all users
5. **Navigation**: Use back buttons and breadcrumbs to navigate between sections
6. **Error Handling**: Clear error messages guide you through any issues

---

## Quick Actions Guide

### To Add a School Course:
1. Click "School" tab
2. Click "Manage Courses" tab
3. Click "+ Add New Course"
4. Fill form or use "AI Fill" for auto-generation
5. Click "Create Course"

### To Delete a User:
1. Click "School" tab
2. Click "Manage Users" tab
3. Click "Manage All Users"
4. Find user, click "Delete"
5. Confirm deletion

### To Create Competitive Exam:
1. Click "Competitive" tab
2. Scroll to "Exams Management"
3. Click "+ Add New Exam"
4. Fill form with exam details
5. Click "Add Exam"

### To Delete Competitive Test:
1. Click "Competitive" tab
2. Scroll to "Tests Management"
3. Find test, click "Delete"
4. Confirm deletion

---

## Support & Troubleshooting

**Issue**: Changes not showing for users
- **Solution**: Refresh the user's page (F5)
- **For Competitive**: Data is in localStorage, may need hard refresh (Ctrl+Shift+R)

**Issue**: Can't access admin dashboard
- **Solution**: Ensure you're logged in with jiteshshahpgtcs2@gmail.com

**Issue**: AI Fill not working
- **Solution**: Check internet connection, Gemini API key configured

---

## Data Structure

### School Course Structure:
```
Course {
  id, title, description, subject, classLevel,
  teacher, chapters[], tests[], students[],
  announcements[], discussionThreads[], projects[], studyGroups[]
}
```

### Competitive Exam Structure:
```
Exam {
  id, name, description, duration, pattern,
  categories[] {
    id, name,
    tests[] { id, name, questions, duration }
  }
}
```

---

**Last Updated**: Current Session
**Admin Email**: jiteshshahpgtcs2@gmail.com
**Authentication**: Google OAuth Required
