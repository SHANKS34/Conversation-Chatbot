require('dotenv').config();
const Redis = require('ioredis');

class RedisClient {
  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    this.client.on('connect', () => {
      console.log('[RedisClient] Connected to Redis');
    });

    this.client.on('error', (err) => {
      console.error('[RedisClient] Redis error:', err);
    });
  }

  async saveConversationHistory(sessionId, history) {
    try {
      const key = `session:${sessionId}:history`;
      await this.client.set(key, JSON.stringify(history), 'EX', 86400); // 24 hour expiry
      return true;
    } catch (error) {
      console.error('[RedisClient] Error saving conversation history:', error);
      return false;
    }
  }

  async getConversationHistory(sessionId) {
    try {
      const key = `session:${sessionId}:history`;
      const history = await this.client.get(key);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('[RedisClient] Error getting conversation history:', error);
      return [];
    }
  }

  async addMessage(sessionId, role, content) {
    try {
      const history = await this.getConversationHistory(sessionId);
      history.push({
        role,
        content,
        timestamp: new Date().toISOString()
      });
      await this.saveConversationHistory(sessionId, history);
      return history;
    } catch (error) {
      console.error('[RedisClient] Error adding message:', error);
      return [];
    }
  }

  async deleteSession(sessionId) {
    try {
      const key = `session:${sessionId}:history`;
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('[RedisClient] Error deleting session:', error);
      return false;
    }
  }

  async getAllSessionKeys() {
    try {
      const keys = await this.client.keys('session:*:history');
      return keys.map(key => key.split(':')[1]); // Extract session IDs
    } catch (error) {
      console.error('[RedisClient] Error getting all session keys:', error);
      return [];
    }
  }

  async disconnect() {
    await this.client.quit();
  }
}

module.exports = new RedisClient();
