# React Frontend Setup Guide

Complete guide to set up and run the React frontend with Tailwind CSS.

## What's Been Created

A modern React frontend in the `frontend/` folder with:

✅ **React 18** - Latest React with hooks
✅ **Tailwind CSS** - Beautiful utility-first styling
✅ **Component Architecture** - Modular, reusable components
✅ **API Integration** - Connected to your backend
✅ **Responsive Design** - Works on all screen sizes

## Quick Start

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

This will install:
- React & React DOM
- React Scripts (build tools)
- Tailwind CSS
- PostCSS & Autoprefixer
- Axios (for API calls)

**Note:** Installation may take 2-3 minutes.

### Step 2: Start Backend Server

In a separate terminal, from the root directory:

```bash
node server.js
```

You should see:
```
AI Customer Support Bot server running on port 3000
```

### Step 3: Start React Frontend

In the frontend directory:

```bash
npm start
```

The app will automatically open at **http://localhost:3001**

## Project Structure

```
frontend/
├── public/
│   └── index.html                    # HTML template
├── src/
│   ├── components/
│   │   ├── ChatMessage.jsx          # Message display
│   │   ├── TypingIndicator.jsx     # Loading animation
│   │   ├── QuickActions.jsx        # Quick buttons
│   │   ├── SessionInfo.jsx         # Session sidebar
│   │   └── FAQList.jsx             # FAQ sidebar
│   ├── services/
│   │   └── api.js                  # API calls
│   ├── App.jsx                     # Main component
│   ├── index.js                    # Entry point
│   └── index.css                   # Tailwind imports
├── tailwind.config.js               # Tailwind config
├── postcss.config.js                # PostCSS config
├── package.json                     # Dependencies
├── .env                             # API URL
└── README.md                        # Documentation
```

## Components Overview

### 1. App.jsx (Main Component)
- Manages chat state
- Handles message sending
- Session management
- Connects all components

### 2. ChatMessage.jsx
- Displays individual messages
- Different styles for user/bot
- Timestamp formatting
- Smooth animations

### 3. TypingIndicator.jsx
- Animated typing dots
- Shows while bot is responding
- Smooth entrance/exit

### 4. QuickActions.jsx
- Quick question buttons
- One-click message sending
- Disabled during loading

### 5. SessionInfo.jsx
- Session ID display
- Message counter
- Escalation status
- New session button

### 6. FAQList.jsx
- Displays FAQs from backend
- Click to send question
- Scrollable list
- Category labels

### 7. API Service (api.js)
```javascript
chatAPI.createSession()
chatAPI.sendMessage(message, sessionId)
chatAPI.getFAQs()
chatAPI.getSession(sessionId)
```

## Features

### Real-time Chat
- Send messages
- Receive AI responses
- Typing indicators
- Message timestamps

### Session Management
- Auto-create sessions
- Track message count
- View session ID
- Start new session

### Quick Actions
- Pre-defined questions
- One-click sending
- Common FAQs

### FAQ Sidebar
- Browse all FAQs
- Click to ask
- Category badges
- Smooth scrolling

### Escalation Handling
- Visual warning banner
- Status indicator
- Disable input when escalated

### Responsive Design
- Mobile friendly
- Tablet optimized
- Desktop full-width
- Adaptive sidebar

## Styling with Tailwind

### Color Scheme
```javascript
Primary: #667eea (Purple)
Secondary: #764ba2 (Deep Purple)
Background: Gradient
Text: Gray scale
```

### Custom Animations
- `animate-slide-in` - Message entrance
- `animate-pulse-dot` - Online indicator
- `animate-typing` - Typing dots

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## Running Both Servers

### Terminal 1: Backend
```bash
# In root directory
node server.js
# Running on http://localhost:3000
```

### Terminal 2: Frontend
```bash
# In frontend directory
npm start
# Running on http://localhost:3001
```

## Testing the Integration

1. **Open Frontend:** http://localhost:3001

2. **Send a Message:**
   - Type: "What are your business hours?"
   - Press Enter or click send button
   - See typing indicator
   - Receive bot response

3. **Try Quick Actions:**
   - Click any quick question button
   - Message automatically sends

4. **Test FAQ List:**
   - Click an FAQ in the sidebar
   - Question auto-fills and sends

5. **Test Escalation:**
   - Type: "I need to speak to a manager"
   - See yellow warning banner
   - Notice input is disabled

6. **Start New Session:**
   - Click "New Session" button
   - Confirm dialog
   - Chat history clears

## Configuration

### API URL
Edit `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:3000
```

### Port
Change React port:
```bash
PORT=3002 npm start
```

### Proxy (Alternative)
The `package.json` already includes:
```json
"proxy": "http://localhost:3000"
```

This allows relative API calls like `/api/chat`

## Building for Production

```bash
cd frontend
npm run build
```

Creates optimized build in `frontend/build/`

### Serve Production Build
```bash
npx serve -s build -p 3001
```

## Comparison: Vanilla vs React Frontend

| Feature | Vanilla JS | React |
|---------|-----------|-------|
| Framework | None | React 18 |
| Styling | Custom CSS | Tailwind CSS |
| State Management | Manual | useState/useEffect |
| Components | Functions | JSX Components |
| Build Process | None | Create React App |
| Hot Reload | ❌ | ✅ |
| Type Safety | ❌ | ✅ (with TS) |
| Performance | Good | Optimized |

## Advantages of React Frontend

1. **Component Reusability** - Build once, use everywhere
2. **State Management** - Automatic UI updates
3. **Developer Experience** - Hot reload, debugging tools
4. **Ecosystem** - Thousands of packages
5. **Scalability** - Easy to add features
6. **Maintainability** - Organized code structure
7. **Modern Tooling** - Build optimization, code splitting

## Common Issues & Solutions

### Issue: npm install fails
```bash
# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Issue: Port 3001 in use
```bash
# Use different port
PORT=3002 npm start
```

### Issue: API connection refused
- Check backend is running on port 3000
- Verify REACT_APP_API_URL in .env
- Check browser console for errors

### Issue: CORS errors
Backend already has CORS enabled in server.js:
```javascript
app.use(cors());
```

### Issue: Build fails
```bash
# Increase memory
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

## Development Tips

### React DevTools
Install Chrome extension for debugging:
- View component tree
- Inspect props/state
- Track performance

### Hot Reload
Changes auto-refresh the browser. No need to restart!

### Console Logging
```javascript
console.log('Message sent:', message);
```

### Error Boundaries
Add error handling for production:
```javascript
componentDidCatch(error, errorInfo) {
  // Log to service
}
```

## Next Steps

### Enhancements to Add

1. **TypeScript** - Add type safety
```bash
npm install --save typescript @types/react @types/react-dom
```

2. **State Management** - Add Redux/Context
```bash
npm install @reduxjs/toolkit react-redux
```

3. **Routing** - Multi-page support
```bash
npm install react-router-dom
```

4. **Testing** - Component tests
```bash
npm install --save-dev @testing-library/react
```

5. **Icons** - Icon library
```bash
npm install react-icons
```

6. **Animations** - Advanced animations
```bash
npm install framer-motion
```

## File Checklist

Verify these files exist:

- [ ] `frontend/package.json`
- [ ] `frontend/tailwind.config.js`
- [ ] `frontend/postcss.config.js`
- [ ] `frontend/src/index.js`
- [ ] `frontend/src/index.css`
- [ ] `frontend/src/App.jsx`
- [ ] `frontend/src/services/api.js`
- [ ] `frontend/src/components/ChatMessage.jsx`
- [ ] `frontend/src/components/TypingIndicator.jsx`
- [ ] `frontend/src/components/QuickActions.jsx`
- [ ] `frontend/src/components/SessionInfo.jsx`
- [ ] `frontend/src/components/FAQList.jsx`
- [ ] `frontend/public/index.html`
- [ ] `frontend/.env`

## Support

### Documentation
- React: https://react.dev
- Tailwind: https://tailwindcss.com
- Axios: https://axios-http.com

### Debugging
1. Check browser console (F12)
2. Check terminal for errors
3. Verify backend is running
4. Test API endpoints directly

## Summary

You now have a complete React frontend with:

✅ Modern UI with Tailwind CSS
✅ Smooth animations and transitions
✅ Full backend integration
✅ Responsive design
✅ Production-ready build process

**To start developing:**
```bash
# Terminal 1
node server.js

# Terminal 2
cd frontend && npm start
```

**Access:**
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000

---

**Happy Coding! 🚀**
