import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { authService } from "../../services/auth.service";
import { showToast } from "../Toast";

const { width } = Dimensions.get("window");
const GALLERY_IMAGE_SIZE = (width - 60) / 3;

interface GalleryPhoto {
  id: string;
  photo_url: string;
  photo_type: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  display_name: string;
  nomad_type: string;
  travel_style: string;
  relationship_intent: string[];
  current_location: string;
  movement_pattern: string;
  age: number;
  gender: string;
  pronouns: string | null;
  bio: string;
  profile_picture_url: string | null;
  years_in_van_life: number;
  hobbies: string[];
  skills: string[];
  lifestyle_tags: string[];
  favorite_activities: string[];
  created_at: string;
  updated_at: string;
  gallery_photos?: GalleryPhoto[];
}

interface ProfileTabProps {
  profile: UserProfile;
}

export default function ProfileTab({ profile }: ProfileTabProps) {
  const router = useRouter();
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const handleLogout = async () => {
    const result = await authService.signOut();
    if (result.success) {
      showToast("success", "Success", "Logged out successfully");
      router.replace("/(auth)/get-started");
    }
  };

  const handleSettings = () => {
    // Navigate to settings page
    // router.push('/(app)/settings');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Premium Modal */}
      <Modal
        visible={showPremiumModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPremiumModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.premiumModalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPremiumModal(false)}
            >
              <MaterialCommunityIcons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>

            <MaterialCommunityIcons
              name="crown"
              size={60}
              color="#F59E0B"
              style={styles.premiumIcon}
            />

            <Text style={styles.premiumModalTitle}>Vandora Premium</Text>

            <Text style={styles.premiumModalDescription}>
              Boost visibility by 3x and get your exclusive verified nomad badge
              today
            </Text>

            <View style={styles.premiumFeatures}>
              <View style={styles.featureItem}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color="#10B981"
                />
                <Text style={styles.featureText}>3x visibility boost</Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color="#10B981"
                />
                <Text style={styles.featureText}>Verified nomad badge</Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color="#10B981"
                />
                <Text style={styles.featureText}>Priority support</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.goPremiumButton}>
              <Text style={styles.goPremiumButtonText}>Go Premium</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowPremiumModal(false)}>
              <Text style={styles.maybeLaterText}>Maybe later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleSettings}
          style={styles.headerIconButton}
        >
          <MaterialCommunityIcons name="cog" size={24} color="#1F2937" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Profile</Text>

        <TouchableOpacity
          onPress={handleLogout}
          style={styles.headerIconButton}
        >
          <MaterialCommunityIcons name="logout" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Go Premium Card */}
      <TouchableOpacity
        style={styles.premiumCard}
        onPress={() => setShowPremiumModal(true)}
      >
        <View style={styles.premiumCardContent}>
          <View style={styles.premiumCardLeft}>
            <MaterialCommunityIcons name="crown" size={28} color="#10B981" />
            <View style={styles.premiumCardText}>
              <Text style={styles.premiumCardTitle}>Vandora Premium</Text>
              <Text style={styles.premiumCardSubtitle}>
                Boost visibility by 3x and get your exclusive verified nomad
                badge.
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.premiumCardButton}
            onPress={() => setShowPremiumModal(true)}
          >
            <Text style={styles.premiumCardButtonText}>Go Premium</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Profile Picture & Basic Info - Centered Layout */}
      <View style={styles.profileHeader}>
        <View style={styles.profileCenterContainer}>
          {/* Profile Picture */}
          {profile.profile_picture_url ? (
            <Image
              source={{ uri: profile.profile_picture_url }}
              style={styles.profilePicture}
            />
          ) : (
            <View style={[styles.profilePicture, styles.placeholderPicture]}>
              <MaterialCommunityIcons
                name="account"
                size={60}
                color="#9CA3AF"
              />
            </View>
          )}

          {/* Name */}
          <Text style={styles.nameText}>
            {profile.display_name}, {profile.age}
          </Text>

          {/* Gender */}
          <Text style={styles.genderText}>{profile.gender}</Text>

          {/* Location */}
          <View style={styles.locationRowCentered}>
            <MaterialCommunityIcons
              name="map-marker"
              size={14}
              color="#6B7280"
            />
            <Text style={styles.locationCentered}>
              {profile.current_location}
            </Text>
          </View>

          {/* Verified Status if available */}
          {profile.pronouns && (
            <Text style={styles.verifiedStatus}>{profile.pronouns}</Text>
          )}
        </View>
      </View>

      {/* Nomad Life Section - 4 Cards in 1 Line */}
      <View style={styles.nomadLifeSection}>
        <View style={styles.nomadCardsContainer}>
          <View style={styles.nomadCard}>
            <MaterialCommunityIcons
              name="van-utility"
              size={24}
              color="#2e7d64"
            />
            <Text style={styles.nomadCardValue}>{profile.nomad_type}</Text>
          </View>
          <View style={styles.nomadCard}>
            <MaterialCommunityIcons name="airplane" size={24} color="#2e7d64" />
            <Text style={styles.nomadCardValue}>{profile.travel_style}</Text>
          </View>
          <View style={styles.nomadCard}>
            <MaterialCommunityIcons
              name="map-marker-path"
              size={24}
              color="#2e7d64"
            />
            <Text style={styles.nomadCardValue}>
              {profile.movement_pattern}
            </Text>
          </View>
          <View style={styles.nomadCard}>
            <MaterialCommunityIcons
              name="calendar-clock"
              size={24}
              color="#2e7d64"
            />
            <Text style={styles.nomadCardValue}>
              {profile.years_in_van_life}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Photo Gallery */}
      {profile.gallery_photos && profile.gallery_photos.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photo Gallery</Text>
          <View style={styles.galleryGrid}>
            {profile.gallery_photos.map((photo) => (
              <View key={photo.id} style={styles.galleryImageContainer}>
                <Image
                  source={{ uri: photo.photo_url }}
                  style={styles.galleryImage}
                  resizeMode="cover"
                />
                <View style={styles.photoTypeLabel}>
                  <Text style={styles.photoTypeLabelText}>
                    {photo.photo_type}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Bio Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Me</Text>
        <Text style={styles.bioText}>{profile.bio}</Text>
      </View>
      {/* Relationship Intent */}
      {profile.relationship_intent &&
        profile.relationship_intent.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Looking For</Text>
            <View style={styles.tagsContainer}>
              {profile.relationship_intent.map((intent, index) => (
                <View key={index} style={styles.intentTag}>
                  <MaterialCommunityIcons
                    name="heart"
                    size={14}
                    color="#EF4444"
                  />
                  <Text style={styles.intentTagText}>{intent}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

      {/* Combined Interest Section - Hobbies, Skills, Lifestyle */}
      {(profile.hobbies?.length > 0 ||
        profile.skills?.length > 0 ||
        profile.lifestyle_tags?.length > 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interest</Text>
          <View style={styles.tagsContainer}>
            {/* Lifestyle Tags */}
            {profile.lifestyle_tags &&
              profile.lifestyle_tags.map((tag, index) => (
                <View key={`lifestyle-${index}`} style={styles.lifestyleTag}>
                  <Text style={styles.lifestyleTagText}>{tag}</Text>
                </View>
              ))}

            {/* Hobbies */}
            {profile.hobbies &&
              profile.hobbies.map((hobby, index) => (
                <View key={`hobby-${index}`} style={styles.hobbyTag}>
                  <Text style={styles.hobbyTagText}>{hobby}</Text>
                </View>
              ))}

            {/* Skills */}
            {profile.skills &&
              profile.skills.map((skill, index) => (
                <View key={`skill-${index}`} style={styles.skillTag}>
                  <MaterialCommunityIcons
                    name="star"
                    size={12}
                    color="#F59E0B"
                  />
                  <Text style={styles.skillTagText}>{skill}</Text>
                </View>
              ))}
          </View>
        </View>
      )}

      {/* Favorite Activities */}
      {profile.favorite_activities &&
        profile.favorite_activities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Favorite Activities</Text>
            <View style={styles.tagsContainer}>
              {profile.favorite_activities.map((activity, index) => (
                <View key={index} style={styles.activityTag}>
                  <MaterialCommunityIcons
                    name="run"
                    size={14}
                    color="#10B981"
                  />
                  <Text style={styles.activityTagText}>{activity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

      {/* Member Since */}
      <View style={styles.memberSection}>
        <MaterialCommunityIcons
          name="account-clock"
          size={20}
          color="#9CA3AF"
        />
        <Text style={styles.memberSince}>
          Member since {formatDate(profile.created_at)}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    flex: 1,
    textAlign: "center",
  },
  headerIconButton: {
    padding: 8,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  premiumModalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "85%",
    alignItems: "center",
  },
  modalCloseButton: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 10,
  },
  premiumIcon: {
    marginTop: 16,
    marginBottom: 16,
  },
  premiumModalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
    textAlign: "center",
  },
  premiumModalDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  premiumFeatures: {
    width: "100%",
    marginBottom: 24,
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  goPremiumButton: {
    width: "100%",
    backgroundColor: "#10B981",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  goPremiumButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  maybeLaterText: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "500",
  },
  premiumCard: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 24,
    backgroundColor: "#F0F9FF",
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  premiumCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  premiumCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  premiumCardText: {
    gap: 4,
  },
  premiumCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  premiumCardSubtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  premiumCardButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  premiumCardButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  profileHeader: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 1,
    marginTop: 12,
  },
  profileCenterContainer: {
    alignItems: "center",
    width: "100%",
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 18,
    borderWidth: 3,
    borderColor: "#2e7d64",
  },
  placeholderPicture: {
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  nameText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2e7d64",
    marginBottom: 3,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  genderText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 3,
    textAlign: "center",
    fontWeight: "500",
  },
  locationRowCentered: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginBottom: 8,
  },
  locationCentered: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    fontWeight: "500",
  },
  verifiedStatus: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  nomadLifeSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 12,
  },
  nomadLifeTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2e7d64",
    marginBottom: 10,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  nomadCardsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 5,
  },
  nomadCard: {
    flex: 1,
    height: 110,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1.5,
    borderColor: "#2e7d64",
  },
  nomadCardValue: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2e7d64",
    marginTop: 10,
    textAlign: "center",
    numberOfLines: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2e7d64",
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  bioText: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "500",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  intentTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 22,
    gap: 6,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  intentTagText: {
    fontSize: 13,
    color: "#991B1B",
    fontWeight: "600",
  },
  hobbyTag: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  hobbyTagText: {
    fontSize: 13,
    color: "#0C4A6E",
    fontWeight: "600",
  },
  skillTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 22,
    gap: 5,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  skillTagText: {
    fontSize: 13,
    color: "#B45309",
    fontWeight: "600",
  },
  lifestyleTag: {
    backgroundColor: "#E0E7FF",
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  lifestyleTagText: {
    fontSize: 13,
    color: "#4338CA",
    fontWeight: "600",
  },
  activityTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 22,
    gap: 6,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  activityTagText: {
    fontSize: 13,
    color: "#047857",
    fontWeight: "600",
  },
  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  galleryImageContainer: {
    position: "relative",
  },
  galleryImage: {
    width: GALLERY_IMAGE_SIZE,
    height: GALLERY_IMAGE_SIZE,
    borderRadius: 12,
  },
  photoTypeLabel: {
    position: "absolute",
    bottom: 6,
    left: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  photoTypeLabelText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "500",
  },
  memberSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    marginHorizontal: 20,
  },
  memberSince: {
    fontSize: 13,
    color: "#9CA3AF",
  },
});
