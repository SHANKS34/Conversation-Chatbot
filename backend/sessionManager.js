// In-memory session storage
class SessionManager {
  constructor() {
    this.sessions = new Map();
  }

  // Create a new session
  createSession(sessionId) {
    const session = {
      id: sessionId,
      conversationHistory: [],
      createdAt: new Date(),
      lastActivity: new Date(),
      escalated: false,
      metadata: {}
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  // Get session by ID
  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  // Get or create session
  getOrCreateSession(sessionId) {
    if (!this.sessions.has(sessionId)) {
      return this.createSession(sessionId);
    }
    const session = this.sessions.get(sessionId);
    session.lastActivity = new Date();
    return session;
  }

  // Add message to conversation history
  addMessage(sessionId, role, content) {
    const session = this.getOrCreateSession(sessionId);
    session.conversationHistory.push({
      role,
      content,
      timestamp: new Date()
    });
    return session;
  }

  // Get conversation history
  getHistory(sessionId, limit = 10) {
    const session = this.getSession(sessionId);
    if (!session) return [];

    // Return last 'limit' messages for context
    return session.conversationHistory.slice(-limit);
  }

  // Mark session as escalated
  escalateSession(sessionId, reason) {
    const session = this.getSession(sessionId);
    if (session) {
      session.escalated = true;
      session.escalationReason = reason;
      session.escalationTime = new Date();
    }
    return session;
  }

  // Check if session is escalated
  isEscalated(sessionId) {
    const session = this.getSession(sessionId);
    return session ? session.escalated : false;
  }

  // Delete session
  deleteSession(sessionId) {
    return this.sessions.delete(sessionId);
  }

  // Get all active sessions
  getActiveSessions() {
    return Array.from(this.sessions.values());
  }

  // Clean up old sessions (older than 24 hours)
  cleanupOldSessions() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.lastActivity < oneDayAgo) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

module.exports = new SessionManager();
