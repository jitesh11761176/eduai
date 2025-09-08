// Add a material to a chapter in a course document in Firestore
export const addMaterialToChapter = async (courseId: string, chapterId: string, material: any) => {
  const sanitizeForFirestore = (val: any): any => {
    if (Array.isArray(val)) return val.map(sanitizeForFirestore);
    if (val && typeof val === 'object') {
      const obj: any = {};
      Object.keys(val).forEach(k => {
        const v = (val as any)[k];
        if (v === undefined) return; // skip undefined
        obj[k] = sanitizeForFirestore(v);
      });
      return obj;
    }
    return val;
  };
  const courseRef = doc(db, "courses", courseId);
  const courseSnap = await getDoc(courseRef);
  if (!courseSnap.exists()) throw new Error("Course not found");
  const courseData = courseSnap.data();
  const chapters = Array.isArray(courseData.chapters) ? [...courseData.chapters] : [];
  const chapterIndex = chapters.findIndex((ch: any) => ch.id === chapterId);
  if (chapterIndex === -1) throw new Error("Chapter not found");
  const chapter = { ...chapters[chapterIndex] };
  const newMaterialRaw = { id: `mat_${Date.now()}`, ...material };
  const newMaterial = sanitizeForFirestore(newMaterialRaw);
  chapter.materials = Array.isArray(chapter.materials) ? [...chapter.materials, newMaterial] : [newMaterial];
  chapters[chapterIndex] = chapter;
  await updateDoc(courseRef, { chapters: sanitizeForFirestore(chapters) });
  return newMaterial;
};

// Add or replace a test for a chapter in a course document in Firestore
export const addTestToChapter = async (courseId: string, chapterId: string, testDetails: any) => {
  const sanitizeForFirestore = (val: any): any => {
    if (Array.isArray(val)) return val.map(sanitizeForFirestore);
    if (val && typeof val === 'object') {
      const obj: any = {};
      Object.keys(val).forEach(k => {
        const v = (val as any)[k];
        if (v === undefined) return;
        obj[k] = sanitizeForFirestore(v);
      });
      return obj;
    }
    return val;
  };
  const courseRef = doc(db, "courses", courseId);
  const courseSnap = await getDoc(courseRef);
  if (!courseSnap.exists()) throw new Error("Course not found");
  const courseData = courseSnap.data();
  const chapters = Array.isArray(courseData.chapters) ? [...courseData.chapters] : [];
  const chapterIndex = chapters.findIndex((ch: any) => ch.id === chapterId);
  if (chapterIndex === -1) throw new Error("Chapter not found");
  const chapter = { ...chapters[chapterIndex] };
  if (chapter.test) throw new Error("Chapter already has a test");
  // Build test object excluding undefined fields inside nested structures
  const cleanedQuestions = Array.isArray(testDetails.questions) ? testDetails.questions.map((q: any) => {
    const { id, text, type, options, correctAnswer, difficulty } = q;
    const base: any = { id, text, type };
    if (options && Array.isArray(options)) base.options = options;
    if (correctAnswer !== undefined) base.correctAnswer = correctAnswer;
    if (difficulty !== undefined) base.difficulty = difficulty;
    return base;
  }) : [];
  const newTestRaw: any = {
    id: `t_${Date.now()}`,
    type: 'online',
    title: testDetails.title,
    questions: cleanedQuestions,
    isAdaptive: testDetails.isAdaptive ?? false,
  };
  if (testDetails.duration !== undefined) newTestRaw.duration = testDetails.duration;
  if (testDetails.rubric !== undefined) newTestRaw.rubric = testDetails.rubric;
  const newTest = sanitizeForFirestore(newTestRaw);
  chapter.test = newTest;
  chapters[chapterIndex] = chapter;
  await updateDoc(courseRef, { chapters: sanitizeForFirestore(chapters) });
  return newTest;
};

// --- Announcements ---
export const createCourseAnnouncementFS = async (courseId: string, authorName: string, title: string, content: string) => {
  const courseRef = doc(db, 'courses', courseId);
  const snap = await getDoc(courseRef);
  if (!snap.exists()) throw new Error('Course not found');
  const data: any = snap.data();
  const announcements: any[] = Array.isArray(data.announcements) ? [...data.announcements] : [];
  const newAnnouncement = {
    id: `ann_${Date.now()}`,
    title,
    content,
    author: authorName,
    createdAt: new Date().toISOString()
  };
  announcements.unshift(newAnnouncement);
  await updateDoc(courseRef, { announcements });
  return newAnnouncement;
};

export const updateCourseAnnouncementFS = async (courseId: string, announcementId: string, title: string, content: string) => {
  const courseRef = doc(db, 'courses', courseId);
  const snap = await getDoc(courseRef);
  if (!snap.exists()) throw new Error('Course not found');
  const data: any = snap.data();
  const announcements: any[] = Array.isArray(data.announcements) ? [...data.announcements] : [];
  const idx = announcements.findIndex(a => a.id === announcementId);
  if (idx === -1) throw new Error('Announcement not found');
  const existing = announcements[idx];
  announcements[idx] = { ...existing, title, content }; // keep createdAt
  await updateDoc(courseRef, { announcements });
  return announcements[idx];
};
// Get all students from Firestore
export const getAllStudentsFromFirestore = async () => {
  const q = query(collection(db, "users"), where("role", "==", "student"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
// Firebase config and initialization
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, User as FirebaseUser, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { generateInitialAvatar } from '../utils/avatarUtils';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, updateDoc, query, where, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();


export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

// Email/password registration
export const registerWithEmail = async (name: string, email: string, password: string, role: string) => {
  const creds = await createUserWithEmailAndPassword(auth, email, password);
  if (auth.currentUser) {
    try { await updateProfile(auth.currentUser, { displayName: name }); } catch {}
  }
  // Save immediately to Firestore with provided role
  await saveUserToFirestore({
    id: creds.user.uid,
    name,
    email,
    role,
    avatarUrl: generateInitialAvatar(name)
  });
  return creds.user;
};

// Email/password sign in
export const signInWithEmail = async (email: string, password: string) => {
  const creds = await signInWithEmailAndPassword(auth, email, password);
  return creds.user;
};

// Firestore helpers
export const saveUserToFirestore = async (user: { id: string; name: string; email: string; role: string; avatarUrl: string }) => {
  await setDoc(doc(db, "users", user.id), user, { merge: true });
};

export const getUserFromFirestore = async (userId: string) => {
  const userDoc = await getDoc(doc(db, "users", userId));
  return userDoc.exists() ? userDoc.data() : null;
};

export const createCourseInFirestore = async (course: any) => {
  const docRef = await addDoc(collection(db, "courses"), course);
  // Patch: add the generated ID as the 'id' field in the course document
  await setDoc(docRef, { ...course, id: docRef.id }, { merge: true });
  return docRef.id;
};

// Fetch all courses (used to auto-enroll newly created students in existing courses)
export const getAllCoursesFromFirestore = async () => {
  const snapshot = await getDocs(collection(db, "courses"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getCoursesForTeacher = async (teacherId: string) => {
  const q = query(collection(db, "courses"), where("teacherId", "==", teacherId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const enrollStudentInCourse = async (studentId: string, courseId: string) => {
  await setDoc(doc(db, "enrollments", `${studentId}_${courseId}`), { studentId, courseId });
};

export const getCoursesForStudent = async (studentId: string) => {
  const enrollmentsQ = query(collection(db, "enrollments"), where("studentId", "==", studentId));
  const enrollmentsSnap = await getDocs(enrollmentsQ);
  const courseIds = enrollmentsSnap.docs.map(doc => doc.data().courseId);
  if (courseIds.length === 0) return [];
  const coursesQ = query(collection(db, "courses"), where("id", "in", courseIds));
  const coursesSnap = await getDocs(coursesQ);
  return coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Create a test submission in Firestore
export const createTestSubmissionFS = async (submission: any) => {
  const subRef = doc(collection(db, 'testSubmissions'));
  const toSave = { id: subRef.id, submittedAt: new Date().toISOString(), ...submission };
  await setDoc(subRef, toSave);
  return toSave;
};

// Get all test submissions for a teacher's courses
export const getTestSubmissionsForTeacher = async (teacherId: string) => {
  // Fetch teacher courses first
  const courses = await getCoursesForTeacher(teacherId);
  const courseIds = courses.map(c => c.id);
  if (courseIds.length === 0) return [];
  const subsSnap = await getDocs(collection(db, 'testSubmissions'));
  return subsSnap.docs
    .map(d => ({ ...d.data(), submittedAt: new Date(d.data().submittedAt) }))
    .filter(s => courseIds.includes((s as any).courseId));
};

export const getTestSubmissionsForStudent = async (studentId: string) => {
  const subsSnap = await getDocs(collection(db, 'testSubmissions'));
  return subsSnap.docs
    .map(d => ({ ...d.data(), submittedAt: new Date(d.data().submittedAt) }))
    .filter(s => (s as any).studentId === studentId);
};

export const updateTestSubmissionFS = async (submissionId: string, updates: { score?: number; feedback?: string; rubricEvaluation?: Record<string, number> }) => {
  const subRef = doc(db, 'testSubmissions', submissionId);
  const snap = await getDoc(subRef);
  if (!snap.exists()) throw new Error('Submission not found');
  const payload: any = {};
  if (typeof updates.score === 'number') payload.score = updates.score;
  if (typeof updates.feedback === 'string') payload.feedback = updates.feedback;
  if (updates.rubricEvaluation) payload.rubricEvaluation = updates.rubricEvaluation;
  await updateDoc(subRef, payload);
  const updated = await getDoc(subRef);
  return updated.data();
};

// Award points & optionally add badges directly in Firestore (ensures persistence instead of mock)
export const awardPointsToStudentFS = async (studentId: string, points: number) => {
  const userRef = doc(db, 'users', studentId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) throw new Error('Student user not found');
  const data: any = snap.data();
  const currentPoints = data.points || 0;
  const updatedPoints = currentPoints + points;
  let badges: any[] = Array.isArray(data.badges) ? [...data.badges] : [];
  // Simple example badge logic
  if (points >= 9 && !badges.some(b => b.id === 'b1')) {
    badges.push({ id: 'b1', name: 'Test Ace', description: 'Scored >=9 on a test', icon: 'Star' });
  }
  await updateDoc(userRef, { points: updatedPoints, badges });
  const updatedSnap = await getDoc(userRef);
  return updatedSnap.data();
};

// --- Material Completion Tracking ---
export const markMaterialCompletedFS = async (data: { studentId: string; courseId: string; chapterId: string; materialId: string; }) => {
  const id = `${data.studentId}_${data.courseId}_${data.chapterId}_${data.materialId}`;
  const ref = doc(db, 'materialCompletions', id);
  const payload = { id, ...data, completedAt: new Date().toISOString() };
  await setDoc(ref, payload);
  return payload;
};

export const getMaterialCompletionsForStudent = async (studentId: string, courseId: string) => {
  const snap = await getDocs(collection(db, 'materialCompletions'));
  return snap.docs
    .map(d => d.data())
    .filter((m: any) => m.studentId === studentId && m.courseId === courseId);
};

export const unmarkMaterialCompletedFS = async (studentId: string, courseId: string, chapterId: string, materialId: string) => {
  const id = `${studentId}_${courseId}_${chapterId}_${materialId}`;
  const ref = doc(db, 'materialCompletions', id);
  await deleteDoc(ref);
};

export { auth, db };
export type { FirebaseUser };
