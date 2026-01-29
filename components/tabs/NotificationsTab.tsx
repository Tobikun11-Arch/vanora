import {useState} from 'react';
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
  type: 'welcome' | 'premium';
  title: string;
  message: string;
  timestamp: string;
  icon: string;
  read: boolean;
}

export default function NotificationsTab() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'premium',
      title: 'Unlock Premium Features',
      message:
        'Upgrade to Premium to access exclusive features and connect with more travelers worldwide.',
      timestamp: '2m ago',
      icon: '⭐',
      read: false
    },
    {
      id: '2',
      type: 'welcome',
      title: 'Welcome to Vanora!',
      message:
        'Welcome to our community of nomads and travelers. Discover amazing people and experiences around the world.',
      timestamp: '5m ago',
      icon: '🌍',
      read: false
    }
  ]);

  const [activeTab, setActiveTab] = useState('all');

  const handleMarkAllAsRead = () => {
    setNotifications(
      notifications.map(notif => ({
        ...notif,
        read: true
      }))
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
        <Text style={styles.sectionTitle}>Today</Text>

        {notifications.map(notification => (
          <TouchableOpacity
            key={notification.id}
            style={[
              styles.notificationCard,
              notification.read && styles.notificationCardRead
            ]}
            onPress={() => {
              setNotifications(
                notifications.map(n =>
                  n.id === notification.id ? {...n, read: true} : n
                )
              );
            }}
            activeOpacity={0.7}
          >
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarBadge}>
                <Image
                  source={require('../../assets/images/vanora.png')}
                  style={styles.avatar}
                />
              </View>
            </View>

            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>{notification.title}</Text>
              <Text style={styles.notificationMessage} numberOfLines={2}>
                {notification.message}
              </Text>
              <Text style={styles.notificationTime}>
                {notification.timestamp}
              </Text>
            </View>

            {!notification.read && <View style={styles.statusIndicator} />}
          </TouchableOpacity>
        ))}
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
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1dd1a1',
    marginLeft: 12,
    alignSelf: 'center'
  }
});
