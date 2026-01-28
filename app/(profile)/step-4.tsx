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
  StyleSheet,
  Text,
  TouchableOpacity,
  View
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
        nomad_type: step1.nomad_type,
        travel_style: step1.travel_style,
        relationship_intent: step1.relationship_intent,
        current_location: step1.current_location,
        movement_pattern: step1.movement_pattern,
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#4a90e2" />
        </TouchableOpacity>
        <Text style={styles.stepIndicator}>Step 4 of 4</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Gallery</Text>
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
              color="#999"
            />
            <Text style={styles.emptyText}>No photos yet</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.addPhotoButton}
          onPress={pickImage}
          disabled={data.photos.length >= 3}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#4a90e2" />
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
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20
  },
  stepIndicator: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
    marginRight: 24
  },
  content: {paddingHorizontal: 20, paddingVertical: 20},
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  subtitle: {fontSize: 14, color: '#666', marginBottom: 16},
  label: {fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 12},
  photoGrid: {justifyContent: 'flex-start'},
  photoItem: {margin: 4, position: 'relative'},
  photo: {width: 100, height: 100, borderRadius: 8},
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#0008',
    borderRadius: 12,
    padding: 2
  },
  emptyState: {alignItems: 'center', marginVertical: 20},
  emptyText: {color: '#999', marginTop: 8},
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16
  },
  addPhotoText: {marginLeft: 8, color: '#4a90e2', fontWeight: '600'},
  buttonContainer: {paddingHorizontal: 20, paddingBottom: 40}
});
