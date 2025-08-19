import React, { useState } from 'react';
import { Course, User, Student, StudyGroup } from '../../../types';
import Card from '../../common/Card';
import Button from '../../common/Button';
import Modal from '../../common/Modal';
import { Users2, PlusCircle, MessageSquare, FileText } from 'lucide-react';

interface CourseStudyGroupsTabProps {
  course: Course;
  user: User;
  allStudents: Student[];
}

const CourseStudyGroupsTab: React.FC<CourseStudyGroupsTabProps> = ({ course, user }) => {
  const [groups, setGroups] = useState<StudyGroup[]>(course.studyGroups);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [newGroupName, setNewGroupName] = useState('');

  const handleCreateGroup = () => {
      if (!newGroupName.trim()) return;
      const newGroup: StudyGroup = {
          id: `sg_${Date.now()}`,
          name: newGroupName,
          members: [{ id: user.id, name: user.name, avatarUrl: user.avatarUrl }],
          chat: []
      };
      setGroups(prev => [...prev, newGroup]);
      setIsCreateModalOpen(false);
      setNewGroupName('');
  };
  
  const handleJoinGroup = (groupId: string) => {
      setGroups(prev => prev.map(g => {
          if (g.id === groupId && !g.members.some(m => m.id === user.id)) {
              return { ...g, members: [...g.members, { id: user.id, name: user.name, avatarUrl: user.avatarUrl }] };
          }
          return g;
      }));
  };

  const openGroupModal = (group: StudyGroup) => {
    setSelectedGroup(group);
    setIsGroupModalOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-semibold text-gray-700">Study Groups</h3>
        {user.role === 'student' && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <PlusCircle size={18} className="mr-2" /> Create New Group
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map(group => (
             <Card key={group.id} className="p-5 flex flex-col">
                <h4 className="text-lg font-bold text-gray-800">{group.name}</h4>
                <div className="flex -space-x-2 my-3">
                    {group.members.map(member => (
                        <img key={member.id} src={member.avatarUrl} title={member.name} className="w-10 h-10 rounded-full border-2 border-white"/>
                    ))}
                </div>
                <p className="text-sm text-gray-500">{group.members.length} members</p>
                <div className="mt-4 pt-4 border-t flex-grow flex items-end">
                    {group.members.some(m => m.id === user.id) ? (
                        <Button onClick={() => openGroupModal(group)} className="w-full">Open Group</Button>
                    ) : (
                         <Button onClick={() => handleJoinGroup(group.id)} variant="secondary" className="w-full">Join Group</Button>
                    )}
                </div>
            </Card>
        ))}
      </div>

       <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create a New Study Group">
        <div className="space-y-4">
            <div>
                <label htmlFor="group-name" className="block text-sm font-medium text-gray-700">Group Name</label>
                <input
                    id="group-name"
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="mt-1 w-full p-2 border rounded-md"
                    placeholder="e.g., Physics Final Review"
                />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateGroup} disabled={!newGroupName.trim()}>Create Group</Button>
            </div>
        </div>
      </Modal>

      {selectedGroup && (
        <Modal isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} title={selectedGroup.name}>
             <div className="space-y-4">
                <div>
                    <h4 className="font-semibold flex items-center gap-2"><MessageSquare size={18}/> Group Chat (Simulation)</h4>
                    <div className="mt-2 p-3 border rounded-md h-48 bg-gray-50 text-sm overflow-y-auto">
                        {selectedGroup.chat.length > 0 ? selectedGroup.chat.map(msg => (
                           <p key={msg.id}><span className="font-semibold">{msg.senderName}:</span> {msg.text}</p>
                        )) : <p>No messages yet.</p>}
                    </div>
                     <input type="text" placeholder="Send a message..." className="w-full p-2 border rounded-md mt-2"/>
                </div>
                 <div>
                    <h4 className="font-semibold flex items-center gap-2"><FileText size={18}/> Shared Files (Simulation)</h4>
                    <div className="mt-2 p-3 border rounded-md h-32 bg-gray-50 text-sm">
                        <p>No files shared yet.</p>
                    </div>
                    <Button variant="secondary" size="sm" className="mt-2">Upload File</Button>
                </div>
             </div>
        </Modal>
      )}
    </div>
  );
};

export default CourseStudyGroupsTab;