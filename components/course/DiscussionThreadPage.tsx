import React, { useState } from 'react';
import { Course, DiscussionThread, User } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import { ArrowLeft, Send } from 'lucide-react';

interface DiscussionThreadPageProps {
  course: Course;
  thread: DiscussionThread;
  currentUser: User;
  onBack: () => void;
  onAddPost: (threadId: string, courseId: string, content: string) => void;
}

const DiscussionThreadPage: React.FC<DiscussionThreadPageProps> = ({ course, thread, currentUser, onBack, onAddPost }) => {
  const [newPostContent, setNewPostContent] = useState('');

  const originalPost = thread.posts[0];
  const replies = thread.posts.slice(1);

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    onAddPost(thread.id, course.id, newPostContent);
    setNewPostContent('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="secondary" onClick={onBack}>
        <ArrowLeft size={16} className="mr-2" />
        Back to Discussions
      </Button>

      <Card className="p-6">
        <h1 className="text-2xl font-bold text-gray-800">{thread.title}</h1>
        <p className="text-sm text-gray-500">
          In course: <span className="font-semibold">{course.title}</span>
        </p>
      </Card>

      {/* Original Post */}
      <Card className="p-5">
        <div className="flex items-start space-x-4">
          <img src={originalPost.authorAvatarUrl} alt={`${originalPost.authorName}'s avatar`} className="w-11 h-11 rounded-full" />
          <div className="flex-1">
            <div className="flex items-baseline space-x-2">
              <p className="font-semibold text-gray-800">{originalPost.authorName}</p>
              <p className="text-xs text-gray-400">{new Date(originalPost.createdAt).toLocaleString()}</p>
            </div>
            <p className="mt-2 text-gray-700 whitespace-pre-wrap">{originalPost.content}</p>
          </div>
        </div>
      </Card>

      {/* Replies */}
      <h2 className="text-xl font-semibold text-gray-700 pt-4 border-t">Replies ({replies.length})</h2>
      <div className="space-y-4">
        {replies.map(reply => (
          <Card key={reply.id} className="p-5 bg-gray-50">
            <div className="flex items-start space-x-4">
              <img src={reply.authorAvatarUrl} alt={`${reply.authorName}'s avatar`} className="w-11 h-11 rounded-full" />
              <div className="flex-1">
                <div className="flex items-baseline space-x-2">
                  <p className="font-semibold text-gray-800">{reply.authorName}</p>
                  <p className="text-xs text-gray-400">{new Date(reply.createdAt).toLocaleString()}</p>
                </div>
                <p className="mt-2 text-gray-700 whitespace-pre-wrap">{reply.content}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Reply Form */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Post a Reply</h3>
        <form onSubmit={handleReplySubmit} className="flex items-start space-x-4">
          <img src={currentUser.avatarUrl} alt="Your avatar" className="w-12 h-12 rounded-full" />
          <div className="flex-1">
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={4}
              placeholder="Write your reply..."
            />
            <div className="mt-2 text-right">
              <Button type="submit" disabled={!newPostContent.trim()}>
                <Send size={16} className="mr-2" /> Post Reply
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default DiscussionThreadPage;
