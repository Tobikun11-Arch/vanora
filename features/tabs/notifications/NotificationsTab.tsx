import {showToast} from "@/components/Toast";
import {supabase} from "@/services/supabase";
import {useUserStore} from "@/store/userStore";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import React, {useEffect, useMemo, useRef, useState} from "react";

import {
  Dimensions,
  Image,
  InteractionManager,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {styles} from "./styles";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  read_at: string | null;
  actor: {
    id: string;
    username: string | null;
    display_name: string | null;
    profile_picture_url: string | null;
  } | null;
}

interface ChatMessage {
  id: string;
  sender: "me" | "them" | "system";
  text: string;
  timestamp: string;
  senderName?: string;
  senderAvatar?: {uri: string} | number;
}

interface DirectConnection {
  id: string;
  username: string | null;
  display_name: string | null;
  profile_picture_url: string | null;
  nomad_type?: string | null;
}

export default function NotificationsTab() {
  const {width: windowWidth} = Dimensions.get("window");
  const chatBubbleMaxWidth = Math.round(windowWidth * 0.72);
  const [imagesReady, setImagesReady] = useState(false);
  const [showLegacyModal, setShowLegacyModal] = useState(false);
  const [showCreateCommunityModal, setShowCreateCommunityModal] =
    useState(false);
  const [newCommunityName, setNewCommunityName] = useState("");
  const [communityImageUri, setCommunityImageUri] = useState<string | null>(
    null,
  );
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [localReadIds, setLocalReadIds] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userProfile = useUserStore((state) => state.profile);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [directConnections, setDirectConnections] = useState<
    DirectConnection[]
  >([]);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [chatDraft, setChatDraft] = useState("");
  const [activeChat, setActiveChat] = useState<{
    id: string;
    title: string;
    subtitle?: string;
    topic?: string;
    avatar?: {uri: string} | number;
    type: "community" | "direct";
  } | null>(null);
  const [directChats, setDirectChats] = useState<Record<string, ChatMessage[]>>(
    {},
  );
  const [communityChats, setCommunityChats] = useState<
    Record<string, ChatMessage[]>
  >({});
  const chatScrollRef = useRef<ScrollView>(null);
  const promoSeedDate = new Date();
  promoSeedDate.setDate(promoSeedDate.getDate() - 1);
  promoSeedDate.setHours(9, 0, 0, 0);
  const promoCreatedAt = promoSeedDate.toISOString();
  const welcomeCreatedAt = new Date(
    promoSeedDate.getTime() - 2 * 60 * 60 * 1000,
  ).toISOString();
  const baseNotifications: Notification[] = [
    {
      id: "welcome-vanora",
      type: "welcome",
      title: "Welcome to Vanora!",
      message:
        "Welcome to our community of nomads and travelers. Discover amazing people and experiences around the world.",
      created_at: welcomeCreatedAt,
      read_at: null,
      actor: null,
    },
    {
      id: "promo-premium",
      type: "premium",
      title: "Unlock Premium Features",
      message:
        "Upgrade to Premium to access exclusive features and connect with more travelers worldwide.",
      created_at: promoCreatedAt,
      read_at: null,
      actor: null,
    },
  ];

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

  const [joinedCommunities, setJoinedCommunities] = useState([
    {
      name: "Stealth Camping Elites",
      subtitle: "4 new posts today",
      topic: "stealth camping tactics",
      image: require("../../../assets/images/duo_camper.jpg"),
    },
    {
      name: "Mountain Wanderer Hub",
      subtitle: "Up to date",
      topic: "mountain routes and gear",
      image: require("../../../assets/images/solar_van.jpg"),
    },
  ]);

  const suggestedCommunities = [
    {
      name: "VanLifer Creator",
      members: "12.4k",
      creator: "by Vanora Team",
      image: require("../../../assets/images/cozy_van.jpg"),
      subtitle: "Fresh ideas daily",
      topic: "van builds and layouts",
    },
    {
      name: "Nomadcom",
      members: "8.9k",
      creator: "by Nomadcom",
      image: require("../../../assets/images/solo_camper.jpg"),
      subtitle: "Trending now",
      topic: "remote work on the road",
    },
    {
      name: "Campfire Stories",
      members: "6.2k",
      creator: "by Jesse R.",
      image: require("../../../assets/images/stones.jpg"),
      subtitle: "Story time",
      topic: "travel stories and tips",
    },
  ];

  const communityMemberSeeds: Record<
    string,
    {name: string; avatar: {uri: string} | number}[]
  > = {
    "Stealth Camping Elites": [
      {
        name: "Noah",
        avatar: require("../../../assets/images/Noah.jpg"),
      },
      {
        name: "Duo Camper",
        avatar: require("../../../assets/images/duo_camper.jpg"),
      },
      {
        name: "Maya Trail",
        avatar: require("../../../assets/images/solo_camper.jpg"),
      },
    ],
    "Mountain Wanderer Hub": [
      {
        name: "Liam Nomad",
        avatar: require("../../../assets/images/Noah.jpg"),
      },
      {
        name: "Summit Guide",
        avatar: require("../../../assets/images/duo_camper.jpg"),
      },
      {
        name: "Raya Peak",
        avatar: require("../../../assets/images/aria.jpg"),
      },
    ],
    "VanLifer Creator": [
      {
        name: "Noah",
        avatar: require("../../../assets/images/Noah.jpg"),
      },
      {
        name: "Duo Camper",
        avatar: require("../../../assets/images/duo_camper.jpg"),
      },
    ],
    Nomadcom: [
      {
        name: "Noah",
        avatar: require("../../../assets/images/Noah.jpg"),
      },
      {
        name: "Duo Camper",
        avatar: require("../../../assets/images/duo_camper.jpg"),
      },
    ],
    "Campfire Stories": [
      {
        name: "Noah",
        avatar: require("../../../assets/images/Noah.jpg"),
      },
      {
        name: "Duo Camper",
        avatar: require("../../../assets/images/duo_camper.jpg"),
      },
    ],
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return "Just now";
    }
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-US", {month: "short", day: "numeric"});
  };

  const isLocalNotification = (id: string) =>
    id === "welcome-vanora" || id === "promo-premium";

  const resetCreateCommunityForm = () => {
    setNewCommunityName("");
    setCommunityImageUri(null);
  };

  const handlePickCommunityImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showToast(
        "error",
        "Permission required",
        "Allow photo access to pick a community image.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets?.length) {
      const asset = result.assets[0];
      if (!asset?.uri) return;

      let resolvedUri = asset.uri;
      if (resolvedUri.startsWith("content://")) {
        try {
          const safeName = asset.fileName || `community-${Date.now()}.jpg`;
          const cacheUri = `${FileSystem.cacheDirectory ?? ""}${safeName}`;
          await FileSystem.copyAsync({from: resolvedUri, to: cacheUri});
          resolvedUri = cacheUri;
        } catch (error) {
          console.warn("Failed to cache selected image:", error);
        }
      }

      setCommunityImageUri(resolvedUri);
    }
  };

  const handleCreateCommunity = () => {
    const trimmedName = newCommunityName.trim();
    if (!trimmedName) {
      showToast("error", "Missing name", "Add a community name to continue.");
      return;
    }
    if (!communityImageUri) {
      showToast(
        "error",
        "Missing photo",
        "Pick a community image to continue.",
      );
      return;
    }

    setJoinedCommunities((prev) => [
      {
        name: trimmedName,
        subtitle: "New community",
        topic: "fresh community chat",
        image: {uri: communityImageUri},
      },
      ...prev,
    ]);
    setCommunityChats((prev) => ({
      ...prev,
      [trimmedName]: [
        {
          id: `${trimmedName}-vanora-created`,
          sender: "them",
          text: `Your community "${trimmedName}" was created successfully. Invite members and start the conversation.`,
          timestamp: "Just now",
          senderName: "Vanora",
          senderAvatar: require("../../../assets/images/vanora.png"),
        },
      ],
    }));
    resetCreateCommunityForm();
    setShowCreateCommunityModal(false);
  };

  const handleJoinCommunity = (community: {
    name: string;
    subtitle: string;
    topic: string;
    image: {uri: string} | number;
  }) => {
    setJoinedCommunities((prev) => {
      if (prev.some((item) => item.name === community.name)) return prev;
      return [
        {
          name: community.name,
          subtitle: "New community",
          topic: community.topic,
          image: community.image,
        },
        ...prev,
      ];
    });
  };

  useEffect(() => {
    if (!userProfile?.id) return;

    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const {data, error} = await supabase
          .from("notifications")
          .select(
            `
            id,
            type,
            title,
            message,
            created_at,
            read_at,
            actor:profiles!notifications_actor_id_fkey (
              id,
              username,
              display_name,
              profile_picture_url
            )
          `,
          )
          .eq("recipient_id", userProfile.id)
          .order("created_at", {ascending: false});

        if (error) {
          throw error;
        }

        const fetched = (data || []).map((item) => ({
          ...item,
          actor: Array.isArray(item.actor) ? item.actor[0] || null : item.actor,
        }));
        const fetchedIds = new Set(fetched.map((item) => item.id));
        const merged = [
          ...baseNotifications.filter((item) => !fetchedIds.has(item.id)),
          ...fetched,
        ];
        setNotifications(
          merged.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          ),
        );
      } catch (err) {
        console.error("Fetch notifications error:", err);
        setError("Unable to load notifications.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userProfile?.id]);

  useEffect(() => {
    if (!userProfile?.id) return;

    const fetchDirectConnections = async () => {
      try {
        const {data: following, error: followingError} = await supabase
          .from("user_follows")
          .select("following_id")
          .eq("follower_id", userProfile.id);

        if (followingError) throw followingError;

        const {data: followers, error: followersError} = await supabase
          .from("user_follows")
          .select("follower_id")
          .eq("following_id", userProfile.id);

        if (followersError) throw followersError;

        const followingIds = (following || [])
          .map((item) => item.following_id)
          .filter(Boolean);
        const followerIds = (followers || [])
          .map((item) => item.follower_id)
          .filter(Boolean);
        const uniqueIds = Array.from(
          new Set([...followingIds, ...followerIds]),
        );

        if (uniqueIds.length === 0) {
          setDirectConnections([]);
          return;
        }

        const {data: profiles, error: profilesError} = await supabase
          .from("profiles")
          .select("id, username, display_name, profile_picture_url, nomad_type")
          .in("id", uniqueIds);

        if (profilesError) throw profilesError;

        setDirectConnections(profiles || []);
      } catch (err) {
        console.error("Fetch direct connections error:", err);
        setDirectConnections([]);
      }
    };

    fetchDirectConnections();
  }, [userProfile?.id]);

  const handleMarkAllAsRead = () => {
    if (!userProfile?.id) return;
    const now = new Date().toISOString();
    setNotifications((prev) =>
      prev.map((notif) => ({
        ...notif,
        read_at: notif.read_at || now,
      })),
    );
    setLocalReadIds((prev) => ({
      ...prev,
      ...baseNotifications.reduce<Record<string, boolean>>((acc, notif) => {
        acc[notif.id] = true;
        return acc;
      }, {}),
    }));

    supabase
      .from("notifications")
      .update({read_at: now})
      .eq("recipient_id", userProfile.id)
      .is("read_at", null)
      .then(({error}) => {
        if (error) {
          console.error("Mark all read error:", error);
          showToast("error", "Update failed", "Unable to mark all as read.");
        }
      });
  };

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const filteredCommunities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return joinedCommunities;
    return joinedCommunities.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.subtitle.toLowerCase().includes(query),
    );
  }, [joinedCommunities, searchQuery]);

  const filteredDirectConnections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return directConnections;
    return directConnections.filter((connection) => {
      const name = connection.display_name || connection.username || "Nomad";
      return name.toLowerCase().includes(query);
    });
  }, [directConnections, searchQuery]);

  const getCommunityMessages = (communityName: string, topic: string) => {
    const members = communityMemberSeeds[communityName] || [
      {
        name: "Noah",
        avatar: require("../../../assets/images/Noah.jpg"),
      },
    ];
    return (
      communityChats[communityName] || [
        {
          id: `${communityName}-intro`,
          sender: "system",
          text: `Welcome to ${communityName}. Share your latest tips on ${topic}.`,
          timestamp: "1h ago",
        },
        {
          id: `${communityName}-msg-8`,
          sender: "them",
          text: `Testing a new route for ${topic} this weekend — will report back.`,
          timestamp: "1h ago",
          senderName: members[2]?.name ?? members[0]?.name,
          senderAvatar: members[2]?.avatar ?? members[0]?.avatar,
        },
        {
          id: `${communityName}-msg-7`,
          sender: "them",
          text: `Anyone have a printable guide for ${topic}? I can make a PDF.`,
          timestamp: "1h ago",
          senderName: members[1]?.name ?? members[0]?.name,
          senderAvatar: members[1]?.avatar ?? members[0]?.avatar,
        },
        {
          id: `${communityName}-msg-6`,
          sender: "them",
          text: `For ${topic}, I’ve been rotating sites every 2 nights to stay low-key.`,
          timestamp: "48m ago",
          senderName: members[2]?.name ?? members[1]?.name ?? members[0]?.name,
          senderAvatar:
            members[2]?.avatar ?? members[1]?.avatar ?? members[0]?.avatar,
        },
        {
          id: `${communityName}-msg-5`,
          sender: "them",
          text: `Shared a quick map pin list for ${topic} in the files tab.`,
          timestamp: "35m ago",
          senderName: members[2]?.name ?? members[0]?.name,
          senderAvatar: members[2]?.avatar ?? members[0]?.avatar,
        },
        {
          id: `${communityName}-msg-4`,
          sender: "them",
          text: `What’s everyone’s must-have item before a ${topic} weekend?`,
          timestamp: "22m ago",
          senderName: members[1]?.name ?? members[0]?.name,
          senderAvatar: members[1]?.avatar ?? members[0]?.avatar,
        },
        {
          id: `${communityName}-msg-3`,
          sender: "them",
          text: `I keep a one-page checklist for ${topic} — happy to share.`,
          timestamp: "14m ago",
          senderName: members[0]?.name,
          senderAvatar: members[0]?.avatar,
        },
        {
          id: `${communityName}-msg-2`,
          sender: "them",
          text: `Drop your favorite gear list for ${topic}.`,
          timestamp: "8m ago",
          senderName: members[1]?.name ?? members[0]?.name,
          senderAvatar: members[1]?.avatar ?? members[0]?.avatar,
        },
        {
          id: `${communityName}-msg-1`,
          sender: "them",
          text: `Anyone tried a new spot for ${topic}?`,
          timestamp: "2m ago",
          senderName: members[0]?.name,
          senderAvatar: members[0]?.avatar,
        },
      ]
    );
  };

  const getDirectMessages = (userId: string, name: string) => {
    return (
      directChats[userId] || [
        {
          id: `${userId}-intro`,
          sender: "system",
          text: `Say hi to ${name} 👋`,
          timestamp: "Just now",
        },
      ]
    );
  };

  useEffect(() => {
    if (!chatModalVisible) return;
    const scrollToLatest = () => {
      setTimeout(() => {
        chatScrollRef.current?.scrollToEnd({animated: true});
      }, 50);
    };
    const showSub = Keyboard.addListener("keyboardDidShow", scrollToLatest);
    const hideSub = Keyboard.addListener("keyboardDidHide", scrollToLatest);
    scrollToLatest();
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [chatModalVisible, activeChat?.id]);

  const openCommunityChat = (community: {
    name: string;
    subtitle: string;
    topic: string;
    image: {uri: string} | number;
  }) => {
    setActiveChat({
      id: community.name,
      title: community.name,
      subtitle: community.subtitle,
      topic: community.topic,
      avatar: community.image,
      type: "community",
    });
    setChatModalVisible(true);
  };

  const openDirectChat = (connection: DirectConnection) => {
    const name = connection.display_name || connection.username || "Nomad";
    setActiveChat({
      id: connection.id,
      title: name,
      subtitle:
        connection.nomad_type ||
        (connection.username ? `@${connection.username}` : "Nomad"),
      avatar: connection.profile_picture_url
        ? {uri: connection.profile_picture_url}
        : require("../../../assets/images/vanora.png"),
      type: "direct",
    });
    setChatModalVisible(true);
  };

  const handleSendMessage = () => {
    if (!activeChat || !chatDraft.trim()) return;
    const message: ChatMessage = {
      id: `${activeChat.id}-${Date.now()}`,
      sender: "me",
      text: chatDraft.trim(),
      timestamp: "Now",
    };
    const replyId = `${activeChat.id}-${Date.now()}-reply`;
    const replyText =
      activeChat.type === "community"
        ? `Welcome! Glad you’re here — feel free to jump in.`
        : `What’s good?`;
    setChatDraft("");

    if (activeChat.type === "direct") {
      setDirectChats((prev) => ({
        ...prev,
        [activeChat.id]: [
          ...getDirectMessages(activeChat.id, activeChat.title),
          message,
        ],
      }));
      setTimeout(() => {
        setDirectChats((prev) => ({
          ...prev,
          [activeChat.id]: [
            ...(prev[activeChat.id] || []),
            {
              id: replyId,
              sender: "them",
              text: replyText,
              timestamp: "Now",
              senderName: activeChat.title,
              senderAvatar: activeChat.avatar,
            },
          ],
        }));
      }, 700);
    } else {
      const members = communityMemberSeeds[activeChat.id] || [];
      const greeter =
        members[Math.floor(Math.random() * members.length)] || null;
      setCommunityChats((prev) => ({
        ...prev,
        [activeChat.id]: [
          ...getCommunityMessages(
            activeChat.id,
            activeChat.topic || "community updates",
          ),
          message,
        ],
      }));
      setTimeout(() => {
        setCommunityChats((prev) => ({
          ...prev,
          [activeChat.id]: [
            ...(prev[activeChat.id] || []),
            {
              id: replyId,
              sender: "them",
              text: replyText,
              timestamp: "Now",
              senderName: greeter?.name || "Community member",
              senderAvatar: greeter?.avatar,
            },
          ],
        }));
      }, 700);
    }
  };

  const renderLegacyNotifications = () => (
    <View style={styles.legacyContainer}>
      <View style={styles.tabsTopDivider} />
      <View style={styles.tabsContainer}>
        {["All", "Likes", "Matches", "Messages"].map((tab) => (
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

      <ScrollView
        style={styles.notificationsList}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Recent</Text>

        {[
          ...baseNotifications,
          ...notifications.filter((n) => !isLocalNotification(n.id)),
        ].map((notification) => {
          const actorName =
            notification.actor?.display_name ||
            notification.actor?.username ||
            "Vanora";
          const avatarSource = notification.actor?.profile_picture_url
            ? {uri: notification.actor.profile_picture_url}
            : require("../../../assets/images/vanora.png");

          const isRead =
            !!notification.read_at || !!localReadIds[notification.id];
          return (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                isRead && styles.notificationCardRead,
              ]}
              onPress={() => {
                if (isRead) return;
                const now = new Date().toISOString();
                setNotifications((prev) =>
                  prev.map((n) =>
                    n.id === notification.id ? {...n, read_at: now} : n,
                  ),
                );
                if (isLocalNotification(notification.id)) {
                  setLocalReadIds((prev) => ({
                    ...prev,
                    [notification.id]: true,
                  }));
                }
                if (isLocalNotification(notification.id)) {
                  return;
                }
                supabase
                  .from("notifications")
                  .update({read_at: now})
                  .eq("id", notification.id)
                  .then(({error}) => {
                    if (error) {
                      console.error("Mark read error:", error);
                      showToast(
                        "error",
                        "Update failed",
                        "Unable to mark as read.",
                      );
                    }
                  });
              }}
              activeOpacity={0.7}
            >
              <View style={styles.avatarWrapper}>
                <View style={styles.avatarBadge}>
                  {renderImage(avatarSource, styles.avatar, "cover")}
                </View>
              </View>

              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>
                  {notification.title}
                </Text>
                <Text style={styles.notificationMessage} numberOfLines={2}>
                  {notification.message}
                </Text>
                <Text style={styles.notificationTime}>
                  {actorName} - {formatTimeAgo(notification.created_at)}
                </Text>
              </View>

              {!isRead && <View style={styles.statusIndicator} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>Activities</Text>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setShowLegacyModal(true)}
        >
          <MaterialCommunityIcons
            name="bell-outline"
            size={20}
            color="#1F2937"
          />
          <View style={styles.iconBadge} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <MaterialCommunityIcons name="magnify" size={16} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search communities and chats"
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <MaterialCommunityIcons
              name="close-circle"
              size={16}
              color="#94A3B8"
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeaderText}>SUGGESTED COMMUNITIES</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateCommunityModal(true)}
        >
          <Text style={styles.createPlus}>+</Text>
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestedRow}
        >
          {suggestedCommunities.map((item) => (
            <View key={item.name} style={styles.communityCard}>
              <View style={styles.communityImage}>
                {renderImage(item.image, styles.communityImageFill, "cover")}
              </View>
              <Text style={styles.communityName}>{item.name}</Text>
              <Text style={styles.communityCreator}>{item.creator}</Text>
              <Text style={styles.communityMembers}>{item.members}</Text>
              {joinedCommunities.some(
                (community) => community.name === item.name,
              ) ? (
                <TouchableOpacity
                  style={styles.joinedButton}
                  onPress={() =>
                    openCommunityChat({
                      name: item.name,
                      subtitle: item.subtitle,
                      topic: item.topic,
                      image: item.image,
                    })
                  }
                >
                  <Text style={styles.joinedButtonText}>Joined</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.joinButton}
                  onPress={() => handleJoinCommunity(item)}
                >
                  <Text style={styles.joinButtonText}>Join</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>

        <Text style={styles.sectionHeaderText}>JOINED COMMUNITIES</Text>
        <View style={styles.listCard}>
          {filteredCommunities.map((item) => (
            <TouchableOpacity
              key={item.name}
              style={styles.listItem}
              onPress={() => openCommunityChat(item)}
            >
              <View style={styles.listAvatar}>
                {renderImage(item.image, styles.listAvatarImage, "cover")}
              </View>
              <View style={styles.listTextWrap}>
                <Text style={styles.listTitle}>{item.name}</Text>
                <Text style={styles.listSubtitle}>{item.subtitle}</Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={18}
                color="#94A3B8"
              />
            </TouchableOpacity>
          ))}
          {filteredCommunities.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No communities found.</Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionHeaderText}>PRIVATE MESSAGES</Text>
        <View style={styles.listCard}>
          {filteredDirectConnections.map((connection) => {
            const name =
              connection.display_name || connection.username || "Nomad";
            return (
              <TouchableOpacity
                key={connection.id}
                style={styles.listItem}
                onPress={() => openDirectChat(connection)}
              >
                <View style={styles.listAvatar}>
                  {connection.profile_picture_url
                    ? renderImage(
                        {uri: connection.profile_picture_url},
                        styles.listAvatarImage,
                        "cover",
                      )
                    : renderImage(
                        require("../../../assets/images/vanora.png"),
                        styles.listAvatarImage,
                        "cover",
                      )}
                  <View style={styles.onlineDot} />
                </View>
                <View style={styles.listTextWrap}>
                  <Text style={styles.listTitle}>{name}</Text>
                  <Text style={styles.listSubtitle} numberOfLines={1}>
                    Say hi to {name} 👋
                  </Text>
                </View>
                <Text style={styles.listMeta}>New</Text>
              </TouchableOpacity>
            );
          })}
          {filteredDirectConnections.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No followers or following yet.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showLegacyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLegacyModal(false)}
      >
        <View style={styles.legacyModalOverlay}>
          <View style={styles.legacyModalCard}>
            <View style={styles.legacyModalTopBar}>
              <TouchableOpacity
                style={styles.legacyBackButton}
                onPress={() => setShowLegacyModal(false)}
              >
                <MaterialCommunityIcons
                  name="chevron-left"
                  size={22}
                  color="#1a1a1a"
                />
              </TouchableOpacity>
              <Text style={styles.legacyModalTitle}>Notifications</Text>
              <TouchableOpacity
                onPress={handleMarkAllAsRead}
                style={styles.markAllButton}
              >
                <Text style={styles.markAllText}>Mark all as read</Text>
              </TouchableOpacity>
            </View>
            {renderLegacyNotifications()}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCreateCommunityModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowCreateCommunityModal(false);
          resetCreateCommunityForm();
        }}
      >
        <View style={styles.createModalOverlay}>
          <View style={styles.createModalCard}>
            <View style={styles.createModalHeader}>
              <Text style={styles.createModalTitle}>Create Community</Text>
              <TouchableOpacity
                style={styles.createModalClose}
                onPress={() => {
                  setShowCreateCommunityModal(false);
                  resetCreateCommunityForm();
                }}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={18}
                  color="#1F2937"
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.createModalScroll}
              contentContainerStyle={styles.createModalContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.imageUploadSection}>
                <Text style={styles.createLabel}>Community cover</Text>
                <TouchableOpacity
                  style={styles.imageUploadBox}
                  onPress={handlePickCommunityImage}
                  activeOpacity={0.8}
                >
                  {communityImageUri ? (
                    <Image
                      source={{uri: communityImageUri}}
                      resizeMode="cover"
                      key={communityImageUri}
                      style={styles.imagePreview}
                    />
                  ) : (
                    <>
                      <MaterialCommunityIcons
                        name="image-plus"
                        size={36}
                        color="#94A3B8"
                      />
                      <Text style={styles.imageUploadText}>
                        Upload a square cover
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <Text style={styles.createLabel}>Community name</Text>
              <TextInput
                style={styles.createInput}
                placeholder="e.g. Weekend Van Builders"
                placeholderTextColor="#94A3B8"
                value={newCommunityName}
                onChangeText={setNewCommunityName}
                maxLength={40}
              />
            </ScrollView>

            <View style={styles.createModalActions}>
              <TouchableOpacity
                style={styles.createCancelButton}
                onPress={() => {
                  setShowCreateCommunityModal(false);
                  resetCreateCommunityForm();
                }}
              >
                <Text style={styles.createCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.createSubmitButton}
                onPress={handleCreateCommunity}
              >
                <Text style={styles.createSubmitText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={chatModalVisible}
        animationType="slide"
        onRequestClose={() => setChatModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.chatModal}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? TOP_BAR_PADDING : 0}
        >
          <View style={styles.chatHeader}>
            <TouchableOpacity
              style={styles.chatBackButton}
              onPress={() => setChatModalVisible(false)}
            >
              <MaterialCommunityIcons
                name="chevron-left"
                size={22}
                color="#1a1a1a"
              />
            </TouchableOpacity>
            {activeChat?.avatar &&
              renderImage(activeChat.avatar, styles.chatHeaderAvatar, "cover")}
            <View style={styles.chatHeaderText}>
              <Text style={styles.chatTitle}>{activeChat?.title}</Text>
              {activeChat?.subtitle && (
                <Text style={styles.chatSubtitle}>{activeChat.subtitle}</Text>
              )}
            </View>
          </View>

          <ScrollView
            ref={chatScrollRef}
            style={styles.chatMessages}
            contentContainerStyle={styles.chatMessagesContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() =>
              chatScrollRef.current?.scrollToEnd({animated: true})
            }
          >
            {(activeChat?.type === "community"
              ? getCommunityMessages(
                  activeChat.id,
                  activeChat.topic || "community updates",
                )
              : activeChat
                ? getDirectMessages(activeChat.id, activeChat.title)
                : []
            ).map((message) => {
              const themAvatar =
                message.senderAvatar ||
                (activeChat?.type === "direct" ? activeChat.avatar : undefined);

              return (
                <View
                  key={message.id}
                  style={[
                    styles.chatRow,
                    message.sender === "me" && styles.chatRowMe,
                    message.sender === "system" && styles.chatRowSystem,
                  ]}
                >
                  {message.sender === "them" && (
                    <View style={styles.chatAvatarWrap}>
                      {themAvatar ? (
                        renderImage(themAvatar, styles.chatAvatar, "cover")
                      ) : (
                        <View style={styles.chatAvatarFallback}>
                          <MaterialCommunityIcons
                            name="account"
                            size={14}
                            color="#94A3B8"
                          />
                        </View>
                      )}
                    </View>
                  )}
                  <View
                    style={[
                      styles.chatBubble,
                      message.sender === "me" && styles.chatBubbleMe,
                      message.sender === "system" && styles.chatBubbleSystem,
                      {maxWidth: chatBubbleMaxWidth},
                    ]}
                  >
                    {message.sender === "them" && message.senderName && (
                      <Text style={styles.chatSenderName}>
                        {message.senderName}
                      </Text>
                    )}
                    <Text
                      style={[
                        styles.chatBubbleText,
                        message.sender === "me" && styles.chatBubbleTextMe,
                        message.sender === "system" &&
                          styles.chatBubbleTextSystem,
                      ]}
                    >
                      {message.text}
                    </Text>
                    <Text style={styles.chatTimestamp}>
                      {message.timestamp}
                    </Text>
                  </View>
                  {message.sender === "me" && (
                    <View style={styles.chatAvatarWrapMe}>
                      {userProfile?.profile_picture_url ? (
                        renderImage(
                          {uri: userProfile.profile_picture_url},
                          styles.chatAvatar,
                          "cover",
                        )
                      ) : (
                        <View style={styles.chatAvatarFallback}>
                          <MaterialCommunityIcons
                            name="account"
                            size={14}
                            color="#94A3B8"
                          />
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.chatComposer}>
            <TextInput
              style={styles.chatInput}
              placeholder="Write a message..."
              placeholderTextColor="#94A3B8"
              value={chatDraft}
              onChangeText={setChatDraft}
            />
            <TouchableOpacity
              style={styles.chatSendButton}
              onPress={handleSendMessage}
            >
              <MaterialCommunityIcons name="send" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
