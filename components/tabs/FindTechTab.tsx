import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

interface Technician {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  //rating: number;
  tags: string[];
  following: boolean;
}

export default function FindTechTab() {
  const [activeTab, setActiveTab] = useState("featured");
  const [scanned, setScanned] = useState(false);
  const windowWidth = useWindowDimensions().width;

  const technicians: Technician[] = [
    {
      id: "1",
      name: "Mark Says",
      avatar: require("../../assets/images/vanora.png"),
      bio: "Expert electrical setups and solar integration for off-grid living",
      //rating: 4.9,
      tags: ["ELECTRICAL", "SOLAR", "DIESEL HEATERS"],
      following: false,
    },
    {
      id: "2",
      name: "Joenel Seve",
      avatar: require("../../assets/images/vanora.png"),
      bio: "Professional tech setup for remote work and streaming",
      //rating: 4.8,
      tags: ["TECH SETUP", "CONNECTIVITY", "SECURITY"],
      following: false,
    },
    {
      id: "3",
      name: "Lucky Est",
      avatar: require("../../assets/images/vanora.png"),
      bio: "Complete van conversion and maintenance services",
      //rating: 4.7,
      tags: ["CONVERSION", "MAINTENANCE", "DESIGN"],
      following: false,
    },
  ];

  const [techList, setTechList] = useState(technicians);

  const handleFollow = (id: string) => {
    setTechList(
      techList.map((tech) =>
        tech.id === id ? { ...tech, following: !tech.following } : tech,
      ),
    );
  };

  const handleScan = () => {
    setScanned(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Technician</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {["Featured", "Scan"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab.toLowerCase() && styles.tabActive,
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

      {/* Featured Tab */}
      {activeTab === "featured" && (
        <ScrollView
          style={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.resultsTitle}>Featured Technician</Text>
          {techList.map((tech) => (
            <View key={tech.id} style={styles.techCard}>
              {/* Avatar and Info */}
              <View style={styles.cardHeader}>
                <Image source={tech.avatar} style={styles.avatar} />
                <View style={styles.infoContainer}>
                  <View style={styles.nameRatingContainer}>
                    <Text style={styles.techName}>{tech.name}</Text>
                  </View>
                  <Text style={styles.bioDescript}>{tech.bio}</Text>
                </View>
              </View>

              {/* Tags */}
              <View style={styles.tagsContainer}>
                {tech.tags.map((tag, index) => (
                  <Text key={index} style={styles.tag}>
                    {tag}
                  </Text>
                ))}
              </View>

              {/* Follow Button */}
              <TouchableOpacity
                style={[
                  styles.followButton,
                  tech.following && styles.followButtonActive,
                ]}
                onPress={() => handleFollow(tech.id)}
              >
                <Text
                  style={[
                    styles.followButtonText,
                    tech.following && styles.followButtonTextActive,
                  ]}
                >
                  {tech.following ? "Following" : "Follow"}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Scan Tab */}
      {activeTab === "scan" && (
        <View style={styles.scanContainer}>
          {!scanned ? (
            <View style={styles.scanContent}>
              {/* Radar/Map Card */}
              <View style={styles.radarCard}>
                <View style={styles.radarContainer}>
                  <View style={styles.radarOuter}>
                    <View style={styles.radarMiddle}>
                      <View style={styles.radarInner}>
                        <View style={styles.radarCenter} />
                      </View>
                    </View>
                  </View>
                  <Text style={styles.radarText}>
                    Point your device to scan
                  </Text>
                </View>
              </View>

              {/* Scan Button */}
              <TouchableOpacity style={styles.scanButton} onPress={handleScan}>
                <Text style={styles.scanButtonText}>Scan</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              style={styles.scanResultsContainer}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.resultsTitle}>Technicians Near You</Text>
              {techList.slice(0, 2).map((tech) => (
                <View key={tech.id} style={styles.techCard}>
                  {/* Avatar and Info */}
                  <View style={styles.cardHeader}>
                    <Image source={tech.avatar} style={styles.avatar} />
                    <View style={styles.infoContainer}>
                      <View style={styles.nameRatingContainer}>
                        <Text style={styles.techName}>{tech.name}</Text>
                        {/* <View style={styles.ratingBadge}>
                          <Text style={styles.ratingIcon}>⭐</Text>
                          <Text style={styles.ratingText}>{tech.rating}</Text>
                        </View> */}
                      </View>
                      <Text style={styles.bioDescript}>{tech.bio}</Text>
                    </View>
                  </View>

                  {/* Tags */}
                  <View style={styles.tagsContainer}>
                    {tech.tags.map((tag, index) => (
                      <Text key={index} style={styles.tag}>
                        {tag}
                      </Text>
                    ))}
                  </View>

                  {/* Follow Button */}
                  <TouchableOpacity
                    style={[
                      styles.followButton,
                      tech.following && styles.followButtonActive,
                    ]}
                    onPress={() => handleFollow(tech.id)}
                  >
                    <Text
                      style={[
                        styles.followButtonText,
                        tech.following && styles.followButtonTextActive,
                      ]}
                    >
                      {tech.following ? "Following" : "Follow"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}

              {/* Back to Scan Button */}
              <TouchableOpacity
                style={styles.backScanButton}
                onPress={() => setScanned(false)}
              >
                <Text style={styles.backScanButtonText}>Scan Again</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 0,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 24,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "transparent",
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#ffffff",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999999",
  },
  tabTextActive: {
    color: "#1dd1a1",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  scanContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: "space-between",
  },
  scanContent: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 20,
  },
  radarCard: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  radarContainer: {
    alignItems: "center",
    width: "100%",
  },
  radarOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "#1dd1a1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  radarMiddle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: "#1dd1a1",
    justifyContent: "center",
    alignItems: "center",
  },
  radarInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#1dd1a1",
    justifyContent: "center",
    alignItems: "center",
  },
  radarCenter: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#1dd1a1",
  },
  radarText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
  },
  scanButton: {
    backgroundColor: "#1dd1a1",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  scanResultsContainer: {
    flex: 1,
    paddingBottom: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  techCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  infoContainer: {
    flex: 1,
  },
  nameRatingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  techName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fff9e6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingIcon: {
    fontSize: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#f59e0b",
  },
  bioDescript: {
    fontSize: 12,
    fontWeight: "400",
    color: "#555555",
    lineHeight: 16,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    fontSize: 10,
    fontWeight: "600",
    color: "#1dd1a1",
    backgroundColor: "#e8faf6",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 16,
    lineHeight: 5,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  followButton: {
    backgroundColor: "#1dd1a1",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  followButtonActive: {
    backgroundColor: "#f0f0f0",
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  followButtonTextActive: {
    color: "#1dd1a1",
  },
  backScanButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 32,
  },
  backScanButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1dd1a1",
  },
});
