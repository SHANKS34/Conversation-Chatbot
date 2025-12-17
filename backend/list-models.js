require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('ERROR: No API key found!');
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const models = await genAI.listModels();

    console.log('Available models:');
    for await (const model of models) {
      console.log('\n- Name:', model.name);
      console.log('  Display Name:', model.displayName);
      console.log('  Supported methods:', model.supportedGenerationMethods?.join(', '));
    }
  } catch (error) {
    console.error('Error listing models:', error.message);
  }
}

listModels();
