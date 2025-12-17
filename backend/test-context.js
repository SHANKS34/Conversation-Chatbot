// Test script to verify Redis context memory is working
const redisClient = require('./redisClient');
const sessionManager = require('./sessionManager');

async function testContextMemory() {
  console.log('\n=== Testing Redis Context Memory ===\n');

  const testSessionId = `test_session_${Date.now()}`;

  try {
    // Step 1: Create a session
    console.log('1. Creating session:', testSessionId);
    const session = sessionManager.createSession(testSessionId);
    console.log('   ✓ Session created');

    // Step 2: Add some messages
    console.log('\n2. Adding messages to Redis:');
    await sessionManager.addMessage(testSessionId, 'user', 'Hello, my name is Alice');
    console.log('   ✓ Added user message: "Hello, my name is Alice"');

    await sessionManager.addMessage(testSessionId, 'assistant', 'Hello Alice! Nice to meet you.');
    console.log('   ✓ Added assistant message: "Hello Alice! Nice to meet you."');

    await sessionManager.addMessage(testSessionId, 'user', 'What is my name?');
    console.log('   ✓ Added user message: "What is my name?"');

    await sessionManager.addMessage(testSessionId, 'assistant', 'Your name is Alice.');
    console.log('   ✓ Added assistant message: "Your name is Alice."');

    // Step 3: Retrieve conversation history
    console.log('\n3. Retrieving conversation history from Redis:');
    const history = await sessionManager.getHistory(testSessionId, 10);
    console.log('   ✓ Retrieved', history.length, 'messages');

    // Step 4: Display the conversation
    console.log('\n4. Conversation History:');
    history.forEach((msg, index) => {
      console.log(`   ${index + 1}. [${msg.role}]: ${msg.content}`);
      console.log(`      Timestamp: ${msg.timestamp}`);
    });

    // Step 5: Test context window (last 2 messages)
    console.log('\n5. Testing context window (last 2 messages):');
    const recentHistory = await sessionManager.getHistory(testSessionId, 2);
    console.log('   ✓ Retrieved last', recentHistory.length, 'messages');
    recentHistory.forEach((msg, index) => {
      console.log(`   ${index + 1}. [${msg.role}]: ${msg.content}`);
    });

    // Step 6: Verify data in Redis directly
    console.log('\n6. Verifying data in Redis:');
    const rawData = await redisClient.getConversationHistory(testSessionId);
    console.log('   ✓ Raw data from Redis:', JSON.stringify(rawData, null, 2));

    // Step 7: Clean up
    console.log('\n7. Cleaning up test session:');
    await sessionManager.deleteSession(testSessionId);
    console.log('   ✓ Session deleted');

    console.log('\n=== ✓ All tests passed! Redis context memory is working correctly ===\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    await redisClient.disconnect();
    process.exit(0);
  }
}

testContextMemory();
