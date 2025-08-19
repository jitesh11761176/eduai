import React from 'react';
import { Parent, Student, Course, TestSubmission } from '../../types';
import Card from '../common/Card';
import ProgressBar from '../common/ProgressBar';
import { User, Book, CheckCircle, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ParentDashboardProps {
  parent: Parent;
  child: Student;
  courses: Course[];
  submissions: TestSubmission[];
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ parent, child, courses, submissions }) => {

  const childCourses = React.useMemo(() => {
    return courses.filter(course => child.courses.some(cc => cc.courseId === course.id));
  }, [child, courses]);
  
  const gradedTests = React.useMemo(() => {
      return submissions
        .filter(s => typeof s.score === 'number')
        .sort((a,b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
  }, [submissions]);

  const performanceData = React.useMemo(() => {
    return gradedTests.map(submission => {
        const course = courses.find(c => c.id === submission.courseId);
        const test = course?.chapters.find(ch => ch.id === submission.chapterId)?.test;
        return {
            name: test?.title.substring(0, 15) + '...' || 'Test',
            score: submission.score,
        };
    });
  }, [gradedTests, courses]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Parent Dashboard</h1>
        <p className="text-gray-500">Welcome, {parent.name}. Here is an overview of {child.name}'s progress.</p>
      </div>

      <Card className="p-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Performance Snapshot</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
                <CheckCircle className="mx-auto text-blue-500" size={28}/>
                <p className="text-2xl font-bold text-gray-800 mt-1">{gradedTests.length}</p>
                <p className="text-sm text-gray-500">Tests Completed</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
                <User className="mx-auto text-green-500" size={28}/>
                <p className="text-2xl font-bold text-gray-800 mt-1">{childCourses.length}</p>
                <p className="text-sm text-gray-500">Enrolled Courses</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
                <Clock className="mx-auto text-orange-500" size={28}/>
                <p className="text-2xl font-bold text-gray-800 mt-1">{child.learningStreak}</p>
                <p className="text-sm text-gray-500">Day Learning Streak</p>
            </div>
        </div>
      </Card>

       <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-700 mb-4">Test Score Trend</h2>
            {performanceData.length > 1 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis domain={[0, 10]} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} name="Score" />
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <p className="text-center text-gray-500 py-10">Not enough test data to show a trend.</p>
            )}
        </Card>
      
      <section>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Course Progress</h2>
        <div className="space-y-4">
          {childCourses.map(course => {
            const courseProgressData = child.courses.find(c => c.courseId === course.id);
            const progress = courseProgressData ? courseProgressData.progress : 0;
            return (
              <Card key={course.id} className="p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">{course.title}</h3>
                        <p className="text-sm text-gray-500">Taught by {course.teacher}</p>
                    </div>
                    <div className="w-full sm:w-1/3 mt-2 sm:mt-0">
                         <ProgressBar progress={progress} />
                         <p className="text-sm text-right text-gray-600 mt-1">{progress}% Complete</p>
                    </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default ParentDashboard;
