import React, { useMemo } from 'react';
import { Course, Student, Badge } from '../../../types';
import Card from '../../common/Card';
import { Trophy, Star } from 'lucide-react';
import { mockBadges } from '../../../data/mockData';

interface CourseLeaderboardTabProps {
  course: Course;
  allStudents: Student[];
}

const CourseLeaderboardTab: React.FC<CourseLeaderboardTabProps> = ({ course, allStudents }) => {

  const leaderboardStudents = useMemo(() => {
    return allStudents
      .filter(student => student.courses.some(c => c.courseId === course.id))
      .sort((a, b) => b.points - a.points);
  }, [course.id, allStudents]);

  const weeklyWinners = useMemo(() => {
      // Mock this by just taking the top 3
      return leaderboardStudents.slice(0, 3).map(s => ({...s, badges: [...s.badges, mockBadges.find(b => b.id === 'b4')!] }));
  }, [leaderboardStudents]);

  return (
    <div className="space-y-8">
        <div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">Weekly Top Scorers</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {weeklyWinners.map((student, index) => (
                     <Card key={student.id} className={`p-4 text-center border-2 ${index === 0 ? 'border-yellow-400 bg-yellow-50' : index === 1 ? 'border-gray-300 bg-gray-50' : 'border-orange-400 bg-orange-50'}`}>
                        <Trophy size={28} className={`mx-auto ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-500' : 'text-orange-500'}`} />
                        <img src={student.avatarUrl} alt={student.name} className="w-16 h-16 rounded-full mx-auto mt-3 border-4 border-white shadow-md" />
                        <p className="font-bold text-lg mt-2">{student.name}</p>
                        <p className="text-sm text-gray-500">Rank #{index + 1}</p>
                        <p className="font-bold text-xl text-primary-600 mt-1">{student.points} PTS</p>
                    </Card>
                ))}
            </div>
        </div>
        <div>
            <h3 className="text-2xl font-semibold text-gray-700">Overall Leaderboard</h3>
            <Card className="p-0 mt-4">
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Rank</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Badges</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {leaderboardStudents.map((student, index) => (
                        <tr key={student.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`font-bold text-lg ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-500' : index === 2 ? 'text-orange-500' : 'text-gray-700'}`}>
                            #{index + 1}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                            <img className="h-10 w-10 rounded-full" src={student.avatarUrl} alt={student.name} />
                            <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-1">
                                {student.badges.map(badge => (
                                    <div key={badge.id} title={badge.name} className={`p-1 rounded-full ${badge.isTemporary ? 'bg-green-100' : 'bg-gray-100'}`}>
                                        <Trophy size={16} className={`${badge.isTemporary ? 'text-green-600' : 'text-yellow-600'}`}/>
                                    </div>
                                ))}
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-lg font-bold text-primary-600">{student.points}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </Card>
      </div>
    </div>
  );
};

export default CourseLeaderboardTab;