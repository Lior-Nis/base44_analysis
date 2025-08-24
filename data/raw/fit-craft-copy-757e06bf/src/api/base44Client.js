import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68a95a11e45b42ef757e06bf", 
  requiresAuth: true // Ensure authentication is required for all operations
});
