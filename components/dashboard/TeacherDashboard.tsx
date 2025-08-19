import React, { useState, useMemo } from 'react';
import { Course, Student, TestSubmission, Test } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import { PlusCircle, FilePlus, BarChart, Percent, Search } from 'lucide-react';
import TestEvaluationModal from '../test/TestEvaluationModal';
import CreateCourseModal from '../course/CreateCourseModal';
import AtRiskStudents from '../teacher/AtRiskStudents';

interface TeacherDashboardProps {
  courses: Course[];
  students: Student[];
  submissions: TestSubmission[];
  addCourse: (course: Omit<Course, 'id' | 'teacher' | 'chapters' | 'announcements'>) => void;
  onSelectCourse: (courseId: string) => void;
  onStartCreateTest: () => void;
  onEvaluateTest: (submissionId: string, score: number, feedback: string) => void;
}

interface EvaluationContext {
  submission: TestSubmission;
  course: Course;
  student: Student;
  test: Test;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ courses, students, submissions, addCourse, onSelectCourse, onStartCreateTest, onEvaluateTest }) => {
  const [selectedEvaluation, setSelectedEvaluation] = useState<EvaluationContext | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const pendingSubmissions = useMemo(() => {
    return submissions
      .filter(s => typeof s.score === 'undefined')
      .map(submission => {
        const student = students.find(st => st.id === submission.studentId);
        const course = courses.find(c => c.id === submission.courseId);
        const test = course?.chapters.find(ch => ch.id === submission.chapterId)?.test;
        if (student && course && test) {
          return { submission, student, course, test };
        }
        return null;
      })
      .filter(Boolean) as EvaluationContext[];
  }, [submissions, students, courses]);

  const filteredCourses = useMemo(() =>
    courses.filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.subject.toLowerCase().includes(searchTerm.toLowerCase())
    ), [courses, searchTerm]);

  const averageScore = useMemo(() => {
    const gradedSubmissions = submissions.filter(s => typeof s.score === 'number');
    if (gradedSubmissions.length === 0) return 0;
    const totalScore = gradedSubmissions.reduce((acc, s) => acc + s.score!, 0);
    return (totalScore / gradedSubmissions.length).toFixed(1);
  }, [submissions]);

  const handleEvaluateClick = (context: EvaluationContext) => {
    setSelectedEvaluation(context);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button onClick={() => setIsCreateModalOpen(true)} variant="secondary">
                <PlusCircle size={20} className="inline-block mr-2" />
                Create Course
            </Button>
            <Button onClick={onStartCreateTest}>
                <FilePlus size={20} className="inline-block mr-2" />
                Create Test
            </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
              <h3 className="text-lg font-semibold text-gray-700">Analytics Overview</h3>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="bg-blue-100 p-3 rounded-full"><BarChart className="text-blue-600" /></div>
                      <div>
                          <p className="text-gray-500 text-sm">Avg. Score</p>
                          <p className="text-2xl font-bold text-gray-800">{averageScore}/10</p>
                      </div>
                  </div>
              </div>
        </Card>
        <AtRiskStudents students={students} />
      </div>

      {/* My Courses */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <Card key={course.id} className="flex flex-col">
              <div className="p-6 flex-grow">
                <p className="text-sm font-semibold text-primary-600">CLASS {course.classLevel} - {course.subject.toUpperCase()}</p>
                <h3 className="text-xl font-bold text-gray-800 mt-1">{course.title}</h3>
                <p className="text-gray-500 mt-2">{course.chapters.length} Chapters</p>
              </div>
              <div className="bg-gray-50 p-4 flex justify-end space-x-2">
                <Button variant="secondary" onClick={() => onSelectCourse(course.id)}>Manage Course</Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Pending Evaluations */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Pending Evaluations</h2>
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course & Test</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted On</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingSubmissions.length > 0 ? pendingSubmissions.map(({ submission, student, course, test }) => (
                  <tr key={submission.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img className="h-10 w-10 rounded-full" src={student.avatarUrl} alt={student.name} />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{test.title}</div>
                        <div className="text-sm text-gray-500">{course.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button variant="secondary" onClick={() => handleEvaluateClick({ submission, student, course, test })}>
                        <BarChart size={16} className="inline-block mr-1" />
                        Evaluate
                      </Button>
                    </td>
                  </tr>
                )) : (
                    <tr>
                        <td colSpan={4} className="text-center py-6 text-gray-500">No pending evaluations. All caught up!</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <CreateCourseModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onAddCourse={addCourse}
      />

      {selectedEvaluation && (
        <TestEvaluationModal
          isOpen={!!selectedEvaluation}
          onClose={() => setSelectedEvaluation(null)}
          course={selectedEvaluation.course}
          student={selectedEvaluation.student}
          test={selectedEvaluation.test}
          submission={selectedEvaluation.submission}
          onSaveEvaluation={(score, feedback) => {
              onEvaluateTest(selectedEvaluation.submission.id, score, feedback);
              setSelectedEvaluation(null);
          }}
        />
      )}
    </div>
  );
};

export default TeacherDashboard;