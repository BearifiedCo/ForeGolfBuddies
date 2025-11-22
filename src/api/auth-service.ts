// Enhanced authentication service with 2FA support
import { User, LoginCredentials, RegisterData, TwoFactorVerification, PasswordResetRequest, PasswordReset, AuthSession } from '../types/golf';

// Mock user database - in production this would be replaced with real API calls
const MOCK_USERS = [
  {
    id: '1',
    email: 'test@golf.com',
    phoneNumber: '+1-555-0123',
    password: 'password123',
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
    twoFactorEnabled: true,
    twoFactorMethod: 'email',
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
    password: 'golf123',
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
  }
];

// Mock 2FA codes storage (in production, this would be in a secure database)
const TWO_FACTOR_CODES = new Map<string, { code: string; expiresAt: Date; method: 'email' | 'phone' }>();

// Mock password reset tokens (in production, this would be in a secure database)
const PASSWORD_RESET_TOKENS = new Map<string, { userId: string; expiresAt: Date }>();

export class AuthService {
  // Simulate network delay
  private delay(ms: number = 1000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generate a random 6-digit code
  private generateTwoFactorCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Generate a random token
  private generateToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  async login(credentials: LoginCredentials): Promise<AuthSession> {
    await this.delay(800);

    const user = MOCK_USERS.find(
      u => u.email === credentials.email && u.password === credentials.password
    );

    if (!user) {
      throw new Error('Invalid email or password');
    }

            // Check if 2FA is required
        if (user.twoFactorEnabled) {
          return {
            user: { ...user, password: undefined } as User,
            token: '',
            expiresAt: new Date(),
            twoFactorRequired: true,
            twoFactorMethod: user.twoFactorMethod as 'email' | 'phone'
          };
        }

            // Return full session if no 2FA required
        const { password, ...userWithoutPassword } = user;
        return {
          user: userWithoutPassword as User,
          token: this.generateToken(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          twoFactorRequired: false
        };
  }

  async verifyTwoFactor(userId: string, code: string, method: 'email' | 'phone'): Promise<AuthSession> {
    await this.delay(600);

    const storedCode = TWO_FACTOR_CODES.get(userId);
    if (!storedCode || storedCode.code !== code || storedCode.method !== method) {
      throw new Error('Invalid or expired verification code');
    }

    if (new Date() > storedCode.expiresAt) {
      TWO_FACTOR_CODES.delete(userId);
      throw new Error('Verification code has expired');
    }

    // Clean up the used code
    TWO_FACTOR_CODES.delete(userId);

    // Find the user
    const user = MOCK_USERS.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

            const { password, ...userWithoutPassword } = user;
        return {
          user: userWithoutPassword as User,
          token: this.generateToken(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          twoFactorRequired: false
        };
  }

  async sendTwoFactorCode(userId: string, method: 'email' | 'phone'): Promise<void> {
    await this.delay(500);

    const user = MOCK_USERS.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    const code = this.generateTwoFactorCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    TWO_FACTOR_CODES.set(userId, { code, expiresAt, method });

    // In production, this would send actual SMS or email
    console.log(`2FA Code for ${method}: ${code} (expires in 10 minutes)`);
  }

  async register(data: RegisterData): Promise<AuthSession> {
    await this.delay(1200);

    // Check if user already exists
    const existingUser = MOCK_USERS.find(u => u.email === data.email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Validate password confirmation
    if (data.password !== data.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    // Create new user
    const newUser: User = {
      id: `${Date.now()}`,
      email: data.email,
      phoneNumber: data.phoneNumber,
      name: data.name,
      avatar: 'https://via.placeholder.com/100',
      handicap: data.handicap || 20,
      homeClub: data.homeClub || '',
      location: data.location || '',
      bio: '',
      profilePicture: 'https://via.placeholder.com/150',
      coverPhoto: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&h=200&fit=crop',
      isPrivate: false,
      isVerified: false,
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      website: '',
      galleryPhotos: [],
      lastActive: new Date(),
      twoFactorEnabled: data.enableTwoFactor,
      twoFactorMethod: data.twoFactorMethod,
      stats: {
        gamesPlayed: 0,
        averageScore: 0,
        bestScore: 0,
        coursesPlayed: 0
      },
      createdAt: new Date()
    };

    // Add to mock database
    MOCK_USERS.push({ ...newUser, password: data.password } as any);

    // If 2FA is enabled, require verification
    if (data.enableTwoFactor && data.twoFactorMethod !== 'none') {
      return {
        user: newUser,
        token: '',
        expiresAt: new Date(),
        twoFactorRequired: true,
        twoFactorMethod: data.twoFactorMethod
      };
    }

    // Return full session if no 2FA required
    return {
      user: newUser,
      token: this.generateToken(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      twoFactorRequired: false
    };
  }

  async requestPasswordReset(email: string, method: 'email' | 'phone'): Promise<void> {
    await this.delay(800);

    const user = MOCK_USERS.find(u => u.email === email);
    if (!user) {
      // Don't reveal if user exists for security
      return;
    }

    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    PASSWORD_RESET_TOKENS.set(token, { userId: user.id, expiresAt });

    // In production, this would send actual SMS or email
    console.log(`Password reset token for ${method}: ${token} (expires in 1 hour)`);
  }

  async resetPassword(token: string, newPassword: string, confirmPassword: string): Promise<void> {
    await this.delay(800);

    if (newPassword !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    const resetData = PASSWORD_RESET_TOKENS.get(token);
    if (!resetData) {
      throw new Error('Invalid or expired reset token');
    }

    if (new Date() > resetData.expiresAt) {
      PASSWORD_RESET_TOKENS.delete(token);
      throw new Error('Reset token has expired');
    }

    // Update user password
    const userIndex = MOCK_USERS.findIndex(u => u.id === resetData.userId);
    if (userIndex !== -1) {
      MOCK_USERS[userIndex].password = newPassword;
    }

    // Clean up the used token
    PASSWORD_RESET_TOKENS.delete(token);
  }

  async logout(): Promise<void> {
    await this.delay(300);
    // In a real app, this would invalidate tokens, etc.
    return;
  }

  async getCurrentUser(): Promise<User | null> {
    // In a real app, this would validate a stored token
    return null;
  }

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    await this.delay(600);

    const userIndex = MOCK_USERS.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Update user in mock database
    const updatedUser = { ...MOCK_USERS[userIndex], ...updates };
    MOCK_USERS[userIndex] = updatedUser as any;

            // Return without password
        const { password, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword as User;
  }

  async updateTwoFactorSettings(userId: string, enabled: boolean, method: 'email' | 'phone' | 'none'): Promise<void> {
    await this.delay(600);

    const userIndex = MOCK_USERS.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    MOCK_USERS[userIndex].twoFactorEnabled = enabled;
    MOCK_USERS[userIndex].twoFactorMethod = method;
  }
}

export const authService = new AuthService();
