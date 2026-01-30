import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
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
              <Text style={styles.avatarText}>O</Text>
            </View>

            <Text style={styles.composerPlaceholder}>
              Share a community moment...
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
                  <Text style={styles.updateAvatarText}>V</Text>
                </View>
                <View style={styles.updateAuthorInfo}>
                  <Text style={styles.updateAuthorName}>Vanora</Text>
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

              <View style={styles.updateStats}>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons
                    name="heart-outline"
                    size={14}
                    color="#999"
                  />
                  <Text style={styles.statText}>24</Text>
                </View>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons
                    name="comment-outline"
                    size={14}
                    color="#999"
                  />
                  <Text style={styles.statText}>8</Text>
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
  updateStats: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
});
