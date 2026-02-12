import {showToast} from "@/components/Toast";
import {styles} from "@/features/app/profile/style";
import {UserProfile} from "@/features/app/profile/types";
import {ProfileTab} from "@/features/tabs";
import {supabase} from "@/services/supabase";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {useLocalSearchParams, useRouter} from "expo-router";
import React, {useEffect, useMemo, useState} from "react";

import {ActivityIndicator, Text, TouchableOpacity, View} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{id?: string}>();
  const profileId = useMemo(() => params.id ?? null, [params.id]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileId) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const {data: profileData, error: profileError} = await supabase
          .from("profiles_with_stats")
          .select("*")
          .eq("id", profileId)
          .maybeSingle();

        if (profileError) throw profileError;
        if (!profileData) {
          setProfile(null);
          return;
        }

        const {data: photosData, error: photosError} = await supabase
          .from("profile_photos")
          .select("*")
          .eq("user_id", profileId)
          .order("created_at", {ascending: false});

        if (photosError) throw photosError;

        setProfile({
          ...profileData,
          gallery_photos: photosData || [],
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        showToast("error", "Error", "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Profile not found</Text>
      </View>
    );
  }

  const headerTitle =
    profile.display_name?.trim() || profile.username?.trim() || "Profile";

  return (
    <View style={styles.container}>
      <View style={[styles.header, {paddingTop: insets.top + 12}]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={24}
            color="#111827"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {headerTitle}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ProfileTab profile={profile} showHeader={false} />
    </View>
  );
}
