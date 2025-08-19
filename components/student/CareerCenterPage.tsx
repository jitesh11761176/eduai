import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import Card from '../common/Card';
import Button from '../common/Button';
import { Briefcase, Award, GraduationCap, Building, Sparkles, MapPin, Search } from 'lucide-react';
import { mockMicroCredentials, mockInternships } from '../../data/mockData';
import { MicroCredential, Internship, CareerCounselorReport } from '../../types';
import * as gemini from '../../services/geminiService';
import LoadingSpinner from '../common/LoadingSpinner';

const CareerCenterPage: React.FC = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('credentials');
    const [report, setReport] = useState<CareerCounselorReport | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateReport = async () => {
        setIsGenerating(true);
        setError(null);
        setReport(null);
        try {
            const result = await gemini.generateCareerReport({ user }); // Pass user data
            setReport(result);
        } catch (err) {
            setError('Failed to generate career report. Please try again later.');
        } finally {
            setIsGenerating(false);
        }
    };
    
    const renderContent = () => {
        switch(activeTab) {
            case 'credentials':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {mockMicroCredentials.map(cred => (
                            <Card key={cred.id} className="p-5 flex items-start space-x-4">
                                <div className="bg-green-100 p-3 rounded-full"><Award className="text-green-600" size={24}/></div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800">{cred.title}</h3>
                                    <p className="text-sm text-gray-600">Issued by: <span className="font-semibold">{cred.issuer}</span></p>
                                    <p className="text-xs text-gray-400 mt-1">Date: {cred.issueDate}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                );
            case 'counselor':
                return (
                    <Card className="p-6">
                        {!report && !isGenerating && (
                            <div className="text-center">
                                <GraduationCap size={48} className="mx-auto text-primary-500"/>
                                <h3 className="text-xl font-semibold mt-4">AI Career Counselor</h3>
                                <p className="text-gray-600 mt-2 max-w-xl mx-auto">Get personalized career and university suggestions based on your academic performance and profile.</p>
                                <Button onClick={handleGenerateReport} className="mt-6" loading={isGenerating}>
                                    <Sparkles size={16} className="mr-2"/> Generate My Report
                                </Button>
                            </div>
                        )}
                        {isGenerating && <div className="text-center py-8"><LoadingSpinner /></div>}
                        {error && <p className="text-red-500 text-center">{error}</p>}
                        {report && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold">Your Career Report</h3>
                                <p className="bg-gray-50 p-3 rounded-md border">{report.summary}</p>
                                <div>
                                    <h4 className="font-semibold">Your Strengths:</h4>
                                    <ul className="list-disc list-inside mt-1 text-gray-700">
                                        {report.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Suggested Careers:</h4>
                                    {report.suggestedCareers.map((c, i) => (
                                        <div key={i} className="mt-2 p-3 border rounded-lg">
                                            <p className="font-bold">{c.title} <span className={`text-xs px-2 py-0.5 rounded-full ${c.match === 'High' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{c.match} Match</span></p>
                                            <p className="text-sm text-gray-600">{c.description}</p>
                                        </div>
                                    ))}
                                </div>
                                 <div>
                                    <h4 className="font-semibold">Recommended University Programs:</h4>
                                    <ul className="list-disc list-inside mt-1 text-gray-700">
                                        {report.recommendedPrograms.map((p, i) => <li key={i}>{p}</li>)}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </Card>
                );
            case 'marketplace':
                return (
                    <div className="space-y-4">
                        {mockInternships.map(internship => (
                             <Card key={internship.id} className="p-5">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <img src={internship.logoUrl} alt={`${internship.company} logo`} className="w-12 h-12 rounded-lg"/>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-primary-700">{internship.title}</h3>
                                        <p className="font-semibold text-gray-700">{internship.company}</p>
                                        <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin size={14}/> {internship.location}</p>
                                        <p className="text-sm text-gray-600 mt-2">{internship.description}</p>
                                    </div>
                                    <Button size="sm" className="self-start sm:self-center">Apply Now</Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                );
        }
    };

    const TABS = [
        { id: 'credentials', label: 'My Credentials', icon: Award },
        { id: 'counselor', label: 'AI Counselor', icon: GraduationCap },
        { id: 'marketplace', label: 'Internship Marketplace', icon: Building }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center space-x-3">
                <Briefcase size={32} className="text-primary-600" />
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Career Center</h1>
                    <p className="text-gray-500">Bridge your academic success to real-world opportunities.</p>
                </div>
            </div>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {TABS.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === tab.id ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            <tab.icon size={16} className="mr-2" />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="mt-6">
                {renderContent()}
            </div>
        </div>
    );
};

export default CareerCenterPage;