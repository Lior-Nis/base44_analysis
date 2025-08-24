import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68a94f1468126a4ce7c7312d", 
  requiresAuth: true // Ensure authentication is required for all operations
});
