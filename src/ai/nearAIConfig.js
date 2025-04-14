/**
 * Configuration for NEAR AI API integration
 */
const config = {
  // Base URL for NEAR AI API
  baseUrl: process.env.NEAR_AI_API_URL || 'https://api.near.ai',
  
  // Endpoints
  endpoints: {
    query: '/v1/query',
    completion: '/v1/completion',
    analysis: '/v1/analysis',
    models: '/v1/models',
    agents: '/agents',
    registry: '/registry'
  },
  
  // Default model to use if not specified
  defaultModel: process.env.NEAR_AI_MODEL || 'near-ai-agent-v1',
  
  // Request timeout in milliseconds
  timeout: 30000,
  
  // Default headers to include in all requests
  defaultHeaders: {
    'Content-Type': 'application/json',
  },

  // Auth token configuration
  auth: {
    // Message used for signing
    defaultMessage: "Welcome to NEAR AI Hub!",
    // Recipient for the auth token
    defaultRecipient: "ai.near",
    // Callback URL for auth (optional)
    defaultCallbackUrl: "https://app.near.ai/sign-in/callback"
  }
};

module.exports = config; 