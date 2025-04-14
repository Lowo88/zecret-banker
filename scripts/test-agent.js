require('dotenv').config();
const axios = require('axios');

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

async function testAgent() {
  console.log('Testing NEAR AI Bridge Agent...');
  
  try {
    // Test 1: Check agent status
    console.log('\n=== Test 1: Agent Status ===');
    const statusResponse = await axios.get(`${BASE_URL}/api/status`);
    console.log('Status Response:', statusResponse.data);
    
    // Test 2: Get agent capabilities
    console.log('\n=== Test 2: Agent Capabilities ===');
    const capabilitiesResponse = await axios.get(`${BASE_URL}/agent/capabilities`);
    console.log('Capabilities Response:', capabilitiesResponse.data);
    
    // Test 3: Query action
    console.log('\n=== Test 3: Query Action ===');
    const queryResponse = await axios.post(`${BASE_URL}/agent/action`, {
      action: 'query',
      params: {
        prompt: 'Tell me about NEAR Protocol'
      }
    });
    console.log('Query Response:', queryResponse.data);
    
    // Test 4: Transaction action
    console.log('\n=== Test 4: Transaction Action ===');
    const transactionResponse = await axios.post(`${BASE_URL}/agent/action`, {
      action: 'transact',
      params: {
        contractId: 'example.testnet',
        method: 'transfer',
        args: { amount: '1000000000000000000000000' }
      }
    });
    console.log('Transaction Response:', transactionResponse.data);
    
    // Test 5: Analysis action
    console.log('\n=== Test 5: Analysis Action ===');
    const analysisResponse = await axios.post(`${BASE_URL}/agent/action`, {
      action: 'analyze',
      params: {
        data: {
          transactions: [
            { id: 1, amount: 100, timestamp: '2023-01-01T12:00:00Z' },
            { id: 2, amount: 200, timestamp: '2023-01-02T13:00:00Z' },
            { id: 3, amount: 150, timestamp: '2023-01-03T14:00:00Z' }
          ]
        }
      }
    });
    console.log('Analysis Response:', analysisResponse.data);
    
    console.log('\n=== All Tests Completed Successfully ===');
  } catch (error) {
    console.error('Error during testing:', error.message);
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
  
  await testAgent();
})(); 