require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('crypto');
const sessionManager = require('../SessionMangament/sessionManager');
const llmService = require('../LLM/llmService');
const faqs = require('../FAQs/faqs.json');
const router = require('../routes/botRouter');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'AI Customer Support Bot API',
    version: '1.0.0',
    features: [
      'FAQ-based response matching',
      'LLM-powered contextual responses',
      'Redis-based conversation history',
      'Automatic escalation detection',
      'Session management'
    ],
    endpoints: {
      'POST /api/session/new': 'Create a new session',
      'POST /api/chat': 'Send a message and get AI response (requires sessionId)',
      'GET /api/session/:sessionId': 'Get session details with conversation history',
      'DELETE /api/session/:sessionId': 'End a session',
      'POST /api/session/:sessionId/escalate': 'Manually escalate a session',
      'GET /api/sessions': 'Get all active sessions',
      'GET /api/faqs': 'Get all FAQs (optional ?category filter)',
      'GET /api/health': 'Health check endpoint'
    }
  });
});


app.use('/api' , router);

setInterval(() => {
  sessionManager.cleanupOldSessions();
  console.log('Cleaned up old sessions');
}, 60 * 60 * 1000);


app.listen(PORT, () => {
  console.log(`AI Customer Support Bot server running on port ${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}`);
});