import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68a95754614db9de7c4595b3", 
  requiresAuth: true // Ensure authentication is required for all operations
});
