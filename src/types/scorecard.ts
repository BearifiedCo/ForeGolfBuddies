// Scorecard and Course Data Types

export interface CourseHole {
  holeNumber: number;
  par: number;
  yardage: {
    black?: number; // Championship tees
    blue?: number;  // Men's tees
    white?: number; // Regular tees
    red?: number;   // Women's/Senior tees
    gold?: number;  // Forward tees
  };
  handicap: number; // Stroke index (1-18)
  description?: string;
}

export interface CourseTeeBox {
  name: string;
  color: string;
  totalYardage: number;
  courseRating: number;
  slopeRating: number;
  par: number;
}

export interface CourseData {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber?: string;
  website?: string;
  holes: CourseHole[];
  teeBoxes: CourseTeeBox[];
  totalPar: number;
  amenities: string[];
  description?: string;
  images: string[];
  priceRange: string;
  features: {
    hasCartRental: boolean;
    hasClubRental: boolean;
    hasProShop: boolean;
    hasRestaurant: boolean;
    hasDrivingRange: boolean;
    hasPuttingGreen: boolean;
  };
}

export interface HoleScore {
  holeNumber: number;
  par: number;
  score?: number;
  putts?: number;
  fairwayHit?: boolean; // null for par 3s
  greenInRegulation?: boolean;
  penalties?: number;
  notes?: string;
}

export interface PlayerScorecard {
  playerId: string;
  playerName: string;
  playerAvatar?: string;
  handicap?: number;
  teeBox: string; // Which tee box they're playing from
  holes: HoleScore[];
  roundStats: {
    totalScore?: number;
    totalPutts: number;
    fairwaysHit: number;
    fairwaysAttempted: number; // Excludes par 3s
    greensInRegulation: number;
    totalPenalties: number;
    frontNineScore?: number;
    backNineScore?: number;
  };
}

export interface ScorecardRound {
  id: string;
  courseId: string;
  courseName: string;
  date: Date;
  startTime?: Date;
  endTime?: Date;
  weather?: {
    temperature?: number;
    windSpeed?: number;
    conditions: 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'foggy';
  };
  players: PlayerScorecard[];
  currentHole: number;
  isCompleted: boolean;
  notes?: string;
  createdBy: string; // User ID who created the round
  sharedWith?: string[]; // User IDs of other players
}

export interface CourseSearchResult {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  distance?: number; // Miles from user location
  rating?: number; // Average rating
  priceRange: string;
  image?: string;
}

export interface ScorecardPreferences {
  defaultTeeBox: string;
  trackPutts: boolean;
  trackFairways: boolean;
  trackGreens: boolean;
  trackPenalties: boolean;
  autoAdvanceHoles: boolean;
  confirmScores: boolean;
  enableNotifications: boolean;
}

// API Response types
export interface CourseSearchParams {
  query?: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // in miles
  maxPrice?: number;
  amenities?: string[];
  minRating?: number;
}

export interface CourseApiResponse {
  courses: CourseData[];
  total: number;
  page: number;
  limit: number;
}

// Statistics and Analysis
export interface RoundStatistics {
  averageScore: number;
  bestScore: number;
  worstScore: number;
  averagePutts: number;
  fairwayAccuracy: number; // percentage
  greenAccuracy: number; // percentage
  mostCommonScore: number;
  scoringAverage: number; // relative to par
  improvementTrend: 'improving' | 'declining' | 'stable';
  roundsPlayed: number;
  coursesPlayed: string[];
}

export interface HoleStatistics {
  holeNumber: number;
  par: number;
  averageScore: number;
  bestScore: number;
  timesPlayed: number;
  birdieMade: number;
  parMade: number;
  bogeyMade: number;
  doubleBogeyOrWorse: number;
  averagePutts: number;
  fairwayPercentage: number;
  greenPercentage: number;
}

// Live scoring events for multiplayer
export interface ScoringEvent {
  id: string;
  roundId: string;
  playerId: string;
  holeNumber: number;
  eventType: 'score_update' | 'putt_update' | 'fairway_update' | 'green_update' | 'hole_completed';
  data: any;
  timestamp: Date;
}

// Course difficulty and recommendations
export interface CourseDifficulty {
  overall: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  factors: {
    length: number; // 1-5 scale
    hazards: number;
    greensComplexity: number;
    fairwayWidth: number;
    roughDifficulty: number;
  };
  recommendedFor: string[];
  tips: string[];
}

// Leaderboard and competition
export interface RoundLeaderboard {
  roundId: string;
  players: {
    playerId: string;
    playerName: string;
    totalScore: number;
    relativeToPar: number;
    thruHole: number;
    position: number;
  }[];
  lastUpdated: Date;
}

export type ScoringMode = 'stroke_play' | 'match_play' | 'stableford' | 'skins';

export interface ScorecardSettings {
  scoringMode: ScoringMode;
  handicapUsed: boolean;
  playingCompetition: boolean;
  competitionName?: string;
  teeBoxRestrictions?: string[];
}

// For future phase 2 features
export interface GPSCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface HoleGPSData {
  holeNumber: number;
  teeBoxGPS: GPSCoordinates;
  pinGPS: GPSCoordinates;
  hazards: {
    type: 'water' | 'sand' | 'trees' | 'ob';
    coordinates: GPSCoordinates[];
  }[];
  yardageMarkers: {
    distance: number;
    coordinates: GPSCoordinates;
  }[];
}
