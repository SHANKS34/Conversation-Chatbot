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
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Get or create session
    const currentSessionId = sessionId || generateSessionId();
    const session = sessionManager.getOrCreateSession(currentSessionId);
    
    // Check if session is already escalated
    if (session.escalated) {
      return res.json({
        success: true,
        response: 'This conversation has been escalated to a human agent. Please wait for an agent to assist you.',
        sessionId: currentSessionId,
        escalated: true
      });
    }

    // Add user message to history
    sessionManager.addMessage(currentSessionId, 'user', message);

    // Get conversation history
    const conversationHistory = sessionManager.getHistory(currentSessionId);

    // Generate AI response
    const aiResult = await llmService.generateResponse(message, conversationHistory);

    // Add AI response to history
    sessionManager.addMessage(currentSessionId, 'assistant', aiResult.response);

    // Handle escalation
    if (aiResult.escalate) {
      sessionManager.escalateSession(currentSessionId, aiResult.reason || 'user_request');

      return res.json({
        success: true,
        response: aiResult.response,
        sessionId: currentSessionId,
        escalated: true,
        escalationReason: aiResult.reason,
        conversationSummary: llmService.summarizeConversation(conversationHistory)
      });
    }

    res.json({
      success: true,
      response: aiResult.response,
      sessionId: currentSessionId,
      escalated: false,
      confidence: aiResult.confidence,
      source: aiResult.source
    });

  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred processing your message',
      details: error.message
    });
  }
});

// Get session details
app.get('/api/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = sessionManager.getSession(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    res.json({
      success: true,
      session: {
        id: session.id,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        escalated: session.escalated,
        escalationReason: session.escalationReason,
        messageCount: session.conversationHistory.length,
        conversationHistory: session.conversationHistory
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
app.delete('/api/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const deleted = sessionManager.deleteSession(sessionId);

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
app.get('/api/sessions', (req, res) => {
  try {
    const sessions = sessionManager.getActiveSessions();
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