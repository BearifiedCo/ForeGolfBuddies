import { 
  CourseData, 
  CourseSearchParams, 
  CourseApiResponse, 
  CourseSearchResult,
  CourseDifficulty 
} from '../types/scorecard';

// Mock course data for development
const MOCK_COURSES: CourseData[] = [
  {
    id: 'course_1',
    name: 'Pine Valley Golf Club',
    address: '123 Golf Course Dr',
    city: 'Augusta',
    state: 'GA',
    zipCode: '30901',
    phoneNumber: '(706) 555-0123',
    website: 'https://pinevalleygc.com',
    totalPar: 72,
    priceRange: '$50-$100',
    amenities: ['Cart Rental', 'Pro Shop', 'Restaurant', 'Driving Range'],
    description: 'Championship 18-hole course with challenging water hazards and pristine greens.',
    images: [
      'https://images.unsplash.com/photo-1587174486073-ae5e5cec4ae4?w=800',
      'https://images.unsplash.com/photo-1566736037781-35da5dcc18c1?w=800'
    ],
    features: {
      hasCartRental: true,
      hasClubRental: true,
      hasProShop: true,
      hasRestaurant: true,
      hasDrivingRange: true,
      hasPuttingGreen: true,
    },
    teeBoxes: [
      {
        name: 'Championship',
        color: 'black',
        totalYardage: 7200,
        courseRating: 74.5,
        slopeRating: 142,
        par: 72,
      },
      {
        name: 'Blue',
        color: 'blue',
        totalYardage: 6800,
        courseRating: 72.1,
        slopeRating: 135,
        par: 72,
      },
      {
        name: 'White',
        color: 'white',
        totalYardage: 6200,
        courseRating: 69.8,
        slopeRating: 128,
        par: 72,
      },
      {
        name: 'Red',
        color: 'red',
        totalYardage: 5400,
        courseRating: 66.2,
        slopeRating: 118,
        par: 72,
      },
    ],
    holes: [
      // Front 9
      { holeNumber: 1, par: 4, yardage: { black: 420, blue: 395, white: 365, red: 315 }, handicap: 5 },
      { holeNumber: 2, par: 3, yardage: { black: 185, blue: 165, white: 145, red: 125 }, handicap: 17 },
      { holeNumber: 3, par: 5, yardage: { black: 545, blue: 520, white: 485, red: 430 }, handicap: 1 },
      { holeNumber: 4, par: 4, yardage: { black: 445, blue: 420, white: 385, red: 340 }, handicap: 3 },
      { holeNumber: 5, par: 3, yardage: { black: 195, blue: 175, white: 155, red: 135 }, handicap: 15 },
      { holeNumber: 6, par: 4, yardage: { black: 390, blue: 370, white: 345, red: 295 }, handicap: 11 },
      { holeNumber: 7, par: 5, yardage: { black: 520, blue: 500, white: 470, red: 415 }, handicap: 7 },
      { holeNumber: 8, par: 4, yardage: { black: 415, blue: 395, white: 360, red: 320 }, handicap: 9 },
      { holeNumber: 9, par: 4, yardage: { black: 435, blue: 410, white: 375, red: 325 }, handicap: 13 },
      // Back 9
      { holeNumber: 10, par: 4, yardage: { black: 425, blue: 400, white: 370, red: 320 }, handicap: 6 },
      { holeNumber: 11, par: 3, yardage: { black: 180, blue: 160, white: 140, red: 120 }, handicap: 18 },
      { holeNumber: 12, par: 5, yardage: { black: 555, blue: 530, white: 495, red: 440 }, handicap: 2 },
      { holeNumber: 13, par: 4, yardage: { black: 440, blue: 415, white: 380, red: 335 }, handicap: 4 },
      { holeNumber: 14, par: 3, yardage: { black: 200, blue: 180, white: 160, red: 140 }, handicap: 16 },
      { holeNumber: 15, par: 4, yardage: { black: 395, blue: 375, white: 350, red: 300 }, handicap: 12 },
      { holeNumber: 16, par: 5, yardage: { black: 535, blue: 515, white: 480, red: 425 }, handicap: 8 },
      { holeNumber: 17, par: 4, yardage: { black: 420, blue: 400, white: 365, red: 315 }, handicap: 10 },
      { holeNumber: 18, par: 4, yardage: { black: 450, blue: 425, white: 390, red: 345 }, handicap: 14 },
    ],
  },
  {
    id: 'course_2',
    name: 'Riverside Country Club',
    address: '456 River Bend Rd',
    city: 'Charleston',
    state: 'SC',
    zipCode: '29401',
    phoneNumber: '(843) 555-0456',
    totalPar: 71,
    priceRange: '$30-$70',
    amenities: ['Cart Rental', 'Pro Shop', 'Putting Green'],
    description: 'Scenic course along the river with mature trees and challenging greens.',
    images: [
      'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800'
    ],
    features: {
      hasCartRental: true,
      hasClubRental: false,
      hasProShop: true,
      hasRestaurant: false,
      hasDrivingRange: false,
      hasPuttingGreen: true,
    },
    teeBoxes: [
      {
        name: 'Blue',
        color: 'blue',
        totalYardage: 6400,
        courseRating: 70.5,
        slopeRating: 132,
        par: 71,
      },
      {
        name: 'White',
        color: 'white',
        totalYardage: 5900,
        courseRating: 68.2,
        slopeRating: 125,
        par: 71,
      },
      {
        name: 'Red',
        color: 'red',
        totalYardage: 5200,
        courseRating: 64.8,
        slopeRating: 115,
        par: 71,
      },
    ],
    holes: [
      // Simplified hole data for second course
      { holeNumber: 1, par: 4, yardage: { blue: 385, white: 355, red: 305 }, handicap: 7 },
      { holeNumber: 2, par: 3, yardage: { blue: 165, white: 145, red: 125 }, handicap: 15 },
      { holeNumber: 3, par: 4, yardage: { blue: 420, white: 385, red: 335 }, handicap: 3 },
      { holeNumber: 4, par: 5, yardage: { blue: 520, white: 485, red: 430 }, handicap: 1 },
      { holeNumber: 5, par: 4, yardage: { blue: 395, white: 365, red: 315 }, handicap: 9 },
      { holeNumber: 6, par: 3, yardage: { blue: 180, white: 160, red: 140 }, handicap: 17 },
      { holeNumber: 7, par: 4, yardage: { blue: 410, white: 375, red: 325 }, handicap: 5 },
      { holeNumber: 8, par: 4, yardage: { blue: 370, white: 345, red: 295 }, handicap: 11 },
      { holeNumber: 9, par: 4, yardage: { blue: 425, white: 390, red: 340 }, handicap: 13 },
      { holeNumber: 10, par: 4, yardage: { blue: 400, white: 370, red: 320 }, handicap: 6 },
      { holeNumber: 11, par: 3, yardage: { blue: 170, white: 150, red: 130 }, handicap: 16 },
      { holeNumber: 12, par: 5, yardage: { blue: 535, white: 500, red: 445 }, handicap: 2 },
      { holeNumber: 13, par: 4, yardage: { blue: 415, white: 380, red: 330 }, handicap: 4 },
      { holeNumber: 14, par: 4, yardage: { blue: 380, white: 355, red: 305 }, handicap: 12 },
      { holeNumber: 15, par: 3, yardage: { blue: 190, white: 170, red: 150 }, handicap: 18 },
      { holeNumber: 16, par: 4, yardage: { blue: 430, white: 395, red: 345 }, handicap: 8 },
      { holeNumber: 17, par: 4, yardage: { blue: 405, white: 375, red: 325 }, handicap: 10 },
      { holeNumber: 18, par: 3, yardage: { blue: 175, white: 155, red: 135 }, handicap: 14 },
    ],
  },
];

class CourseService {
  private static instance: CourseService;

  private constructor() {}

  public static getInstance(): CourseService {
    if (!CourseService.instance) {
      CourseService.instance = new CourseService();
    }
    return CourseService.instance;
  }

  // Search for courses
  public async searchCourses(params: CourseSearchParams): Promise<CourseApiResponse> {
    try {
      // In production, this would be an actual API call
      // For now, filter mock data based on search params
      
      let filteredCourses = [...MOCK_COURSES];

      if (params.query) {
        const query = params.query.toLowerCase();
        filteredCourses = filteredCourses.filter(course =>
          course.name.toLowerCase().includes(query) ||
          course.city.toLowerCase().includes(query) ||
          course.state.toLowerCase().includes(query)
        );
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        courses: filteredCourses,
        total: filteredCourses.length,
        page: 1,
        limit: 20,
      };
    } catch (error) {
      console.error('Error searching courses:', error);
      throw new Error('Failed to search courses');
    }
  }

  // Get course by ID
  public async getCourseById(courseId: string): Promise<CourseData | null> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const course = MOCK_COURSES.find(c => c.id === courseId);
      return course || null;
    } catch (error) {
      console.error('Error fetching course:', error);
      throw new Error('Failed to fetch course data');
    }
  }

  // Get courses near location
  public async getNearbyCoursesCoords(latitude: number, longitude: number, radius: number = 25): Promise<CourseSearchResult[]> {
    try {
      // In production, this would calculate actual distances
      // For now, return mock data with simulated distances
      
      await new Promise(resolve => setTimeout(resolve, 400));

      return MOCK_COURSES.map((course, index) => ({
        id: course.id,
        name: course.name,
        address: course.address,
        city: course.city,
        state: course.state,
        distance: Math.round((Math.random() * radius) * 10) / 10, // Random distance for demo
        rating: 4.0 + Math.random() * 1.0, // Random rating 4.0-5.0
        priceRange: course.priceRange,
        image: course.images[0],
      })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } catch (error) {
      console.error('Error fetching nearby courses:', error);
      throw new Error('Failed to fetch nearby courses');
    }
  }

  // Get course difficulty analysis
  public async getCourseDifficulty(courseId: string): Promise<CourseDifficulty | null> {
    try {
      const course = await this.getCourseById(courseId);
      if (!course) return null;

      // Calculate difficulty based on course data
      const avgYardage = course.holes.reduce((sum, hole) => 
        sum + (hole.yardage.white || hole.yardage.blue || 0), 0) / course.holes.length;

      const parThreeCount = course.holes.filter(h => h.par === 3).length;
      const parFiveCount = course.holes.filter(h => h.par === 5).length;

      // Simulate difficulty calculation
      const lengthFactor = avgYardage > 380 ? 5 : avgYardage > 350 ? 4 : avgYardage > 320 ? 3 : 2;
      
      return {
        overall: lengthFactor >= 4 ? 'advanced' : lengthFactor >= 3 ? 'intermediate' : 'beginner',
        factors: {
          length: lengthFactor,
          hazards: 3, // Would analyze course layout
          greensComplexity: 3,
          fairwayWidth: 3,
          roughDifficulty: 3,
        },
        recommendedFor: [
          lengthFactor >= 4 ? 'Experienced players' : 'All skill levels',
          'Tournament play',
          'Golf outings'
        ],
        tips: [
          'Bring extra golf balls for water hazards',
          'Course favors accuracy over distance',
          'Pay attention to pin positions'
        ],
      };
    } catch (error) {
      console.error('Error analyzing course difficulty:', error);
      return null;
    }
  }

  // Get popular courses (trending)
  public async getPopularCourses(limit: number = 10): Promise<CourseSearchResult[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      return MOCK_COURSES.slice(0, limit).map(course => ({
        id: course.id,
        name: course.name,
        address: course.address,
        city: course.city,
        state: course.state,
        rating: 4.0 + Math.random() * 1.0,
        priceRange: course.priceRange,
        image: course.images[0],
      }));
    } catch (error) {
      console.error('Error fetching popular courses:', error);
      throw new Error('Failed to fetch popular courses');
    }
  }

  // Get course recommendations based on user preferences
  public async getRecommendedCourses(userId: string, limit: number = 5): Promise<CourseSearchResult[]> {
    try {
      // In production, this would analyze user preferences, past rounds, etc.
      await new Promise(resolve => setTimeout(resolve, 400));

      return this.getPopularCourses(limit);
    } catch (error) {
      console.error('Error fetching course recommendations:', error);
      throw new Error('Failed to fetch course recommendations');
    }
  }

  // Cache course data locally
  public async cacheCourseData(courseId: string): Promise<void> {
    try {
      const course = await this.getCourseById(courseId);
      if (course) {
        // Store in AsyncStorage for offline access
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        await AsyncStorage.default.setItem(`course_${courseId}`, JSON.stringify(course));
      }
    } catch (error) {
      console.error('Error caching course data:', error);
    }
  }

  // Get cached course data
  public async getCachedCourseData(courseId: string): Promise<CourseData | null> {
    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      const cachedData = await AsyncStorage.default.getItem(`course_${courseId}`);
      return cachedData ? JSON.parse(cachedData) : null;
    } catch (error) {
      console.error('Error getting cached course data:', error);
      return null;
    }
  }
}

// Export singleton instance
export const courseService = CourseService.getInstance();

// Export convenience functions
export const searchCourses = (params: CourseSearchParams) => courseService.searchCourses(params);
export const getCourseById = (courseId: string) => courseService.getCourseById(courseId);
export const getNearbyCoursesCoords = (lat: number, lng: number, radius?: number) => 
  courseService.getNearbyCoursesCoords(lat, lng, radius);
export const getPopularCourses = (limit?: number) => courseService.getPopularCourses(limit);

export default courseService;
