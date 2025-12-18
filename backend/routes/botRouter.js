const express = require('express');
const router = express.Router();
const sessionManager = require('../SessionMangament/sessionManager');
const llmService = require('../LLM/llmService');
const faqs = require('../FAQs/faqs.json');

function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

router.post('/session/new', (req, res) => {
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


router.post("/chat", async (req, res) => {
  const { message, sessionId } = req.body;
   
  if (!sessionId) {
    return res.status(400).json({
      success: false,
      error: 'sessionId is required'
    });
  }

  try {
    const conversationHistory = await sessionManager.getHistory(sessionId, 10);
     await sessionManager.addMessage(sessionId, 'user', message);

    const result = await llmService.generateResponse(message, conversationHistory , sessionId);

    await sessionManager.addMessage(sessionId, 'assistant', result.response);
    
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


router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = sessionManager.getSession(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

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

router.delete('/session/:sessionId', async (req, res) => {
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

router.post('/session/:sessionId/escalate', (req, res) => {
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

router.get('/faqs', (req, res) => {
  try {
    const { category } = req.query;

    let filteredFAQs = faqs;
    if (category) {
      filteredFAQs = faqs.filter(faq => faq.category === category);
    }

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

router.get('/sessions', async (req, res) => {
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


router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

module.exports = router;