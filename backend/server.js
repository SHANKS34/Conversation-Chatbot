require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('crypto');
const sessionManager = require('./sessionManager');
const llmService = require('./llmService');
const faqs = require('./faqs.json');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to generate session ID
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'AI Customer Support Bot API',
    version: '1.0.0',
    endpoints: {
      'POST /api/chat': 'Send a message and get AI response',
      'GET /api/session/:sessionId': 'Get session details',
      'DELETE /api/session/:sessionId': 'End a session',
      'GET /api/faqs': 'Get all FAQs',
      'GET /api/sessions': 'Get all active sessions',
      'POST /api/session/new': 'Create a new session'
    }
  });
});

// Create new session
app.post('/api/session/new', (req, res) => {
  try {
    const sessionId = generateSessionId();
    const session = sessionManager.createSession(sessionId);

    res.json({
      success: true,
      sessionId: session.id,
      message: 'New session created'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Main chat endpoint
app.post("/api/chat", async (req, res) => {
  const { message, sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({
      success: false,
      error: 'sessionId is required'
    });
  }

  try {
    // Get conversation history from Redis (last 10 messages for context)
    const conversationHistory = await sessionManager.getHistory(sessionId, 10);

    // Save user message to Redis
    await sessionManager.addMessage(sessionId, 'user', message);

    // Generate response with context
    const result = await llmService.generateResponse(message, conversationHistory);

    // Save assistant response to Redis
    await sessionManager.addMessage(sessionId, 'assistant', result.response);

    res.json({
      success: true,
      response: result.response,
      source: result.source,
      sessionId: sessionId
    });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// Get session details
app.get('/api/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = sessionManager.getSession(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Get conversation history from Redis
    const conversationHistory = await sessionManager.getHistory(sessionId);

    res.json({
      success: true,
      session: {
        id: session.id,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        escalated: session.escalated,
        escalationReason: session.escalationReason,
        messageCount: conversationHistory.length,
        conversationHistory: conversationHistory
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete/end session
app.delete('/api/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const deleted = await sessionManager.deleteSession(sessionId);

    if (deleted) {
      res.json({
        success: true,
        message: 'Session ended successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all FAQs
app.get('/api/faqs', (req, res) => {
  try {
    const { category } = req.query;

    let filteredFAQs = faqs;
    if (category) {
      filteredFAQs = faqs.filter(faq => faq.category === category);
    }

    // Get unique categories
    const categories = [...new Set(faqs.map(faq => faq.category))];

    res.json({
      success: true,
      faqs: filteredFAQs,
      categories,
      total: filteredFAQs.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all active sessions (for admin/monitoring)
app.get('/api/sessions', async (req, res) => {
  try {
    const sessions = await sessionManager.getActiveSessions();
    const sessionsSummary = sessions.map(session => ({
      id: session.id,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
      escalated: session.escalated,
      messageCount: session.conversationHistory.length
    }));

    res.json({
      success: true,
      sessions: sessionsSummary,
      total: sessions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// Cleanup old sessions periodically (every hour)
setInterval(() => {
  sessionManager.cleanupOldSessions();
  console.log('Cleaned up old sessions');
}, 60 * 60 * 1000);

// Start server
app.listen(PORT, () => {
  console.log(`AI Customer Support Bot server running on port ${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}`);
});