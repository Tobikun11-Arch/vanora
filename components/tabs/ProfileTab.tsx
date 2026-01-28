import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useRouter} from 'expo-router';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {authService} from '../../services/auth.service';
import {showToast} from '../Toast';

const {width} = Dimensions.get('window');
const GALLERY_IMAGE_SIZE = (width - 60) / 3;

interface GalleryPhoto {
  id: string;
  photo_url: string;
  photo_type: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  display_name: string;
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

interface ProfileTabProps {
  profile: UserProfile;
}

export default function ProfileTab({profile}: ProfileTabProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const result = await authService.signOut();
    if (result.success) {
      showToast('success', 'Success', 'Logged out successfully');
      router.replace('/(auth)/get-started');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <MaterialCommunityIcons name="logout" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Profile Picture & Basic Info */}
      <View style={styles.profileHeader}>
        {profile.profile_picture_url ? (
          <Image
            source={{uri: profile.profile_picture_url}}
            style={styles.profilePicture}
          />
        ) : (
          <View style={[styles.profilePicture, styles.placeholderPicture]}>
            <MaterialCommunityIcons name="account" size={50} color="#9CA3AF" />
          </View>
        )}
        <View style={styles.basicInfo}>
          <Text style={styles.ageGender}>
            {profile.display_name}
          </Text>
          <Text style={styles.ageGender}>
            {profile.age} years old • {profile.gender}
          </Text>
          {profile.pronouns && (
            <Text style={styles.pronouns}>{profile.pronouns}</Text>
          )}
          <View style={styles.locationRow}>
            <MaterialCommunityIcons
              name="map-marker"
              size={16}
              color="#6B7280"
            />
            <Text style={styles.location}>{profile.current_location}</Text>
          </View>
        </View>
      </View>

      {/* Bio Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Me</Text>
        <Text style={styles.bioText}>{profile.bio}</Text>
      </View>

      {/* Nomad Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nomad Life</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons
              name="van-utility"
              size={24}
              color="#4a90e2"
            />
            <Text style={styles.infoLabel}>Nomad Type</Text>
            <Text style={styles.infoValue}>{profile.nomad_type}</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="airplane" size={24} color="#4a90e2" />
            <Text style={styles.infoLabel}>Travel Style</Text>
            <Text style={styles.infoValue}>{profile.travel_style}</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons
              name="map-marker-path"
              size={24}
              color="#4a90e2"
            />
            <Text style={styles.infoLabel}>Movement</Text>
            <Text style={styles.infoValue}>{profile.movement_pattern}</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons
              name="calendar-clock"
              size={24}
              color="#4a90e2"
            />
            <Text style={styles.infoLabel}>Years on Road</Text>
            <Text style={styles.infoValue}>
              {profile.years_in_van_life} years
            </Text>
          </View>
        </View>
      </View>

      {/* Relationship Intent */}
      {profile.relationship_intent &&
        profile.relationship_intent.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Looking For</Text>
            <View style={styles.tagsContainer}>
              {profile.relationship_intent.map((intent, index) => (
                <View key={index} style={styles.intentTag}>
                  <MaterialCommunityIcons
                    name="heart"
                    size={14}
                    color="#EF4444"
                  />
                  <Text style={styles.intentTagText}>{intent}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

      {/* Hobbies */}
      {profile.hobbies && profile.hobbies.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hobbies & Interests</Text>
          <View style={styles.tagsContainer}>
            {profile.hobbies.map((hobby, index) => (
              <View key={index} style={styles.hobbyTag}>
                <Text style={styles.hobbyTagText}>{hobby}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.tagsContainer}>
            {profile.skills.map((skill, index) => (
              <View key={index} style={styles.skillTag}>
                <MaterialCommunityIcons name="star" size={12} color="#F59E0B" />
                <Text style={styles.skillTagText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Lifestyle Tags */}
      {profile.lifestyle_tags && profile.lifestyle_tags.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lifestyle</Text>
          <View style={styles.tagsContainer}>
            {profile.lifestyle_tags.map((tag, index) => (
              <View key={index} style={styles.lifestyleTag}>
                <Text style={styles.lifestyleTagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Favorite Activities */}
      {profile.favorite_activities &&
        profile.favorite_activities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Favorite Activities</Text>
            <View style={styles.tagsContainer}>
              {profile.favorite_activities.map((activity, index) => (
                <View key={index} style={styles.activityTag}>
                  <MaterialCommunityIcons
                    name="run"
                    size={14}
                    color="#10B981"
                  />
                  <Text style={styles.activityTagText}>{activity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

      {/* Photo Gallery */}
      {profile.gallery_photos && profile.gallery_photos.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photo Gallery</Text>
          <View style={styles.galleryGrid}>
            {profile.gallery_photos.map(photo => (
              <View key={photo.id} style={styles.galleryImageContainer}>
                <Image
                  source={{uri: photo.photo_url}}
                  style={styles.galleryImage}
                  resizeMode="cover"
                />
                <View style={styles.photoTypeLabel}>
                  <Text style={styles.photoTypeLabelText}>
                    {photo.photo_type}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Member Since */}
      <View style={styles.memberSection}>
        <MaterialCommunityIcons
          name="account-clock"
          size={20}
          color="#9CA3AF"
        />
        <Text style={styles.memberSince}>
          Member since {formatDate(profile.created_at)}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  scrollContent: {
    paddingBottom: 40
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937'
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FEE2E2'
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 16
  },
  placeholderPicture: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  basicInfo: {
    flex: 1
  },
  ageGender: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4
  },
  pronouns: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  location: {
    fontSize: 14,
    color: '#6B7280'
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12
  },
  bioText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  infoItem: {
    width: '47%',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 4
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center'
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  intentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6
  },
  intentTagText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '500'
  },
  hobbyTag: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20
  },
  hobbyTagText: {
    fontSize: 13,
    color: '#1D4ED8',
    fontWeight: '500'
  },
  skillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4
  },
  skillTagText: {
    fontSize: 13,
    color: '#B45309',
    fontWeight: '500'
  },
  lifestyleTag: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20
  },
  lifestyleTagText: {
    fontSize: 13,
    color: '#4338CA',
    fontWeight: '500'
  },
  activityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6
  },
  activityTagText: {
    fontSize: 13,
    color: '#047857',
    fontWeight: '500'
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  galleryImageContainer: {
    position: 'relative'
  },
  galleryImage: {
    width: GALLERY_IMAGE_SIZE,
    height: GALLERY_IMAGE_SIZE,
    borderRadius: 12
  },
  photoTypeLabel: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  photoTypeLabelText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '500'
  },
  memberSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginHorizontal: 20
  },
  memberSince: {
    fontSize: 13,
    color: '#9CA3AF'
  }
});
