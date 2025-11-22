// Environment Configuration for Golf App
// Update these values based on your environment (development, staging, production)

export const ENV_CONFIG = {
  // Development Environment
  development: {
    APP_ID: 'cmem4pva50003jvObmcwrcwmx',
    APP_SECRET: '39saxNG5LknvG9RLvyn5ZR6YnJDuMfRpL4dUbqA8gP8kzeNb76uLtwU9cRirKUESvknDRU5ytBGB9prYdat5cft5',
    BASE_URL: 'https://dev-api.yourservice.com', // Replace with your dev API URL
    PRIVY_APP_ID: 'cmem4pva50003jvObmcwrcwmx', // Your Privy App ID
    DEBUG: true,
  },
  
  // Staging Environment
  staging: {
    APP_ID: 'cmem4pva50003jvObmcwrcwmx',
    APP_SECRET: '39saxNG5LknvG9RLvyn5ZR6YnJDuMfRpL4dUbqA8gP8kzeNb76uLtwU9cRirKUESvknDRU5ytBGB9prYdat5cft5',
    BASE_URL: 'https://staging-api.yourservice.com', // Replace with your staging API URL
    PRIVY_APP_ID: 'cmem4pva50003jvObmcwrcwmx', // Your Privy App ID
    DEBUG: true,
  },
  
  // Production Environment
  production: {
    APP_ID: 'cmem4pva50003jvObmcwrcwmx',
    APP_SECRET: '39saxNG5LknvG9RLvyn5ZR6YnJDuMfRpL4dUbqA8gP8kzeNb76uLtwU9cRirKUESvknDRU5ytBGB9prYdat5cft5',
    BASE_URL: 'https://api.yourservice.com', // Replace with your production API URL
    PRIVY_APP_ID: 'cmem4pva50003jvObmcwrcwmx', // Your Privy App ID
    DEBUG: false,
  },
};

// Get current environment (default to development)
const getCurrentEnv = (): 'development' | 'staging' | 'production' => {
  // You can set this based on your build process or environment variables
  // For now, defaulting to development
  return 'development';
};

// Export current environment config
export const CURRENT_ENV = ENV_CONFIG[getCurrentEnv()];

// Helper function to get environment-specific config
export const getEnvConfig = () => {
  return CURRENT_ENV;
};

// Log environment info (only in development)
if (CURRENT_ENV.DEBUG) {
  console.log('🌍 Golf App Environment:', getCurrentEnv());
  console.log('🔑 App ID:', CURRENT_ENV.APP_ID);
  console.log('🌐 Base URL:', CURRENT_ENV.BASE_URL);
}
