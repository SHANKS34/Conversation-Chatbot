require("dotenv").config();
const { Ollama } = require("ollama");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const faqService = require("../FAQs/faqService");
const redisClient = require("../Redis/redisClient");
class LLMService {
  constructor() {
   
    this.useGemini = !!process.env.GEMINI_API_KEY;
     
    if (this.useGemini) {
      console.log("[LLMService] Mode: Cloud (Gemini 1.5 Flash)");
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    } else {
      console.log("[LLMService] Mode: Local (Ollama)");
      this.ollamaClient = new Ollama({
        host: process.env.OLLAMA_HOST || 'http://localhost:11434'
      });
      this.model = process.env.OLLAMA_MODEL || 'llama3.1';
    }
  }

  async generateResponse(message, conversationHistory = [] , sessionId) {
    try {
     
      const faqMatch = faqService.findBestMatch(message);
      if (faqMatch) {
        return { response: faqMatch.answer, source: "faq", confidence: "high" };
      }
      
      const Context = await redisClient.getConversationHistory(sessionId);
      
      console.log("Sending the context to LLM " , Context); 

      const systemMsg = `You are a helpful customer support assistant. 
      Use this chathistory for reference: ${Context}.
      If you cannot answer confidently based on the context, say: "I'm not sure. Let me connect you with a human agent."`;

      let responseText = "";

      if (this.useGemini) {
        const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const history = conversationHistory.map(msg => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        }));

        const chat = model.startChat({ history, systemInstruction: systemMsg });
        const result = await chat.sendMessage(message);
        responseText = result.response.text();
      } else {
        // --- Ollama Local Mode (FOR YOUR DEVELOPMENT) ---
        const messages = [{ role: 'system', content: systemMsg }, ...conversationHistory, { role: 'user', content: message }];
        const response = await this.ollamaClient.chat({ model: this.model, messages, stream: false });
        responseText = response.message.content;
      }

      const needsEscalation = this.detectEscalationNeed(responseText);
      
      return {
        response: responseText,
        source: this.useGemini ? "gemini" : "ollama",
        needsEscalation: needsEscalation,
        confidence: needsEscalation ? "low" : "medium"
      };

    } catch (err) {
      console.error("[LLMService Error]", err.message);
      return { 
        response: "I'm having trouble. Let me transfer you to a human agent.", 
        source: "error", 
        needsEscalation: true 
      };
    }
  }

  detectEscalationNeed(responseText) {
    const keywords = ["human agent", "not sure", "don't know", "transfer", "unable to"];
    return keywords.some(key => responseText.toLowerCase().includes(key));
  }
}

module.exports = new LLMService();