import React, { useState } from 'react';
import { Course, User, View } from '../../../types';
import Card from '../../common/Card';
import Button from '../../common/Button';
import { PlusCircle, MessageSquare, Send } from 'lucide-react';
import Modal from '../../common/Modal';

interface CourseDiscussionsTabProps {
  course: Course;
  user: User;
  onNavigate: (view: View, context: any) => void;
  onCreateDiscussion: (courseId: string, title: string, content: string) => void;
}

const CourseDiscussionsTab: React.FC<CourseDiscussionsTabProps> = ({ course, user, onNavigate, onCreateDiscussion }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');

  const handleCreateThread = () => {
    if (newThreadTitle.trim() && newThreadContent.trim()) {
      onCreateDiscussion(course.id, newThreadTitle, newThreadContent);
      setIsModalOpen(false);
      setNewThreadTitle('');
      setNewThreadContent('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-semibold text-gray-700">Discussions</h3>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle size={18} className="mr-2" /> Start a New Discussion
        </Button>
      </div>

      <Card className="p-0">
        <ul className="divide-y divide-gray-200">
          {Array.isArray(course.discussionThreads) && course.discussionThreads.length > 0 ? (
            course.discussionThreads.map(thread => (
              <li key={thread.id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => onNavigate('discussionThread', { courseId: course.id, threadId: thread.id })}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-primary-700">{thread.title}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Started by {thread.posts[0]?.authorName} on {new Date(thread.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-gray-600">
                        <MessageSquare size={16} />
                        <span>{thread.posts.length} {thread.posts.length === 1 ? 'post' : 'posts'}</span>
                    </div>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <p className="text-center text-gray-500 p-8">No discussions yet. Be the first to start one!</p>
          )}
        </ul>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Start a New Discussion">
        <div className="space-y-4">
            <div>
                <label htmlFor="thread-title" className="block text-sm font-medium text-gray-700">Title</label>
                <input
                    id="thread-title"
                    type="text"
                    value={newThreadTitle}
                    onChange={(e) => setNewThreadTitle(e.target.value)}
                    className="mt-1 w-full p-2 border rounded-md"
                    placeholder="Enter a clear and concise title"
                />
            </div>
            <div>
                <label htmlFor="thread-content" className="block text-sm font-medium text-gray-700">Your question or comment</label>
                <textarea
                    id="thread-content"
                    value={newThreadContent}
                    onChange={(e) => setNewThreadContent(e.target.value)}
                    className="mt-1 w-full p-2 border rounded-md"
                    rows={6}
                    placeholder="Provide details here..."
                />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateThread} disabled={!newThreadTitle.trim() || !newThreadContent.trim()}>
                    <Send size={16} className="mr-2"/> Post Thread
                </Button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default CourseDiscussionsTab;
