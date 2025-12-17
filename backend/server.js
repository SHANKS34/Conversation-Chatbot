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

    // Check for auto-escalation
    let escalated = false;
    if (result.needsEscalation && !sessionManager.isEscalated(sessionId)) {
      const escalationReason = result.confidence === 'low'
        ? 'Bot unable to answer query confidently'
        : 'User query requires human assistance';

      sessionManager.escalateSession(sessionId, escalationReason);
      escalated = true;
      console.log(`[AUTO-ESCALATION] Session ${sessionId} escalated: ${escalationReason}`);
    }

    res.json({
      success: true,
      response: result.response,
      source: result.source,
      sessionId: sessionId,
      escalated: escalated,
      confidence: result.confidence,
      faqMatched: result.source === 'faq',
      faqId: result.faqId || null
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

// Escalate session manually
app.post('/api/session/:sessionId/escalate', (req, res) => {
  try {
    const { sessionId } = req.params;
    const { reason } = req.body;

    const session = sessionManager.getSession(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    if (session.escalated) {
      return res.json({
        success: true,
        message: 'Session already escalated',
        alreadyEscalated: true,
        session: {
          id: session.id,
          escalated: session.escalated,
          escalationReason: session.escalationReason,
          escalationTime: session.escalationTime
        }
      });
    }

    const escalationReason = reason || 'User requested human assistance';
    sessionManager.escalateSession(sessionId, escalationReason);

    console.log(`[MANUAL ESCALATION] Session ${sessionId} escalated: ${escalationReason}`);

    res.json({
      success: true,
      message: 'Session escalated successfully',
      session: {
        id: sessionId,
        escalated: true,
        escalationReason: escalationReason,
        escalationTime: new Date()
      }
    });
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