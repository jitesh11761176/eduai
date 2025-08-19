import React, { useState } from 'react';
import { User } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import { Send, MessageCircle } from 'lucide-react';

interface Post {
  id: string;
  author: { name: string; avatarUrl: string };
  content: string;
  timestamp: Date;
}

// Mock data for the teacher community
const initialPosts: Post[] = [
  {
    id: 'tp1',
    author: { name: 'Dr. Evelyn Reed', avatarUrl: 'https://i.pravatar.cc/150?u=teacher01' },
    content: 'Just tried a new interactive simulation for teaching kinematics. The students were so engaged! Happy to share the link if anyone is interested.',
    timestamp: new Date(Date.now() - 3600000 * 2), // 2 hours ago
  },
  {
    id: 'tp2',
    author: { name: 'Mr. David Chen', avatarUrl: 'https://i.pravatar.cc/150?u=t2' },
    content: 'Looking for effective ways to explain the concept of molarity to Class XI students. Any suggestions or resources would be greatly appreciated!',
    timestamp: new Date(Date.now() - 3600000 * 5), // 5 hours ago
  },
];

interface TeacherCommunityProps {
  currentUser: User;
}

const TeacherCommunity: React.FC<TeacherCommunityProps> = ({ currentUser }) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [newPostContent, setNewPostContent] = useState('');

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const newPost: Post = {
      id: `tp_${Date.now()}`,
      author: { name: currentUser.name, avatarUrl: currentUser.avatarUrl },
      content: newPostContent,
      timestamp: new Date(),
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <MessageCircle size={32} className="text-primary-600" />
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Teacher Community Hub</h1>
            <p className="text-gray-500">Share ideas, ask questions, and collaborate with fellow educators.</p>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handlePostSubmit} className="flex items-start space-x-4">
          <img src={currentUser.avatarUrl} alt="Your avatar" className="w-12 h-12 rounded-full" />
          <div className="flex-1">
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              placeholder="Share your thoughts or ask a question..."
            />
            <div className="mt-2 text-right">
              <Button type="submit" disabled={!newPostContent.trim()}>
                <Send size={16} className="mr-2" /> Post
              </Button>
            </div>
          </div>
        </form>
      </Card>

      <div className="space-y-4">
        {posts.map(post => (
          <Card key={post.id} className="p-5">
            <div className="flex items-start space-x-4">
              <img src={post.author.avatarUrl} alt={`${post.author.name}'s avatar`} className="w-11 h-11 rounded-full" />
              <div className="flex-1">
                <div className="flex items-baseline space-x-2">
                  <p className="font-semibold text-gray-800">{post.author.name}</p>
                  <p className="text-xs text-gray-400">{post.timestamp.toLocaleString()}</p>
                </div>
                <p className="mt-1 text-gray-700 whitespace-pre-wrap">{post.content}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TeacherCommunity;
