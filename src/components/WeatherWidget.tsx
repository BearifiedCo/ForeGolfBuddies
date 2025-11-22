import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WeatherData, getMockWeatherData } from '../utils/weather';

interface WeatherWidgetProps {
  onPress?: () => void;
}

export default function WeatherWidget({ onPress }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate weather data loading
    const loadWeather = async () => {
      setIsLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setWeather(getMockWeatherData());
      setIsLoading(false);
    };

    loadWeather();
  }, []);

  if (isLoading) {
    return (
      <TouchableOpacity
        onPress={onPress}
        className="bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-100"
        disabled={true}
      >
        <View className="flex-row items-center">
          <View className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
          <Text className="text-gray-400 text-sm ml-2">--°</Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (!weather) {
    return null;
  }

  // Determine if weather is good for golf
  const isGoodForGolf = weather.temperature >= 50 && weather.temperature <= 85 && 
    !weather.condition.toLowerCase().includes('rain') && 
    !weather.condition.toLowerCase().includes('storm') &&
    !weather.condition.toLowerCase().includes('snow');

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`rounded-lg px-3 py-2 shadow-sm border ${
        isGoodForGolf 
          ? 'bg-green-50 border-green-200' 
          : 'bg-white border-gray-100'
      }`}
    >
      <View className="flex-row items-center">
        <Text className="text-lg mr-2">{weather.icon}</Text>
        <View className="items-end">
          <Text className="text-gray-900 font-semibold text-sm">
            {weather.temperature}°
          </Text>
          <Text className={`text-xs ${
            isGoodForGolf ? 'text-green-600' : 'text-gray-500'
          }`}>
            {weather.condition}
          </Text>
          {isGoodForGolf && (
            <View className="flex-row items-center mt-1">
              <Text className="text-green-600 text-xs font-medium mr-1">Great for golf!</Text>
              <Text className="text-green-600">⛳</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
