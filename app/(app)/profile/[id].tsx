import {showToast} from '@/components/Toast';
import ProfileTab from '@/components/tabs/ProfileTab';
import {supabase} from '@/services/supabase';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

interface GalleryPhoto {
  id: string;
  photo_url: string;
  photo_type: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  username?: string | null;
  display_name: string;
  nomad_type: string;
  travel_style: string;
  relationship_intent: string[];
  current_location: string;
  movement_pattern: string;
  age: number;
  gender: string;
  pronouns: string | null;
  bio: string | null;
  profile_picture_url: string | null;
  years_in_van_life: number;
  hobbies: string[];
  skills: string[];
  lifestyle_tags: string[];
  favorite_activities: string[];
  created_at: string;
  updated_at: string;
  gallery_photos?: GalleryPhoto[];
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{id?: string}>();
  const profileId = useMemo(() => params.id ?? null, [params.id]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileId) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const {data: profileData, error: profileError} = await supabase
          .from('profiles_with_stats')
          .select('*')
          .eq('id', profileId)
          .maybeSingle();

        if (profileError) throw profileError;
        if (!profileData) {
          setProfile(null);
          return;
        }

        const {data: photosData, error: photosError} = await supabase
          .from('profile_photos')
          .select('*')
          .eq('user_id', profileId)
          .order('created_at', {ascending: false});

        if (photosError) throw photosError;

        setProfile({
          ...profileData,
          gallery_photos: photosData || []
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        showToast('error', 'Error', 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Profile not found</Text>
      </View>
    );
  }

  const headerTitle =
    profile.display_name?.trim() || profile.username?.trim() || 'Profile';

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 12}]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {headerTitle}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ProfileTab profile={profile} showHeader={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9F8'
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F7F9F8',
    alignItems: 'center',
    justifyContent: 'center'
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginHorizontal: 8
  },
  headerSpacer: {
    width: 36
  }
});
