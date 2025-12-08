import { Exam, Test } from "../types/competitive";
import { loadCompetitiveExams } from "../services/firebase";

// Validate and fix exam data structure
const validateExamData = (exams: any[]): Exam[] => {
  if (!Array.isArray(exams)) return competitiveExams;
  
  return exams.map(exam => ({
    ...exam,
    categories: Array.isArray(exam.categories) 
      ? exam.categories.map((cat: any) => ({
          ...cat,
          tests: Array.isArray(cat.tests) ? cat.tests : []
        }))
      : []
  }));
};

// Get exams from Firebase Realtime Database or localStorage fallback
export const getCompetitiveExams = (): Exam[] => {
  // Try localStorage first (synchronous fallback)
  const stored = localStorage.getItem("competitive_exams_data");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const validated = validateExamData(parsed);
      console.log("✅ getCompetitiveExams: Loaded from localStorage", validated);
      return validated;
    } catch (e) {
      console.error("❌ Failed to parse stored exams:", e);
    }
  }
  // Return default data if nothing in localStorage
  console.log("⚠️ getCompetitiveExams: No data in localStorage, using defaults");
  return competitiveExams;
};

// Async version that loads from Firebase
export const getCompetitiveExamsAsync = async (): Promise<Exam[]> => {
  try {
    const firebaseData = await loadCompetitiveExams();
    if (firebaseData && Array.isArray(firebaseData)) {
      const validated = validateExamData(firebaseData);
      console.log("✅ getCompetitiveExamsAsync: Loaded from Firebase", validated);
      // Also save to localStorage as cache
      localStorage.setItem("competitive_exams_data", JSON.stringify(validated));
      return validated;
    }
  } catch (error) {
    console.error("❌ Error loading from Firebase:", error);
  }
  
  // Fallback to localStorage or defaults
  return getCompetitiveExams();
};

// Mock data representing admin-created competitive exams content
export const competitiveExams: Exam[] = [
  {
    id: "ssc",
    name: "SSC CGL",
    description: "Staff Selection Commission Combined Graduate Level Examination",
    badge: "Popular",
    categories: [
      {
        id: "general-intelligence",
        name: "General Intelligence & Reasoning",
        description: "Test your logical reasoning and problem-solving skills",
        tests: [
          {
            id: "ssc-gi-1",
            title: "Reasoning Basics - Test 1",
            difficulty: "Easy",
            durationMinutes: 30,
            numQuestions: 25,
            attempts: 0,
          },
          {
            id: "ssc-gi-2",
            title: "Analogies & Classification",
            difficulty: "Medium",
            durationMinutes: 45,
            numQuestions: 30,
            attempts: 0,
          },
          {
            id: "ssc-gi-3",
            title: "Puzzles & Blood Relations",
            difficulty: "Hard",
            durationMinutes: 60,
            numQuestions: 40,
            attempts: 0,
          },
        ],
      },
      {
        id: "quantitative-aptitude",
        name: "Quantitative Aptitude",
        description: "Master mathematical concepts and numerical ability",
        tests: [
          {
            id: "ssc-qa-1",
            title: "Number System Fundamentals",
            difficulty: "Easy",
            durationMinutes: 30,
            numQuestions: 25,
            attempts: 0,
          },
          {
            id: "ssc-qa-2",
            title: "Algebra & Geometry",
            difficulty: "Medium",
            durationMinutes: 45,
            numQuestions: 30,
            attempts: 0,
          },
          {
            id: "ssc-qa-3",
            title: "Advanced Mathematics",
            difficulty: "Hard",
            durationMinutes: 60,
            numQuestions: 40,
            attempts: 0,
          },
        ],
      },
      {
        id: "english",
        name: "English Comprehension",
        description: "Improve grammar, vocabulary, and comprehension skills",
        tests: [
          {
            id: "ssc-eng-1",
            title: "Grammar Basics",
            difficulty: "Easy",
            durationMinutes: 30,
            numQuestions: 25,
            attempts: 0,
          },
          {
            id: "ssc-eng-2",
            title: "Vocabulary & Synonyms",
            difficulty: "Medium",
            durationMinutes: 45,
            numQuestions: 30,
            attempts: 0,
          },
        ],
      },
      {
        id: "general-awareness",
        name: "General Awareness",
        description: "Current affairs, history, geography, and science",
        tests: [
          {
            id: "ssc-ga-1",
            title: "Indian History & Culture",
            difficulty: "Easy",
            durationMinutes: 30,
            numQuestions: 25,
            attempts: 0,
          },
          {
            id: "ssc-ga-2",
            title: "Current Affairs 2025",
            difficulty: "Medium",
            durationMinutes: 45,
            numQuestions: 30,
            attempts: 0,
          },
        ],
      },
      {
        id: "full-test",
        name: "Full Length Tests",
        description: "Complete mock tests simulating actual exam",
        tests: [
          {
            id: "ssc-full-1",
            title: "SSC CGL Full Mock Test 1",
            difficulty: "Medium",
            durationMinutes: 120,
            numQuestions: 100,
            attempts: 0,
          },
          {
            id: "ssc-full-2",
            title: "SSC CGL Full Mock Test 2",
            difficulty: "Hard",
            durationMinutes: 120,
            numQuestions: 100,
            attempts: 0,
          },
        ],
      },
    ],
  },
  {
    id: "kvs",
    name: "KVS",
    description: "Kendriya Vidyalaya Sangathan Recruitment Exam",
    badge: "Trending",
    categories: [
      {
        id: "teaching-aptitude",
        name: "Teaching Aptitude",
        description: "Pedagogical knowledge and teaching skills",
        tests: [
          {
            id: "kvs-ta-1",
            title: "Teaching Methods & Pedagogy",
            difficulty: "Easy",
            durationMinutes: 30,
            numQuestions: 20,
            attempts: 0,
          },
          {
            id: "kvs-ta-2",
            title: "Child Psychology",
            difficulty: "Medium",
            durationMinutes: 45,
            numQuestions: 25,
            attempts: 0,
          },
        ],
      },
      {
        id: "reasoning",
        name: "Reasoning Ability",
        description: "Logical and analytical reasoning",
        tests: [
          {
            id: "kvs-ra-1",
            title: "Logical Reasoning Basics",
            difficulty: "Easy",
            durationMinutes: 30,
            numQuestions: 25,
            attempts: 0,
          },
          {
            id: "kvs-ra-2",
            title: "Analytical Reasoning",
            difficulty: "Medium",
            durationMinutes: 45,
            numQuestions: 30,
            attempts: 0,
          },
        ],
      },
      {
        id: "general-knowledge",
        name: "General Knowledge",
        description: "Current events and general awareness",
        tests: [
          {
            id: "kvs-gk-1",
            title: "Indian Polity & Governance",
            difficulty: "Easy",
            durationMinutes: 30,
            numQuestions: 25,
            attempts: 0,
          },
          {
            id: "kvs-gk-2",
            title: "Science & Technology",
            difficulty: "Medium",
            durationMinutes: 45,
            numQuestions: 30,
            attempts: 0,
          },
        ],
      },
      {
        id: "full-test",
        name: "Full Length Tests",
        description: "Complete mock tests",
        tests: [
          {
            id: "kvs-full-1",
            title: "KVS Full Mock Test 1",
            difficulty: "Medium",
            durationMinutes: 150,
            numQuestions: 120,
            attempts: 0,
          },
        ],
      },
    ],
  },
  {
    id: "nda",
    name: "NDA",
    description: "National Defence Academy and Naval Academy Examination",
    badge: "Elite",
    categories: [
      {
        id: "mathematics",
        name: "Mathematics",
        description: "Advanced mathematical concepts for defense exams",
        tests: [
          {
            id: "nda-math-1",
            title: "Calculus & Trigonometry",
            difficulty: "Medium",
            durationMinutes: 60,
            numQuestions: 40,
            attempts: 0,
          },
          {
            id: "nda-math-2",
            title: "Algebra & Matrices",
            difficulty: "Hard",
            durationMinutes: 60,
            numQuestions: 40,
            attempts: 0,
          },
        ],
      },
      {
        id: "general-ability",
        name: "General Ability Test",
        description: "English, GK, physics, chemistry, geography, history",
        tests: [
          {
            id: "nda-gat-1",
            title: "Physics & Chemistry",
            difficulty: "Medium",
            durationMinutes: 60,
            numQuestions: 50,
            attempts: 0,
          },
          {
            id: "nda-gat-2",
            title: "History & Geography",
            difficulty: "Medium",
            durationMinutes: 60,
            numQuestions: 50,
            attempts: 0,
          },
          {
            id: "nda-gat-3",
            title: "Current Affairs & English",
            difficulty: "Easy",
            durationMinutes: 45,
            numQuestions: 40,
            attempts: 0,
          },
        ],
      },
      {
        id: "full-test",
        name: "Full Length Tests",
        description: "Complete NDA simulation tests",
        tests: [
          {
            id: "nda-full-1",
            title: "NDA Full Mock Test 1",
            difficulty: "Hard",
            durationMinutes: 300,
            numQuestions: 200,
            attempts: 0,
          },
        ],
      },
    ],
  },
  {
    id: "cuet",
    name: "CUET",
    description: "Common University Entrance Test for undergraduate programs",
    badge: "New",
    categories: [
      {
        id: "domain-subjects",
        name: "Domain Subjects",
        description: "Subject-specific tests",
        tests: [
          {
            id: "cuet-ds-1",
            title: "Physics Domain Test",
            difficulty: "Medium",
            durationMinutes: 45,
            numQuestions: 40,
            attempts: 0,
          },
          {
            id: "cuet-ds-2",
            title: "Mathematics Domain Test",
            difficulty: "Medium",
            durationMinutes: 45,
            numQuestions: 40,
            attempts: 0,
          },
          {
            id: "cuet-ds-3",
            title: "Economics Domain Test",
            difficulty: "Medium",
            durationMinutes: 45,
            numQuestions: 40,
            attempts: 0,
          },
        ],
      },
      {
        id: "general-test",
        name: "General Test",
        description: "Aptitude and reasoning",
        tests: [
          {
            id: "cuet-gt-1",
            title: "Quantitative Reasoning",
            difficulty: "Easy",
            durationMinutes: 30,
            numQuestions: 25,
            attempts: 0,
          },
          {
            id: "cuet-gt-2",
            title: "Logical Reasoning",
            difficulty: "Medium",
            durationMinutes: 45,
            numQuestions: 30,
            attempts: 0,
          },
        ],
      },
      {
        id: "full-test",
        name: "Full Length Tests",
        description: "Complete CUET mock tests",
        tests: [
          {
            id: "cuet-full-1",
            title: "CUET Full Mock Test 1",
            difficulty: "Medium",
            durationMinutes: 180,
            numQuestions: 150,
            attempts: 0,
          },
        ],
      },
    ],
  },
  {
    id: "afcat",
    name: "AFCAT",
    description: "Air Force Common Admission Test",
    badge: "Defense",
    categories: [
      {
        id: "verbal-ability",
        name: "Verbal Ability in English",
        description: "Grammar, comprehension, and vocabulary",
        tests: [
          {
            id: "afcat-va-1",
            title: "Reading Comprehension",
            difficulty: "Easy",
            durationMinutes: 30,
            numQuestions: 20,
            attempts: 0,
          },
          {
            id: "afcat-va-2",
            title: "Grammar & Vocabulary",
            difficulty: "Medium",
            durationMinutes: 45,
            numQuestions: 30,
            attempts: 0,
          },
        ],
      },
      {
        id: "numerical-ability",
        name: "Numerical Ability",
        description: "Mathematical and numerical aptitude",
        tests: [
          {
            id: "afcat-na-1",
            title: "Arithmetic & Number System",
            difficulty: "Easy",
            durationMinutes: 30,
            numQuestions: 25,
            attempts: 0,
          },
          {
            id: "afcat-na-2",
            title: "Data Interpretation",
            difficulty: "Medium",
            durationMinutes: 45,
            numQuestions: 30,
            attempts: 0,
          },
        ],
      },
      {
        id: "reasoning",
        name: "Reasoning & Military Aptitude",
        description: "Logical reasoning and military aptitude",
        tests: [
          {
            id: "afcat-rm-1",
            title: "Spatial Reasoning",
            difficulty: "Medium",
            durationMinutes: 45,
            numQuestions: 30,
            attempts: 0,
          },
          {
            id: "afcat-rm-2",
            title: "Military Aptitude Test",
            difficulty: "Hard",
            durationMinutes: 60,
            numQuestions: 40,
            attempts: 0,
          },
        ],
      },
      {
        id: "general-awareness",
        name: "General Awareness",
        description: "Current affairs and defense knowledge",
        tests: [
          {
            id: "afcat-ga-1",
            title: "Indian Defense & Military",
            difficulty: "Medium",
            durationMinutes: 30,
            numQuestions: 25,
            attempts: 0,
          },
          {
            id: "afcat-ga-2",
            title: "Current Affairs & Sports",
            difficulty: "Easy",
            durationMinutes: 30,
            numQuestions: 25,
            attempts: 0,
          },
        ],
      },
      {
        id: "full-test",
        name: "Full Length Tests",
        description: "Complete AFCAT simulation",
        tests: [
          {
            id: "afcat-full-1",
            title: "AFCAT Full Mock Test 1",
            difficulty: "Hard",
            durationMinutes: 120,
            numQuestions: 100,
            attempts: 0,
          },
        ],
      },
    ],
  },
  {
    id: "bank-po",
    name: "Bank PO",
    description: "Banking Probationary Officer Examination",
    badge: "Popular",
    categories: [
      {
        id: "reasoning",
        name: "Reasoning Ability",
        description: "Logical and analytical reasoning",
        tests: [
          {
            id: "bank-ra-1",
            title: "Seating Arrangement",
            difficulty: "Medium",
            durationMinutes: 45,
            numQuestions: 30,
            attempts: 0,
          },
          {
            id: "bank-ra-2",
            title: "Syllogisms & Inequalities",
            difficulty: "Hard",
            durationMinutes: 60,
            numQuestions: 40,
            attempts: 0,
          },
        ],
      },
      {
        id: "quantitative",
        name: "Quantitative Aptitude",
        description: "Numerical ability and data interpretation",
        tests: [
          {
            id: "bank-qa-1",
            title: "Data Interpretation",
            difficulty: "Medium",
            durationMinutes: 45,
            numQuestions: 35,
            attempts: 0,
          },
          {
            id: "bank-qa-2",
            title: "Simplification & Approximation",
            difficulty: "Easy",
            durationMinutes: 30,
            numQuestions: 25,
            attempts: 0,
          },
        ],
      },
      {
        id: "english",
        name: "English Language",
        description: "Grammar, vocabulary, and comprehension",
        tests: [
          {
            id: "bank-eng-1",
            title: "Reading Comprehension",
            difficulty: "Medium",
            durationMinutes: 40,
            numQuestions: 30,
            attempts: 0,
          },
          {
            id: "bank-eng-2",
            title: "Error Detection & Sentence Improvement",
            difficulty: "Easy",
            durationMinutes: 30,
            numQuestions: 25,
            attempts: 0,
          },
        ],
      },
      {
        id: "full-test",
        name: "Full Length Tests",
        description: "Complete Bank PO mock tests",
        tests: [
          {
            id: "bank-full-1",
            title: "Bank PO Full Mock Test 1",
            difficulty: "Hard",
            durationMinutes: 180,
            numQuestions: 155,
            attempts: 0,
          },
        ],
      },
    ],
  },
];

// Detailed test questions - sample for a few tests
export const testQuestions: { [testId: string]: Test } = {
  "ssc-gi-1": {
    id: "ssc-gi-1",
    examId: "ssc",
    categoryId: "general-intelligence",
    title: "Reasoning Basics - Test 1",
    difficulty: "Easy",
    durationMinutes: 30,
    questions: [
      {
        id: "ssc-gi-1-q1",
        text: "Choose the odd one out: Dog, Cat, Lion, Table",
        options: ["Dog", "Cat", "Lion", "Table"],
        correctOptionIndex: 3,
        explanation: "Table is a non-living thing while others are animals.",
        topic: "Classification",
        difficulty: "Easy",
      },
      {
        id: "ssc-gi-1-q2",
        text: "If BOOK is coded as CPPL, how is WORD coded?",
        options: ["XPSE", "WORD", "WNQC", "XPSF"],
        correctOptionIndex: 0,
        explanation: "Each letter is replaced by the next letter in the alphabet.",
        topic: "Coding-Decoding",
        difficulty: "Easy",
      },
      {
        id: "ssc-gi-1-q3",
        text: "Find the missing number: 2, 4, 8, 16, ?",
        options: ["20", "24", "32", "28"],
        correctOptionIndex: 2,
        explanation: "Each number is multiplied by 2 to get the next number.",
        topic: "Number Series",
        difficulty: "Easy",
      },
      {
        id: "ssc-gi-1-q4",
        text: "Arrange the words in meaningful order: 1. Fruit 2. Flower 3. Seed 4. Plant",
        options: ["3, 4, 2, 1", "4, 3, 2, 1", "3, 2, 4, 1", "2, 1, 3, 4"],
        correctOptionIndex: 0,
        explanation: "Logical order: Seed → Plant → Flower → Fruit",
        topic: "Logical Order",
        difficulty: "Easy",
      },
      {
        id: "ssc-gi-1-q5",
        text: "Complete the analogy: Pen : Write :: Knife : ?",
        options: ["Sharp", "Cut", "Steel", "Blade"],
        correctOptionIndex: 1,
        explanation: "Pen is used to write; Knife is used to cut.",
        topic: "Analogies",
        difficulty: "Easy",
      },
    ],
  },
  "ssc-qa-1": {
    id: "ssc-qa-1",
    examId: "ssc",
    categoryId: "quantitative-aptitude",
    title: "Number System Fundamentals",
    difficulty: "Easy",
    durationMinutes: 30,
    questions: [
      {
        id: "ssc-qa-1-q1",
        text: "What is the sum of first 10 natural numbers?",
        options: ["45", "50", "55", "60"],
        correctOptionIndex: 2,
        explanation: "Sum = n(n+1)/2 = 10×11/2 = 55",
        topic: "Number System",
        difficulty: "Easy",
      },
      {
        id: "ssc-qa-1-q2",
        text: "Find the value of 15% of 200",
        options: ["25", "30", "35", "40"],
        correctOptionIndex: 1,
        explanation: "15% of 200 = (15/100) × 200 = 30",
        topic: "Percentage",
        difficulty: "Easy",
      },
      {
        id: "ssc-qa-1-q3",
        text: "If a number is divided by 5, the remainder is 3. What will be the remainder if the square of this number is divided by 5?",
        options: ["1", "2", "3", "4"],
        correctOptionIndex: 3,
        explanation: "Let number be 5k+3. Square = (5k+3)² = 25k²+30k+9 = 5(5k²+6k+1)+4. Remainder is 4.",
        topic: "Number System",
        difficulty: "Medium",
      },
      {
        id: "ssc-qa-1-q4",
        text: "The average of 5 consecutive numbers is 27. What is the largest number?",
        options: ["29", "30", "31", "32"],
        correctOptionIndex: 0,
        explanation: "If average is 27, middle number is 27. Numbers are 25,26,27,28,29. Largest is 29.",
        topic: "Average",
        difficulty: "Easy",
      },
      {
        id: "ssc-qa-1-q5",
        text: "What is the LCM of 12 and 18?",
        options: ["36", "72", "54", "108"],
        correctOptionIndex: 0,
        explanation: "12 = 2² × 3, 18 = 2 × 3². LCM = 2² × 3² = 36",
        topic: "LCM & HCF",
        difficulty: "Easy",
      },
    ],
  },
  "kvs-gk-2": {
    id: "kvs-gk-2",
    examId: "kvs",
    categoryId: "general-knowledge",
    title: "Science & Technology",
    difficulty: "Medium",
    durationMinutes: 45,
    questions: [
      {
        id: "kvs-gk-2-q1",
        text: "What is the main component of natural gas?",
        options: ["Ethane", "Propane", "Methane", "Butane"],
        correctOptionIndex: 2,
        explanation: "Natural gas primarily consists of methane (CH4).",
        topic: "Science",
        difficulty: "Easy",
      },
      {
        id: "kvs-gk-2-q2",
        text: "Who is known as the Father of the Indian Space Program?",
        options: ["Dr. APJ Abdul Kalam", "Dr. Vikram Sarabhai", "Dr. Homi Bhabha", "Dr. CV Raman"],
        correctOptionIndex: 1,
        explanation: "Dr. Vikram Sarabhai is known as the Father of the Indian Space Program.",
        topic: "Technology",
        difficulty: "Easy",
      },
      {
        id: "kvs-gk-2-q3",
        text: "What is the full form of AI in technology?",
        options: ["Automatic Intelligence", "Artificial Intelligence", "Advanced Intelligence", "Applied Intelligence"],
        correctOptionIndex: 1,
        explanation: "AI stands for Artificial Intelligence.",
        topic: "Technology",
        difficulty: "Easy",
      },
      {
        id: "kvs-gk-2-q4",
        text: "Which vitamin is produced when human skin is exposed to sunlight?",
        options: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"],
        correctOptionIndex: 3,
        explanation: "Vitamin D is synthesized when skin is exposed to sunlight.",
        topic: "Science",
        difficulty: "Easy",
      },
      {
        id: "kvs-gk-2-q5",
        text: "What is the speed of light in vacuum (approximately)?",
        options: ["300,000 km/s", "150,000 km/s", "450,000 km/s", "600,000 km/s"],
        correctOptionIndex: 0,
        explanation: "The speed of light in vacuum is approximately 300,000 km/s or 3 × 10⁸ m/s.",
        topic: "Science",
        difficulty: "Medium",
      },
    ],
  },
};

// Helper function to get exam by ID
export const getExamById = (examId: string): Exam | undefined => {
  return getCompetitiveExams().find((exam) => exam.id === examId);
};

// Helper function to get category from exam
export const getCategoryById = (examId: string, categoryId: string) => {
  const exam = getExamById(examId);
  return exam?.categories.find((cat) => cat.id === categoryId);
};

// Helper function to get test details
export const getTestById = (testId: string): Test | undefined => {
  // First check if test has full question data
  if (testQuestions[testId]) {
    return testQuestions[testId];
  }
  
  // Get test info
  const testInfo = getTestSummaryById(testId);
  if (!testInfo) return undefined;
  
  const { exam, category, test } = testInfo;
  
  // Check if test has questions stored in it (from bulk upload)
  if (test.questions && Array.isArray(test.questions) && test.questions.length > 0) {
    // Transform questions to match Test format
    const questions = test.questions.map((q: any, i: number) => ({
      id: q.id || `${testId}-q${i + 1}`,
      text: q.question || q.text,
      options: q.options || [],
      correctOptionIndex: q.correctAnswer !== undefined ? q.correctAnswer : q.correctOptionIndex,
      explanation: q.explanation || "",
      topic: q.topic || category.name,
      difficulty: q.difficulty || test.difficulty as "Easy" | "Medium" | "Hard",
    }));
    
    return {
      id: testId,
      examId: exam.id,
      categoryId: category.id,
      title: test.title,
      difficulty: test.difficulty as "Easy" | "Medium" | "Hard",
      durationMinutes: test.durationMinutes,
      questions,
    };
  }
  
  // If not, generate default test with sample questions
  const numQuestions = test.numQuestions || 25;
  
  // Generate sample questions
  const questions = Array.from({ length: numQuestions }, (_, i) => ({
    id: `${testId}-q${i + 1}`,
    text: `Sample question ${i + 1} for ${test.title}. This is a placeholder question that demonstrates the test format.`,
    options: [
      `Option A for question ${i + 1}`,
      `Option B for question ${i + 1}`,
      `Option C for question ${i + 1}`,
      `Option D for question ${i + 1}`,
    ],
    correctOptionIndex: i % 4, // Distribute correct answers across options
    explanation: `This is the correct answer because it demonstrates the explanation format for question ${i + 1}.`,
    topic: category.name,
    difficulty: test.difficulty as "Easy" | "Medium" | "Hard",
  }));
  
  return {
    id: testId,
    examId: exam.id,
    categoryId: category.id,
    title: test.title,
    difficulty: test.difficulty as "Easy" | "Medium" | "Hard",
    durationMinutes: test.durationMinutes,
    questions,
  };
};

// Helper function to get test summary
export const getTestSummaryById = (testId: string): { exam: Exam; category: any; test: any } | null => {
  for (const exam of getCompetitiveExams()) {
    for (const category of exam.categories) {
      const test = category.tests.find((t) => t.id === testId);
      if (test) {
        return { exam, category, test };
      }
    }
  }
  return null;
};
