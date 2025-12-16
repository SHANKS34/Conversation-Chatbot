// Simple test script for AI Customer Support Bot
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test utilities
let testsPassed = 0;
let testsFailed = 0;

function logSuccess(message) {
  console.log('\x1b[32m✓\x1b[0m', message);
  testsPassed++;
}

function logError(message, error) {
  console.log('\x1b[31m✗\x1b[0m', message);
  if (error) console.error('  Error:', error.message);
  testsFailed++;
}

function logSection(message) {
  console.log('\n\x1b[36m' + message + '\x1b[0m');
  console.log('─'.repeat(50));
}

// Test functions
async function testHealthCheck() {
  try {
    const response = await axios.get(`${BASE_URL}/api/health`);
    if (response.data.success && response.data.status === 'healthy') {
      logSuccess('Health check endpoint working');
    } else {
      logError('Health check returned unexpected data');
    }
  } catch (error) {
    logError('Health check failed', error);
  }
}

async function testSessionCreation() {
  try {
    const response = await axios.post(`${BASE_URL}/api/session/new`);
    if (response.data.success && response.data.sessionId) {
      logSuccess(`Session created: ${response.data.sessionId}`);
      return response.data.sessionId;
    } else {
      logError('Session creation returned unexpected data');
      return null;
    }
  } catch (error) {
    logError('Session creation failed', error);
    return null;
  }
}

async function testChatEndpoint(sessionId) {
  try {
    const response = await axios.post(`${BASE_URL}/api/chat`, {
      message: 'What are your business hours?',
      sessionId: sessionId
    });

    if (response.data.success && response.data.response) {
      logSuccess('Chat endpoint working - received response');
      console.log('  Response:', response.data.response.substring(0, 80) + '...');
      return response.data.sessionId;
    } else {
      logError('Chat endpoint returned unexpected data');
      return null;
    }
  } catch (error) {
    logError('Chat endpoint failed', error);
    return null;
  }
}

async function testConversationMemory(sessionId) {
  try {
    // First message
    await axios.post(`${BASE_URL}/api/chat`, {
      message: 'How do I reset my password?',
      sessionId: sessionId
    });

    // Follow-up message
    const response = await axios.post(`${BASE_URL}/api/chat`, {
      message: 'How long is the reset link valid?',
      sessionId: sessionId
    });

    if (response.data.success) {
      logSuccess('Conversation memory working - multi-turn conversation');
      return true;
    }
  } catch (error) {
    logError('Conversation memory test failed', error);
    return false;
  }
}

async function testEscalation() {
  try {
    const response = await axios.post(`${BASE_URL}/api/chat`, {
      message: 'I need to speak to a manager immediately!',
      sessionId: 'test_escalation_' + Date.now()
    });

    if (response.data.success && response.data.escalated === true) {
      logSuccess('Escalation detection working');
      console.log('  Escalation reason:', response.data.escalationReason);
      return true;
    } else {
      logError('Escalation not triggered as expected');
      return false;
    }
  } catch (error) {
    logError('Escalation test failed', error);
    return false;
  }
}

async function testFAQsEndpoint() {
  try {
    const response = await axios.get(`${BASE_URL}/api/faqs`);

    if (response.data.success && response.data.faqs.length > 0) {
      logSuccess(`FAQs endpoint working - ${response.data.total} FAQs loaded`);
      console.log('  Categories:', response.data.categories.join(', '));
      return true;
    } else {
      logError('FAQs endpoint returned no data');
      return false;
    }
  } catch (error) {
    logError('FAQs endpoint failed', error);
    return false;
  }
}

async function testSessionRetrieval(sessionId) {
  try {
    const response = await axios.get(`${BASE_URL}/api/session/${sessionId}`);

    if (response.data.success && response.data.session) {
      logSuccess('Session retrieval working');
      console.log('  Message count:', response.data.session.messageCount);
      console.log('  Escalated:', response.data.session.escalated);
      return true;
    } else {
      logError('Session retrieval returned unexpected data');
      return false;
    }
  } catch (error) {
    logError('Session retrieval failed', error);
    return false;
  }
}

async function testActiveSessionsList() {
  try {
    const response = await axios.get(`${BASE_URL}/api/sessions`);

    if (response.data.success && response.data.sessions) {
      logSuccess(`Active sessions list working - ${response.data.total} sessions`);
      return true;
    } else {
      logError('Active sessions list returned unexpected data');
      return false;
    }
  } catch (error) {
    logError('Active sessions list failed', error);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('\n╔═══════════════════════════════════════════════════╗');
  console.log('║   AI Customer Support Bot - Test Suite           ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');

  logSection('Testing API Health');
  await testHealthCheck();

  logSection('Testing Session Management');
  const sessionId = await testSessionCreation();

  if (sessionId) {
    logSection('Testing Chat Functionality');
    await testChatEndpoint(sessionId);

    logSection('Testing Conversation Memory');
    await testConversationMemory(sessionId);

    logSection('Testing Session Retrieval');
    await testSessionRetrieval(sessionId);
  }

  logSection('Testing Escalation Logic');
  await testEscalation();

  logSection('Testing FAQs System');
  await testFAQsEndpoint();

  logSection('Testing Active Sessions');
  await testActiveSessionsList();

  // Summary
  console.log('\n╔═══════════════════════════════════════════════════╗');
  console.log('║   Test Summary                                    ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');
  console.log(`  \x1b[32m✓ Passed: ${testsPassed}\x1b[0m`);
  console.log(`  \x1b[31m✗ Failed: ${testsFailed}\x1b[0m`);
  console.log(`  Total: ${testsPassed + testsFailed}\n`);

  if (testsFailed === 0) {
    console.log('\x1b[32m🎉 All tests passed!\x1b[0m\n');
    process.exit(0);
  } else {
    console.log('\x1b[31m⚠️  Some tests failed. Please check the errors above.\x1b[0m\n');
    process.exit(1);
  }
}

// Check if server is running
async function checkServerRunning() {
  try {
    await axios.get(BASE_URL);
    return true;
  } catch (error) {
    console.error('\x1b[31m✗ Server is not running!\x1b[0m');
    console.error('  Please start the server with: node server.js\n');
    process.exit(1);
  }
}

// Run tests
checkServerRunning().then(() => {
  runTests();
});
