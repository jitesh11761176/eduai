import React, { useState, useMemo } from 'react';
import { Student, Teacher, Course, UserRole } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import { ArrowLeft, PlusCircle, Edit, Trash2, Search } from 'lucide-react';
import UserFormModal from './UserFormModal';

type UserData = { name: string; email: string; role: UserRole; courseIds?: string[] };
type UserUpdateData = { name: string; email: string; courseIds?: string[] };

interface ManageUsersPageProps {
  students: Student[];
  teachers: Teacher[];
  courses: Course[];
  onBack: () => void;
  onAddUser: (userData: UserData) => void;
  onUpdateUser: (userId: string, role: UserRole, userData: UserUpdateData) => void;
  onDeleteUser: (userId: string, role: UserRole) => void;
}

const ManageUsersPage: React.FC<ManageUsersPageProps> = ({ students, teachers, courses, onBack, onAddUser, onUpdateUser, onDeleteUser }) => {
  const [activeTab, setActiveTab] = useState<'students' | 'teachers'>('students');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Student | Teacher | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const courseMap = useMemo(() => new Map(courses.map(c => [c.id, c.title])), [courses]);
  
  const filteredUsers = useMemo(() => {
    const users = activeTab === 'students' ? students : teachers;
    if (!searchTerm) return users;
    return users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, teachers, activeTab, searchTerm]);

  const handleAddNew = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: Student | Teacher) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };
  
  const handleDelete = (user: Student | Teacher) => {
    const role = 'courses' in user ? 'student' : 'teacher';
    if(window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
        onDeleteUser(user.id, role);
    }
  }

  const handleSaveUser = (userData: UserData | UserUpdateData) => {
    if (editingUser) {
        const role = 'courses' in editingUser ? 'student' : 'teacher';
        onUpdateUser(editingUser.id, role, userData as UserUpdateData);
    } else {
        onAddUser(userData as UserData);
    }
    setIsModalOpen(false);
    setEditingUser(null);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
             <Button variant="secondary" onClick={onBack}>
                <ArrowLeft size={16} className="mr-2" />
                Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-800">Manage Users</h1>
        </div>
        <Button onClick={handleAddNew}>
            <PlusCircle size={20} className="mr-2" />
            Add New User
        </Button>
      </div>

      <Card>
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <nav className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
             <div className="flex space-x-6 border-b sm:border-b-0 -mb-px sm:mb-0">
                <button onClick={() => setActiveTab('students')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'students' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                Students ({students.length})
                </button>
                <button onClick={() => setActiveTab('teachers')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'teachers' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                Teachers ({teachers.length})
                </button>
            </div>
             <div className="relative w-full sm:max-w-xs">
                <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </nav>
        </div>

        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  {activeTab === 'students' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrolled Courses</th>}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <img className="h-10 w-10 rounded-full" src={user.avatarUrl} alt={user.name} />
                            <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    {activeTab === 'students' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-sm truncate">
                            {(user as Student).courses.map(c => courseMap.get(c.courseId)).join(', ') || 'None'}
                        </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button variant="secondary" size="sm" onClick={() => handleEdit(user)}><Edit size={14} className="mr-1"/> Edit</Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(user)}><Trash2 size={14} className="mr-1"/> Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
      
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        userToEdit={editingUser}
        courses={courses}
      />
    </div>
  );
};

export default ManageUsersPage;