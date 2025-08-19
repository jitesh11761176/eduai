import React from 'react';
import { Course, TestSubmission, Student } from '../../types';
import Card from '../common/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, CheckCircle, BarChart2, TrendingUp, AlertCircle } from 'lucide-react';

interface TeacherAnalyticsPageProps {
  courses: Course[];
  submissions: TestSubmission[];
  students: Student[];
}

const COLORS = ['#3b82f6', '#86efac', '#f97316', '#a855f7'];

const TeacherAnalyticsPage: React.FC<TeacherAnalyticsPageProps> = ({ courses, submissions, students }) => {

  const totalStudentsInCourses = React.useMemo(() => {
    const studentIds = new Set<string>();
    courses.forEach(course => {
        students.forEach(student => {
            if (student.courses.some(sc => sc.courseId === course.id)) {
                studentIds.add(student.id);
            }
        });
    });
    return studentIds.size;
  }, [courses, students]);
  
  const overallAverageScore = React.useMemo(() => {
    const gradedSubmissions = submissions.filter(s => typeof s.score === 'number' && courses.some(c => c.id === s.courseId));
    if (gradedSubmissions.length === 0) return 0;
    const totalScore = gradedSubmissions.reduce((acc, s) => acc + s.score!, 0);
    return parseFloat((totalScore / gradedSubmissions.length).toFixed(1));
  }, [submissions, courses]);

  const coursePerformanceData = React.useMemo(() => {
    return courses.map(course => {
      const courseSubmissions = submissions.filter(s => s.courseId === course.id && typeof s.score === 'number');
      const totalScore = courseSubmissions.reduce((acc, s) => acc + s.score!, 0);
      const avgScore = courseSubmissions.length > 0 ? parseFloat((totalScore / courseSubmissions.length).toFixed(1)) : 0;
      return { name: course.title, 'Average Score': avgScore };
    });
  }, [courses, submissions]);
  
  const questionDifficultyData = React.useMemo(() => {
      // Mock data, as we don't track per-question correctness
      return [
          { name: 'Kinematics Q1', successRate: 85 },
          { name: 'Kinematics Q2', successRate: 92 },
          { name: 'Laws of Motion Q1', successRate: 65 },
          { name: 'Laws of Motion Q2', successRate: 58 },
          { name: 'Work & Energy Q1', successRate: 72 },
      ];
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <BarChart2 size={32} className="text-primary-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Class Analytics</h1>
          <p className="text-gray-500">Deep dive into your students' performance and engagement.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-4 rounded-full"><Users className="text-blue-600" size={28} /></div>
            <div>
              <p className="text-gray-500 text-sm font-medium">Active Students</p>
              <p className="text-3xl font-bold text-gray-800">{totalStudentsInCourses}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-4 rounded-full"><CheckCircle className="text-green-600" size={28} /></div>
            <div>
              <p className="text-gray-500 text-sm font-medium">Overall Avg. Score</p>
              <p className="text-3xl font-bold text-gray-800">{overallAverageScore} <span className="text-xl">/ 10</span></p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-orange-100 p-4 rounded-full"><TrendingUp className="text-orange-600" size={28} /></div>
            <div>
              <p className="text-gray-500 text-sm font-medium">Most Difficult Topic</p>
              <p className="text-xl font-bold text-gray-800">Laws of Motion</p>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Course Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={coursePerformanceData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 10]} />
              <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 12}} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Average Score" fill="#3b82f6" barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Question Success Rate (Mock)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={questionDifficultyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{fontSize: 10}} angle={-15} textAnchor="end" />
              <YAxis label={{ value: 'Success %', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="successRate" stroke="#10b981" strokeWidth={2} name="Success Rate (%)" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

       <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center"><AlertCircle size={20} className="mr-2 text-red-500"/> At-Risk Students (Mock Data)</h2>
          <p className="text-sm text-gray-500 mb-4">Students with consistently low scores or low engagement.</p>
           <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Avg. Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Alert Reason</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Mock Data */}
                 <tr>
                    <td className="px-6 py-4 flex items-center space-x-3"><img src="https://i.pravatar.cc/150?u=s2" className="w-8 h-8 rounded-full" alt="Brenda Smith" /><span>Brenda Smith</span></td>
                    <td className="px-6 py-4 font-semibold text-red-600">4.5 / 10</td>
                    <td className="px-6 py-4">Low test scores in Physics</td>
                 </tr>
                 <tr>
                    <td className="px-6 py-4 flex items-center space-x-3"><img src="https://i.pravatar.cc/150?u=s4" className="w-8 h-8 rounded-full" alt="Diana Prince" /><span>Diana Prince</span></td>
                    <td className="px-6 py-4 font-semibold text-orange-500">6.2 / 10</td>
                    <td className="px-6 py-4">Missed recent submission</td>
                 </tr>
              </tbody>
            </table>
          </div>
       </Card>

    </div>
  );
};

export default TeacherAnalyticsPage;
