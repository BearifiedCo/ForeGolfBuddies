import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface PrivacyPolicyScreenProps {
  navigation: any;
}

export default function PrivacyPolicyScreen({ navigation }: PrivacyPolicyScreenProps) {
  const lastUpdated = 'December 1, 2024';

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View className="mb-6">
      <Text className="text-lg font-bold text-gray-900 mb-3">{title}</Text>
      {children}
    </View>
  );

  const Paragraph = ({ children }: { children: React.ReactNode }) => (
    <Text className="text-gray-700 leading-6 mb-3">{children}</Text>
  );

  const BulletPoint = ({ children }: { children: React.ReactNode }) => (
    <View className="flex-row mb-2">
      <Text className="text-gray-700 mr-2">•</Text>
      <Text className="text-gray-700 leading-6 flex-1">{children}</Text>
    </View>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="bg-white border-b border-gray-200 px-4 py-3">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900">Privacy Policy</Text>
          </View>
        </View>

        <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
          <Text className="text-gray-500 mb-6">Last updated: {lastUpdated}</Text>

          <Section title="Introduction">
            <Paragraph>
              ForeBuddies ("we," "our," or "us") is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard
              your information when you use our mobile application.
            </Paragraph>
            <Paragraph>
              Please read this privacy policy carefully. If you do not agree with the
              terms of this privacy policy, please do not access the application.
            </Paragraph>
          </Section>

          <Section title="Information We Collect">
            <Paragraph>We may collect information about you in various ways:</Paragraph>

            <Text className="font-semibold text-gray-800 mb-2">Personal Data</Text>
            <BulletPoint>Name and email address when you create an account</BulletPoint>
            <BulletPoint>Profile information you choose to provide</BulletPoint>
            <BulletPoint>Golf handicap and home club information</BulletPoint>
            <BulletPoint>Profile photos and gallery images you upload</BulletPoint>

            <Text className="font-semibold text-gray-800 mb-2 mt-4">Location Data</Text>
            <BulletPoint>
              With your permission, we collect location data to help you find nearby
              golf courses and connect with other golfers in your area
            </BulletPoint>
            <BulletPoint>
              You can disable location services at any time through your device settings
            </BulletPoint>

            <Text className="font-semibold text-gray-800 mb-2 mt-4">Usage Data</Text>
            <BulletPoint>Golf scores and round statistics you enter</BulletPoint>
            <BulletPoint>Posts, comments, and other content you create</BulletPoint>
            <BulletPoint>Interactions with other users (likes, messages, friend connections)</BulletPoint>
            <BulletPoint>App usage patterns and preferences</BulletPoint>
          </Section>

          <Section title="How We Use Your Information">
            <Paragraph>We use the information we collect to:</Paragraph>
            <BulletPoint>Create and manage your account</BulletPoint>
            <BulletPoint>Provide and maintain our services</BulletPoint>
            <BulletPoint>Enable social features and connections with other golfers</BulletPoint>
            <BulletPoint>Track and display your golf statistics and achievements</BulletPoint>
            <BulletPoint>Find golf courses near your location</BulletPoint>
            <BulletPoint>Send you notifications about your account and activity</BulletPoint>
            <BulletPoint>Improve and personalize your experience</BulletPoint>
            <BulletPoint>Respond to your inquiries and provide support</BulletPoint>
          </Section>

          <Section title="Sharing Your Information">
            <Paragraph>
              We may share your information in the following situations:
            </Paragraph>
            <BulletPoint>
              <Text className="font-semibold">With Other Users:</Text> Your profile
              information, posts, and golf activity may be visible to other users
              based on your privacy settings
            </BulletPoint>
            <BulletPoint>
              <Text className="font-semibold">Service Providers:</Text> We may share
              your information with third-party vendors who perform services on our behalf
            </BulletPoint>
            <BulletPoint>
              <Text className="font-semibold">Legal Requirements:</Text> We may disclose
              your information if required by law or to protect our rights
            </BulletPoint>
          </Section>

          <Section title="Data Security">
            <Paragraph>
              We use administrative, technical, and physical security measures to protect
              your personal information. However, no method of transmission over the
              Internet or electronic storage is 100% secure.
            </Paragraph>
          </Section>

          <Section title="Your Privacy Rights">
            <Paragraph>You have the right to:</Paragraph>
            <BulletPoint>Access and receive a copy of your personal data</BulletPoint>
            <BulletPoint>Request correction of inaccurate data</BulletPoint>
            <BulletPoint>Request deletion of your data</BulletPoint>
            <BulletPoint>Control your privacy settings within the app</BulletPoint>
            <BulletPoint>Opt out of marketing communications</BulletPoint>
          </Section>

          <Section title="Third-Party Services">
            <Paragraph>
              Our app may contain links to third-party websites or services. We are not
              responsible for the privacy practices of these third parties. We encourage
              you to review their privacy policies.
            </Paragraph>
          </Section>

          <Section title="Children's Privacy">
            <Paragraph>
              Our service is not intended for children under 13 years of age. We do not
              knowingly collect personal information from children under 13.
            </Paragraph>
          </Section>

          <Section title="Changes to This Policy">
            <Paragraph>
              We may update this privacy policy from time to time. We will notify you
              of any changes by posting the new privacy policy on this page and updating
              the "Last updated" date.
            </Paragraph>
          </Section>

          <Section title="Contact Us">
            <Paragraph>
              If you have questions about this Privacy Policy, please contact us at:
            </Paragraph>
            <View className="bg-gray-50 p-4 rounded-lg">
              <Text className="text-gray-700">Email: support@forebuddies.com</Text>
            </View>
          </Section>

          <View className="h-8" />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
