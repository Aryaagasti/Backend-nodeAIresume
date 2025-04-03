const natural = require('natural');
const stopwords = require('natural').stopwords;
const { WordTokenizer } = natural;

const tokenizer = new WordTokenizer();

const extractKeywords = (text) => {
  if (!text || typeof text !== 'string') return [];
  
  try {
    // Tokenize and process text
    const tokens = tokenizer.tokenize(text.toLowerCase());
    const keywords = tokens
      .filter(token => token.length > 2 && !stopwords.includes(token))
      .map(token => natural.PorterStemmer.stem(token));
    
    // Get most common keywords
    const keywordCounts = {};
    keywords.forEach(keyword => {
      keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
    });
    
    return Object.entries(keywordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([keyword]) => keyword);

  } catch (error) {
    console.error('Keyword extraction error:', error);
    return [];
  }
};

module.exports = {
  extractKeywords
};