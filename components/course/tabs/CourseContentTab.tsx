import React, { useState, useRef, useEffect } from 'react';
import { Course, User, CourseMaterial, Chapter, TestSubmission, InteractiveContent } from '../../../types';
import Card from '../../common/Card';
import Button from '../../common/Button';
import { BookOpen, FolderOpen, Type, Video, ChevronDown, ChevronUp, Download, Edit, Trash2, Users, Wand2, FileText, BarChart3, Waves } from 'lucide-react';
import AddOrEditMaterialModal from '../AddOrEditMaterialModal';
import { MaterialIcon } from '../CourseDetail';
import ExplainTextModal from '../../student/ExplainTextModal';
import ContentModalityViewer from '../../student/ContentModalityViewer';

interface CourseContentTabProps {
  course: Course;
  user: User;
  submissions: TestSubmission[];
  onAddMaterial: (courseId: string, chapterId: string, material: Omit<CourseMaterial, 'id'>) => void;
  onUpdateMaterial: (courseId: string, chapterId: string, material: CourseMaterial) => void;
  onDeleteMaterial: (courseId: string, chapterId: string, materialId: string) => void;
  onAttemptTest: (courseId: string, chapterId: string, testId: string) => void;
  onViewFeedback: (submissionId: string) => void;
}

const getYouTubeEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
    }
    return null; 
};

const FillInTheBlank: React.FC<{ content: InteractiveContent, isTeacher: boolean }> = ({ content, isTeacher }) => {
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [results, setResults] = useState<Record<number, boolean>>({});

    const handleAnswerChange = (index: number, value: string) => {
        setAnswers(prev => ({ ...prev, [index]: value }));
    };

    const checkAnswers = () => {
        const newResults: Record<number, boolean> = {};
        content.sentences.forEach((part, index) => {
            if (typeof part === 'object') {
                const correctAnswer = content.answers[part.blank];
                newResults[index] = answers[index]?.trim().toLowerCase() === correctAnswer?.trim().toLowerCase();
            }
        });
        setResults(newResults);
    };

    return (
        <div className="p-4 bg-gray-50 border-t space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-lg">
                {content.sentences.map((part, index) => 
                    typeof part === 'string' ? (
                        <span key={index}>{part}</span>
                    ) : (
                        <input
                            key={index}
                            type="text"
                            disabled={isTeacher}
                            value={isTeacher ? part.blank : answers[index] || ''}
                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                            className={`inline-block w-32 p-1 border-b-2 rounded-t-sm text-center font-semibold
                                ${isTeacher ? 'border-gray-400 bg-gray-200' : 'border-primary-400 bg-white focus:outline-none focus:border-primary-600'}
                                ${results[index] === true ? 'border-green-500' : results[index] === false ? 'border-red-500' : ''}
                            `}
                        />
                    )
                )}
            </div>
            {!isTeacher && (
                <div>
                    <Button onClick={checkAnswers}>Check Answers</Button>
                </div>
            )}
        </div>
    );
};


const CourseContentTab: React.FC<CourseContentTabProps> = ({ course, user, submissions, onAddMaterial, onUpdateMaterial, onDeleteMaterial, onAttemptTest, onViewFeedback }) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<CourseMaterial | null>(null);
  const [modalType, setModalType] = useState<'text' | 'video' | 'interactive'>('text');
  
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [openChapters, setOpenChapters] = useState<Set<string>>(() => new Set(course.chapters.map(c => c.id)));
  
  // State for "Explain It Differently" tool
  const [explainTool, setExplainTool] = useState<{ visible: boolean; x: number; y: number; text: string }>({ visible: false, x: 0, y: 0, text: '' });
  const [isExplainModalOpen, setIsExplainModalOpen] = useState(false);
  
  // State for Content Modality Viewer
  const [modalityViewer, setModalityViewer] = useState<{ isOpen: boolean; content: string; mode: 'summary' | 'infographic' | 'audio' | null }>({ isOpen: false, content: '', mode: null });

  const contentRef = useRef<HTMLDivElement>(null);

  const handleTextSelection = () => {
    if (user.role !== 'student') return;
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim() || '';
    if (selectedText.length > 10) { // Only show for meaningful selections
      const range = selection!.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setExplainTool({
        visible: true,
        x: rect.left + window.scrollX + rect.width / 2,
        y: rect.top + window.scrollY - 40, // Position above the selection
        text: selectedText,
      });
    } else {
      setExplainTool({ ...explainTool, visible: false });
    }
  };
  
  const openModalityViewer = (content: string, mode: 'summary' | 'infographic' | 'audio') => {
    setModalityViewer({ isOpen: true, content, mode });
  };


  useEffect(() => {
    const handleClickOutside = () => setExplainTool(prev => ({ ...prev, visible: false }));
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddFileClick = (chapterId: string) => {
    setActiveChapterId(chapterId);
    setIsPickerOpen(true);
  };

  const handleOpenAddModal = (chapterId: string, type: 'text' | 'video' | 'interactive' | 'drive') => {
    setActiveChapterId(chapterId);
    setEditingMaterial(null);
    setModalType(type);
    setIsMaterialModalOpen(true);
  };

  const handleOpenEditModal = (material: CourseMaterial, chapterId: string) => {
    if (material.type === 'file') return;
    setActiveChapterId(chapterId);
    setEditingMaterial(material);
    setModalType(material.type);
    setIsMaterialModalOpen(true);
  };

  const handleFileSelect = (file: { fileId: string; title: string }) => {
    if (activeChapterId) {
      onAddMaterial(course.id, activeChapterId, {
        fileId: file.fileId,
        title: file.title,
        type: 'file',
      });
    }
    setIsPickerOpen(false);
    setActiveChapterId(null);
  };

  const handleSaveMaterial = (materialData: Partial<Omit<CourseMaterial, 'id' | 'type'>>) => {
    if (!activeChapterId) return;

    if (editingMaterial) {
      onUpdateMaterial(course.id, activeChapterId, { ...editingMaterial, ...materialData });
    } else {
      onAddMaterial(course.id, activeChapterId, { type: modalType, ...materialData } as Omit<CourseMaterial, 'id'>);
    }
    
    setIsMaterialModalOpen(false);
    setEditingMaterial(null);
    setActiveChapterId(null);
  };
  
  const toggleChapter = (chapterId: string) => {
    setOpenChapters(prev => {
        const newSet = new Set(prev);
        if (newSet.has(chapterId)) newSet.delete(chapterId);
        else newSet.add(chapterId);
        return newSet;
    });
  };

  const renderMaterialContent = (material: CourseMaterial) => {
    switch (material.type) {
      case 'text':
        return (
          <div onMouseUp={handleTextSelection} className="p-4 bg-gray-50 border-t">
            <p className="text-gray-700 whitespace-pre-wrap">{material.content}</p>
            {user.role === 'student' && material.content && (
              <div className="mt-4 pt-3 border-t flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">AI Tools:</span>
                <Button size="sm" variant="secondary" onClick={() => openModalityViewer(material.content!, 'summary')}><FileText size={14} className="mr-1.5"/>Summarize</Button>
                <Button size="sm" variant="secondary" onClick={() => openModalityViewer(material.content!, 'infographic')}><BarChart3 size={14} className="mr-1.5"/>Create Infographic</Button>
                <Button size="sm" variant="secondary" onClick={() => openModalityViewer(material.content!, 'audio')}><Waves size={14} className="mr-1.5"/>Create Audio</Button>
              </div>
            )}
          </div>
        );
      case 'video':
        const embedUrl = getYouTubeEmbedUrl(material.url || '');
        return (
          <div className="p-4 bg-gray-50 border-t">
            {embedUrl ? (
              <div className="aspect-w-16 aspect-h-9"><iframe src={embedUrl} title={material.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full rounded-lg shadow-md" style={{ aspectRatio: '16/9' }}></iframe></div>
            ) : (
              <p className="text-red-600">Invalid or unsupported video URL.</p>
            )}
          </div>
        );
      case 'drive':
        return (
          <div className="p-4 bg-gray-50 border-t">
            <a
              href={material.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
            >
              <Download size={16} className="mr-1" /> Open Resource
            </a>
          </div>
        );
      case 'interactive':
        if (material.interactiveContent?.type === 'fill-in-the-blank') {
          return <FillInTheBlank content={material.interactiveContent} isTeacher={user.role === 'teacher'} />;
        }
        return null;
      default:
        return null;
    }
  };

  const renderTestSection = (chapter: Chapter) => {
    if (!chapter.test) return null;
    const test = chapter.test;
    
    if (user.role === 'teacher') {
        const chapterSubmissions = submissions.filter(s => s.chapterId === chapter.id);
        return (
             <div className="border-t">
                 <h4 className="font-semibold text-md text-gray-700 p-4 pl-6 bg-gray-50/70">Test</h4>
                 <div className="p-4 pl-6 flex justify-between items-center">
                     <div><p className="font-medium text-gray-800">{test.title}</p></div>
                     <div className="flex items-center space-x-2 text-gray-600 font-semibold bg-gray-100 px-3 py-1.5 rounded-lg"><Users size={16} /><span>{chapterSubmissions.length} Submissions</span></div>
                 </div>
            </div>
        )
    }

    const mySubmission = submissions.find(s => s.studentId === user.id && s.testId === test.id);
    const isSubmitted = !!mySubmission;
    const hasScore = typeof mySubmission?.score === 'number';

    return (
        <div className="border-t">
             <h4 className="font-semibold text-md text-gray-700 p-4 pl-6 bg-gray-50/70">Test</h4>
             <div className="p-4 pl-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                 <div>
                    <p className="font-medium text-gray-800">{test.title}</p>
                    <span className={`capitalize px-2 py-0.5 mt-1 inline-block text-xs font-semibold rounded-full ${test.type === 'online' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>{test.type}</span>
                 </div>
                 <div className="self-end sm:self-center">
                    {!isSubmitted && <Button onClick={() => onAttemptTest(course.id, chapter.id, test.id)}><Edit size={16} className="mr-2" />Attempt Now</Button>}
                    {isSubmitted && !hasScore && <span className="font-semibold text-gray-600 px-3 py-2 bg-yellow-100 rounded-lg">Submitted</span>}
                    {isSubmitted && hasScore && (
                         <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-2xl font-bold text-green-600">{mySubmission?.score}<span className="text-base font-medium text-gray-500">/10</span></p>
                                <p className="text-xs text-gray-500">Graded</p>
                            </div>
                            <Button variant="secondary" onClick={() => onViewFeedback(mySubmission!.id)}>View Feedback</Button>
                         </div>
                    )}
                </div>
             </div>
        </div>
    );
  };

  return (
    <>
      <div ref={contentRef}>
        {explainTool.visible && (
            <div
                className="absolute z-10 -translate-x-1/2"
                style={{ left: explainTool.x, top: explainTool.y }}
                onMouseDown={(e) => e.stopPropagation()}
            >
        <div
          role="button"
          tabIndex={0}
          onClick={() => setIsExplainModalOpen(true)}
          onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') setIsExplainModalOpen(true); }}
          className="flex items-center space-x-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg shadow-lg hover:bg-primary-700 transition"
        >
          <Wand2 size={16} />
          <span className="text-sm font-semibold">Explain with AI</span>
        </div>
            </div>
        )}
        <div className="space-y-4">
            {course.chapters.map(chapter => (
            <Card key={chapter.id} className="p-0 overflow-hidden">
                <div
                  role="button"
                  tabIndex={0}
                  aria-expanded={openChapters.has(chapter.id)}
                  onClick={() => toggleChapter(chapter.id)}
                  onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') toggleChapter(chapter.id); }}
                  className="w-full flex justify-between items-center p-4 text-left cursor-pointer hover:bg-gray-50"
                >
                <div className="flex items-center space-x-3"><BookOpen className="text-primary-500"/><h3 className="text-lg font-semibold text-gray-800">{chapter.title}</h3></div>
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                    {user.role === 'teacher' && (
                      <div className="flex items-center space-x-1 p-1 bg-gray-100 rounded-lg">
                        <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); handleOpenAddModal(chapter.id, 'drive'); }}><FolderOpen size={16} className="mr-1" /> File</Button>
                        <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); handleOpenAddModal(chapter.id, 'text'); }}><Type size={16} className="mr-1" /> Note</Button>
                        <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); handleOpenAddModal(chapter.id, 'video'); }}><Video size={16} className="mr-1" /> Video</Button>
                        <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); handleOpenAddModal(chapter.id, 'interactive'); }}>Quiz</Button>
                      </div>
                    )}
                    {openChapters.has(chapter.id) ? <ChevronUp /> : <ChevronDown />}
                </div>
                </div>
                
                {openChapters.has(chapter.id) && (
                <>
                    <div className="border-t">
                        {chapter.materials.length > 0 ? (
                        <ul className="divide-y">
                            {chapter.materials.map(material => (
                            <li key={material.id} className="group">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 pl-6 gap-2 hover:bg-gray-50/50">
                                <div className="flex items-center space-x-3">
                                  <MaterialIcon type={material.type} />
                                  <span>{material.title}</span>
                                  {/* Drive URL hidden */}
                                </div>
                                <div className="flex items-center space-x-2 self-end sm:self-center">
                                  {material.type === 'file' && <Button variant="secondary" size="sm"><Download size={16} className="mr-1" /> View</Button>}
                                  {material.type === 'drive' && material.url && (
                                    <a
                                      href={material.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                                    >
                                      <Download size={16} className="mr-1" /> View
                                    </a>
                                  )}
                                  {user.role === 'teacher' && (
                                    <>
                                      {material.type !== 'file' && <Button variant="secondary" size="sm" onClick={() => handleOpenEditModal(material, chapter.id)}><Edit size={16}/></Button>}
                                      <Button variant="danger" size="sm" onClick={() => onDeleteMaterial(course.id, chapter.id, material.id)}><Trash2 size={16}/></Button>
                                    </>
                                  )}
                                </div>
                            </div>
                            {renderMaterialContent(material)}
                            </li>
                            ))}
                        </ul>
                        ) : (
                        <p className="text-gray-500 p-4 pl-6 text-sm">No materials added yet.</p>
                        )}
                    </div>
                    {renderTestSection(chapter)}
                </>
                )}
            </Card>
            ))}
        </div>
      </div>
      <AddOrEditMaterialModal isOpen={isMaterialModalOpen} onClose={() => setIsMaterialModalOpen(false)} onSave={handleSaveMaterial} materialToEdit={editingMaterial} initialType={modalType} />
      <ExplainTextModal isOpen={isExplainModalOpen} onClose={() => setIsExplainModalOpen(false)} selectedText={explainTool.text} />
      {modalityViewer.isOpen && (
        <ContentModalityViewer
            isOpen={modalityViewer.isOpen}
            onClose={() => setModalityViewer({ isOpen: false, content: '', mode: null })}
            content={modalityViewer.content}
            mode={modalityViewer.mode!}
        />
      )}
    </>
  );
};

export default CourseContentTab;