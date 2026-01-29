import {supabase} from '@/services/supabase';
import {useUserStore} from '@/store/userStore';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import {showToast} from '../Toast';
import LocationSearchModal from './LocationSearchModal';

interface ImagePollPostProps {
  username?: string;
  onPostSuccess?: () => void;
}

export interface ImagePollPostRef {
  submit: () => Promise<void>;
  canSubmit: () => boolean;
  isSubmitting: () => boolean;
}

interface MediaItem {
  uri: string;
  type: 'image' | 'video';
}

const ImagePollPost = forwardRef<ImagePollPostRef, ImagePollPostProps>(
  function ImagePollPost({username, onPostSuccess}, ref) {
    const profile = useUserStore(state => state.profile);
    const [caption, setCaption] = useState('');
    const [options, setOptions] = useState(['Yes', 'No']);
    const [media, setMedia] = useState<MediaItem | null>(null);
    const [location, setLocation] = useState('Philippines');
    const [visibility, setVisibility] = useState<'everyone' | 'followers'>(
      'everyone'
    );
    const [locationModalVisible, setLocationModalVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const captionRef = useRef(caption);
    const optionsRef = useRef(options);
    const mediaRef = useRef(media);
    const locationRef = useRef(location);
    const visibilityRef = useRef(visibility);

    useEffect(() => {
      captionRef.current = caption;
    }, [caption]);

    useEffect(() => {
      optionsRef.current = options;
    }, [options]);

    useEffect(() => {
      mediaRef.current = media;
    }, [media]);

    useEffect(() => {
      locationRef.current = location;
    }, [location]);

    useEffect(() => {
      visibilityRef.current = visibility;
    }, [visibility]);

    const updateOption = (index: number, value: string) => {
      const newOptions = [...options];
      newOptions[index] = value;
      setOptions(newOptions);
    };

    const toggleVisibility = () => {
      setVisibility(visibility === 'everyone' ? 'followers' : 'everyone');
    };

    const handleSelectLocation = (selectedLocation: string) => {
      setLocation(selectedLocation);
    };

    const clearLocation = () => {
      setLocation('');
    };

    const pickMedia = async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        setMedia({uri: asset.uri, type: 'image'});
      }
    };

    const removeMedia = () => {
      setMedia(null);
    };

    const uploadMedia = async (
      mediaItem: MediaItem,
      userId: string,
      postId: string
    ): Promise<string | null> => {
      try {
        const fileExt = mediaItem.uri.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${userId}/posts/${postId}/${fileName}`;

        const response = await fetch(mediaItem.uri);
        const blob = await response.blob();
        const arrayBuffer = await new Response(blob).arrayBuffer();

        let contentType = 'image/jpeg';
        if (fileExt === 'png') contentType = 'image/png';
        if (fileExt === 'gif') contentType = 'image/gif';
        if (fileExt === 'webp') contentType = 'image/webp';

        const {error: uploadError} = await supabase.storage
          .from('profiles')
          .upload(filePath, arrayBuffer, {
            contentType,
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          if (uploadError.message?.includes('Bucket not found')) {
            Alert.alert(
              'Storage Error',
              'Storage bucket not configured. Please contact support.'
            );
          }
          return null;
        }

        const {data: urlData} = supabase.storage
          .from('profiles')
          .getPublicUrl(filePath);

        return urlData.publicUrl;
      } catch (error) {
        console.error('Error uploading media:', error);
        return null;
      }
    };

    const handleSubmitPost = async () => {
      try {
        const currentCaption = captionRef.current.trim();
        const currentOptions = optionsRef.current
          .map(opt => opt.trim())
          .filter(Boolean);
        const currentMedia = mediaRef.current;
        const currentLocation = locationRef.current;
        const currentVisibility = visibilityRef.current;

        if (!currentCaption) {
          Alert.alert('Error', 'Please add a poll question.');
          return;
        }

        if (!currentMedia) {
          showToast('error', 'Account Not Found', 'Please sign up first');
          return;
        }

        if (currentOptions.length < 2) {
          Alert.alert('Error', 'Please provide two poll options.');
          return;
        }

        setIsSubmitting(true);

        const {
          data: {user}
        } = await supabase.auth.getUser();
        if (!user) {
          Alert.alert('Error', 'You must be logged in to create a post.');
          return;
        }

        const {data: postData, error: postError} = await supabase
          .from('posts')
          .insert({
            user_id: user.id,
            post_type: 'image_poll',
            caption: currentCaption,
            location: currentLocation || 'Philippines',
            visibility: currentVisibility
          })
          .select()
          .single();

        if (postError) {
          console.error('Post creation error:', postError);
          throw new Error('Failed to create post');
        }

        const durationHours = 48;
        const endsAt = new Date(
          Date.now() + durationHours * 60 * 60 * 1000
        ).toISOString();

        const {data: pollData, error: pollError} = await supabase
          .from('poll_details')
          .insert({
            post_id: postData.id,
            duration_hours: durationHours,
            ends_at: endsAt,
            is_multiple_choice: false
          })
          .select()
          .single();

        if (pollError) {
          console.error('Poll details error:', pollError);
          throw new Error('Failed to create poll details');
        }

        const optionsPayload = currentOptions.map((option, index) => ({
          poll_id: pollData.id,
          option_text: option,
          display_order: index
        }));

        const {error: optionsError} = await supabase
          .from('poll_options')
          .insert(optionsPayload);

        if (optionsError) {
          console.error('Poll options error:', optionsError);
          throw new Error('Failed to create poll options');
        }

        const mediaUrl = await uploadMedia(currentMedia, user.id, postData.id);
        if (mediaUrl) {
          const {error: mediaError} = await supabase.from('post_media').insert({
            post_id: postData.id,
            media_url: mediaUrl,
            media_type: currentMedia.type,
            display_order: 0
          });

          if (mediaError) {
            console.error('Media insert error:', mediaError);
          }
        }

        setCaption('');
        setOptions(['Yes', 'No']);
        setMedia(null);
        setLocation('Philippines');
        setVisibility('everyone');
        onPostSuccess?.();
      } catch (error) {
        console.error('Error creating image poll:', error);
        Alert.alert('Error', 'Failed to create image poll. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    };

    useImperativeHandle(
      ref,
      () => ({
        submit: handleSubmitPost,
        canSubmit: () => !!captionRef.current.trim(),
        isSubmitting: () => isSubmitting
      }),
      [isSubmitting]
    );

    const displayName = profile?.username
      ? `@${profile.username}`
      : profile?.display_name || (username ? `@${username}` : '@user');

    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.userRow}>
          {profile?.profile_picture_url ? (
            <Image
              source={{uri: profile.profile_picture_url}}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatar}>
              <MaterialCommunityIcons
                name="account"
                size={24}
                color="#6B7280"
              />
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.username}>{displayName}</Text>
            <TouchableOpacity
              style={styles.locationBtn}
              onPress={() => setLocationModalVisible(true)}
              disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
          <TouchableOpacity
            style={styles.visibilityBtn}
            onPress={toggleVisibility}
            disabled={isSubmitting}
          >
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

        {/* Add Photo */}
        {media ? (
          <View style={styles.mediaPreview}>
            <Image source={{uri: media.uri}} style={styles.mediaImage} />
            <TouchableOpacity
              style={styles.removeMediaBtn}
              onPress={removeMedia}
              disabled={isSubmitting}
            >
              <MaterialCommunityIcons name="close" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.mediaBox}
            onPress={pickMedia}
            disabled={isSubmitting}
          >
            <MaterialCommunityIcons
              name="image-plus"
              size={48}
              color="#4A7C59"
            />
            <Text style={styles.mediaTitle}>Add Photo</Text>
            <Text style={styles.mediaSubtitle}>
              Add an image for your poll question
            </Text>
          </TouchableOpacity>
        )}

        {/* Poll Question */}
        <TextInput
          style={styles.captionInput}
          placeholder="Ask a question about your image (e.g., Is this place good to visit during summer?)"
          placeholderTextColor="#9CA3AF"
          multiline
          value={caption}
          onChangeText={setCaption}
          editable={!isSubmitting}
        />

        {/* Poll Options */}
        <View style={styles.optionsContainer}>
          <Text style={styles.optionsLabel}>Poll Options</Text>
          {options.map((option, index) => (
            <View key={index} style={styles.optionInputRow}>
              <TextInput
                style={styles.optionInput}
                placeholder={`Option ${index + 1}`}
                placeholderTextColor="#9CA3AF"
                value={option}
                onChangeText={value => updateOption(index, value)}
                editable={!isSubmitting}
              />
            </View>
          ))}
        </View>

        {/* Poll Settings */}
        <View style={styles.settingsContainer}>
          <TouchableOpacity style={styles.settingRow} disabled>
            <MaterialCommunityIcons
              name="clock-outline"
              size={20}
              color="#4A7C59"
            />
            <Text style={styles.settingText}>Poll Duration</Text>
            <Text style={styles.settingValue}>2 days</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        </View>

        <LocationSearchModal
          visible={locationModalVisible}
          onClose={() => setLocationModalVisible(false)}
          onSelectLocation={handleSelectLocation}
        />
      </ScrollView>
    );
  }
);

export default ImagePollPost;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20
  },
  userInfo: {
    flex: 1,
    marginLeft: 12
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937'
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2
  },
  locationText: {
    fontSize: 12,
    color: '#4A7C59',
    marginLeft: 4
  },
  clearLocationBtn: {
    marginLeft: 6
  },
  visibilityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  visibilityText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4
  },
  mediaBox: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 36,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  mediaTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12
  },
  mediaSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4
  },
  mediaPreview: {
    marginHorizontal: 16,
    marginVertical: 12
  },
  mediaImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    backgroundColor: '#F3F4F6'
  },
  removeMediaBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  captionInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#374151',
    minHeight: 60
  },
  optionsContainer: {
    paddingHorizontal: 16,
    marginTop: 8
  },
  optionsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8
  },
  optionInputRow: {
    marginBottom: 8
  },
  optionInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937'
  },
  settingsContainer: {
    marginTop: 20
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6'
  },
  settingText: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 12
  },
  settingValue: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8
  }
});
