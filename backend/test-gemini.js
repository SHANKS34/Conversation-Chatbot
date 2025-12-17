require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.LLM_MODEL || 'gemini-1.5-flash';

  console.log('Testing Gemini API connection...');
  console.log('API Key present:', !!apiKey);
  console.log('API Key length:', apiKey ? apiKey.length : 0);
  console.log('Model:', modelName);

  if (!apiKey) {
    console.error('ERROR: No API key found!');
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const result = await model.generateContent('Say hello!');
    const response = result.response;
    const text = response.text();

    console.log('\n✓ SUCCESS! Gemini API is working!');
    console.log('Response:', text);

  } catch (error) {
    console.error('\n✗ ERROR: Gemini API call failed!');
    console.error('Error:', error);
  }
}

testGemini();
