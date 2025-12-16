const axios = require('axios');
const faqs = require('./faqs.json');

class LLMService {
  constructor() {
    // You can use OpenAI, Anthropic, or any other LLM API
    // For this demo, we'll use a mock implementation with OpenAI-compatible format
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.apiUrl = process.env.LLM_API_URL || 'https://api.openai.com/v1/chat/completions';
    this.model = process.env.LLM_MODEL || 'gpt-3.5-turbo';
  }

  // Search FAQs for relevant information
  searchFAQs(query) {
    const queryLower = query.toLowerCase();
    const relevantFAQs = faqs.filter(faq => {
      const questionMatch = faq.question.toLowerCase().includes(queryLower);
      const answerMatch = faq.answer.toLowerCase().includes(queryLower);
      const categoryMatch = faq.category.toLowerCase().includes(queryLower);

      // Check for keyword matches
      const queryWords = queryLower.split(' ').filter(word => word.length > 3);
      const hasKeywordMatch = queryWords.some(word =>
        faq.question.toLowerCase().includes(word) ||
        faq.answer.toLowerCase().includes(word)
      );

      return questionMatch || answerMatch || categoryMatch || hasKeywordMatch;
    });

    return relevantFAQs.slice(0, 3); // Return top 3 relevant FAQs
  }

  // Build context from conversation history
  buildContext(conversationHistory) {
    if (!conversationHistory || conversationHistory.length === 0) {
      return '';
    }

    return conversationHistory
      .map(msg => `${msg.role === 'user' ? 'Customer' : 'Agent'}: ${msg.content}`)
      .join('\n');
  }

  // Create system prompt with FAQs context
  createSystemPrompt(relevantFAQs) {
    let faqContext = '';
    if (relevantFAQs.length > 0) {
      faqContext = '\n\nRelevant FAQs:\n' + relevantFAQs
        .map(faq => `Q: ${faq.question}\nA: ${faq.answer}`)
        .join('\n\n');
    }

    return `You are a helpful customer support agent. Your goal is to assist customers with their questions and issues in a friendly, professional manner.

Guidelines:
- Be concise, helpful, and empathetic
- Use the provided FAQ information when relevant
- If you don't know the answer or the question is complex, suggest escalating to a human agent
- Maintain context from previous messages in the conversation
- Be proactive in offering solutions
- If a customer seems frustrated or has a complex issue, recommend escalation${faqContext}`;
  }

  // Determine if query should be escalated
  shouldEscalate(query, conversationHistory) {
    const escalationKeywords = [
      'speak to human', 'human agent', 'real person', 'manager',
      'supervisor', 'escalate', 'complaint', 'legal', 'lawsuit',
      'frustrated', 'angry', 'terrible service', 'worst',
      'cancel account', 'delete account', 'refund immediately'
    ];

    const queryLower = query.toLowerCase();
    const hasEscalationKeyword = escalationKeywords.some(keyword =>
      queryLower.includes(keyword)
    );

    // Check if conversation is getting too long without resolution
    const isLongConversation = conversationHistory && conversationHistory.length > 8;

    // Check for repeated similar questions
    const hasRepeatedQuestions = conversationHistory &&
      conversationHistory.length > 4 &&
      conversationHistory.slice(-4).filter(msg => msg.role === 'user').length >= 3;

    return {
      shouldEscalate: hasEscalationKeyword || (isLongConversation && hasRepeatedQuestions),
      reason: hasEscalationKeyword ? 'customer_request' :
              isLongConversation ? 'unresolved_issue' :
              hasRepeatedQuestions ? 'repeated_queries' : 'none'
    };
  }

  // Generate response using LLM (with fallback to rule-based)
  async generateResponse(query, conversationHistory = []) {
    try {
      // Search for relevant FAQs
      const relevantFAQs = this.searchFAQs(query);

      // Check if escalation is needed
      const escalationCheck = this.shouldEscalate(query, conversationHistory);
      if (escalationCheck.shouldEscalate) {
        return {
          response: "I understand this is important to you. Let me connect you with a human agent who can better assist you with this matter. Please hold while I transfer you to our support team.",
          escalate: true,
          reason: escalationCheck.reason,
          confidence: 'high'
        };
      }

      // If API key is available, use LLM
      if (this.apiKey) {
        return await this.generateLLMResponse(query, conversationHistory, relevantFAQs);
      } else {
        // Fallback to rule-based response
        return this.generateRuleBasedResponse(query, relevantFAQs);
      }
    } catch (error) {
      console.error('Error generating response:', error.message);
      // Fallback to rule-based response
      const relevantFAQs = this.searchFAQs(query);
      return this.generateRuleBasedResponse(query, relevantFAQs);
    }
  }

  // Generate response using actual LLM API
  async generateLLMResponse(query, conversationHistory, relevantFAQs) {
    const systemPrompt = this.createSystemPrompt(relevantFAQs);
    const contextString = this.buildContext(conversationHistory);

    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history
    if (conversationHistory.length > 0) {
      conversationHistory.slice(-6).forEach(msg => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });
    }

    // Add current query
    messages.push({ role: 'user', content: query });

    const response = await axios.post(
      this.apiUrl,
      {
        model: this.model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 300
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );

    const aiResponse = response.data.choices[0].message.content;

    return {
      response: aiResponse,
      escalate: false,
      confidence: 'high',
      source: 'llm'
    };
  }

  // Rule-based response generation (fallback)
  generateRuleBasedResponse(query, relevantFAQs) {
    if (relevantFAQs.length > 0) {
      const topFAQ = relevantFAQs[0];
      let response = topFAQ.answer;

      // Add personalization
      if (relevantFAQs.length > 1) {
        response += `\n\nRelated: ${relevantFAQs[1].question}`;
      }

      return {
        response: response,
        escalate: false,
        confidence: 'medium',
        source: 'faq'
      };
    }

    // No relevant FAQ found
    return {
      response: "I apologize, but I don't have specific information about that. Let me connect you with a human agent who can better assist you with your question.",
      escalate: true,
      reason: 'no_answer_found',
      confidence: 'low',
      source: 'fallback'
    };
  }

  // Summarize conversation for escalation
  summarizeConversation(conversationHistory) {
    if (!conversationHistory || conversationHistory.length === 0) {
      return 'No conversation history available.';
    }

    const summary = conversationHistory
      .map((msg, idx) => `${idx + 1}. ${msg.role === 'user' ? 'Customer' : 'Bot'}: ${msg.content}`)
      .join('\n');

    return `Conversation Summary:\n${summary}\n\nTotal messages: ${conversationHistory.length}`;
  }
}

module.exports = new LLMService();
