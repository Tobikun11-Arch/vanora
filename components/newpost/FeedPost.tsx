import {supabase} from '@/services/supabase';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {useEffect, useState} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import LocationSearchModal from './LocationSearchModal';

interface UserProfile {
  username: string | null;
  display_name: string | null;
  profile_picture_url: string | null;
}

interface MediaItem {
  uri: string;
  type: 'image' | 'video';
}

export default function FeedPost() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [visibility, setVisibility] = useState<'everyone' | 'followers'>(
    'everyone'
  );
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const {
        data: {user}
      } = await supabase.auth.getUser();
      if (!user) return;

      const {data, error} = await supabase
        .from('profiles')
        .select('username, display_name, profile_picture_url')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const mediaType = asset.type === 'video' ? 'video' : 'image';
      setMedia([...media, {uri: asset.uri, type: mediaType}]);
    }
  };

  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  const handleSelectLocation = (selectedLocation: string) => {
    setLocation(selectedLocation);
  };

  const clearLocation = () => {
    setLocation('');
  };

  const displayName = profile?.username
    ? `@${profile.username}`
    : profile?.display_name || '@user';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* User Info Row */}
      <View style={styles.userRow}>
        <View style={styles.avatarContainer}>
          {profile?.profile_picture_url ? (
            <Image
              source={{uri: profile.profile_picture_url}}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <MaterialCommunityIcons
                name="account"
                size={24}
                color="#6B7280"
              />
            </View>
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{displayName}</Text>
          <TouchableOpacity
            style={styles.locationBtn}
            onPress={() => setLocationModalVisible(true)}
          >
            <MaterialCommunityIcons
              name="map-marker"
              size={14}
              color="#4A7C59"
            />
            <Text style={styles.locationText}>
              {location || 'Add Location'}
            </Text>
            {location ? (
              <TouchableOpacity
                onPress={clearLocation}
                style={styles.clearLocationBtn}
              >
                <MaterialCommunityIcons
                  name="close-circle"
                  size={14}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            ) : null}
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.visibilityBtn}>
          <MaterialCommunityIcons
            name={visibility === 'everyone' ? 'earth' : 'account-group'}
            size={14}
            color="#6B7280"
          />
          <Text style={styles.visibilityText}>
            {visibility === 'everyone' ? 'Everyone' : 'Followers'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Caption Input */}
      <TextInput
        style={styles.captionInput}
        placeholder="Share your latest adventure, tip, or question with the community..."
        placeholderTextColor="#9CA3AF"
        multiline
        value={caption}
        onChangeText={setCaption}
        textAlignVertical="top"
      />

      {/* Media Section */}
      {media.length > 0 ? (
        <View style={styles.mediaPreviewContainer}>
          {media.map((item, index) => (
            <View key={index} style={styles.mediaPreviewItem}>
              <Image source={{uri: item.uri}} style={styles.mediaPreview} />
              <TouchableOpacity
                style={styles.removeMediaBtn}
                onPress={() => removeMedia(index)}
              >
                <MaterialCommunityIcons name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.addMoreMedia} onPress={pickMedia}>
            <MaterialCommunityIcons name="plus" size={24} color="#4A7C59" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.mediaBox} onPress={pickMedia}>
          <MaterialCommunityIcons name="image-plus" size={48} color="#4A7C59" />
          <Text style={styles.mediaTitle}>Add Photo or Video</Text>
          <Text style={styles.mediaSubtitle}>
            High quality visuals get 2× more reach
          </Text>
        </TouchableOpacity>
      )}

      {/* Options */}
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.optionRow}>
          <MaterialCommunityIcons name="flag" size={20} color="#4A7C59" />
          <Text style={styles.optionText}>Tag Nomads</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color="#9CA3AF"
            style={styles.chevron}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionRow}>
          <MaterialCommunityIcons name="tag" size={20} color="#F59E0B" />
          <Text style={styles.optionText}>Add Gear Tags</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color="#9CA3AF"
            style={styles.chevron}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionRow}>
          <MaterialCommunityIcons name="folder" size={20} color="#6B7280" />
          <Text style={styles.optionText}>Select Category</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color="#9CA3AF"
            style={styles.chevron}
          />
        </TouchableOpacity>
      </View>

      {/* Location Search Modal */}
      <LocationSearchModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        onSelectLocation={handleSelectLocation}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  avatarContainer: {
    marginRight: 12
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22
  },
  avatarPlaceholder: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center'
  },
  userInfo: {
    flex: 1
  },
  username: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937'
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  locationText: {
    fontSize: 13,
    color: '#4A7C59',
    marginLeft: 4
  },
  clearLocationBtn: {
    marginLeft: 4
  },
  visibilityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff'
  },
  visibilityText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6
  },
  captionInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#374151',
    minHeight: 80,
    lineHeight: 22
  },
  mediaBox: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  mediaTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12
  },
  mediaSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4
  },
  mediaPreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8
  },
  mediaPreviewItem: {
    position: 'relative'
  },
  mediaPreview: {
    width: 100,
    height: 100,
    borderRadius: 8
  },
  removeMediaBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4
  },
  addMoreMedia: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed'
  },
  optionsContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6'
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    marginLeft: 12
  },
  chevron: {
    marginLeft: 'auto'
  }
});
