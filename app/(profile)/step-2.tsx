import {supabase} from '@/services/supabase';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import * as Location from 'expo-location';
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
  SafeAreaView,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Dimensions
} from 'react-native';
import {Button} from '../../components/Button';
import {InputField} from '../../components/InputField';
import {showToast} from '../../components/Toast';
import {profileService} from '../../services/profile.service';
import {useProfileStore} from '../../store/profileStore';
import {GENDERS} from '../../utils/constants';

export default function Step2Screen() {
  const router = useRouter();
  const {step2: data, setStep2, step1, setStep1} = useProfileStore();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const isVanLifer = step1.nomad_type === 'Van Lifer';

  const getLocationName = async (latitude: number, longitude: number) => {
    try {
      const result = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });
      if (result[0]) {
        const {city, region, country} = result[0];
        return `${city || region}, ${country}`;
      }
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  };

  const handleGetCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const {status} = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showToast(
          'error',
          'Permission Denied',
          'Location permission is required'
        );
        setLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });

      const locationName = await getLocationName(
        location.coords.latitude,
        location.coords.longitude
      );

      setStep1({...step1, current_location: locationName});
      showToast('success', 'Location Found', locationName);
    } catch (error) {
      console.error('Location error:', error);
    } finally {
      setLoadingLocation(false);
    }
  };

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
    if (!step1.current_location.trim()) {
      showToast('error', 'Required', 'Please enter current location');
      return;
    }
    if (isVanLifer && data.years_in_van_life < 0) {
      showToast('error', 'Required', 'Please enter years in van life');
      return;
    }

    router.push('/(profile)/step-3');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView>
      <View style={styles.headerBlock}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={22}
              color={COLORS.primary}
            />
          </TouchableOpacity>
          <View style={styles.progressArea}>
            <View style={styles.progressRow}>
              <Text style={styles.progressStep}>Step 2 of 4</Text>
              <Text style={styles.progressPercent}>50% Complete</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, {width: '50%'}]} />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Personal Details</Text>
        <View style={styles.sectionDivider} />

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
                  color={COLORS.primary}
                />
              </View>
            )}

            {uploadingPhoto && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Age</Text>
          <InputField
            placeholder="Enter age"
            value={data.age ? data.age.toString() : ''}
            onChangeText={text => setStep2({...data, age: parseInt(text) || 0})}
            keyboardType="numeric"
            leftIcon="calendar-outline"
            compact
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

          <View style={styles.bioContainer}>
            <Text style={styles.label}>Bio / About Me</Text>
            <InputField
              placeholder="Tell others about your experience and lifestyle"
              value={data.bio}
              onChangeText={text => setStep2({...data, bio: text})}
              leftIcon="text-box-outline"
              compact
            />
          </View>

          {isVanLifer && (
            <>
              <Text style={styles.label}>Years in van life</Text>
              <InputField
                placeholder="Enter years in van life"
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
                compact
              />
            </>
          )}

          <Text style={styles.label}>Current Location (City/Region)</Text>
          <TouchableOpacity
            onPress={handleGetCurrentLocation}
            disabled={loadingLocation}
          >
            <View style={styles.locationInputWrapper}>
              {loadingLocation ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={18}
                  color={COLORS.muted}
                  style={styles.locationIcon}
                />
              )}
              <Text style={styles.locationPlaceholder}>
                {step1.current_location || 'Tap to select location'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Next" onPress={handleNext} />
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  container: {
    flex: 1,
    backgroundColor: COLORS.bg
  },
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
    marginBottom: SPACING.sm,
    letterSpacing: 0.2
  },
  sectionDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.lg
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    marginTop: SPACING.sm,
    position: 'relative'
  },
  profilePicture: {
    width: scale(120),
    height: scale(120),
    borderRadius: scale(60),
    borderWidth: 2,
    borderColor: COLORS.border
  },
  placeholderPicture: {
    width: scale(120),
    height: scale(120),
    borderRadius: scale(60),
    backgroundColor: COLORS.chipBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
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
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: scale(60)
  },
  label: {
    fontSize: scale(13),
    fontWeight: '600',
    color: COLORS.sub,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
    letterSpacing: 0.2
  },
  genderGrid: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
    flexWrap: 'wrap'
  },
  genderChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: scale(18),
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.chipBg
  },
  genderChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  genderChipText: {
    fontSize: scale(12),
    color: COLORS.sub,
    fontWeight: '600'
  },
  genderChipTextSelected: {
    color: '#fff'
  },
  locationInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: scale(12),
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#f7f9f8',
    minHeight: scale(40),
    marginBottom: SPACING.sm
  },
  locationIcon: {
    marginRight: SPACING.xs
  },
  locationPlaceholder: {
    flex: 1,
    fontSize: scale(13),
    color: COLORS.muted
  },
  bioContainer: {
    marginBottom: SPACING.xs
  },
  buttonContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.md
  }
});
