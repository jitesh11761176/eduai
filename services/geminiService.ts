// AI: Generate course description and chapters
export const generateCourseDetailsWithAI = async (title: string, subject: string, classLevel: string | number): Promise<{ description: string, chapters: string[] }> => {
    const prompt = `
        You are an expert curriculum designer for Indian schools. Given the following course details, generate:
        1. A concise, engaging course description (2-3 sentences)
        2. A list of 5-8 chapter titles that would make up a logical syllabus for this course.

        Respond as a JSON object with keys: description (string), chapters (string[]).

        Course Title: ${title}
        Subject: ${subject}
        Class Level: ${classLevel}
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "Respond as a valid JSON object with keys: description (string), chapters (string[]).",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        description: { type: Type.STRING },
                        chapters: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["description", "chapters"]
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating course details with AI:", error);
        throw new Error("Failed to generate course details with AI.");
    }
};
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Course, CourseMaterial, Chapter, TestSubmission, Question, GeneratedQuestion, FocusPlan, ClassInsights, StudyPlan, DetailedAiFeedback, LessonPlan, CareerCounselorReport } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const getChatbotResponseStream = async (
    history: { role: 'user' | 'model', parts: { text: string }[] }[], 
    newMessage: string,
    systemInstruction?: string
) => {
    try {
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: history,
            config: systemInstruction ? { systemInstruction } : undefined,
        });
        const result = await chat.sendMessageStream({ message: newMessage });
        return result;
    } catch (error) {
        console.error("Error getting chatbot response:", error);
        throw new Error("Failed to get response from AI. Please check your API key and network connection.");
    }
};


export const evaluateAnswer = async (question: string, answer: string): Promise<{ score: number; feedback: string; }> => {
    const prompt = `
        You are an expert CBSE teacher. Evaluate the following student's answer for the given question.
        Provide a detailed evaluation and a score out of 10.

        **Question:** ${question}
        **Student's Answer:** ${answer}
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "Your response MUST be a valid JSON object with two keys: 'score' (a number from 0 to 10) and 'feedback' (your detailed feedback as a string).",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.NUMBER, description: "The score out of 10." },
                        feedback: { type: Type.STRING, description: "Detailed feedback for the student." }
                    },
                    required: ["score", "feedback"]
                }
            }
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        
        if (typeof result.score !== 'number' || typeof result.feedback !== 'string') {
            throw new Error("AI response did not match the expected schema.");
        }
        return result;
    } catch (error) {
        console.error("Error evaluating answer:", error);
        throw new Error("Failed to evaluate answer with AI. Please try again.");
    }
};

export const generateDetailedFeedback = async (question: string, answer: string): Promise<DetailedAiFeedback> => {
    const prompt = `
        You are an expert CBSE teacher providing constructive feedback on a student's answer. 
        Analyze the answer for its strengths and weaknesses, and provide a concrete suggestion for improvement.
        Keep each section concise (1-2 sentences).

        **Question:** ${question}
        **Student's Answer:** ${answer}
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "Your response MUST be a valid JSON object with three keys: 'strengths', 'weaknesses', and 'suggestion', each containing a string.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        strengths: { type: Type.STRING },
                        weaknesses: { type: Type.STRING },
                        suggestion: { type: Type.STRING }
                    },
                    required: ["strengths", "weaknesses", "suggestion"]
                }
            }
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating detailed feedback:", error);
        throw new Error("Failed to generate feedback with AI.");
    }
};

export const generateTestQuestion = async (courseTitle: string, classLevel: number, subject: string, chapterTitle: string): Promise<{ title: string, question: string }> => {
    const prompt = `
        Based on the following details for a CBSE class, generate a test title and one thought-provoking, subjective question.
        The question should assess deep understanding of the chapter's core concepts, not just factual recall.

        - **Course:** ${courseTitle}
        - **Class:** ${classLevel}
        - **Subject:** ${subject}
        - **Chapter:** ${chapterTitle}
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are an expert CBSE curriculum designer for Indian schools. Your task is to create a single, high-quality, subjective (long-form answer) test question. Your response MUST be a valid JSON object with two keys: 'title' (a concise test title) and 'question' (the text of the question).",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        question: { type: Type.STRING }
                    },
                    required: ["title", "question"]
                }
            }
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating test question:", error);
        throw new Error("Failed to generate question with AI. Please try again.");
    }
};

export const generateFullQuiz = async (
    chapter: Chapter,
    course: Course,
    config: { numMCQ: number; numTF: number; numSubjective: number }
): Promise<{ title: string; questions: GeneratedQuestion[] }> => {
    
    const materialContext = chapter.materials.map(m => {
        if (m.type === 'text') return `Title: ${m.title}\nContent: ${m.content}`;
        return `Title of material (file or video): ${m.title}`;
    }).join('\n\n');

    const prompt = `
        **Context:** You are creating a quiz for a CBSE Class ${course.classLevel} ${course.subject} course titled "${course.title}". 
        The quiz is for the chapter "${chapter.title}".
        
        **Available Chapter Materials:**
        ---
        ${materialContext || "No specific materials provided. Rely on general knowledge for the topic."}
        ---

        **Task:** Generate a full quiz based on the provided materials.
        
        **Quiz Configuration:**
        - Number of Multiple-Choice Questions (MCQ): ${config.numMCQ}
        - Number of True/False Questions: ${config.numTF}
        - Number of Subjective Questions: ${config.numSubjective}
        
        **Instructions:**
        1.  Create a concise, relevant title for the quiz.
        2.  For MCQs, provide 4 distinct options and identify the correct one.
        3.  For True/False, the correct answer is either "True" or "False".
        4.  Ensure all questions are relevant to the chapter title and provided materials.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are an expert CBSE curriculum designer. Generate a quiz as a valid JSON object matching the provided schema.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        questions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    text: { type: Type.STRING },
                                    type: { type: Type.STRING, enum: ['subjective', 'mcq', 'true-false'] },
                                    options: { type: Type.ARRAY, items: { type: Type.STRING }, nullable: true },
                                    correctAnswer: { type: Type.STRING, nullable: true }
                                },
                                required: ['text', 'type']
                            }
                        }
                    },
                    required: ['title', 'questions']
                }
            }
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating full quiz:", error);
        throw new Error("Failed to generate quiz with AI. Please try again.");
    }
};

export const generateFocusPlan = async (
    submissions: (TestSubmission & { test: { questions: Question[] } })[], 
    course: Course
): Promise<FocusPlan> => {

    const performanceData = submissions.map(sub => {
        return {
            testTitle: sub.test.questions[0] ? course.chapters.find(c => c.id === sub.chapterId)?.test?.title : "Unknown Test",
            score: sub.score,
            questions: sub.test.questions.map(q => {
                const answer = sub.answers.find(a => a.questionId === q.id);
                return {
                    question: q.text,
                    studentAnswer: answer?.answer,
                    correctAnswer: q.correctAnswer,
                };
            })
        };
    });

    const materialContext = course.chapters.flatMap(c => c.materials).map(m => ` - ${m.title} (${m.type})`).join('\n');

    const prompt = `
        **Context:** You are a personalized AI tutor. Analyze the following performance data for a student in the course "${course.title}".

        **Available Course Materials:**
        ${materialContext}

        **Student Performance Data:**
        ${JSON.stringify(performanceData, null, 2)}

        **Task:**
        1.  Write a brief, encouraging summary of the student's overall performance.
        2.  Identify up to 3 specific concepts or "focus areas" where the student is weakest, based on incorrect answers.
        3.  For each focus area, provide a constructive suggestion for improvement.
        4.  For each focus area, recommend specific, relevant materials from the list above that the student should review.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        focusAreas: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    concept: { type: Type.STRING },
                                    relevantMaterials: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                title: { type: Type.STRING },
                                                type: { type: Type.STRING, enum: ['file', 'text', 'video'] }
                                            }
                                        }
                                    },
                                    suggestion: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating focus plan:", error);
        throw new Error("Failed to generate focus plan with AI.");
    }
};

export const generateClassInsights = async (
    test: { title: string, questions: Question[] },
    submissions: TestSubmission[],
    course: Course
): Promise<ClassInsights> => {
    
    const analysisData = submissions.map(sub => ({
        studentId: sub.studentId,
        score: sub.score,
        answers: sub.answers
    }));

    const prompt = `
        **Context:** You are an expert instructional analyst. Analyze the collective student performance on a test for the course "${course.title}".

        **Test Title:** "${test.title}"
        **Test Questions:**
        ${JSON.stringify(test.questions, null, 2)}

        **Aggregated Student Submissions:**
        ${JSON.stringify(analysisData, null, 2)}

        **Task:**
        1.  Provide a concise summary of the class's overall performance on this test.
        2.  Identify up to 3 common misconceptions or concepts the class struggled with the most.
        3.  For each misconception, provide a brief analysis of *why* students might be struggling.
        4.  For each misconception, provide 1-2 anonymous examples of incorrect student answers that illustrate the issue.
        5.  Provide a list of 2-3 concrete teaching recommendations for the teacher to address these problem areas.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        overallSummary: { type: Type.STRING },
                        commonMisconceptions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    concept: { type: Type.STRING },
                                    analysis: { type: Type.STRING },
                                    studentExamples: { type: Type.ARRAY, items: { type: Type.STRING } }
                                }
                            }
                        },
                        teachingRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating class insights:", error);
        throw new Error("Failed to generate class insights with AI.");
    }
};

export const detectPlagiarism = async (text: string): Promise<{ similarityScore: number; report: string; }> => {
    const prompt = `
        You are an academic integrity expert. Analyze the following text for plagiarism. Check for similarity against common knowledge sources and writing styles.
        Provide a similarity score from 0 to 100 and a brief report explaining your findings. A score above 70 indicates a high likelihood of plagiarism.

        **Text to Analyze:**
        ---
        ${text}
        ---
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "Your response MUST be a valid JSON object with two keys: 'similarityScore' (a number from 0 to 100) and 'report' (your brief analysis as a string).",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        similarityScore: { type: Type.NUMBER, description: "The similarity score from 0 to 100." },
                        report: { type: Type.STRING, description: "A brief report on the findings." }
                    },
                    required: ["similarityScore", "report"]
                }
            }
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error detecting plagiarism:", error);
        throw new Error("Failed to run plagiarism check with AI.");
    }
};

export const generateContentFromUrl = async (url: string): Promise<{ summary: string; }> => {
    // NOTE: This is a simulation. In a real application, you'd need a backend service to fetch the URL content
    // and pass it to the AI, as client-side fetching is blocked by CORS for most websites.
    
    const prompt = `
        You are an expert at summarizing web content for educational purposes. 
        I am providing you with a URL. Please provide a concise summary of the key points from the content at this URL, suitable for class notes.
        Assume you have already fetched the content from this URL: ${url}
        
        **Simulated Content (as you cannot access external URLs):**
        "The mitochondria is the powerhouse of the cell. It generates most of the cell's supply of adenosine triphosphate (ATP), used as a source of chemical energy. It was first described by Richard Altmann in 1890. The structure consists of an outer membrane, an inner membrane, and the mitochondrial matrix."

        Based on this simulated content, provide your summary.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "Your response MUST be a valid JSON object with one key: 'summary'.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING }
                    },
                    required: ["summary"]
                }
            }
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating content from URL:", error);
        throw new Error("Failed to generate content with AI. Note: This is a simulation.");
    }
};

export const explainTextDifferently = async (text: string, mode: 'simple' | 'example' | 'quiz'): Promise<string> => {
    let prompt = '';
    let systemInstruction = 'You are a helpful teaching assistant. Provide a concise and clear response.';

    switch(mode) {
        case 'simple':
            prompt = `Explain the following concept in simple terms, as if you were talking to a 10-year-old:\n\n---\n${text}\n---`;
            break;
        case 'example':
            prompt = `Provide a clear, real-world example to illustrate the following concept:\n\n---\n${text}\n---`;
            break;
        case 'quiz':
            prompt = `Create one multiple-choice question to test understanding of the following concept. Provide the question, 4 options, and indicate the correct answer:\n\n---\n${text}\n---`;
            systemInstruction = "Your response MUST be a valid JSON object with keys: 'question', 'options' (an array of 4 strings), and 'correctAnswer' (a string).";
            break;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: mode === 'quiz' ? {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        correctAnswer: { type: Type.STRING }
                    },
                    required: ["question", "options", "correctAnswer"]
                }
            } : { systemInstruction }
        });
        return response.text.trim();
    } catch (error) {
        console.error(`Error in explainTextDifferently (mode: ${mode}):`, error);
        throw new Error("Failed to get explanation from AI.");
    }
};

export const generateStudyPlan = async (goal: string, targetDate: string, performanceData: any, todayStr?: string): Promise<StudyPlan> => {
    const prompt = `
        **Context:** You are an expert AI academic coach. A student needs a personalized study plan.

        **Today's Date:** ${todayStr || new Date().toISOString().split('T')[0]}
        **Student's Goal:** ${goal}
        **Target Completion Date:** ${targetDate}

        **Student's Recent Performance Data (lower scores indicate weakness):**
        ${JSON.stringify(performanceData, null, 2)}

        **Task:**
        1. Create a structured, day-by-day study schedule from today until the target date.
        2. Prioritize topics where the student has lower scores.
        3. Include a mix of activities: reviewing notes, watching videos, and completing practice questions.
        4. Keep the daily tasks manageable. Include rest days if the schedule spans more than a week.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are an AI academic coach. Your response MUST be a valid JSON object matching the provided schema.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        goal: { type: Type.STRING },
                        schedule: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    date: { type: Type.STRING, description: "The date for the tasks, e.g., 'Day 1: Mon, Oct 23'" },
                                    tasks: { type: Type.ARRAY, items: { type: Type.STRING } }
                                }
                            }
                        }
                    },
                    required: ['goal', 'schedule']
                }
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating study plan:", error);
        throw new Error("Failed to generate study plan with AI.");
    }
};


export const generateLessonPlan = async (objective: string): Promise<LessonPlan> => {
    const prompt = `
        **Context:** You are an expert CBSE instructional designer. A teacher needs a lesson plan.
        **Learning Objective:** ${objective}
        **Task:** Create a structured lesson plan including a title, the original objective, 3-4 engaging activities with durations, and 3 discussion questions.
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "Your response MUST be a valid JSON object matching the provided schema.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        objective: { type: Type.STRING },
                        activities: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    duration: { type: Type.NUMBER }
                                }
                            }
                        },
                        discussionQuestions: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ['title', 'objective', 'activities', 'discussionQuestions']
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating lesson plan:", error);
        throw new Error("Failed to generate lesson plan with AI.");
    }
};

export const generateCareerReport = async (studentData: any): Promise<CareerCounselorReport> => {
    const prompt = `
        **Context:** You are an AI Career Counselor. Analyze the student's data to provide a career report.
        **Student Data:** ${JSON.stringify(studentData, null, 2)}
        **Task:** Generate a report with a summary, strengths, 2-3 suggested careers with descriptions, and a list of recommended university program types.
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                        suggestedCareers: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    match: { type: Type.STRING, enum: ['High', 'Medium'] }
                                }
                            }
                        },
                        recommendedPrograms: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating career report:", error);
        throw new Error("Failed to generate career report with AI.");
    }
};

export const generateContentModality = async (text: string, mode: 'summary' | 'infographic' | 'audio'): Promise<string> => {
    let prompt = '';
    if (mode === 'summary') {
        prompt = `Summarize the following text into 3 key bullet points:\n\n---\n${text}\n---`;
    } else if (mode === 'infographic') {
        prompt = `Describe the key visual elements for an infographic that explains the following text. Focus on 3-4 main points and suggest icons or charts.\n\n---\n${text}\n---`;
    } else { // audio
        prompt = `Write a short, engaging podcast script (approx. 100 words) that explains the following text:\n\n---\n${text}\n---`;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating content modality:", error);
        throw new Error("Failed to generate content with AI.");
    }
};

// This is a simulation function for the adaptive pathway
export const getAdaptivePathwayStep = async (lastSubmission: TestSubmission | undefined) => {
    await new Promise(res => setTimeout(res, 500)); // Simulate AI thinking
    if (!lastSubmission || typeof lastSubmission.score === 'undefined') {
        return { action: 'continue' };
    }
    if (lastSubmission.score >= 8) {
        return { action: 'skip' };
    }
    if (lastSubmission.score < 5) {
        return { action: 'remedial' };
    }
    return { action: 'continue' };
};