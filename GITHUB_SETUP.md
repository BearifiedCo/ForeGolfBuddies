# 🚀 GitHub Setup Guide - ForeBuddies Golf App

## Prerequisites Issue

Your system requires accepting the Xcode license agreement before Git commands will work. Please complete this first step:

### Step 1: Accept Xcode License
Open Terminal and run:
```bash
sudo xcodebuild -license
```
- Press Space to scroll through the license
- Type `agree` when prompted
- Enter your password if requested

---

## Setting Up GitHub Repository

Once the Xcode license is accepted, follow these steps:

### Step 2: Create GitHub Repository

1. **Go to GitHub**: https://github.com
2. **Click** the "+" icon in the top right → "New repository"
3. **Repository Name**: `forebuddies-golf-app` (or your preferred name)
4. **Description**: "Golf social media app with digital scorecard and rewards system"
5. **Visibility**: Choose Private or Public
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. **Click** "Create repository"

### Step 3: Link Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
cd "/Users/imm0rtal_duke.eth/Desktop/Golf App"

# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/forebuddies-golf-app.git

# Verify the remote was added
git remote -v
```

### Step 4: Stage and Commit All Changes

```bash
# Check current status
git status

# Stage all new and modified files
git add .

# Create a commit with all your work
git commit -m "feat: Complete Phase 1 - Social media app with rewards and scorecard system

- Implemented tier-based rewards system with Xbox-style achievements
- Added social sharing for achievements to timeline and external platforms
- Created comprehensive digital scorecard with multi-player support
- Implemented course data service with mock courses
- Added detailed statistics tracking (putts, fairways, greens, penalties)
- Integrated rewards system with automatic achievement tracking
- Built intuitive UI for scoring and round management
- Added persistent storage for rounds and statistics"
```

### Step 5: Push to GitHub

```bash
# Push to GitHub (first time)
git push -u origin main

# If your branch is named 'master' instead of 'main', use:
# git push -u origin master
```

If you get an authentication error, you'll need to set up authentication:

#### Option A: Personal Access Token (Recommended)
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name: "ForeBuddies Development"
4. Select scopes: `repo` (full control of private repositories)
5. Click "Generate token"
6. **COPY THE TOKEN** (you won't see it again!)
7. When pushing, use the token as your password

#### Option B: SSH Key
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy the public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub: Settings → SSH and GPG keys → New SSH key
# Then update remote to use SSH:
git remote set-url origin git@github.com:YOUR_USERNAME/forebuddies-golf-app.git
```

---

## Quick Reference Commands

### Daily Workflow
```bash
# Check what's changed
git status

# Stage specific files
git add src/screens/NewScreen.tsx
git add src/components/NewComponent.tsx

# Or stage all changes
git add .

# Commit with a message
git commit -m "feat: Add new feature description"

# Push to GitHub
git push
```

### Useful Git Commands
```bash
# See commit history
git log --oneline

# See what changed in files
git diff

# Undo changes to a file (before staging)
git checkout -- filename.tsx

# Unstage a file
git reset HEAD filename.tsx

# See remote repository info
git remote -v

# Pull latest changes (when co-founder makes updates)
git pull origin main
```

---

## Sharing with Your Co-Founder

### Option 1: Add as Collaborator (Private Repo)
1. Go to your repository on GitHub
2. Click **Settings** → **Collaborators**
3. Click **Add people**
4. Enter your co-founder's GitHub username or email
5. They'll receive an invitation to collaborate

### Option 2: Public Repository
If the repository is public, your co-founder can:
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/forebuddies-golf-app.git

# Navigate into the project
cd forebuddies-golf-app

# Install dependencies
npm install
# or
bun install

# Start the development server
npx expo start
```

---

## Project Structure Overview

Share this with your co-founder:

```
Golf App/
├── src/
│   ├── screens/          # All app screens
│   │   ├── ScorecardScreen.tsx
│   │   ├── AchievementsScreen.tsx
│   │   ├── HomeFeedScreen.tsx
│   │   └── ...
│   ├── components/       # Reusable components
│   │   ├── RewardShareModal.tsx
│   │   ├── AchievementPost.tsx
│   │   └── ...
│   ├── state/           # Zustand stores
│   │   ├── rewardsStore.ts
│   │   ├── scorecardStore.ts
│   │   └── ...
│   ├── services/        # Business logic
│   │   ├── rewardsService.ts
│   │   ├── courseService.ts
│   │   └── ...
│   ├── types/          # TypeScript types
│   │   ├── rewards.ts
│   │   ├── scorecard.ts
│   │   └── golf.ts
│   └── navigation/     # Navigation setup
├── App.tsx             # Root component
├── package.json        # Dependencies
├── REWARDS_SHARING.md  # Rewards system docs
├── SCORECARD_SYSTEM.md # Scorecard system docs
└── README.md          # Project overview
```

---

## Important Notes

### Environment Variables
If you have API keys or sensitive data:
1. **DO NOT** commit `.env` files to GitHub
2. Create `.env.example` with placeholder values
3. Share actual values with your co-founder securely (not via GitHub)

### Before First Push
Make sure `.gitignore` includes:
```
node_modules/
.expo/
.env
.env.local
*.log
.DS_Store
```

### Branch Strategy (Recommended)
```bash
# Create feature branches for new work
git checkout -b feature/new-feature-name

# Work on the feature, commit changes
git add .
git commit -m "feat: Description of feature"

# Push feature branch
git push origin feature/new-feature-name

# Create Pull Request on GitHub for review
# After approval, merge to main
```

---

## Troubleshooting

### "Permission denied" error
- Check your GitHub authentication (token or SSH key)
- Verify you have write access to the repository

### "Failed to push" error
```bash
# Pull latest changes first
git pull origin main --rebase

# Then push
git push origin main
```

### "Merge conflicts"
```bash
# See conflicted files
git status

# Edit files to resolve conflicts
# Look for <<<<<<< HEAD markers

# After resolving
git add .
git commit -m "fix: Resolve merge conflicts"
git push
```

---

## Next Steps After Setup

1. ✅ Accept Xcode license
2. ✅ Create GitHub repository
3. ✅ Push code to GitHub
4. ✅ Add co-founder as collaborator
5. ✅ Share repository URL with co-founder
6. ✅ Set up development environment on co-founder's machine
7. 🚀 Start collaborating!

---

## Quick Start for Co-Founder

Send this to your co-founder:

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/forebuddies-golf-app.git
cd forebuddies-golf-app

# Install dependencies
npm install

# Start the development server
npx expo start

# Scan QR code with Expo Go app on your phone
# Or press 'i' for iOS simulator, 'a' for Android emulator
```

**Repository URL**: `https://github.com/YOUR_USERNAME/forebuddies-golf-app`

---

Need help? Check out:
- [GitHub Docs](https://docs.github.com)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [Expo Documentation](https://docs.expo.dev)

