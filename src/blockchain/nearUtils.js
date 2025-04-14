const { connect, keyStores, utils } = require('near-api-js');

/**
 * Utility functions for NEAR blockchain interactions
 */
class NearUtils {
  /**
   * Initialize NEAR connection
   * @param {Object} config - NEAR configuration
   * @returns {Object} NEAR connection
   */
  static async initializeNear(config) {
    return await connect(config);
  }

  /**
   * Get account object for a NEAR account
   * @param {Object} near - NEAR connection
   * @param {string} accountId - NEAR account ID
   * @returns {Object} Account object
   */
  static async getAccount(near, accountId) {
    return await near.account(accountId);
  }

  /**
   * Format NEAR amount to yoctoNEAR (smallest unit)
   * @param {string|number} amount - Amount in NEAR
   * @returns {string} Amount in yoctoNEAR
   */
  static formatNearAmount(amount) {
    return utils.format.parseNearAmount(amount.toString());
  }

  /**
   * Format yoctoNEAR to NEAR
   * @param {string} amount - Amount in yoctoNEAR
   * @returns {string} Amount in NEAR
   */
  static formatYoctoToNear(amount) {
    return utils.format.formatNearAmount(amount);
  }

  /**
   * Call a view method on a NEAR contract
   * @param {Object} account - NEAR account
   * @param {string} contractId - Contract ID
   * @param {string} method - Method name
   * @param {Object} args - Method arguments
   * @returns {any} Result of the view method
   */
  static async callViewMethod(account, contractId, method, args = {}) {
    return await account.viewFunction(contractId, method, args);
  }

  /**
   * Call a change method on a NEAR contract
   * @param {Object} account - NEAR account
   * @param {string} contractId - Contract ID
   * @param {string} method - Method name
   * @param {Object} args - Method arguments
   * @param {string} gas - Gas limit (default: 30 TGas)
   * @param {string} attachedDeposit - Attached deposit in yoctoNEAR
   * @returns {Object} Transaction result
   */
  static async callChangeMethod(
    account,
    contractId,
    method,
    args = {},
    gas = '30000000000000',
    attachedDeposit = '0'
  ) {
    return await account.functionCall({
      contractId,
      methodName: method,
      args,
      gas,
      attachedDeposit
    });
  }
}

module.exports = NearUtils; 