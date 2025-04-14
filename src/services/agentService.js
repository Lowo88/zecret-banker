const axios = require('axios');
const { connect } = require('near-api-js');
const NearUtils = require('../blockchain/nearUtils');
const AIUtils = require('../ai/aiUtils');
const NearAuthHelper = require('../ai/nearAuthHelper');

class AgentService {
  constructor(nearConfig) {
    this.nearConfig = nearConfig;
    this.nearConnection = null;
    this.authToken = null;
    this.aiUtils = new AIUtils(
      process.env.NEAR_AI_API_URL,
      this.authToken  // Initially null, will be set during initialization
    );
    
    this.isUsingRealAI = false; // Will be set during initialization
  }

  async initialize() {
    try {
      // Connect to NEAR using our utility
      this.nearConnection = await NearUtils.initializeNear(this.nearConfig);
      console.log('Agent service initialized with NEAR connection');
      
      // Try to get auth token if credentials are available
      if (process.env.USE_ACTUAL_API === 'true') {
        await this.initializeNearAIAuth();
      } else {
        console.log('NEAR AI API integration is disabled (USE_ACTUAL_API=false)');
      }
      
      // Set the flag based on whether we have a valid auth token
      this.isUsingRealAI = !!this.authToken && process.env.USE_ACTUAL_API === 'true';
      console.log(`AI Mode: ${this.isUsingRealAI ? 'Using actual NEAR AI API' : 'Using simulation mode'}`);
    } catch (error) {
      console.error('Error during agent initialization:', error);
      console.log('Continuing with limited functionality');
    }
  }

  /**
   * Initialize NEAR AI authentication
   * @private
   */
  async initializeNearAIAuth() {
    try {
      // First try to use a pre-configured auth token if available
      if (NearAuthHelper.hasPreConfiguredAuthToken()) {
        console.log('Using pre-configured NEAR AI auth token from environment');
        this.authToken = process.env.NEAR_AI_AUTH_TOKEN;
        this.aiUtils.setAuthToken(this.authToken);
        return;
      }
      
      // Otherwise, try to generate a token using account credentials
      if (NearAuthHelper.hasValidNearCredentials()) {
        console.log('Generating NEAR AI auth token using account credentials');
        this.authToken = await NearAuthHelper.generateAuthToken(
          this.nearConfig,
          process.env.NEAR_ACCOUNT_ID,
          process.env.NEAR_PRIVATE_KEY
        );
        
        if (this.authToken) {
          console.log('Successfully generated NEAR AI auth token');
          // Update the AIUtils instance with the new token
          this.aiUtils.setAuthToken(this.authToken);
        } else {
          console.log('Failed to generate NEAR AI auth token');
        }
      } else {
        console.log('No NEAR credentials or auth token available for NEAR AI API');
        console.log('Will fall back to simulation mode');
      }
    } catch (error) {
      console.error('Error initializing NEAR AI auth:', error);
      this.authToken = null;
    }
  }

  async processAction(action, params) {
    switch (action) {
      case 'query':
        return this.handleQuery(params);
      case 'transact':
        return this.handleTransaction(params);
      case 'analyze':
        return this.handleAnalysis(params);
      case 'status':
        return this.getStatus();
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  async handleQuery({ prompt }) {
    try {
      console.log(`Processing query: ${prompt}`);
      
      // Use AIUtils to process the query with NEAR AI API or simulation
      const response = await this.aiUtils.processQuery(prompt);
      
      return response;
    } catch (error) {
      console.error('Error handling query:', error);
      throw error;
    }
  }

  async handleTransaction({ contractId, method, args }) {
    try {
      // Process transaction with NEAR blockchain
      console.log(`Processing transaction: ${contractId}.${method}(${JSON.stringify(args)})`);
      
      if (process.env.NEAR_ACCOUNT_ID && process.env.NEAR_PRIVATE_KEY) {
        // If we have credentials, we can attempt a real transaction
        // Implementation would go here after setting up the account with the private key
        console.log('Transaction functionality requires additional setup with NEAR account keys');
      }
      
      // For now, return a simulated result
      const simulatedResult = {
        success: true,
        txHash: `simulated_tx_${Date.now().toString(36)}`,
        gasUsed: Math.floor(Math.random() * 10000000),
        status: 'SuccessValue',
        note: 'This is a simulated transaction. To execute real transactions, configure NEAR_ACCOUNT_ID and NEAR_PRIVATE_KEY'
      };
      
      return simulatedResult;
    } catch (error) {
      console.error('Error handling transaction:', error);
      throw error;
    }
  }

  async handleAnalysis({ data }) {
    try {
      console.log(`Processing analysis of data: ${JSON.stringify(data).substring(0, 100)}...`);
      
      // Use AIUtils to analyze the data with NEAR AI API or simulation
      const analysisResult = await this.aiUtils.analyzeData(data);
      
      return analysisResult;
    } catch (error) {
      console.error('Error handling analysis:', error);
      throw error;
    }
  }

  /**
   * Get the current status of the agent and its connections
   * @returns {Object} Status information
   */
  getStatus() {
    let aiModels = ['simulation'];
    
    // Get AI models if using real API (asynchronously, will update in background)
    if (this.isUsingRealAI) {
      this.aiUtils.getModels()
        .then(models => {
          aiModels = models.map(m => m.id || m.name);
        })
        .catch(err => {
          console.error('Error fetching AI models:', err);
        });
    }
    
    return {
      agent: {
        version: process.env.npm_package_version || '1.0.0',
        status: 'operational'
      },
      near: {
        network: this.nearConfig.networkId,
        connected: !!this.nearConnection,
        accountConfigured: !!process.env.NEAR_ACCOUNT_ID
      },
      ai: {
        mode: this.isUsingRealAI ? 'api' : 'simulation',
        apiConfigured: !!this.authToken,
        model: process.env.NEAR_AI_MODEL || 'simulation',
        authConfigured: !!this.authToken,
        availableModels: aiModels,
        accountId: process.env.NEAR_ACCOUNT_ID || 'none'
      },
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = AgentService; 