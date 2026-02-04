import {useRouter} from 'expo-router';
import {useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {authService} from '../services/auth.service';
import {profileService} from '../services/profile.service';

export default function RootNavigator() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const user = await authService.getCurrentUser();

        if (!user) {
          router.replace('/(auth)/get-started');
        } else {
          const profileResult = await profileService.getProfile(user.id);
          if (profileResult.success) {
            router.replace('/(app)/dashboard');
          } else {
            router.replace('/(profile)/step-1');
          }
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        router.replace('/(auth)/get-started');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthState();
  }, [router]);

  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  return null;
}
