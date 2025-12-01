export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          phone_number: string | null
          avatar_url: string | null
          handicap: number
          home_club: string | null
          location: string | null
          bio: string | null
          cover_photo_url: string | null
          is_private: boolean
          is_verified: boolean
          website: string | null
          two_factor_enabled: boolean
          two_factor_method: string
          wallet_address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          phone_number?: string | null
          avatar_url?: string | null
          handicap?: number
          home_club?: string | null
          location?: string | null
          bio?: string | null
          cover_photo_url?: string | null
          is_private?: boolean
          is_verified?: boolean
          website?: string | null
          two_factor_enabled?: boolean
          two_factor_method?: string
          wallet_address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone_number?: string | null
          avatar_url?: string | null
          handicap?: number
          home_club?: string | null
          location?: string | null
          bio?: string | null
          cover_photo_url?: string | null
          is_private?: boolean
          is_verified?: boolean
          website?: string | null
          two_factor_enabled?: boolean
          two_factor_method?: string
          wallet_address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_stats: {
        Row: {
          user_id: string
          games_played: number
          average_score: number
          best_score: number
          courses_played: number
          forepoints_balance: number
          followers_count: number
          following_count: number
          posts_count: number
        }
        Insert: {
          user_id: string
          games_played?: number
          average_score?: number
          best_score?: number
          courses_played?: number
          forepoints_balance?: number
          followers_count?: number
          following_count?: number
          posts_count?: number
        }
        Update: {
          user_id?: string
          games_played?: number
          average_score?: number
          best_score?: number
          courses_played?: number
          forepoints_balance?: number
          followers_count?: number
          following_count?: number
          posts_count?: number
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          content: string
          image_url: string | null
          location: string | null
          round_id: string | null
          likes_count: number
          comments_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          image_url?: string | null
          location?: string | null
          round_id?: string | null
          likes_count?: number
          comments_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          image_url?: string | null
          location?: string | null
          round_id?: string | null
          likes_count?: number
          comments_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          parent_id: string | null
          content: string
          likes_count: number
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          parent_id?: string | null
          content: string
          likes_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          parent_id?: string | null
          content?: string
          likes_count?: number
          created_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          post_id: string | null
          comment_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id?: string | null
          comment_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string | null
          comment_id?: string | null
          created_at?: string
        }
      }
      friendships: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          status?: string
          created_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          is_group: boolean
          name: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          is_group?: boolean
          name?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          is_group?: boolean
          name?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      conversation_participants: {
        Row: {
          id: string
          conversation_id: string
          user_id: string
          joined_at: string
          last_read_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          user_id: string
          joined_at?: string
          last_read_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          user_id?: string
          joined_at?: string
          last_read_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          image_url: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          image_url?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          image_url?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
      rounds: {
        Row: {
          id: string
          user_id: string
          course_name: string
          course_location: string | null
          date: string
          total_score: number
          par: number
          holes_played: number
          weather: string | null
          notes: string | null
          is_posted: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_name: string
          course_location?: string | null
          date: string
          total_score: number
          par?: number
          holes_played?: number
          weather?: string | null
          notes?: string | null
          is_posted?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_name?: string
          course_location?: string | null
          date?: string
          total_score?: number
          par?: number
          holes_played?: number
          weather?: string | null
          notes?: string | null
          is_posted?: boolean
          created_at?: string
        }
      }
      hole_scores: {
        Row: {
          id: string
          round_id: string
          hole_number: number
          par: number
          strokes: number
          putts: number | null
          fairway_hit: boolean | null
          green_in_regulation: boolean | null
        }
        Insert: {
          id?: string
          round_id: string
          hole_number: number
          par: number
          strokes: number
          putts?: number | null
          fairway_hit?: boolean | null
          green_in_regulation?: boolean | null
        }
        Update: {
          id?: string
          round_id?: string
          hole_number?: number
          par?: number
          strokes?: number
          putts?: number | null
          fairway_hit?: boolean | null
          green_in_regulation?: boolean | null
        }
      }
      blocked_users: {
        Row: {
          id: string
          blocker_id: string
          blocked_id: string
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          blocker_id: string
          blocked_id: string
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          blocker_id?: string
          blocked_id?: string
          reason?: string | null
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          content_type: string
          content_id: string
          content_owner_id: string | null
          reason: string
          description: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          content_type: string
          content_id: string
          content_owner_id?: string | null
          reason: string
          description?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string
          content_type?: string
          content_id?: string
          content_owner_id?: string | null
          reason?: string
          description?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      forepoints_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          transaction_type: string
          description: string
          reference_type: string | null
          reference_id: string | null
          blockchain_tx_hash: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          transaction_type: string
          description: string
          reference_type?: string | null
          reference_id?: string | null
          blockchain_tx_hash?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          transaction_type?: string
          description?: string
          reference_type?: string | null
          reference_id?: string | null
          blockchain_tx_hash?: string | null
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          points: number
          category: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          icon: string
          points?: number
          category: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          points?: number
          category?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          earned_at?: string
        }
      }
    }
  }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type UserStats = Database['public']['Tables']['user_stats']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type Like = Database['public']['Tables']['likes']['Row']
export type Friendship = Database['public']['Tables']['friendships']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Round = Database['public']['Tables']['rounds']['Row']
export type HoleScore = Database['public']['Tables']['hole_scores']['Row']
export type BlockedUser = Database['public']['Tables']['blocked_users']['Row']
export type Report = Database['public']['Tables']['reports']['Row']
export type ForepointsTransaction = Database['public']['Tables']['forepoints_transactions']['Row']
export type Achievement = Database['public']['Tables']['achievements']['Row']
export type UserAchievement = Database['public']['Tables']['user_achievements']['Row']

// Extended types with relations
export interface PostWithAuthor extends Post {
  profiles: Profile
}

export interface CommentWithAuthor extends Comment {
  profiles: Profile
}

export interface MessageWithSender extends Message {
  profiles: Profile
}

export interface ConversationWithParticipants extends Conversation {
  conversation_participants: {
    profiles: Profile
  }[]
  messages?: Message[]
}
