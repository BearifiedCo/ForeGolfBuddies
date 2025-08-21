import { User, Booking, Post, GolfCourse } from '../types/golf';

export const mockCourses: GolfCourse[] = [
  {
    id: '1',
    name: 'Pebble Beach Golf Links',
    location: 'Pebble Beach, CA',
    rating: 4.9,
    holes: 18,
    par: 72,
  },
  {
    id: '2',
    name: 'Augusta National Golf Club',
    location: 'Augusta, GA',
    rating: 4.8,
    holes: 18,
    par: 72,
  },
  {
    id: '3',
    name: 'St. Andrews Old Course',
    location: 'St. Andrews, Scotland',
    rating: 4.7,
    holes: 18,
    par: 72,
  },
  {
    id: '4',
    name: 'Torrey Pines Golf Course',
    location: 'La Jolla, CA',
    rating: 4.6,
    holes: 18,
    par: 72,
  },
];

export const mockUsers: User[] = [
  {
    id: '2',
    email: 'john.doe@example.com',
    name: 'John Doe',
    handicap: 12,
    location: 'Los Angeles, CA',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    email: 'sarah.smith@example.com',
    name: 'Sarah Smith',
    handicap: 8,
    location: 'San Diego, CA',
    createdAt: new Date('2024-02-20'),
  },
  {
    id: '4',
    email: 'mike.johnson@example.com',
    name: 'Mike Johnson',
    handicap: 18,
    location: 'San Francisco, CA',
    createdAt: new Date('2024-03-10'),
  },
  {
    id: '5',
    email: 'emily.davis@example.com',
    name: 'Emily Davis',
    handicap: 14,
    location: 'Sacramento, CA',
    createdAt: new Date('2024-03-25'),
  },
];

export const mockBookings: Booking[] = [
  {
    id: '1',
    courseId: '1',
    courseName: 'Pebble Beach Golf Links',
    date: new Date('2024-12-25'),
    time: '10:30 AM',
    createdBy: '2',
    maxPlayers: 4,
    currentPlayers: 3,
    status: 'open',
    description: 'Beautiful morning round at Pebble Beach! Looking for one more player.',
    createdAt: new Date('2024-12-20'),
  },
  {
    id: '2',
    courseId: '4',
    courseName: 'Torrey Pines Golf Course',
    date: new Date('2024-12-28'),
    time: '2:00 PM',
    createdBy: '3',
    maxPlayers: 4,
    currentPlayers: 4,
    status: 'full',
    description: 'Afternoon round with ocean views. Group is full but join waitlist!',
    createdAt: new Date('2024-12-22'),
  },
  {
    id: '3',
    courseId: '2',
    courseName: 'Augusta National Golf Club',
    date: new Date('2025-01-05'),
    time: '8:00 AM',
    createdBy: '4',
    maxPlayers: 4,
    currentPlayers: 2,
    status: 'open',
    description: 'Early morning tee time at Augusta! Serious golfers only.',
    createdAt: new Date('2024-12-23'),
  },
];

export const mockPosts: Post[] = [
  {
    id: '1',
    userId: '2',
    bookingId: '1',
    content: 'Just booked a tee time at Pebble Beach for Christmas Day! Who wants to join? 🏌️‍♂️',
    type: 'booking',
    likes: 5,
    comments: [
      {
        id: '1',
        postId: '1',
        userId: '3',
        content: 'Wish I could join! Have an amazing round!',
        createdAt: new Date('2024-12-21'),
      }
    ],
    createdAt: new Date('2024-12-20'),
  },
  {
    id: '2',
    userId: '3',
    content: 'Had an incredible round at Torrey Pines today! Shot my personal best 78! 🎉',
    type: 'activity',
    likes: 12,
    comments: [
      {
        id: '2',
        postId: '2',
        userId: '2',
        content: 'Congrats! That is awesome!',
        createdAt: new Date('2024-12-22'),
      },
      {
        id: '3',
        postId: '2',
        userId: '4',
        content: 'Way to go! What was the key to your success?',
        createdAt: new Date('2024-12-22'),
      }
    ],
    createdAt: new Date('2024-12-22'),
  },
  {
    id: '3',
    userId: '4',
    content: 'Looking forward to the new golf season! Anyone else excited for 2025? 🏌️‍♀️',
    type: 'general',
    likes: 8,
    comments: [],
    createdAt: new Date('2024-12-23'),
  },
];

export const initializeMockData = () => {
  return {
    courses: mockCourses,
    users: mockUsers,
    bookings: mockBookings,
    posts: mockPosts,
  };
};