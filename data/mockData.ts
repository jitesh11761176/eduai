import { User, UserRole, Course, Student, TestSubmission, Teacher, Notification, Badge, DiscussionThread, Project, Parent, Principal, Quest, StudyGroup, Rubric, MicroCredential, Internship } from '../types';

export const mockUser = (role: UserRole): User => ({
  id: role === 'admin' ? 'admin01' : role === 'teacher' ? 'teacher01' : role === 'principal' ? 'principal01' : 'student01',
  name: role === 'admin' ? 'Dr. Admin' : role === 'teacher' ? 'Dr. Evelyn Reed' : role === 'principal' ? 'Principal Anne' : 'Alex Johnson',
  email: `${role}@eduai.com`,
  role,
  avatarUrl: `https://i.pravatar.cc/150?u=${role}`,
});

export const mockParent: Parent = {
    id: 'parent01',
    name: 'Sarah Johnson',
    email: 'parent@eduai.com',
    role: 'parent',
    avatarUrl: `https://i.pravatar.cc/150?u=parent`,
    childId: 'student01' // Alex Johnson's parent
};

export const mockPrincipal: Principal = {
    id: 'principal01',
    name: 'Principal Anne',
    email: 'principal@eduai.com',
    role: 'principal',
    avatarUrl: 'https://i.pravatar.cc/150?u=principal'
};


export const mockTeachers: Teacher[] = [
    { id: 'teacher01', name: 'Dr. Evelyn Reed', email: 'e.reed@eduai.com', avatarUrl: `https://i.pravatar.cc/150?u=teacher01` },
    { id: 't2', name: 'Mr. David Chen', email: 'd.chen@eduai.com', avatarUrl: `https://i.pravatar.cc/150?u=t2` }
];

export const mockBadges: Badge[] = [
    { id: 'b1', name: 'Test Ace', description: 'Scored 9 or higher on a test.', icon: 'Award' },
    { id: 'b2', name: 'Perfect Streak', description: 'Maintained a 5-day learning streak.', icon: 'Flame' },
    { id: 'b3', name: 'Kinematics Master', description: 'Mastered the Kinematics unit.', icon: 'Rocket' },
    { id: 'b4', name: 'Weekly Winner', description: 'Top scorer of the week!', icon: 'Trophy', isTemporary: true },
];

export const mockStudents: Student[] = [
    { id: 'student01', name: 'Alex Johnson', email: 'a.johnson@eduai.com', avatarUrl: `https://i.pravatar.cc/150?u=student01`, courses: [{ courseId: 'c1', progress: 80 }, { courseId: 'c2', progress: 45 }], points: 150, badges: [mockBadges[2]], learningStreak: 3 },
    { id: 's2', name: 'Brenda Smith', email: 'b.smith@eduai.com', avatarUrl: `https://i.pravatar.cc/150?u=s2`, courses: [{ courseId: 'c1', progress: 60 }], points: 80, badges: [], learningStreak: 0, riskLevel: 'high' },
    { id: 's3', name: 'Charles Brown', email: 'c.brown@eduai.com', avatarUrl: `https://i.pravatar.cc/150?u=s3`, courses: [{ courseId: 'c1', progress: 75 }, { courseId: 'c2', progress: 90 }], points: 200, badges: [mockBadges[0]], learningStreak: 5 },
    { id: 's4', name: 'Diana Prince', email: 'd.prince@eduai.com', avatarUrl: `https://i.pravatar.cc/150?u=s4`, courses: [{ courseId: 'c2', progress: 55 }], points: 75, badges: [], learningStreak: 1, riskLevel: 'medium' },
    { id: 's5', name: 'Ethan Hunt', email: 'e.hunt@eduai.com', avatarUrl: `https://i.pravatar.cc/150?u=s5`, courses: [{ courseId: 'c1', progress: 95 }], points: 250, badges: [mockBadges[0], mockBadges[1], mockBadges[3]], learningStreak: 7 },
];

export const mockQuests: Quest[] = [
    { id: 'q1', title: 'Watch a Video Lesson', description: 'Expand your knowledge by watching any video.', points: 10, isCompleted: true },
    { id: 'q2', title: 'Complete an Interactive Quiz', description: 'Test your skills with a fill-in-the-blanks exercise.', points: 15, isCompleted: false },
    { id: 'q3', title: 'Join a Discussion', description: 'Contribute to the community by replying to a thread.', points: 20, isCompleted: false },
];


export const mockDiscussionThreads: DiscussionThread[] = [
    {
        id: 'dt1',
        courseId: 'c1',
        title: 'Question about Newton\'s Third Law',
        createdAt: new Date('2024-05-12T10:00:00Z'),
        posts: [
            { id: 'p1', authorId: 's2', authorName: 'Brenda Smith', authorAvatarUrl: `https://i.pravatar.cc/150?u=s2`, content: 'I\'m having trouble understanding the "equal and opposite reaction" part. Can someone give a real-world example?', createdAt: new Date('2024-05-12T10:00:00Z') },
            { id: 'p2', authorId: 'teacher01', authorName: 'Dr. Evelyn Reed', authorAvatarUrl: `https://i.pravatar.cc/150?u=teacher01`, content: 'A great question, Brenda! Think about a rocket. The rocket pushes hot gas downwards (action), and the gas pushes the rocket upwards (reaction). That\'s what allows it to overcome gravity.', createdAt: new Date('2024-05-12T11:30:00Z') }
        ]
    }
];

export const mockProjects: Project[] = [
    { 
        id: 'proj1', 
        title: 'Build a Simple Catapult', 
        description: 'Work in groups to design and build a small catapult that can launch a marshmallow. Submit a video of your launch and a brief report.', 
        dueDate: new Date('2024-06-15T23:59:00Z'),
        workspace: {
            tasks: [
                { id: 'task1', content: 'Research catapult designs', status: 'Done' },
                { id: 'task2', content: 'Source materials (wood, rubber bands)', status: 'In Progress' },
                { id: 'task3', content: 'Assemble the frame', status: 'To Do' },
                { id: 'task4', content: 'Film launch video', status: 'To Do' },
            ]
        }
    }
];

export const mockStudyGroups: StudyGroup[] = [
    {
        id: 'sg1',
        name: 'Physics Phantoms',
        members: [mockStudents[0], mockStudents[2]],
        chat: [
            { id: 'sgm1', sender: 'student01', senderName: 'Alex Johnson', text: 'Hey, should we meet tomorrow to review kinematics?', timestamp: new Date() }
        ]
    },
    {
        id: 'sg2',
        name: 'Mechanics Crew',
        members: [mockStudents[1], mockStudents[4]],
        chat: []
    }
];

export const mockRubric: Rubric = {
    criteria: [
        {
            id: 'crit1',
            description: 'Conceptual Understanding',
            levels: [
                { description: 'Excellent', points: 4 },
                { description: 'Good', points: 3 },
                { description: 'Needs Improvement', points: 1 }
            ]
        },
        {
            id: 'crit2',
            description: 'Problem-Solving Application',
            levels: [
                { description: 'Excellent', points: 4 },
                { description: 'Good', points: 3 },
                { description: 'Needs Improvement', points: 1 }
            ]
        },
        {
            id: 'crit3',
            description: 'Clarity and Precision',
            levels: [
                { description: 'Excellent', points: 2 },
                { description: 'Good', points: 1 },
                { description: 'Needs Improvement', points: 0 }
            ]
        }
    ]
};

export const mockCourses: Course[] = [
  {
    id: 'c1',
    title: 'Physics - Mechanics & Waves',
    classLevel: 12,
    subject: 'Physics',
    teacher: 'Dr. Evelyn Reed',
    announcements: [
        { id: 'ann1', title: 'Welcome!', content: 'Welcome to the course. Please review the syllabus in Unit 1.', author: 'Dr. Evelyn Reed', createdAt: new Date('2024-05-01T10:00:00Z') }
    ],
    chapters: [
      { id: 'ch1', title: 'Unit 1: Kinematics', materials: [
        { id: 'm1', type: 'file', title: 'Kinematics Chapter Notes.pdf', fileId: 'mock_drive_id_1' },
        { id: 'm2', type: 'file', title: 'Course Syllabus.docx', fileId: 'mock_drive_id_2' },
        { 
          id: 'm3', 
          type: 'text', 
          title: 'Key Concepts Summary', 
          content: 'This unit covers the basics of motion. Key concepts include:\n\n- **Displacement vs. Distance:** Displacement is a vector, distance is a scalar.\n- **Velocity vs. Speed:** Velocity is a vector (rate of change of displacement), speed is a scalar.\n- **Acceleration:** The rate of change of velocity.' 
        },
        { 
          id: 'm4', 
          type: 'video', 
          title: 'Introduction to Kinematics (Video)', 
          url: 'https://www.youtube.com/watch?v=_J_h_iB5K4s' 
        },
        {
          id: 'm5',
          type: 'interactive',
          title: 'Fill in the Blanks: Key Concepts',
          interactiveContent: {
            type: 'fill-in-the-blank',
            sentences: [
              "Displacement is a ", { blank: "vector" }, " quantity, while distance is a ", { blank: "scalar" }, " quantity.",
              "The rate of change of velocity is known as ", { blank: "acceleration" }, "."
            ],
            answers: { "vector": "vector", "scalar": "scalar", "acceleration": "acceleration" }
          }
        }
      ], completed: true, test: { 
          id: 't1', 
          title: 'Unit 1 Test', 
          type: 'online', 
          duration: 1, // 1 minute for easy testing
          rubric: mockRubric,
          questions: [
              {id: 'q1', text: 'What is the formula for velocity?', type: 'subjective', difficulty: 'medium'},
              {
                  id: 'q2',
                  text: 'An object is thrown straight up. At the highest point, its velocity is:',
                  type: 'mcq',
                  options: ['Maximum', 'Zero', 'Minimum', 'Cannot be determined'],
                  correctAnswer: 'Zero',
                  difficulty: 'easy'
              },
              {
                  id: 'q3',
                  text: 'Displacement can be greater than distance.',
                  type: 'true-false',
                  correctAnswer: 'False',
                  difficulty: 'easy'
              }
            ] 
        } 
    },
      { id: 'ch2', title: 'Unit 2: Laws of Motion', materials: [], completed: true },
      { id: 'ch3', title: 'Unit 3: Work, Energy, and Power', materials: [], completed: false },
      { id: 'ch4', title: 'Unit 4: Simple Harmonic Motion', materials: [], completed: false, test: { id: 't2', title: 'Unit 4 Test', type: 'offline', questions: [{id: 'q2_1', text: 'Explain Simple Harmonic Motion with an example.', type: 'subjective' }] } },
    ],
    discussionThreads: mockDiscussionThreads,
    projects: mockProjects,
    studyGroups: mockStudyGroups,
  },
  {
    id: 'c2',
    title: 'Chemistry - Organic Chemistry',
    classLevel: 12,
    subject: 'Chemistry',
    teacher: 'Mr. David Chen',
    announcements: [],
    chapters: [
      { id: 'c2ch1', title: 'Unit 1: Haloalkanes and Haloarenes', materials: [], completed: true },
      { id: 'c2ch2', title: 'Unit 2: Alcohols, Phenols and Ethers', materials: [], completed: false },
    ],
    discussionThreads: [],
    projects: [],
    studyGroups: [],
  },
];

export const mockSubmissions: TestSubmission[] = [
    {
        id: 'sub1',
        studentId: 'student01', // Alex Johnson
        courseId: 'c1',
        chapterId: 'ch1',
        testId: 't1',
        answers: [
            { questionId: 'q1', answer: 'Velocity is the rate of change of displacement with respect to time. It is a vector quantity, having both magnitude and direction.' },
            { questionId: 'q2', answer: 'Zero' },
            { questionId: 'q3', answer: 'False' }
        ],
        submittedAt: new Date('2024-05-10T09:00:00Z'),
        score: 8,
        feedback: 'Great job, Alex! Your definition of velocity is precise. You also correctly identified the velocity at the highest point and the relationship between distance and displacement. Keep up the excellent work.',
        detailedAiFeedback: {
            strengths: "Excellent conceptual clarity on the definition of velocity as a vector quantity.",
            weaknesses: "While the answer is correct, it could be enhanced by including the formula (v = Δs/Δt) for completeness.",
            suggestion: "Next time, try to include both the definition and the mathematical formula to provide a more comprehensive answer."
        },
        rubricEvaluation: { 'crit1': 3, 'crit2': 4, 'crit3': 1 }
    }
];

export const mockNotifications: Notification[] = [
    {
        id: 'notif1',
        userId: 'student01',
        message: 'Your Unit 1 Test for Physics has been graded.',
        link: { view: 'courseDetail', context: { courseId: 'c1' } },
        createdAt: new Date('2024-05-11T14:00:00Z'),
        read: false
    },
    {
        id: 'notif2',
        userId: 'student01',
        message: 'Dr. Evelyn Reed posted a new announcement in Physics - Mechanics & Waves.',
        link: { view: 'courseDetail', context: { courseId: 'c1' } },
        createdAt: new Date('2024-05-09T11:00:00Z'),
        read: true
    }
];


export const mockMicroCredentials: MicroCredential[] = [
    { id: 'mc1', title: 'Statistical Analysis in Physics', issuer: 'EduAI & Physics Association of India', issueDate: 'May 2024', icon: 'BarChart' },
    { id: 'mc2', title: 'Lab Safety Certified', issuer: 'EduAI Labs', issueDate: 'April 2024', icon: 'ShieldCheck' }
];

export const mockInternships: Internship[] = [
    { id: 'int1', company: 'TechNova Solutions', logoUrl: 'https://placehold.co/40x40/3b82f6/ffffff?text=T', title: 'Summer Physics Research Intern', location: 'Remote', description: 'Assist our R&D team in analyzing experimental data and simulating physical systems.' },
    { id: 'int2', company: 'Innovate Labs', logoUrl: 'https://placehold.co/40x40/10b981/ffffff?text=I', title: 'Jr. Chemistry Lab Assistant', location: 'New Delhi', description: 'Support senior chemists in preparing solutions, maintaining equipment, and documenting results.' }
];