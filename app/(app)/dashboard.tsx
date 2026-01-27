import {supabase} from '@/services/supabase';
import {Feather} from '@expo/vector-icons';
import {useRouter} from 'expo-router';
import {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {showToast} from '../../components/Toast';
import {
  ExploreTab,
  FindTechTab,
  HomeTab,
  NotificationsTab,
  ProfileTab
} from '../../components/tabs';

type TabType = 'findtech' | 'explore' | 'home' | 'notifications' | 'profile';

interface GalleryPhoto {
  id: string;
  photo_url: string;
  photo_type: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  nomad_type: string;
  travel_style: string;
  relationship_intent: string[];
  current_location: string;
  movement_pattern: string;
  age: number;
  gender: string;
  pronouns: string | null;
  bio: string;
  profile_picture_url: string | null;
  years_in_van_life: number;
  hobbies: string[];
  skills: string[];
  lifestyle_tags: string[];
  favorite_activities: string[];
  created_at: string;
  updated_at: string;
  gallery_photos?: GalleryPhoto[];
}

export default function DashboardScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('home');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const {
          data: {user}
        } = await supabase.auth.getUser();
        if (!user) {
          router.replace('/(auth)/get-started');
          return;
        }

        const {data: profileData, error: profileError} = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        // Fetch gallery photos
        const {data: photosData} = await supabase
          .from('profile_photos')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', {ascending: false});

        setProfile({
          ...profileData,
          gallery_photos: photosData || []
        });
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        showToast('error', 'Error', 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleTabPress = (tab: TabType) => {
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'findtech':
        return <FindTechTab />;
      case 'explore':
        return <ExploreTab />;
      case 'home':
        return profile ? <HomeTab profile={profile} /> : null;
      case 'notifications':
        return <NotificationsTab />;
      case 'profile':
        return profile ? <ProfileTab profile={profile} /> : null;
      default:
        return profile ? <HomeTab profile={profile} /> : null;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
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

  return (
    <View style={styles.mainContainer}>
      {/* Tab Content */}
      <View style={styles.contentContainer}>{renderTabContent()}</View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => handleTabPress('findtech')}
        >
          <Feather
            name="tool"
            size={24}
            color={activeTab === 'findtech' ? '#000' : '#9CA3AF'}
          />
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => handleTabPress('explore')}
        >
          <Feather
            name="compass"
            size={24}
            color={activeTab === 'explore' ? '#000' : '#9CA3AF'}
          />
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => handleTabPress('home')}
        >
          <Feather
            name="home"
            size={24}
            color={activeTab === 'home' ? '#000' : '#9CA3AF'}
          />
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => handleTabPress('notifications')}
        >
          <Feather
            name="bell"
            size={24}
            color={activeTab === 'notifications' ? '#000' : '#9CA3AF'}
          />
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => handleTabPress('profile')}
        >
          <Feather
            name="user"
            size={24}
            color={activeTab === 'profile' ? '#000' : '#9CA3AF'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  contentContainer: {
    flex: 1
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderRadius: 24,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8
  },
  separator: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB'
  }
});
