const Resume = require('../models/Resume');
const { parseResumeFile } = require('../utils/fileParser');
const { analyzeResumeWithGemini } = require('../services/geminiService');
const { calculateAtsScore } = require('../services/atsScoreService');
const { extractKeywords } = require('../services/keywordService');

const analyzeResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No resume file provided'
            });
        }

        const { jobDescription } = req.body;
        if (!jobDescription) {
            return res.status(400).json({ 
                success: false,
                error: 'Job description is required' 
            });
        }

        // Create initial resume record with default values
        const resume = new Resume({
            user: req.userId,
            resumeStatus: 'processing'
        });

        try {
            // Parse resume file
            const resumeText = await parseResumeFile(req.file);
            if (!resumeText) {
                throw new Error('Failed to parse resume file');
            }

            // Update resume with parsed text
            resume.resumeText = resumeText;
            resume.resumeStatus = 'parsed';

            // Analyze with Gemini
            const analysisResult = await analyzeResumeWithGemini(resumeText, jobDescription);
            if (!analysisResult || analysisResult.error) {
                throw new Error(analysisResult?.error || 'Gemini analysis failed');
            }

            // Calculate ATS score
            const atsScore = calculateAtsScore(resumeText, jobDescription);
            
            // Extract keywords
            const resumeKeywords = extractKeywords(resumeText);
            const jobKeywords = extractKeywords(jobDescription);
            const commonKeywords = [...new Set(
                resumeKeywords.filter(keyword => jobKeywords.includes(keyword))
            )];

            // Final update with all analysis results
            Object.assign(resume, {
                atsScore,
                keywords: commonKeywords,
                suggestions: analysisResult.suggestions || [],
                missingKeywords: analysisResult.missingKeywords || [],
                scoreBreakdown: analysisResult.scoreBreakdown || {},
                resumeStatus: 'completed'
            });

            // Save the complete resume document
            await resume.save();

            return res.status(200).json({
                success: true,
                resumeId: resume._id,
                atsScore: resume.atsScore,
                keywords: resume.keywords,
                suggestions: resume.suggestions,
                missingKeywords: resume.missingKeywords,
                scoreBreakdown: resume.scoreBreakdown
            });

        } catch (error) {
            // Update resume with error status
            resume.resumeStatus = 'failed';
            resume.error = error.message;
            await resume.save();

            return res.status(500).json({
                success: false,
                error: 'Failed to analyze resume',
                details: error.message
            });
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Server error',
            details: error.message
        });
    }
};

const getUserResumes = async (req, res) => {
    try {
        const resumes = await Resume.find({ user: req.userId })
            .sort({ createdAt: -1 })
            .select('-resumeText -__v'); // Exclude large text field and version key

        return res.status(200).json({
            success: true,
            count: resumes.length,
            resumes
        });
    } catch (error) {
        return res.status(500).json({ 
            success: false,
            error: 'Failed to fetch resumes',
            details: error.message 
        });
    }
};

module.exports = {
    analyzeResume,
    getUserResumes
};