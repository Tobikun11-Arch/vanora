import {DarkTheme, DefaultTheme, ThemeProvider} from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import {Stack} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import {useEffect, useState} from 'react';
import {Platform} from 'react-native';
import 'react-native-reanimated';

import {useColorScheme} from '@/hooks/use-color-scheme';
import {ToastContainer} from '../components/Toast';
import {authService} from '../services/auth.service';
import {profileService} from '../services/profile.service';
import {revenueCatService} from '../services/revenuecat.service';
import {ReactQueryProvider} from '@/lib/provider/ReactQueryProvider';

export const unstable_settings = {
  anchor: '(tabs)'
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [state, dispatch] = useState({
    isLoading: true,
    isSignout: false,
    userToken: null as string | null,
    user: null as any,
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
      } catch {
        dispatch(prev => ({
          ...prev,
          isLoading: false
        }));
      }
    };

    bootstrapAsync();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android') {
      // Make nav bar transparent
      NavigationBar.setBackgroundColorAsync('transparent');
      // Hide nav bar completely
      NavigationBar.setVisibilityAsync('hidden');
      // Optional: control button style (light/dark icons)
      NavigationBar.setButtonStyleAsync('light');
    }
  }, []);

useEffect(() => {
  const bootstrapAsync = async () => {
    try {
      const session = await authService.getSession();
      if (session?.user) {
        const profileResult = await profileService.getProfile(session.user.id);

        // Initialize RevenueCat with user ID
        revenueCatService.initialize(session.user.id);

        dispatch(prev => ({
          ...prev,
          userToken: session.access_token,
          user: session.user,
          profileComplete: profileResult.success,
          isLoading: false
        }));
      } else {
        // Initialize RevenueCat without a user (anonymous)
        revenueCatService.initialize();

        dispatch(prev => ({
          ...prev,
          isLoading: false
        }));
      }
    } catch {
      dispatch(prev => ({
        ...prev,
        isLoading: false
      }));
    }
  };

  bootstrapAsync();
}, []);


  return (
    <ReactQueryProvider>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{headerShown: false}} />
      <ToastContainer />
      <StatusBar style="auto" />
    </ThemeProvider>
    </ReactQueryProvider>
  );
}
