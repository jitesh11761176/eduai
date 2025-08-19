import React, { useState, useEffect } from 'react';
import { Student, Teacher, Course, UserRole } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';

type UserData = { name: string; email: string; role: UserRole; courseIds?: string[] };
type UserUpdateData = { name: string; email: string; courseIds?: string[] };

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UserData | UserUpdateData) => void;
  userToEdit: Student | Teacher | null;
  courses: Course[];
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSave, userToEdit, courses }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  
  const isEditing = !!userToEdit;

  useEffect(() => {
    if (isOpen) {
      if (userToEdit) {
        setName(userToEdit.name);
        setEmail(userToEdit.email);
        if ('courses' in userToEdit) {
          setRole('student');
          setSelectedCourses(new Set(userToEdit.courses.map(c => c.courseId)));
        } else {
          setRole('teacher');
          setSelectedCourses(new Set());
        }
      } else {
        // Reset for new user
        setName('');
        setEmail('');
        setRole('student');
        setSelectedCourses(new Set());
      }
    }
  }, [isOpen, userToEdit]);

  const handleCourseToggle = (courseId: string) => {
    setSelectedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const courseIds = role === 'student' ? Array.from(selectedCourses) : undefined;
    
    if (isEditing) {
        onSave({ name, email, courseIds });
    } else {
        onSave({ name, email, role, courseIds });
    }
  };

  const isFormValid = name.trim() !== '' && email.trim().includes('@');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit User' : 'Add New User'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
          <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" required />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
          <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" required />
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
          <select id="role" value={role} onChange={e => setRole(e.target.value as UserRole)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white" disabled={isEditing}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>
        
        {role === 'student' && (
          <div>
            <h4 className="block text-sm font-medium text-gray-700">Enroll in Courses</h4>
            <div className="mt-2 p-3 border rounded-md max-h-48 overflow-y-auto space-y-2">
              {courses.map(course => (
                <label key={course.id} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCourses.has(course.id)}
                    onChange={() => handleCourseToggle(course.id)}
                    className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="text-sm text-gray-800">{course.title}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={!isFormValid}>
            {isEditing ? 'Save Changes' : 'Create User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UserFormModal;