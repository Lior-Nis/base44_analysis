import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68a95b2fde3ed34d1e0a0b09", 
  requiresAuth: true // Ensure authentication is required for all operations
});
