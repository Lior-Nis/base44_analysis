import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68a958f033d5a200aa5e2d4d", 
  requiresAuth: true // Ensure authentication is required for all operations
});
