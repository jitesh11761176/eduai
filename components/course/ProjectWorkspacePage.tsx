import React, { useState, useCallback } from 'react';
import { Course, Project, User, KanbanTask, KanbanStatus } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import { ArrowLeft, CheckSquare, Clock, FileText, MessageSquare, Plus, Send } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface ProjectWorkspacePageProps {
  course: Course;
  project: Project;
  user: User;
  onBack: () => void;
}

const KanbanBoard: React.FC<{ tasks: KanbanTask[]; onTaskMove: (taskId: string, newStatus: KanbanStatus) => void; }> = ({ tasks, onTaskMove }) => {
    const columns: KanbanStatus[] = ['To Do', 'In Progress', 'Done'];

    const onDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId) return;
        onTaskMove(draggableId, destination.droppableId as KanbanStatus);
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {columns.map(status => (
                    <Droppable key={status} droppableId={status}>
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`p-3 rounded-lg ${snapshot.isDraggingOver ? 'bg-primary-100' : 'bg-gray-100'}`}
                            >
                                <h3 className="font-semibold text-gray-700 mb-3">{status}</h3>
                                {tasks.filter(t => t.status === status).map((task, index) => (
                                    <Draggable key={task.id} draggableId={task.id} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className={`p-3 mb-2 bg-white rounded-md shadow-sm border ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                                            >
                                                {task.content}
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                ))}
            </div>
        </DragDropContext>
    );
};

const ProjectWorkspacePage: React.FC<ProjectWorkspacePageProps> = ({ course, project, user, onBack }) => {
    const [activeTab, setActiveTab] = useState('tasks');
    const [tasks, setTasks] = useState(project.workspace.tasks);

    const handleTaskMove = useCallback((taskId: string, newStatus: KanbanStatus) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    }, []);

    const renderTabContent = () => {
        switch(activeTab) {
            case 'tasks':
                return <KanbanBoard tasks={tasks} onTaskMove={handleTaskMove} />;
            case 'documents':
                return (
                    <Card className="p-4">
                        <h3 className="font-semibold mb-2">Collaborative Report (Simulation)</h3>
                        <textarea className="w-full h-64 p-2 border rounded" placeholder="Start writing your report here..."></textarea>
                    </Card>
                );
            case 'chat':
                return (
                     <Card className="p-4 flex flex-col h-96">
                        <div className="flex-1 bg-gray-50 p-2 rounded border overflow-y-auto">
                           <p className="text-sm text-gray-600">Project chat is empty.</p>
                        </div>
                         <div className="relative mt-2">
                             <input type="text" placeholder="Send a message..." className="w-full pl-4 pr-10 py-2 border rounded-full"/>
                             <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400"><Send size={20} /></button>
                         </div>
                    </Card>
                );
        }
    }

    const TABS = [
        { id: 'tasks', label: 'Tasks', icon: CheckSquare },
        { id: 'documents', label: 'Documents', icon: FileText },
        { id: 'chat', label: 'Chat', icon: MessageSquare }
    ];

    return (
        <div className="space-y-6">
            <Button variant="secondary" onClick={onBack}><ArrowLeft size={16} className="mr-2"/> Back to Course</Button>
            <Card className="p-6">
                <h1 className="text-3xl font-bold text-gray-800">{project.title}</h1>
                <p className="text-gray-500 mt-1">Workspace for course: <span className="font-semibold">{course.title}</span></p>
                <p className="text-red-600 font-semibold mt-2">Due: {new Date(project.dueDate).toLocaleDateString()}</p>
            </Card>

             <div>
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                         {TABS.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === tab.id ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                <tab.icon size={16} className="mr-2"/>
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
    );
};

export default ProjectWorkspacePage;