import React, { useMemo, useState, useEffect } from 'react';
import { Course, TestSubmission, Student, FocusPlan, Question, Badge, Quest, SkillNode, Chapter } from '../../types';
import Card from '../common/Card';
import ProgressBar from '../common/ProgressBar';
import { Book, CheckCircle, TrendingUp, Search, Award, Star, Lightbulb, BrainCircuit, Flame, Trophy, Map, Briefcase, Bot } from 'lucide-react';
import Button from '../common/Button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as gemini from '../../services/geminiService';
import { MaterialIcon } from '../course/CourseDetail';
import StudyPlannerModal from '../student/StudyPlannerModal';
import { mockQuests, mockBadges } from '../../data/mockData';
import SkillTree from '../student/SkillTree';


const FocusPlanDisplay: React.FC<{ plan: FocusPlan }> = ({ plan }) => (
    <Card className="p-6 bg-primary-50 border-primary-200 border">
        <h3 className="text-xl font-bold text-gray-800 flex items-center mb-4"><BrainCircuit size={22} className="mr-3 text-primary-600"/>Your AI-Generated Focus Plan</h3>
        <p className="text-gray-700 mb-6">{plan.summary}</p>
        <div className="space-y-4">
            {plan.focusAreas.map((area, index) => (
                <div key={index} className="p-4 bg-white rounded-lg border">
                    <h4 className="font-semibold text-lg text-gray-800 flex items-center"><Lightbulb size={18} className="mr-2 text-yellow-500"/>Focus Area: {area.concept}</h4>
                    <p className="text-gray-600 mt-2">{area.suggestion}</p>
                    <div className="mt-3">
                        <p className="text-sm font-semibold text-gray-700">Recommended Materials:</p>
                        <ul className="mt-1 space-y-1 list-inside">
                           {area.relevantMaterials.map((mat, i) => (
                             <li key={i} className="text-sm text-gray-600 flex items-center space-x-2">
                               <MaterialIcon type={mat.type} />
                               <span>{mat.title}</span>
                             </li>
                           ))}
                        </ul>
                    </div>
                </div>
            ))}
        </div>
    </Card>
);

const BadgeDisplay: React.FC<{ badge: Badge }> = ({ badge }) => (
    <div className="flex flex-col items-center text-center p-3 border rounded-lg bg-white">
        <Trophy size={24} className="text-yellow-500" />
        <p className="font-semibold text-sm mt-1">{badge.name}</p>
        <p className="text-xs text-gray-500">{badge.description}</p>
    </div>
);


const MyProgress: React.FC<{ user: Student }> = ({ user }) => {
    return (
        <Card>
            <div className="p-6">
                 <h3 className="text-xl font-semibold text-gray-800">My Progress</h3>
                 <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <Star className="mx-auto text-blue-500" size={28}/>
                        <p className="text-2xl font-bold text-gray-800 mt-1">{user.points}</p>
                        <p className="text-sm text-gray-500">Total Points</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                        <Flame className="mx-auto text-orange-500" size={28}/>
                        <p className="text-2xl font-bold text-gray-800 mt-1">{user.learningStreak}</p>
                        <p className="text-sm text-gray-500">Day Streak</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                        <Award className="mx-auto text-yellow-500" size={28}/>
                        <p className="text-2xl font-bold text-gray-800 mt-1">{user.badges.length}</p>
                        <p className="text-sm text-gray-500">Badges Earned</p>
                    </div>
                 </div>
                 {user.badges.length > 0 && (
                    <div className="mt-4">
                        <h4 className="font-semibold text-gray-700 mb-2">My Badges</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {user.badges.map(badge => <BadgeDisplay key={badge.id} badge={badge} />)}
                        </div>
                    </div>
                 )}
            </div>
        </Card>
    );
};

const DailyQuests: React.FC<{ quests: Quest[] }> = ({ quests }) => (
    <Card className="p-6">
        <h3 className="text-xl font-semibold text-gray-800">Daily Quests</h3>
        <div className="mt-4 space-y-3">
            {quests.map(quest => (
                <div key={quest.id} className={`p-3 rounded-lg flex items-center justify-between ${quest.isCompleted ? 'bg-green-50' : 'bg-gray-50'}`}>
                    <div>
                        <p className={`font-semibold ${quest.isCompleted ? 'text-green-800' : 'text-gray-800'}`}>{quest.title}</p>
                        <p className="text-sm text-gray-500">{quest.description}</p>
                    </div>
                    <div className="text-right">
                        {quest.isCompleted ? (
                            <CheckCircle className="text-green-600" />
                        ) : (
                            <p className="font-bold text-yellow-600">+{quest.points} PTS</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    </Card>
);

interface StudentDashboardProps {
  user: Student;
  courses: Course[];
  submissions: TestSubmission[];
  onSelectCourse: (courseId: string) => void;
  onAttemptTest: (courseId: string, chapterId: string, testId: string) => void;
  onViewFeedback: (submissionId: string) => void;
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
    materialCompletions?: Record<string, any[]>; // keyed by courseId
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, courses, submissions, onSelectCourse, onAttemptTest, onViewFeedback, setCourses, materialCompletions = {} }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [focusPlan, setFocusPlan] = useState<FocusPlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [isGeneratingNextStep, setIsGeneratingNextStep] = useState(false);

  const mySubmissions = submissions.filter(s => s.studentId === user.id);

  const [skillTreeData, setSkillTreeData] = useState<SkillNode[]>([]);

  useEffect(() => {
    const mainCourse = courses.find(c => c.id === 'c1'); // Hardcode for demo
    if (!mainCourse) return;

    setSkillTreeData(mainCourse.chapters.map((chapter, index) => {
        const submission = mySubmissions.find(s => s.chapterId === chapter.id);
        const isCompleted = chapter.completed || (submission && (submission.score ?? 0) >= 6);
        return {
            id: chapter.id,
            title: chapter.title,
            isUnlocked: index === 0 || mainCourse.chapters.slice(0, index).every(c => c.completed),
            isCompleted,
            dependencies: index > 0 ? [mainCourse.chapters[index - 1].id] : [],
            badge: isCompleted && chapter.id === 'ch1' ? mockBadges.find(b => b.id === 'b3') : undefined,
            isRemedial: chapter.isRemedial
        };
    }));
  }, [courses, mySubmissions]);

  
  const allTests = courses.flatMap(course => 
    course.chapters
      .filter(chapter => chapter.test)
      .map(chapter => ({
        courseId: course.id,
        courseTitle: course.title,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        test: chapter.test!
      }))
  );

  const upcomingTests = allTests.filter(t => !mySubmissions.some(s => s.testId === t.test.id));
  const gradedTests = mySubmissions.filter(s => typeof s.score === 'number').sort((a,b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());

  const filteredCourses = useMemo(() =>
    courses.filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.subject.toLowerCase().includes(searchTerm.toLowerCase())
    ), [courses, searchTerm]);

  const performanceData = useMemo(() => {
    return gradedTests.map(submission => {
        const course = courses.find(c => c.id === submission.courseId);
        const test = course?.chapters.find(ch => ch.id === submission.chapterId)?.test;
        return {
            name: test?.title.substring(0, 15) + '...' || 'Unknown Test',
            score: submission.score,
        };
    });
  }, [gradedTests, courses]);

  const handleGenerateFocusPlan = async () => {
    setIsGeneratingPlan(true);
    setPlanError(null);
    setFocusPlan(null);

    const courseWithSubmissions = courses.find(c => gradedTests.some(s => s.courseId === c.id));
    if (!courseWithSubmissions) {
        setPlanError("You need at least one graded test in a course to generate a plan.");
        setIsGeneratingPlan(false);
        return;
    }

    const submissionsForCourse = gradedTests
      .filter(s => s.courseId === courseWithSubmissions.id)
      .map(s => {
          const test = courseWithSubmissions.chapters.find(c => c.id === s.chapterId)?.test;
          return { ...s, test: test ? { questions: test.questions } : { questions: [] } };
      });
      
    try {
        const plan = await gemini.generateFocusPlan(submissionsForCourse, courseWithSubmissions);
        setFocusPlan(plan);
    } catch (error) {
        console.error(error);
        setPlanError("Sorry, there was an error generating your focus plan. Please try again later.");
    } finally {
        setIsGeneratingPlan(false);
    }
  };

  const handleGenerateNextStep = async () => {
    setIsGeneratingNextStep(true);
    const lastCompletedNode = [...skillTreeData].reverse().find(n => n.isCompleted);
    if (!lastCompletedNode) {
        setIsGeneratingNextStep(false);
        return;
    }
    const lastSubmission = mySubmissions.find(s => s.chapterId === lastCompletedNode.id);

    const result = await gemini.getAdaptivePathwayStep(lastSubmission);
    const mainCourseId = 'c1'; // Hardcoded for demo

    setCourses(prevCourses => prevCourses.map(c => {
        if (c.id !== mainCourseId) return c;
        
        const newChapters = [...c.chapters];
        const lastCompletedIndex = newChapters.findIndex(ch => ch.id === lastCompletedNode.id);
        const nextChapterIndex = lastCompletedIndex + 1;

        if (result.action === 'skip' && nextChapterIndex < newChapters.length) {
            newChapters[nextChapterIndex].completed = true; // Mark as "skipped"
        } else if (result.action === 'remedial' && nextChapterIndex < newChapters.length) {
            const remedialChapter: Chapter = {
                id: `ch_remedial_${Date.now()}`,
                title: `Remedial: ${newChapters[lastCompletedIndex].title}`,
                materials: [],
                completed: false,
                isRemedial: true,
            };
            newChapters.splice(nextChapterIndex, 0, remedialChapter);
        }
        
        return { ...c, chapters: newChapters };
    }));

    setIsGeneratingNextStep(false);
  };

  const lastCompletedNodeIndex = useMemo(() => {
    // Polyfill for findLastIndex as it might not be available in all JS environments.
    const reversedIndex = [...skillTreeData].reverse().findIndex(n => n.isCompleted);
    if (reversedIndex === -1) {
        return -1;
    }
    return skillTreeData.length - 1 - reversedIndex;
  }, [skillTreeData]);

  return (
    <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-800">Student Dashboard</h1>
            <div className='flex items-center gap-2'>
                {user.learningStreak > 0 &&
                    <div className="flex items-center space-x-2 p-3 bg-white rounded-lg shadow-md border border-orange-200">
                        <Flame className="text-orange-500" size={24}/>
                        <p className="font-semibold text-gray-700">{user.learningStreak}-Day Learning Streak!</p>
                    </div>
                }
                <Button onClick={() => setIsPlannerOpen(true)}><BrainCircuit size={18} className="mr-2"/> Study Planner</Button>
            </div>
        </div>

        <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                <button onClick={() => setActiveTab('overview')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                    Overview
                </button>
                 <button onClick={() => setActiveTab('path')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'path' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                   <Map size={16} className="mr-2"/> Learning Path
                </button>
                <button onClick={() => setActiveTab('progress')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'progress' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                    My Progress
                </button>
                <button onClick={() => setActiveTab('career')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'career' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                    <Briefcase size={16} className="mr-2" /> Career & Credentials
                </button>
            </nav>
        </div>
        
        {activeTab === 'progress' && <MyProgress user={user} />}
        {activeTab === 'path' && (
            <Card className="p-6">
                 <SkillTree nodes={skillTreeData} />
                 {lastCompletedNodeIndex !== -1 && lastCompletedNodeIndex < skillTreeData.length - 1 && (
                     <div className="mt-6 text-center">
                        <Button onClick={handleGenerateNextStep} loading={isGeneratingNextStep}>
                            <Bot size={18} className="mr-2"/> {isGeneratingNextStep ? 'Adapting Path...' : 'Generate Next Step'}
                        </Button>
                        <p className="text-xs text-gray-500 mt-2">Let AI adapt your learning path based on your last performance.</p>
                     </div>
                 )}
            </Card>
        )}
        {activeTab === 'career' && <p>Go to Career Center from Sidebar.</p>}
        
        {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <section>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <h2 className="text-2xl font-semibold text-gray-700">My Courses</h2>
                    <div className="relative w-full sm:max-w-xs">
                            <input
                                type="text"
                                placeholder="Search courses..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredCourses.map(course => {
                        // Defensive: Only use user.courses if it exists and is an array
                        // Recompute progress using completions + graded tests
                        const completions = materialCompletions[course.id] || [];
                        let totalItems = 0; let completedItems = 0;
                        course.chapters.forEach(ch => {
                            const mats = ch.materials || [];
                            totalItems += mats.length;
                            mats.forEach(m => { if (completions.some((mc:any) => mc.materialId === m.id)) completedItems++; });
                            if (ch.test) {
                                totalItems += 1;
                                const myTestSub = submissions.find(s => s.studentId === user.id && s.testId === ch.test!.id && typeof s.score === 'number');
                                if (myTestSub) completedItems++;
                            }
                        });
                        const progress = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
                        return (
                        <Card key={course.id} className="flex flex-col" onClick={() => onSelectCourse(course.id)}>
                            <div className="p-6 flex-grow">
                            <p className="text-sm font-semibold text-primary-600">CLASS {course.classLevel} - {course.subject.toUpperCase()}</p>
                            <h3 className="text-xl font-bold text-gray-800 mt-1">{course.title}</h3>
                            <p className="text-gray-500 text-sm mt-1">Taught by {course.teacher}</p>

                            <div className="mt-4 space-y-2">
                                <div className="flex items-center text-sm text-gray-600">
                                <Book size={16} className="mr-2 text-primary-500" />
                                <span>{course.chapters.length} Chapters</span>
                                </div>
                            </div>
                            </div>
                            <div className="bg-gray-50 p-4">
                            <p className="text-sm font-medium text-gray-600 mb-2">Progress: {progress}%</p>
                            <ProgressBar progress={progress} />
                            </div>
                        </Card>
                        );
                    })}
                    </div>
                </section>
                
                <section>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Personalized Focus Plan</h2>
                    <Card className="p-6 text-center">
                        <BrainCircuit size={48} className="mx-auto text-primary-500" />
                        <h3 className="text-xl font-semibold text-gray-800 mt-4">Ready to improve?</h3>
                        <p className="text-gray-600 mt-2 max-w-2xl mx-auto">Let our AI analyze your recent test performance and create a personalized study plan to help you focus on areas that need the most attention.</p>
                        <Button onClick={handleGenerateFocusPlan} loading={isGeneratingPlan} disabled={isGeneratingPlan || gradedTests.length === 0} className="mt-6">
                            {isGeneratingPlan ? 'Analyzing Performance...' : 'Generate My Focus Plan'}
                        </Button>
                        {gradedTests.length === 0 && <p className="text-xs text-gray-500 mt-2">Complete at least one test to enable this feature.</p>}
                        {planError && <p className="text-red-600 mt-4">{planError}</p>}
                    </Card>
                    {focusPlan && <div className="mt-6"><FocusPlanDisplay plan={focusPlan} /></div>}
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">My Performance Analytics</h2>
                    <Card className="p-6">
                        {performanceData.length > 1 ? (
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <LineChart
                                        data={performanceData}
                                        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" angle={-10} textAnchor="end" height={50} interval={0} tick={{ fontSize: 12 }} />
                                        <YAxis domain={[0, 10]} />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} name="Test Score" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <TrendingUp size={48} className="mx-auto text-gray-400" />
                                <p className="mt-4 text-gray-600">Complete more tests to see your performance analytics.</p>
                            </div>
                        )}
                    </Card>
                </section>
            </div>
            <div className="lg:col-span-1 space-y-8">
                <DailyQuests quests={mockQuests} />
                <section>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Upcoming Tests</h2>
                <Card>
                    <ul className="divide-y divide-gray-200">
                    {upcomingTests.length > 0 ? upcomingTests.map(testInfo => (
                        <li key={testInfo.test.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 hover:bg-gray-50">
                            <div>
                                <p className="font-semibold text-gray-800">{testInfo.test.title}</p>
                                <p className="text-sm text-gray-500">{testInfo.courseTitle} - {testInfo.chapterTitle}</p>
                            </div>
                            <Button size="sm" onClick={() => onAttemptTest(testInfo.courseId, testInfo.chapterId, testInfo.test.id)} className="w-full sm:w-auto">
                                Attempt Now
                            </Button>
                        </li>
                    )) : (
                        <p className="p-4 text-gray-500 text-center">No upcoming tests. Great job!</p>
                    )}
                    </ul>
                </Card>
                </section>

                <section>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Graded Assessments</h2>
                <Card>
                    <ul className="divide-y divide-gray-200">
                    {gradedTests.length > 0 ? gradedTests.map(submission => {
                        const course = courses.find(c => c.id === submission.courseId);
                        const test = course?.chapters.find(ch => ch.id === submission.chapterId)?.test;
                        return (
                            <li key={submission.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 hover:bg-gray-50">
                                <div>
                                    <p className="font-semibold text-gray-800">{test?.title}</p>
                                    <p className="text-sm text-gray-500">{course?.title}</p>
                                </div>
                                <div className="flex items-center space-x-4 self-stretch sm:self-center">
                                <div className="text-right">
                                    <p className="font-bold text-lg text-green-600">{submission.score}/10</p>
                                    <p className="text-xs text-gray-500">Score</p>
                                </div>
                                <Button size="sm" variant="secondary" onClick={() => onViewFeedback(submission.id)}>
                                    View Feedback
                                </Button>
                                </div>
                            </li>
                        )
                    }) : (
                        <p className="p-4 text-gray-500 text-center">No graded tests yet.</p>
                    )}
                    </ul>
                </Card>
                </section>
            </div>
        </div>
        )}

        <StudyPlannerModal
            isOpen={isPlannerOpen}
            onClose={() => setIsPlannerOpen(false)}
            gradedTests={gradedTests}
            courses={courses}
        />
    </div>
  );
};

export default StudentDashboard;