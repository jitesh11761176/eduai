import React from 'react';
import { Course, Student, Teacher } from '../../types';
import Card from '../common/Card';
import { School, Users, UserCheck, BarChart2, PieChart as PieIcon, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface PrincipalDashboardProps {
  courses: Course[];
  students: Student[];
  teachers: Teacher[];
}

const COLORS = ['#3b82f6', '#86efac', '#f97316', '#a855f7', '#f43f5e'];

const PrincipalDashboard: React.FC<PrincipalDashboardProps> = ({ courses, students, teachers }) => {

  const subjectPerformanceData = React.useMemo(() => {
      const subjectData: { [key: string]: { totalScore: number, count: number } } = {};
      courses.forEach(course => {
          if (!subjectData[course.subject]) {
              subjectData[course.subject] = { totalScore: 0, count: 0 };
          }
          // This is a simplified mock calculation. A real app would use submissions.
          const mockScore = (course.classLevel / 12) * 8 + Math.random() * 2;
          subjectData[course.subject].totalScore += mockScore * 25; // Assuming 25 students per course
          subjectData[course.subject].count += 25;
      });
      return Object.entries(subjectData).map(([subject, data]) => ({
          name: subject,
          'Average Score': parseFloat((data.totalScore / data.count).toFixed(1))
      }));
  }, [courses]);

  const courseEnrollmentData = React.useMemo(() => {
    return courses.map(course => ({
        name: course.title,
        value: students.filter(s => s.courses.some(c => c.courseId === course.id)).length
    })).sort((a,b) => b.value - a.value).slice(0, 5); // Top 5
  }, [courses, students]);

  const teacherEngagementData = React.useMemo(() => {
    // Mock data
    return teachers.map(teacher => ({
        name: teacher.name,
        'Activity Level': Math.floor(Math.random() * 80 + 20) // Random activity level 20-100
    })).sort((a,b) => b['Activity Level'] - a['Activity Level']);
  }, [teachers]);


  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <School size={32} className="text-primary-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-800">School-Wide Dashboard</h1>
          <p className="text-gray-500">Aggregate analytics for the entire institution.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-primary-100 p-4 rounded-full"><Users className="text-primary-600" size={28} /></div>
            <div><p className="text-gray-500 text-sm font-medium">Total Students</p><p className="text-3xl font-bold text-gray-800">{students.length}</p></div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-4 rounded-full"><UserCheck className="text-green-600" size={28} /></div>
            <div><p className="text-gray-500 text-sm font-medium">Total Teachers</p><p className="text-3xl font-bold text-gray-800">{teachers.length}</p></div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-100 p-4 rounded-full"><School className="text-indigo-600" size={28} /></div>
            <div><p className="text-gray-500 text-sm font-medium">Total Courses</p><p className="text-3xl font-bold text-gray-800">{courses.length}</p></div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <Card className="p-6 lg:col-span-3">
            <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center"><BarChart2 size={20} className="mr-2"/> Performance by Subject</h2>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0,10]} label={{ value: 'Avg Score / 10', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="Average Score" fill="#3b82f6" />
                </BarChart>
            </ResponsiveContainer>
        </Card>
        <Card className="p-6 lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center"><PieIcon size={20} className="mr-2"/> Top 5 Course Enrollments</h2>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={courseEnrollmentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                         {courseEnrollmentData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
        </Card>
      </div>
      
       <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center"><Activity size={20} className="mr-2"/> Teacher Engagement (Mock)</h2>
           <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Teacher</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Activity Level</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teacherEngagementData.map(teacher => (
                     <tr key={teacher.name}>
                        <td className="px-6 py-4">{teacher.name}</td>
                        <td className="px-6 py-4">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-primary-600 h-2.5 rounded-full" style={{width: `${teacher['Activity Level']}%`}}></div>
                            </div>
                        </td>
                     </tr>
                ))}
              </tbody>
            </table>
          </div>
       </Card>
    </div>
  );
};

export default PrincipalDashboard;