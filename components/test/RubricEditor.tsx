import React, { useState } from 'react';
import { Rubric, RubricCriterion } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { PlusCircle, Trash2 } from 'lucide-react';

interface RubricEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rubric: Rubric) => void;
  initialRubric?: Rubric;
}

const RubricEditor: React.FC<RubricEditorProps> = ({ isOpen, onClose, onSave, initialRubric }) => {
    const [criteria, setCriteria] = useState<RubricCriterion[]>(
        initialRubric?.criteria || [{ id: `c_${Date.now()}`, description: '', levels: [{ description: 'Good', points: 1 }, { description: 'Excellent', points: 2 }] }]
    );

    const updateCriterion = (id: string, newProps: Partial<RubricCriterion>) => {
        setCriteria(prev => prev.map(c => c.id === id ? { ...c, ...newProps } : c));
    };

    const addCriterion = () => {
        setCriteria(prev => [...prev, { id: `c_${Date.now()}`, description: '', levels: [{ description: 'Good', points: 1 }, { description: 'Excellent', points: 2 }] }]);
    };

    const removeCriterion = (id: string) => {
        if (criteria.length > 1) {
            setCriteria(prev => prev.filter(c => c.id !== id));
        }
    };
    
    const updateLevel = (criterionId: string, levelIndex: number, newProps: { description?: string, points?: number }) => {
        const criterion = criteria.find(c => c.id === criterionId);
        if (criterion) {
            const newLevels = [...criterion.levels];
            newLevels[levelIndex] = { ...newLevels[levelIndex], ...newProps };
            updateCriterion(criterionId, { levels: newLevels });
        }
    };

    const handleSave = () => {
        onSave({ criteria });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Grading Rubric Editor">
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {criteria.map((criterion, index) => (
                    <div key={criterion.id} className="p-4 border rounded-lg bg-gray-50 space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="font-semibold text-gray-700">Criterion {index + 1}</label>
                            <Button variant="danger" size="sm" onClick={() => removeCriterion(criterion.id)}><Trash2 size={14}/></Button>
                        </div>
                        <textarea
                            value={criterion.description}
                            onChange={e => updateCriterion(criterion.id, { description: e.target.value })}
                            placeholder="e.g., Clarity of Explanation"
                            className="w-full p-2 border rounded-md"
                            rows={2}
                        />
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Performance Levels</p>
                            {criterion.levels.map((level, levelIndex) => (
                                <div key={levelIndex} className="flex items-center gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={level.description}
                                        onChange={e => updateLevel(criterion.id, levelIndex, { description: e.target.value })}
                                        placeholder="Level description"
                                        className="flex-grow p-2 border rounded-md"
                                    />
                                    <input
                                        type="number"
                                        value={level.points}
                                        onChange={e => updateLevel(criterion.id, levelIndex, { points: parseInt(e.target.value, 10) || 0 })}
                                        className="w-20 p-2 border rounded-md text-center"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                 <Button type="button" variant="secondary" onClick={addCriterion}><PlusCircle size={16} className="mr-2"/>Add Criterion</Button>
            </div>
            <div className="pt-5 flex justify-end space-x-3">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Save Rubric</Button>
            </div>
        </Modal>
    );
};

export default RubricEditor;