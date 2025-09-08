import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useFonts as usePoppins, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold, Poppins_900Black } from '@expo-google-fonts/poppins';
import { useFonts as usePlayfair, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { useFonts as useNoto, NotoSansDevanagari_700Bold } from '@expo-google-fonts/noto-sans-devanagari';

import IntroScreen from './screens/IntroScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import RemindersScreen from './screens/RemindersScreen';

const Stack = createNativeStackNavigator();
const STORAGE_KEY = 'sankalp7_state_v2';

export default function App() {
  const [initialRoute, setInitialRoute] = useState('Intro');

  const [fontsLoaded] = (function () {
    const [a] = usePoppins({ Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold, Poppins_900Black });
    const [b] = usePlayfair({ PlayfairDisplay_700Bold });
    const [c] = useNoto({ NotoSansDevanagari_700Bold });
    return [a && b && c];
  })();

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const s = raw ? JSON.parse(raw) : null;
      setInitialRoute('Intro'); // Intro decides Welcome vs Home
    })();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: true }}>
        <Stack.Screen name="Intro" component={IntroScreen} options={{ headerShown:false }} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown:false }} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ title:'Sankalp Setup' }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title:'Hanuman Chalisa Sankalp' }} />
        <Stack.Screen name="Reminders" component={RemindersScreen} options={{ title:'Reminders' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
