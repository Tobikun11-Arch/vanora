import {showToast} from '@/components/Toast';
import {supabase} from '@/services/supabase';
import {useUserStore} from '@/store/userStore';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import {useEffect, useMemo, useRef, useState} from 'react';
import {
  Dimensions,
  Image,
  InteractionManager,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const {width: WINDOW_WIDTH, height: WINDOW_HEIGHT} = Dimensions.get('window');
const TOP_BAR_PADDING =
  Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight ?? 0) + 12;
const H_PADDING = Math.max(16, Math.round(WINDOW_WIDTH * 0.045));
const V_SPACING = Math.max(10, Math.round(WINDOW_HEIGHT * 0.012));
const SECTION_SPACING = Math.max(12, Math.round(WINDOW_HEIGHT * 0.016));

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
  sender: 'me' | 'them' | 'system';
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
  const {width: windowWidth} = Dimensions.get('window');
  const chatBubbleMaxWidth = Math.round(windowWidth * 0.72);
  const [imagesReady, setImagesReady] = useState(false);
  const [showLegacyModal, setShowLegacyModal] = useState(false);
  const [showCreateCommunityModal, setShowCreateCommunityModal] =
    useState(false);
  const [newCommunityName, setNewCommunityName] = useState('');
  const [communityImageUri, setCommunityImageUri] = useState<string | null>(
    null
  );
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [localReadIds, setLocalReadIds] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userProfile = useUserStore(state => state.profile);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [directConnections, setDirectConnections] = useState<
    DirectConnection[]
  >([]);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [chatDraft, setChatDraft] = useState('');
  const [activeChat, setActiveChat] = useState<{
    id: string;
    title: string;
    subtitle?: string;
    topic?: string;
    avatar?: {uri: string} | number;
    type: 'community' | 'direct';
  } | null>(null);
  const [directChats, setDirectChats] = useState<
    Record<string, ChatMessage[]>
  >({});
  const [communityChats, setCommunityChats] = useState<
    Record<string, ChatMessage[]>
  >({});
  const chatScrollRef = useRef<ScrollView>(null);
  const promoSeedDate = new Date();
  promoSeedDate.setDate(promoSeedDate.getDate() - 1);
  promoSeedDate.setHours(9, 0, 0, 0);
  const promoCreatedAt = promoSeedDate.toISOString();
  const welcomeCreatedAt = new Date(
    promoSeedDate.getTime() - 2 * 60 * 60 * 1000
  ).toISOString();
  const baseNotifications: Notification[] = [
    {
      id: 'welcome-vanora',
      type: 'welcome',
      title: 'Welcome to Vanora!',
      message:
        'Welcome to our community of nomads and travelers. Discover amazing people and experiences around the world.',
      created_at: welcomeCreatedAt,
      read_at: null,
      actor: null
    },
    {
      id: 'promo-premium',
      type: 'premium',
      title: 'Unlock Premium Features',
      message:
        'Upgrade to Premium to access exclusive features and connect with more travelers worldwide.',
      created_at: promoCreatedAt,
      read_at: null,
      actor: null
    }
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
    resizeMode: 'cover' | 'contain' | 'stretch' | 'center' = 'cover'
  ) => {
    if (!imagesReady) {
      return <View style={[style, styles.imagePlaceholder]} />;
    }
    return <Image source={source} style={style} resizeMode={resizeMode} />;
  };

  const [joinedCommunities, setJoinedCommunities] = useState([
    {
      name: 'Stealth Camping Elites',
      subtitle: '4 new posts today',
      topic: 'stealth camping tactics',
      image: require('../../assets/images/duo_camper.jpg')
    },
    {
      name: 'Mountain Wanderer Hub',
      subtitle: 'Up to date',
      topic: 'mountain routes and gear',
      image: require('../../assets/images/solar_van.jpg')
    }
  ]);

  const suggestedCommunities = [
    {
      name: 'VanLifer Creator',
      members: '12.4k',
      creator: 'by Vanora Team',
      image: require('../../assets/images/cozy_van.jpg'),
      subtitle: 'Fresh ideas daily',
      topic: 'van builds and layouts'
    },
    {
      name: 'Nomadcom',
      members: '8.9k',
      creator: 'by Nomadcom',
      image: require('../../assets/images/solo_camper.jpg'),
      subtitle: 'Trending now',
      topic: 'remote work on the road'
    },
    {
      name: 'Campfire Stories',
      members: '6.2k',
      creator: 'by Jesse R.',
      image: require('../../assets/images/stones.jpg'),
      subtitle: 'Story time',
      topic: 'travel stories and tips'
    }
  ];

  const communityMemberSeeds: Record<
    string,
    {name: string; avatar: {uri: string} | number}[]
  > = {
    'Stealth Camping Elites': [
      {
        name: 'Noah',
        avatar: require('../../assets/images/Noah.jpg')
      },
      {
        name: 'Duo Camper',
        avatar: require('../../assets/images/duo_camper.jpg')
      },
      {
        name: 'Maya Trail',
        avatar: require('../../assets/images/solo_camper.jpg')
      }
    ],
    'Mountain Wanderer Hub': [
      {
        name: 'Liam Nomad',
        avatar: require('../../assets/images/Noah.jpg')
      },
      {
        name: 'Summit Guide',
        avatar: require('../../assets/images/duo_camper.jpg')
      },
      {
        name: 'Raya Peak',
        avatar: require('../../assets/images/aria.jpg')
      }
    ],
    'VanLifer Creator': [
      {
        name: 'Noah',
        avatar: require('../../assets/images/Noah.jpg')
      },
      {
        name: 'Duo Camper',
        avatar: require('../../assets/images/duo_camper.jpg')
      }
    ],
    Nomadcom: [
      {
        name: 'Noah',
        avatar: require('../../assets/images/Noah.jpg')
      },
      {
        name: 'Duo Camper',
        avatar: require('../../assets/images/duo_camper.jpg')
      }
    ],
    'Campfire Stories': [
      {
        name: 'Noah',
        avatar: require('../../assets/images/Noah.jpg')
      },
      {
        name: 'Duo Camper',
        avatar: require('../../assets/images/duo_camper.jpg')
      }
    ]
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return 'Just now';
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
    return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
  };

  const isLocalNotification = (id: string) =>
    id === 'welcome-vanora' || id === 'promo-premium';

  const resetCreateCommunityForm = () => {
    setNewCommunityName('');
    setCommunityImageUri(null);
  };

  const handlePickCommunityImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showToast(
        'error',
        'Permission required',
        'Allow photo access to pick a community image.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85
    });

    if (!result.canceled && result.assets?.length) {
      const asset = result.assets[0];
      if (!asset?.uri) return;

      let resolvedUri = asset.uri;
      if (resolvedUri.startsWith('content://')) {
        try {
          const safeName = asset.fileName || `community-${Date.now()}.jpg`;
          const cacheUri = `${FileSystem.cacheDirectory ?? ''}${safeName}`;
          await FileSystem.copyAsync({from: resolvedUri, to: cacheUri});
          resolvedUri = cacheUri;
        } catch (error) {
          console.warn('Failed to cache selected image:', error);
        }
      }

      setCommunityImageUri(resolvedUri);
    }
  };

  const handleCreateCommunity = () => {
    const trimmedName = newCommunityName.trim();
    if (!trimmedName) {
      showToast('error', 'Missing name', 'Add a community name to continue.');
      return;
    }
    if (!communityImageUri) {
      showToast(
        'error',
        'Missing photo',
        'Pick a community image to continue.'
      );
      return;
    }

    setJoinedCommunities(prev => [
      {
        name: trimmedName,
        subtitle: 'New community',
        topic: 'fresh community chat',
        image: {uri: communityImageUri}
      },
      ...prev
    ]);
    setCommunityChats(prev => ({
      ...prev,
      [trimmedName]: [
        {
          id: `${trimmedName}-vanora-created`,
          sender: 'them',
          text: `Your community "${trimmedName}" was created successfully. Invite members and start the conversation.`,
          timestamp: 'Just now',
          senderName: 'Vanora',
          senderAvatar: require('../../assets/images/vanora.png')
        }
      ]
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
    setJoinedCommunities(prev => {
      if (prev.some(item => item.name === community.name)) return prev;
      return [
        {
          name: community.name,
          subtitle: 'New community',
          topic: community.topic,
          image: community.image
        },
        ...prev
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
          .from('notifications')
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
          `
          )
          .eq('recipient_id', userProfile.id)
          .order('created_at', {ascending: false});

        if (error) {
          throw error;
        }

        const fetched = (data || []).map(item => ({
          ...item,
          actor: Array.isArray(item.actor) ? item.actor[0] || null : item.actor
        }));
        const fetchedIds = new Set(fetched.map(item => item.id));
        const merged = [
          ...baseNotifications.filter(item => !fetchedIds.has(item.id)),
          ...fetched
        ];
        setNotifications(
          merged.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
        );
      } catch (err) {
        console.error('Fetch notifications error:', err);
        setError('Unable to load notifications.');
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
          .from('user_follows')
          .select('following_id')
          .eq('follower_id', userProfile.id);

        if (followingError) throw followingError;

        const {data: followers, error: followersError} = await supabase
          .from('user_follows')
          .select('follower_id')
          .eq('following_id', userProfile.id);

        if (followersError) throw followersError;

        const followingIds = (following || [])
          .map(item => item.following_id)
          .filter(Boolean);
        const followerIds = (followers || [])
          .map(item => item.follower_id)
          .filter(Boolean);
        const uniqueIds = Array.from(
          new Set([...followingIds, ...followerIds])
        );

        if (uniqueIds.length === 0) {
          setDirectConnections([]);
          return;
        }

        const {data: profiles, error: profilesError} = await supabase
          .from('profiles')
          .select('id, username, display_name, profile_picture_url, nomad_type')
          .in('id', uniqueIds);

        if (profilesError) throw profilesError;

        setDirectConnections(profiles || []);
      } catch (err) {
        console.error('Fetch direct connections error:', err);
        setDirectConnections([]);
      }
    };

    fetchDirectConnections();
  }, [userProfile?.id]);

  const handleMarkAllAsRead = () => {
    if (!userProfile?.id) return;
    const now = new Date().toISOString();
    setNotifications(prev =>
      prev.map(notif => ({
        ...notif,
        read_at: notif.read_at || now
      }))
    );
    setLocalReadIds(prev => ({
      ...prev,
      ...baseNotifications.reduce<Record<string, boolean>>((acc, notif) => {
        acc[notif.id] = true;
        return acc;
      }, {})
    }));

    supabase
      .from('notifications')
      .update({read_at: now})
      .eq('recipient_id', userProfile.id)
      .is('read_at', null)
      .then(({error}) => {
        if (error) {
          console.error('Mark all read error:', error);
          showToast('error', 'Update failed', 'Unable to mark all as read.');
        }
      });
  };

  const unreadCount = notifications.filter(n => !n.read_at).length;

  const filteredCommunities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return joinedCommunities;
    return joinedCommunities.filter(
      item =>
        item.name.toLowerCase().includes(query) ||
        item.subtitle.toLowerCase().includes(query)
    );
  }, [joinedCommunities, searchQuery]);

  const filteredDirectConnections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return directConnections;
    return directConnections.filter(connection => {
      const name =
        connection.display_name ||
        connection.username ||
        'Nomad';
      return name.toLowerCase().includes(query);
    });
  }, [directConnections, searchQuery]);

  const getCommunityMessages = (communityName: string, topic: string) => {
    const members = communityMemberSeeds[communityName] || [
      {
        name: 'Noah',
        avatar: require('../../assets/images/Noah.jpg')
      }
    ];
    return (
      communityChats[communityName] || [
        {
          id: `${communityName}-intro`,
          sender: 'system',
          text: `Welcome to ${communityName}. Share your latest tips on ${topic}.`,
          timestamp: '1h ago'
        },
        {
          id: `${communityName}-msg-8`,
          sender: 'them',
          text: `Testing a new route for ${topic} this weekend — will report back.`,
          timestamp: '1h ago',
          senderName: members[2]?.name ?? members[0]?.name,
          senderAvatar: members[2]?.avatar ?? members[0]?.avatar
        },
        {
          id: `${communityName}-msg-7`,
          sender: 'them',
          text: `Anyone have a printable guide for ${topic}? I can make a PDF.`,
          timestamp: '1h ago',
          senderName: members[1]?.name ?? members[0]?.name,
          senderAvatar: members[1]?.avatar ?? members[0]?.avatar
        },
        {
          id: `${communityName}-msg-6`,
          sender: 'them',
          text: `For ${topic}, I’ve been rotating sites every 2 nights to stay low-key.`,
          timestamp: '48m ago',
          senderName: members[2]?.name ?? members[1]?.name ?? members[0]?.name,
          senderAvatar:
            members[2]?.avatar ?? members[1]?.avatar ?? members[0]?.avatar
        },
        {
          id: `${communityName}-msg-5`,
          sender: 'them',
          text: `Shared a quick map pin list for ${topic} in the files tab.`,
          timestamp: '35m ago',
          senderName: members[2]?.name ?? members[0]?.name,
          senderAvatar: members[2]?.avatar ?? members[0]?.avatar
        },
        {
          id: `${communityName}-msg-4`,
          sender: 'them',
          text: `What’s everyone’s must-have item before a ${topic} weekend?`,
          timestamp: '22m ago',
          senderName: members[1]?.name ?? members[0]?.name,
          senderAvatar: members[1]?.avatar ?? members[0]?.avatar
        },
        {
          id: `${communityName}-msg-3`,
          sender: 'them',
          text: `I keep a one-page checklist for ${topic} — happy to share.`,
          timestamp: '14m ago',
          senderName: members[0]?.name,
          senderAvatar: members[0]?.avatar
        },
        {
          id: `${communityName}-msg-2`,
          sender: 'them',
          text: `Drop your favorite gear list for ${topic}.`,
          timestamp: '8m ago',
          senderName: members[1]?.name ?? members[0]?.name,
          senderAvatar: members[1]?.avatar ?? members[0]?.avatar
        },
        {
          id: `${communityName}-msg-1`,
          sender: 'them',
          text: `Anyone tried a new spot for ${topic}?`,
          timestamp: '2m ago',
          senderName: members[0]?.name,
          senderAvatar: members[0]?.avatar
        }
      ]
    );
  };

  const getDirectMessages = (userId: string, name: string) => {
    return (
      directChats[userId] || [
        {
          id: `${userId}-intro`,
          sender: 'system',
          text: `Say hi to ${name} 👋`,
          timestamp: 'Just now'
        }
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
    const showSub = Keyboard.addListener('keyboardDidShow', scrollToLatest);
    const hideSub = Keyboard.addListener('keyboardDidHide', scrollToLatest);
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
      type: 'community'
    });
    setChatModalVisible(true);
  };

  const openDirectChat = (connection: DirectConnection) => {
    const name =
      connection.display_name ||
      connection.username ||
      'Nomad';
    setActiveChat({
      id: connection.id,
      title: name,
      subtitle:
        connection.nomad_type || (connection.username ? `@${connection.username}` : 'Nomad'),
      avatar: connection.profile_picture_url
        ? {uri: connection.profile_picture_url}
        : require('../../assets/images/vanora.png'),
      type: 'direct'
    });
    setChatModalVisible(true);
  };

  const handleSendMessage = () => {
    if (!activeChat || !chatDraft.trim()) return;
    const message: ChatMessage = {
      id: `${activeChat.id}-${Date.now()}`,
      sender: 'me',
      text: chatDraft.trim(),
      timestamp: 'Now'
    };
    const replyId = `${activeChat.id}-${Date.now()}-reply`;
    const replyText =
      activeChat.type === 'community'
        ? `Welcome! Glad you’re here — feel free to jump in.`
        : `What’s good?`;
    setChatDraft('');

    if (activeChat.type === 'direct') {
      setDirectChats(prev => ({
        ...prev,
        [activeChat.id]: [
          ...getDirectMessages(activeChat.id, activeChat.title),
          message
        ]
      }));
      setTimeout(() => {
        setDirectChats(prev => ({
          ...prev,
          [activeChat.id]: [
            ...(prev[activeChat.id] || []),
            {
              id: replyId,
              sender: 'them',
              text: replyText,
              timestamp: 'Now',
              senderName: activeChat.title,
              senderAvatar: activeChat.avatar
            }
          ]
        }));
      }, 700);
    } else {
      const members = communityMemberSeeds[activeChat.id] || [];
      const greeter =
        members[Math.floor(Math.random() * members.length)] || null;
      setCommunityChats(prev => ({
        ...prev,
        [activeChat.id]: [
          ...getCommunityMessages(
            activeChat.id,
            activeChat.topic || 'community updates'
          ),
          message
        ]
      }));
      setTimeout(() => {
        setCommunityChats(prev => ({
          ...prev,
          [activeChat.id]: [
            ...(prev[activeChat.id] || []),
            {
              id: replyId,
              sender: 'them',
              text: replyText,
              timestamp: 'Now',
              senderName: greeter?.name || 'Community member',
              senderAvatar: greeter?.avatar
            }
          ]
        }));
      }, 700);
    }
  };

  const renderLegacyNotifications = () => (
    <View style={styles.legacyContainer}>
      <View style={styles.tabsTopDivider} />
      <View style={styles.tabsContainer}>
        {['All', 'Likes', 'Matches', 'Messages'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab.toLowerCase() && styles.tabActive
            ]}
            onPress={() => setActiveTab(tab.toLowerCase())}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.toLowerCase() && styles.tabTextActive
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
          ...notifications.filter(n => !isLocalNotification(n.id))
        ].map(notification => {
          const actorName =
            notification.actor?.display_name ||
            notification.actor?.username ||
            'Vanora';
          const avatarSource = notification.actor?.profile_picture_url
            ? {uri: notification.actor.profile_picture_url}
            : require('../../assets/images/vanora.png');

          const isRead =
            !!notification.read_at || !!localReadIds[notification.id];
          return (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                isRead && styles.notificationCardRead
              ]}
              onPress={() => {
                if (isRead) return;
                const now = new Date().toISOString();
                setNotifications(prev =>
                  prev.map(n =>
                    n.id === notification.id ? {...n, read_at: now} : n
                  )
                );
                if (isLocalNotification(notification.id)) {
                  setLocalReadIds(prev => ({
                    ...prev,
                    [notification.id]: true
                  }));
                }
                if (isLocalNotification(notification.id)) {
                  return;
                }
                supabase
                  .from('notifications')
                  .update({read_at: now})
                  .eq('id', notification.id)
                  .then(({error}) => {
                    if (error) {
                      console.error('Mark read error:', error);
                      showToast(
                        'error',
                        'Update failed',
                        'Unable to mark as read.'
                      );
                    }
                  });
              }}
              activeOpacity={0.7}
            >
              <View style={styles.avatarWrapper}>
                <View style={styles.avatarBadge}>
                  {renderImage(avatarSource, styles.avatar, 'cover')}
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
          <TouchableOpacity onPress={() => setSearchQuery('')}>
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
        {suggestedCommunities.map(item => (
            <View key={item.name} style={styles.communityCard}>
              <View style={styles.communityImage}>
                {renderImage(item.image, styles.communityImageFill, 'cover')}
              </View>
              <Text style={styles.communityName}>{item.name}</Text>
              <Text style={styles.communityCreator}>{item.creator}</Text>
              <Text style={styles.communityMembers}>{item.members}</Text>
              {joinedCommunities.some(
                community => community.name === item.name
              ) ? (
                <TouchableOpacity
                  style={styles.joinedButton}
                  onPress={() =>
                    openCommunityChat({
                      name: item.name,
                      subtitle: item.subtitle,
                      topic: item.topic,
                      image: item.image
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
          {filteredCommunities.map(item => (
            <TouchableOpacity
              key={item.name}
              style={styles.listItem}
              onPress={() => openCommunityChat(item)}
            >
              <View style={styles.listAvatar}>
                {renderImage(item.image, styles.listAvatarImage, 'cover')}
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
          {filteredDirectConnections.map(connection => {
            const name =
              connection.display_name ||
              connection.username ||
              'Nomad';
            return (
              <TouchableOpacity
                key={connection.id}
                style={styles.listItem}
                onPress={() => openDirectChat(connection)}
              >
                <View style={styles.listAvatar}>
                  {connection.profile_picture_url ? (
                    renderImage(
                      {uri: connection.profile_picture_url},
                      styles.listAvatarImage,
                      'cover'
                    )
                  ) : (
                    renderImage(
                      require('../../assets/images/vanora.png'),
                      styles.listAvatarImage,
                      'cover'
                    )
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
        <View style={styles.chatModal}>
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
            {activeChat?.avatar && (
              renderImage(activeChat.avatar, styles.chatHeaderAvatar, 'cover')
            )}
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
            onContentSizeChange={() => chatScrollRef.current?.scrollToEnd({animated: true})}
          >
            {(activeChat?.type === 'community'
              ? getCommunityMessages(
                  activeChat.id,
                  activeChat.topic || 'community updates'
                )
              : activeChat
                ? getDirectMessages(activeChat.id, activeChat.title)
                : []
            ).map(message => {
              const themAvatar =
                message.senderAvatar ||
                (activeChat?.type === 'direct' ? activeChat.avatar : undefined);

              return (
                <View
                  key={message.id}
                  style={[
                    styles.chatRow,
                    message.sender === 'me' && styles.chatRowMe,
                    message.sender === 'system' && styles.chatRowSystem
                  ]}
                >
                  {message.sender === 'them' && (
                    <View style={styles.chatAvatarWrap}>
                      {themAvatar ? (
                        renderImage(themAvatar, styles.chatAvatar, 'cover')
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
                    message.sender === 'me' && styles.chatBubbleMe,
                    message.sender === 'system' && styles.chatBubbleSystem,
                    {maxWidth: chatBubbleMaxWidth}
                  ]}
                >
                  {message.sender === 'them' && message.senderName && (
                    <Text style={styles.chatSenderName}>
                      {message.senderName}
                    </Text>
                  )}
                  <Text
                    style={[
                      styles.chatBubbleText,
                      message.sender === 'me' && styles.chatBubbleTextMe,
                      message.sender === 'system' && styles.chatBubbleTextSystem
                    ]}
                  >
                    {message.text}
                  </Text>
                  <Text style={styles.chatTimestamp}>{message.timestamp}</Text>
                </View>
                  {message.sender === 'me' && (
                    <View style={styles.chatAvatarWrapMe}>
                      {userProfile?.profile_picture_url ? (
                        renderImage(
                          {uri: userProfile.profile_picture_url},
                          styles.chatAvatar,
                          'cover'
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

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
          >
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
                <MaterialCommunityIcons
                  name="send"
                  size={18}
                  color="#ffffff"
                />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7FAF9',
    paddingHorizontal: H_PADDING,
    paddingTop: TOP_BAR_PADDING
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SECTION_SPACING
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A'
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6ECE9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconBadge: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2E7D64'
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6ECE9',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
    marginBottom: SECTION_SPACING
  },
  searchInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '500',
    padding: 0
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: V_SPACING
  },
  sectionHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.6,
    marginBottom: V_SPACING
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#9ED6C3',
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginRight: 5,
    borderRadius: 999
  },
  createButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D64'
  },
  createPlus: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D64'
  },
  createModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    paddingHorizontal: H_PADDING
  },
  createModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    width: '100%',
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 10},
    elevation: 4
  },
  createModalScroll: {
    flexGrow: 0
  },
  createModalContent: {
    paddingBottom: 4
  },
  createModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14
  },
  createModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A'
  },
  createModalClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  createLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6
  },
  createInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 14
  },
  imageUploadSection: {
    marginBottom: 16
  },
  imageUploadBox: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  imagePreview: {
    width: '100%',
    height: '100%'
  },
  imageUploadText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 8
  },
  createModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12
  },
  createCancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center'
  },
  createCancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B'
  },
  createSubmitButton: {
    flex: 1,
    backgroundColor: '#2E7D64',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center'
  },
  createSubmitText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  imagePlaceholder: {
    backgroundColor: '#E5E7EB'
  },
  suggestedRow: {
    flexDirection: 'row',
    paddingRight: H_PADDING,
    gap: 12,
    marginBottom: SECTION_SPACING
  },
  communityCard: {
    width: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E6ECE9',
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 6},
    elevation: 2
  },
  communityImage: {
    height: 90,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
    backgroundColor: '#E2E8F0'
  },
  communityImageFill: {
    width: '100%',
    height: '100%'
  },
  communityName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A'
  },
  communityCreator: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2
  },
  communityMembers: {
    fontSize: 10,
    color: '#94A3B8',
    marginBottom: 10
  },
  joinButton: {
    backgroundColor: '#2E7D64',
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center'
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600'
  },
  joinedButton: {
    backgroundColor: '#E2E8F0',
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center'
  },
  joinedButtonText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600'
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: SECTION_SPACING,
    borderWidth: 1,
    borderColor: '#E6ECE9',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 1
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10
  },
  listAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 10,
    position: 'relative'
  },
  listAvatarImage: {
    width: '100%',
    height: '100%'
  },
  listTextWrap: {
    flex: 1
  },
  listTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A'
  },
  listSubtitle: {
    fontSize: 11,
    color: '#94A3B8'
  },
  listMeta: {
    fontSize: 10,
    color: '#94A3B8'
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2E7D64',
    borderWidth: 1,
    borderColor: '#ffffff'
  },
  legacyModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'flex-end'
  },
  legacyModalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    height: '95%'
  },
  legacyModalTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: H_PADDING,
    paddingTop: TOP_BAR_PADDING,
    paddingBottom: 8
  },
  tabsTopDivider: {
    height: 1,
    backgroundColor: '#f0f0f0'
  },
  legacyModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginLeft: 6
  },
  legacyBackButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9'
  },
  legacyContainer: {
    backgroundColor: '#ffffff',
    flex: 1
  },
  container: {
    flex: 1,
    backgroundColor: '#F7FAF9'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: H_PADDING,
    paddingTop: TOP_BAR_PADDING,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E6ECE9'
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a'
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D64'
  },
  markAllButton: {
    marginLeft: 'auto'
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: H_PADDING,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E6ECE9',
    gap: 12
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E6ECE9'
  },
  tabActive: {
    backgroundColor: '#2E7D64',
    borderColor: '#2E7D64'
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666'
  },
  tabTextActive: {
    color: '#ffffff'
  },
  notificationsList: {
    flex: 1,
    paddingHorizontal: H_PADDING,
    paddingTop: SECTION_SPACING
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#888888',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  notificationCard: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6ECE9',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
    alignItems: 'center',
    position: 'relative'
  },
  notificationCardRead: {
    backgroundColor: '#F8FBFA',
    shadowOpacity: 0.02,
    elevation: 1
  },
  avatarWrapper: {
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  avatarBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#9ED6C3',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2E7D64',
    position: 'absolute',
    top: 12,
    right: 12,
    borderWidth: 2,
    borderColor: '#ffffff'
  },
  notificationContent: {
    flex: 1,
    justifyContent: 'center'
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4
  },
  notificationMessage: {
    fontSize: 13,
    fontWeight: '400',
    color: '#555555',
    marginBottom: 6,
    lineHeight: 18
  },
  notificationTime: {
    fontSize: 12,
    fontWeight: '500',
    color: '#999999'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8'
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    color: '#EF4444'
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2E7D64',
    marginLeft: 12,
    alignSelf: 'center'
  },
  chatModal: {
    flex: 1,
    backgroundColor: '#F7FAF9'
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: H_PADDING,
    paddingTop: TOP_BAR_PADDING,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E6ECE9',
    backgroundColor: '#F7FAF9'
  },
  chatHeaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20
  },
  chatBackButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6ECE9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  chatHeaderText: {
    flex: 1
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A'
  },
  chatSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2
  },
  chatMessages: {
    flex: 1
  },
  chatMessagesContent: {
    paddingHorizontal: H_PADDING,
    paddingTop: SECTION_SPACING,
    paddingBottom: Math.max(24, SECTION_SPACING + 8),
    gap: 10
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    width: '100%'
  },
  chatRowMe: {
    justifyContent: 'flex-end'
  },
  chatRowSystem: {
    justifyContent: 'center'
  },
  chatAvatarWrap: {
    width: 28,
    alignItems: 'center'
  },
  chatAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14
  },
  chatAvatarFallback: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  chatBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6ECE9',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: '80%'
  },
  chatBubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: '#2E7D64',
    borderColor: '#2E7D64'
  },
  chatBubbleSystem: {
    alignSelf: 'center',
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0'
  },
  chatBubbleText: {
    fontSize: 13,
    color: '#0F172A'
  },
  chatSenderName: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2
  },
  chatBubbleTextMe: {
    color: '#ffffff'
  },
  chatBubbleTextSystem: {
    color: '#475569'
  },
  chatTimestamp: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4
  },
  chatComposer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: H_PADDING,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 16 : 12,
    borderTopWidth: 1,
    borderTopColor: '#E6ECE9',
    backgroundColor: '#FFFFFF',
    gap: 10
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E6ECE9',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A'
  },
  chatSendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2E7D64',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
