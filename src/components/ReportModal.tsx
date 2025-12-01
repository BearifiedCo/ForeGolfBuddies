import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ReportReason, ReportContentType } from '../types/golf';
import { useModerationStore, REPORT_REASON_LABELS, REPORT_REASON_DESCRIPTIONS } from '../state/moderationStore';
import { useAuthStore } from '../state/authStore';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  contentType: ReportContentType;
  contentId: string;
  contentOwnerId: string;
  contentOwnerName?: string;
}

const REPORT_REASONS: ReportReason[] = [
  'spam',
  'harassment',
  'inappropriate_content',
  'hate_speech',
  'violence',
  'misinformation',
  'impersonation',
  'other',
];

export default function ReportModal({
  visible,
  onClose,
  contentType,
  contentId,
  contentOwnerId,
  contentOwnerName,
}: ReportModalProps) {
  const { user } = useAuthStore();
  const { reportContent, hasReported } = useModerationStore();
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [step, setStep] = useState<'reason' | 'details' | 'success'>('reason');

  const handleSubmitReport = () => {
    if (!user || !selectedReason) return;

    // Check if already reported
    if (hasReported(user.id, contentId)) {
      Alert.alert('Already Reported', 'You have already reported this content.');
      onClose();
      return;
    }

    reportContent(
      user.id,
      user.name,
      contentType,
      contentId,
      contentOwnerId,
      selectedReason,
      additionalInfo.trim() || undefined
    );

    setStep('success');
  };

  const handleClose = () => {
    setSelectedReason(null);
    setAdditionalInfo('');
    setStep('reason');
    onClose();
  };

  const getContentTypeLabel = () => {
    switch (contentType) {
      case 'post':
        return 'post';
      case 'comment':
        return 'comment';
      case 'reply':
        return 'reply';
      case 'message':
        return 'message';
      case 'user':
        return 'user';
      default:
        return 'content';
    }
  };

  const renderReasonSelection = () => (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="px-4 py-2">
        <Text className="text-gray-600 mb-4">
          Why are you reporting this {getContentTypeLabel()}?
        </Text>

        {REPORT_REASONS.map((reason) => (
          <TouchableOpacity
            key={reason}
            className={`p-4 mb-3 rounded-lg border ${
              selectedReason === reason
                ? 'border-golf-700 bg-golf-50'
                : 'border-gray-200 bg-white'
            }`}
            onPress={() => setSelectedReason(reason)}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-3">
                <Text
                  className={`font-medium ${
                    selectedReason === reason ? 'text-golf-700' : 'text-gray-900'
                  }`}
                >
                  {REPORT_REASON_LABELS[reason]}
                </Text>
                <Text className="text-gray-500 text-sm mt-1">
                  {REPORT_REASON_DESCRIPTIONS[reason]}
                </Text>
              </View>
              {selectedReason === reason && (
                <Ionicons name="checkmark-circle" size={24} color="#10288F" />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderDetailsStep = () => (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="px-4 py-2">
        <View className="bg-golf-50 p-4 rounded-lg mb-4">
          <Text className="text-golf-700 font-medium">
            Reporting for: {REPORT_REASON_LABELS[selectedReason!]}
          </Text>
        </View>

        <Text className="text-gray-700 font-medium mb-2">
          Additional details (optional)
        </Text>
        <TextInput
          className="bg-white border border-gray-200 rounded-lg p-4 min-h-[120px]"
          placeholder="Provide any additional context that might help us review this report..."
          value={additionalInfo}
          onChangeText={setAdditionalInfo}
          multiline
          textAlignVertical="top"
          maxLength={500}
        />
        <Text className="text-gray-400 text-sm mt-2 text-right">
          {additionalInfo.length}/500
        </Text>

        <View className="bg-gray-50 p-4 rounded-lg mt-4">
          <Text className="text-gray-600 text-sm">
            Your report is anonymous. The person who posted this content won't know who reported them.
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderSuccessStep = () => (
    <View className="flex-1 items-center justify-center px-8">
      <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
        <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
      </View>
      <Text className="text-xl font-bold text-gray-900 mb-2">Report Submitted</Text>
      <Text className="text-gray-600 text-center mb-6">
        Thank you for helping keep ForeBuddies safe. We'll review this report and take appropriate action.
      </Text>
      <TouchableOpacity
        className="bg-golf-700 px-8 py-3 rounded-lg"
        onPress={handleClose}
      >
        <Text className="text-white font-medium">Done</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white border-b border-gray-200 px-4 py-3">
          <View className="flex-row items-center justify-between">
            {step !== 'success' && (
              <TouchableOpacity onPress={step === 'details' ? () => setStep('reason') : handleClose}>
                <Text className="text-golf-700 font-medium text-lg">
                  {step === 'details' ? 'Back' : 'Cancel'}
                </Text>
              </TouchableOpacity>
            )}
            {step === 'success' && <View style={{ width: 60 }} />}

            <Text className="text-xl font-bold text-gray-900">
              {step === 'success' ? 'Report Sent' : 'Report'}
            </Text>

            {step === 'reason' && (
              <TouchableOpacity
                onPress={() => selectedReason && setStep('details')}
                disabled={!selectedReason}
              >
                <Text
                  className={`font-medium text-lg ${
                    selectedReason ? 'text-golf-700' : 'text-gray-300'
                  }`}
                >
                  Next
                </Text>
              </TouchableOpacity>
            )}
            {step === 'details' && (
              <TouchableOpacity onPress={handleSubmitReport}>
                <Text className="text-golf-700 font-medium text-lg">Submit</Text>
              </TouchableOpacity>
            )}
            {step === 'success' && <View style={{ width: 60 }} />}
          </View>
        </View>

        {/* Content */}
        {step === 'reason' && renderReasonSelection()}
        {step === 'details' && renderDetailsStep()}
        {step === 'success' && renderSuccessStep()}
      </SafeAreaView>
    </Modal>
  );
}
