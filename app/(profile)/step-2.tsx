import {supabase} from '@/services/supabase';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import {useRouter} from 'expo-router';
import {useState} from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {Button} from '../../components/Button';
import {InputField} from '../../components/InputField';
import {showToast} from '../../components/Toast';
import {profileService} from '../../services/profile.service';
import {useProfileStore} from '../../store/profileStore';
import {GENDERS} from '../../utils/constants';

export default function Step2Screen() {
  const router = useRouter();
  const {step2: data, setStep2} = useProfileStore();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // Updated from deprecated MediaTypeOptions.Images
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7
    });

    if (!result.canceled) {
      setUploadingPhoto(true);

      const {
        data: {user}
      } = await supabase.auth.getUser();
      const userId = user?.id;
      if (!userId) {
        showToast('error', 'Error', 'No authenticated user found');
        setUploadingPhoto(false);
        return;
      }

      // Copy file to a permanent location
      const asset = result.assets[0];
      const newPath = `${FileSystem.documentDirectory}${
        asset.fileName ?? 'profile.jpg'
      }`;
      await FileSystem.copyAsync({
        from: asset.uri,
        to: newPath
      });

      const uploadResult = await profileService.uploadProfilePhoto(
        userId,
        newPath,
        1
      );

      if (uploadResult.success && uploadResult.url) {
        setStep2({
          ...data,
          profile_picture_url: uploadResult.url
        });
        showToast('success', 'Success', 'Photo uploaded');
      } else {
        showToast('error', 'Error', uploadResult.error);
      }
      setUploadingPhoto(false);
    }
  };

  const handleNext = () => {
    if (!data.age || data.age < 18) {
      showToast('error', 'Required', 'Please enter valid age (18+)');
      return;
    }
    if (!data.gender) {
      showToast('error', 'Required', 'Please select gender');
      return;
    }
    if (!data.bio.trim()) {
      showToast('error', 'Required', 'Please enter bio');
      return;
    }
    if (data.years_in_van_life < 0) {
      showToast('error', 'Required', 'Please enter years in van life');
      return;
    }

    router.push('/(profile)/step-3');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#4a90e2"
            />
          </TouchableOpacity>
          <Text style={styles.stepIndicator}>Step 2 of 4</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Personal Details</Text>

          <TouchableOpacity
            style={styles.profilePictureContainer}
            onPress={pickImage}
            disabled={uploadingPhoto}
          >
            {data.profile_picture_url ? (
              <Image
                source={{uri: data.profile_picture_url}}
                style={styles.profilePicture}
              />
            ) : (
              <View style={styles.placeholderPicture}>
                <MaterialCommunityIcons
                  name="camera-plus"
                  size={40}
                  color="#4a90e2"
                />
              </View>
            )}

            {uploadingPhoto && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#4a90e2" />
              </View>
            )}
          </TouchableOpacity>

          <InputField
            placeholder="Age"
            value={data.age ? data.age.toString() : ''}
            onChangeText={text => setStep2({...data, age: parseInt(text) || 0})}
            keyboardType="numeric"
            leftIcon="calendar-outline"
          />

          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderGrid}>
            {GENDERS.map(gender => (
              <TouchableOpacity
                key={gender}
                style={[
                  styles.genderChip,
                  data.gender === gender && styles.genderChipSelected
                ]}
                onPress={() => setStep2({...data, gender})}
              >
                <Text
                  style={[
                    styles.genderChipText,
                    data.gender === gender && styles.genderChipTextSelected
                  ]}
                >
                  {gender}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <InputField
            placeholder="Pronouns (optional)"
            value={data.pronouns}
            onChangeText={text => setStep2({...data, pronouns: text})}
            leftIcon="account-outline"
          />

          <View style={styles.bioContainer}>
            <Text style={styles.label}>Bio / About Me</Text>
            <InputField
              placeholder="Tell others about your experience and lifestyle"
              value={data.bio}
              onChangeText={text => setStep2({...data, bio: text})}
              leftIcon="text-box-outline"
            />
          </View>

          <InputField
            placeholder="Years in van life"
            value={
              data.years_in_van_life ? data.years_in_van_life.toString() : ''
            }
            onChangeText={text =>
              setStep2({
                ...data,
                years_in_van_life: parseInt(text) || 0
              })
            }
            keyboardType="numeric"
            leftIcon="speedometer"
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Next" onPress={handleNext} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    marginBottom: 24
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative'
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60
  },
  placeholderPicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed'
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 60
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginTop: 16
  },
  genderGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap'
  },
  genderChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9'
  },
  genderChipSelected: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2'
  },
  genderChipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500'
  },
  genderChipTextSelected: {
    color: '#fff'
  },
  bioContainer: {
    marginBottom: 16
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40
  }
});
