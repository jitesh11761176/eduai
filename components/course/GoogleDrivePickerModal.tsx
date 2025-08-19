
import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { FileText, Film, Image, File } from 'lucide-react';

interface MockFile {
  id: string;
  name: string;
  type: 'doc' | 'pdf' | 'video' | 'image';
}

const mockFiles: MockFile[] = [
  { id: 'mock_1', name: 'Chapter 5 Lecture Notes.pdf', type: 'pdf' },
  { id: 'mock_2', name: 'Homework Assignment 3.docx', type: 'doc' },
  { id: 'mock_3', name: 'Lab Experiment Demo.mp4', type: 'video' },
  { id: 'mock_4', name: 'Diagram of a Cell.png', type: 'image' },
  { id: 'mock_5', name: 'Syllabus_Fall_2024.pdf', type: 'pdf' },
];

const fileIcons = {
  pdf: <FileText className="text-red-500" />,
  doc: <FileText className="text-blue-500" />,
  video: <Film className="text-purple-500" />,
  image: <Image className="text-green-500" />,
};

interface GoogleDrivePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: { fileId: string; title: string }) => void;
}

const GoogleDrivePickerModal: React.FC<GoogleDrivePickerModalProps> = ({ isOpen, onClose, onFileSelect }) => {
  const [selectedFile, setSelectedFile] = useState<MockFile | null>(null);

  const handleSelect = () => {
    if (selectedFile) {
      onFileSelect({
        fileId: selectedFile.id,
        title: selectedFile.name,
      });
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select File from Google Drive (Simulation)">
      <div className="space-y-3">
        <p className="text-sm text-gray-600">This is a simulation. Select a file to add as course material.</p>
        <ul className="border rounded-md divide-y max-h-80 overflow-y-auto">
          {mockFiles.map(file => (
            <li
              key={file.id}
              onClick={() => setSelectedFile(file)}
              className={`flex items-center space-x-3 p-3 cursor-pointer transition-colors ${selectedFile?.id === file.id ? 'bg-primary-100' : 'hover:bg-gray-50'}`}
            >
              {fileIcons[file.type] || <File />}
              <span className="flex-grow">{file.name}</span>
              {selectedFile?.id === file.id && <div className="w-2 h-2 bg-primary-500 rounded-full"></div>}
            </li>
          ))}
        </ul>
      </div>
      <div className="pt-5 flex justify-end space-x-3">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSelect} disabled={!selectedFile}>Add Selected File</Button>
      </div>
    </Modal>
  );
};

export default GoogleDrivePickerModal;
