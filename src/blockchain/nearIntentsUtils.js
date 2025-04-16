/**
 * NEAR Intents Utilities for Zecret-banker
 * 
 * This module provides functionality for creating and processing NEAR Intents
 * for cross-chain operations between NEAR, Zcash, and Secret Network.
 */

const { connect, keyStores, utils, transactions } = require('near-api-js');

class NearIntentsUtils {
  constructor(config = {}) {
    this.config = {
      networkId: config.networkId || 'testnet',
      nodeUrl: config.nodeUrl || 'https://rpc.testnet.near.org',
      walletUrl: config.walletUrl || 'https://wallet.testnet.near.org',
      helperUrl: config.helperUrl || 'https://helper.testnet.near.org',
      explorerUrl: config.explorerUrl || 'https://explorer.testnet.near.org',
      ...config
    };
    
    this.keyStore = config.keyStore || new keyStores.BrowserLocalStorageKeyStore();
    this.near = null;
    this.wallet = null;
    this.account = null;
    this.bridgeContractId = config.bridgeContractId || 'zcash-bridge.testnet';
    this.secretBridgeContractId = config.secretBridgeContractId || 'secret-bridge.testnet';
    
    // Define intent receivers for different operations
    this.intentReceivers = {
      transfer: 'transfer.intent.near',
      swap: 'swap.intent.near',
      bridge: 'bridge.intent.near',
      private: 'private.intent.near'
    };
  }

  /**
   * Initialize the NEAR connection and wallet
   */
  async initialize() {
    try {
      // Connect to NEAR
      this.near = await connect({
        networkId: this.config.networkId,
        nodeUrl: this.config.nodeUrl,
        walletUrl: this.config.walletUrl,
        helperUrl: this.config.helperUrl,
        explorerUrl: this.config.explorerUrl,
        keyStore: this.keyStore,
      });
      
      // Initialize wallet and account if in browser context
      if (typeof window !== 'undefined') {
        this.wallet = new WalletConnection(this.near, 'zecret-banker');
        
        if (this.wallet.isSignedIn()) {
          this.account = this.wallet.account();
          console.log('User signed in with account:', this.account.accountId);
        } else {
          console.log('User not signed in');
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error initializing NEAR Intents:', error);
      throw error;
    }
  }

  /**
   * Create a NEAR-to-Zcash bridge intent
   * 
   * @param {Object} params - The bridge parameters
   * @param {string} params.amount - Amount of NEAR to bridge
   * @param {string} params.receiverZcashAddress - Recipient Zcash address
   * @param {boolean} params.shielded - Whether to use shielded Zcash transaction
   */
  async createBridgeToZcashIntent(params) {
    if (!this.account) {
      throw new Error('User must be signed in');
    }
    
    const { amount, receiverZcashAddress, shielded } = params;
    
    // Validate parameters
    if (!amount || !receiverZcashAddress) {
      throw new Error('Amount and receiver address are required');
    }
    
    // Convert NEAR amount to yoctoNEAR (1 NEAR = 10^24 yoctoNEAR)
    const amountInYocto = utils.format.parseNearAmount(amount);
    
    // Create the function call action for the bridge contract
    const functionCallAction = transactions.functionCall(
      'bridge_to_zcash',
      {
        receiver_address: receiverZcashAddress,
        shielded: !!shielded
      },
      30000000000000, // 30 TGas
      amountInYocto
    );
    
    // Create the intent transaction
    const intentAction = transactions.functionCall(
      'create_intent',
      {
        intent_type: 'bridge',
        target_chain: 'zcash',
        params: {
          receiver_address: receiverZcashAddress,
          amount: amountInYocto,
          shielded: !!shielded
        }
      },
      100000000000000, // 100 TGas
      utils.format.parseNearAmount('0.01') // Attach 0.01 NEAR for fees
    );
    
    // Sign and send the transaction
    const result = await this.account.signAndSendTransaction({
      receiverId: this.intentReceivers.bridge,
      actions: [intentAction]
    });
    
    return {
      transactionHash: result.transaction.hash,
      status: 'intent_created',
      type: 'bridge_to_zcash',
      params: {
        amount,
        receiverZcashAddress,
        shielded: !!shielded
      },
      intentId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  /**
   * Create a NEAR-to-Secret Network bridge intent
   * 
   * @param {Object} params - The bridge parameters
   * @param {string} params.amount - Amount of NEAR to bridge
   * @param {string} params.receiverSecretAddress - Recipient Secret Network address
   * @param {boolean} params.encrypted - Whether to encrypt the transaction data
   */
  async createBridgeToSecretIntent(params) {
    if (!this.account) {
      throw new Error('User must be signed in');
    }
    
    const { amount, receiverSecretAddress, encrypted } = params;
    
    // Validate parameters
    if (!amount || !receiverSecretAddress) {
      throw new Error('Amount and receiver address are required');
    }
    
    // Convert NEAR amount to yoctoNEAR
    const amountInYocto = utils.format.parseNearAmount(amount);
    
    // Create the intent action
    const intentAction = transactions.functionCall(
      'create_intent',
      {
        intent_type: 'bridge',
        target_chain: 'secret',
        params: {
          receiver_address: receiverSecretAddress,
          amount: amountInYocto,
          encrypted: !!encrypted
        }
      },
      100000000000000, // 100 TGas
      utils.format.parseNearAmount('0.01') // Attach 0.01 NEAR for fees
    );
    
    // Sign and send the transaction
    const result = await this.account.signAndSendTransaction({
      receiverId: this.intentReceivers.bridge,
      actions: [intentAction]
    });
    
    return {
      transactionHash: result.transaction.hash,
      status: 'intent_created',
      type: 'bridge_to_secret',
      params: {
        amount,
        receiverSecretAddress,
        encrypted: !!encrypted
      },
      intentId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  /**
   * Create a private swap intent between NEAR, Zcash, and Secret tokens
   * 
   * @param {Object} params - The swap parameters
   * @param {string} params.fromToken - Source token (e.g., 'NEAR', 'ZEC', 'SCRT')
   * @param {string} params.toToken - Target token (e.g., 'NEAR', 'ZEC', 'SCRT')
   * @param {string} params.amount - Amount to swap
   * @param {string} params.minAmountOut - Minimum amount to receive
   * @param {boolean} params.privacyLevel - Privacy level (e.g., 'maximum', 'standard', 'minimal')
   */
  async createPrivateSwapIntent(params) {
    if (!this.account) {
      throw new Error('User must be signed in');
    }
    
    const { fromToken, toToken, amount, minAmountOut, privacyLevel } = params;
    
    // Validate parameters
    if (!fromToken || !toToken || !amount) {
      throw new Error('From token, to token, and amount are required');
    }
    
    let amountInSmallestUnit;
    if (fromToken === 'NEAR') {
      amountInSmallestUnit = utils.format.parseNearAmount(amount);
    } else {
      // For other tokens, we might need different conversion logic
      amountInSmallestUnit = amount;
    }
    
    // Create the intent action
    const intentAction = transactions.functionCall(
      'create_intent',
      {
        intent_type: 'swap',
        params: {
          from_token: fromToken,
          to_token: toToken,
          amount: amountInSmallestUnit,
          min_amount_out: minAmountOut || '0',
          privacy_level: privacyLevel || 'standard'
        }
      },
      100000000000000, // 100 TGas
      fromToken === 'NEAR' ? amountInSmallestUnit : utils.format.parseNearAmount('0.01') // Attach amount if swapping NEAR
    );
    
    // Sign and send the transaction
    const result = await this.account.signAndSendTransaction({
      receiverId: this.intentReceivers.swap,
      actions: [intentAction]
    });
    
    return {
      transactionHash: result.transaction.hash,
      status: 'intent_created',
      type: 'private_swap',
      params: {
        fromToken,
        toToken,
        amount,
        minAmountOut: minAmountOut || '0',
        privacyLevel: privacyLevel || 'standard'
      },
      intentId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  /**
   * Query the status of an intent by its ID
   * 
   * @param {string} intentId - The ID of the intent to query
   */
  async queryIntentStatus(intentId) {
    if (!intentId) {
      throw new Error('Intent ID is required');
    }
    
    try {
      // In a real implementation, this would call the NEAR RPC to check the intent status
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statuses = ['pending', 'processing', 'completed', 'failed'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      return {
        intentId,
        status: randomStatus,
        lastUpdated: new Date().toISOString(),
        details: randomStatus === 'completed' ? {
          finalAmount: Math.random() * 10,
          fee: Math.random() * 0.1,
          completedAt: new Date().toISOString()
        } : null
      };
    } catch (error) {
      console.error('Error querying intent status:', error);
      throw error;
    }
  }
}

module.exports = NearIntentsUtils; 