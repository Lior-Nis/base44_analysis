import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68a95757d26a693a06c345c2", 
  requiresAuth: true // Ensure authentication is required for all operations
});
