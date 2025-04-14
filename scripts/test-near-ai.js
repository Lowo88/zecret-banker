require('dotenv').config();
const axios = require('axios');

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

async function testNearAI() {
  console.log('Testing NEAR AI Bridge Agent with AI Integration...');
  
  try {
    // Test 1: Check agent status to see AI mode
    console.log('\n=== Test 1: Agent Status ===');
    const statusResponse = await axios.get(`${BASE_URL}/api/status/detailed`);
    console.log('Status Response:', statusResponse.data);
    
    const aiMode = statusResponse.data.ai.mode;
    console.log(`\nAI Mode: ${aiMode.toUpperCase()}`);
    
    if (aiMode === 'api') {
      console.log('Using actual NEAR AI API');
    } else {
      console.log('Using simulation mode');
      console.log('To use actual NEAR AI, set USE_ACTUAL_API=true and configure NEAR_AI_API_KEY in .env');
    }
    
    // Test 2: Run a query about NEAR
    console.log('\n=== Test 2: NEAR Query ===');
    const queryResponse = await axios.post(`${BASE_URL}/agent/action`, {
      action: 'query',
      params: {
        prompt: 'What is NEAR Protocol and how does it work?'
      }
    });
    console.log('Query Response:', queryResponse.data);
    
    // Test 3: Run an analysis
    console.log('\n=== Test 3: Data Analysis ===');
    const analysisResponse = await axios.post(`${BASE_URL}/agent/action`, {
      action: 'analyze',
      params: {
        data: {
          transactions: [
            { id: 1, amount: 100, timestamp: '2023-01-01T12:00:00Z', gas: 5000000 },
            { id: 2, amount: 200, timestamp: '2023-01-02T13:00:00Z', gas: 4500000 },
            { id: 3, amount: 150, timestamp: '2023-01-03T14:00:00Z', gas: 6000000 }
          ],
          network: 'testnet',
          contractId: 'example.testnet'
        }
      }
    });
    console.log('Analysis Response:', analysisResponse.data);
    
    console.log('\n=== All Tests Completed Successfully ===');
  } catch (error) {
    console.error('\nError during testing:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Check if the server is already running
async function isServerRunning() {
  try {
    await axios.get(BASE_URL);
    return true;
  } catch (error) {
    return false;
  }
}

(async () => {
  const serverRunning = await isServerRunning();
  
  if (!serverRunning) {
    console.log('Server is not running. Please start the server with "npm start" before running tests.');
    process.exit(1);
  }
  
  await testNearAI();
})(); 