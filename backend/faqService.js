const faqs = require('./faqs.json');

class FAQService {
  constructor() {
    this.faqs = faqs;
    console.log('[FAQService] Loaded', this.faqs.length, 'FAQs');
  }

  // Simple keyword-based search
  searchFAQs(query) {
    const queryLower = query.toLowerCase();
    const matches = [];

    this.faqs.forEach(faq => {
      const questionLower = faq.question.toLowerCase();
      const answerLower = faq.answer.toLowerCase();

      // Calculate a simple relevance score
      let score = 0;

      // Check if query words are in question or answer
      const queryWords = queryLower.split(/\s+/).filter(word => word.length > 3);

      queryWords.forEach(word => {
        if (questionLower.includes(word)) {
          score += 3; // Question matches are more valuable
        }
        if (answerLower.includes(word)) {
          score += 1;
        }
      });

      if (score > 0) {
        matches.push({
          ...faq,
          relevanceScore: score
        });
      }
    });

    // Sort by relevance score
    matches.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return matches;
  }

  // Find best matching FAQ
  findBestMatch(query, threshold = 3) {
    const matches = this.searchFAQs(query);

    if (matches.length > 0 && matches[0].relevanceScore >= threshold) {
      return matches[0];
    }

    return null;
  }

  // Get FAQ by category
  getFAQsByCategory(category) {
    return this.faqs.filter(faq => faq.category === category);
  }

  // Get all categories
  getCategories() {
    return [...new Set(this.faqs.map(faq => faq.category))];
  }

  // Get all FAQs
  getAllFAQs() {
    return this.faqs;
  }
}

module.exports = new FAQService();
