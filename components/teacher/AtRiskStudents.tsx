import React, { useState, useMemo } from 'react';
import { Student } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import { AlertTriangle, User, TrendingDown } from 'lucide-react';

interface AtRiskStudentsProps {
  students: Student[];
}

const AtRiskStudents: React.FC<AtRiskStudentsProps> = ({ students: allStudents }) => {
  const [analyzedStudents, setAnalyzedStudents] = useState<Student[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const atRiskStudents = useMemo(() => {
    return analyzedStudents.filter(s => s.riskLevel === 'high' || s.riskLevel === 'medium');
  }, [analyzedStudents]);
  
  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    // Simulate API call and AI analysis
    setTimeout(() => {
      setAnalyzedStudents(allStudents);
      setIsAnalyzing(false);
    }, 1500);
  };

  const riskColor = (level: 'low' | 'medium' | 'high' | undefined) => {
      if (level === 'high') return 'bg-red-100 text-red-800';
      if (level === 'medium') return 'bg-yellow-100 text-yellow-800';
      return 'bg-green-100 text-green-800';
  }

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold text-gray-700">Predictive Analytics</h3>
      <div className="mt-2">
        {atRiskStudents.length === 0 && !isAnalyzing ? (
          <div className="text-center p-4">
            <p className="text-gray-500 text-sm mb-3">Run an AI analysis to identify students who may need extra support before they fall behind.</p>
            <Button onClick={handleRunAnalysis} loading={isAnalyzing}>
              {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
            </Button>
          </div>
        ) : (
          <div className="space-y-3 max-h-40 overflow-y-auto">
            {atRiskStudents.map(student => (
                <div key={student.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className='flex items-center gap-3'>
                        <img src={student.avatarUrl} alt={student.name} className="w-8 h-8 rounded-full" />
                        <span className="font-medium text-sm">{student.name}</span>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${riskColor(student.riskLevel)}`}>
                        {student.riskLevel} risk
                    </span>
                </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default AtRiskStudents;