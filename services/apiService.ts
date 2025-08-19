import { mockCourses, mockStudents, mockTeachers, mockSubmissions, mockNotifications, mockBadges } from '../data/mockData';
import { Course, Student, Teacher, TestSubmission, CourseMaterial, Test, UserRole, Announcement, Notification, View, DiscussionThread, DiscussionPost, CalendarEvent, Rubric } from '../types';

// --- In-memory database simulation ---
let coursesDB: Course[] = JSON.parse(JSON.stringify(mockCourses));
let studentsDB: Student[] = JSON.parse(JSON.stringify(mockStudents));
let teachersDB: Teacher[] = JSON.parse(JSON.stringify(mockTeachers));
let submissionsDB: TestSubmission[] = JSON.parse(JSON.stringify(mockSubmissions));
let notificationsDB: Notification[] = JSON.parse(JSON.stringify(mockNotifications));

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- Helper to create notifications ---
const createNotification = (userId: string, message: string, link?: { view: View; context: any }) => {
    const newNotif: Notification = {
        id: `notif_${Date.now()}_${Math.random()}`,
        userId,
        message,
        link,
        createdAt: new Date(),
        read: false,
    };
    notificationsDB.unshift(newNotif);
};

export const getInitialData = async () => {
    await delay(1000); // Simulate network delay
    // Simulate learning streak reset
    studentsDB.forEach(s => {
        // In a real app, this would be a daily cron job checking last login
        if (Math.random() > 0.7) s.learningStreak = 0;
    });
    return {
        courses: JSON.parse(JSON.stringify(coursesDB)),
        students: JSON.parse(JSON.stringify(studentsDB)),
        teachers: JSON.parse(JSON.stringify(teachersDB)),
        submissions: JSON.parse(JSON.stringify(submissionsDB)),
    };
};

export const getNotificationsForUser = async (userId: string): Promise<Notification[]> => {
    await delay(200);
    return JSON.parse(JSON.stringify(notificationsDB.filter(n => n.userId === userId)));
};

export const markNotificationsAsRead = async (userId: string, notificationIds: string[]): Promise<Notification[]> => {
    await delay(100);
    notificationsDB.forEach(n => {
        if (n.userId === userId && notificationIds.includes(n.id)) {
            n.read = true;
        }
    });
    return getNotificationsForUser(userId);
};

export const createCourse = async (courseData: Omit<Course, 'id' | 'teacher' | 'chapters' | 'announcements' | 'discussionThreads' | 'projects' | 'studyGroups'>, teacherName: string): Promise<Course> => {
    await delay(500);
    const newCourse: Course = {
        id: `c${coursesDB.length + 1}_${Date.now()}`,
        teacher: teacherName,
        chapters: [],
        announcements: [],
        discussionThreads: [],
        projects: [],
        studyGroups: [],
        ...courseData,
    };
    coursesDB.push(newCourse);
    return JSON.parse(JSON.stringify(newCourse));
};

export const createAnnouncement = async (courseId: string, authorName: string, title: string, content: string): Promise<Announcement> => {
    await delay(400);
    const course = coursesDB.find(c => c.id === courseId);
    if (!course) throw new Error("Course not found");

    const newAnnouncement: Announcement = {
        id: `ann_${Date.now()}`,
        title,
        content,
        author: authorName,
        createdAt: new Date(),
    };
    course.announcements.unshift(newAnnouncement);

    const enrolledStudentIds = studentsDB.filter(s => s.courses.some(c => c.courseId === courseId)).map(s => s.id);
    enrolledStudentIds.forEach(studentId => {
        createNotification(
            studentId,
            `${authorName} posted "${title}" in ${course.title}.`,
            { view: 'courseDetail', context: { courseId } }
        );
    });

    return JSON.parse(JSON.stringify(newAnnouncement));
};

export const createCourseMaterial = async (courseId: string, chapterId: string, material: Omit<CourseMaterial, 'id'>): Promise<CourseMaterial> => {
    await delay(300);
    const course = coursesDB.find(c => c.id === courseId);
    if (!course) throw new Error("Course not found");

    const chapter = course.chapters.find(ch => ch.id === chapterId);
    if (!chapter) throw new Error("Chapter not found");

    const newMaterial: CourseMaterial = {
        id: `mat_${Date.now()}`,
        ...material,
    };
    chapter.materials.push(newMaterial);
    
    // Gamification: Award points for completing a chapter
    const student = studentsDB.find(s => s.id === 'student01'); // Assume current user
    if (student) {
        chapter.completed = true; // Mark as completed
        student.points += 10; // Award points
        student.learningStreak += 1; // Increment streak
        createNotification(student.id, `+10 points for completing chapter "${chapter.title}"!`);
    }

    return JSON.parse(JSON.stringify(newMaterial));
};

export const updateCourseMaterial = async (courseId: string, chapterId: string, material: CourseMaterial): Promise<CourseMaterial> => {
    await delay(300);
    const course = coursesDB.find(c => c.id === courseId);
    if (!course) throw new Error("Course not found");

    const chapter = course.chapters.find(ch => ch.id === chapterId);
    if (!chapter) throw new Error("Chapter not found");

    const materialIndex = chapter.materials.findIndex(m => m.id === material.id);
    if (materialIndex === -1) throw new Error("Material not found");

    chapter.materials[materialIndex] = material;
    return JSON.parse(JSON.stringify(material));
};


export const removeCourseMaterial = async (courseId: string, chapterId: string, materialId: string): Promise<void> => {
    await delay(300);
    const course = coursesDB.find(c => c.id === courseId);
    if (!course) throw new Error("Course not found");

    const chapter = course.chapters.find(ch => ch.id === chapterId);
    if (!chapter) throw new Error("Chapter not found");

    chapter.materials = chapter.materials.filter(m => m.id !== materialId);
};

export const createTestSubmission = async (submissionData: Omit<TestSubmission, 'id' | 'submittedAt'>): Promise<TestSubmission> => {
    await delay(700);
    const newSubmission: TestSubmission = {
        id: `sub_${Date.now()}`,
        submittedAt: new Date(),
        ...submissionData,
    };
    submissionsDB.push(newSubmission);
    const course = coursesDB.find(c => c.id === submissionData.courseId);
    const teacher = teachersDB.find(t => t.name === course?.teacher);
    const student = studentsDB.find(s => s.id === submissionData.studentId);
    if (teacher && student) {
        createNotification(teacher.id, `${student.name} submitted a test for ${course?.title}.`);
    }

    return JSON.parse(JSON.stringify(newSubmission));
};

export const createTest = async (courseId: string, chapterId: string, testDetails: Pick<Test, 'title' | 'questions' | 'isAdaptive' | 'rubric'> & { duration?: number }): Promise<Test> => {
    await delay(500);
    const course = coursesDB.find(c => c.id === courseId);
    if (!course) throw new Error("Course not found");
    
    const chapter = course.chapters.find(ch => ch.id === chapterId);
    if (!chapter) throw new Error("Chapter not found");

    if(chapter.test) throw new Error("Chapter already has a test");

    const newTest: Test = {
        id: `t_${Date.now()}`,
        type: 'online',
        ...testDetails
    };

    chapter.test = newTest;
    return JSON.parse(JSON.stringify(newTest));
};

export const updateSubmissionEvaluation = async (submissionId: string, score: number, feedback: string, rubricEvaluation?: Record<string, number>): Promise<TestSubmission> => {
    await delay(600);
    const submission = submissionsDB.find(s => s.id === submissionId);
    if (!submission) throw new Error("Submission not found");
    
    submission.score = score;
    submission.feedback = feedback;
    submission.rubricEvaluation = rubricEvaluation;
    
    const course = coursesDB.find(c => c.id === submission.courseId);
    const chapter = course?.chapters.find(ch => ch.id === submission.chapterId);
    if (course && chapter?.test) {
         createNotification(
            submission.studentId,
            `Your test "${chapter.test.title}" has been graded.`,
            { view: 'courseDetail', context: { courseId: course.id } }
        );
    }

    return JSON.parse(JSON.stringify(submission));
};

export const awardPointsToStudent = async (studentId: string, points: number): Promise<Student> => {
    await delay(100);
    const student = studentsDB.find(s => s.id === studentId);
    if (!student) throw new Error("Student not found");
    student.points += points;
    
    // Check for badges
    if (points >= 9 && !student.badges.some(b => b.id === 'b1')) {
        student.badges.push(mockBadges[0]);
        createNotification(studentId, `New Badge Unlocked: Test Ace!`);
    }
    if (student.learningStreak >= 5 && !student.badges.some(b => b.id === 'b2')) {
        student.badges.push(mockBadges[1]);
        createNotification(studentId, `New Badge Unlocked: Perfect Streak!`);
    }

    return JSON.parse(JSON.stringify(student));
}


// --- User Management APIs ---

type UserCreationData = { name: string; email: string; role: UserRole; courseIds?: string[] };
type UserUpdateData = { name: string; email: string; courseIds?: string[] };

export const addUser = async (userData: UserCreationData): Promise<Student | Teacher> => {
    await delay(500);
    const { role, name, email, courseIds } = userData;
    
    if (role === 'student') {
        const newStudent: Student = {
            id: `s_${Date.now()}`,
            name,
            email,
            avatarUrl: `https://i.pravatar.cc/150?u=${email}`,
            courses: courseIds ? courseIds.map(courseId => ({ courseId, progress: 0 })) : [],
            points: 0,
            badges: [],
            learningStreak: 0,
        };
        studentsDB.push(newStudent);
        return JSON.parse(JSON.stringify(newStudent));
    } else if (role === 'teacher') {
        const newTeacher: Teacher = {
            id: `t_${Date.now()}`,
            name,
            email,
            avatarUrl: `https://i.pravatar.cc/150?u=${email}`,
        };
        teachersDB.push(newTeacher);
        return JSON.parse(JSON.stringify(newTeacher));
    }
    throw new Error("Invalid user role");
};

export const updateUser = async (userId: string, role: UserRole, userData: UserUpdateData): Promise<Student | Teacher> => {
    await delay(500);
    const { name, email, courseIds } = userData;

    if (role === 'student') {
        const student = studentsDB.find(s => s.id === userId);
        if (!student) throw new Error("Student not found");
        student.name = name;
        student.email = email;
        if (courseIds) {
            student.courses = courseIds.map(courseId => {
                const existing = student.courses.find(c => c.courseId === courseId);
                return existing || { courseId, progress: 0 };
            });
        }
        return JSON.parse(JSON.stringify(student));
    } else if (role === 'teacher') {
        const teacher = teachersDB.find(t => t.id === userId);
        if (!teacher) throw new Error("Teacher not found");
        teacher.name = name;
        teacher.email = email;
        return JSON.parse(JSON.stringify(teacher));
    }
     throw new Error("Invalid user role");
};

export const deleteUser = async (userId: string, role: UserRole): Promise<{ id: string }> => {
    await delay(500);
    if (role === 'student') {
        studentsDB = studentsDB.filter(s => s.id !== userId);
    } else if (role === 'teacher') {
        teachersDB = teachersDB.filter(t => t.id !== userId);
    } else {
        throw new Error("Invalid user role");
    }
    return { id: userId };
};

// --- Discussion Forum APIs ---

export const createDiscussionThread = async (courseId: string, title: string, firstPost: Omit<DiscussionPost, 'id' | 'createdAt'>): Promise<DiscussionThread> => {
    await delay(400);
    const course = coursesDB.find(c => c.id === courseId);
    if (!course) throw new Error("Course not found");
    
    const newThread: DiscussionThread = {
        id: `dt_${Date.now()}`,
        courseId,
        title,
        createdAt: new Date(),
        posts: [{
            id: `p_${Date.now()}`,
            createdAt: new Date(),
            ...firstPost
        }]
    };
    course.discussionThreads.unshift(newThread);
    return JSON.parse(JSON.stringify(newThread));
};

export const addDiscussionPost = async (threadId: string, post: Omit<DiscussionPost, 'id' | 'createdAt'>): Promise<DiscussionThread> => {
    await delay(300);
    const course = coursesDB.find(c => c.discussionThreads.some(t => t.id === threadId));
    if (!course) throw new Error("Thread not found");
    const thread = course.discussionThreads.find(t => t.id === threadId)!;

    const newPost: DiscussionPost = {
        id: `p_${Date.now()}`,
        createdAt: new Date(),
        ...post
    };
    thread.posts.push(newPost);
    return JSON.parse(JSON.stringify(thread));
};

// --- Calendar API ---

export const getCalendarEvents = async (): Promise<CalendarEvent[]> => {
    await delay(300);
    const events: CalendarEvent[] = [];
    coursesDB.forEach(course => {
        // Find tests
        course.chapters.forEach(chapter => {
            if (chapter.test) {
                // In a real app, tests would have due dates. Simulating one for now.
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + 7);
                events.push({
                    id: `test-${chapter.test.id}`,
                    title: `Test: ${chapter.test.title}`,
                    date: dueDate,
                    type: 'test',
                    courseTitle: course.title
                });
            }
        });
        // Find projects
        course.projects.forEach(project => {
            events.push({
                id: `project-${project.id}`,
                title: `Project Due: ${project.title}`,
                date: project.dueDate,
                type: 'project',
                courseTitle: course.title
            });
        });
    });
    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
};