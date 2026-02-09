import {supabase} from '@/services/supabase';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import {useRouter} from 'expo-router';
import {useState} from 'react';
import {
  FlatList,
  Image,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Platform
} from 'react-native';
import {Button} from '../../components/Button';
import {showToast} from '../../components/Toast';
import {profileService} from '../../services/profile.service';
import {useProfileStore} from '../../store/profileStore';

export default function Step4Screen() {
  const router = useRouter();
  const {step4: data, setStep4} = useProfileStore();
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    if (data.photos.length >= 3) {
      showToast('error', 'Limit Reached', 'You can upload maximum 3 photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // Updated from deprecated MediaTypeOptions.Images
      allowsEditing: true,
      quality: 0.7
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const newPath = `${FileSystem.documentDirectory}${
        asset.fileName ?? `gallery-${Date.now()}.jpg`
      }`;

      await FileSystem.copyAsync({from: asset.uri, to: newPath});

      setStep4({
        ...data,
        photos: [...data.photos, {uri: newPath, type: 'van'}]
      });

      showToast('success', 'Success', 'Photo added');
    }
  };

  const removePhoto = (index: number) => {
    setStep4({
      ...data,
      photos: data.photos.filter((_, i) => i !== index)
    });
  };

  const handleComplete = async () => {
    if (data.photos.length < 1) {
      showToast('error', 'Required', 'Please add at least 1 photo');
      return;
    }

    setLoading(true);
    try {
      const {
        data: {user}
      } = await supabase.auth.getUser();
      const userId = user?.id;
      if (!userId) throw new Error('No authenticated user found');

      // Helper function to check if URI is a remote URL
      const isRemoteUrl = (uri: string) =>
        uri.startsWith('http://') || uri.startsWith('https://');

      // Upload only local photos (skip already uploaded ones)
      const uploadResults = [];
      for (let i = 0; i < data.photos.length; i++) {
        const photo = data.photos[i];

        // Skip if already uploaded (remote URL)
        if (isRemoteUrl(photo.uri)) {
          uploadResults.push({success: true, url: photo.uri});
          continue;
        }

        try {
          const result = await profileService.uploadGalleryPhoto(
            userId,
            photo.uri,
            i + 1
          );
          uploadResults.push(result);
        } catch (uploadError: any) {
          console.error(`Failed to upload photo ${i + 1}:`, uploadError);
          uploadResults.push({success: false, error: uploadError.message});
        }
      }

      // Check if all uploads succeeded before proceeding
      const allSuccess = uploadResults.every(r => r.success);
      if (!allSuccess) {
        const failedCount = uploadResults.filter(r => !r.success).length;
        const errorMessages = uploadResults
          .filter(r => !r.success)
          .map(r => r.error)
          .join(', ');
        console.error('Upload failures:', errorMessages);
        showToast(
          'error',
          'Upload Failed',
          `Failed to upload ${failedCount} photo(s): ${
            errorMessages || 'Unknown error'
          }`
        );
        setLoading(false);
        return;
      }

      // Only update state after confirming all uploads succeeded
      const updatedPhotos = uploadResults
        .map((result, i) =>
          result.success && result.url
            ? {uri: result.url, type: data.photos[i].type}
            : null
        )
        .filter(photo => photo !== null) as {
        uri: string;
        type: 'van' | 'travel' | 'lifestyle';
      }[];

      setStep4({...data, photos: updatedPhotos});

      // Save complete profile data to Supabase
      const {step1, step2, step3} = useProfileStore.getState();

      const profileData = {
        id: userId,
        nomad_type: step1.nomad_type === 'Builder' ? 'Mechanic' : step1.nomad_type,
        travel_style: step1.travel_style,
        relationship_intent: step1.relationship_intent,
        current_location: step1.current_location,
        movement_pattern: step1.movement_pattern,
        mechanic_whatsapp: step1.mechanic_whatsapp,
        mechanic_email: step1.mechanic_email,
        mechanic_instagram: step1.mechanic_instagram,
        age: step2.age,
        gender: step2.gender,
        pronouns: step2.pronouns,
        bio: step2.bio,
        years_in_van_life: step2.years_in_van_life,
        profile_picture_url: step2.profile_picture_url,
        hobbies: step3.hobbies,
        skills: step3.skills,
        lifestyle_tags: step3.lifestyle_tags,
        favorite_activities: step3.favorite_activities
        // Removed gallery_photos - will use profile_photos table instead
      };

      // Upsert the profile
      const {error} = await supabase
        .from('profiles')
        .upsert(profileData, {onConflict: 'id'});

      if (error) {
        console.error('Profile save error:', error);
        throw error;
      }

      // Save gallery photos to profile_photos table
      if (updatedPhotos.length > 0) {
        const photoRecords = updatedPhotos.map((photo, index) => ({
          user_id: userId,
          photo_url: photo.uri,
          photo_type: 'gallery' as const,
          display_order: index,
          is_primary: false
        }));

        const {error: photosError} = await supabase
          .from('profile_photos')
          .insert(photoRecords);

        if (photosError) {
          console.error('Gallery photos save error:', photosError);
          // Don't throw - profile is saved, photos are secondary
          showToast(
            'error',
            'Warning',
            'Profile saved but gallery photos failed'
          );
        }
      }

      showToast('success', 'Success', 'Profile created successfully');
      router.replace('/(app)/dashboard');
    } catch (error: any) {
      console.error('handleComplete error:', error);
      showToast(
        'error',
        'Error',
        error.message || 'An unexpected error occurred'
      );
      setLoading(false);
    }
  };

  const renderPhotoItem = ({
    item,
    index
  }: {
    item: (typeof data.photos)[0];
    index: number;
  }) => (
    <View style={styles.photoItem}>
      <Image source={{uri: item.uri}} style={styles.photo} />
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removePhoto(index)}
      >
        <MaterialCommunityIcons name="close" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
      <View style={styles.headerBlock}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={22}
              color={COLORS.primary}
            />
          </TouchableOpacity>
          <View style={styles.progressArea}>
            <View style={styles.progressRow}>
              <Text style={styles.progressStep}>Step 4 of 4</Text>
              <Text style={styles.progressPercent}>100% Complete</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, {width: '100%'}]} />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Gallery</Text>
        <View style={styles.sectionDivider} />
        <Text style={styles.subtitle}>
          Add at least 1 photo to boost visibility
        </Text>

        <Text style={styles.label}>Photos ({data.photos.length}/3)</Text>

        {data.photos.length > 0 ? (
          <FlatList
            data={data.photos}
            renderItem={renderPhotoItem}
            keyExtractor={(_, index) => index.toString()}
            numColumns={3}
            scrollEnabled={false}
            columnWrapperStyle={styles.photoGrid}
          />
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="image-multiple"
              size={40}
              color={COLORS.muted}
            />
            <Text style={styles.emptyText}>No photos yet</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.addPhotoButton}
          onPress={pickImage}
          disabled={data.photos.length >= 3}
        >
          <MaterialCommunityIcons name="plus" size={24} color={COLORS.primary} />
          <Text style={styles.addPhotoText}>
            Add Photo{' '}
            {data.photos.length < 3
              ? `(${3 - data.photos.length} more)`
              : '(Max)'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Complete Profile"
          onPress={handleComplete}
          loading={loading}
          disabled={loading}
        />
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const {width, height} = Dimensions.get('window');
const scale = (size: number) =>
  Math.round((Math.min(width, height) / 375) * size);
const STATUS_BAR_HEIGHT =
  Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0;
const SAFE_TOP_PADDING = Math.max(0, STATUS_BAR_HEIGHT);
const IS_IOS = Platform.OS === 'ios';

const SPACING = {
  xs: scale(6),
  sm: scale(10),
  md: scale(14),
  lg: scale(18),
  xl: scale(24)
};

const COLORS = {
  primary: '#2e7d64',
  bg: '#f6f8f7',
  card: '#ffffff',
  text: '#0f1a15',
  sub: '#5e6b65',
  muted: '#8b9591',
  border: '#e3e9e6',
  chipBg: '#f1f5f3'
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingTop: SAFE_TOP_PADDING
  },
  container: {flex: 1, backgroundColor: COLORS.bg},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingRight: SPACING.md,
    paddingTop: IS_IOS ? 0 : SPACING.xl,
    paddingBottom: SPACING.md
  },
  headerBlock: {
    marginHorizontal: SPACING.sm,
    marginBottom: SPACING.sm
  },
  backButton: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  progressArea: {
    flex: 1,
    marginLeft: SPACING.md
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs
  },
  progressStep: {
    fontSize: scale(12),
    color: COLORS.sub,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase'
  },
  progressPercent: {
    fontSize: scale(12),
    color: COLORS.primary,
    fontWeight: '700'
  },
  progressTrack: {
    height: scale(6),
    backgroundColor: COLORS.border,
    borderRadius: scale(999),
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    width: '100%',
    backgroundColor: COLORS.primary
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.lg,
    borderRadius: scale(20),
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 2
  },
  sectionTitle: {
    fontSize: scale(20),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs
  },
  sectionDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.md
  },
  subtitle: {
    fontSize: scale(13),
    color: COLORS.sub,
    marginBottom: SPACING.md
  },
  label: {
    fontSize: scale(13),
    fontWeight: '600',
    color: COLORS.sub,
    marginBottom: SPACING.sm
  },
  photoGrid: {
    justifyContent: 'space-between'
  },
  photoItem: {
    flexBasis: '32%',
    maxWidth: '32%',
    aspectRatio: 1,
    position: 'relative',
    borderRadius: scale(12),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xs
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  removeButton: {
    position: 'absolute',
    top: scale(6),
    right: scale(6),
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: scale(10),
    padding: scale(3)
  },
  emptyState: {alignItems: 'center', marginVertical: SPACING.lg},
  emptyText: {color: COLORS.muted, marginTop: SPACING.xs},
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    backgroundColor: COLORS.chipBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: scale(12),
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md
  },
  addPhotoText: {
    marginLeft: SPACING.xs,
    color: COLORS.primary,
    fontWeight: '600'
  },
  buttonContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.md
  }
});
