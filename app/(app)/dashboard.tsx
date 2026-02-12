import {showToast} from "@/components/Toast";
import {styles} from "@/features/app/dashboard/style";
import {TabType, UserProfile} from "@/features/app/dashboard/types";
import {
  ExploreTab,
  FindTechTab,
  HomeTab,
  NotificationsTab,
  ProfileTab,
} from "@/features/tabs/index";
import {supabase} from "@/services/supabase";
import {useUserStore} from "@/store/userStore";
import {Feather} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import React, {useEffect, useMemo, useState} from "react";

import {Image, Text, TouchableOpacity, View, ViewStyle} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";

export default function DashboardScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const setUserProfile = useUserStore((state) => state.setProfile);
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);
  const bottomBarHeight = 64;
  const contentPaddingBottom = useMemo(
    () => bottomBarHeight + bottomInset + 12,
    [bottomInset],
  );
  const tabVisibilityStyle = (tab: TabType): ViewStyle => ({
    display: activeTab === tab ? "flex" : "none",
    flex: 1,
  });

  const findTechTab = useMemo(() => <FindTechTab />, []);
  const exploreTab = useMemo(() => <ExploreTab />, []);
  const notificationsTab = useMemo(() => <NotificationsTab />, []);
  const homeTab = useMemo(
    () => (profile ? <HomeTab profile={profile} /> : null),
    [profile],
  );
  const profileTab = useMemo(
    () => (profile ? <ProfileTab profile={profile} /> : null),
    [profile],
  );

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const {
          data: {user},
        } = await supabase.auth.getUser();
        if (!user) {
          router.replace("/(auth)/get-started");
          return;
        }

        const {data: profileData, error: profileError} = await supabase
          .from("profiles_with_stats")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        // If no profile exists, redirect to profile setup
        if (!profileData) {
          router.replace("/(profile)/step-1");
          return;
        }

        // Check if profile is complete - verify required fields from each step
        const isStep1Complete =
          profileData.nomad_type &&
          profileData.travel_style &&
          profileData.relationship_intent?.length > 0 &&
          profileData.current_location &&
          profileData.movement_pattern;

        const isStep2Complete =
          profileData.age &&
          profileData.age >= 18 &&
          profileData.gender &&
          profileData.bio;

        const isStep3Complete = profileData.hobbies?.length > 0;

        // Fetch gallery photos to check step 4
        const {data: photosData} = await supabase
          .from("profile_photos")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", {ascending: false});

        const isStep4Complete = photosData && photosData.length >= 1;

        // Redirect to the appropriate step if profile is incomplete
        if (!isStep1Complete) {
          router.replace("/(profile)/step-1");
          return;
        }
        if (!isStep2Complete) {
          router.replace("/(profile)/step-2");
          return;
        }
        if (!isStep3Complete) {
          router.replace("/(profile)/step-3");
          return;
        }
        if (!isStep4Complete) {
          router.replace("/(profile)/step-4");
          return;
        }

        const nextProfile = {
          ...profileData,
          gallery_photos: photosData || [],
        };

        setProfile(nextProfile);
        setUserProfile({
          id: nextProfile.id,
          username: nextProfile.username ?? null,
          display_name: nextProfile.display_name ?? null,
          profile_picture_url: nextProfile.profile_picture_url ?? null,
          nomad_type: nextProfile.nomad_type ?? null,
          current_location: nextProfile.current_location ?? null,
        });
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        showToast("error", "Error", "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleTabPress = (tab: TabType) => {
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Image
          source={require("../../assets/gif/busGif.gif")}
          style={styles.loadingGif}
        />
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

  return (
    <View style={styles.mainContainer}>
      {/* Tab Content */}
      <View
        style={[styles.contentContainer, {paddingBottom: contentPaddingBottom}]}
      >
        <View style={tabVisibilityStyle("findtech")}>{findTechTab}</View>
        <View style={tabVisibilityStyle("explore")}>{exploreTab}</View>
        <View style={tabVisibilityStyle("home")}>{homeTab}</View>
        <View style={tabVisibilityStyle("notifications")}>
          {notificationsTab}
        </View>
        <View style={tabVisibilityStyle("profile")}>{profileTab}</View>
      </View>

      {/* Bottom Navigation Bar */}
      <View
        style={[
          styles.bottomBar,
          {bottom: bottomInset, minHeight: bottomBarHeight},
        ]}
      >
        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === "findtech" && styles.activeTabItem,
          ]}
          onPress={() => handleTabPress("findtech")}
        >
          <Feather
            name="tool"
            size={24}
            color={activeTab === "findtech" ? "#2E7D64" : "#9CA3AF"}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === "findtech" && styles.activeTabLabel,
            ]}
          >
            Builder
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === "explore" && styles.activeTabItem,
          ]}
          onPress={() => handleTabPress("explore")}
        >
          <Feather
            name="compass"
            size={24}
            color={activeTab === "explore" ? "#2E7D64" : "#9CA3AF"}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === "explore" && styles.activeTabLabel,
            ]}
          >
            Explore
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === "home" && styles.activeTabItem]}
          onPress={() => handleTabPress("home")}
        >
          <Feather
            name="home"
            size={24}
            color={activeTab === "home" ? "#2E7D64" : "#9CA3AF"}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === "home" && styles.activeTabLabel,
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === "notifications" && styles.activeTabItem,
          ]}
          onPress={() => handleTabPress("notifications")}
        >
          <View style={styles.notificationWrapper}>
            <Feather
              name="mail"
              size={24}
              color={activeTab === "notifications" ? "#2E7D64" : "#9CA3AF"}
            />
            <View style={styles.notificationBadge} />
          </View>
          <Text
            style={[
              styles.tabLabel,
              activeTab === "notifications" && styles.activeTabLabel,
            ]}
          >
            Inbox
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === "profile" && styles.activeTabItem,
          ]}
          onPress={() => handleTabPress("profile")}
        >
          <Feather
            name="user"
            size={24}
            color={activeTab === "profile" ? "#2E7D64" : "#9CA3AF"}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === "profile" && styles.activeTabLabel,
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
