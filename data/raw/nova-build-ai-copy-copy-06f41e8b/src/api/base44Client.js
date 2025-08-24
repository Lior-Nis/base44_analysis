import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68a94f0fc47ca2a406f41e8b", 
  requiresAuth: true // Ensure authentication is required for all operations
});
