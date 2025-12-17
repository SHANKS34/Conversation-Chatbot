// Test script for FAQ matching and auto-escalation
const faqService = require('./faqService');

console.log('\n=== Testing FAQ Service ===\n');

// Test 1: FAQ matching - should find FAQ
console.log('Test 1: Query that matches FAQ');
console.log('Query: "How do I reset my password?"');
const match1 = faqService.findBestMatch('How do I reset my password?');
if (match1) {
  console.log('✓ FAQ Match Found:');
  console.log('  Question:', match1.question);
  console.log('  Answer:', match1.answer);
  console.log('  Relevance Score:', match1.relevanceScore);
} else {
  console.log('✗ No FAQ match');
}

// Test 2: Similar wording - should still match
console.log('\n\nTest 2: Query with similar wording');
console.log('Query: "forgot my password help"');
const match2 = faqService.findBestMatch('forgot my password help');
if (match2) {
  console.log('✓ FAQ Match Found:');
  console.log('  Question:', match2.question);
  console.log('  Answer:', match2.answer);
  console.log('  Relevance Score:', match2.relevanceScore);
} else {
  console.log('✗ No FAQ match');
}

// Test 3: Shipping query
console.log('\n\nTest 3: Shipping query');
console.log('Query: "how long does shipping take?"');
const match3 = faqService.findBestMatch('how long does shipping take?');
if (match3) {
  console.log('✓ FAQ Match Found:');
  console.log('  Question:', match3.question);
  console.log('  Answer:', match3.answer);
  console.log('  Relevance Score:', match3.relevanceScore);
} else {
  console.log('✗ No FAQ match');
}

// Test 4: Unrelated query - should NOT match
console.log('\n\nTest 4: Unrelated query (should not match)');
console.log('Query: "What is the meaning of life?"');
const match4 = faqService.findBestMatch('What is the meaning of life?');
if (match4) {
  console.log('✗ Unexpected FAQ Match:');
  console.log('  Question:', match4.question);
  console.log('  Relevance Score:', match4.relevanceScore);
} else {
  console.log('✓ No FAQ match (as expected - should escalate)');
}

// Test 5: Show all categories
console.log('\n\nTest 5: Available FAQ categories');
const categories = faqService.getCategories();
console.log('Categories:', categories);

// Test 6: Search results
console.log('\n\nTest 6: Search results for "payment"');
const searchResults = faqService.searchFAQs('payment');
console.log('Found', searchResults.length, 'matching FAQs:');
searchResults.slice(0, 3).forEach((faq, index) => {
  console.log(`  ${index + 1}. ${faq.question} (score: ${faq.relevanceScore})`);
});

console.log('\n\n=== Auto-Escalation Detection ===\n');

const llmService = require('./llmService');

// Test escalation keyword detection
const testResponses = [
  "I'm not sure about that. Let me connect you with a human agent.",
  "Based on our FAQs, shipping takes 5-7 business days.",
  "I don't know the answer to that specific question.",
  "I cannot help with that request.",
];

testResponses.forEach((response, index) => {
  const needsEscalation = llmService.detectEscalationNeed(response);
  console.log(`Response ${index + 1}:`);
  console.log(`  "${response}"`);
  console.log(`  Needs Escalation: ${needsEscalation ? '✓ YES' : '✗ NO'}`);
  console.log('');
});

console.log('=== Tests Complete ===\n');
