// Add a material to a chapter in a course document in Firestore
export const addMaterialToChapter = async (courseId: string, chapterId: string, material: any) => {
  const courseRef = doc(db, "courses", courseId);
  const courseSnap = await getDoc(courseRef);
  if (!courseSnap.exists()) throw new Error("Course not found");
  const courseData = courseSnap.data();
  const chapters = Array.isArray(courseData.chapters) ? [...courseData.chapters] : [];
  const chapterIndex = chapters.findIndex((ch: any) => ch.id === chapterId);
  if (chapterIndex === -1) throw new Error("Chapter not found");
  const chapter = { ...chapters[chapterIndex] };
  const newMaterial = { id: `mat_${Date.now()}`, ...material };
  chapter.materials = Array.isArray(chapter.materials) ? [...chapter.materials, newMaterial] : [newMaterial];
  chapters[chapterIndex] = chapter;
  await updateDoc(courseRef, { chapters });
  return newMaterial;
};
// Get all students from Firestore
export const getAllStudentsFromFirestore = async () => {
  const q = query(collection(db, "users"), where("role", "==", "student"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
// Firebase config and initialization
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, User as FirebaseUser } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, updateDoc, query, where } from "firebase/firestore";

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

export { auth, db };
export type { FirebaseUser };
