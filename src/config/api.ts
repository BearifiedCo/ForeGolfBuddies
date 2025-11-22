// API Configuration for Golf App
export const API_CONFIG = {
  APP_ID: 'cmem4pva50003jvObmcwrcwmx',
  APP_SECRET: '39saxNG5LknvG9RLvyn5ZR6YnJDuMfRpL4dUbqA8gP8kzeNb76uLtwU9cRirKUESvknDRU5ytBGB9prYdat5cft5',
  
  // Base API endpoints (you can customize these based on your API service)
  BASE_URL: 'https://api.yourservice.com', // Replace with your actual API base URL
  
  // Headers for API requests
  getHeaders: () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_CONFIG.APP_SECRET}`,
    'X-App-ID': API_CONFIG.APP_ID,
  }),
  
  // API endpoints
  ENDPOINTS: {
    // Golf course related endpoints
    COURSES: '/courses',
    BOOKINGS: '/bookings',
    USERS: '/users',
    
    // Social features
    POSTS: '/posts',
    FRIENDS: '/friends',
    
    // Authentication
    AUTH: '/auth',
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to make authenticated API requests
export const apiRequest = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const url = buildApiUrl(endpoint);
  const headers = API_CONFIG.getHeaders();
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });
  
  return response;
};
