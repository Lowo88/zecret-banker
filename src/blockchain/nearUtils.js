/**
 * NEAR Blockchain Utilities for Zecret-banker
 * 
 * This module provides utility functions for interacting with the NEAR blockchain.
 */

const { connect, keyStores, WalletConnection, utils } = require('near-api-js');
const NearIntentsUtils = require('./nearIntentsUtils');

class NearUtils {
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
    
    // Initialize NEAR Intents utilities
    this.intents = new NearIntentsUtils(this.config);
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
      
      // Initialize NEAR Intents utilities
      await this.intents.initialize();
      
      return true;
    } catch (error) {
      console.error('Error initializing NEAR:', error);
      throw error;
    }
  }

  /**
   * Request sign-in with NEAR Wallet
   */
  async signIn() {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }
    
    try {
      await this.wallet.requestSignIn({
        contractId: this.config.contractId,
        methodNames: [], // optional
        successUrl: window.location.origin + '/auth-success.html',
        failureUrl: window.location.origin + '/auth-failure.html'
      });
      
      return true;
    } catch (error) {
      console.error('Error signing in with NEAR Wallet:', error);
      throw error;
    }
  }

  /**
   * Sign out from NEAR Wallet
   */
  signOut() {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }
    
    this.wallet.signOut();
    this.account = null;
    console.log('User signed out');
    
    return true;
  }

  /**
   * Get the account ID of the signed-in user
   */
  getAccountId() {
    return this.wallet?.getAccountId() || null;
  }

  /**
   * Check if user is signed in
   */
  isSignedIn() {
    return this.wallet?.isSignedIn() || false;
  }

  /**
   * Get account balance
   */
  async getAccountBalance() {
    if (!this.account) {
      throw new Error('User not signed in');
    }
    
    try {
      const balance = await this.account.getAccountBalance();
      return {
        total: utils.format.formatNearAmount(balance.total),
        available: utils.format.formatNearAmount(balance.available),
        staked: utils.format.formatNearAmount(balance.staked),
        stateStaked: utils.format.formatNearAmount(balance.stateStaked)
      };
    } catch (error) {
      console.error('Error getting account balance:', error);
      throw error;
    }
  }

  /**
   * Call a view method on a NEAR contract
   */
  async callViewMethod(contractId, methodName, args = {}) {
    if (!this.account) {
      throw new Error('User not signed in');
    }
    
    try {
      const result = await this.account.viewFunction({
        contractId,
        methodName,
        args
      });
      
      return result;
    } catch (error) {
      console.error(`Error calling view method ${methodName} on ${contractId}:`, error);
      throw error;
    }
  }

  /**
   * Call a change method on a NEAR contract
   */
  async callChangeMethod(contractId, methodName, args = {}, gas = '100000000000000', deposit = '0') {
    if (!this.account) {
      throw new Error('User not signed in');
    }
    
    try {
      const result = await this.account.functionCall({
        contractId,
        methodName,
        args,
        gas,
        attachedDeposit: deposit
      });
      
      return result;
    } catch (error) {
      console.error(`Error calling change method ${methodName} on ${contractId}:`, error);
      throw error;
    }
  }

  /**
   * Create a bridge intent to Zcash using NEAR Intents
   */
  async bridgeToZcash(amount, receiverZcashAddress, shielded = false) {
    return await this.intents.createBridgeToZcashIntent({
      amount,
      receiverZcashAddress,
      shielded
    });
  }

  /**
   * Create a bridge intent to Secret Network using NEAR Intents
   */
  async bridgeToSecret(amount, receiverSecretAddress, encrypted = false) {
    return await this.intents.createBridgeToSecretIntent({
      amount,
      receiverSecretAddress,
      encrypted
    });
  }

  /**
   * Create a private swap intent using NEAR Intents
   */
  async createPrivateSwap(fromToken, toToken, amount, minAmountOut = '0', privacyLevel = 'standard') {
    return await this.intents.createPrivateSwapIntent({
      fromToken,
      toToken,
      amount,
      minAmountOut,
      privacyLevel
    });
  }

  /**
   * Check the status of an intent
   */
  async checkIntentStatus(intentId) {
    return await this.intents.queryIntentStatus(intentId);
  }
}

module.exports = NearUtils; 