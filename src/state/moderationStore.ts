import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ContentReport, BlockedUser, ReportReason, ReportContentType } from '../types/golf';

interface ModerationState {
  reports: ContentReport[];
  blockedUsers: BlockedUser[];
  isLoading: boolean;

  // Report actions
  reportContent: (
    reporterId: string,
    reporterName: string,
    contentType: ReportContentType,
    contentId: string,
    contentOwnerId: string,
    reason: ReportReason,
    description?: string
  ) => void;
  getReportsByUser: (userId: string) => ContentReport[];
  hasReported: (userId: string, contentId: string) => boolean;

  // Block actions
  blockUser: (blockerId: string, blockedUserId: string, blockedUserName: string, reason?: string) => void;
  unblockUser: (blockerId: string, blockedUserId: string) => void;
  isUserBlocked: (blockerId: string, blockedUserId: string) => boolean;
  getBlockedUsers: (blockerId: string) => BlockedUser[];

  // Utility
  setLoading: (loading: boolean) => void;
}

export const useModerationStore = create<ModerationState>()(
  persist(
    (set, get) => ({
      reports: [],
      blockedUsers: [],
      isLoading: false,

      reportContent: (
        reporterId: string,
        reporterName: string,
        contentType: ReportContentType,
        contentId: string,
        contentOwnerId: string,
        reason: ReportReason,
        description?: string
      ) => {
        const newReport: ContentReport = {
          id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          reporterId,
          reporterName,
          contentType,
          contentId,
          contentOwnerId,
          reason,
          description,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          reports: [...state.reports, newReport],
        }));
      },

      getReportsByUser: (userId: string) => {
        return get().reports.filter((report) => report.reporterId === userId);
      },

      hasReported: (userId: string, contentId: string) => {
        return get().reports.some(
          (report) => report.reporterId === userId && report.contentId === contentId
        );
      },

      blockUser: (blockerId: string, blockedUserId: string, blockedUserName: string, reason?: string) => {
        // Don't allow blocking yourself
        if (blockerId === blockedUserId) return;

        // Check if already blocked
        if (get().isUserBlocked(blockerId, blockedUserId)) return;

        const newBlock: BlockedUser = {
          id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          blockerId,
          blockedUserId,
          blockedUserName,
          reason,
          createdAt: new Date(),
        };

        set((state) => ({
          blockedUsers: [...state.blockedUsers, newBlock],
        }));
      },

      unblockUser: (blockerId: string, blockedUserId: string) => {
        set((state) => ({
          blockedUsers: state.blockedUsers.filter(
            (block) => !(block.blockerId === blockerId && block.blockedUserId === blockedUserId)
          ),
        }));
      },

      isUserBlocked: (blockerId: string, blockedUserId: string) => {
        return get().blockedUsers.some(
          (block) => block.blockerId === blockerId && block.blockedUserId === blockedUserId
        );
      },

      getBlockedUsers: (blockerId: string) => {
        return get().blockedUsers.filter((block) => block.blockerId === blockerId);
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'moderation-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Report reason labels for UI
export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  spam: 'Spam or misleading',
  harassment: 'Harassment or bullying',
  inappropriate_content: 'Inappropriate content',
  hate_speech: 'Hate speech or symbols',
  violence: 'Violence or dangerous behavior',
  misinformation: 'False information',
  impersonation: 'Impersonation',
  other: 'Other',
};

// Report reason descriptions for UI
export const REPORT_REASON_DESCRIPTIONS: Record<ReportReason, string> = {
  spam: 'Repetitive posts, scams, or misleading content',
  harassment: 'Targeted attacks, threats, or bullying behavior',
  inappropriate_content: 'Nudity, sexual content, or graphic material',
  hate_speech: 'Content promoting hate based on identity',
  violence: 'Content depicting or promoting violence',
  misinformation: 'Deliberately false or misleading claims',
  impersonation: 'Pretending to be someone else',
  other: 'Other violations not listed above',
};
