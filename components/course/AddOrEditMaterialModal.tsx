import React, { useState, useEffect } from 'react';
import { CourseMaterial, InteractiveContent } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { generateContentFromUrl } from '../../services/geminiService';
import { Sparkles, PlusCircle } from 'lucide-react';

interface AddOrEditMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Allow fileName and fileId for file uploads
  onSave: (data: Partial<Omit<CourseMaterial, 'id' | 'type'> & { fileName?: string; fileId?: string }>) => void;
  materialToEdit?: CourseMaterial | null;
  initialType: 'text' | 'video' | 'interactive' | 'file' | 'drive';
}

const AddOrEditMaterialModal: React.FC<AddOrEditMaterialModalProps> = ({ isOpen, onClose, onSave, materialToEdit, initialType }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [interactiveContent, setInteractiveContent] = useState<InteractiveContent | undefined>();
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [driveLink, setDriveLink] = useState('');

  const isEditing = !!materialToEdit;
  const type = isEditing ? materialToEdit.type : initialType;

  useEffect(() => {
    if (isOpen) {
      if (isEditing && materialToEdit) {
        setTitle(materialToEdit.title);
        setContent(materialToEdit.content || '');
        setUrl(materialToEdit.url || '');
        setInteractiveContent(materialToEdit.interactiveContent);
      } else {
        setTitle('');
        setContent('');
        setUrl('');
        setSourceUrl('');
        setFile(null);
        setFileUrl(null);
        setDriveLink('');
        if (type === 'interactive') {
            setInteractiveContent({ type: 'fill-in-the-blank', sentences: ["", {blank: ""}, ""], answers: {} });
        } else {
            setInteractiveContent(undefined);
        }
      }
      setGenerationError(null);
    }
  }, [isOpen, materialToEdit, isEditing, type]);

  const handleGenerateFromUrl = async () => {
    if (!sourceUrl.trim()) {
        setGenerationError("Please enter a valid URL.");
        return;
    }
    setIsGenerating(true);
    setGenerationError(null);
    try {
        const result = await generateContentFromUrl(sourceUrl);
        setContent(result.summary);
    } catch (error) {
        console.error(error);
        setGenerationError("Failed to generate content. Please check the URL and try again.");
    } finally {
        setIsGenerating(false);
    }
  };
  
  const handleInteractiveChange = (index: number, value: string, isBlank: boolean) => {
    if (!interactiveContent || interactiveContent.type !== 'fill-in-the-blank') return;
    
    const newSentences = [...interactiveContent.sentences];
    if (isBlank) {
        const oldBlank = (newSentences[index] as { blank: string }).blank;
        newSentences[index] = { blank: value };
        // Also update the answer key
        const newAnswers = {...interactiveContent.answers};
        delete newAnswers[oldBlank];
        newAnswers[value] = value;
        setInteractiveContent({ ...interactiveContent, sentences: newSentences, answers: newAnswers });
    } else {
        newSentences[index] = value;
        setInteractiveContent({ ...interactiveContent, sentences: newSentences });
    }
  };
  
  const addInteractiveSentencePart = (index: number) => {
     if (!interactiveContent || interactiveContent.type !== 'fill-in-the-blank') return;
     const newSentences = [...interactiveContent.sentences];
     newSentences.splice(index + 1, 0, { blank: "" }, "");
     setInteractiveContent({ ...interactiveContent, sentences: newSentences });
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Allow fileName and fileId for file uploads
    const data: Partial<Omit<CourseMaterial, 'id' | 'type'> & { fileName?: string; fileId?: string }> = { title };
    if (type === 'text') data.content = content;
    // Only allow YouTube links for video
    if (type === 'video') {
      const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i;
      if (!ytRegex.test(url.trim())) {
        setGenerationError('Please enter a valid YouTube URL.');
        return;
      }
      data.url = url.trim();
    }
    if (type === 'interactive') {
      data.interactiveContent = interactiveContent;
      if (driveLink.trim()) {
        data.url = driveLink.trim();
      }
    }
    // Only allow Google Drive links for files
    if (type === 'file') {
      if (!driveLink.trim() || !driveLink.includes('drive.google.com')) {
        setGenerationError('Please enter a valid Google Drive link.');
        return;
      }
      data.url = driveLink.trim();
    }
    if (type === 'drive' && driveLink.trim()) {
      data.url = driveLink.trim();
    }
    onSave(data);
  };
  
  const isFormValid = title.trim() !== '' && (
    (type === 'text' ? content.trim() !== '' :
    type === 'video' ? url.trim() !== '' :
    type === 'interactive' ? interactiveContent?.sentences.some(s => (typeof s === 'string' && s.trim() !== '') || (typeof s === 'object' && s.blank.trim() !== '')) :
    type === 'file' ? driveLink.trim() !== '' :
    type === 'drive' ? driveLink.trim() !== '' : false)
  );

  const renderDriveFields = () => (
    <div>
      <label htmlFor="material-drive-link" className="block text-sm font-medium text-gray-700">Google Drive Link</label>
      <input
        type="url"
        id="material-drive-link"
        value={driveLink}
        onChange={e => setDriveLink(e.target.value)}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        placeholder="https://drive.google.com/file/d/..."
        required
      />
      <p className="mt-2 text-xs text-gray-500">Paste a Google Drive file or folder link here. Students will get a View button that opens this in a new tab.</p>
    </div>
  );
  const modalTitle = `${isEditing ? 'Edit' : 'Add'} ${type === 'text' ? 'Text Note' : type === 'video' ? 'Video' : 'Interactive Exercise'}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="material-title" className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            id="material-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Enter a title"
            required
          />
        </div>
        
        {type === 'text' && (
          <>
            <div className="p-4 border rounded-lg bg-primary-50/50">
              <label htmlFor="source-url" className="block text-sm font-medium text-gray-700">Generate from URL (Optional)</label>
              <p className="text-xs text-gray-500 mt-1">Paste a link to an article to have AI summarize it for you.</p>
              <div className="flex items-center space-x-2 mt-2">
                <input
                  type="url"
                  id="source-url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  placeholder="https://example.com/article"
                />
                <Button type="button" variant="secondary" onClick={handleGenerateFromUrl} loading={isGenerating}>
                    <Sparkles size={16} className="mr-1.5"/>
                    Generate
                </Button>
              </div>
              {generationError && <p className="text-xs text-red-600 mt-1">{generationError}</p>}
            </div>
            <div>
              <label htmlFor="material-content" className="block text-sm font-medium text-gray-700">Content</label>
              <textarea
                id="material-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Write your notes here, or generate them from a URL above."
                required
              />
            </div>
          </>
        )}
        
  {type === 'video' && (
          <div>
            <label htmlFor="material-url" className="block text-sm font-medium text-gray-700">Video URL</label>
            <input
              type="url"
              id="material-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="e.g., https://www.youtube.com/watch?v=..."
              required
            />
             <p className="mt-2 text-xs text-gray-500">Currently, only YouTube URLs are supported for embedding.</p>
          </div>
  )}

  {(type === 'file' || type === 'drive') && renderDriveFields()}

    {type === 'interactive' && interactiveContent?.type === 'fill-in-the-blank' && (
      <>
      <div>
        <label className="block text-sm font-medium text-gray-700">Fill-in-the-Blank Exercise</label>
        <p className="text-xs text-gray-500 mt-1">Create a sentence by mixing text and blank inputs. The text in the blank field will be the correct answer.</p>
        <div className="mt-2 p-3 border rounded-lg space-y-2 bg-gray-50">
          <div className='flex flex-wrap items-center gap-2'>
          {interactiveContent.sentences.map((part, index) =>
            typeof part === 'string' ? (
              <React.Fragment key={index}>
              <input
                type="text"
                value={part}
                onChange={(e) => handleInteractiveChange(index, e.target.value, false)}
                className="p-2 border border-gray-300 rounded-md"
                placeholder="Text..."
              />
              <button type="button" onClick={() => addInteractiveSentencePart(index)} className="text-primary-600 hover:text-primary-800"><PlusCircle size={20}/></button>
              </React.Fragment>
            ) : (
               <input
                key={index}
                type="text"
                value={part.blank}
                onChange={(e) => handleInteractiveChange(index, e.target.value, true)}
                className="p-2 border-2 border-primary-400 rounded-md bg-primary-100 w-32"
                placeholder="Blank..."
              />
            )
          )}
          </div>
        </div>
      </div>
      <div className="mt-4">
        <label htmlFor="interactive-drive-link" className="block text-sm font-medium text-gray-700">Google Drive Link (PDFs, Slides, etc.)</label>
        <input
          type="url"
          id="interactive-drive-link"
          value={driveLink}
          onChange={e => setDriveLink(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder="https://drive.google.com/file/d/..."
        />
        <p className="mt-2 text-xs text-gray-500">(Optional) Attach a Google Drive link to share PDFs, slides, or other resources for this exercise.</p>
      </div>
      </>
    )}

        <div className="pt-4 flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={!isFormValid}>Save</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddOrEditMaterialModal;