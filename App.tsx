import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { UserRole, Course, Student, CourseMaterial, Test, TestSubmission, Teacher, Notification, View, Announcement, DiscussionThread, DiscussionPost, Project, Parent, Principal, AuthenticatedUser } from './types';
import { mockUser, mockParent, mockPrincipal } from './data/mockData';
import { signInWithGoogle, FirebaseUser, saveUserToFirestore, getUserFromFirestore, createCourseInFirestore, getCoursesForTeacher, getCoursesForStudent, enrollStudentInCourse, getAllStudentsFromFirestore, getAllCoursesFromFirestore, auth, createTestSubmissionFS, getTestSubmissionsForTeacher, getTestSubmissionsForStudent, updateTestSubmissionFS, awardPointsToStudentFS, markMaterialCompletedFS, getMaterialCompletionsForStudent, unmarkMaterialCompletedFS, createCourseAnnouncementFS, updateCourseAnnouncementFS } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import AdminDashboard from './components/dashboard/AdminDashboard';
import TeacherDashboard from './components/dashboard/TeacherDashboard';
import StudentDashboard from './components/dashboard/StudentDashboard';
import PrincipalDashboard from './components/dashboard/PrincipalDashboard';
import Layout from './components/layout/Layout';
import { AuthContext } from './contexts/AuthContext';
import CourseDetail from './components/course/CourseDetail';
import TestTakingPage from './components/test/TestTakingPage';
import CreateTestPage from './components/test/CreateTestPage';
import TestFeedbackModal from './components/test/TestFeedbackModal';
import ManageUsersPage from './components/admin/ManageUsersPage';
import CalendarPage from './components/CalendarPage';
import TeacherCommunity from './components/community/TeacherCommunity';
import DiscussionThreadPage from './components/course/DiscussionThreadPage';
import ProjectWorkspacePage from './components/course/ProjectWorkspacePage';
import * as api from './services/apiService';
import LoadingSpinner from './components/common/LoadingSpinner';
import TeacherAnalyticsPage from './components/analytics/TeacherAnalyticsPage';
// import { mockUser, mockParent, mockPrincipal } from './data/mockData';
import ParentDashboard from './components/dashboard/ParentDashboard';
import Toast from './components/common/Toast';
import { Lightbulb, UserCheck, Users, Shield, Settings, UserCog, Briefcase, ClipboardEdit, GitMerge, Mic, TrendingUp, Sparkles } from 'lucide-react';
import CareerCenterPage from './components/student/CareerCenterPage';
import LessonPlannerPage from './components/teacher/LessonPlannerPage';

type UserData = { name: string; email: string; role: UserRole; courseIds?: string[] };
type UserUpdateData = { name: string; email: string; courseIds?: string[] };

// A simple SVG for the Google G logo
const GoogleLogo = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; iconBg: string; }> = ({ icon, title, description, iconBg }) => (
    <div className="bg-white/60 backdrop-blur-md p-6 rounded-xl shadow-md border border-white/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
        <div className={`flex items-center justify-center h-12 w-12 rounded-full ${iconBg} mb-4`}>
            {icon}
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
    </div>
);

const LoginScreen: React.FC<{ onGoogleSignIn: () => void }> = ({ onGoogleSignIn }) => {
    const quotes = [
        "The future belongs to those who believe in the beauty of their dreams.",
        "Your education is a dress rehearsal for a life that is yours to lead.",
        "Empower your mind, and you will empower your future.",
        "The best way to predict your future is to create it.",
        "Believe you can and you're halfway there.",
        "Learning is the only thing the mind never exhausts, never fears, and never regrets."
    ];

    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setIsFading(true);
            setTimeout(() => {
                setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
                setIsFading(false);
            }, 500); // Corresponds to the fade-out duration
        }, 7000); // Change quote every 7 seconds

        return () => clearInterval(intervalId);
    }, [quotes.length]);

    return (
    <div className="min-h-screen bg-transparent text-gray-800">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 p-4 z-20 bg-white/60 backdrop-blur-lg border-b border-white/20">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold text-primary-600">EduAI Platform</h1>
                <button 
                    onClick={onGoogleSignIn}
                    className="hidden sm:inline-flex items-center bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-700 transition duration-300 shadow-sm"
                >
                    Sign In
                </button>
            </div>
        </header>

        {/* Hero Section */}
        <main className="relative overflow-hidden">
            <div className="container mx-auto px-4 pt-28 pb-20 lg:pt-36 lg:pb-28">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="text-center lg:text-left">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900">
                            The Future of Learning is <span className="text-primary-600">Here.</span>
                        </h1>
                        <p className="mt-6 max-w-2xl mx-auto lg:mx-0 text-lg sm:text-xl text-gray-600">
                            Experience a hyper-personalized education that adapts to you, empowers teachers, and prepares you for the real world.
                        </p>
                        <div className="mt-8 h-12 flex items-center justify-center lg:justify-start">
                            <p className={`max-w-2xl mx-auto lg:mx-0 text-lg text-gray-700 italic transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
                                "{quotes[currentQuoteIndex]}"
                            </p>
                        </div>
                    </div>
                    <div className="max-w-md mx-auto w-full">
                         <div className="p-8 bg-white/50 backdrop-blur-xl rounded-xl shadow-2xl text-center border border-white/30">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to EduAI</h2>
                            <p className="text-gray-600 mb-6">Your AI-Powered Learning Companion</p>
                            <button 
                                onClick={onGoogleSignIn} 
                                className="w-full flex items-center justify-center bg-white text-gray-700 font-semibold py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition duration-300 shadow-sm"
                            >
                                <GoogleLogo />
                                <span className="ml-3">Sign in with Google</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        {/* Features Section */}
        <section className="py-20 bg-white/40 backdrop-blur-xl border-y border-white/20">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Discover the EduAI Difference</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                        We leverage cutting-edge AI to create a learning ecosystem that supports every user, every step of the way.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<GitMerge size={24} />}
                        title="AI-Adaptive Pathways"
                        description="Your curriculum adapts in real-time. Master concepts faster and get help exactly where you need it, creating a truly unique learning journey."
                        iconBg="bg-primary-100 text-primary-700"
                    />
                    <FeatureCard
                        icon={<Mic size={24} />}
                        title="24/7 AI Voice Tutor"
                        description="Stuck on a problem? Ask our voice-powered AI tutor for an explanation anytime. It’s like having a personal teacher on demand."
                        iconBg="bg-accent-100 text-accent-700"
                    />
                     <FeatureCard
                        icon={<Briefcase size={24} />}
                        title="Career Readiness"
                        description="Go beyond grades. Earn industry-recognized micro-credentials and connect with real-world projects and internships."
                        iconBg="bg-secondary-100 text-secondary-700"
                    />
                     <FeatureCard
                        icon={<ClipboardEdit size={24} />}
                        title="AI Lesson Planner"
                        description="Generate complete, high-quality lesson plans in seconds. Spend more time teaching and less time on paperwork."
                        iconBg="bg-rose-100 text-rose-700"
                    />
                    <FeatureCard
                        icon={<TrendingUp size={24} />}
                        title="Predictive Analytics"
                        description="Identify at-risk students before they struggle. Our AI provides proactive insights to help you intervene effectively and make a real impact."
                        iconBg="bg-success-100 text-success-700"
                    />
                    <FeatureCard
                        icon={<Sparkles size={24} />}
                        title="Automated Feedback"
                        description="Provide rich, constructive feedback on assignments instantly. AI helps you scale personalized guidance for every student."
                        iconBg="bg-warning-100 text-warning-700"
                    />
                </div>
            </div>
        </section>

        {/* Footer */}
        <footer className="bg-transparent">
            <div className="container mx-auto px-4 py-8 text-center text-gray-500">
                <p>&copy; 2024 EduAI Platform. All rights reserved.</p>
            </div>
        </footer>
    </div>
)};

interface RoleSelectionScreenProps {
    onSelectRole: (role: UserRole) => void;
    onBack: () => void;
}

const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({ onSelectRole, onBack }) => (
     <div className="flex items-center justify-center min-h-screen bg-transparent">
        <div className="p-8 bg-white/70 backdrop-blur-lg rounded-xl shadow-lg text-center max-w-lg w-full border border-white/50">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Choose Your Role</h2>
            <p className="text-gray-600 mb-6">Select how you'd like to sign in for this session.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 <button onClick={() => onSelectRole('student')} className="p-6 bg-primary-100 text-primary-800 font-bold rounded-lg hover:bg-primary-200 transition duration-300 shadow-sm border border-primary-200 text-center">
                    <Users size={24} className="mx-auto mb-2" />
                    Student
                </button>
                <button onClick={() => onSelectRole('teacher')} className="p-6 bg-success-100 text-success-800 font-bold rounded-lg hover:bg-success-200 transition duration-300 shadow-sm border border-success-200 text-center">
                    <UserCheck size={24} className="mx-auto mb-2" />
                    Teacher
                </button>
                <button onClick={() => onSelectRole('parent')} className="p-6 bg-warning-100 text-warning-800 font-bold rounded-lg hover:bg-warning-200 transition duration-300 shadow-sm border border-warning-200 text-center">
                    <Shield size={24} className="mx-auto mb-2" />
                    Parent
                </button>
                 <button onClick={() => onSelectRole('principal')} className="p-6 bg-purple-100 text-purple-800 font-bold rounded-lg hover:bg-purple-200 transition duration-300 shadow-sm border border-purple-200 text-center">
                    <UserCog size={24} className="mx-auto mb-2" />
                    Principal
                </button>
                <button onClick={() => onSelectRole('admin')} className="p-6 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition duration-300 shadow-sm border border-gray-300 text-center col-span-2 md:col-span-1">
                    <Settings size={24} className="mx-auto mb-2" />
                    Admin
                </button>
            </div>
            <button onClick={onBack} className="mt-6 text-sm text-gray-500 hover:underline">
                &larr; Back to sign in
            </button>
        </div>
    </div>
);


const App: React.FC = () => {
    const [user, setUser] = useState<AuthenticatedUser | null>(null);
    // Store Google user info temporarily after login
    const [pendingGoogleUser, setPendingGoogleUser] = useState<FirebaseUser | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [submissions, setSubmissions] = useState<TestSubmission[]>([]);
    const [materialCompletions, setMaterialCompletions] = useState<Record<string, any[]>>({}); // key: courseId
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    // Used to trigger student course refresh after new course is created
    const [coursesUpdated, setCoursesUpdated] = useState(0);

    const [view, setView] = useState<View>('dashboard');
    const [viewContext, setViewContext] = useState<any>({});
    const [viewingSubmissionId, setViewingSubmissionId] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [aiNudge, setAiNudge] = useState<{ message: string; cta: { text: string; action: () => void } } | null>(null);
    const [loginStep, setLoginStep] = useState<'initial' | 'roleSelection'>('initial');

    // Persistent login: listen for Firebase Auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Try to get user from Firestore
                let firestoreUser = await getUserFromFirestore(firebaseUser.uid);
                if (firestoreUser) {
                    setUser(firestoreUser);
                    // Fetch courses & submissions for user role
                    if (firestoreUser.role === 'teacher') {
                        const [teacherCourses, subs] = await Promise.all([
                            getCoursesForTeacher(firestoreUser.id),
                            getTestSubmissionsForTeacher(firestoreUser.id)
                        ]);
                        setCourses(teacherCourses as any);
                        setSubmissions(subs as any);
                    } else if (firestoreUser.role === 'student') {
                        const [studentCourses, subs] = await Promise.all([
                            getCoursesForStudent(firestoreUser.id),
                            getTestSubmissionsForStudent(firestoreUser.id)
                        ]);
                        setCourses(studentCourses as any);
                        setSubmissions(subs as any);
                        // Load material completions per course
                        const completionsEntries = await Promise.all(studentCourses.map(async c => [c.id, await getMaterialCompletionsForStudent(firestoreUser.id, c.id)] as const));
                        setMaterialCompletions(Object.fromEntries(completionsEntries));
                    }
                }
            }
        });
        return () => unsubscribe();
    }, []);

    // When a new course is created, trigger student course refresh
    useEffect(() => {
    if (user && user.role === 'student') {
            (async () => {
        const [studentCourses, subs] = await Promise.all([
                    getCoursesForStudent(user.id),
                    getTestSubmissionsForStudent(user.id)
                ]);
                setCourses(studentCourses as any);
                setSubmissions(subs as any);
        const completionsEntries = await Promise.all(studentCourses.map(async c => [c.id, await getMaterialCompletionsForStudent(user.id, c.id)] as const));
        setMaterialCompletions(Object.fromEntries(completionsEntries));
            })();
        }
    }, [coursesUpdated, user]);

    useEffect(() => {
        if(user) {
            const loadData = async () => {
                setIsLoading(true);
                try {
                    // Fetch students from Firestore
                    const [studentsFromFS, notifs] = await Promise.all([
                        getAllStudentsFromFirestore(),
                        api.getNotificationsForUser(user.id)
                    ]);
                    setStudents(studentsFromFS);
                    setNotifications(notifs);
                } catch (error) {
                    console.error("Failed to load initial data", error);
                } finally {
                    setIsLoading(false);
                }
            };
            loadData();
        } else {
            setIsLoading(false);
            setCourses([]);
            setStudents([]);
            setTeachers([]);
            setSubmissions([]);
            setNotifications([]);
        }
    }, [user]);

     const navigate = useCallback((targetView: View, context: any = {}) => {
        setView(targetView);
        setViewContext(context);
        setIsSidebarOpen(false);
        setAiNudge(null); // Dismiss nudge on navigation
    }, []);

    useEffect(() => {
        if (user?.role === 'student') {
            const worstSubmission = submissions
                .filter(s => s.studentId === user.id && typeof s.score === 'number' && s.score! < 5)
                .sort((a,b) => a.score! - b.score!)[0];

            if (worstSubmission) {
                const course = courses.find(c => c.id === worstSubmission.courseId);
                const chapter = course?.chapters.find(c => c.id === worstSubmission.chapterId);
                if (course && chapter) {
                    setTimeout(() => { // Show nudge after a delay
                        setAiNudge({
                            message: `I noticed you had some trouble with the "${chapter.title}" test. Would you like to review the key concepts?`,
                            cta: {
                                text: 'Review Now',
                                action: () => navigate('courseDetail', { courseId: course.id })
                            }
                        });
                    }, 5000);
                }
            }
        }
    }, [user, submissions, courses, navigate]);



    const handleLogin = useCallback((role: UserRole) => {
        // Always use mock data for user, but use Google photo/name if available
        setUser(() => {
            if (role === 'parent') {
                return mockParent;
            } else if (role === 'principal') {
                return mockPrincipal;
            } else {
                const base = mockUser(role);
                return base;
            }
        });
        setView('dashboard');
        setLoginStep('initial'); // Reset for next login
    }, []);

    const handleLogout = useCallback(() => {
    setUser(null);
        setView('dashboard');
        setViewContext({});
        setViewingSubmissionId(null);
        setIsSidebarOpen(false);
        setLoginStep('initial'); // Reset login flow
    }, []);
    
    // Google sign-in handler using Firebase and Firestore
    const handleGoogleSignIn = async () => {
        try {
            const firebaseUser: FirebaseUser = await signInWithGoogle();
            if (!firebaseUser) return;
            // Try to get user from Firestore
            let firestoreUser = await getUserFromFirestore(firebaseUser.uid);
            if (!firestoreUser) {
                // New user: show role selection page
                setPendingGoogleUser(firebaseUser);
                setLoginStep('roleSelection');
                return;
            }
            setUser(firestoreUser);
            // Fetch courses for user
            if (firestoreUser.role === 'teacher') {
                const [teacherCourses, subs] = await Promise.all([
                    getCoursesForTeacher(firestoreUser.id),
                    getTestSubmissionsForTeacher(firestoreUser.id)
                ]);
                setCourses(teacherCourses as any);
                setSubmissions(subs as any);
            } else if (firestoreUser.role === 'student') {
                const [studentCourses, subs] = await Promise.all([
                    getCoursesForStudent(firestoreUser.id),
                    getTestSubmissionsForStudent(firestoreUser.id)
                ]);
                setCourses(studentCourses as any);
                setSubmissions(subs as any);
            }
            setLoginStep('initial');
        } catch (error) {
            alert('Google sign-in failed. Please try again.');
        }
    };

    // Handle role selection for new Google users
    const handleRoleSelection = async (role: UserRole) => {
        if (!pendingGoogleUser) return;
        const firestoreUser = {
            id: pendingGoogleUser.uid,
            name: pendingGoogleUser.displayName || pendingGoogleUser.email || 'Google User',
            email: pendingGoogleUser.email || '',
            role: role,
            avatarUrl: pendingGoogleUser.photoURL || ''
        };
        await saveUserToFirestore(firestoreUser);
        setUser(firestoreUser);
        if (role === 'teacher') {
            const [teacherCourses, subs] = await Promise.all([
                getCoursesForTeacher(firestoreUser.id),
                getTestSubmissionsForTeacher(firestoreUser.id)
            ]);
            setCourses(teacherCourses as any);
            setSubmissions(subs as any);
        } else if (role === 'student') {
            const allCourses = await getAllCoursesFromFirestore();
            await Promise.all(allCourses.map(c => enrollStudentInCourse(firestoreUser.id, c.id)));
            const [enrolledCourses, subs] = await Promise.all([
                getCoursesForStudent(firestoreUser.id),
                getTestSubmissionsForStudent(firestoreUser.id)
            ]);
            setCourses(enrolledCourses as any);
            setSubmissions(subs as any);
            const completionsEntries = await Promise.all(enrolledCourses.map(async c => [c.id, await getMaterialCompletionsForStudent(firestoreUser.id, c.id)] as const));
            setMaterialCompletions(Object.fromEntries(completionsEntries));
        }
        setPendingGoogleUser(null);
        setLoginStep('initial');
    };
    const handleBackToLogin = () => setLoginStep('initial');

    const authContextValue = useMemo(() => ({ user, logout: handleLogout }), [user, handleLogout]);
    
    const selectedCourse = useMemo(() => 
        (view === 'courseDetail' || view === 'discussionThread' || view === 'projectWorkspace') && viewContext.courseId 
            ? courses.find(c => c.id === viewContext.courseId) || null 
            : null
    , [view, viewContext, courses]);

    // Add course using Firestore and auto-enroll teacher
    const addCourse = async (courseData: Omit<Course, 'id' | 'teacher' | 'chapters' | 'announcements' | 'discussionThreads' | 'projects' | 'studyGroups'>) => {
        if (!user) return;
        // Add teacherId to course
        const courseToSave = { ...courseData, teacherId: user.id, teacher: user.name };
        const courseId = await createCourseInFirestore(courseToSave);
        // Auto-enroll all students in the new course
        const allStudents = await getAllStudentsFromFirestore();
        await Promise.all(allStudents.map(s => enrollStudentInCourse(s.id, courseId)));
        // Fetch updated courses for teacher
        const teacherCourses = await getCoursesForTeacher(user.id);
        setCourses(teacherCourses);
        // Notify students to refresh their course list
        setCoursesUpdated(c => c + 1);
    };

    const addCourseMaterial = async (courseId: string, chapterId: string, material: Omit<CourseMaterial, 'id'>) => {
        const newMaterial = await api.createCourseMaterial(courseId, chapterId, material);
        setCourses(prevCourses => prevCourses.map(course => {
            if (course.id === courseId) {
                return { ...course, chapters: course.chapters.map(chapter => 
                    chapter.id === chapterId ? { ...chapter, materials: [...chapter.materials, newMaterial] } : chapter
                )};
            }
            return course;
        }));
    };
    
    const handleCreateAnnouncement = async (courseId: string, title: string, content: string) => {
        if (!user) return;
        const newAnnouncement = await createCourseAnnouncementFS(courseId, user.name, title, content);
        setCourses(prevCourses => prevCourses.map(course => 
            course.id === courseId ? { ...course, announcements: [newAnnouncement, ...course.announcements] } : course
        ));
    };

    const handleUpdateAnnouncement = async (courseId: string, announcementId: string, title: string, content: string) => {
        if (!user) return;
        const updated = await updateCourseAnnouncementFS(courseId, announcementId, title, content);
        setCourses(prev => prev.map(c => c.id === courseId ? { ...c, announcements: c.announcements.map(a => a.id === announcementId ? updated : a) } : c));
    };

    const handleMarkMaterial = async (courseId: string, chapterId: string, materialId: string) => {
        if (!user || user.role !== 'student') return;
        const saved = await markMaterialCompletedFS({ studentId: user.id, courseId, chapterId, materialId });
        setMaterialCompletions(prev => {
            const updatedForCourse = [...(prev[courseId] || []).filter(m => m.materialId !== materialId), saved];
            const next = { ...prev, [courseId]: updatedForCourse };
            recomputeProgressForCourse(courseId, updatedForCourse);
            return next;
        });
    };

    const handleUnmarkMaterial = async (courseId: string, chapterId: string, materialId: string) => {
        if (!user || user.role !== 'student') return;
        await unmarkMaterialCompletedFS(user.id, courseId, chapterId, materialId);
        setMaterialCompletions(prev => {
            const updatedForCourse = (prev[courseId] || []).filter(m => m.materialId !== materialId);
            const next = { ...prev, [courseId]: updatedForCourse };
            recomputeProgressForCourse(courseId, updatedForCourse);
            return next;
        });
    };

    const recomputeProgressForCourse = (courseId: string, completionsOverride?: any[]) => {
        if (!user || user.role !== 'student') return;
        const course = courses.find(c => c.id === courseId);
        if (!course) return;
        const courseCompletions = completionsOverride ?? materialCompletions[courseId] ?? [];
        const chapters = course.chapters || [];
        let totalItems = 0; let completedItems = 0;
        chapters.forEach(ch => {
            const mats = ch.materials || [];
            totalItems += mats.length;
            mats.forEach(m => {
                if (courseCompletions.some((mc: any) => mc.materialId === m.id)) completedItems++;
            });
            if (ch.test) {
                totalItems += 1;
                const myTestSub = submissions.find(s => s.studentId === user.id && s.testId === ch.test!.id && typeof s.score === 'number');
                if (myTestSub) completedItems++;
            }
        });
        const progressPercent = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
        setStudents(prevStudents => prevStudents.map(st => {
            if (st.id !== user.id) return st;
            const existingCourses = st.courses || [];
            const has = existingCourses.some(c => c.courseId === courseId);
            const newCourses = has
                ? existingCourses.map(c => c.courseId === courseId ? { ...c, progress: progressPercent } : c)
                : [...existingCourses, { courseId, progress: progressPercent }];
            return { ...st, courses: newCourses };
        }));
    };

    const handleUpdateCourseMaterial = async (courseId: string, chapterId: string, material: CourseMaterial) => {
        const updatedMaterial = await api.updateCourseMaterial(courseId, chapterId, material);
        setCourses(prevCourses => prevCourses.map(course => {
            if (course.id === courseId) {
                return { ...course, chapters: course.chapters.map(chapter => 
                    chapter.id === chapterId ? { ...chapter, materials: chapter.materials.map(m => m.id === updatedMaterial.id ? updatedMaterial : m) } : chapter
                )};
            }
            return course;
        }));
    };
    
    const deleteCourseMaterial = async (courseId: string, chapterId: string, materialId: string) => {
        await api.removeCourseMaterial(courseId, chapterId, materialId);
        setCourses(prevCourses => prevCourses.map(course => {
            if (course.id === courseId) {
                return { ...course, chapters: course.chapters.map(chapter => 
                    chapter.id === chapterId ? { ...chapter, materials: chapter.materials.filter(m => m.id !== materialId) } : chapter
                )};
            }
            return course;
        }));
    };

    const handleTestSubmit = async (answers: { questionId: string; answer: string }[]) => {
        if (!viewContext.testId || !user) return;
        const newSubmission = await createTestSubmissionFS({
            studentId: user.id,
            courseId: viewContext.courseId,
            chapterId: viewContext.chapterId,
            testId: viewContext.testId,
            answers,
        });
        setSubmissions(prev => [...prev, newSubmission as any]);
        // Refresh notifications for demo purposes
        if (user) setNotifications(await api.getNotificationsForUser(user.id));
        navigate('dashboard');
    };

    const handleCreateTest = async (courseId: string, chapterId: string, testDetails: Pick<Test, 'title' | 'questions' | 'isAdaptive' | 'rubric'> & { duration?: number }) => {
        const newTest = await api.createTest(courseId, chapterId, testDetails);
        setCourses(prevCourses => prevCourses.map(course => {
            if (course.id === courseId) {
                return { ...course, chapters: course.chapters.map(chapter => 
                    chapter.id === chapterId ? { ...chapter, test: newTest } : chapter
                )};
            }
            return course;
        }));
        navigate('courseDetail', { courseId });
    };

    const handleEvaluateTest = async (submissionId: string, score: number, feedback: string, rubricEvaluation?: Record<string, number>) => {
        // Persist evaluation in Firestore
        const updatedSubmission: any = await updateTestSubmissionFS(submissionId, { score, feedback, rubricEvaluation });
        setSubmissions(prev => prev.map(sub => sub.id === submissionId ? { ...sub, ...updatedSubmission } : sub));
        const studentToUpdate = students.find(s => s.id === updatedSubmission.studentId);
        if (studentToUpdate) {
            try {
                const updatedStudentFS: any = await awardPointsToStudentFS(studentToUpdate.id, score);
                setStudents(prev => prev.map(s => s.id === studentToUpdate.id ? { ...s, points: updatedStudentFS.points, badges: updatedStudentFS.badges || s.badges } : s));
            } catch (e) {
                console.warn('Failed to award points in Firestore, fallback to mock', e);
                const updatedStudent = await api.awardPointsToStudent(studentToUpdate.id, score);
                setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
            }
        }
        if (user) setNotifications(await api.getNotificationsForUser(user.id));
    };
    
    const handleCreateUser = async (userData: UserData) => {
        const newUser = await api.addUser(userData);
        if (userData.role === 'student') {
            setStudents(prev => [...prev, newUser as Student]);
            // Also enroll this newly created student (admin flow) into all Firestore courses
            try {
                const allCourses = await getAllCoursesFromFirestore();
                await Promise.all(allCourses.map(c => enrollStudentInCourse(newUser.id, c.id)));
            } catch (e) {
                console.warn('Auto-enroll admin-created student failed (may be using mock data only):', e);
            }
        } else {
            setTeachers(prev => [...prev, newUser as Teacher]);
        }
    };

    const handleUpdateUser = async (userId: string, role: UserRole, userData: UserUpdateData) => {
        const updatedUser = await api.updateUser(userId, role, userData);
        if (role === 'student') {
            setStudents(prev => prev.map(s => s.id === userId ? updatedUser as Student : s));
        } else {
            setTeachers(prev => prev.map(t => t.id === userId ? updatedUser as Teacher : t));
        }
    };
    
    const handleDeleteUser = async (userId: string, role: UserRole) => {
        await api.deleteUser(userId, role);
        if (role === 'student') {
            setStudents(prev => prev.filter(s => s.id !== userId));
        } else {
            setTeachers(prev => prev.filter(t => t.id !== userId));
        }
    };

    const handleMarkNotificationsRead = async (notificationIds: string[]) => {
        if (!user) return;
        const updatedNotifications = await api.markNotificationsAsRead(user.id, notificationIds);
        setNotifications(updatedNotifications);
    };

    const handleCreateDiscussionThread = async (courseId: string, title: string, content: string) => {
        if (!user) return;
        const newThread = await api.createDiscussionThread(courseId, title, {
            authorId: user.id,
            authorName: user.name,
            authorAvatarUrl: user.avatarUrl,
            content
        });
        setCourses(prev => prev.map(c => c.id === courseId ? { ...c, discussionThreads: [newThread, ...c.discussionThreads] } : c));
    };

    const handleAddDiscussionPost = async (threadId: string, courseId: string, content: string) => {
        if (!user) return;
        const updatedThread = await api.addDiscussionPost(threadId, {
            authorId: user.id,
            authorName: user.name,
            authorAvatarUrl: user.avatarUrl,
            content
        });
        setCourses(prev => prev.map(c => c.id === courseId ? {
            ...c,
            discussionThreads: c.discussionThreads.map(t => t.id === threadId ? updatedThread : t)
        } : c));
    };

    const handleViewFeedback = (submissionId: string) => setViewingSubmissionId(submissionId);
    const handleCloseFeedbackModal = () => setViewingSubmissionId(null);

    if (!user) {
        if (loginStep === 'initial') {
            return <LoginScreen onGoogleSignIn={handleGoogleSignIn} />;
        }
        if (loginStep === 'roleSelection') {
            // For new Google users, allow all roles
            return <RoleSelectionScreen onSelectRole={handleRoleSelection} onBack={handleBackToLogin} />;
        }
        return <LoginScreen onGoogleSignIn={handleGoogleSignIn} />; // Fallback
    }

    if (isLoading) return <LoadingSpinner />;

    const renderContent = () => {
        if (viewingSubmissionId && user?.role === 'student') {
            const submission = submissions.find(s => s.id === viewingSubmissionId);
            const course = submission ? courses.find(c => c.id === submission.courseId) : undefined;
            const chapter = course?.chapters.find(ch => ch.id === submission!.chapterId);
            
            if (submission && course && chapter && chapter.test) {
                return (
                    <TestFeedbackModal isOpen={true} onClose={handleCloseFeedbackModal} course={course} test={chapter.test} submission={submission} />
                );
            }
        }
        
        switch (view) {
            case 'careerCenter':
                if (user.role === 'student') {
                    return <CareerCenterPage />;
                }
                return null;
            case 'lessonPlanner':
                if (user.role === 'teacher') {
                    return <LessonPlannerPage />;
                }
                return null;
            case 'projectWorkspace': {
                 const course = courses.find(c => c.id === viewContext.courseId);
                 const project = course?.projects.find(p => p.id === viewContext.projectId);
                 if (course && project && user) {
                     return <ProjectWorkspacePage 
                        course={course}
                        project={project}
                        user={user}
                        onBack={() => navigate('courseDetail', { courseId: course.id })}
                     />
                 }
                 return null;
            }
            case 'discussionThread': {
                const course = courses.find(c => c.id === viewContext.courseId);
                const thread = course?.discussionThreads.find(t => t.id === viewContext.threadId);
                if (course && thread && user) {
                    return <DiscussionThreadPage 
                        course={course} 
                        thread={thread} 
                        currentUser={user}
                        onBack={() => navigate('courseDetail', { courseId: course.id })} 
                        onAddPost={handleAddDiscussionPost}
                    />;
                }
                return null;
            }
             case 'calendar':
                return <CalendarPage courses={courses} />;
            case 'teacherCommunity':
                 if (user.role === 'teacher') {
                    return <TeacherCommunity currentUser={user} />;
                }
                return null;
            case 'teacherAnalytics':
                 if (user.role === 'teacher') {
                    const teacherCourses = courses.filter(c => c.teacher === user.name);
                    return <TeacherAnalyticsPage courses={teacherCourses} submissions={submissions} students={students} />;
                }
                return null;
            case 'testTaking': {
                const course = courses.find(c => c.id === viewContext.courseId);
                const chapter = course?.chapters.find(ch => ch.id === viewContext.chapterId);
                if (course && chapter && chapter.test) {
                    return <TestTakingPage course={course} chapter={chapter} test={chapter.test} onBack={() => navigate('courseDetail', { courseId: course.id })} onSubmit={handleTestSubmit} />;
                }
                return null;
            }
            case 'createTest': {
                if (user.role === 'teacher') {
                    return <CreateTestPage courses={courses.filter(c => c.teacher === user.name)} onBack={() => navigate('dashboard')} onCreateTest={handleCreateTest} />;
                }
                return null;
            }
            case 'courseDetail': {
                if (selectedCourse && user) {
                    return <CourseDetail course={selectedCourse} user={user} students={students} submissions={submissions} onBack={() => navigate('dashboard')} onAddMaterial={addCourseMaterial} onUpdateMaterial={handleUpdateCourseMaterial} onDeleteMaterial={deleteCourseMaterial} onAttemptTest={(courseId, chapterId, testId) => navigate('testTaking', { courseId, chapterId, testId })} onViewFeedback={handleViewFeedback} onAddAnnouncement={handleCreateAnnouncement} onUpdateAnnouncement={handleUpdateAnnouncement} onNavigate={navigate} onCreateDiscussion={handleCreateDiscussionThread} materialCompletions={materialCompletions[selectedCourse.id] || []} onMarkMaterial={handleMarkMaterial} onUnmarkMaterial={handleUnmarkMaterial} />;
                }
                return null;
            }
            case 'manageUsers': {
                if (user.role === 'admin') {
                    return <ManageUsersPage students={students} teachers={teachers} courses={courses} onBack={() => navigate('dashboard')} onAddUser={handleCreateUser} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} />;
                }
                return null;
            }
            case 'dashboard':
            default: {
                switch (user.role) {
                    case 'admin':
                        return <AdminDashboard courses={courses} students={students} teachers={teachers} addCourse={addCourse} />;
                    case 'principal':
                        return <PrincipalDashboard courses={courses} students={students} teachers={teachers} />;
                    case 'teacher':
                        const teacherCourses = courses.filter(c => c.teacher === user.name);
                        return <TeacherDashboard courses={teacherCourses} students={students} submissions={submissions} addCourse={addCourse} onSelectCourse={(courseId) => navigate('courseDetail', { courseId })} onStartCreateTest={() => navigate('createTest')} onEvaluateTest={handleEvaluateTest} />;
                    case 'student':
                        const studentUser = students.find(s => s.id === user.id);
                        if (!studentUser) return <div>Loading student data...</div>;
                        return <StudentDashboard user={studentUser} courses={courses} submissions={submissions} onSelectCourse={(courseId) => navigate('courseDetail', { courseId })} onAttemptTest={(courseId, chapterId, testId) => navigate('testTaking', { courseId, chapterId, testId })} onViewFeedback={handleViewFeedback} setCourses={setCourses} materialCompletions={materialCompletions} />;
                    case 'parent':
                        const parentUser = user as Parent;
                        const child = students.find(s => s.id === parentUser.childId);
                        if (!child) return <div>Could not find child data.</div>;
                        const childSubmissions = submissions.filter(s => s.studentId === child.id);
                        return <ParentDashboard parent={parentUser} child={child} courses={courses} submissions={childSubmissions} />;
                    default:
                        return <div>Invalid Role</div>;
                }
            }
        }
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            <Layout 
                view={view} 
                navigate={navigate}
                notifications={notifications}
                onMarkNotificationsRead={handleMarkNotificationsRead}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                courseContext={selectedCourse}
            >
                {renderContent()}
            </Layout>
            {aiNudge && (
                <Toast
                    message={aiNudge.message}
                    cta={aiNudge.cta}
                    onDismiss={() => setAiNudge(null)}
                    icon={<Lightbulb className="text-yellow-500" />}
                />
            )}
        </AuthContext.Provider>
    );
};

export default App;