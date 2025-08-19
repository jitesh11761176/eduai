import React from 'react';
import { Course, User, View } from '../../../types';
import Card from '../../common/Card';
import Button from '../../common/Button';
import { Folder, PlusCircle } from 'lucide-react';

interface CourseProjectsTabProps {
  course: Course;
  user: User;
  onNavigate: (view: View, context: any) => void;
}

const CourseProjectsTab: React.FC<CourseProjectsTabProps> = ({ course, user, onNavigate }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-semibold text-gray-700">Projects</h3>
        {user.role === 'teacher' && (
          <Button onClick={() => alert('New project creation form would open here.')}>
            <PlusCircle size={18} className="mr-2" /> Create New Project
          </Button>
        )}
      </div>

      {course.projects.length > 0 ? (
        <div className="space-y-4">
          {course.projects.map(project => (
            <Card key={project.id} className="p-5">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <div className="flex items-center space-x-2">
                        <Folder className="text-primary-600"/>
                        <h4 className="text-lg font-bold text-gray-800">{project.title}</h4>
                    </div>
                  <p className="text-gray-600 mt-2 max-w-2xl">{project.description}</p>
                </div>
                <div className="text-left sm:text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-500">Due Date</p>
                  <p className="font-bold text-red-600">{new Date(project.dueDate).toLocaleDateString()}</p>
                  <Button size="sm" variant="secondary" className="mt-2" onClick={() => onNavigate('projectWorkspace', { courseId: course.id, projectId: project.id })}>
                    Open Workspace
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Folder size={40} className="mx-auto text-gray-400" />
          <p className="mt-4 text-gray-500">No projects have been assigned for this course yet.</p>
        </Card>
      )}
    </div>
  );
};

export default CourseProjectsTab;