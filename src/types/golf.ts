export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  handicap: number;
  location: string;
  createdAt: Date;
}

export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
}

export interface Booking {
  id: string;
  courseId: string;
  courseName: string;
  date: Date;
  time: string;
  createdBy: string;
  maxPlayers: number;
  currentPlayers: number;
  status: 'open' | 'full' | 'completed' | 'cancelled';
  description?: string;
  createdAt: Date;
}

export interface BookingPlayer {
  id: string;
  bookingId: string;
  userId: string;
  status: 'confirmed' | 'pending' | 'declined';
  joinedAt: Date;
}

export interface Post {
  id: string;
  userId: string;
  bookingId?: string;
  content: string;
  type: 'booking' | 'activity' | 'general';
  likes: number;
  comments: Comment[];
  createdAt: Date;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: Date;
}

export interface GolfCourse {
  id: string;
  name: string;
  location: string;
  rating: number;
  holes: number;
  par: number;
}