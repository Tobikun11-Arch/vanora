import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ExploreTab() {
  const [activeTab, setActiveTab] = useState("news");

  const featuredNews = {
    title: "10 Best Hidden Boondocking Spots in Oregon",
    tag: "EDITOR'S CHOICE",
    image: require("../../assets/images/vanora.png"),
  };

  const newsItems = [
    {
      id: "1",
      title: "Essential Solar Upgrades for Winter Living",
      category: "TECH + GEAR",
      time: "2 hours ago",
      read: "5 min read",
      image: require("../../assets/images/vanora.png"),
    },
    {
      id: "2",
      title: "How to Build a Cozy Van Desk Setup",
      category: "WORK LIFE",
      time: "Yesterday",
      read: "4 min read",
      image: require("../../assets/images/vanora.png"),
    },
  ];

  const roadAlerts = [
    {
      id: "1",
      title: "I-70 Glenwood Canyon",
      detail: "Flash flood warning. Road closed for next 4 hours.",
      color: "#f43f5e",
    },
    {
      id: "2",
      title: "Tioga Pass (Yosemite)",
      detail: "Heavy snow accumulation. Chains required for all vehicles.",
      color: "#f59e0b",
    },
  ];

  const communitySpotlight = [
    {
      id: "1",
      name: "Marcus & Luna",
      subtitle: "Full-timing since 2021",
      image: require("../../assets/images/vanora.png"),
    },
    {
      id: "2",
      name: "Elena Wild",
      subtitle: "Solo Sprinter Builder",
      image: require("../../assets/images/vanora.png"),
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        {["News", "Games"].map((tab) => (
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

      {activeTab === "news" && (
        <ScrollView
          style={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Latest News</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.featuredCard} activeOpacity={0.9}>
            <Image source={featuredNews.image} style={styles.featuredImage} />
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
                <Image source={item.image} style={styles.newsThumb} />
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
                <Image source={person.image} style={styles.spotlightImage} />
                <View style={styles.spotlightContent}>
                  <Text style={styles.spotlightName}>{person.name}</Text>
                  <Text style={styles.spotlightSubtitle}>{person.subtitle}</Text>
                  <TouchableOpacity style={styles.spotlightButton}>
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
        <View style={styles.contentContainer}>
          <Text style={styles.placeholderText}>Games coming soon!</Text>
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
    paddingTop: 10,
    paddingBottom: 12,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 0,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 20,
    marginVertical: 40,
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
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1dd1a1",
  },
  featuredCard: {
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#f1f5f9",
    marginBottom: 16,
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
    marginBottom: 16,
  },
  newsItem: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
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
    color: "#1dd1a1",
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
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
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
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    alignItems: "flex-start",
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
    gap: 12,
    paddingBottom: 10,
  },
  spotlightCard: {
    width: 170,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
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
    borderColor: "#1dd1a1",
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: "center",
  },
  spotlightButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1dd1a1",
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#999999",
    textAlign: "center",
    marginTop: 40,
  },
});
