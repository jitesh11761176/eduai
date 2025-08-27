import React, { useState, useRef, useEffect } from 'react';
import { Course, User, CourseMaterial, Chapter, TestSubmission, Student } from '../../../types';
import Card from '../../common/Card';
import Button from '../../common/Button';
import { BookOpen, FolderOpen, Video, ChevronDown, ChevronUp, Download, Edit, Trash2, Users } from 'lucide-react';
import TestSubmissionsModal from '../../test/TestSubmissionsModal';
import AddOrEditMaterialModal from '../AddOrEditMaterialModal';
import { MaterialIcon } from '../CourseDetail';
// Text note / AI explain features removed

interface CourseContentTabProps {
  course: Course;
  user: User;
  submissions: TestSubmission[];
  students: Student[]; // for analytics display
  materialCompletions?: any[];
  onMarkMaterial?: (courseId: string, chapterId: string, materialId: string) => void;
  onUnmarkMaterial?: (courseId: string, chapterId: string, materialId: string) => void;
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

// Quiz (interactive) feature removed


const CourseContentTab: React.FC<CourseContentTabProps> = ({ course, user, submissions, students, materialCompletions = [], onMarkMaterial, onUnmarkMaterial, onAddMaterial, onUpdateMaterial, onDeleteMaterial, onAttemptTest, onViewFeedback }) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<CourseMaterial | null>(null);
  const [modalType, setModalType] = useState<'video' | 'drive'>('video');
  
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [openChapters, setOpenChapters] = useState<Set<string>>(() => new Set(course.chapters.map(c => c.id)));
  const [openTestAnalytics, setOpenTestAnalytics] = useState<Set<string>>(() => new Set()); // chapterIds with analytics panel open
  const [activeTestChapter, setActiveTestChapter] = useState<Chapter | null>(null);
  
  // Removed text selection & modality viewer state


  // Removed explain tool effect

  const handleAddFileClick = (chapterId: string) => {
    setActiveChapterId(chapterId);
    setIsPickerOpen(true);
  };

  const handleOpenAddModal = (chapterId: string, type: 'video' | 'drive') => {
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
  return null; // List already shows a View button; no extra panel needed
      default:
        return null;
    }
  };

  const computeTestStats = (chapter: Chapter) => {
    if (!chapter.test) return null;
    const test = chapter.test;
    const chapterSubs = submissions.filter(s => s.chapterId === chapter.id && s.testId === test.id);
    const graded = chapterSubs.filter(s => typeof s.score === 'number');
    const scores = graded.map(s => s.score as number).sort((a,b) => a-b);
    const median = scores.length === 0 ? null : (scores.length % 2 === 1 ? scores[Math.floor(scores.length/2)] : (scores[scores.length/2 -1] + scores[scores.length/2]) / 2);
    const maxScore = scores.length > 0 ? Math.max(...scores) : null;
    const topSubmissions = maxScore === null ? [] : graded.filter(s => s.score === maxScore);
    const focusSubs = graded.filter(s => (s.score ?? 0) < 5); // threshold <50%
    const idToStudent = (id: string) => students.find(st => st.id === id)?.name || 'Unknown';
    return {
      total: chapterSubs.length,
      graded: graded.length,
      median,
      maxScore,
      topNames: topSubmissions.map(s => idToStudent(s.studentId)),
      focusNames: focusSubs.map(s => idToStudent(s.studentId)),
    };
  };

  const renderTestSection = (chapter: Chapter) => {
    if (!chapter.test) return null;
    const test = chapter.test;
    
    if (user.role === 'teacher') {
        const chapterSubmissions = submissions.filter(s => s.chapterId === chapter.id && s.testId === test.id);
        const stats = computeTestStats(chapter);
        const analyticsOpen = openTestAnalytics.has(chapter.id);
        return (
             <div className="border-t">
                 <h4 className="font-semibold text-md text-gray-700 p-4 pl-6 bg-gray-50/70">Test</h4>
                 <div className="p-4 pl-6 flex flex-col gap-3">
                     <div className="flex justify-between items-center">
                        <div className="space-y-1">
                           <p className="font-medium text-gray-800">{test.title}</p>
                           <span className={`capitalize px-2 py-0.5 inline-block text-xs font-semibold rounded-full ${test.type === 'online' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>{test.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setActiveTestChapter(chapter)}
                            className="flex items-center space-x-2 text-gray-600 font-semibold bg-gray-100 hover:bg-gray-200 transition px-3 py-1.5 rounded-lg"
                          >
                            <Users size={16} />
                            <span>{chapterSubmissions.length} Submissions</span>
                          </button>
                          <button
                            onClick={() => setOpenTestAnalytics(prev => { const ns = new Set(prev); ns.has(chapter.id) ? ns.delete(chapter.id) : ns.add(chapter.id); return ns; })}
                            className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700"
                          >
                            {analyticsOpen ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                            <span>Stats</span>
                          </button>
                        </div>
                     </div>
                     {analyticsOpen && stats && (
                       <div className="mt-2 grid grid-cols-1 sm:grid-cols-4 gap-3 bg-gray-50 p-3 rounded-lg border">
                           <div>
                             <p className="text-xs uppercase tracking-wide text-gray-500">Median</p>
                             <p className="text-lg font-bold text-gray-800">{stats.median !== null ? stats.median : '—'}</p>
                           </div>
                           <div>
                             <p className="text-xs uppercase tracking-wide text-gray-500">Top Score</p>
                             <p className="text-lg font-bold text-green-600">{stats.maxScore !== null ? stats.maxScore : '—'}</p>
                             {stats.topNames.length > 0 && <p className="text-[10px] text-gray-500 truncate">{stats.topNames.join(', ')}</p>}
                           </div>
                           <div>
                             <p className="text-xs uppercase tracking-wide text-gray-500">Graded</p>
                             <p className="text-lg font-bold text-gray-800">{stats.graded}/{stats.total}</p>
                           </div>
                           <div>
                             <p className="text-xs uppercase tracking-wide text-gray-500">Focus Students</p>
                             {stats.focusNames.length > 0 ? (
                               <p className="text-[11px] font-medium text-red-600 line-clamp-3">{stats.focusNames.join(', ')}</p>
                             ) : (
                               <p className="text-lg font-bold text-gray-400">—</p>
                             )}
                           </div>
                       </div>
                     )}
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
            {!isSubmitted && (
              <Button onClick={() => onAttemptTest(course.id, chapter.id, test.id)}>
                <Edit size={16} className="mr-2" />Attempt Now
              </Button>
            )}
            {isSubmitted && !hasScore && (
              <span className="font-semibold text-gray-600 px-3 py-2 bg-yellow-100 rounded-lg">Submitted - Awaiting Grade</span>
            )}
            {isSubmitted && hasScore && (
              <Button variant="secondary" onClick={() => onViewFeedback(mySubmission!.id)} className="flex items-center">
                <span className="mr-3 inline-flex items-center bg-green-100 text-green-700 px-2 py-0.5 rounded text-sm font-semibold">
                  {mySubmission?.score}/10
                </span>
                View Result
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
  <div>
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
                        <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); handleOpenAddModal(chapter.id, 'video'); }}><Video size={16} className="mr-1" /> Video</Button>
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
                            {chapter.materials.filter(m => m.type !== 'interactive').map(material => {
                            const completed = materialCompletions.some(mc => mc.materialId === material.id);
                            return (
                            <li key={material.id} className={`group ${completed ? 'bg-green-50/40' : ''}`}>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 pl-6 gap-2 hover:bg-gray-50/50">
                                <div className="flex items-center space-x-3">
                                  <MaterialIcon type={material.type} />
                                  <span className={completed ? 'line-through text-gray-500' : ''}>{material.title}</span>
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
                                  {user.role === 'student' && (
                                    completed ? (
                                      <Button size="sm" variant="secondary" onClick={() => onUnmarkMaterial && onUnmarkMaterial(course.id, chapter.id, material.id)}>Undo</Button>
                                    ) : (
                                      <Button size="sm" variant="primary" onClick={() => onMarkMaterial && onMarkMaterial(course.id, chapter.id, material.id)}>Mark Done</Button>
                                    )
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
                            )})}
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
  <AddOrEditMaterialModal isOpen={isMaterialModalOpen} onClose={() => setIsMaterialModalOpen(false)} onSave={handleSaveMaterial} materialToEdit={editingMaterial} initialType={modalType as any} />
  {activeTestChapter && activeTestChapter.test && (
    <TestSubmissionsModal
      isOpen={!!activeTestChapter}
      onClose={() => setActiveTestChapter(null)}
      course={course}
      chapter={activeTestChapter}
      test={activeTestChapter.test}
      submissions={submissions.filter(s => s.chapterId === activeTestChapter.id && s.testId === activeTestChapter.test!.id)}
      students={students}
    />
  )}
    </>
  );
};

export default CourseContentTab;