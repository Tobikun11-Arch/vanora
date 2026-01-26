import {MaterialCommunityIcons} from '@expo/vector-icons';
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7
    });

    if (!result.canceled) {
      setStep4({
        ...data,
        photos: [
          ...data.photos,
          {
            uri: result.assets[0].uri,
            type: 'van'
          }
        ]
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
      const userId = 'temp-user'; // Get from auth context

      // Upload all photos
      const uploadPromises = data.photos.map((photo, index) =>
        profileService.uploadGalleryPhoto(userId, photo.uri, index + 1)
      );

      const uploadResults = await Promise.all(uploadPromises);
      const allSuccess = uploadResults.every(result => result.success);

      if (!allSuccess) {
        showToast('error', 'Error', 'Failed to upload some photos');
        setLoading(false);
        return;
      }

      showToast('success', 'Success', 'Profile created successfully');
      router.replace('/(app)/dashboard');
    } catch (error: any) {
      showToast('error', 'Error', error.message);
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

        <View style={styles.photoTypes}>
          <Text style={styles.photoTypeTitle}>Photo Categories:</Text>
          <Text style={styles.photoTypeItem}>
            🚐 Your Rig: Van interior, setup, gear
          </Text>
          <Text style={styles.photoTypeItem}>
            ✈️ Travel Shots: Destinations, landscapes
          </Text>
          <Text style={styles.photoTypeItem}>
            🎨 Lifestyle: Cooking, pets, hobbies
          </Text>
        </View>
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
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
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
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 12,
    color: '#999',
    marginBottom: 16
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12
  },
  photoGrid: {
    justifyContent: 'space-between',
    marginBottom: 12
  },
  photoItem: {
    width: '32%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative'
  },
  photo: {
    width: '100%',
    height: '100%'
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 16
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
    marginTop: 8
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#4a90e2',
    borderStyle: 'dashed',
    borderRadius: 8,
    marginBottom: 24,
    gap: 8
  },
  addPhotoText: {
    color: '#4a90e2',
    fontSize: 14,
    fontWeight: '500'
  },
  photoTypes: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8
  },
  photoTypeTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  photoTypeItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40
  }
});
