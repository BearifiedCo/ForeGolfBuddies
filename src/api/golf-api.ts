import { CURRENT_ENV } from '../config/environment';

// Golf API Service using your configured credentials
export class GolfApiService {
  private baseUrl: string;
  private appId: string;
  private appSecret: string;

  constructor() {
    this.baseUrl = CURRENT_ENV.BASE_URL;
    this.appId = CURRENT_ENV.APP_ID;
    this.appSecret = CURRENT_ENV.APP_SECRET;
  }

  // Get authentication headers
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.appSecret}`,
      'X-App-ID': this.appId,
    };
  }

  // Make authenticated API request
  private async apiRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getHeaders();

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response;
  }

  // Golf Course API Methods
  async getCourses(): Promise<any[]> {
    try {
      const response = await this.apiRequest('/courses');
      return await response.json();
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  }

  async getCourseById(courseId: string): Promise<any> {
    try {
      const response = await this.apiRequest(`/courses/${courseId}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching course:', error);
      throw error;
    }
  }

  // Booking API Methods
  async createBooking(bookingData: any): Promise<any> {
    try {
      const response = await this.apiRequest('/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData),
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  async getBookings(): Promise<any[]> {
    try {
      const response = await this.apiRequest('/bookings');
      return await response.json();
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  }

  async updateBooking(bookingId: string, updateData: any): Promise<any> {
    try {
      const response = await this.apiRequest(`/bookings/${bookingId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  }

  async deleteBooking(bookingId: string): Promise<void> {
    try {
      await this.apiRequest(`/bookings/${bookingId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error;
    }
  }

  // User API Methods
  async getUserProfile(userId: string): Promise<any> {
    try {
      const response = await this.apiRequest(`/users/${userId}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(userId: string, profileData: any): Promise<any> {
    try {
      const response = await this.apiRequest(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Social API Methods
  async getPosts(): Promise<any[]> {
    try {
      const response = await this.apiRequest('/posts');
      return await response.json();
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }

  async createPost(postData: any): Promise<any> {
    try {
      const response = await this.apiRequest('/posts', {
        method: 'POST',
        body: JSON.stringify(postData),
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async getFriends(userId: string): Promise<any[]> {
    try {
      const response = await this.apiRequest(`/users/${userId}/friends`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching friends:', error);
      throw error;
    }
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.apiRequest('/health');
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const golfApi = new GolfApiService();
