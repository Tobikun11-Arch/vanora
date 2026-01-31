import {supabase} from '@/services/supabase';
import {useUserStore} from '@/store/userStore';
import {
  baseStyles,
  mediaStyles,
  optionsStyles,
  previewStyles,
  userStyles
} from '@/styles/feedtab';
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
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import CategoryModal from './CategoryModal';
import GearTagsModal from './GearTagsModal';
import LocationSearchModal from './LocationSearchModal';
import TagNomadsModal from './TagNomadsModal';

interface MediaItem {
  uri: string;
  type: 'image' | 'video';
}

interface FeedPostProps {
  onPostSuccess?: () => void;
}

export interface FeedPostRef {
  submit: () => Promise<void>;
  canSubmit: () => boolean;
  isSubmitting: () => boolean;
}

interface GearTag {
  name: string;
  brand?: string;
  link?: string;
}

interface TaggedUser {
  id: string;
  username: string | null;
  display_name: string | null;
  profile_picture_url: string | null;
}

const FeedPost = forwardRef<FeedPostRef, FeedPostProps>(function FeedPost(
  {onPostSuccess},
  ref
) {
  const profile = useUserStore(state => state.profile);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState(''); // Default location
  const [visibility, setVisibility] = useState<'everyone' | 'followers'>(
    'everyone'
  );
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gearTags, setGearTags] = useState<GearTag[]>([]);
  const [category, setCategory] = useState<string | null>(null);
  const [gearTagsModalVisible, setGearTagsModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [taggedUsers, setTaggedUsers] = useState<TaggedUser[]>([]);
  const [tagNomadsModalVisible, setTagNomadsModalVisible] = useState(false);

  // Use refs to always have the latest values
  const visibilityRef = useRef(visibility);
  const captionRef = useRef(caption);
  const locationRef = useRef(location);
  const mediaRef = useRef(media);
  const categoryRef = useRef(category);
  const gearTagsRef = useRef(gearTags);
  const taggedUsersRef = useRef(taggedUsers);

  // Keep refs in sync with state
  useEffect(() => {
    visibilityRef.current = visibility;
  }, [visibility]);

  useEffect(() => {
    captionRef.current = caption;
  }, [caption]);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  useEffect(() => {
    mediaRef.current = media;
  }, [media]);

  useEffect(() => {
    categoryRef.current = category;
  }, [category]);

  useEffect(() => {
    gearTagsRef.current = gearTags;
  }, [gearTags]);

  useEffect(() => {
    taggedUsersRef.current = taggedUsers;
  }, [taggedUsers]);

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'], // Updated from deprecated MediaTypeOptions
      allowsEditing: true,
      quality: 0.8
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const mediaType = asset.type === 'video' ? 'video' : 'image';
      setMedia(prev => [...prev, {uri: asset.uri, type: mediaType}]);
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

  const toggleVisibility = () => {
    setVisibility(visibility === 'everyone' ? 'followers' : 'everyone');
  };

  const uploadMedia = async (
    mediaItem: MediaItem,
    userId: string,
    postId: string,
    index: number
  ): Promise<string | null> => {
    try {
      const fileExt = mediaItem.uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${index}_${Date.now()}.${fileExt}`;
      const filePath = `${userId}/posts/${postId}/${fileName}`;

      const response = await fetch(mediaItem.uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();

      // Determine content type based on file extension
      let contentType = 'image/jpeg';
      if (mediaItem.type === 'video') {
        contentType = fileExt === 'mov' ? 'video/quicktime' : 'video/mp4';
      } else if (fileExt === 'png') {
        contentType = 'image/png';
      } else if (fileExt === 'gif') {
        contentType = 'image/gif';
      } else if (fileExt === 'webp') {
        contentType = 'image/webp';
      }

      const {error: uploadError} = await supabase.storage
        .from('profiles')
        .upload(filePath, arrayBuffer, {
          contentType,
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        // Check if bucket doesn't exist
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
      // Use refs to get the latest values
      const currentCaption = captionRef.current;
      const currentMedia = mediaRef.current;
      const currentVisibility = visibilityRef.current;
      const currentLocation = locationRef.current;
      const currentCategory = categoryRef.current;
      const currentGearTags = gearTagsRef.current;
      const currentTaggedUsers = taggedUsersRef.current;

      // Validate
      if (!currentCaption.trim() && currentMedia.length === 0) {
        Alert.alert('Error', 'Please add a caption or media to your post.');
        return;
      }

      setIsSubmitting(true);

      // Get current user
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
          post_type: 'feed',
          caption: currentCaption.trim() || null,
          location: currentLocation || '',
          visibility: currentVisibility,
          category: currentCategory // Add category
        })
        .select()
        .single();

      if (postError) {
        console.error('Post creation error:', postError);
        throw new Error('Failed to create post');
      }

      // Upload media files if any
      if (currentMedia.length > 0) {
        const mediaPromises = currentMedia.map(async (item, index) => {
          const mediaUrl = await uploadMedia(item, user.id, postData.id, index);
          if (mediaUrl) {
            return {
              post_id: postData.id,
              media_url: mediaUrl,
              media_type: item.type,
              display_order: index
            };
          }
          return null;
        });

        const uploadedMedia = await Promise.all(mediaPromises);
        const validMedia = uploadedMedia.filter(m => m !== null);

        if (validMedia.length > 0) {
          const {error: mediaError} = await supabase
            .from('post_media')
            .insert(validMedia);

          if (mediaError) {
            console.error('Media insert error:', mediaError);
            // Post was created but media failed - you might want to handle this
          }
        }
      }

      // Insert gear tags if any
      if (currentGearTags.length > 0) {
        const gearTagsData = currentGearTags.map(tag => ({
          post_id: postData.id,
          gear_name: tag.name,
          gear_brand: tag.brand || null,
          gear_link: tag.link || null
        }));

        const {error: gearError} = await supabase
          .from('post_gear_tags')
          .insert(gearTagsData);

        if (gearError) {
          console.error('Gear tags insert error:', gearError);
        }
      }

      // Insert tagged users if any
      if (currentTaggedUsers.length > 0) {
        const tagsData = currentTaggedUsers.map(taggedUser => ({
          post_id: postData.id,
          tagged_user_id: taggedUser.id
        }));

        const {error: tagsError} = await supabase
          .from('post_tags')
          .insert(tagsData);

        if (tagsError) {
          console.error('Post tags insert error:', tagsError);
        }
      }

      // Success - Reset form and trigger refetch
      setCaption('');
      setMedia([]);
      setLocation('');
      setVisibility('everyone');
      setGearTags([]);
      setCategory(null);
      setTaggedUsers([]);
      onPostSuccess?.();
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useImperativeHandle(
    ref,
    () => ({
      submit: handleSubmitPost,
      canSubmit: () =>
        !!(captionRef.current.trim() || mediaRef.current.length > 0),
      isSubmitting: () => isSubmitting
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isSubmitting]
  );

  const displayName = profile?.username
    ? `@${profile.username}`
    : profile?.display_name || '@user';

  const getCategoryDisplay = () => {
    if (!category) return null;
    const categories: Record<string, {name: string; color: string}> = {
      'van-build': {name: 'Van Build', color: '#F59E0B'},
      travel: {name: 'Travel & Adventures', color: '#10B981'},
      campsite: {name: 'Campsites & Spots', color: '#4A7C59'},
      'gear-review': {name: 'Gear & Reviews', color: '#8B5CF6'},
      tips: {name: 'Tips & Advice', color: '#3B82F6'},
      meetup: {name: 'Meetups & Events', color: '#EC4899'},
      question: {name: 'Questions & Help', color: '#F97316'},
      maintenance: {name: 'Maintenance & Repairs', color: '#6B7280'},
      'remote-work': {name: 'Remote Work', color: '#0EA5E9'},
      pets: {name: 'Pets & Van Life', color: '#A855F7'},
      cooking: {name: 'Van Cooking', color: '#EF4444'},
      'solar-power': {name: 'Solar & Power', color: '#FBBF24'},
      budget: {name: 'Budget & Finance', color: '#22C55E'},
      lifestyle: {name: 'Van Life Lifestyle', color: '#F43F5E'},
      'for-sale': {name: 'For Sale / Trade', color: '#14B8A6'}
    };
    return categories[category];
  };

  return (
    <ScrollView
      style={baseStyles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* User Info Row */}
      <View style={userStyles.userRow}>
        <View style={userStyles.avatarContainer}>
          {profile?.profile_picture_url ? (
            <Image
              source={{uri: profile.profile_picture_url}}
              style={userStyles.avatar}
            />
          ) : (
            <View style={[userStyles.avatar, userStyles.avatarPlaceholder]}>
              <MaterialCommunityIcons
                name="account"
                size={24}
                color="#6B7280"
              />
            </View>
          )}
        </View>
        <View style={userStyles.userInfo}>
          <Text style={userStyles.username}>{displayName}</Text>
          <TouchableOpacity
            style={userStyles.locationBtn}
            onPress={() => setLocationModalVisible(true)}
          >
            <MaterialCommunityIcons
              name="map-marker"
              size={14}
              color="#4A7C59"
            />
            <Text style={userStyles.locationText}>
              {location || 'Add Location'}
            </Text>
            {location ? (
              <TouchableOpacity
                onPress={clearLocation}
                style={userStyles.clearLocationBtn}
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
          style={userStyles.visibilityBtn}
          onPress={toggleVisibility}
        >
          <MaterialCommunityIcons
            name={visibility === 'everyone' ? 'earth' : 'account-group'}
            size={14}
            color="#6B7280"
          />
          <Text style={userStyles.visibilityText}>
            {visibility === 'everyone' ? 'Everyone' : 'Followers'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Caption Input */}
      <TextInput
        style={baseStyles.captionInput}
        placeholder="Share your latest adventure, tip, or question with the community..."
        placeholderTextColor="#9CA3AF"
        multiline
        value={caption}
        onChangeText={setCaption}
        textAlignVertical="top"
        editable={!isSubmitting}
      />

      {/* Media Section */}
      {media.length > 0 ? (
        <View style={mediaStyles.mediaPreviewContainer}>
          {media.map((item, index) => (
            <View key={index} style={mediaStyles.mediaPreviewItem}>
              <Image
                source={{uri: item.uri}}
                style={mediaStyles.mediaPreview}
              />
              <TouchableOpacity
                style={mediaStyles.removeMediaBtn}
                onPress={() => removeMedia(index)}
                disabled={isSubmitting}
              >
                <MaterialCommunityIcons name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={mediaStyles.addMoreMedia}
            onPress={pickMedia}
            disabled={isSubmitting}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#4A7C59" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={mediaStyles.mediaBox}
          onPress={pickMedia}
          disabled={isSubmitting}
        >
          <MaterialCommunityIcons name="image-plus" size={48} color="#4A7C59" />
          <Text style={mediaStyles.mediaTitle}>Add Photo or Video</Text>
          <Text style={mediaStyles.mediaSubtitle}>
            High quality visuals get 2× more reach
          </Text>
        </TouchableOpacity>
      )}

      {/* Options */}
      <View style={optionsStyles.optionsContainer}>
        <TouchableOpacity
          style={optionsStyles.optionRow}
          onPress={() => setTagNomadsModalVisible(true)}
        >
          <MaterialCommunityIcons
            name="account-multiple"
            size={20}
            color="#4A7C59"
          />
          <Text style={optionsStyles.optionText}>Tag Nomads</Text>
          {taggedUsers.length > 0 && (
            <View style={[optionsStyles.badge, {backgroundColor: '#4A7C59'}]}>
              <Text style={optionsStyles.badgeText}>{taggedUsers.length}</Text>
            </View>
          )}
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color="#9CA3AF"
            style={optionsStyles.chevron}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={optionsStyles.optionRow}
          onPress={() => setGearTagsModalVisible(true)}
        >
          <MaterialCommunityIcons name="tag" size={20} color="#F59E0B" />
          <Text style={optionsStyles.optionText}>Add Gear Tags</Text>
          {gearTags.length > 0 && (
            <View style={optionsStyles.badge}>
              <Text style={optionsStyles.badgeText}>{gearTags.length}</Text>
            </View>
          )}
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color="#9CA3AF"
            style={optionsStyles.chevron}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={optionsStyles.optionRow}
          onPress={() => setCategoryModalVisible(true)}
        >
          <MaterialCommunityIcons name="folder" size={20} color="#6B7280" />
          <Text style={optionsStyles.optionText}>Select Category</Text>
          {getCategoryDisplay() && (
            <View
              style={[
                optionsStyles.categoryBadge,
                {backgroundColor: getCategoryDisplay()!.color + '20'}
              ]}
            >
              <Text
                style={[
                  optionsStyles.categoryBadgeText,
                  {color: getCategoryDisplay()!.color}
                ]}
              >
                {getCategoryDisplay()!.name}
              </Text>
            </View>
          )}
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color="#9CA3AF"
            style={optionsStyles.chevron}
          />
        </TouchableOpacity>
      </View>

      {/* Tagged Users Preview */}
      {taggedUsers.length > 0 && (
        <View style={previewStyles.taggedPreviewContainer}>
          <Text style={previewStyles.taggedPreviewTitle}>Tagged Nomads:</Text>
          <View style={previewStyles.taggedPreviewUsers}>
            {taggedUsers.slice(0, 3).map(user => (
              <View key={user.id} style={previewStyles.taggedPreviewUser}>
                {user.profile_picture_url ? (
                  <Image
                    source={{uri: user.profile_picture_url}}
                    style={previewStyles.taggedPreviewAvatar}
                  />
                ) : (
                  <View
                    style={[
                      previewStyles.taggedPreviewAvatar,
                      previewStyles.taggedPreviewAvatarPlaceholder
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="account"
                      size={10}
                      color="#4A7C59"
                    />
                  </View>
                )}
                <Text style={previewStyles.taggedPreviewText}>
                  {user.username ? `@${user.username}` : user.display_name}
                </Text>
              </View>
            ))}
            {taggedUsers.length > 3 && (
              <Text style={previewStyles.taggedMoreText}>
                +{taggedUsers.length - 3} more
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Gear Tags Preview */}
      {gearTags.length > 0 && (
        <View style={previewStyles.gearPreviewContainer}>
          <Text style={previewStyles.gearPreviewTitle}>Tagged Gear:</Text>
          <View style={previewStyles.gearPreviewTags}>
            {gearTags.slice(0, 3).map((tag, index) => (
              <View key={index} style={previewStyles.gearPreviewTag}>
                <Text style={previewStyles.gearPreviewTagText}>
                  {tag.brand ? `${tag.brand} ` : ''}
                  {tag.name}
                </Text>
              </View>
            ))}
            {gearTags.length > 3 && (
              <Text style={previewStyles.gearMoreText}>
                +{gearTags.length - 3} more
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Location Search Modal */}
      <LocationSearchModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        onSelectLocation={handleSelectLocation}
      />

      {/* Gear Tags Modal */}
      <GearTagsModal
        visible={gearTagsModalVisible}
        onClose={() => setGearTagsModalVisible(false)}
        selectedTags={gearTags}
        onUpdateTags={setGearTags}
      />

      {/* Category Modal */}
      <CategoryModal
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        selectedCategory={category}
        onSelectCategory={setCategory}
      />

      {/* Tag Nomads Modal */}
      <TagNomadsModal
        visible={tagNomadsModalVisible}
        onClose={() => setTagNomadsModalVisible(false)}
        selectedUsers={taggedUsers}
        onUpdateUsers={setTaggedUsers}
      />
    </ScrollView>
  );
});

export default FeedPost;
