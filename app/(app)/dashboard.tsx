import {supabase} from '@/services/supabase';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useRouter} from 'expo-router';
import {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {showToast} from '../../components/Toast';
import {authService} from '../../services/auth.service';

interface UserProfile {
  id: string;
  user_id: string;
  nomad_type: string;
  travel_style: string;
  age: number;
  gender: string;
  bio: string;
  profile_picture_url: string;
  current_location: string;
  hobbies: string[];
}

export default function DashboardScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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

        const {data, error} = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        showToast('error', 'Error', 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleLogout = async () => {
    const result = await authService.signOut();
    if (result.success) {
      showToast('success', 'Success', 'Logged out successfully');
      router.replace('/(auth)/get-started');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Profile not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <TouchableOpacity onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={24} color="#4a90e2" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileCard}>
        {profile.profile_picture_url && (
          <Image
            source={{uri: profile.profile_picture_url}}
            style={styles.profilePicture}
          />
        )}
        <Text style={styles.profileName}>
          {profile.age}, {profile.gender}
        </Text>
        <Text style={styles.location}>{profile.current_location}</Text>
        <Text style={styles.bio}>{profile.bio}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Lifestyle</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Nomad Type:</Text>
          <Text style={styles.value}>{profile.nomad_type}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Travel Style:</Text>
          <Text style={styles.value}>{profile.travel_style}</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Interests</Text>
        <View style={styles.tagsContainer}>
          {profile.hobbies?.map(hobby => (
            <View key={hobby} style={styles.tag}>
              <Text style={styles.tagText}>{hobby}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333'
  },
  profileCard: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#f9f9f9',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },
  bio: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
    textAlign: 'center'
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  label: {
    fontSize: 14,
    color: '#666'
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333'
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  tag: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16
  },
  tagText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500'
  }
});
