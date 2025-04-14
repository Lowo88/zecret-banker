/**
 * Client-side helper functions for NEAR AI authentication
 * This integrates with wallet-selector for browser-based authentication
 */

// Storage key for the NEAR AI authentication object
export const NEAR_AI_AUTH_OBJECT_STORAGE_KEY = "NearAIAuthObject";

/**
 * Handle the callback from NEAR wallet after signing a message
 * This function should be called when the page loads after redirect from wallet
 */
export async function handleNearAILoginCallback() {
  const callbackparams = new URLSearchParams(location.hash);
  const accountId = callbackparams.get("#accountId");

  if (accountId) {
    const nearaiauthobject = JSON.parse(
      localStorage?.getItem(NEAR_AI_AUTH_OBJECT_STORAGE_KEY),
    );
    nearaiauthobject.account_id = accountId;
    nearaiauthobject.signature = callbackparams.get("signature");
    nearaiauthobject.public_key = callbackparams.get("publicKey");
    localStorage.setItem(
      NEAR_AI_AUTH_OBJECT_STORAGE_KEY,
      JSON.stringify(nearaiauthobject),
    );
    location.hash = "";
  }
}

/**
 * Initiate the NEAR AI login process using the wallet selector
 * @param {Object} wallet - NEAR wallet object from wallet-selector
 * @param {string} message - The message to sign (defaults to "Welcome to NEAR AI Hub!")
 * @returns {Object} The authentication object with signature
 */
export async function nearAIlogin(wallet, message = "Welcome to NEAR AI Hub!") {
  // Generate nonce based on current time in milliseconds
  const nonce = new String(Date.now());
  const nonceBuffer = Buffer.from(
    new TextEncoder().encode(nonce.padStart(32, "0")),
  );

  const recipient = "ai.near";
  const callbackUrl = location.href;

  const authObject = {
    message,
    nonce,
    recipient,
    callback_url: callbackUrl,
    signature: "",
    account_id: "",
    public_key: ""
  };

  localStorage.setItem(
    NEAR_AI_AUTH_OBJECT_STORAGE_KEY,
    JSON.stringify(authObject),
  );
  
  const signedMessage = await wallet.signMessage({
    message,
    nonce: nonceBuffer,
    recipient,
    callbackUrl,
  });

  authObject.signature = signedMessage.signature;
  authObject.account_id = signedMessage.accountId;
  authObject.public_key = signedMessage.publicKey;

  localStorage.setItem(
    NEAR_AI_AUTH_OBJECT_STORAGE_KEY,
    JSON.stringify(authObject),
  );

  return authObject;
}

/**
 * Get the current NEAR AI auth token from localStorage
 * @returns {string|null} The current auth token or null if not found
 */
export function getNearAIAuthToken() {
  try {
    const authObjectString = localStorage?.getItem(NEAR_AI_AUTH_OBJECT_STORAGE_KEY);
    if (authObjectString) {
      return authObjectString;
    }
    return null;
  } catch (error) {
    console.error("Error retrieving NEAR AI auth token:", error);
    return null;
  }
} 