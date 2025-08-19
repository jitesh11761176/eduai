import React, { useState } from 'react';
import { Course, User, CourseMaterial, TestSubmission, Announcement, Student, View } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import { ArrowLeft, BookOpen, Rss, BarChart2, MessageSquare, Trophy, Folder, Video as VideoIcon, Users2 } from 'lucide-react';
import ClassAnalyticsModal from './ClassAnalyticsModal';
import CourseContentTab from './tabs/CourseContentTab';
import CourseDiscussionsTab from './tabs/CourseDiscussionsTab';
import CourseLeaderboardTab from './tabs/CourseLeaderboardTab';
import CourseProjectsTab from './tabs/CourseProjectsTab';
import CourseLiveClassTab from './tabs/CourseLiveClassTab';
import CourseStudyGroupsTab from './tabs/CourseStudyGroupsTab';

interface CourseDetailProps {
  course: Course;
  user: User;
  students: Student[];
  submissions: TestSubmission[];
  onBack: () => void;
  onAddMaterial: (courseId: string, chapterId: string, material: Omit<CourseMaterial, 'id'>) => void;
  onUpdateMaterial: (courseId: string, chapterId: string, material: CourseMaterial) => void;
  onDeleteMaterial: (courseId: string, chapterId: string, materialId: string) => void;
  onAttemptTest: (courseId: string, chapterId: string, testId: string) => void;
  onViewFeedback: (submissionId: string) => void;
  onAddAnnouncement: (courseId: string, title: string, content: string) => void;
  onNavigate: (view: View, context: any) => void;
  onCreateDiscussion: (courseId: string, title: string, content: string) => void;
}

export const MaterialIcon: React.FC<{ type: CourseMaterial['type'] }> = ({ type, ...props }) => {
    switch (type) {
        case 'file': return <Folder size={18} className="text-blue-500" {...props} />;
        case 'text': return <BookOpen size={18} className="text-purple-500" {...props} />;
        case 'video': return <VideoIcon size={18} className="text-red-500" {...props} />;
        default: return <Folder size={18} className="text-gray-500" {...props} />;
    }
};

const CourseDetail: React.FC<CourseDetailProps> = (props) => {
  const { course, user, onBack, onAddAnnouncement } = props;
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('content');

  const TABS = [
      { id: 'content', label: 'Content', icon: BookOpen },
      { id: 'discussions', label: 'Discussions', icon: MessageSquare },
      { id: 'groups', label: 'Study Groups', icon: Users2 },
      { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
      { id: 'projects', label: 'Projects', icon: Folder },
      { id: 'live', label: 'Live Class', icon: VideoIcon }
  ];

  const renderTabContent = () => {
      switch(activeTab) {
          case 'content':
              return <CourseContentTab {...props} />;
          case 'discussions':
              return <CourseDiscussionsTab course={course} user={user} onNavigate={props.onNavigate} onCreateDiscussion={props.onCreateDiscussion} />;
          case 'groups':
              return <CourseStudyGroupsTab course={course} user={user} allStudents={props.students} />;
          case 'leaderboard':
              return <CourseLeaderboardTab course={course} allStudents={props.students} />;
          case 'projects':
              return <CourseProjectsTab course={course} user={user} onNavigate={props.onNavigate} />;
          case 'live':
              return <CourseLiveClassTab user={user} allStudents={props.students} />;
          default:
              return <CourseContentTab {...props} />;
      }
  };
  
  return (
    <>
    <div className="space-y-6">
      <Button variant="secondary" onClick={onBack}><ArrowLeft size={16} className="mr-2" />Back to Dashboard</Button>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <p className="text-sm font-semibold text-primary-600">CLASS {course.classLevel} - {course.subject.toUpperCase()}</p>
                <h1 className="text-3xl font-bold text-gray-800 mt-1">{course.title}</h1>
                <p className="text-gray-500 text-md mt-1">Taught by {course.teacher}</p>
            </div>
            {user.role === 'teacher' && (
                <Button onClick={() => setIsAnalyticsModalOpen(true)}>
                    <BarChart2 size={18} className="mr-2" />
                    Class Analytics
                </Button>
            )}
        </div>
      </Card>
      
      <Card className="p-6">
        <h2 className="text-2xl font-semibold text-gray-700 flex items-center mb-4"><Rss size={24} className="mr-3 text-primary-600"/>Announcements</h2>
        {/* Announcement logic can be moved into a component if it gets more complex */}
        <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
            {course.announcements.length > 0 ? course.announcements.map(ann => (
                <div key={ann.id} className="p-4 border-l-4 border-primary-500 bg-gray-50 rounded-r-lg">
                    <p className="font-bold text-gray-800">{ann.title}</p>
                    <p className="text-sm text-gray-500">By {ann.author} on {new Date(ann.createdAt).toLocaleDateString()}</p>
                    <p className="mt-2 text-gray-700 whitespace-pre-wrap">{ann.content}</p>
                </div>
            )) : (
                <p className="text-center text-gray-500 py-4">No announcements yet.</p>
            )}
        </div>
      </Card>
      
      <div>
        <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === tab.id ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        <tab.icon size={16} className="mr-2" />
                        {tab.label}
                    </button>
                ))}
            </nav>
        </div>
        <div className="mt-6">
            {renderTabContent()}
        </div>
      </div>
    </div>

    {isAnalyticsModalOpen && (
        <ClassAnalyticsModal 
            isOpen={isAnalyticsModalOpen}
            onClose={() => setIsAnalyticsModalOpen(false)}
            course={course}
            submissions={props.submissions.filter(s => s.courseId === course.id)}
        />
    )}
    </>
  );
};

export default CourseDetail;