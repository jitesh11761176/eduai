import React from 'react';
import { SkillNode } from '../../types';
import Card from '../common/Card';
import { Lock, CheckCircle, Rocket } from 'lucide-react';

interface SkillTreeProps {
  nodes: SkillNode[];
}

const SkillTree: React.FC<SkillTreeProps> = ({ nodes }) => {
  // This is a simplified linear layout for demonstration purposes.
  // A more complex implementation could use a graph library like react-flow.

  if (nodes.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">Learning Path is not available for this course yet.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-2xl font-semibold text-gray-700 mb-6">Your Learning Path</h3>
      <div className="relative flex flex-col items-start space-y-4">
        {/* The main path line */}
        <div className="absolute left-10 top-2 bottom-2 w-1 bg-gray-200 rounded-full"></div>

        {nodes.map((node, index) => (
          <div key={node.id} className="flex items-center w-full z-10">
            {/* Node Circle */}
            <div
              className={`w-20 h-20 rounded-full flex-shrink-0 flex items-center justify-center border-4
                ${node.isUnlocked ? 'bg-green-100 border-green-500' : 'bg-gray-100 border-gray-300'}`}
            >
              {node.isUnlocked ? (
                <CheckCircle size={32} className="text-green-600" />
              ) : (
                <Lock size={32} className="text-gray-400" />
              )}
            </div>

            {/* Node Content */}
            <div className="ml-6 p-4 rounded-lg flex-1 border bg-white shadow-sm">
              <p
                className={`font-bold text-lg ${
                  node.isUnlocked ? 'text-gray-800' : 'text-gray-500'
                }`}
              >
                {node.title}
              </p>
              {node.badge && node.isUnlocked && (
                  <div className="mt-2 inline-flex items-center gap-2 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    <Rocket size={14} /> Badge Earned: {node.badge.name}
                  </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default SkillTree;