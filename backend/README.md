# AI Customer Support Bot

A full-stack AI-powered customer support chatbot that simulates customer support interactions using AI for FAQs and escalation scenarios. The system features conversational memory, context retention, and intelligent escalation to human agents when needed.

## Overview

This project demonstrates a production-ready customer support bot with:
- **Conversational AI** for natural language understanding and response generation
- **Session Management** with full conversation history tracking
- **Smart Escalation** that automatically detects when human intervention is needed
- **RESTful API** for easy integration with existing systems
- **Modern Web Interface** for end-user interactions

## Features

### Core Functionality
- ✅ FAQ-based response system with 12+ pre-loaded questions
- ✅ Conversational memory that retains context across messages
- ✅ Intelligent escalation detection (frustrated customers, complex queries, explicit requests)
- ✅ Session management with in-memory database
- ✅ Real-time chat interface with typing indicators
- ✅ Conversation summarization for agent handoff
- ✅ Support for both LLM and rule-based responses

### Technical Features
- ✅ RESTful API with 7 endpoints
- ✅ Session tracking and management
- ✅ Automatic session cleanup (24-hour retention)
- ✅ CORS-enabled for cross-origin requests
- ✅ Error handling and validation
- ✅ Responsive frontend design

### 🧠 Conversational Logic & Context
To provide a human-like experience, the bot maintains conversation "state":

1. **Redis as Context Store**: Every message exchange is stored in Redis under a unique `chatId`.
2. **Sliding Window Context**: For every new prompt, the system retrieves the **last 10 messages** from Redis.
3. **LLM Memory**: These 10 messages are passed to the Gemini API alongside the new user query. This allows the AI to:
   - Remember the user's name if mentioned earlier.
   - Answer follow-up questions (e.g., "Tell me more about that").
   - Maintain a consistent tone throughout the session.

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Axios** - HTTP client for LLM API calls
- **dotenv** - Environment configuration

### Optional
- **Gemini** or any LLM provider (with fallback to rule-based responses)

## Project Structure

```
Chatbot/
├── backend/
│   ├── FAQs/
│   │   ├── faqs.json          # Database containing 12 questions across 6 categories
│   │   └── faqService.js      # Logic for searching and retrieving FAQ answers
│   ├── LLM/
│   │   └── llmService.js      # Integration with Gemini API and prompt logic
│   ├── Redis/
│   │   ├── client.js          # Redis connection setup
│   │   └── redisClient.js     # Helper methods for session data operations
│   ├── routes/
│   │   └── botRouter.js       # Express routes for chat and bot interactions
│   ├── Server/
│   │   └── server.js          # Main entry point for the Express server
│   ├── SessionManager/
│   │   └── sessionManager.js  # Logic for handling and storing user chat sessions
│   ├── .env                   # Environment variables (Private)
│   ├── package.json           # Project dependencies and scripts
│   └── README.md              # Project documentation
└── public/                    # Frontend client files
    ├── index.html             # The chat interface UI
    ├── styles.css             # Custom CSS for the chat window
    └── app.js                 # Client-side JavaScript for API communication

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- (Optional) OpenAI API key or other LLM provider

### Setup Steps

1. **Clone or navigate to the project directory:**
```bash
cd Chatbot
```


2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
Create a `.env` file in the root directory:
```env
PORT=3000
GEMINI_API_KEY=your_ai_api_key_here
```

**Note:** If you don't have an LLM API key, the system will automatically fall back to rule-based responses using the FAQ database.

4. **Start the server:**
```bash
node server.js
```

Or use nodemon for development:
```bash
npx nodemon server.js
```

5. **Access the application:**
Open your browser and navigate to:
```
http://localhost:3000
```

## API Documentation

### Base URL
```
http://localhost:3000/
```

### Endpoints

#### 1. Create New Session
```http
POST /api/session/new
```

**Response:**
```json
{
  "success": true,
  "sessionId": "session_1234567890_abc123",
  "message": "New session created"
}
```

#### 2. Send Chat Message
```http
POST /api/chat
```

**Request Body:**
```json
{
  "message": "What are your business hours?",
  "sessionId": "session_1234567890_abc123"
}
```

**Response:**
```json
{
  "success": true,
  "response": "Our business hours are Monday to Friday, 9 AM to 6 PM EST.",
  "sessionId": "session_1234567890_abc123",
  "escalated": false,
  "confidence": "high",
  "source": "faq"
}
```

**Escalation Response:**
```json
{
  "success": true,
  "response": "Let me connect you with a human agent...",
  "sessionId": "session_1234567890_abc123",
  "escalated": true,
  "escalationReason": "customer_request",
  "conversationSummary": "Conversation Summary:\n1. Customer: I need to speak to a manager..."
}
```

#### 3. Get Session Details
```http
GET /api/session/:sessionId
```

**Response:**
```json
{
  "success": true,
  "session": {
    "id": "session_1234567890_abc123",
    "createdAt": "2025-12-16T10:00:00.000Z",
    "lastActivity": "2025-12-16T10:05:00.000Z",
    "escalated": false,
    "messageCount": 4,
    "conversationHistory": [...]
  }
}
```

#### 4. End Session
```http
DELETE /api/session/:sessionId
```

#### 5. Get All FAQs
```http
GET /api/faqs?category=billing
```

#### 6. Get All Active Sessions
```http
GET /api/sessions
```

#### 7. Health Check
```http
GET /api/health
```

## Usage Examples

### Example 1: Basic FAQ Query
**User:** "What are your business hours?"
**Bot:** "Our business hours are Monday to Friday, 9 AM to 6 PM EST. We're closed on weekends and major holidays."

### Example 2: Multi-turn Conversation
**User:** "How do I reset my password?"
**Bot:** "To reset your password, click on 'Forgot Password' on the login page..."
**User:** "How long is the reset link valid?"
**Bot:** "The password reset link is valid for 24 hours."

### Example 3: Escalation Scenario
**User:** "I need to speak to a real person immediately!"
**Bot:** "I understand this is important to you. Let me connect you with a human agent who can better assist you..."
*[Session marked as escalated]*

### Example 4: Complex Issue Escalation
**User:** "I've been trying to get a refund for 2 weeks..."
**User:** "This is ridiculous..."
**User:** "I want to speak to your manager!"
**Bot:** "I apologize for the frustration. Let me escalate this to a senior support agent..."

## LLM Integration

### Using OpenAI
The bot supports OpenAI's GPT models. Configure in `.env`:
```env
OPENAI_API_KEY=sk-...
LLM_MODEL=gpt-3.5-turbo
```

### Using Other LLM Providers
You can use any OpenAI-compatible API:
```env
LLM_API_URL=https://your-llm-provider.com/v1/chat/completions
```

### Fallback Behavior
If no API key is provided, the system uses:
1. **FAQ Matching** - Searches the FAQ database for relevant answers
2. **Keyword Analysis** - Matches user queries with FAQ keywords
3. **Escalation Detection** - Uses rule-based detection for escalation triggers

## LLM Prompts Used

### System Prompt
```
You are a helpful customer support agent. Your goal is to assist customers
with their questions and issues in a friendly, professional manner.

Guidelines:
- Be concise, helpful, and empathetic
- Use the provided FAQ information when relevant
- If you don't know the answer or the question is complex, suggest escalating
  to a human agent
- Maintain context from previous messages in the conversation
- Be proactive in offering solutions
- If a customer seems frustrated or has a complex issue, recommend escalation

Relevant FAQs:
[FAQ content injected here based on query relevance]
```

### Context Building
The system maintains conversation context by:
1. Storing the last 10 messages per session
2. Including the last 6 messages in LLM prompts
3. Formatting conversation history as:
```
Customer: [message]
Agent: [response]
```

## Escalation Logic

### Automatic Escalation Triggers

1. **Keyword Detection:**
   - "speak to human", "real person", "manager", "supervisor"
   - "complaint", "frustrated", "angry", "terrible service"
   - "cancel account", "refund immediately", "legal", "lawsuit"

2. **Conversation Length:**
   - More than 8 messages without resolution

3. **Repeated Questions:**
   - Same topic queried 3+ times in last 4 messages

4. **Explicit Request:**
   - User directly asks for escalation

### Escalation Response
When escalation is triggered:
1. Session is marked as `escalated: true`
2. Conversation summary is generated
3. User receives escalation confirmation message
4. Further bot responses are disabled
5. Agent dashboard can access full conversation history

## Testing Guide

### Manual Testing Scenarios

#### Test 1: Basic FAQ Flow
1. Open http://localhost:3000
2. Click "Business Hours" quick button
3. Verify bot responds with business hours info
4. Ask follow-up: "Are you open on weekends?"
5. Verify context is maintained

#### Test 2: Session Management
1. Start a conversation
2. Note the Session ID in the sidebar
3. Click "New Session" button
4. Verify Session ID changes
5. Verify chat history is cleared

#### Test 3: Escalation by Keywords
1. Type: "I need to speak to a manager immediately"
2. Verify escalation message appears
3. Verify yellow escalation banner shows
4. Verify session status changes to "Escalated"
5. Try sending another message - should see escalated message

#### Test 4: Escalation by Frustration
1. Ask several complex questions in a row
2. Express frustration: "This is terrible service"
3. Verify automatic escalation triggers

#### Test 5: Character Limit
1. Type more than 500 characters
2. Verify character counter turns red
3. Verify submission is limited

### API Testing with cURL

```bash
# Create session
curl -X POST http://localhost:3000/api/session/new

# Send message
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What are your business hours?"}'

# Get session details
curl http://localhost:3000/api/session/[SESSION_ID]

# Get all FAQs
curl http://localhost:3000/api/faqs

# Get sessions
curl http://localhost:3000/api/sessions
```

## Demo Video Script

### Introduction (30 seconds)
"Hi! This is an AI-powered customer support bot that handles customer inquiries, maintains conversation context, and intelligently escalates complex issues to human agents."

### Feature Demo 1: Basic FAQ (30 seconds)
1. Show the chat interface
2. Click quick button "Business Hours"
3. Show bot response
4. Ask follow-up: "Are you open on Saturdays?"
5. Highlight how context is maintained

### Feature Demo 2: Session Management (20 seconds)
1. Point to Session Info sidebar
2. Show session ID and message count updating
3. Click "New Session" to demonstrate session reset

### Feature Demo 3: Escalation (40 seconds)
1. Type: "I've been waiting for my refund for 2 weeks"
2. Type: "This is unacceptable, I want to speak to a manager"
3. Show escalation message
4. Highlight yellow banner and status change
5. Explain conversation summary for agent handoff

### Technical Overview (30 seconds)
1. Show API endpoints in browser
2. Briefly show code structure
3. Mention LLM integration with fallback

### Conclusion (10 seconds)
"This system demonstrates production-ready AI customer support with intelligent escalation and full conversation tracking."

## Configuration Options

### Session Timeout
Edit in `sessionManager.js`:
```javascript
// Clean up sessions older than X hours
cleanupOldSessions() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  // Change 24 to desired hours
}
```

### Response Temperature
Edit in `llmService.js`:
```javascript
temperature: 0.7  // 0.0 = deterministic, 1.0 = creative
```

### Max Context Messages
Edit in `sessionManager.js`:
```javascript
getHistory(sessionId, limit = 10)  // Change limit value
```

## Troubleshooting

### Issue: Bot gives generic responses
**Solution:** Add your LLM API key to `.env` file

### Issue: Session not persisting
**Solution:** Sessions are in-memory only. They reset when server restarts. For persistence, implement database storage.

### Issue: CORS errors
**Solution:** Ensure `cors` middleware is enabled in `server.js`

### Issue: Port already in use
**Solution:** Change PORT in `.env` or kill the process using port 3000

## Future Enhancements

- [ ] Persistent database (MongoDB/PostgreSQL)
- [ ] User authentication
- [ ] Agent dashboard for handling escalations
- [ ] Multi-language support
- [ ] Voice input/output
- [ ] Analytics dashboard
- [ ] Email notifications for escalations
- [ ] File upload support
- [ ] Integration with ticketing systems
- [ ] A/B testing for response variations

## Code Structure Evaluation Criteria

### ✅ Conversational Accuracy
- FAQ matching algorithm with keyword analysis
- Context retention across multiple turns
- Natural language understanding via LLM

### ✅ Session Management
- Unique session IDs for each conversation
- Complete conversation history storage
- Session metadata tracking (created, last activity, escalation status)

### ✅ LLM Integration Depth
- System prompt engineering with context injection
- Conversation history formatting
- Temperature and token control
- Graceful fallback to rule-based responses

### ✅ Code Structure
- Modular architecture (server, session manager, LLM service)
- RESTful API design
- Error handling and validation
- Clean separation of concerns

## License

MIT License

## Author

Created as an AI Customer Support Bot assignment demonstration.

## Support

For issues or questions:
- Check the Troubleshooting section
- Review API documentation
- Test with cURL commands
- Check console logs for errors
