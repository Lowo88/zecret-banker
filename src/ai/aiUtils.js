const axios = require('axios');
const nearAIConfig = require('./nearAIConfig');

/**
 * Utility functions for AI operations with NEAR AI APIs
 */
class AIUtils {
  constructor(apiEndpoint, authToken) {
    this.apiEndpoint = apiEndpoint || nearAIConfig.baseUrl;
    this.authToken = authToken;
    this.useActualAPI = !!authToken && process.env.USE_ACTUAL_API === 'true';
    
    // Axios setup
    this.axios = axios.create({
      baseURL: this.apiEndpoint,
      timeout: nearAIConfig.timeout,
      headers: {
        ...nearAIConfig.defaultHeaders,
      }
    });

    // Add auth header if token is provided
    if (this.authToken) {
      this.axios.defaults.headers.common['Authorization'] = `Bearer ${this.authToken}`;
    }
    
    console.log(`AIUtils initialized with ${this.useActualAPI ? 'actual' : 'simulated'} API mode`);
  }

  /**
   * Set authentication token for API calls
   * @param {string} authToken - The NEAR AI authentication token
   */
  setAuthToken(authToken) {
    this.authToken = authToken;
    if (authToken) {
      this.axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      this.useActualAPI = process.env.USE_ACTUAL_API === 'true';
    } else {
      delete this.axios.defaults.headers.common['Authorization'];
      this.useActualAPI = false;
    }
  }

  /**
   * Process a natural language query using NEAR AI
   * @param {string} prompt - The user's prompt
   * @returns {Object} AI response
   */
  async processQuery(prompt) {
    try {
      if (this.useActualAPI) {
        return await this.callNearAIQuery(prompt);
      } else {
        // Fallback to simulation if API is not configured
        return this.simulateAIResponse(prompt);
      }
    } catch (error) {
      console.error('Error processing AI query:', error);
      
      // If API call fails, fallback to simulation
      if (this.useActualAPI) {
        console.log('Falling back to simulation due to API error');
        return this.simulateAIResponse(prompt);
      }
      
      throw error;
    }
  }

  /**
   * Call the NEAR AI Query API
   * @param {string} prompt - The prompt to process
   * @returns {Object} The AI response
   * @private
   */
  async callNearAIQuery(prompt) {
    console.log(`[NEAR AI] Processing query: ${prompt}`);
    
    try {
      const response = await this.axios.post(nearAIConfig.endpoints.query, {
        prompt,
        model: process.env.NEAR_AI_MODEL || nearAIConfig.defaultModel,
        max_tokens: 1000,
        temperature: 0.7
      });
      
      // Transform API response to our standard format
      return {
        type: 'text',
        content: response.data.text || response.data.response || response.data.content,
        confidence: response.data.confidence || 0.9,
        timestamp: new Date().toISOString(),
        model: response.data.model || nearAIConfig.defaultModel,
        raw_response: response.data  // Include the raw response for debugging
      };
    } catch (error) {
      console.error('NEAR AI API error:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  }

  /**
   * Analyze data using NEAR AI capabilities
   * @param {Object} data - Data to analyze
   * @returns {Object} Analysis results
   */
  async analyzeData(data) {
    try {
      if (this.useActualAPI) {
        return await this.callNearAIAnalysis(data);
      } else {
        // Fallback to simulation
        return this.simulateDataAnalysis(data);
      }
    } catch (error) {
      console.error('Error analyzing data with AI:', error);
      
      // Fallback to simulation if API call fails
      if (this.useActualAPI) {
        console.log('Falling back to simulation due to API error');
        return this.simulateDataAnalysis(data);
      }
      
      throw error;
    }
  }

  /**
   * Call the NEAR AI Analysis API
   * @param {Object} data - The data to analyze
   * @returns {Object} The analysis results
   * @private
   */
  async callNearAIAnalysis(data) {
    console.log(`[NEAR AI] Analyzing data: ${JSON.stringify(data).substring(0, 100)}...`);
    
    try {
      const response = await this.axios.post(nearAIConfig.endpoints.analysis, {
        data,
        model: process.env.NEAR_AI_MODEL || nearAIConfig.defaultModel,
        analysis_type: 'comprehensive'
      });
      
      // Transform API response to our standard format
      return {
        summary: response.data.summary || 'Analysis completed',
        insights: response.data.insights || [],
        recommendations: response.data.recommendations || [],
        confidence: response.data.confidence || 0.85,
        timestamp: new Date().toISOString(),
        model: response.data.model || nearAIConfig.defaultModel,
        raw_response: response.data  // Include the raw response for debugging
      };
    } catch (error) {
      console.error('NEAR AI API error:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  }

  /**
   * Get available NEAR AI models
   * @returns {Array} List of available models
   */
  async getModels() {
    if (!this.useActualAPI) {
      return [{
        id: 'simulation',
        name: 'Simulation Model',
        description: 'This is a simulated model, not a real NEAR AI model'
      }];
    }
    
    try {
      const response = await this.axios.get(nearAIConfig.endpoints.models);
      return response.data.models || [];
    } catch (error) {
      console.error('Error fetching NEAR AI models:', error);
      throw error;
    }
  }

  /**
   * Simulate an AI response (used when API is not configured)
   * @param {string} prompt - The user's prompt
   * @returns {Object} Simulated AI response
   * @private
   */
  simulateAIResponse(prompt) {
    console.log(`[AI Simulation] Processing query: ${prompt}`);
    
    // Simulated response with different patterns based on prompt content
    let response;
    
    if (prompt.toLowerCase().includes('near') || prompt.toLowerCase().includes('blockchain')) {
      response = {
        type: 'text',
        content: `NEAR Protocol is a layer one blockchain designed for usability. It features a unique consensus mechanism called Nightshade, which enables high transaction throughput and low fees.`,
        confidence: 0.92,
        timestamp: new Date().toISOString(),
        model: 'simulation'
      };
    } else if (prompt.toLowerCase().includes('price') || prompt.toLowerCase().includes('value')) {
      response = {
        type: 'text',
        content: `I don't have access to real-time price data in this simulation. In a full implementation, I would connect to a price oracle or API to provide current market information.`,
        confidence: 0.85,
        timestamp: new Date().toISOString(),
        model: 'simulation'
      };
    } else if (prompt.toLowerCase().includes('help') || prompt.toLowerCase().includes('capabilities')) {
      response = {
        type: 'text',
        content: `I can help you with information about NEAR Protocol, execute transactions on the blockchain (when properly configured), and analyze data. What would you like to know?`,
        confidence: 0.95,
        timestamp: new Date().toISOString(),
        model: 'simulation'
      };
    } else {
      response = {
        type: 'text',
        content: `This is a simulated response in the NEAR AI Bridge alpha. Your query was: "${prompt}". To get actual AI responses, please configure the NEAR AI API authentication in your environment.`,
        confidence: 0.70,
        timestamp: new Date().toISOString(),
        model: 'simulation'
      };
    }
    
    return response;
  }

  /**
   * Simulate data analysis (used when API is not configured)
   * @param {Object} data - Data to analyze
   * @returns {Object} Simulated analysis results
   * @private
   */
  simulateDataAnalysis(data) {
    console.log(`[AI Simulation] Analyzing data: ${JSON.stringify(data).substring(0, 100)}...`);
    
    // Simple simulation of data analysis
    const insight = this.generateInsight(data);
    
    return {
      summary: insight.summary,
      insights: insight.insights,
      recommendations: insight.recommendations,
      confidence: Math.random() * 0.3 + 0.65, // Random confidence between 0.65 and 0.95
      timestamp: new Date().toISOString(),
      model: 'simulation'
    };
  }

  /**
   * Generate simulated insights based on data
   * @param {Object} data - Input data
   * @returns {Object} Simulated insights
   * @private
   */
  generateInsight(data) {
    // Very simple pattern matching for the simulation
    const dataStr = JSON.stringify(data).toLowerCase();
    
    if (dataStr.includes('transaction') || dataStr.includes('tx')) {
      return {
        summary: "Transaction Pattern Analysis",
        insights: [
          "Transaction frequency appears to follow a regular pattern",
          "Gas usage is within normal parameters for this contract type"
        ],
        recommendations: [
          "Consider batching smaller transactions for gas efficiency",
          "Monitor contract gas usage during peak network times"
        ]
      };
    } else if (dataStr.includes('user') || dataStr.includes('account')) {
      return {
        summary: "User Activity Analysis",
        insights: [
          "User engagement shows periodic patterns",
          "Account activity is consistent with normal usage patterns"
        ],
        recommendations: [
          "Consider implementing user rewards for consistent engagement",
          "Analyze dormant accounts to improve retention"
        ]
      };
    } else {
      return {
        summary: "General Data Analysis",
        insights: [
          "The provided data shows some interesting patterns",
          "Several anomalies were detected that might warrant attention"
        ],
        recommendations: [
          "Consider collecting more detailed data for better analysis",
          "Regular monitoring of these metrics is recommended"
        ]
      };
    }
  }
}

module.exports = AIUtils; 