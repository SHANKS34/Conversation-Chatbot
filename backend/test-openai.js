require('dotenv').config();
const axios = require('axios');

async function testOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.LLM_MODEL || 'gpt-3.5-turbo';

  console.log('Testing OpenAI API connection...');
  console.log('API Key present:', !!apiKey);
  console.log('API Key length:', apiKey ? apiKey.length : 0);
  console.log('Model:', model);

  if (!apiKey) {
    console.error('ERROR: No API key found!');
    return;
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say hello!' }
        ],
        temperature: 0.7,
        max_tokens: 50
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    console.log('\n✓ SUCCESS! OpenAI API is working!');
    console.log('Response:', response.data.choices[0].message.content);
    console.log('\nFull response data:');
    console.log(JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('\n✗ ERROR: OpenAI API call failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error message:', error.message);
    }
  }
}

testOpenAI();
