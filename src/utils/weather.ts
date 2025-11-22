export interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  location: string;
}

// Weather condition to icon mapping
export function getWeatherIcon(condition: string): string {
  const conditionLower = condition.toLowerCase();
  
  if (conditionLower.includes('sunny') || conditionLower.includes('clear')) {
    return '☀️';
  } else if (conditionLower.includes('cloudy') || conditionLower.includes('overcast')) {
    return '☁️';
  } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    return '🌧️';
  } else if (conditionLower.includes('snow')) {
    return '❄️';
  } else if (conditionLower.includes('thunder') || conditionLower.includes('storm')) {
    return '⛈️';
  } else if (conditionLower.includes('fog') || conditionLower.includes('mist')) {
    return '🌫️';
  } else if (conditionLower.includes('partly')) {
    return '⛅';
  } else {
    return '🌤️'; // Default weather icon
  }
}

// Mock weather data for development
export function getMockWeatherData(): WeatherData {
  const conditions = [
    { condition: 'Sunny', icon: '☀️' },
    { condition: 'Partly Cloudy', icon: '⛅' },
    { condition: 'Cloudy', icon: '☁️' },
    { condition: 'Light Rain', icon: '🌧️' },
    { condition: 'Clear', icon: '☀️' }
  ];
  
  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
  const temperature = Math.floor(Math.random() * 30) + 45; // 45-75°F range
  
  return {
    temperature,
    condition: randomCondition.condition,
    icon: randomCondition.icon,
    location: 'Current Location'
  };
}

// In production, this would integrate with a real weather API
export async function getCurrentWeather(latitude: number, longitude: number): Promise<WeatherData> {
  try {
    // This is where you'd make an actual API call to a weather service
    // For now, returning mock data
    return getMockWeatherData();
  } catch (error) {
    console.error('Error fetching weather:', error);
    return {
      temperature: 72,
      condition: 'Unknown',
      icon: '🌤️',
      location: 'Current Location'
    };
  }
}
