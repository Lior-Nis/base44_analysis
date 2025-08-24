import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68a95905d8f6d07c5b9fdd49", 
  requiresAuth: true // Ensure authentication is required for all operations
});
