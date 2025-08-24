import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68a95826f177adf4a2c40696", 
  requiresAuth: true // Ensure authentication is required for all operations
});
