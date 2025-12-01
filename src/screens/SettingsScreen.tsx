import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../state/authStore';
import { authService } from '../api/auth-service';
import Constants from 'expo-constants';

interface SettingsScreenProps {
  navigation: any;
}

// App configuration - these would be real URLs in production
const APP_CONFIG = {
  supportEmail: 'support@forebuddies.com',
  privacyPolicyUrl: 'https://forebuddies.com/privacy',
  termsOfServiceUrl: 'https://forebuddies.com/terms',
  helpCenterUrl: 'https://forebuddies.com/help',
  appVersion: Constants.expoConfig?.version || '1.0.0',
  buildNumber: Constants.expoConfig?.ios?.buildNumber || '1',
};

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.logout();
              logout();
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const handleOpenUrl = async (url: string, fallbackMessage: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Info', fallbackMessage);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open link');
    }
  };

  const handleContactSupport = () => {
    const emailUrl = `mailto:${APP_CONFIG.supportEmail}?subject=ForeBuddies Support Request`;
    handleOpenUrl(emailUrl, `Contact us at ${APP_CONFIG.supportEmail}`);
  };

  const renderSettingsItem = (
    icon: keyof typeof Ionicons.glyphMap,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    showChevron: boolean = true,
    iconColor: string = '#10288F',
    textColor: string = 'text-gray-900'
  ) => (
    <TouchableOpacity
      className="flex-row items-center px-4 py-4 bg-white border-b border-gray-100"
      onPress={onPress}
      disabled={!onPress}
    >
      <View className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-3">
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className={`font-medium ${textColor}`}>{title}</Text>
        {subtitle && <Text className="text-gray-500 text-sm mt-0.5">{subtitle}</Text>}
      </View>
      {showChevron && onPress && (
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white border-b border-gray-200 px-4 py-3">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900">Settings</Text>
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Account Section */}
          <View className="mt-4">
            <Text className="px-4 py-2 text-sm font-medium text-gray-500 uppercase">
              Account
            </Text>
            {renderSettingsItem(
              'person-outline',
              'Edit Profile',
              'Update your personal information',
              () => navigation.navigate('Profile')
            )}
            {renderSettingsItem(
              'notifications-outline',
              'Notifications',
              'Manage notification preferences'
            )}
            {renderSettingsItem(
              'lock-closed-outline',
              'Privacy',
              'Control who can see your content'
            )}
          </View>

          {/* Safety Section */}
          <View className="mt-4">
            <Text className="px-4 py-2 text-sm font-medium text-gray-500 uppercase">
              Safety
            </Text>
            {renderSettingsItem(
              'ban-outline',
              'Blocked Users',
              'Manage users you\'ve blocked',
              () => navigation.navigate('BlockedUsers')
            )}
          </View>

          {/* Support Section */}
          <View className="mt-4">
            <Text className="px-4 py-2 text-sm font-medium text-gray-500 uppercase">
              Support
            </Text>
            {renderSettingsItem(
              'help-circle-outline',
              'Help Center',
              'Get help with ForeBuddies',
              () => handleOpenUrl(APP_CONFIG.helpCenterUrl, 'Visit our help center for FAQs and guides.')
            )}
            {renderSettingsItem(
              'mail-outline',
              'Contact Support',
              APP_CONFIG.supportEmail,
              handleContactSupport
            )}
            {renderSettingsItem(
              'chatbubble-ellipses-outline',
              'Report a Problem',
              'Let us know if something isn\'t working',
              handleContactSupport
            )}
          </View>

          {/* Legal Section */}
          <View className="mt-4">
            <Text className="px-4 py-2 text-sm font-medium text-gray-500 uppercase">
              Legal
            </Text>
            {renderSettingsItem(
              'document-text-outline',
              'Privacy Policy',
              'How we handle your data',
              () => navigation.navigate('PrivacyPolicy')
            )}
            {renderSettingsItem(
              'newspaper-outline',
              'Terms of Service',
              'Rules for using ForeBuddies',
              () => handleOpenUrl(APP_CONFIG.termsOfServiceUrl, 'Our terms of service outline the rules and guidelines for using ForeBuddies.')
            )}
          </View>

          {/* App Info Section */}
          <View className="mt-4">
            <Text className="px-4 py-2 text-sm font-medium text-gray-500 uppercase">
              About
            </Text>
            {renderSettingsItem(
              'information-circle-outline',
              'App Version',
              `${APP_CONFIG.appVersion} (${APP_CONFIG.buildNumber})`,
              undefined,
              false
            )}
          </View>

          {/* Logout Button */}
          <View className="mt-8 px-4 pb-8">
            <TouchableOpacity
              className="bg-red-500 py-4 rounded-lg items-center"
              onPress={handleLogout}
            >
              <Text className="text-white font-semibold text-lg">Logout</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="items-center pb-8">
            <Text className="text-gray-400 text-sm">ForeBuddies</Text>
            <Text className="text-gray-400 text-xs mt-1">Made with love for golfers</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
