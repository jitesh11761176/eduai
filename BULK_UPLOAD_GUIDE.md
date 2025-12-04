# Bulk Test Upload Guide for Admins

## Overview
The Bulk Test Upload feature allows admins to create tests with multiple questions efficiently by uploading a pre-filled template file (JSON or CSV format).

---

## Step-by-Step Instructions

### 1. Navigate to Competitive Admin Dashboard
- Login with admin email: `jiteshshahpgtcs2@gmail.com`
- Click on the **"Competitive"** tab
- Scroll to find the exam and category where you want to add tests

### 2. Click "Bulk Upload" Button
- Find the category where you want to add a test
- Click the **"📤 Bulk Upload"** button (green button next to "+ Add Test")

### 3. Download Template
You have two template options:

#### Option A: JSON Template
- Click **"📄 Download JSON Template"**
- Opens a `.json` file with example structure
- Easier for complex questions with formatting

#### Option B: CSV Template
- Click **"📊 Download CSV Template"**
- Opens a `.csv` file (Excel-compatible)
- Easier to edit in spreadsheet software like Excel or Google Sheets

---

## JSON Template Format

```json
{
  "instructions": "Fill in the questions array...",
  "questions": [
    {
      "question": "What is the capital of India?",
      "options": ["Mumbai", "New Delhi", "Kolkata", "Chennai"],
      "correctAnswer": 1,
      "explanation": "New Delhi is the capital of India."
    },
    {
      "question": "Which is the largest ocean?",
      "options": ["Atlantic", "Pacific", "Indian", "Arctic"],
      "correctAnswer": 1,
      "explanation": "The Pacific Ocean is the largest ocean."
    }
  ]
}
```

### JSON Field Descriptions:
- **question**: The question text (string)
- **options**: Array of 4 options (strings)
- **correctAnswer**: Index of correct option (0-3, where 0 = first option)
- **explanation**: Optional explanation for the answer (string)

---

## CSV Template Format

```csv
Question,Option A,Option B,Option C,Option D,Correct Answer (0-3),Explanation (Optional)
"What is 2+2?","2","3","4","5",2,"2+2 equals 4"
"Capital of France?","London","Paris","Berlin","Madrid",1,"Paris is the capital of France"
"Largest planet?","Earth","Mars","Jupiter","Venus",2,"Jupiter is the largest planet"
```

### CSV Column Descriptions:
1. **Question**: Question text
2. **Option A**: First option
3. **Option B**: Second option
4. **Option C**: Third option
5. **Option D**: Fourth option
6. **Correct Answer (0-3)**: Index of correct answer (0=A, 1=B, 2=C, 3=D)
7. **Explanation (Optional)**: Explanation text

### Tips for CSV:
- Use double quotes `"` around text with commas
- Correct Answer must be 0, 1, 2, or 3
- Save as `.csv` format
- Can edit in Excel, Google Sheets, or any text editor

---

## Fill in Your Questions

### For JSON:
1. Open the downloaded `test-questions-template.json`
2. Copy the example question format
3. Replace with your actual questions
4. Ensure correct JSON syntax (commas, brackets, quotes)
5. Save the file

### For CSV:
1. Open the downloaded `test-questions-template.csv` in Excel/Google Sheets
2. Delete example rows
3. Add your questions row by row
4. Make sure Correct Answer column contains only 0, 1, 2, or 3
5. Save as CSV format

---

## Upload Your File

1. Click **"Choose File"** or drag-and-drop
2. Select your filled template (.json or .csv)
3. Wait for validation message
4. You'll see:
   - ✓ Success: "Successfully loaded X questions"
   - ❌ Error: Description of what went wrong

---

## Preview & Create

### Preview Section:
- Shows first 3 questions as preview
- Correct answers are marked with ✓ in green
- Review before creating

### Test Details:
- **Test Title**: Name for your test (required)
- **Difficulty**: Easy, Medium, or Hard
- **Duration**: Time limit in minutes

### Create Test:
- Click **"Create Test (X Questions)"** button
- Test is immediately added to the category
- All users will see the new test

---

## Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid format" | Wrong file structure | Re-download template and follow format exactly |
| "correctAnswer must be 0-3" | Invalid answer index | Use only 0, 1, 2, or 3 for correct answer |
| "Must have 4 options" | Missing options | Each question needs exactly 4 options |
| "No valid questions found" | Empty or corrupted file | Check file content, re-create from template |
| "Please upload a .json or .csv file" | Wrong file type | Only .json and .csv files accepted |

---

## Best Practices

### Question Writing:
✅ **DO:**
- Write clear, unambiguous questions
- Make options similar in length
- Include helpful explanations
- Test file with 2-3 questions first

❌ **DON'T:**
- Use special characters that break JSON/CSV format
- Leave options empty
- Use answer indices outside 0-3 range
- Upload files larger than 5MB

### File Management:
- Save your question bank files in organized folders
- Name files descriptively: `SSC_General_Awareness_Set1.json`
- Keep backup copies of your question files
- Review questions before uploading

### Testing:
1. Upload a small test (5-10 questions) first
2. Verify it appears correctly for users
3. Take the test yourself to verify all answers
4. Then upload larger test sets

---

## Example Workflow

### Example 1: Creating a 50-Question General Knowledge Test

1. **Download** JSON template
2. **Open** in text editor (VS Code, Notepad++, etc.)
3. **Add 50 questions** following the format:
   ```json
   {
     "question": "Who wrote 'Romeo and Juliet'?",
     "options": ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
     "correctAnswer": 1,
     "explanation": "William Shakespeare wrote Romeo and Juliet in 1597."
   }
   ```
4. **Save** as `GK_Test_Set1.json`
5. **Navigate** to Competitive Admin → Find category
6. **Click** "📤 Bulk Upload"
7. **Fill** test title: "General Knowledge - Set 1"
8. **Set** difficulty: Medium, Duration: 60 minutes
9. **Upload** your `GK_Test_Set1.json` file
10. **Review** preview (first 3 questions shown)
11. **Click** "Create Test (50 Questions)"
12. **Done!** Test is now live for all users

### Example 2: Creating Multiple Choice Math Test (CSV)

1. **Download** CSV template
2. **Open** in Excel/Google Sheets
3. **Create rows** like:
   | Question | Option A | Option B | Option C | Option D | Correct Answer | Explanation |
   |----------|----------|----------|----------|----------|----------------|-------------|
   | What is 15% of 200? | 25 | 30 | 35 | 40 | 1 | 15% of 200 = (15/100) × 200 = 30 |
   | Solve: 2x + 5 = 15 | x=5 | x=10 | x=15 | x=20 | 0 | 2x = 10, so x = 5 |
4. **Save** as `Math_Test.csv`
5. **Upload** through admin panel
6. **Create** test with your settings

---

## Video Tutorial (Coming Soon)
Watch a step-by-step video guide: [Link to be added]

---

## Support

**Questions or Issues?**
- Email: jiteshshahpgtcs2@gmail.com
- The bulk upload feature validates your file before creating the test
- Always preview questions before finalizing
- If upload fails, check the error message carefully

**File Size Limits:**
- Maximum 1000 questions per test recommended
- File size should be under 5MB
- Larger tests may take a few seconds to process

---

## Quick Reference

| Action | Button/Feature |
|--------|---------------|
| Start bulk upload | 📤 Bulk Upload (green button) |
| Download JSON template | 📄 Download JSON Template |
| Download CSV template | 📊 Download CSV Template |
| Upload file | Choose File button |
| Preview questions | Automatic after successful upload |
| Create test | "Create Test (X Questions)" button |

---

**Last Updated**: December 2025  
**Feature Version**: 1.0
