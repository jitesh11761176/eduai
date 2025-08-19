import React, { useState } from 'react';
import { Course, Student, Teacher } from '../../types';
import Card from '../common/Card';
import { BookOpen, Users, UserCheck, PlusCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Button from '../common/Button';
import CreateCourseModal from '../course/CreateCourseModal';

interface AdminDashboardProps {
  courses: Course[];
  students: Student[];
  teachers: Teacher[];
  addCourse: (course: Omit<Course, 'id' | 'teacher' | 'chapters' | 'announcements'>) => void;
}

const chartData = [
  { name: 'Class IX', students: 120, teachers: 5 },
  { name: 'Class X', students: 150, teachers: 6 },
  { name: 'Class XI', students: 110, teachers: 8 },
  { name: 'Class XII', students: 95, teachers: 7 },
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ courses, students, teachers, addCourse }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <PlusCircle size={20} className="inline-block mr-2" />
          Create New Course
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 flex items-center space-x-4">
          <div className="bg-primary-100 p-4 rounded-full">
            <BookOpen className="text-primary-600" size={28} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Courses</p>
            <p className="text-3xl font-bold text-gray-800">{courses.length}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center space-x-4">
          <div className="bg-green-100 p-4 rounded-full">
            <Users className="text-green-600" size={28} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Students</p>
            <p className="text-3xl font-bold text-gray-800">{students.length}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center space-x-4">
          <div className="bg-indigo-100 p-4 rounded-full">
            <UserCheck className="text-indigo-600" size={28} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Teachers</p>
            <p className="text-3xl font-bold text-gray-800">{teachers.length}</p>
          </div>
        </Card>
      </div>

      {/* Analytics Chart */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-700 mb-4">User Activity</h2>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="students" fill="#3b82f6" name="Students" />
              <Bar dataKey="teachers" fill="#86efac" name="Teachers" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <CreateCourseModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onAddCourse={addCourse}
      />
    </div>
  );
};

export default AdminDashboard;