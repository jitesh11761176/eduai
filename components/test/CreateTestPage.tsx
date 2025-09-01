import React, { useState, useMemo, useCallback } from 'react';
import { Course, Test, Question, GeneratedQuestion, Rubric } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import { ArrowLeft, Check, Plus, Sparkles, Trash2, Clock, Zap, ClipboardEdit } from 'lucide-react';
import { generateTestQuestion } from '../../services/geminiService';
import GenerateQuizModal from './GenerateQuizModal';
import RubricEditor from './RubricEditor';

type QuestionDraft = Omit<Question, 'id'> & { id: string | number };

const CreateTestPage: React.FC<{
  courses: Course[];
  onBack: () => void;
  onCreateTest: (courseId: string, chapterIds: string[], testDetails: Pick<Test, 'title' | 'questions' | 'isAdaptive' | 'rubric'> & { duration?: number }) => Promise<void> | void;
}> = ({ courses, onBack, onCreateTest }) => {
  const [selectedCourseId, setSelectedCourseId] = useState('');
  // Multi-select chapters (topics)
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([]);
  const [testTitle, setTestTitle] = useState('');
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    { id: Date.now(), text: '', type: 'subjective' }
  ]);
  const [isTimed, setIsTimed] = useState(false);
  const [duration, setDuration] = useState(30);
  const [isAdaptive, setIsAdaptive] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isRubricModalOpen, setIsRubricModalOpen] = useState(false);
  const [rubric, setRubric] = useState<Rubric | undefined>(undefined);

  const toggleChapter = (chapterId: string) => {
    setSelectedChapterIds(prev => prev.includes(chapterId) ? prev.filter(id => id !== chapterId) : [...prev, chapterId]);
  };

  const selectedCourse = useMemo(() => courses.find(c => c.id === selectedCourseId), [courses, selectedCourseId]);
  const selectedChapters = useMemo(() => selectedCourse?.chapters.filter(c => selectedChapterIds.includes(c.id)) || [], [selectedCourse, selectedChapterIds]);
  const firstSelectedChapter = selectedChapters[0]; // Used for AI generation features (assumption)
  const mergedChapterForQuiz = useMemo(() => {
    if (selectedChapters.length <= 1) return firstSelectedChapter;
    // Combine materials
    return {
      id: 'multi',
      title: selectedChapters.map(c => c.title).join(', '),
      materials: selectedChapters.flatMap(c => c.materials),
      completed: false,
      test: undefined
    } as any; // Cast to Chapter shape for existing modal usage
  }, [selectedChapters, firstSelectedChapter]);
  
  const availableChapters = useMemo(() => {
    if (!selectedCourse) return [];
    return selectedCourse.chapters.filter(ch => !ch.test);
  }, [selectedCourse]);

  const isFormValid = useMemo(() => {
    if (questions.length === 0) return false;
    const baseValid = selectedCourseId && selectedChapterIds.length > 0 && testTitle.trim() && questions.every(q => {
        if (!q.text.trim()) return false;
        if (q.type === 'mcq' && (!q.options || q.options.length < 2 || q.options.some(opt => !opt.trim()) || !q.correctAnswer)) return false;
        if (q.type === 'true-false' && !q.correctAnswer) return false;
        return true;
    });
    if (!baseValid) return false;
    if (isTimed && (isNaN(duration) || duration <= 0)) return false;
    return true;
  }, [selectedCourseId, selectedChapterIds, testTitle, questions, isTimed, duration]);

  const handleGenerateWithAI = async () => {
    if (!selectedCourse || selectedChapterIds.length === 0) return;
    setIsGenerating(true);
    try {
      if (selectedChapterIds.length === 1) {
        const chapter = selectedCourse.chapters.find(c => c.id === selectedChapterIds[0]);
        if (!chapter) return;
        const result = await generateTestQuestion(selectedCourse.title, selectedCourse.classLevel, selectedCourse.subject, chapter.title);
        if(!testTitle.trim()) setTestTitle(result.title);
        setQuestions(prev => [...prev, { id: Date.now(), text: result.question, type: 'subjective' }]);
      } else {
        const multiTitle = selectedChapters.map(c => c.title).join(' + ');
        if(!testTitle.trim()) setTestTitle(`Multi-Topic Assessment: ${multiTitle}`);
        // Generate one question per topic sequentially (to avoid rate limits)
        for (const chap of selectedChapters) {
          try {
            const result = await generateTestQuestion(selectedCourse.title, selectedCourse.classLevel, selectedCourse.subject, chap.title);
            setQuestions(prev => [...prev, { id: Date.now() + Math.random(), text: `[${chap.title}] ${result.question}`, type: 'subjective' }]);
          } catch (err) {
            console.warn('Failed to generate question for', chap.title, err);
          }
        }
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate question(s) with AI.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuizGenerated = useCallback((generatedTitle: string, generatedQuestions: GeneratedQuestion[]) => {
    setTestTitle(prev => prev.trim() ? prev : generatedTitle);
    const newQuestions: QuestionDraft[] = generatedQuestions.map(q => ({
        ...q,
        id: Date.now() + Math.random(),
    }));
    setQuestions(newQuestions);
    setIsQuizModalOpen(false);
  }, []);

  const updateQuestion = (id: string | number, newProps: Partial<QuestionDraft>) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...newProps } : q));
  };
  
  const handleQuestionTypeChange = (id: string | number, type: Question['type']) => {
    const newProps: Partial<QuestionDraft> = { type };
    if (type === 'mcq') {
        newProps.options = ['', ''];
        newProps.correctAnswer = '';
    } else if (type === 'true-false') {
        newProps.options = undefined;
        newProps.correctAnswer = 'True';
    } else {
        newProps.options = undefined;
        newProps.correctAnswer = undefined;
    }
    updateQuestion(id, newProps);
  };

  const handleAddQuestion = () => {
    setQuestions(prev => [...prev, { id: Date.now(), text: '', type: 'subjective' }]);
  };
  
  const handleRemoveQuestion = (id: string | number) => {
    if (questions.length <= 1) return;
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleOptionChange = (qId: string | number, optIndex: number, value: string) => {
    const question = questions.find(q => q.id === qId);
    if (question && question.options) {
      const newOptions = [...question.options];
      newOptions[optIndex] = value;
      updateQuestion(qId, { options: newOptions });
    }
  };

  const handleAddOption = (qId: string | number) => {
    const question = questions.find(q => q.id === qId);
    if (question && question.options) {
      updateQuestion(qId, { options: [...question.options, ''] });
    }
  };

  const handleRemoveOption = (qId: string | number, optIndex: number) => {
    const question = questions.find(q => q.id === qId);
    if (question && question.options && question.options.length > 2) {
      const newOptions = question.options.filter((_, i) => i !== optIndex);
      updateQuestion(qId, { options: newOptions });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const finalQuestions: Question[] = questions.map((q, index) => ({
      id: `q_${Date.now()}_${index}`,
      text: q.text,
      type: q.type,
      options: q.options,
      correctAnswer: q.correctAnswer,
    }));
    
    const testDetails: Pick<Test, 'title' | 'questions' | 'isAdaptive' | 'rubric'> & { duration?: number } = {
        title: testTitle,
        questions: finalQuestions,
        isAdaptive: isAdaptive,
        rubric: rubric
    };

    if (isTimed) {
        testDetails.duration = duration;
    }

  // Create identical test for each selected chapter (topic)
  await onCreateTest(selectedCourseId, selectedChapterIds, testDetails);
  };
  
  const renderQuestionEditor = (q: QuestionDraft, index: number) => {
    return <Card key={q.id} className="p-4 bg-gray-50/50 space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <span className="pt-2 font-semibold text-gray-500">{index + 1}.</span>
            <textarea
                value={q.text}
                onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                rows={2}
                className="flex-grow w-full p-2 border border-gray-300 rounded-md shadow-sm"
                placeholder={`Enter question ${index + 1}...`}
                required
            />
            <div className="flex self-end sm:self-center">
                <select value={q.type} onChange={(e) => handleQuestionTypeChange(q.id, e.target.value as Question['type'])} className="p-2 border border-gray-300 rounded-md">
                    <option value="subjective">Subjective</option>
                    <option value="mcq">MCQ</option>
                    <option value="true-false">True/False</option>
                </select>
                <Button type="button" variant="danger" onClick={() => handleRemoveQuestion(q.id)} disabled={questions.length <= 1} className="ml-2">
                    <Trash2 size={16}/>
                </Button>
            </div>
        </div>
        {q.type === 'mcq' && q.options && (
            <div className="pl-6 space-y-2">
                <h4 className="text-sm font-medium text-gray-600">Options (Select the correct answer)</h4>
                {q.options.map((opt, optIndex) => (
                    <div key={optIndex} className="flex items-center space-x-2">
                        <input type="radio" name={`correct_${q.id}`} id={`correct_${q.id}_${optIndex}`} checked={q.correctAnswer === opt} onChange={() => updateQuestion(q.id, { correctAnswer: opt })} />
                        <input type="text" value={opt} onChange={e => handleOptionChange(q.id, optIndex, e.target.value)} placeholder={`Option ${optIndex + 1}`} className="flex-grow p-2 border border-gray-300 rounded-md" />
                        <Button type="button" variant="danger" size="sm" onClick={() => handleRemoveOption(q.id, optIndex)} disabled={q.options!.length <= 2}>
                            <Trash2 size={14}/>
                        </Button>
                    </div>
                ))}
                <Button type="button" variant="secondary" size="sm" onClick={() => handleAddOption(q.id)}>
                    <Plus size={14} className="mr-1"/> Add Option
                </Button>
            </div>
        )}
        {q.type === 'true-false' && (
            <div className="pl-6 space-y-2">
                <h4 className="text-sm font-medium text-gray-600">Correct Answer</h4>
                <div className="flex space-x-4">
                    <label className="flex items-center"><input type="radio" name={`correct_${q.id}`} checked={q.correctAnswer === 'True'} onChange={() => updateQuestion(q.id, { correctAnswer: 'True' })} className="mr-1"/> True</label>
                    <label className="flex items-center"><input type="radio" name={`correct_${q.id}`} checked={q.correctAnswer === 'False'} onChange={() => updateQuestion(q.id, { correctAnswer: 'False' })} className="mr-1"/> False</label>
                </div>
            </div>
        )}
    </Card>
  };

  return (
    <>
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button variant="secondary" onClick={onBack}><ArrowLeft size={16} className="mr-2" /> Back to Dashboard</Button>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">Create a New Test</h1>
        <p className="text-gray-500 mt-1">Design a comprehensive assessment for your students.</p>
      </div>
      <Card>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <legend className="sr-only">Course and Chapter Selection</legend>
              <div>
                <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">Select a Course</label>
                <select id="course" value={selectedCourseId} onChange={e => {setSelectedCourseId(e.target.value); setSelectedChapterIds([]);}} className="w-full p-2 border border-gray-300 rounded-md" required>
                  <option value="" disabled>-- Choose a course --</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-1">Select Topics (Chapters)</span>
                <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md min-h-[58px] bg-white">
                  {(!selectedCourseId || availableChapters.length === 0) && (
                    <span className="text-xs text-gray-400">{!selectedCourseId ? 'Choose a course first' : 'No available chapters'}</span>
                  )}
                  {availableChapters.map(ch => {
                    const selected = selectedChapterIds.includes(ch.id);
                    return (
                      <button
                        type="button"
                        key={ch.id}
                        onClick={() => toggleChapter(ch.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 ${selected ? 'bg-primary-600 text-white border-primary-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'}`}
                        disabled={!selectedCourseId}
                        aria-pressed={selected}
                      >
                        {ch.title}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">Click to toggle. Selected: {selectedChapterIds.length || 0}</p>
                  {selectedChapterIds.length > 0 && (
                    <button type="button" onClick={() => setSelectedChapterIds([])} className="text-xs text-red-500 hover:underline">Clear</button>
                  )}
                </div>
              </div>
          </fieldset>
          
          <fieldset disabled={selectedChapterIds.length === 0} className="border-t pt-6 space-y-4">
            <legend className="sr-only">Test Details</legend>
            <div className="flex justify-end">
                <Button type="button" variant="primary" onClick={() => setIsQuizModalOpen(true)} disabled={selectedChapterIds.length === 0}>
                    <Sparkles size={16} className="mr-2" /> Generate Full Quiz with AI
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div>
                    <label htmlFor="testTitle" className="block text-sm font-medium text-gray-700 mb-1">Test Title</label>
                    <input type="text" id="testTitle" value={testTitle} onChange={e => setTestTitle(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" placeholder="e.g., Chapter 1 Assessment" required />
                     <div className="mt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsRubricModalOpen(true)}>
                            <ClipboardEdit size={16} className="mr-2"/> {rubric ? 'Edit' : 'Add'} Grading Rubric
                        </Button>
                     </div>
                </div>
                <div className="space-y-3 pt-1">
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" id="isTimed" checked={isTimed} onChange={e => setIsTimed(e.target.checked)} className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500 border-gray-300" />
                        <label htmlFor="isTimed" className="text-sm font-medium text-gray-700 flex items-center"><Clock size={16} className="mr-1.5 text-gray-500"/> Enable time limit</label>
                    </div>
                    {isTimed && (
                         <div>
                            <label htmlFor="duration" className="sr-only">Duration (minutes)</label>
                            <input type="number" id="duration" value={duration} onChange={e => setDuration(parseInt(e.target.value, 10))} min="1" className="w-full p-2 border border-gray-300 rounded-md" placeholder="e.g., 30" required/>
                         </div>
                    )}
                     <div className="flex items-center space-x-2">
                        <input type="checkbox" id="isAdaptive" checked={isAdaptive} onChange={e => setIsAdaptive(e.target.checked)} className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500 border-gray-300" />
                        <label htmlFor="isAdaptive" className="text-sm font-medium text-gray-700 flex items-center"><Zap size={16} className="mr-1.5 text-gray-500"/> Adaptive Test</label>
                    </div>
                </div>
            </div>
            
            <div className="space-y-4 pt-4">
                <h3 className="text-md font-medium text-gray-800">Questions</h3>
                {questions.length > 0 ? questions.map(renderQuestionEditor) : <p className="text-center text-gray-500 py-4">No questions yet. Add questions manually or generate a full quiz with AI.</p>}
            </div>
             <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                <Button type="button" variant="secondary" onClick={handleAddQuestion}><Plus size={16} className="mr-2" /> Add Question Manually</Button>
                <Button type="button" variant="secondary" onClick={handleGenerateWithAI} loading={isGenerating} disabled={selectedChapterIds.length === 0}>
                  <Sparkles size={16} /> {isGenerating ? 'Generating...' : (selectedChapterIds.length > 1 ? 'Add AI Questions (All Topics)' : 'Add AI Subjective Question')}
                </Button>
            </div>
          </fieldset>

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={!isFormValid} size="md" className="min-w-[200px]"><Check size={18} className="mr-2" /> Create Test</Button>
          </div>
        </form>
      </Card>
    </div>
  {isQuizModalOpen && selectedCourse && mergedChapterForQuiz && selectedChapterIds.length > 0 && (
        <GenerateQuizModal
            isOpen={isQuizModalOpen}
            onClose={() => setIsQuizModalOpen(false)}
            onQuizGenerated={handleQuizGenerated}
      course={selectedCourse}
      chapter={mergedChapterForQuiz}
        />
    )}
    {isRubricModalOpen && (
        <RubricEditor
            isOpen={isRubricModalOpen}
            onClose={() => setIsRubricModalOpen(false)}
            onSave={(newRubric) => {
                setRubric(newRubric);
                setIsRubricModalOpen(false);
            }}
            initialRubric={rubric}
        />
    )}
    </>
  );
};

export default CreateTestPage;