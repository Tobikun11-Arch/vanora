import {showToast} from '@/components/Toast';
import {supabase} from '@/services/supabase';
import {useUserStore} from '@/store/userStore';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {useEffect, useState} from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

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

export default function NotificationsTab() {
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

  const [joinedCommunities, setJoinedCommunities] = useState([
    {
      name: 'Stealth Camping Elites',
      subtitle: '4 new posts today',
      image: require('../../assets/images/duo_camper.jpg')
    },
    {
      name: 'Mountain Wanderer Hub',
      subtitle: 'Up to date',
      image: require('../../assets/images/solar_van.jpg')
    }
  ]);

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
      if (asset?.uri) {
        setCommunityImageUri(asset.uri);
      }
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
        image: {uri: communityImageUri}
      },
      ...prev
    ]);
    resetCreateCommunityForm();
    setShowCreateCommunityModal(false);
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
                  <Image source={avatarSource} style={styles.avatar} />
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
        <Text style={styles.pageTitle}>Notifications</Text>
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
        />
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
          {[
            {
              name: 'VanLifer Creator',
              members: '12.4k',
              creator: 'by Vanora Team',
              image: require('../../assets/images/cozy_van.jpg')
            },
            {
              name: 'Nomadcom',
              members: '8.9k',
              creator: 'by Nomadcom',
              image: require('../../assets/images/solo_camper.jpg')
            },
            {
              name: 'Campfire Stories',
              members: '6.2k',
              creator: 'by Jesse R.',
              image: require('../../assets/images/stones.jpg')
            }
          ].map(item => (
            <View key={item.name} style={styles.communityCard}>
              <View style={styles.communityImage}>
                <Image
                  source={item.image}
                  style={styles.communityImageFill}
                />
              </View>
              <Text style={styles.communityName}>{item.name}</Text>
              <Text style={styles.communityCreator}>{item.creator}</Text>
              <Text style={styles.communityMembers}>{item.members}</Text>
              <TouchableOpacity style={styles.joinButton}>
                <Text style={styles.joinButtonText}>Join</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <Text style={styles.sectionHeaderText}>JOINED COMMUNITIES</Text>
        <View style={styles.listCard}>
          {joinedCommunities.map(item => (
            <View key={item.name} style={styles.listItem}>
              <View style={styles.listAvatar}>
                <Image
                  source={item.image}
                  style={styles.listAvatarImage}
                />
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
            </View>
          ))}
        </View>

        <Text style={styles.sectionHeaderText}>PRIVATE MESSAGES</Text>
        <View style={styles.listCard}>
          {[
            {
              name: "Ben Jammin'",
              subtitle:
                'Hey! Did you find that water fill station near the... ',
              time: '2m ago',
              online: true,
              image: require('../../assets/images/theo.jpg')
            },
            {
              name: 'Chloe Brooks',
              subtitle: 'Sent you a photo',
              time: '1h ago',
              online: true,
              image: require('../../assets/images/aria.jpg')
            },
            {
              name: 'Liam Nomad',
              subtitle: 'That build looks incredible. How many watts is th...',
              time: 'Yesterday',
              online: false,
              image: require('../../assets/images/Noah.jpg')
            },
            {
              name: 'Sarah Wanderlust',
              subtitle: 'The meet-up next Saturday is still on! See you...',
              time: 'Tue',
              online: false,
              image: require('../../assets/images/featured_news.jpg')
            }
          ].map(item => (
            <View key={item.name} style={styles.listItem}>
              <View style={styles.listAvatar}>
                <Image
                  source={item.image}
                  style={styles.listAvatarImage}
                />
                {item.online && <View style={styles.onlineDot} />}
              </View>
              <View style={styles.listTextWrap}>
                <Text style={styles.listTitle}>{item.name}</Text>
                <Text style={styles.listSubtitle} numberOfLines={1}>
                  {item.subtitle}
                </Text>
              </View>
              <Text style={styles.listMeta}>{item.time}</Text>
            </View>
          ))}
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

            <Text style={styles.createLabel}>Community name</Text>
            <TextInput
              style={styles.createInput}
              placeholder="e.g. Weekend Van Builders"
              placeholderTextColor="#94A3B8"
              value={newCommunityName}
              onChangeText={setNewCommunityName}
              maxLength={40}
            />

            <Text style={styles.createLabel}>Pick a photo</Text>
            <TouchableOpacity
              style={styles.photoPickerButton}
              onPress={handlePickCommunityImage}
            >
              <MaterialCommunityIcons
                name="image-plus"
                size={18}
                color="#2E7D64"
              />
              <Text style={styles.photoPickerText}>
                {communityImageUri ? 'Change photo' : 'Choose photo'}
              </Text>
            </TouchableOpacity>
            {communityImageUri && (
              <View style={styles.photoPreview}>
                <Image
                  source={{uri: communityImageUri}}
                  style={styles.photoPreviewImage}
                />
              </View>
            )}

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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    paddingTop: 48
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A'
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
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
    backgroundColor: '#F1F5F9',
    marginBottom: 16
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
    marginBottom: 8
  },
  sectionHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.6,
    marginBottom: 8
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2E7D64',
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
    paddingHorizontal: 20
  },
  createModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 10},
    elevation: 4
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
  photoPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#2E7D64',
    borderRadius: 12,
    paddingVertical: 10,
    justifyContent: 'center',
    marginBottom: 12
  },
  photoPickerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D64'
  },
  photoPreview: {
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    marginBottom: 18
  },
  photoPreviewImage: {
    width: '100%',
    height: '100%'
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
  suggestedRow: {
    flexDirection: 'row',
    paddingRight: 18,
    gap: 12,
    marginBottom: 16
  },
  communityCard: {
    width: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 10,
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
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 16,
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
    paddingHorizontal: 16,
    paddingTop: 16,
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
    backgroundColor: '#ffffff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5'
  },
  tabActive: {
    backgroundColor: '#2E7D64'
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
    paddingHorizontal: 20,
    paddingTop: 16
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
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    position: 'relative'
  },
  notificationCardRead: {
    backgroundColor: '#ffffff'
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
    backgroundColor: '#f0f0f0',
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
  }
});
