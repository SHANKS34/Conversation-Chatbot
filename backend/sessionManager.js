const redisClient = require('./redisClient');

// Hybrid session storage - Redis for conversation history, in-memory for session metadata
class SessionManager {
  constructor() {
    this.sessions = new Map(); // For session metadata
  }

  // Create a new session
  createSession(sessionId) {
    const session = {
      id: sessionId,
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

  // Add message to conversation history (now stored in Redis)
  async addMessage(sessionId, role, content) {
    const session = this.getOrCreateSession(sessionId);
    await redisClient.addMessage(sessionId, role, content);
    return session;
  }

  // Get conversation history from Redis
  async getHistory(sessionId, limit = 10) {
    const history = await redisClient.getConversationHistory(sessionId);

    // Return last 'limit' messages for context
    return history.slice(-limit);
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

  // Delete session (both from memory and Redis)
  async deleteSession(sessionId) {
    await redisClient.deleteSession(sessionId);
    return this.sessions.delete(sessionId);
  }

  // Get all active sessions
  async getActiveSessions() {
    const sessions = Array.from(this.sessions.values());

    // Enrich with conversation history from Redis
    const enrichedSessions = await Promise.all(
      sessions.map(async (session) => {
        const history = await redisClient.getConversationHistory(session.id);
        return {
          ...session,
          conversationHistory: history
        };
      })
    );

    return enrichedSessions;
  }

  // Clean up old sessions (older than 24 hours)
  cleanupOldSessions() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.lastActivity < oneDayAgo) {
        this.sessions.delete(sessionId);
        // Redis keys automatically expire after 24 hours
      }
    }
  }
}

module.exports = new SessionManager();
