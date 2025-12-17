require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

class LLMService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;

    console.log("[LLMService] Using Gemini Responses API");
    console.log("[LLMService] Key present?", !!this.apiKey);

    this.client = new GoogleGenAI({
      apiKey: this.apiKey
    });
  }

  async generateResponse(message, conversationHistory = []) {
    try {
      // Build context-aware prompt
      let contextualPrompt = message;

      if (conversationHistory.length > 0) {
        // Format conversation history for context
        const historyContext = conversationHistory
          .map(msg => `${msg.role}: ${msg.content}`)
          .join('\n');

        contextualPrompt = `Previous conversation:\n${historyContext}\n\nCurrent user message: ${message}`;
      }

      const result = await this.client.responses.create({
        model: "gemini-1.5-pro",
        input: contextualPrompt
      });

      return {
        response: result.output_text,
        source: "gemini"
      };
    } catch (err) {
      console.error("========== GEMINI ERROR ==========");
      console.error(err);
      console.error("err.message:", err?.message);
      console.error("=================================");

      return {
        response: "Gemini failed",
        source: "error"
      };
    }
  }
}

module.exports = new LLMService();
