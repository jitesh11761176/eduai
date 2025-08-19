import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { generateContentModality } from '../../services/geminiService';
import LoadingSpinner from '../common/LoadingSpinner';
import { Sparkles, FileText, BarChart3, Waves } from 'lucide-react';

interface ContentModalityViewerProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  mode: 'summary' | 'infographic' | 'audio';
}

const ICONS = {
    summary: <FileText size={24} className="text-blue-500" />,
    infographic: <BarChart3 size={24} className="text-purple-500" />,
    audio: <Waves size={24} className="text-green-500" />,
}

const ContentModalityViewer: React.FC<ContentModalityViewerProps> = ({ isOpen, onClose, content, mode }) => {
  const [generatedContent, setGeneratedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && content && mode) {
      const generate = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const result = await generateContentModality(content, mode);
          setGeneratedContent(result);
        } catch (err) {
          setError('Failed to generate content. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };
      generate();
    }
  }, [isOpen, content, mode]);

  const title = `AI Generated ${mode.charAt(0).toUpperCase() + mode.slice(1)}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4 min-h-[200px]">
        {isLoading && <div className="flex justify-center items-center py-8"><LoadingSpinner /></div>}
        {error && <p className="text-red-600">{error}</p>}
        {generatedContent && (
            <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                <div className="flex items-center gap-3 mb-3">
                    {ICONS[mode]}
                    <h4 className="font-bold text-lg text-gray-800">{title}</h4>
                </div>
                <div className="text-gray-700 whitespace-pre-wrap">{generatedContent}</div>
            </div>
        )}
      </div>
    </Modal>
  );
};

export default ContentModalityViewer;