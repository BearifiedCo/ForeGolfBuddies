# 🏌️‍♂️ Golf App API Setup Guide

## 🔑 API Credentials

Your Golf App has been configured with the following API credentials:

- **App ID**: `cmem4pva50003jvObmcwrcwmx`
- **App Secret**: `39saxNG5LknvG9RLvyn5ZR6YnJDuMfRpL4dUbqA8gP8kzeNb76uLtwU9cRirKUESvknDRU5ytBGB9prYdat5cft5`

## 📁 Configuration Files Created

### 1. `src/config/environment.ts`
- Environment-specific configuration
- Supports development, staging, and production environments
- Automatically logs environment info in development mode

### 2. `src/config/api.ts`
- Basic API configuration and helper functions
- Headers and authentication setup
- URL building utilities

### 3. `src/api/golf-api.ts`
- Complete Golf API service class
- Methods for courses, bookings, users, posts, and friends
- Proper error handling and authentication

## 🚀 How to Use

### Basic Usage
```typescript
import { golfApi } from '../api/golf-api';

// Get all golf courses
const courses = await golfApi.getCourses();

// Create a new booking
const newBooking = await golfApi.createBooking({
  courseName: 'Pebble Beach',
  date: '2024-01-15',
  time: '10:00 AM',
  maxPlayers: 4
});
```

### Environment Configuration
```typescript
import { CURRENT_ENV, getEnvConfig } from '../config/environment';

// Access current environment config
console.log('App ID:', CURRENT_ENV.APP_ID);
console.log('Base URL:', CURRENT_ENV.BASE_URL);

// Get environment-specific config
const config = getEnvConfig();
```

## ⚙️ Customization

### Update Base URLs
Edit `src/config/environment.ts` and update the `BASE_URL` for each environment:

```typescript
development: {
  BASE_URL: 'https://your-dev-api.com', // Your development API URL
  // ... other config
},
staging: {
  BASE_URL: 'https://your-staging-api.com', // Your staging API URL
  // ... other config
},
production: {
  BASE_URL: 'https://your-production-api.com', // Your production API URL
  // ... other config
}
```

### Add New API Endpoints
Extend the `GolfApiService` class in `src/api/golf-api.ts`:

```typescript
async getWeatherForecast(courseId: string): Promise<any> {
  try {
    const response = await this.apiRequest(`/courses/${courseId}/weather`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
}
```

## 🔒 Security Notes

- **Never commit API secrets to version control**
- **Use environment variables in production**
- **Rotate API keys regularly**
- **Monitor API usage and implement rate limiting**

## 🌍 Environment Variables (Alternative Setup)

If you prefer using environment variables, you can create a `.env` file in your project root:

```bash
# .env (DO NOT COMMIT THIS FILE)
EXPO_PUBLIC_APP_ID=cmem4pva50003jvObmcwrcwmx
EXPO_PUBLIC_APP_SECRET=39saxNG5LknvG9RLvyn5ZR6YnJDuMfRpL4dUbqA8gP8kzeNb76uLtwU9cRirKUESvknDRU5ytBGB9prYdat5cft5
EXPO_PUBLIC_API_BASE_URL=https://api.yourservice.com
```

Then update the environment config to use them:

```typescript
export const ENV_CONFIG = {
  development: {
    APP_ID: process.env.EXPO_PUBLIC_APP_ID || 'cmem4pva50003jvObmcwrcwmx',
    APP_SECRET: process.env.EXPO_PUBLIC_APP_SECRET || '39saxNG5LknvG9RLvyn5ZR6YnJDuMfRpL4dUbqA8gP8kzeNb76uLtwU9cRirKUESvknDRU5ytBGB9prYdat5cft5',
    BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'https://dev-api.yourservice.com',
    DEBUG: true,
  },
  // ... other environments
};
```

## 📱 Testing the API

### Health Check
```typescript
import { golfApi } from '../api/golf-api';

// Test API connection
const isHealthy = await golfApi.healthCheck();
console.log('API Health:', isHealthy ? '✅ Healthy' : '❌ Unhealthy');
```

### Error Handling
```typescript
try {
  const courses = await golfApi.getCourses();
  console.log('Courses loaded:', courses.length);
} catch (error) {
  console.error('Failed to load courses:', error.message);
  // Handle error gracefully in your UI
}
```

## 🎯 Next Steps

1. **Update the `BASE_URL`** in `src/config/environment.ts` to match your actual API endpoint
2. **Test the API connection** using the health check method
3. **Integrate the API service** into your existing screens and components
4. **Replace mock data** with real API calls
5. **Add error handling** and loading states to your UI

## 🆘 Need Help?

If you encounter any issues:
- Check the console for environment configuration logs
- Verify your API base URL is correct
- Ensure your API service is running and accessible
- Check network requests in your browser's developer tools

---

**Happy Golfing! 🏌️‍♂️⛳**
