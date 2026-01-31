import {showToast} from '@/components/Toast';
import {supabase} from '@/services/supabase';
import {useUserStore} from '@/store/userStore';
import {useEffect, useState} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userProfile = useUserStore(state => state.profile);
  const [activeTab, setActiveTab] = useState('all');
  const promoSeedDate = new Date();
  promoSeedDate.setDate(promoSeedDate.getDate() - 1);
  promoSeedDate.setHours(9, 0, 0, 0);
  const promoCreatedAt = promoSeedDate.toISOString();
  const welcomeCreatedAt = new Date(promoSeedDate.getTime() - 2 * 60 * 60 * 1000).toISOString();
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

        const fetched = data || [];
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
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

      {/* Notifications List */}
      <ScrollView
        style={styles.notificationsList}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Recent</Text>

        {loading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Loading notifications...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No notifications yet.</Text>
          </View>
        ) : (
          notifications.map(notification => {
            const actorName =
              notification.actor?.display_name ||
              notification.actor?.username ||
              'Vanora';
            const avatarSource = notification.actor?.profile_picture_url
              ? {uri: notification.actor.profile_picture_url}
              : require('../../assets/images/vanora.png');

            return (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationCard,
                  notification.read_at && styles.notificationCardRead
                ]}
                onPress={() => {
                  if (notification.read_at) return;
                  const now = new Date().toISOString();
                  setNotifications(prev =>
                    prev.map(n =>
                      n.id === notification.id ? {...n, read_at: now} : n
                    )
                  );
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

                {!notification.read_at && <View style={styles.statusIndicator} />}
              </TouchableOpacity>
            );
          })
        )}
        {error && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
    color: '#1dd1a1'
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
    backgroundColor: '#1dd1a1'
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
    backgroundColor: '#1dd1a1',
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
    backgroundColor: '#1dd1a1',
    marginLeft: 12,
    alignSelf: 'center'
  }
});
