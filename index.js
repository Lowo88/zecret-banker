require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const { connect, keyStores, WalletConnection } = require('near-api-js');
const AgentService = require('./src/services/agentService');
const ZcashService = require('./src/services/zcashService');
const SecretNetworkService = require('./src/services/secretNetworkService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

// NEAR configuration
const nearConfig = {
  networkId: process.env.NEAR_NETWORK || 'testnet',
  nodeUrl: process.env.NEAR_NODE_URL || 'https://rpc.testnet.near.org',
  walletUrl: process.env.NEAR_WALLET_URL || 'https://wallet.testnet.near.org',
  helperUrl: process.env.NEAR_HELPER_URL || 'https://helper.testnet.near.org',
  explorerUrl: process.env.NEAR_EXPLORER_URL || 'https://explorer.testnet.near.org',
  keyStore: new keyStores.InMemoryKeyStore()
};

// Initialize services
const agentService = new AgentService(nearConfig);
const zcashService = new ZcashService({
  zcashNetwork: process.env.ZCASH_NETWORK || 'testnet',
  zcashApiUrl: process.env.ZCASH_API_URL || 'https://api.lightwalletd.com',
  bridgeContractId: process.env.ZCASH_BRIDGE_CONTRACT || 'zcash-bridge.testnet'
});
const secretNetworkService = new SecretNetworkService({
  secretNodeUrl: process.env.SECRET_NODE_URL || 'https://lcd-secret.scrt.network',
  secretNetwork: process.env.SECRET_NETWORK || 'pulsar-2',
  bridgeContractAddress: process.env.SECRET_BRIDGE_CONTRACT || 'secret1abc...',
  chainId: process.env.SECRET_CHAIN_ID || 'pulsar-2'
});

// Initialize services on startup
(async () => {
  try {
    await agentService.initialize();
    await zcashService.initialize();
    await secretNetworkService.initialize();
    console.log('All services initialized successfully');
  } catch (error) {
    console.error('Error initializing services:', error);
  }
})();

// Basic status endpoint
app.get('/api/status', (req, res) => {
  res.json({ 
    message: 'NEAR AI Bridge Agent is running',
    version: 'alpha-0.1.0',
    status: 'operational',
    aiMode: process.env.USE_ACTUAL_API === 'true' ? 'NEAR AI API' : 'Simulation'
  });
});

// Detailed status endpoint
app.get('/api/status/detailed', async (req, res) => {
  try {
    const nearStatus = await agentService.processAction('status', {});
    const zcashStatus = zcashService.getStatus();
    const secretStatus = secretNetworkService.getStatus();
    
    res.json({
      near: nearStatus,
      zcash: zcashStatus,
      secret: secretStatus,
      bridgeStatus: 'operational'
    });
  } catch (error) {
    console.error('Error getting detailed status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Agent action endpoint
app.post('/agent/action', async (req, res) => {
  try {
    const { action, params } = req.body;
    console.log(`Received action request: ${action}`);
    
    const result = await agentService.processAction(action, params);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error processing agent action:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Zcash integration endpoints
app.post('/api/zcash/address', async (req, res) => {
  try {
    const address = await zcashService.generateAddress();
    res.json({ success: true, ...address });
  } catch (error) {
    console.error('Error generating Zcash address:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/zcash/transfer', async (req, res) => {
  try {
    const params = req.body;
    const result = await zcashService.transferAssets(params);
    res.json(result);
  } catch (error) {
    console.error('Error transferring assets:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/zcash/shield', async (req, res) => {
  try {
    const params = req.body;
    const result = await zcashService.executeShieldedTransaction(params);
    res.json(result);
  } catch (error) {
    console.error('Error executing shielded transaction:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/zcash/history', async (req, res) => {
  try {
    const { filter, accountId } = req.query;
    const history = await zcashService.getTransactionHistory(filter || 'all', accountId);
    res.json(history);
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Secret Network integration endpoints
app.post('/api/secret/viewing-key', async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) {
      return res.status(400).json({ success: false, error: 'Address is required' });
    }
    
    const result = await secretNetworkService.generateViewingKey(address);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error generating viewing key:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/secret/swap', async (req, res) => {
  try {
    const params = req.body;
    const result = await secretNetworkService.executePrivateSwap(params);
    res.json(result);
  } catch (error) {
    console.error('Error executing private swap:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/secret/compute', async (req, res) => {
  try {
    const params = req.body;
    const result = await secretNetworkService.executePrivateComputation(params);
    res.json(result);
  } catch (error) {
    console.error('Error executing private computation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/secret/query', async (req, res) => {
  try {
    const params = req.body;
    const result = await secretNetworkService.queryEncryptedContract(params);
    res.json(result);
  } catch (error) {
    console.error('Error querying encrypted contract:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/secret/history', async (req, res) => {
  try {
    const { filter, address, viewingKey } = req.query;
    
    if (!address) {
      return res.status(400).json({ success: false, error: 'Address is required' });
    }
    
    const history = await secretNetworkService.getPrivateTransactionHistory(
      filter || 'all', 
      address,
      viewingKey
    );
    
    res.json(history);
  } catch (error) {
    console.error('Error fetching private transaction history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Agent capabilities endpoint
app.get('/agent/capabilities', (req, res) => {
  res.json({
    version: 'alpha-0.1.0',
    capabilities: [
      {
        name: 'query',
        description: 'Process natural language queries using AI',
        params: {
          prompt: 'The query to process'
        }
      },
      {
        name: 'transact',
        description: 'Execute transactions on the NEAR blockchain',
        params: {
          contractId: 'NEAR contract to interact with',
          method: 'Contract method to call',
          args: 'Arguments to pass to the method'
        }
      },
      {
        name: 'analyze',
        description: 'Analyze data using AI capabilities',
        params: {
          data: 'Data to analyze'
        }
      },
      {
        name: 'status',
        description: 'Get detailed status of the agent and its connections',
        params: {}
      },
      {
        name: 'zcash',
        description: 'Interact with Zcash blockchain and privacy features',
        params: {
          operation: 'Operation type (transfer, shield, deshield, private)',
          amount: 'Amount to transfer or shield',
          recipient: 'Recipient address'
        }
      },
      {
        name: 'secret',
        description: 'Execute privacy-preserving operations using Secret Network TEEs',
        params: {
          operation: 'Operation type (swap, compute, query)',
          privacy: 'Privacy level (maximum, standard, minimal)',
          data: 'Data to process in TEE'
        }
      }
    ],
    aiMode: process.env.USE_ACTUAL_API === 'true' ? 'Using NEAR AI API' : 'Using simulation mode'
  });
});

// Serve the client-side authentication module
app.get('/src/ai/nearAuthClient.js', (req, res) => {
  res.set('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'src', 'ai', 'nearAuthClient.js'));
});

// Add route to check token validity
app.post('/api/validate-token', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ valid: false, error: 'No token provided' });
    }

    // Basic validation - check if token is valid JSON with expected fields
    try {
      const parsedToken = JSON.parse(token);
      const isValid = parsedToken.account_id && 
                      parsedToken.public_key && 
                      parsedToken.signature && 
                      parsedToken.message;
      
      if (isValid) {
        // In a real implementation, we would verify the signature
        return res.json({ valid: true, account_id: parsedToken.account_id });
      } else {
        return res.json({ valid: false, error: 'Invalid token format' });
      }
    } catch (e) {
      return res.status(400).json({ valid: false, error: 'Invalid token format' });
    }
  } catch (error) {
    console.error('Error validating token:', error);
    return res.status(500).json({ valid: false, error: error.message });
  }
});

// IMPORTANT: Fixed wildcard route - use a simple string path instead of a pattern with special characters
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`NEAR AI Bridge Agent is running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} to interact with the agent`);
  console.log(`Open http://localhost:${PORT}/zcash-bridge.html to use the NEAR-Zcash bridge`);
  console.log(`Open http://localhost:${PORT}/secret-network.html to use Secret Network TEE features`);
  console.log(`AI Mode: ${process.env.USE_ACTUAL_API === 'true' ? 'Using NEAR AI API' : 'Using simulation mode'}`);
}); 