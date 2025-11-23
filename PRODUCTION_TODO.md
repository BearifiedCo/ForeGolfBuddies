# Production Release Checklist - ForeGolfBuddies

This document outlines the 56 tasks required to prepare the ForeGolfBuddies app for production release on the Apple App Store and Google Play Store.

## Phase 1: Setup & Configuration
- [ ] 1. Audit `package.json` dependencies for unused packages
- [ ] 2. Ensure `package-lock.json` or `bun.lock` is consistent and up-to-date
- [ ] 3. Verify `.gitignore` excludes all sensitive files (.env) and build artifacts
- [ ] 4. Create `.env.example` and ensure strict separation of Dev/Prod secrets
- [ ] 5. Configure `app.json` / `app.config.ts` for production (slug, name, orientation)

## Phase 2: Code Quality & Clean-up
- [ ] 6. Run `eslint` across the entire codebase and fix errors
- [ ] 7. Run `prettier` to verify formatting consistency
- [ ] 8. Remove or disable `console.log` statements for production
- [ ] 9. Remove commented-out legacy code
- [ ] 10. Scan codebase for hardcoded API keys or secrets
- [ ] 11. Review TODOs and FIXMEs in code - resolve or move to post-launch

## Phase 3: Type Safety & Stability
- [ ] 12. Run TypeScript compiler (`tsc --noEmit`) to check for type errors
- [ ] 13. Strengthen type definitions in `src/types`
- [ ] 14. Verify error handling in `src/api` services (try-catch blocks)
- [ ] 15. Ensure `mockData.ts` is NOT used in production flows
- [ ] 16. Verify offline handling capabilities (NetInfo)

## Phase 4: Testing
- [ ] 17. Set up and run Unit Tests (Jest) for critical logic (Auth, Scoring)
- [ ] 18. Manual Test: Login/Registration Flow
- [ ] 19. Manual Test: Scorecard creation and saving
- [ ] 20. Manual Test: Social features (Posts, Comments)
- [ ] 21. Manual Test: Rewards and Sharing
- [ ] 22. Test on physical Android device
- [ ] 23. Test on physical iOS device

## Phase 5: Assets & UI/UX
- [ ] 24. Optimize all static images (png/jpg) for size
- [ ] 25. Verify App Icon scaling (Android adaptive icons, iOS sizes)
- [ ] 26. Verify Splash Screen appearance and transition
- [ ] 27. Check font licensing and proper loading
- [ ] 28. Audit UI for accessibility (Labeling on buttons)
- [ ] 29. Verify UI responsiveness on small screens (SE) vs large screens (Max/Ultra)

## Phase 6: Security
- [ ] 30. Ensure all API calls use HTTPS
- [ ] 31. Verify secure storage of tokens (using Expo SecureStore / Keychain)
- [ ] 32. Review Android Permissions in `app.json` / Manifest
- [ ] 33. Review iOS Permissions (Camera, Photo Library, Location usage descriptions)
- [ ] 34. Check Privacy Policy availability and content

## Phase 7: Performance
- [ ] 35. Profile app startup time
- [ ] 36. Verify FlatList/SectionList performance (key extractors, memoization)
- [ ] 37. Check for memory leaks in navigation flows
- [ ] 38. Minimize bundle size (imports analysis)
- [ ] 39. Configure image caching strategy

## Phase 8: Services & Analytics
- [ ] 40. Configure Error Boundary and Crash Reporting (e.g., Sentry)
- [ ] 41. Set up Analytics (e.g., PostHog/Firebase)
- [ ] 42. Verify Deep Linking configuration (Scheme/Universal Links)
- [ ] 43. Verify Push Notification credentials and handling
- [ ] 44. Test in-app updates configuration (if enabled)

## Phase 9: Build Configuration (Android)
- [ ] 45. Update `versionCode` and `versionName` in `app.json`
- [ ] 46. Generate Production Keystore
- [ ] 47. Configure ProGuard/R8 for code obfuscation and shrinking
- [ ] 48. Build AAB (Android App Bundle) for release

## Phase 10: Build Configuration (iOS)
- [ ] 49. Update `buildNumber` and `version` in `app.json`
- [ ] 50. Configure Distribution Certificate and Provisioning Profile
- [ ] 51. Verify `Info.plist` localizations and permission strings
- [ ] 52. Archive build for App Store Connect

## Phase 11: Store Presence & Submission
- [ ] 53. Prepare App Store Screenshots (iPhone 6.5" and 5.5", iPad if applicable)
- [ ] 54. Prepare Play Store Screenshots (Phone, 7" Tablet, 10" Tablet)
- [ ] 55. Finalize App Description, Keywords, and Marketing URL
- [ ] 56. Submit builds to Review (TestFlight / Internal Testing first)
