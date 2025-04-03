const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GEMINI_API_KEY } = require('../config/jwt');

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const analyzeResumeWithGemini = async (resumeText, jobDescription) => {
  // Validate inputs
  if (!resumeText || !jobDescription || 
      typeof resumeText !== 'string' || 
      typeof jobDescription !== 'string') {
    return {
      error: 'Invalid input',
      details: 'Both resumeText and jobDescription must be non-empty strings'
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `
      Analyze this resume against the following job description and provide:
      1. Suggestions for improvement (array of strings)
      2. Missing keywords (array of strings)
      3. Score breakdown (object with: keywords, experience, education, formatting)
      
      Important: Return ONLY valid JSON format without any markdown or code formatting.
      
      Resume:
      ${resumeText.substring(0, 20000)} [truncated if too long]
      
      Job Description:
      ${jobDescription.substring(0, 10000)} [truncated if too long]
      
      Required JSON format:
      {
        "suggestions": [],
        "missingKeywords": [],
        "scoreBreakdown": {
          "keywords": 0,
          "experience": 0,
          "education": 0,
          "formatting": 0
        }
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response and parse JSON
    const cleanText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText);

  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      error: 'Failed to analyze resume',
      details: error.message,
      suggestions: [],
      missingKeywords: [],
      scoreBreakdown: {
        keywords: 0,
        experience: 0,
        education: 0,
        formatting: 0
      }
    };
  }
};

module.exports = {
  analyzeResumeWithGemini
};