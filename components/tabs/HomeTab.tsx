import { homeTabStyles as styles } from "@/styles";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import EventsTab from "./home/EventsTab";
import FeedTab from "./home/FeedTab";
import FindMatchTab from "./home/FindMatchTab";

interface UserProfile {
  id: string;
  nomad_type: string;
  travel_style: string;
  age: number;
  gender: string;
  bio: string;
  profile_picture_url: string | null;
  current_location: string;
}

interface HomeTabProps {
  profile: UserProfile;
}

type TabType = "findMatch" | "feed" | "events";

export default function HomeTab({ profile }: HomeTabProps) {
  const [activeTab, setActiveTab] = useState<TabType>("feed");
  const [feedRefreshTrigger, setFeedRefreshTrigger] = useState(0);

  // Auto-refetch every 1 minute
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === "feed") {
        setFeedRefreshTrigger((prev) => prev + 1);
      }
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [activeTab]);

  const tabVisibilityStyle = (tab: TabType) => ({
    display: activeTab === tab ? "flex" : "none",
    flex: 1,
  });

  const findMatchTab = useMemo(() => <FindMatchTab />, []);
  const feedTab = useMemo(
    () => <FeedTab refreshTrigger={feedRefreshTrigger} profile={profile} />,
    [feedRefreshTrigger, profile]
  );
  const eventsTab = useMemo(() => <EventsTab />, []);

  return (
    <View style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={styles.topNavContainer}>
        <View style={styles.topNav}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "findMatch" && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab("findMatch")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "findMatch" && styles.tabTextActive,
              ]}
            >
              Find Match
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "feed" && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab("feed")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "feed" && styles.tabTextActive,
              ]}
            >
              Feed
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "events" && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab("events")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "events" && styles.tabTextActive,
              ]}
            >
              Events
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Content */}
      <View style={styles.scrollContainer}>
        <View style={tabVisibilityStyle("findMatch")}>{findMatchTab}</View>
        <ScrollView
          style={[styles.scrollContainer, tabVisibilityStyle("feed")]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {feedTab}
        </ScrollView>
        <View style={tabVisibilityStyle("events")}>{eventsTab}</View>
      </View>

    </View>
  );
}
