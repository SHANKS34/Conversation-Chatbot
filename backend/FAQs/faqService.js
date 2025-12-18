const faqs = require('./faqs.json');

class FAQService {
  constructor() {
    this.faqs = faqs;
    console.log('[FAQService] Loaded', this.faqs.length, 'FAQs');
  }
  searchFAQs(query) {
    const queryLower = query.toLowerCase();
    const matches = [];

    this.faqs.forEach(faq => {
      const questionLower = faq.question.toLowerCase();
      const answerLower = faq.answer.toLowerCase();
      let score = 0;
      const queryWords = queryLower.split(/\s+/).filter(word => word.length > 3);

      queryWords.forEach(word => {
        if (questionLower.includes(word)) {
          score += 3; 
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

    matches.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return matches;
  }

  findBestMatch(query, threshold = 3) {
    const matches = this.searchFAQs(query);

    if (matches.length > 0 && matches[0].relevanceScore >= threshold) {
      return matches[0];
    }

    return null;
  }

  getFAQsByCategory(category) {
    return this.faqs.filter(faq => faq.category === category);
  }

  getCategories() {
    return [...new Set(this.faqs.map(faq => faq.category))];
  }

  getAllFAQs() {
    return this.faqs;
  }
}
module.exports = new FAQService();
