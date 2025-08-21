import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../state/authStore';
import { User } from '../types/golf';

interface RegisterScreenProps {
  navigation: any;
}

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    handicap: '',
    location: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.handicap || !formData.location) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const handicapNum = parseInt(formData.handicap);
    if (isNaN(handicapNum) || handicapNum < 0 || handicapNum > 54) {
      Alert.alert('Error', 'Please enter a valid handicap (0-54)');
      return;
    }

    setIsLoading(true);
    
    // Mock registration - in real app, this would call Firebase Auth
    setTimeout(() => {
      const newUser: User = {
        id: Date.now().toString(),
        email: formData.email,
        name: formData.name,
        handicap: handicapNum,
        location: formData.location,
        createdAt: new Date(),
      };
      
      login(newUser);
      setIsLoading(false);
    }, 1000);
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView className="flex-1 bg-green-50">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          <View className="items-center mt-8 mb-8">
            <View className="w-20 h-20 bg-green-600 rounded-full items-center justify-center mb-4">
              <Ionicons name="golf" size={40} color="white" />
            </View>
            <Text className="text-3xl font-bold text-green-800 mb-2">Join Golf Social</Text>
            <Text className="text-gray-600 text-center">Create your account to start connecting</Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-gray-700 mb-2 font-medium">Full Name</Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
                placeholder="Enter your full name"
                value={formData.name}
                onChangeText={(value) => updateFormData('name', value)}
                autoCapitalize="words"
              />
            </View>

            <View>
              <Text className="text-gray-700 mb-2 font-medium">Email</Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View>
              <Text className="text-gray-700 mb-2 font-medium">Golf Handicap</Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
                placeholder="Enter your handicap (0-54)"
                value={formData.handicap}
                onChangeText={(value) => updateFormData('handicap', value)}
                keyboardType="numeric"
              />
            </View>

            <View>
              <Text className="text-gray-700 mb-2 font-medium">Location</Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
                placeholder="City, State"
                value={formData.location}
                onChangeText={(value) => updateFormData('location', value)}
                autoCapitalize="words"
              />
            </View>

            <View>
              <Text className="text-gray-700 mb-2 font-medium">Password</Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
                placeholder="Create a password"
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                secureTextEntry
              />
            </View>

            <View>
              <Text className="text-gray-700 mb-2 font-medium">Confirm Password</Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                secureTextEntry
              />
            </View>

            <Pressable
              className={`bg-green-600 rounded-lg py-4 items-center mt-6 ${isLoading ? 'opacity-50' : ''}`}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text className="text-white font-semibold text-lg">
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </Pressable>

            <View className="flex-row justify-center items-center mt-6 mb-8">
              <Text className="text-gray-600">Already have an account? </Text>
              <Pressable onPress={() => navigation.navigate('Login')}>
                <Text className="text-green-600 font-semibold">Sign In</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}