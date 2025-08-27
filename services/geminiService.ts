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
    // Attempt to fetch the raw page content (will work only if CORS allows). Otherwise we fall back gracefully.
    const cleanUrl = url.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) {
        throw new Error("URL must start with http:// or https://");
    }

    const fallbackSummary = `Could not fetch the page content (likely CORS blocked). Provide a manual summary of: ${cleanUrl}`;

    if (!API_KEY) {
        return { summary: fallbackSummary + " (Add VITE_GEMINI_API_KEY for AI summarization.)" };
    }

    // Fetch & extract text
    let extractedText = '';
    try {
        let res = await fetch(cleanUrl, { method: 'GET' });
        if (!res.ok) throw new Error('Status ' + res.status);
        let html = await res.text();
        // If result looks like an access denied or extremely short, retry via local proxy
        if (html.length < 500 || /denied|forbidden|captcha/i.test(html)) {
            try {
                const proxyRes = await fetch(`http://localhost:5174/proxy?url=${encodeURIComponent(cleanUrl)}`);
                if (proxyRes.ok) {
                    html = await proxyRes.text();
                }
            } catch (proxyErr) {
                console.warn('Proxy fetch failed', proxyErr);
            }
        }
        // Remove scripts/styles and tags
        extractedText = html
            .replace(/<script[\s\S]*?<\/script>/gi, ' ')
            .replace(/<style[\s\S]*?<\/style>/gi, ' ')
            .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
            .replace(/<[^>]+>/g, ' ') // strip tags
            .replace(/&[a-z#0-9]+;/gi, ' ')
            .replace(/\s+/g, ' ') // collapse whitespace
            .trim();
    } catch (err) {
        console.warn('Fetch failed or CORS blocked; using fallback simulation.', err);
    }

    if (!extractedText) {
        return { summary: fallbackSummary };
    }

    // Limit size to avoid token overuse
    const MAX_CHARS = 6000; // ~ a few thousand tokens max
    if (extractedText.length > MAX_CHARS) {
        extractedText = extractedText.slice(0, MAX_CHARS) + ' ...';
    }

    const prompt = `Summarize the following webpage content into a concise (80-120 words) study note with bullet-like clarity (no actual bullets needed), focusing only on the central ideas.\n\nURL: ${cleanUrl}\n\nCONTENT:\n"""${extractedText}"""`;

    const parseJsonSafe = (raw: string): { summary: string } => {
        let text = raw.trim();
        if (text.startsWith('```')) {
            text = text.replace(/^```\w*\n/, '').replace(/```$/,'').trim();
        }
        try { return JSON.parse(text); } catch {}
        const match = text.match(/\{[\s\S]*\}/);
        if (match) { try { return JSON.parse(match[0]); } catch {} }
        return { summary: text };
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "Return ONLY valid JSON: { \"summary\": string }.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { summary: { type: Type.STRING } },
                    required: ["summary"]
                }
            }
        });
        const parsed = parseJsonSafe(response.text);
        if (!parsed.summary) return { summary: fallbackSummary };
        return parsed;
    } catch (error) {
        console.error('AI summarization failed:', error);
        return { summary: fallbackSummary + ' (AI error)' };
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

// Generate a concise test performance summary highlighting strengths & focus areas
export const generateTestPerformanceSummary = async (
    test: { title: string; questions: Question[] },
    submissions: TestSubmission[],
    course: Course
): Promise<{ strengths: string[]; focusAreas: string[]; overall: string; suggestedActions: string[]; }> => {
    const graded = submissions.filter(s => typeof s.score === 'number');
    const scores = graded.map(s => s.score as number);
    const avg = scores.length ? (scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(2) : '0';
    const median = scores.length ? (scores.length % 2 ? [...scores].sort((a,b)=>a-b)[Math.floor(scores.length/2)] : (([...scores].sort((a,b)=>a-b)[scores.length/2-1] + [...scores].sort((a,b)=>a-b)[scores.length/2]) / 2)) : 0;
    const prompt = `You are an assessment analyst. Provide a JSON summary for the test "${test.title}" in course "${course.title}".
Test questions: ${JSON.stringify(test.questions)}
Graded submissions with (studentId hidden) scores: ${JSON.stringify(graded.map(g=>({score:g.score, answers:g.answers}))) }
Average score: ${avg}, Median score: ${median}.
Return JSON with keys: overall (string, 2 sentences), strengths (string[] 2-4 concise learning areas students did well), focusAreas (string[] 2-4 areas needing improvement), suggestedActions (string[] 2-4 actionable teacher strategies).`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        overall: { type: Type.STRING },
                        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                        focusAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
                        suggestedActions: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ['overall','strengths','focusAreas','suggestedActions']
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (err) {
        console.error('Error generating test performance summary', err);
        throw new Error('Failed to generate test performance summary');
    }
};

// ==== Vision: Analyze uploaded test answer images and extract answers ====
export const analyzeTestAnswerImages = async (
    test: { questions: Question[] },
    files: File[]
): Promise<Record<string,string>> => {
    if (!API_KEY) throw new Error('Gemini API key missing');
    if (!files.length) return {};

    // Build question descriptor
    const questionDescriptor = test.questions.map((q, i) => {
        if (q.type === 'mcq') {
            const opts = (q.options || []).map((o, idx) => `${String.fromCharCode(65+idx)}. ${o}`).join('\n');
            return `${i+1}. (MCQ) ${q.text}\n${opts}`;
        }
        if (q.type === 'true-false') return `${i+1}. (True/False) ${q.text}`;
        return `${i+1}. (Subjective) ${q.text}`;
    }).join('\n\n');

    const systemInstruction = `You are an exam paper transcription assistant. You receive photos or scans of a student's completed answer sheets. Extract the student's answers.
Return ONLY strict JSON with this shape (no extra keys, no commentary): {
    "answers": [
        { "index": <number 1-based question index>, "answer": <string> }
    ]
}
Rules:
- For MCQ: answer should be the LETTER (A-D) only. If multiple marked, choose the clearest. If uncertain, use "".
- For True/False: answer must be exactly "True" or "False" (capitalization exact). If unclear leave empty string.
- For Subjective: provide the full transcribed answer, preserving paragraphs (use \n). Clean obvious OCR noise.
- Do not invent content. Empty string if unreadable.`;

    // Convert files to inlineData parts
    const imageParts: any[] = [];
    for (const file of files) {
        try {
            let mime = file.type || 'image/jpeg';
            // If PDF, we currently skip (handled earlier via canvas). Caller should rasterize first for best results.
            const buf = await file.arrayBuffer();
            const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
            imageParts.push({ inlineData: { mimeType: mime, data: b64 } });
        } catch (e) {
            console.warn('Failed to encode file for vision', e);
        }
    }
    if (!imageParts.length) return {};

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: systemInstruction },
                        { text: 'QUESTIONS:\n' + questionDescriptor },
                        ...imageParts
                    ]
                }
            ],
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        answers: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    index: { type: Type.NUMBER },
                                    answer: { type: Type.STRING }
                                },
                                required: ['index','answer']
                            }
                        }
                    },
                    required: ['answers']
                }
            }
        });
        const raw = response.text.trim();
        const parsed = JSON.parse(raw);
        const map: Record<string,string> = {};
        if (Array.isArray(parsed.answers)) {
            parsed.answers.forEach((a: any) => {
                if (!a || typeof a.index !== 'number' || a.index < 1 || a.index > test.questions.length) return;
                const q = test.questions[a.index - 1];
                if (!q) return;
                let val = typeof a.answer === 'string' ? a.answer.trim() : '';
                if (q.type === 'mcq') {
                    // Accept letter; map to option
                        if (/^[A-D]$/i.test(val) && q.options) {
                            const opt = q.options[val.toUpperCase().charCodeAt(0)-65];
                            if (opt) val = opt; else val='';
                        } else if (q.options) {
                            // Try to match option text
                            const found = q.options.find(o => o.toLowerCase() === val.toLowerCase());
                            if (found) val = found; else val='';
                        }
                } else if (q.type === 'true-false') {
                    if (!/^True|False$/i.test(val)) val=''; else val = val.charAt(0).toUpperCase()+val.slice(1).toLowerCase();
                }
                map[q.id] = val;
            });
        }
        return map;
    } catch (err:any) {
        console.error('Vision answer extraction failed', err);
        throw new Error('Gemini vision extraction failed: ' + err.message);
    }
};