require("dotenv").config();
const { Ollama } = require("ollama");
const faqService = require("./faqService");

class LLMService {
  constructor() {
    console.log("[LLMService] Using Ollama");

    this.client = new Ollama({
      host: process.env.OLLAMA_HOST || 'http://localhost:11434'
    });

    this.model = process.env.OLLAMA_MODEL || 'llama2';
    console.log("[LLMService] Model:", this.model);
  }

  async generateResponse(message, conversationHistory = []) {
    try {
      // Step 1: Check FAQs first
      const faqMatch = faqService.findBestMatch(message);

      if (faqMatch) {
        console.log("[LLMService] FAQ match found:", faqMatch.question);
        return {
          response: faqMatch.answer,
          source: "faq",
          faqId: faqMatch.id,
          faqQuestion: faqMatch.question,
          confidence: "high"
        };
      }

      console.log("[LLMService] No FAQ match, using LLM");

      // Step 2: Build messages array for Ollama chat format
      const messages = [];

      // Add system prompt with FAQ context
      const allFAQs = faqService.getAllFAQs();
      const faqContext = allFAQs.map(faq => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n');

      messages.push({
        role: 'system',
        content: `You are a helpful customer support assistant. Here are the frequently asked questions for reference:\n\n${faqContext}\n\nIf the user's question is related to these FAQs, provide relevant information. If you cannot answer confidently, say "I'm not sure about that. Let me connect you with a human agent who can help."`
      });

      // Add conversation history
      if (conversationHistory.length > 0) {
        conversationHistory.forEach(msg => {
          messages.push({
            role: msg.role,
            content: msg.content
          });
        });
      }

      // Add current user message
      messages.push({
        role: 'user',
        content: message
      });

      const response = await this.client.chat({
        model: this.model,
        messages: messages,
        stream: false
      });

      const responseText = response.message.content;

      // Check if LLM suggests escalation
      const needsEscalation = this.detectEscalationNeed(responseText);

      return {
        response: responseText,
        source: "ollama",
        confidence: needsEscalation ? "low" : "medium",
        needsEscalation: needsEscalation
      };
    } catch (err) {
      console.error("========== OLLAMA ERROR ==========");
      console.error(err);
      console.error("err.message:", err?.message);
      console.error("=================================");

      return {
        response: "I'm having trouble processing your request. Let me connect you with a human agent.",
        source: "error",
        needsEscalation: true,
        confidence: "low"
      };
    }
  }

  detectEscalationNeed(responseText) {
    const escalationKeywords = [
      "i'm not sure",
      "i don't know",
      "i cannot",
      "human agent",
      "connect you with",
      "let me transfer",
      "i'm unable to"
    ];

    const responseLower = responseText.toLowerCase();
    return escalationKeywords.some(keyword => responseLower.includes(keyword));
  }
}

module.exports = new LLMService();
