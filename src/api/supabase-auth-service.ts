import { supabase } from '../lib/supabase';
import { Profile, UserStats } from '../types/supabase';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  handicap: number;
  home_club: string | null;
  location: string | null;
  bio: string | null;
  cover_photo_url: string | null;
  is_private: boolean;
  is_verified: boolean;
  website: string | null;
  phone_number: string | null;
  wallet_address: string | null;
  two_factor_enabled: boolean;
  two_factor_method: string;
  stats: {
    games_played: number;
    average_score: number;
    best_score: number;
    courses_played: number;
    forepoints_balance: number;
    followers_count: number;
    following_count: number;
    posts_count: number;
  };
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone_number?: string;
  handicap?: number;
  home_club?: string;
  location?: string;
}

export interface AuthSession {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

class SupabaseAuthService {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user || !authData.session) {
      throw new Error('Login failed');
    }

    const user = await this.getFullUserProfile(authData.user.id);

    return {
      user,
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
      expires_at: authData.session.expires_at || Date.now() + 3600000,
    };
  }

  async register(data: RegisterData): Promise<AuthSession> {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          phone_number: data.phone_number,
        },
      },
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('Registration failed');
    }

    // Wait for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update profile with additional info
    if (data.handicap || data.home_club || data.location || data.phone_number) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          handicap: data.handicap,
          home_club: data.home_club,
          location: data.location,
          phone_number: data.phone_number,
        })
        .eq('id', authData.user.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
      }
    }

    // If session exists (email confirmation disabled), return full session
    if (authData.session) {
      const user = await this.getFullUserProfile(authData.user.id);
      return {
        user,
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_at: authData.session.expires_at || Date.now() + 3600000,
      };
    }

    // Email confirmation required - return partial data
    throw new Error('Please check your email to confirm your account');
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }

  async getFullUserProfile(userId: string): Promise<AuthUser> {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      throw new Error('Failed to fetch user profile');
    }

    const { data: stats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Stats might not exist yet for new users
    const userStats = stats || {
      games_played: 0,
      average_score: 0,
      best_score: 0,
      courses_played: 0,
      forepoints_balance: 0,
      followers_count: 0,
      following_count: 0,
      posts_count: 0,
    };

    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      avatar_url: profile.avatar_url,
      handicap: profile.handicap,
      home_club: profile.home_club,
      location: profile.location,
      bio: profile.bio,
      cover_photo_url: profile.cover_photo_url,
      is_private: profile.is_private,
      is_verified: profile.is_verified,
      website: profile.website,
      phone_number: profile.phone_number,
      wallet_address: profile.wallet_address,
      two_factor_enabled: profile.two_factor_enabled,
      two_factor_method: profile.two_factor_method,
      stats: userStats,
      created_at: profile.created_at,
    };
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    try {
      return await this.getFullUserProfile(user.id);
    } catch {
      return null;
    }
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<AuthUser> {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      throw new Error(error.message);
    }

    return await this.getFullUserProfile(userId);
  }

  async updateWalletAddress(userId: string, walletAddress: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ wallet_address: walletAddress })
      .eq('id', userId);

    if (error) {
      throw new Error(error.message);
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'forebuddies://reset-password',
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  // Listen for auth state changes
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const user = await this.getFullUserProfile(session.user.id);
          callback(user);
        } catch {
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }
}

export const supabaseAuthService = new SupabaseAuthService();
