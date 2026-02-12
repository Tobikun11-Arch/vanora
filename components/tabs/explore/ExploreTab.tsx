import {showToast} from "@/components/Toast";
import {useUserStore} from "@/store/userStore";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {CameraView, useCameraPermissions} from "expo-camera";
import React, {useEffect, useRef, useState} from "react";
import {
  Image,
  InteractionManager,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  communitySpotlight,
  getFeaturedNews,
  getRoadAlerts,
  leaderboard,
  newsItems,
  roadQuests,
  vanBingoCards,
} from "./data";
import {styles} from "./styles";

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
    {},
  );
  const [cameraResetCounter, setCameraResetCounter] = useState(0);
  const cameraRef = useRef<CameraView | null>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const profile = useUserStore((state: any) => state.profile);
  const userLocation = profile?.current_location ?? "your area";
  const roadAlerts = getRoadAlerts(userLocation);
  const featuredNews = getFeaturedNews(userLocation);

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
    resizeMode: "cover" | "contain" | "stretch" | "center" = "cover",
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
              <MaterialCommunityIcons name="alert" size={16} color="#f97316" />
              <Text style={styles.roadAlertsTitle}>Road Alerts</Text>
            </View>
            {roadAlerts.map((alert) => (
              <View key={alert.id} style={styles.alertItem}>
                <View
                  style={[styles.alertBar, {backgroundColor: alert.color}]}
                />
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
                  <Text style={styles.spotlightSubtitle}>
                    {person.subtitle}
                  </Text>
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

          <View style={{height: 24}} />
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
                    <MaterialCommunityIcons
                      name="star"
                      size={12}
                      color="#0f172a"
                    />
                    <Text style={styles.questMetaText}>{quest.points} pts</Text>
                  </View>
                  <View style={styles.questMetaPill}>
                    <MaterialCommunityIcons
                      name="account-group"
                      size={12}
                      color="#0f172a"
                    />
                    <Text style={styles.questMetaText}>
                      {quest.players} players
                    </Text>
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
              <Text style={styles.bingoTitle}>This Week&apos;s Card</Text>
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
                      {width: `${(card.progress / card.total) * 100}%`},
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

          <View style={{height: 24}} />
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
                {renderImage(
                  selectedSpotlight.image,
                  styles.modalImage,
                  "cover",
                )}
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
                <MaterialCommunityIcons
                  name="close"
                  size={16}
                  color="#0f172a"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.gameModalSubtext}>
              Snap a photo to enter this week&apos;s quest.
            </Text>
            <View style={styles.cameraPreview}>
              {hasQuestPhoto ? (
                renderImage(
                  {uri: activeQuestPhoto ?? ""},
                  styles.cameraPreviewImage,
                  "cover",
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
                  <MaterialCommunityIcons
                    name="camera"
                    size={32}
                    color="#ffffff"
                  />
                  <Text style={styles.cameraPreviewText}>
                    Camera permission needed
                  </Text>
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
                      showToast(
                        "error",
                        "Permission Needed",
                        "Enable camera access.",
                      );
                      return;
                    }
                  }
                  if (!cameraRef.current) {
                    showToast(
                      "error",
                      "Camera Unavailable",
                      "Try opening again.",
                    );
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
                    showToast(
                      "error",
                      "Photo Required",
                      "Take a photo to submit.",
                    );
                    return;
                  }
                  showToast("success", "Submitted", "Photo entry sent.");
                  setSubmittedQuestIds((prev) =>
                    prev.includes(activeQuestId)
                      ? prev
                      : [...prev, activeQuestId],
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
