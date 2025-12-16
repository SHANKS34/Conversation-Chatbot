# Quick Start Guide

Get the AI Customer Support Bot running in 2 minutes!

## Step 1: Start the Server

```bash
node server.js
```

You should see:
```
AI Customer Support Bot server running on port 3000
API Documentation: http://localhost:3000
```

## Step 2: Open the Chat Interface

Open your browser and navigate to:
```
http://localhost:3000
```

## Step 3: Try It Out!

### Test Basic FAQ
Click the "Business Hours" button or type:
```
What are your business hours?
```

### Test Conversation Memory
1. Type: `How do I reset my password?`
2. Then type: `How long is the link valid?`

The bot remembers the context!

### Test Escalation
Type any of these:
```
I need to speak to a manager
I'm very frustrated with this service
Connect me to a human agent
```

Watch the yellow escalation banner appear!

## Step 4: Run Tests

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

## Available Scripts

```bash
npm start      # Start the server
npm run dev    # Start with auto-reload (nodemon)
npm test       # Run test suite
```

## API Quick Test

Try these cURL commands in a new terminal:

### Create Session
```bash
curl -X POST http://localhost:3000/api/session/new
```

### Send Message
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What are your business hours?"}'
```

### Get All FAQs
```bash
curl http://localhost:3000/api/faqs
```

## Configuration (Optional)

To use a real LLM (OpenAI, etc.), edit `.env`:

```env
OPENAI_API_KEY=your_key_here
LLM_MODEL=gpt-3.5-turbo
```

Without an API key, the bot uses rule-based responses (works great!).

## Troubleshooting

### Port 3000 already in use?
```bash
PORT=8080 node server.js
```

### Server not responding?
- Check if server is running
- Try restarting: Ctrl+C then `node server.js`
- Check firewall settings

### Chat not working?
- Check browser console (F12)
- Try a different browser
- Clear browser cache

## What's Next?

- 📖 Read [README.md](README.md) for full documentation
- 🎬 Check [DEMO_GUIDE.md](DEMO_GUIDE.md) for demo instructions
- 📊 View [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) for complete overview

## Features Overview

✅ **Smart FAQ System** - 12 questions across 6 categories
✅ **Conversation Memory** - Remembers last 10 messages
✅ **Auto Escalation** - Detects when human help is needed
✅ **Session Management** - Tracks all conversations
✅ **RESTful API** - 7 endpoints for integration
✅ **Modern UI** - Clean, responsive interface

## Need Help?

Check the [README.md](README.md) for:
- Detailed API documentation
- Usage examples
- Configuration options
- Troubleshooting guide

---

**Ready to go! 🚀**
