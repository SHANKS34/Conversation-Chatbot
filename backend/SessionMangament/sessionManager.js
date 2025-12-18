const redisClient = require('../Redis/redisClient');

class SessionManager {
  constructor() {
    this.sessions = new Map(); 
  }

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

  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  getOrCreateSession(sessionId) {
    if (!this.sessions.has(sessionId)) {
      return this.createSession(sessionId);
    }
    const session = this.sessions.get(sessionId);
    session.lastActivity = new Date();
    return session;
  }

  async addMessage(sessionId, role, content) {
    const session = this.getOrCreateSession(sessionId);
    await redisClient.addMessage(sessionId, role, content);
    return session;
  }

  async getHistory(sessionId, limit = 10) {
    const history = await redisClient.getConversationHistory(sessionId);
    console.log("HISTORY " , history);
    return history.slice(-limit);
  }

  escalateSession(sessionId, reason) {
    const session = this.getSession(sessionId);
    if (session) {
      session.escalated = true;
      session.escalationReason = reason;
      session.escalationTime = new Date();
    }
    return session;
  }

  isEscalated(sessionId) {
    const session = this.getSession(sessionId);
    return session ? session.escalated : false;
  }

  async deleteSession(sessionId) {
    await redisClient.deleteSession(sessionId);
    return this.sessions.delete(sessionId);
  }

  async getActiveSessions() {
    const sessions = Array.from(this.sessions.values());

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
