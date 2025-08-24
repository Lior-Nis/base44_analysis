import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68a955ccf1a50b0ecd6677eb", 
  requiresAuth: true // Ensure authentication is required for all operations
});
