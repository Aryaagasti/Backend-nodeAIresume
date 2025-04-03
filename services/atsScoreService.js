const { extractKeywords } = require("../services/keywordService")

const calculateAtsScore = (resumeText, jobDescription) => {
    if (!resumeText || !jobDescription || typeof resumeText !== "string" || typeof jobDescription !== 'string') {
        return 0
    }
    try {
        const resumeKeywords = extractKeywords(resumeText)
        const jobKeywords = extractKeywords(jobDescription)

        //calculate the ats score based on keywords matching
        const matchedKeywords = resumeKeywords.filter(keyword => resumeKeywords.includes(keyword))
        const matchPercentage = matchedKeywords.length > 0 ? (matchedKeywords.length / jobKeywords.length) * 100 : 0;

        //base score on keyword mathch (0-770 poinsts)
        let score = Math.min(70, matchPercentage * 0.7);

        //ad points for resume lengths (0-10)
        const wordCount = resumeText.split(/\s+/).length;
        if (wordCount > 500) score += 10;
        else if (wordCount > 300) score += 7
        else if (wordCount > 100) score += 5

        // Add points for sections (0-20 points)
        const sections = ['experience', 'education', 'skills', 'projects'];
        const hasSection = section =>
            resumeText.toLowerCase().includes(section);
        score += sections.filter(hasSection).length * 5;

        return Math.round(Math.min(100, score));
    } catch (error) {
        console.error('ATS score calculation error:', error);
        return 0; // Return minimum score on error

    }
}

module.exports = {
    calculateAtsScore,
}