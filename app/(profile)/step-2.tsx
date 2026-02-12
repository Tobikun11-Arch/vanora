import {styles} from "@/components/onboarding/step-2/style";
import {supabase} from "@/services/supabase";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import {useRouter} from "expo-router";
import React, {useState} from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {Button} from "../../components/Button";
import {InputField} from "../../components/InputField";
import {showToast} from "../../components/Toast";
import {profileService} from "../../services/profile.service";
import {useProfileStore} from "../../store/profileStore";
import {GENDERS} from "../../utils/constants";


export default function Step2Screen() {
  const router = useRouter();
  const {step2: data, setStep2, step1, setStep1} = useProfileStore();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const isVanLifer = step1.nomad_type === "Van Lifer";

  const getLocationName = async (latitude: number, longitude: number) => {
    try {
      const result = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (result[0]) {
        const {city, region, country} = result[0];
        return `${city || region}, ${country}`;
      }
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  };

  const handleGetCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const {status} = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        showToast(
          "error",
          "Permission Denied",
          "Location permission is required",
        );
        setLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const locationName = await getLocationName(
        location.coords.latitude,
        location.coords.longitude,
      );

      setStep1({...step1, current_location: locationName});
      showToast("success", "Location Found", locationName);
    } catch (error) {
      console.error("Location error:", error);
      showToast("error", "Location Error", "Failed to get current location");
    } finally {
      setLoadingLocation(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], // Updated from deprecated MediaTypeOptions.Images
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setUploadingPhoto(true);

      const {
        data: {user},
      } = await supabase.auth.getUser();
      const userId = user?.id;
      if (!userId) {
        showToast("error", "Error", "No authenticated user found");
        setUploadingPhoto(false);
        return;
      }

      // Copy file to a permanent location
      const asset = result.assets[0];
      const newPath = `${FileSystem.documentDirectory}${
        asset.fileName ?? "profile.jpg"
      }`;
      await FileSystem.copyAsync({
        from: asset.uri,
        to: newPath,
      });

      const uploadResult = await profileService.uploadProfilePhoto(
        userId,
        newPath,
        1,
      );

      if (uploadResult.success && uploadResult.url) {
        setStep2({
          ...data,
          profile_picture_url: uploadResult.url,
        });
        showToast("success", "Success", "Photo uploaded");
      } else {
        showToast("error", "Error", uploadResult.error);
      }
      setUploadingPhoto(false);
    }
  };

  const handleNext = () => {
    if (!data.age || data.age < 18) {
      showToast("error", "Required", "Please enter valid age (18+)");
      return;
    }
    if (!data.gender) {
      showToast("error", "Required", "Please select gender");
      return;
    }
    if (!data.bio.trim()) {
      showToast("error", "Required", "Please enter bio");
      return;
    }
    if (!step1.current_location.trim()) {
      showToast("error", "Required", "Please enter current location");
      return;
    }
    if (isVanLifer && data.years_in_van_life < 0) {
      showToast("error", "Required", "Please enter years in van life");
      return;
    }

    router.push("/(profile)/step-3");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
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
                  <View style={[styles.progressFill, {width: "50%"}]} />
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
              value={data.age ? data.age.toString() : ""}
              onChangeText={(text) =>
                setStep2({...data, age: parseInt(text) || 0})
              }
              keyboardType="numeric"
              leftIcon="calendar-outline"
              compact
            />

            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderGrid}>
              {GENDERS.map((gender) => (
                <TouchableOpacity
                  key={gender}
                  style={[
                    styles.genderChip,
                    data.gender === gender && styles.genderChipSelected,
                  ]}
                  onPress={() => setStep2({...data, gender})}
                >
                  <Text
                    style={[
                      styles.genderChipText,
                      data.gender === gender && styles.genderChipTextSelected,
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
                onChangeText={(text) => setStep2({...data, bio: text})}
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
                    data.years_in_van_life
                      ? data.years_in_van_life.toString()
                      : ""
                  }
                  onChangeText={(text) =>
                    setStep2({
                      ...data,
                      years_in_van_life: parseInt(text) || 0,
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
                  {step1.current_location || "Tap to select location"}
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
