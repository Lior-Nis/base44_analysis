import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68a95a06b0aef1e50b7cd394", 
  requiresAuth: true // Ensure authentication is required for all operations
});
