import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {useUserStore} from "../store/userStore";
import {
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface JoinEventModalProps {
  visible: boolean;
  event?: any;
  onBack: () => void;
  onClose: () => void;
}

export default function JoinEventModal({
  visible,
  event,
  onBack,
  onClose,
}: JoinEventModalProps) {
  const profile = useUserStore(state => state.profile);
  const organizerName =
    event?.hostName ||
    event?.organizerName ||
    event?.host?.display_name ||
    event?.host?.username ||
    "Organizer";
  const organizerAvatar =
    event?.hostAvatar ||
    event?.organizerAvatar ||
    event?.host?.profile_picture_url ||
    null;
  const organizerInitial =
    typeof organizerName === "string" && organizerName.length > 0
      ? organizerName[0].toUpperCase()
      : "O";

  const currentUserName =
    profile?.display_name || profile?.username || "You";
  const currentUserAvatar = profile?.profile_picture_url || null;
  const currentUserInitial =
    typeof currentUserName === "string" && currentUserName.length > 0
      ? currentUserName[0].toUpperCase()
      : "Y";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onBack}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <MaterialCommunityIcons
              name="chevron-left"
              size={26}
              color="#1F2937"
            />
          </TouchableOpacity>

          <Text numberOfLines={1} style={styles.headerTitle}>
            {event?.title ?? "Event"}
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Composer Section */}
          <View style={styles.composerContainer}>
            <View style={styles.avatar}>
              {currentUserAvatar ? (
                <Image
                  source={{uri: currentUserAvatar}}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarText}>{currentUserInitial}</Text>
              )}
            </View>

            <Text style={styles.composerPlaceholder}>
              Share an event update...
            </Text>

            <TouchableOpacity style={styles.imageIcon}>
              <MaterialCommunityIcons
                name="image-outline"
                size={18}
                color="#4A7C59"
              />
            </TouchableOpacity>
          </View>
          {/* Official Update Section */}
          <View style={styles.updateSection}>
            <View style={styles.updateHeader}>
              <MaterialCommunityIcons
                name="bell-badge"
                size={16}
                color="#4A7C59"
              />
              <Text style={styles.updateLabel}>OFFICIAL UPDATE</Text>
            </View>

            {/* Update Card */}
            <View style={styles.updateCard}>
            <View style={styles.updateAuthor}>
              <View style={styles.updateAvatar}>
                {organizerAvatar ? (
                  <Image
                    source={{ uri: organizerAvatar }}
                    style={styles.updateAvatarImage}
                  />
                ) : (
                  <Text style={styles.updateAvatarText}>
                    {organizerInitial}
                  </Text>
                )}
              </View>
              <View style={styles.updateAuthorInfo}>
                <Text style={styles.updateAuthorName}>{organizerName}</Text>
                <Text style={styles.updateAuthorRole}>
                  Verified Organizer
                </Text>
              </View>
            </View>

              <Text style={styles.updateContent}>
                Hey everyone! Moving the campfire 100yards north to get away
                from the wind. Follow the small of cedar and look for the green
                van with string lights! 🔥
              </Text>

              <View style={styles.updateActions}>
                <View style={styles.updateAction}>
                  <MaterialCommunityIcons
                    name="heart-outline"
                    size={16}
                    color="#5C6A63"
                  />
                  <Text style={styles.updateActionText}>24</Text>
                </View>
                <View style={styles.updateAction}>
                  <MaterialCommunityIcons
                    name="comment-outline"
                    size={16}
                    color="#5C6A63"
                  />
                  <Text style={styles.updateActionText}>Comment</Text>
                </View>
                <View style={styles.updateAction}>
                  <MaterialCommunityIcons
                    name="share-variant-outline"
                    size={16}
                    color="#5C6A63"
                  />
                  <Text style={styles.updateActionText}>Share</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={{ height: 50 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#FFFFFF",
  },

  backBtn: {
    position: "absolute",
    left: 16,
    padding: 6,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    maxWidth: "70%", // prevents overlap with long titles
    textAlign: "center",
  },

  bellIcon: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  composerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#F9FAFB",
    borderRadius: 999, // 👈 pill shape
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#1F2937",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarImage: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },

  avatarText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  composerPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: "#9CA3AF",
  },

  imageIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  updateSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  updateHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  updateLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4A7C59",
    letterSpacing: 0.5,
  },
  updateCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  updateAuthor: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  updateAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4A7C59",
    justifyContent: "center",
    alignItems: "center",
  },
  updateAvatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  updateAvatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  updateAuthorInfo: {
    flex: 1,
  },
  updateAuthorName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F2937",
  },
  updateAuthorRole: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },
  updateContent: {
    fontSize: 13,
    lineHeight: 18,
    color: "#374151",
    marginBottom: 12,
  },
  updateActions: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 8,
    alignItems: "center",
  },
  updateAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#F5F8F7",
  },
  updateActionText: {
    fontSize: 12,
    color: "#5C6A63",
    fontWeight: "600",
  },
});
