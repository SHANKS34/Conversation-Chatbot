# AI Customer Support Bot - Final Setup Guide

## Project Overview

A complete AI-powered customer support chatbot with:
- **Backend:** Node.js + Express API (7 REST endpoints)
- **Frontend:** React 18 + Tailwind CSS
- **Features:** Session management, conversation memory, intelligent escalation

---

## Quick Start

### Prerequisites
- Node.js (v14+)
- npm

### Step 1: Install Backend Dependencies

```bash
# In root directory
npm install
```

### Step 2: Install Frontend Dependencies

```bash
cd frontend
npm install
```

### Step 3: Start Backend Server

```bash
# In root directory (Terminal 1)
node server.js
```

Output:
```
AI Customer Support Bot server running on port 3000
API Documentation: http://localhost:3000
```

### Step 4: Start React Frontend

```bash
# In frontend directory (Terminal 2)
npm start
```

The React app will automatically open at **http://localhost:3001**

---

## Project Structure

```
Chatbot/
├── frontend/                    # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatMessage.jsx
│   │   │   ├── TypingIndicator.jsx
│   │   │   ├── QuickActions.jsx
│   │   │   ├── SessionInfo.jsx
│   │   │   └── FAQList.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.js
│   │   └── index.css
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env
│
├── server.js                    # Express API Server
├── sessionManager.js            # Session Management
├── llmService.js               # LLM Integration
├── faqs.json                   # FAQ Database
├── test.js                     # Test Suite
├── package.json                # Backend Dependencies
├── .env                        # Backend Config
│
└── Documentation/
    ├── README.md               # Full Documentation
    ├── REACT_FRONTEND_SETUP.md # Frontend Setup
    ├── DEMO_GUIDE.md          # Demo Instructions
    ├── PROJECT_SUMMARY.md     # Assignment Report
    └── QUICKSTART.md          # Quick Start
```

---

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
node server.js
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Access Points

- **Frontend UI:** http://localhost:3001
- **Backend API:** http://localhost:3000
- **API Documentation:** http://localhost:3000 (GET)

---

## Features

### Frontend (React + Tailwind)

✅ **Modern UI**
- Beautiful purple gradient design
- Smooth animations and transitions
- Responsive layout (mobile, tablet, desktop)

✅ **Real-time Chat**
- Send/receive messages
- Typing indicators
- Auto-scroll
- Message timestamps

✅ **Session Management**
- Auto-create sessions
- Track message count
- View session ID
- Start new sessions

✅ **Quick Actions**
- Pre-defined question buttons
- One-click messaging
- FAQ sidebar integration

✅ **Escalation Handling**
- Visual warning banner
- Status indicator
- Conversation summary for agents

### Backend (Node.js + Express)

✅ **REST API**
- 7 comprehensive endpoints
- CORS enabled
- Error handling
- Input validation

✅ **Session Tracking**
- In-memory database
- Conversation history (last 10 messages)
- Auto-cleanup (24 hours)

✅ **LLM Integration**
- OpenAI API support
- Rule-based fallback
- Context retention
- Response generation

✅ **Smart Escalation**
- Keyword detection
- Sentiment analysis
- Conversation length monitoring
- Pattern recognition

---

## API Endpoints

### 1. Create Session
```bash
POST /api/session/new
```

### 2. Send Message
```bash
POST /api/chat
Body: { "message": "...", "sessionId": "..." }
```

### 3. Get Session
```bash
GET /api/session/:sessionId
```

### 4. End Session
```bash
DELETE /api/session/:sessionId
```

### 5. Get FAQs
```bash
GET /api/faqs
```

### 6. Get All Sessions
```bash
GET /api/sessions
```

### 7. Health Check
```bash
GET /api/health
```

---

## Testing

### Run Backend Tests
```bash
npm test
```

Expected output:
```
✓ Health check endpoint working
✓ Session created
✓ Chat endpoint working
✓ Conversation memory working
✓ Session retrieval working
✓ Escalation detection working
✓ FAQs endpoint working
✓ Active sessions list working

🎉 All tests passed!
```

### Manual Frontend Testing

1. **Basic Chat:**
   - Type: "What are your business hours?"
   - Press Enter
   - Verify response

2. **Quick Actions:**
   - Click "Business Hours" button
   - Verify auto-send

3. **Conversation Memory:**
   - Ask: "How do I reset my password?"
   - Then: "How long is the link valid?"
   - Verify context retention

4. **Escalation:**
   - Type: "I need to speak to a manager"
   - Verify yellow banner appears
   - Verify input is disabled

5. **New Session:**
   - Click "New Session"
   - Confirm dialog
   - Verify history clears

---

## Configuration

### Backend (.env in root)
```env
PORT=3000
OPENAI_API_KEY=your_key_here  # Optional
LLM_API_URL=https://api.openai.com/v1/chat/completions
LLM_MODEL=gpt-3.5-turbo
```

### Frontend (frontend/.env)
```env
REACT_APP_API_URL=http://localhost:3000
```

---

## Production Build

### Build React Frontend
```bash
cd frontend
npm run build
```

Creates optimized build in `frontend/build/`

### Serve Production Build
```bash
npx serve -s build -p 3001
```

### Deploy Backend
```bash
# Start with PM2
pm2 start server.js --name chatbot-backend

# Or with node
node server.js
```

---

## Technology Stack

### Frontend
- React 18.2.0
- Tailwind CSS 3.4.0
- Axios 1.6.0
- React Scripts 5.0.1

### Backend
- Node.js
- Express.js 5.2.1
- Axios 1.13.2
- CORS 2.8.5
- dotenv 17.2.3

---

## Available Scripts

### Backend
```bash
npm start      # Start server
npm run dev    # Start with nodemon
npm test       # Run tests
```

### Frontend
```bash
npm start      # Development server
npm run build  # Production build
npm test       # Run tests
```

---

## Troubleshooting

### Backend Issues

**Port 3000 in use:**
```bash
PORT=8080 node server.js
```

**Dependencies not installed:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Frontend Issues

**Port 3001 in use:**
```bash
PORT=3002 npm start
```

**API connection failed:**
- Check backend is running
- Verify REACT_APP_API_URL in .env
- Check browser console for CORS errors

**Build fails:**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## Key Features Demonstrated

### 1. Conversational Accuracy
- FAQ database with 12 questions
- Keyword-based matching
- Context retention
- Follow-up handling

### 2. Session Management
- Unique session IDs
- Full conversation history
- Session metadata
- Auto-cleanup

### 3. LLM Integration
- System prompt engineering
- Context injection
- Conversation history formatting
- Fallback responses

### 4. Code Structure
- Modular architecture
- RESTful API design
- Component-based frontend
- Clean separation of concerns

---

## Demo Checklist

- [ ] Backend server running on port 3000
- [ ] Frontend running on port 3001
- [ ] Can send messages and receive responses
- [ ] Quick action buttons work
- [ ] FAQ sidebar loads and clickable
- [ ] Session info updates correctly
- [ ] Escalation triggers properly
- [ ] New session clears history
- [ ] All tests pass (npm test)

---

## Documentation Files

1. **[README.md](README.md)** - Main documentation
2. **[REACT_FRONTEND_SETUP.md](REACT_FRONTEND_SETUP.md)** - Frontend setup
3. **[DEMO_GUIDE.md](DEMO_GUIDE.md)** - Demo script
4. **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Assignment report
5. **[QUICKSTART.md](QUICKSTART.md)** - Quick start
6. **[frontend/README.md](frontend/README.md)** - Frontend docs

---

## Support

### Issues?
- Check browser console (F12)
- Check terminal for errors
- Verify both servers are running
- Review troubleshooting section

### Need Help?
- Review documentation files
- Check inline code comments
- Test API endpoints with curl
- Run test suite

---

## Summary

**Your AI Customer Support Bot is complete with:**

✅ Modern React + Tailwind CSS frontend
✅ RESTful Express.js backend
✅ Session management system
✅ LLM integration with fallback
✅ Smart escalation detection
✅ Comprehensive documentation
✅ Test suite (100% passing)
✅ Production-ready build process

**Ready for:**
- Assignment submission ✓
- Live demonstration ✓
- Further development ✓
- Production deployment ✓

---

**🚀 Start Building:**

```bash
# Terminal 1
node server.js

# Terminal 2
cd frontend && npm start
```

**Open:** http://localhost:3001

**Enjoy your AI Customer Support Bot!**
