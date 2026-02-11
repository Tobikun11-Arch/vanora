import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  InteractionManager,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useUserStore } from "../../store/userStore";
import { showToast } from "../Toast";
import { CameraView, useCameraPermissions } from "expo-camera";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const SAFE_H_PADDING = Math.max(16, Math.round(SCREEN_WIDTH * 0.045));
const SAFE_V_SPACING = Math.max(12, Math.round(SCREEN_HEIGHT * 0.016));
const CARD_RADIUS = Math.max(14, Math.round(SCREEN_WIDTH * 0.045));
const STATUS_BAR_HEIGHT =
  Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0;

export default function ExploreTab() {
  const [activeTab, setActiveTab] = useState("news");
  const [imagesReady, setImagesReady] = useState(false);
  const [selectedSpotlight, setSelectedSpotlight] = useState<null | {
    id: string;
    name: string;
    subtitle: string;
    image: any;
    location: string;
    journey: string;
  }>(null);
  const [activeQuestId, setActiveQuestId] = useState<string | null>(null);
  const [joinedQuestIds, setJoinedQuestIds] = useState<string[]>([]);
  const [submittedQuestIds, setSubmittedQuestIds] = useState<string[]>([]);
  const [questPhotos, setQuestPhotos] = useState<Record<string, string | null>>(
    {}
  );
  const [cameraResetCounter, setCameraResetCounter] = useState(0);
  const cameraRef = useRef<CameraView | null>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const profile = useUserStore((state) => state.profile);
  const userLocation = profile?.current_location ?? "your area";

  const roadAlerts = [
    {
      id: "1",
      title: `${userLocation} Area - Main Corridor`,
      detail: `Traffic slowdown reported near ${userLocation}. Expect delays for the next 2 hours.`,
      color: "#f43f5e",
    },
    {
      id: "2",
      title: `${userLocation} Scenic Route`,
      detail: `Road work ahead outside ${userLocation}. Single-lane traffic and short stops.`,
      color: "#f59e0b",
    },
  ];

  const featuredNews = {
    title: `10 Best Hidden Boondocking Spots Near ${userLocation}`,
    tag: "EDITOR'S CHOICE",
    image: require("../../assets/images/featured_news.jpg"),
  };

  const newsItems = [
    {
      id: "1",
      title: "Essential Solar Upgrades for Winter Living",
      category: "TECH + GEAR",
      time: "2 hours ago",
      read: "5 min read",
      image: require("../../assets/images/solar_van.jpg"),
    },
    {
      id: "2",
      title: "How to Build a Cozy Van Desk Setup",
      category: "WORK LIFE",
      time: "Yesterday",
      read: "4 min read",
      image: require("../../assets/images/cozy_van.jpg"),
    },
  ];

  const communitySpotlight = [
    {
      id: "1",
      name: "Jis & Luna",
      subtitle: "Full-timing since 2021",
      image: require("../../assets/images/duo_camper.jpg"),
      location: "Sedona, AZ",
      journey: "Desert loops, red rock camps, and weekly sunrise hikes.",
    },
    {
      id: "2",
      name: "Elena Wild",
      subtitle: "Solo Sprinter Builder",
      image: require("../../assets/images/solo_camper.jpg"),
      location: "Bend, OR",
      journey: "Mountain trails by day, wood-stove nights by the river.",
    },
    {
      id: "3",
      name: "Theo & Mina",
      subtitle: "Weekend Warriors",
      image: require("../../assets/images/theo.jpg"),
      location: "Bozeman, MT",
      journey: "Quick escapes, hot springs stops, and ski weekends.",
    },
    {
      id: "4",
      name: "Riley Stone",
      subtitle: "Remote Dev on Wheels",
      image: require("../../assets/images/stones.jpg"),
      location: "Asheville, NC",
      journey: "Coffee shop code sprints and Blue Ridge overnights.",
    },
    {
      id: "5",
      name: "Aria & Pax",
      subtitle: "Family Micro-Adventure",
      image: require("../../assets/images/aria.jpg"),
      location: "Moab, UT",
      journey: "School-on-the-road and nightly campfire stories.",
    },
    {
      id: "6",
      name: "Noah Reyes",
      subtitle: "Budget Build Enthusiast",
      image: require("../../assets/images/Noah.jpg"),
      location: "Flagstaff, AZ",
      journey: "DIY upgrades and forest service road exploring.",
    },
  ];

  const roadQuests = [
    {
      id: "rq1",
      title: "Sunrise Over Water",
      points: 120,
      time: "Ends in 2d 6h",
      players: 248,
      tag: "WEEKLY",
    },
    {
      id: "rq2",
      title: "Best Campfire Coffee",
      points: 90,
      time: "Ends in 5d 1h",
      players: 193,
      tag: "COMMUNITY",
    },
    {
      id: "rq3",
      title: "Odd Roadside Attraction",
      points: 150,
      time: "Ends in 1d 4h",
      players: 322,
      tag: "TRENDING",
    },
  ];

  const vanBingoCards = [
    { id: "vb1", title: "Forest Service Road", progress: 3, total: 5 },
    { id: "vb2", title: "Free Campfire Ring", progress: 4, total: 5 },
    { id: "vb3", title: "Meet Another Vanlifer", progress: 2, total: 5 },
  ];

  const leaderboard = [
    {
      id: "lb1",
      name: "Riley Stone",
      points: 1280,
      badge: "Trail Captain",
      image: communitySpotlight[3].image,
    },
    {
      id: "lb2",
      name: "Jis & Luna",
      points: 1195,
      badge: "Sunrise Hunter",
      image: communitySpotlight[0].image,
    },
    {
      id: "lb3",
      name: "Elena Wild",
      points: 1080,
      badge: "Route Scout",
      image: communitySpotlight[1].image,
    },
    {
      id: "lb4",
      name: "Theo & Mina",
      points: 990,
      badge: "Campfire Pro",
      image: communitySpotlight[2].image,
    },
    {
      id: "lb5",
      name: "Aria & Pax",
      points: 920,
      badge: "Family Voyager",
      image: communitySpotlight[4].image,
    },
  ];

  const activeQuest = roadQuests.find((quest) => quest.id === activeQuestId);
  const activeQuestPhoto = activeQuestId ? questPhotos[activeQuestId] : null;
  const hasQuestPhoto = !!activeQuestPhoto;

  useEffect(() => {
    if (activeQuestId && !cameraPermission?.granted) {
      requestCameraPermission();
    }
  }, [activeQuestId, cameraPermission?.granted, requestCameraPermission]);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setImagesReady(true);
    });
    return () => {
      task?.cancel?.();
    };
  }, []);

  const renderImage = (
    source: any,
    style: any,
    resizeMode: "cover" | "contain" | "stretch" | "center" = "cover"
  ) => {
    if (!imagesReady) {
      return <View style={[style, styles.imagePlaceholder]} />;
    }
    return <Image source={source} style={style} resizeMode={resizeMode} />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.topNavContainer}>
        <View style={styles.topNav}>
          {["News", "Games"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabButton,
                activeTab === tab.toLowerCase() && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab(tab.toLowerCase())}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.toLowerCase() && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {activeTab === "news" && (
        <ScrollView
          style={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Latest News</Text>
          </View>

          <TouchableOpacity style={styles.featuredCard} activeOpacity={0.9}>
            {renderImage(featuredNews.image, styles.featuredImage, "cover")}
            <View style={styles.featuredOverlay}>
              <View style={styles.tagPill}>
                <Text style={styles.tagText}>{featuredNews.tag}</Text>
              </View>
              <Text style={styles.featuredTitle}>{featuredNews.title}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.newsList}>
            {newsItems.map((item) => (
              <View key={item.id} style={styles.newsItem}>
                {renderImage(item.image, styles.newsThumb, "cover")}
                <View style={styles.newsTextBlock}>
                  <Text style={styles.newsCategory}>{item.category}</Text>
                  <Text style={styles.newsTitle}>{item.title}</Text>
                  <Text style={styles.newsMeta}>
                    {item.time} - {item.read}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.roadAlertsCard}>
            <View style={styles.roadAlertsHeader}>
              <MaterialCommunityIcons
                name="alert"
                size={16}
                color="#f97316"
              />
              <Text style={styles.roadAlertsTitle}>Road Alerts</Text>
            </View>
            {roadAlerts.map((alert) => (
              <View key={alert.id} style={styles.alertItem}>
                <View style={[styles.alertBar, { backgroundColor: alert.color }]} />
                <View style={styles.alertTextBlock}>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <Text style={styles.alertDetail}>{alert.detail}</Text>
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Community Spotlight</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.spotlightRow}
          >
            {communitySpotlight.map((person) => (
              <View key={person.id} style={styles.spotlightCard}>
                {renderImage(person.image, styles.spotlightImage, "cover")}
                <View style={styles.spotlightContent}>
                  <Text style={styles.spotlightName}>{person.name}</Text>
                  <Text style={styles.spotlightSubtitle}>{person.subtitle}</Text>
                  <TouchableOpacity
                    style={styles.spotlightButton}
                    onPress={() => setSelectedSpotlight(person)}
                  >
                    <Text style={styles.spotlightButtonText}>View Journey</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={{ height: 24 }} />
        </ScrollView>
      )}

      {activeTab === "games" && (
        <ScrollView
          style={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Road Quest</Text>
          </View>

          <View style={styles.questGrid}>
            {roadQuests.map((quest) => (
              <View key={quest.id} style={styles.questCard}>
                <View style={styles.questTag}>
                  <Text style={styles.questTagText}>{quest.tag}</Text>
                </View>
                <Text style={styles.questTitle}>{quest.title}</Text>
                <View style={styles.questMetaRow}>
                  <View style={styles.questMetaPill}>
                    <MaterialCommunityIcons name="star" size={12} color="#0f172a" />
                    <Text style={styles.questMetaText}>{quest.points} pts</Text>
                  </View>
                  <View style={styles.questMetaPill}>
                    <MaterialCommunityIcons name="account-group" size={12} color="#0f172a" />
                    <Text style={styles.questMetaText}>{quest.players} players</Text>
                  </View>
                </View>
                <Text style={styles.questTime}>{quest.time}</Text>
                <TouchableOpacity
                  style={[
                    styles.questButton,
                    submittedQuestIds.includes(quest.id) &&
                      styles.questButtonSubmitted,
                  ]}
                  onPress={() => {
                    if (submittedQuestIds.includes(quest.id)) {
                      return;
                    }
                    if (!joinedQuestIds.includes(quest.id)) {
                      setJoinedQuestIds((prev) => [...prev, quest.id]);
                    }
                    setActiveQuestId(quest.id);
                  }}
                >
                  <Text style={styles.questButtonText}>
                    {submittedQuestIds.includes(quest.id)
                      ? "Entry Submitted"
                      : joinedQuestIds.includes(quest.id)
                        ? "Submit Entry"
                        : "Join Quest"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Van Bingo</Text>
            <Text style={styles.viewAllText}>New card</Text>
          </View>

          <View style={styles.bingoCard}>
            <View style={styles.bingoHeader}>
              <Text style={styles.bingoTitle}>This Week's Card</Text>
              <View style={styles.bingoChip}>
                <Text style={styles.bingoChipText}>3/5 complete</Text>
              </View>
            </View>
            {vanBingoCards.map((card) => (
              <View key={card.id} style={styles.bingoRow}>
                <Text style={styles.bingoRowTitle}>{card.title}</Text>
                <View style={styles.bingoProgressTrack}>
                  <View
                    style={[
                      styles.bingoProgressFill,
                      { width: `${(card.progress / card.total) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.bingoProgressText}>
                  {card.progress}/{card.total}
                </Text>
              </View>
            ))}
            <TouchableOpacity style={styles.bingoButton}>
              <Text style={styles.bingoButtonText}>Share Progress</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Leaderboard</Text>
            <Text style={styles.viewAllText}>Season 12</Text>
          </View>

          <View style={styles.leaderboardCard}>
            {leaderboard.map((entry, index) => (
              <View key={entry.id} style={styles.leaderboardRow}>
                <View style={styles.leaderboardRank}>
                  <Text style={styles.leaderboardRankText}>{index + 1}</Text>
                </View>
                {renderImage(entry.image, styles.leaderboardAvatar, "cover")}
                <View style={styles.leaderboardInfo}>
                  <Text style={styles.leaderboardName}>{entry.name}</Text>
                  <Text style={styles.leaderboardBadge}>{entry.badge}</Text>
                </View>
                <Text style={styles.leaderboardPoints}>{entry.points} pts</Text>
              </View>
            ))}
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      )}

      <Modal
        visible={!!selectedSpotlight}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedSpotlight(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {selectedSpotlight && (
              <>
                {renderImage(selectedSpotlight.image, styles.modalImage, "cover")}
                <Text style={styles.modalName}>{selectedSpotlight.name}</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedSpotlight.subtitle}
                </Text>
                <View style={styles.modalMetaRow}>
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={14}
                    color="#0f172a"
                  />
                  <Text style={styles.modalMetaText}>
                    {selectedSpotlight.location}
                  </Text>
                </View>
                <Text style={styles.modalJourney}>
                  {selectedSpotlight.journey}
                </Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setSelectedSpotlight(null)}
                >
                  <Text style={styles.modalCloseText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={!!activeQuestId}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveQuestId(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.gameModalCard}>
            <View style={styles.gameModalHeader}>
              <Text style={styles.gameModalTitle}>
                {activeQuest?.title ?? "Submit Road Quest"}
              </Text>
              <TouchableOpacity
                style={styles.gameModalClose}
                onPress={() => setActiveQuestId(null)}
              >
                <MaterialCommunityIcons name="close" size={16} color="#0f172a" />
              </TouchableOpacity>
            </View>
            <Text style={styles.gameModalSubtext}>
              Snap a photo to enter this week's quest. 
            </Text>
            <View style={styles.cameraPreview}>
              {hasQuestPhoto ? (
                renderImage(
                  { uri: activeQuestPhoto ?? "" },
                  styles.cameraPreviewImage,
                  "cover"
                )
              ) : cameraPermission?.granted ? (
                <CameraView
                  key={`camera-${cameraResetCounter}`}
                  ref={cameraRef}
                  style={styles.cameraPreviewCamera}
                  facing="back"
                />
              ) : (
                <>
                  <MaterialCommunityIcons name="camera" size={32} color="#ffffff" />
                  <Text style={styles.cameraPreviewText}>Camera permission needed</Text>
                </>
              )}
            </View>
            <View style={styles.cameraActions}>
              <TouchableOpacity
                style={styles.cameraActionGhost}
                onPress={async () => {
                  if (!activeQuestId) {
                    return;
                  }
                  if (hasQuestPhoto) {
                    setQuestPhotos((prev) => ({
                      ...prev,
                      [activeQuestId]: null,
                    }));
                    setCameraResetCounter((prev) => prev + 1);
                    return;
                  }
                  if (!cameraPermission?.granted) {
                    const result = await requestCameraPermission();
                    if (!result.granted) {
                      showToast("error", "Permission Needed", "Enable camera access.");
                      return;
                    }
                  }
                  if (!cameraRef.current) {
                    showToast("error", "Camera Unavailable", "Try opening again.");
                    return;
                  }
                  const photo = await cameraRef.current.takePictureAsync();
                  if (photo?.uri) {
                    setQuestPhotos((prev) => ({
                      ...prev,
                      [activeQuestId]: photo.uri,
                    }));
                  }
                }}
              >
                <Text style={styles.cameraActionGhostText}>
                  {hasQuestPhoto ? "Retake" : "Take Photo"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cameraActionPrimary}
                onPress={() => {
                  if (!activeQuestId || !questPhotos[activeQuestId]) {
                    showToast("error", "Photo Required", "Take a photo to submit.");
                    return;
                  }
                  showToast("success", "Submitted", "Photo entry sent.");
                  setSubmittedQuestIds((prev) =>
                    prev.includes(activeQuestId) ? prev : [...prev, activeQuestId]
                  );
                  setActiveQuestId(null);
                }}
              >
                <Text style={styles.cameraActionPrimaryText}>Submit Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FBFA",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
  },
  topNavContainer: {
    backgroundColor: "#F8FBFA",
    paddingTop: (Platform.OS === "ios" ? 44 : STATUS_BAR_HEIGHT) + SAFE_V_SPACING,
    borderBottomWidth: 1,
    borderBottomColor: "#E6ECE9",
  },
  topNav: {
    flexDirection: "row",
    paddingHorizontal: SAFE_H_PADDING,
    gap: 14,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: {
    borderBottomColor: "#2E7D64",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#94A3B8",
    letterSpacing: 0.2,
  },
  tabTextActive: {
    color: "#2E7D64",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: SAFE_H_PADDING,
    paddingVertical: SAFE_V_SPACING,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SAFE_V_SPACING,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2E7D64",
  },
  questGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: SAFE_V_SPACING + 4,
  },
  questCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: CARD_RADIUS,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E6ECE9",
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  questTag: {
    alignSelf: "flex-start",
    backgroundColor: "#2E7D64",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginBottom: 8,
  },
  questTagText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.3,
  },
  questTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },
  questMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    marginBottom: 6,
  },
  questMetaPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "#E6ECE9",
    justifyContent: "center",
  },
  questMetaText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#0f172a",
  },
  questTime: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 10,
  },
  questButton: {
    backgroundColor: "#2E7D64",
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: "center",
  },
  questButtonSubmitted: {
    backgroundColor: "#1F6A54",
  },
  questButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },
  bingoCard: {
    backgroundColor: "#ffffff",
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: "#E6ECE9",
    padding: 12,
    marginBottom: SAFE_V_SPACING + 4,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  bingoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  bingoTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  bingoChip: {
    backgroundColor: "#e2f8f1",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  bingoChipText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#0f766e",
  },
  bingoRow: {
    marginBottom: 10,
  },
  bingoRowTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 6,
  },
  bingoProgressTrack: {
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 999,
    overflow: "hidden",
  },
  bingoProgressFill: {
    height: "100%",
    backgroundColor: "#2E7D64",
  },
  bingoProgressText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 4,
  },
  bingoButton: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#2E7D64",
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: "center",
  },
  bingoButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2E7D64",
  },
  leaderboardCard: {
    backgroundColor: "#ffffff",
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: "#E6ECE9",
    paddingVertical: 6,
    marginBottom: 8,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  leaderboardRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  leaderboardRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  leaderboardRankText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  leaderboardAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 10,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
  },
  leaderboardBadge: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 2,
  },
  leaderboardPoints: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2E7D64",
  },
  featuredCard: {
    borderRadius: CARD_RADIUS + 2,
    overflow: "hidden",
    backgroundColor: "#f1f5f9",
    marginBottom: SAFE_V_SPACING,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  featuredImage: {
    width: "100%",
    height: 180,
  },
  featuredOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
  },
  tagPill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(16, 185, 129, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.3,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  newsList: {
    gap: 12,
    marginBottom: SAFE_V_SPACING,
  },
  newsItem: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: "#E6ECE9",
  },
  newsThumb: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  newsTextBlock: {
    flex: 1,
  },
  newsCategory: {
    fontSize: 10,
    fontWeight: "700",
    color: "#2E7D64",
  },
  newsTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
    marginVertical: 4,
  },
  newsMeta: {
    fontSize: 11,
    fontWeight: "500",
    color: "#94a3b8",
  },
  roadAlertsCard: {
    backgroundColor: "#fff7ed",
    borderRadius: CARD_RADIUS,
    padding: 12,
    marginBottom: SAFE_V_SPACING,
    borderWidth: 1,
    borderColor: "#F5E5D5",
  },
  roadAlertsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  roadAlertsTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#c2410c",
  },
  alertItem: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#ffffff",
    borderRadius: CARD_RADIUS - 2,
    padding: 10,
    marginBottom: 10,
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#F2E8DA",
  },
  alertBar: {
    width: 4,
    height: "100%",
    borderRadius: 4,
  },
  alertTextBlock: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  alertDetail: {
    fontSize: 11,
    fontWeight: "500",
    color: "#6b7280",
  },
  spotlightRow: {
    marginTop: 15,
    gap: 12,
    paddingBottom: SAFE_V_SPACING,
  },
  spotlightCard: {
    width: 170,
    borderRadius: CARD_RADIUS,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E6ECE9",
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  spotlightImage: {
    width: "100%",
    height: 120,
  },
  spotlightContent: {
    padding: 12,
  },
  spotlightName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  spotlightSubtitle: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748b",
    marginVertical: 6,
  },
  spotlightButton: {
    borderWidth: 1,
    borderColor: "#2E7D64",
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: "center",
  },
  spotlightButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2E7D64",
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#999999",
    textAlign: "center",
    marginTop: 40,
  },
  imagePlaceholder: {
    backgroundColor: "#E5E7EB",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: CARD_RADIUS + 2,
    padding: 16,
  },
  modalImage: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    marginBottom: 12,
  },
  modalName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  modalSubtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 4,
  },
  modalMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  modalMetaText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0f172a",
  },
  modalJourney: {
    fontSize: 12,
    fontWeight: "500",
    color: "#475569",
    marginTop: 10,
    lineHeight: 18,
  },
  modalCloseButton: {
    marginTop: 14,
    backgroundColor: "#2E7D64",
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: "center",
  },
  modalCloseText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
  gameModalCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: CARD_RADIUS + 2,
    padding: 16,
  },
  gameModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  gameModalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  gameModalClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  gameModalSubtext: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 12,
  },
  cameraPreview: {
    height: 180,
    borderRadius: CARD_RADIUS,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SAFE_V_SPACING,
    gap: 6,
    overflow: "hidden",
  },
  cameraPreviewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  cameraPreviewCamera: {
    width: "100%",
    height: "100%",
  },
  cameraPreviewText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  cameraActions: {
    flexDirection: "row",
    gap: 10,
  },
  cameraActionGhost: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#2E7D64",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  cameraActionGhostText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2E7D64",
  },
  cameraActionPrimary: {
    flex: 1,
    backgroundColor: "#2E7D64",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  cameraActionPrimaryText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },
});
