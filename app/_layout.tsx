import {DarkTheme, DefaultTheme, ThemeProvider} from '@react-navigation/native';
import {Stack} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import {useEffect, useState} from 'react';
import 'react-native-reanimated';

import {useColorScheme} from '@/hooks/use-color-scheme';
import {ToastContainer} from '../components/Toast';
import {authService} from '../services/auth.service';
import {profileService} from '../services/profile.service';

export const unstable_settings = {
  anchor: '(tabs)'
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [state, dispatch] = useState({
    isLoading: true,
    isSignout: false,
    userToken: null,
    user: null,
    profileComplete: false
  });

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const session = await authService.getSession();
        if (session?.user) {
          const profileResult = await profileService.getProfile(
            session.user.id
          );
          dispatch(prev => ({
            ...prev,
            userToken: session.access_token,
            user: session.user,
            profileComplete: profileResult.success,
            isLoading: false
          }));
        } else {
          dispatch(prev => ({
            ...prev,
            isLoading: false
          }));
        }
      } catch (error) {
        dispatch(prev => ({
          ...prev,
          isLoading: false
        }));
      }
    };

    bootstrapAsync();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{headerShown: false}} />
      <ToastContainer />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
