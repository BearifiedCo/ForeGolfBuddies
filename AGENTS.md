# ForeGolf Buddies Multi-Agent Development Guide

This document coordinates work between multiple AI agents (Claude, Codex, Cursor Composer) for the ForeGolf Buddies app.

## Project Overview

**Name:** ForeGolf Buddies
**Token:** $FORE (on Pump.fun)
**Points:** ForePoints (FP) - off-chain loyalty currency

ForeGolf Buddies is a golf social app with:
- React Native / Expo SDK 53
- TypeScript
- NativeWind (Tailwind CSS)
- Zustand state management
- Supabase (PostgreSQL + Auth) - CONFIGURED
- Privy (Web3 Auth + Embedded Solana Wallets) - CONFIGURED
- ForePoints rewards system - IN PROGRESS
- Trip booking and buddy matching - PLANNED

---

## Economy Model: ForePoints + $FORE

### Two-Layer System

1. **ForePoints (Off-chain, Supabase)**
   - UX-friendly, no wallet needed
   - Pure "loyalty" feel like Starbucks Stars
   - Day-to-day rewards currency

2. **$FORE Token (On-chain, Pump.fun)**
   - Liquid, tradable, community token
   - Powers giveaways, sponsorships, IRL events
   - The "backstage pass" for believers and builders

### How Users Earn ForePoints

| Action | ForePoints |
|--------|------------|
| Log a round | +25 FP |
| Complete a trip | +100 FP |
| Invite a buddy (signup) | +50 FP |
| Trip with 4+ buddies | +150 FP bonus |
| Write a course review | +30 FP |
| First round of the week | +50 FP bonus |
| Birdie scored | +5 FP |
| Eagle scored | +25 FP |
| Hole-in-one | +500 FP |
| Livestream quest completion | +Variable |

### How Users Spend ForePoints

- **Trip Perks:** Priority booking, free cart raffles
- **App Cosmetics:** Profile frames, scorecard themes
- **Giveaway Entries:** Burn FP to enter $FORE raffles
- **IRL Merch:** Hats, towels, ball markers

### Bridge: ForePoints → $FORE

- **Seasonal Drops:** Top FP earners get $FORE airdrops
- **Burn-to-Enter:** Burn FP for raffle tickets to win $FORE
- **Stream Codes:** Redeem codes during livestreams for $FORE

---

## Current State (Phases 1-4 Complete)

### Phase 1: Cleanup - COMPLETE
### Phase 2: Database - COMPLETE
### Phase 3: Web3 Integration - COMPLETE
### Phase 4: Landing Page - COMPLETE

## What's Been Implemented

### Removed Dependencies (Critical for App Store)
The following unused native modules have been removed from `package.json`:
- `expo-location` (was requesting location permission)
- `expo-camera` (camera permission built into expo-image-picker)
- `expo-notifications` (not implemented)
- `expo-contacts` (not implemented)
- `expo-calendar` (not implemented)
- `expo-media-library` (not implemented)
- `expo-battery`, `expo-brightness`, `expo-cellular`, `expo-sensors` (unnecessary)
- `expo-background-fetch` (not implemented)
- `expo-speech`, `expo-sms`, `expo-live-photo` (not implemented)
- `expo-video`, `expo-av`, `expo-sqlite`, `expo-insights` (not implemented)
- `expo-symbols`, `expo-document-picker`, `expo-network-addons` (not implemented)
- `react-native-vision-camera` (not implemented)
- `react-native-maps` (not implemented)
- `react-native-crypto`, `react-native-randombytes`, `react-native-polyfill-globals` (crypto polyfills)
- `jsonwebtoken`, `openai`, `@anthropic-ai/sdk`, `lottie-react-native` (unused)
- `stream`, `buffer` (node polyfills)

### Security Fixes
- Test credentials removed from LoginScreen (`test@golf.com` / `password123`)
- Demo credentials banner removed
- `.env` added to `.gitignore`
- `.env.example` created for developers

### Permissions Configured (app.json)
- `NSPhotoLibraryUsageDescription` - Photo library access for profile pics
- `NSCameraUsageDescription` - Camera access for photos
- Android permissions: READ/WRITE_EXTERNAL_STORAGE, CAMERA

---

## Phase 2: Database & Auth (Cursor Composer with Supabase MCP)

### Prerequisites
1. Create Supabase project at https://supabase.com
2. Get project URL and anon key
3. Add to `.env`:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-key
   ```

### Tasks for Cursor Composer

#### 2.1 Create Database Schema
Create these tables in Supabase:

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  handicap INTEGER DEFAULT 20,
  home_club TEXT,
  location TEXT,
  bio TEXT,
  cover_photo_url TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  website TEXT,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_method TEXT DEFAULT 'none',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User stats
CREATE TABLE user_stats (
  user_id UUID REFERENCES profiles(id) PRIMARY KEY,
  games_played INTEGER DEFAULT 0,
  average_score NUMERIC(5,2) DEFAULT 0,
  best_score INTEGER DEFAULT 0,
  courses_played INTEGER DEFAULT 0,
  forepoints_balance INTEGER DEFAULT 0
);

-- Posts
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  location TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Likes
CREATE TABLE likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, comment_id)
);

-- Friends/Follows
CREATE TABLE friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  friend_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, accepted, blocked
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Messages
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  is_group BOOLEAN DEFAULT FALSE,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE conversation_participants (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(conversation_id, user_id)
);

CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Golf Rounds
CREATE TABLE rounds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  course_name TEXT NOT NULL,
  course_location TEXT,
  date DATE NOT NULL,
  total_score INTEGER NOT NULL,
  par INTEGER DEFAULT 72,
  holes_played INTEGER DEFAULT 18,
  weather TEXT,
  notes TEXT,
  is_posted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE hole_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  round_id UUID REFERENCES rounds(id) ON DELETE CASCADE,
  hole_number INTEGER NOT NULL,
  par INTEGER NOT NULL,
  strokes INTEGER NOT NULL,
  putts INTEGER,
  fairway_hit BOOLEAN,
  green_in_regulation BOOLEAN
);

-- Blocked users (for moderation)
CREATE TABLE blocked_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID REFERENCES profiles(id) NOT NULL,
  blocked_id UUID REFERENCES profiles(id) NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

-- Content reports
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES profiles(id) NOT NULL,
  content_type TEXT NOT NULL, -- post, comment, message, user
  content_id UUID NOT NULL,
  content_owner_id UUID REFERENCES profiles(id),
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending', -- pending, reviewed, resolved
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ForePoints transactions (rewards)
CREATE TABLE forepoints_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, -- earn, spend, transfer
  description TEXT NOT NULL,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements
CREATE TABLE achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  category TEXT NOT NULL
);

CREATE TABLE user_achievements (
  user_id UUID REFERENCES profiles(id) NOT NULL,
  achievement_id UUID REFERENCES achievements(id) NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(user_id, achievement_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE hole_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE forepoints_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
```

#### 2.2 Create API Service Layer
Replace mock services in `src/api/` with real Supabase calls:

File: `src/lib/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

Files to update:
- `src/api/auth-service.ts` - Replace MOCK_USERS with Supabase Auth
- `src/state/feedStore.ts` - Replace mock posts with Supabase queries
- `src/state/friendsStore.ts` - Replace mock friends with Supabase queries
- `src/state/messagesStore.ts` - Replace mock messages with Supabase queries
- `src/state/scorecardStore.ts` - Replace mock rounds with Supabase queries

#### 2.3 Implement Real Auth Flow
Update `src/api/auth-service.ts` to use Supabase Auth:
- Login with email/password
- Register new users
- Password reset via email
- 2FA support (optional, can use Supabase built-in)

---

## Phase 3: Token Integration (Claude + Codex)

### Prerequisites
1. User creates ForePoints SPL token on Pump.fun during livestream
2. Note the token mint address
3. Add to `.env`:
   ```
   EXPO_PUBLIC_FOREPOINTS_TOKEN_MINT=your-mint-address
   ```

### 3.1 Claude Tasks - Privy Integration

Install Privy SDK:
```bash
npm install @privy-io/expo
```

Create `src/lib/privy.ts`:
```typescript
import { PrivyProvider } from '@privy-io/expo';

export const privyConfig = {
  appId: process.env.EXPO_PUBLIC_PRIVY_APP_ID!,
  loginMethods: ['email', 'sms', 'wallet'],
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
    network: 'solana:mainnet-beta',
  },
};
```

Update auth flow to:
1. Use Privy for authentication (email/SMS + embedded wallet)
2. Auto-create Solana wallet for each user
3. Store wallet address in Supabase profiles table

### 3.2 Codex/Composer Tasks - Rewards Backend

Create reward distribution system:
1. `src/services/rewards.ts` - Calculate ForePoints for actions
2. Backend functions (Supabase Edge Functions):
   - Award points for posting rounds
   - Award points for engagement (likes, comments)
   - Deduct points for redemptions

Reward values:
- Post a round: 10 ForePoints
- First round of the week: 50 ForePoints bonus
- Beat personal best: 100 ForePoints
- Birdie: 5 ForePoints
- Eagle: 25 ForePoints
- Hole-in-one: 500 ForePoints
- Like received: 1 ForePoint
- Comment received: 2 ForePoints
- New follower: 5 ForePoints

### 3.3 Token Claiming (Claude)

Create `src/screens/RewardsScreen.tsx`:
- Show ForePoints balance (database balance)
- Show on-chain token balance
- "Claim Tokens" button - transfers from treasury to user wallet
- Transaction history

---

## Phase 4: Launch Prep (Codex/Gemini in Parallel)

### 4.1 Landing Page (Codex)
Create marketing landing page at `forebuddies.com`:
- Hero section with app screenshots
- Features overview (social, scorecard, rewards)
- ForePoints explanation (gamified rewards)
- App Store / TestFlight links
- Pump.fun token link for traders

Tech stack suggestion: Next.js + Tailwind on Vercel

### 4.2 EAS Build Configuration (Claude)

Create `eas.json`:
```json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": { "simulator": true }
    },
    "preview": {
      "distribution": "internal",
      "ios": { "simulator": false }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id",
        "ascAppId": "your-app-store-connect-id"
      }
    }
  }
}
```

Commands:
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build for TestFlight
eas build --platform ios --profile preview

# Submit to TestFlight
eas submit --platform ios
```

### 4.3 TestFlight Submission Checklist
- [ ] App Store Connect account set up
- [ ] App created in App Store Connect
- [ ] Privacy policy URL live
- [ ] Terms of service URL live
- [ ] App screenshots ready
- [ ] App description written
- [ ] Age rating questionnaire completed
- [ ] Content moderation documentation for Apple

---

## Mock Data Locations (To Replace)

Files containing mock/hardcoded data that need Supabase integration:

1. `src/api/auth-service.ts` - MOCK_USERS array (lines 5-68)
2. `src/state/feedStore.ts` - Mock posts data
3. `src/state/friendsStore.ts` - Mock friends/users data
4. `src/state/messagesStore.ts` - Mock conversations/messages
5. `src/state/scorecardStore.ts` - Mock rounds data
6. `src/data/mock-feed.ts` - If exists, all mock feed data
7. `src/data/mock-users.ts` - If exists, all mock user data

---

## Architecture Notes

### State Management (Zustand)
All stores in `src/state/`:
- `authStore.ts` - User authentication state
- `feedStore.ts` - Posts and social feed
- `friendsStore.ts` - Friends and connections
- `messagesStore.ts` - Chat conversations
- `scorecardStore.ts` - Golf rounds and scores
- `moderationStore.ts` - Reports and blocked users (COMPLETE)

### Navigation
`src/navigation/AppNavigator.tsx`:
- Auth screens: Login, Register, TwoFactor, PasswordReset
- Main tabs: Home, Scorecard, Messages, Friends, Profile
- Stack screens: Chat, Settings, BlockedUsers, PrivacyPolicy, etc.

### Screens
15 screens in `src/screens/`:
- HomeFeedScreen - Social feed with posts
- ProfileScreen - User profile view
- ScorecardScreen - View past rounds
- StartRoundScreen - Begin new golf round
- MessagesScreen - Chat list
- ChatScreen - Individual conversation
- FriendsScreen - Friend management
- SettingsScreen - App settings
- BlockedUsersScreen - Manage blocked users
- PrivacyPolicyScreen - In-app privacy policy
- AchievementsScreen - Badges and achievements
- And more...

---

## Commands Reference

```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Install dependencies (use legacy-peer-deps due to Victory Native)
npm install --legacy-peer-deps

# Build for TestFlight
eas build --platform ios --profile preview

# Clear Metro cache
npx expo start --clear
```

---

---

## Phase 5: Trips & Buddies (NEXT)

### 5.1 New Supabase Schema (Cursor Composer)

Add these tables for trips and buddies:

```sql
-- Buddies system
CREATE TABLE buddies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  buddy_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, accepted
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, buddy_id)
);

-- Trips
CREATE TABLE trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  course_name TEXT NOT NULL,
  course_location TEXT,
  trip_date DATE NOT NULL,
  max_buddies INTEGER DEFAULT 4,
  status TEXT DEFAULT 'open', -- open, full, completed, cancelled
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trip participants
CREATE TABLE trip_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT DEFAULT 'invited', -- invited, confirmed, declined
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trip_id, user_id)
);

-- ForePoints balances (fast access)
CREATE TABLE forepoints_balances (
  user_id UUID REFERENCES profiles(id) PRIMARY KEY,
  balance INTEGER DEFAULT 0,
  lifetime_earned INTEGER DEFAULT 0,
  lifetime_spent INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ForePoints events (detailed log)
CREATE TABLE forepoints_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  amount INTEGER NOT NULL,
  event_type TEXT NOT NULL, -- round_logged, trip_completed, referral, stream_code
  source_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stream codes for livestream drops
CREATE TABLE stream_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  forepoints_reward INTEGER DEFAULT 0,
  fore_reward_amount NUMERIC(20,8) DEFAULT 0,
  max_redemptions INTEGER DEFAULT 100,
  current_redemptions INTEGER DEFAULT 0,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stream code redemptions
CREATE TABLE stream_code_redemptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code_id UUID REFERENCES stream_codes(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(code_id, user_id)
);

-- Leaderboards
CREATE TABLE leaderboards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  period TEXT NOT NULL, -- weekly, monthly, alltime
  user_id UUID REFERENCES profiles(id) NOT NULL,
  forepoints INTEGER DEFAULT 0,
  rank INTEGER,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(period, user_id)
);

-- Enable RLS
ALTER TABLE buddies ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE forepoints_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE forepoints_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_code_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
```

### 5.2 App Updates (Claude)

- Rename "Friends" → "Buddies" throughout app
- Add "Trips" tab to navigation
- Create TripScreen - list and create trips
- Create TripDetailScreen - view/join a trip
- Update RewardsScreen with new ForePoints values

---

## Livestream Plan

### Stream Formats

1. **Dev Range Sessions (Mon-Thu)** - Building live, earn Builder's ForePoints
2. **Fore Friday (Every Friday)** - New builds, $FORE drops day
3. **On-Course IRL (Weekends)** - Real golf, stream codes

### Stream Mechanics

- Drop codes during stream → viewers redeem in-app
- "If I hit the fairway, chat gets bonus ForePoints"
- Top viewers earn leaderboard placement

---

## Contact Points

| Agent | Tasks |
|-------|-------|
| **Claude** | App development, Privy, navigation, screens |
| **Cursor Composer** | Supabase schema, RLS policies |
| **Codex** | Landing page, deployment |
| **User** | $FORE token launch, livestream execution |
