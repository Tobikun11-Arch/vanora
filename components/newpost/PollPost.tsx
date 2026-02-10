import {supabase} from '@/services/supabase';
import {useUserStore} from '@/store/userStore';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import LocationSearchModal from './LocationSearchModal';

const {width, height} = Dimensions.get('window');
const scale = Math.min(Math.min(width, height) / 375, 1.2);
const s = (value: number) => Math.round(value * scale);

const COLORS = {
  primary: '#2e7d64',
  background: '#ffffff',
  surface: '#ffffff',
  border: '#e6efea',
  text: '#1f2a24',
  muted: '#7f8b85',
  placeholder: '#9aa6a1'
};

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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
              color={COLORS.primary}
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
                  color={COLORS.placeholder}
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
        placeholderTextColor={COLORS.placeholder}
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
              placeholderTextColor={COLORS.placeholder}
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
              color={COLORS.primary}
            />
          <Text style={styles.settingText}>Poll Duration</Text>
          <Text style={styles.settingValue}>2 days</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={COLORS.placeholder}
          />
        </TouchableOpacity>
      </View>

        <LocationSearchModal
          visible={locationModalVisible}
          onClose={() => setLocationModalVisible(false)}
          onSelectLocation={handleSelectLocation}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

export default PollPost;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  contentContainer: {
    paddingBottom: s(300)
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(16),
    paddingVertical: s(12)
  },
  avatar: {
    width: s(44),
    height: s(44),
    borderRadius: s(22),
    backgroundColor: '#eef2f1',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarImage: {
    width: s(44),
    height: s(44),
    borderRadius: s(22)
  },
  userInfo: {
    flex: 1,
    marginLeft: s(12)
  },
  username: {
    fontSize: s(15),
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: 0.2
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: s(2),
    alignSelf: 'flex-start',
    paddingHorizontal: s(6),
    paddingVertical: s(3),
    borderRadius: s(12),
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  locationText: {
    fontSize: s(11),
    color: COLORS.primary,
    marginLeft: s(4)
  },
  clearLocationBtn: {
    marginLeft: s(6)
  },
  visibilityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(10),
    paddingVertical: s(6),
    borderRadius: s(16),
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignSelf: 'center'
  },
  visibilityText: {
    fontSize: s(11),
    color: COLORS.muted,
    marginLeft: s(6)
  },
  captionInput: {
    marginHorizontal: s(16),
    marginTop: s(8),
    paddingHorizontal: s(14),
    paddingVertical: s(10),
    fontSize: s(14),
    color: COLORS.text,
    minHeight: s(72),
    lineHeight: s(20),
    borderRadius: s(14),
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    letterSpacing: 0.2,
    shadowColor: '#0b1a12',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 6},
    elevation: 2
  },
  optionsContainer: {
    marginTop: s(16),
    marginHorizontal: s(16),
    paddingHorizontal: s(14),
    paddingVertical: s(12),
    borderRadius: s(16),
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#0b1a12',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 2
  },
  optionsLabel: {
    fontSize: s(12),
    fontWeight: '600',
    color: COLORS.muted,
    marginBottom: s(8),
    letterSpacing: 0.2
  },
  optionInputRow: {
    marginBottom: s(10)
  },
  optionInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: s(12),
    paddingHorizontal: s(12),
    paddingVertical: s(10),
    fontSize: s(14),
    color: COLORS.text,
    backgroundColor: '#fbfdfc'
  },
  helperText: {
    fontSize: s(12),
    color: COLORS.placeholder,
    marginTop: s(4)
  },
  settingsContainer: {
    marginTop: s(18),
    marginHorizontal: s(16),
    borderRadius: s(16),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    shadowColor: '#0b1a12',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 2
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(16),
    paddingVertical: s(14)
  },
  settingText: {
    flex: 1,
    fontSize: s(14),
    color: COLORS.text,
    marginLeft: s(12)
  },
  settingValue: {
    fontSize: s(14),
    color: COLORS.muted,
    marginRight: s(8)
  }
});
