import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Course } from '../../types';

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCourse: (course: Omit<Course, 'id' | 'teacher' | 'chapters' | 'announcements' | 'discussionThreads' | 'projects' | 'studyGroups'>) => void;
}

const CreateCourseModal: React.FC<CreateCourseModalProps> = ({ isOpen, onClose, onAddCourse }) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    // Basic validation
    setIsFormValid(title.trim() !== '' && subject.trim() !== '' && classLevel.trim() !== '' && !isNaN(Number(classLevel)));
  }, [title, subject, classLevel]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    onAddCourse({
      title,
      subject,
      classLevel: Number(classLevel),
    });
    
    // Reset form and close modal
    setTitle('');
    setSubject('');
    setClassLevel('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create a New Course">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Course Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="e.g., Introduction to Calculus"
            required
          />
        </div>
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="e.g., Mathematics"
            required
          />
        </div>
        <div>
          <label htmlFor="classLevel" className="block text-sm font-medium text-gray-700">Class Level</label>
           <select
            id="classLevel"
            value={classLevel}
            onChange={(e) => setClassLevel(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            required
          >
            <option value="" disabled>Select a class</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(level => (
              <option key={level} value={level}>Class {level}</option>
            ))}
          </select>
        </div>
        <div className="pt-4 flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!isFormValid}>
            Create Course
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateCourseModal;