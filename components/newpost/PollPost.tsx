import {supabase} from '@/services/supabase';
import {useUserStore} from '@/store/userStore';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
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
import LocationSearchModal from './LocationSearchModal';

interface PollPostProps {
  username?: string;
  onPostSuccess?: () => void;
}

export interface PollPostRef {
  submit: () => Promise<void>;
  canSubmit: () => boolean;
  isSubmitting: () => boolean;
}

const PollPost = forwardRef<PollPostRef, PollPostProps>(function PollPost(
  {username, onPostSuccess},
  ref
) {
  const profile = useUserStore(state => state.profile);
  const [caption, setCaption] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [location, setLocation] = useState('Philippines');
  const [visibility, setVisibility] = useState<'everyone' | 'followers'>(
    'everyone'
  );
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const captionRef = useRef(caption);
  const optionsRef = useRef(options);
  const locationRef = useRef(location);
  const visibilityRef = useRef(visibility);

  useEffect(() => {
    captionRef.current = caption;
  }, [caption]);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

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

  const handleSubmitPost = async () => {
    try {
      const currentCaption = captionRef.current.trim();
      const currentOptions = optionsRef.current
        .map(opt => opt.trim())
        .filter(Boolean);
      const currentLocation = locationRef.current;
      const currentVisibility = visibilityRef.current;

      if (!currentCaption) {
        Alert.alert('Error', 'Please add a poll question.');
        return;
      }

      if (currentOptions.length < 2) {
        Alert.alert('Error', 'Please add at least 2 poll options.');
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
          post_type: 'poll',
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

      setCaption('');
      setOptions(['', '', '', '']);
      setLocation('Philippines');
      setVisibility('everyone');
      onPostSuccess?.();
    } catch (error) {
      console.error('Error creating poll:', error);
      Alert.alert('Error', 'Failed to create poll. Please try again.');
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
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* User Info */}
      <View style={styles.userRow}>
        {profile?.profile_picture_url ? (
          <Image
            source={{uri: profile.profile_picture_url}}
            style={styles.avatarImage}
          />
        ) : (
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account" size={24} color="#6B7280" />
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

      {/* Poll Question */}
      <TextInput
        style={styles.captionInput}
        placeholder="Ask a question to the community..."
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
        <Text style={styles.helperText}>Add 2-4 options for your poll</Text>
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
});

export default PollPost;

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
  helperText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4
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
