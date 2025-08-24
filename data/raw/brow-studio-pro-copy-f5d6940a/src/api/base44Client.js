import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68a95b088a0286e1f5d6940a", 
  requiresAuth: true // Ensure authentication is required for all operations
});
