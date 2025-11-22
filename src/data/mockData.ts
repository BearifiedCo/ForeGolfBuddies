// Mock data for ForeBuddies app
import { User, Post, Comment, Reply, ProfilePhoto, Course } from '../types/golf';

// Mock users with enhanced profiles
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'test@golf.com',
    phoneNumber: '+1-555-0123',
    name: 'Test Golfer',
    avatar: 'https://via.placeholder.com/100',
    handicap: 10,
    homeClub: 'Pine Valley Golf Club',
    location: 'San Francisco, CA',
    bio: 'Passionate golfer who loves the game and making new friends on the course.',
    profilePicture: 'https://via.placeholder.com/150',
    coverPhoto: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&h=200&fit=crop',
    isPrivate: false,
    isVerified: true,
    followersCount: 324,
    followingCount: 189,
    postsCount: 42,
    website: 'testgolfer.com',
    galleryPhotos: [],
    lastActive: new Date(),
    twoFactorEnabled: false,
    twoFactorMethod: 'none',
    stats: {
      gamesPlayed: 45,
      averageScore: 85,
      bestScore: 78,
      coursesPlayed: 12
    },
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    email: 'john@golf.com',
    phoneNumber: '+1-555-0456',
    name: 'John Smith',
    avatar: 'https://via.placeholder.com/100',
    handicap: 8,
    homeClub: 'Augusta National',
    location: 'Augusta, GA',
    bio: 'Golf enthusiast and weekend warrior.',
    profilePicture: 'https://via.placeholder.com/150',
    coverPhoto: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&h=200&fit=crop',
    isPrivate: false,
    isVerified: false,
    followersCount: 156,
    followingCount: 89,
    postsCount: 28,
    website: '',
    galleryPhotos: [],
    lastActive: new Date(),
    twoFactorEnabled: false,
    twoFactorMethod: 'none',
    stats: {
      gamesPlayed: 72,
      averageScore: 82,
      bestScore: 74,
      coursesPlayed: 18
    },
    createdAt: new Date('2024-02-01')
  },
  {
    id: '3',
    email: 'sarah@golf.com',
    phoneNumber: '+1-555-0789',
    name: 'Sarah Johnson',
    handicap: 12,
    homeClub: 'Pebble Beach Golf Links',
    location: 'Monterey, CA',
    bio: 'Weekend golfer, tournament player, always up for a friendly match! ⛳',
    profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b78bb4bd?w=150&h=150&fit=crop&crop=face',
    coverPhoto: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&h=200&fit=crop',
    isPrivate: false,
    isVerified: false,
    followersCount: 156,
    followingCount: 203,
    postsCount: 28,
    website: '',
    galleryPhotos: [],
    lastActive: new Date(),
    twoFactorEnabled: false,
    twoFactorMethod: 'none',
    stats: {
      gamesPlayed: 52,
      averageScore: 82,
      bestScore: 76,
      coursesPlayed: 18
    },
    createdAt: new Date('2024-03-01')
  }
];

// Mock golf courses
export const mockCourses: Course[] = [
  {
    id: '1',
    name: 'Pebble Beach Golf Links',
    location: 'Pebble Beach, CA',
    holes: 18,
    par: 72,
    priceRange: '$$$$',
    amenities: ['Pro Shop', 'Driving Range', 'Restaurant', 'Locker Rooms'],
    images: ['https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=600&fit=crop'],
    description: 'Iconic coastal golf course with stunning ocean views and challenging holes.'
  },
  {
    id: '2',
    name: 'Augusta National Golf Club',
    location: 'Augusta, GA',
    holes: 18,
    par: 72,
    priceRange: '$$$$$',
    amenities: ['Pro Shop', 'Practice Facilities', 'Clubhouse', 'Dining'],
    images: ['https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=600&fit=crop'],
    description: 'Home of The Masters Tournament, featuring pristine conditions and historic holes.'
  },
  {
    id: '3',
    name: 'Pine Valley Golf Club',
    location: 'Pine Valley, NJ',
    holes: 18,
    par: 70,
    priceRange: '$$$$$',
    amenities: ['Pro Shop', 'Practice Range', 'Clubhouse', 'Dining'],
    images: ['https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=600&fit=crop'],
    description: 'Consistently ranked as one of the world\'s best golf courses.'
  },
  {
    id: '4',
    name: 'Torrey Pines Golf Course',
    location: 'La Jolla, CA',
    holes: 36,
    par: 72,
    priceRange: '$$$',
    amenities: ['Pro Shop', 'Driving Range', 'Restaurant', 'Golf Cart'],
    images: ['https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=600&fit=crop'],
    description: 'Public golf course with spectacular Pacific Ocean views and challenging terrain.'
  },
  {
    id: '5',
    name: 'Olympic Club',
    location: 'San Francisco, CA',
    holes: 18,
    par: 72,
    priceRange: '$$$$',
    amenities: ['Pro Shop', 'Practice Facilities', 'Clubhouse', 'Dining'],
    images: ['https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=600&fit=crop'],
    description: 'Historic golf club that has hosted multiple U.S. Open Championships.'
  }
];

// Mock posts with correct user references
export const mockPosts: Post[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Test Golfer',
    userAvatar: 'https://via.placeholder.com/100',
    content: 'Just played an amazing round at Pebble Beach! The ocean views were incredible and I managed to break 80 for the first time. What a day!',
    type: 'general',
    location: 'Pebble Beach, CA',
    courseId: '1',
    courseName: 'Pebble Beach Golf Links',
    likes: 45,
    likedBy: ['2', '3'],
    comments: [
      {
        id: '1',
        postId: '1',
        userId: '2',
        userName: 'John Smith',
        userAvatar: 'https://via.placeholder.com/100',
        content: 'Congrats on breaking 80! Pebble Beach is definitely on my bucket list.',
        likes: 12,
        likedBy: ['1', '3'],
        replies: [],
        createdAt: new Date('2024-12-20T10:30:00Z'),
        updatedAt: new Date('2024-12-20T10:30:00Z')
      },
      {
        id: '2',
        postId: '1',
        userId: '3',
        userName: 'Sarah Johnson',
        userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b78bb4bd?w=150&h=150&fit=crop&crop=face',
        content: 'Bucket list course for sure! How was the weather?',
        likes: 5,
        likedBy: ['2', '1'],
        replies: [
          {
            id: '1',
            commentId: '2',
            userId: '2',
            userName: 'John Smith',
            userAvatar: 'https://via.placeholder.com/100',
            content: 'Perfect! Sunny with a light breeze. Couldn\'t have asked for better conditions.',
            likes: 3,
            likedBy: ['3', '1'],
            createdAt: new Date('2024-12-20T11:00:00Z'),
            updatedAt: new Date('2024-12-20T11:00:00Z')
          }
        ],
        createdAt: new Date('2024-12-20T10:45:00Z'),
        updatedAt: new Date('2024-12-20T10:45:00Z')
      }
    ],
    createdAt: new Date('2024-12-20T09:00:00Z'),
    updatedAt: new Date('2024-12-20T09:00:00Z')
  },
  {
    id: '2',
    userId: '3',
    userName: 'Sarah Johnson',
    userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b78bb4bd?w=150&h=150&fit=crop&crop=face',
    content: 'New personal best today! Shot a 76 at Torrey Pines. The course was in perfect condition and the ocean breeze was just right. Feeling really good about my game lately!',
    type: 'score',
    location: 'La Jolla, CA',
    courseId: '4',
    courseName: 'Torrey Pines Golf Course',
    scoreData: {
      score: 76,
      par: 72,
      course: 'Torrey Pines Golf Course'
    },
    likes: 31,
    likedBy: ['2', '1'],
    comments: [
      {
        id: '3',
        postId: '2',
        userId: '2',
        userName: 'John Smith',
        userAvatar: 'https://via.placeholder.com/100',
        content: 'Incredible round, Sarah! Breaking 80 is a huge milestone. Congrats!',
        likes: 12,
        likedBy: ['3', '1'],
        replies: [],
        createdAt: new Date('2024-12-20T14:00:00Z'),
        updatedAt: new Date('2024-12-20T14:00:00Z')
      }
    ],
    createdAt: new Date('2024-12-20T13:30:00Z'),
    updatedAt: new Date('2024-12-20T13:30:00Z')
  },
  {
    id: '3',
    userId: '2',
    userName: 'John Smith',
    userAvatar: 'https://via.placeholder.com/100',
    content: 'First time playing at Olympic Club today! What an experience. The course was challenging but fair, and I learned a lot about my game. Shot a 98, but had a blast!',
    type: 'general',
    location: 'San Francisco, CA',
    courseId: '5',
    courseName: 'Olympic Club',
    likes: 18,
    likedBy: ['1', '3'],
    comments: [
      {
        id: '4',
        postId: '3',
        userId: '3',
        userName: 'Sarah Johnson',
        userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b78bb4bd?w=150&h=150&fit=crop&crop=face',
        content: 'Olympic Club is a gem! Don\'t worry about the score, focus on the experience. You\'ll get better with each round!',
        likes: 7,
        likedBy: ['2', '1'],
        replies: [],
        createdAt: new Date('2024-12-20T16:00:00Z'),
        updatedAt: new Date('2024-12-20T16:00:00Z')
      }
    ],
    createdAt: new Date('2024-12-20T15:30:00Z'),
    updatedAt: new Date('2024-12-20T15:30:00Z')
  }
];