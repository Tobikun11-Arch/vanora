import {MaterialCommunityIcons} from '@expo/vector-icons';
import {Image, ScrollView, StyleSheet, Text, View} from 'react-native';

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

export default function HomeTab({profile}: HomeTabProps) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back! 👋</Text>
          <Text style={styles.subtitle}>
            Explore and connect with fellow nomads
          </Text>
        </View>
        {profile.profile_picture_url ? (
          <Image
            source={{uri: profile.profile_picture_url}}
            style={styles.avatarSmall}
          />
        ) : (
          <View style={[styles.avatarSmall, styles.placeholderAvatar]}>
            <MaterialCommunityIcons name="account" size={20} color="#9CA3AF" />
          </View>
        )}
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons
            name="account-group"
            size={28}
            color="#4a90e2"
          />
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Connections</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons
            name="map-marker-radius"
            size={28}
            color="#10B981"
          />
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Nearby</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons
            name="message-text"
            size={28}
            color="#F59E0B"
          />
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Messages</Text>
        </View>
      </View>

      {/* Current Location Card */}
      <View style={styles.locationCard}>
        <View style={styles.locationHeader}>
          <MaterialCommunityIcons name="map-marker" size={24} color="#EF4444" />
          <Text style={styles.locationTitle}>Current Location</Text>
        </View>
        <Text style={styles.locationText}>{profile.current_location}</Text>
        <Text style={styles.nomadType}>
          {profile.nomad_type} • {profile.travel_style}
        </Text>
      </View>

      {/* Activity Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="compass-outline"
            size={48}
            color="#D1D5DB"
          />
          <Text style={styles.emptyText}>No recent activity</Text>
          <Text style={styles.emptySubtext}>
            Start exploring to see activity here
          </Text>
        </View>
      </View>

      {/* Nearby Nomads Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nearby Nomads</Text>
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="account-search"
            size={48}
            color="#D1D5DB"
          />
          <Text style={styles.emptyText}>No nomads nearby</Text>
          <Text style={styles.emptySubtext}>
            Check back later for fellow travelers
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  scrollContent: {
    paddingBottom: 40
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#fff'
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937'
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4
  },
  avatarSmall: {
    width: 44,
    height: 44,
    borderRadius: 22
  },
  placeholderAvatar: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: '#fff',
    marginBottom: 12
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4
  },
  locationCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937'
  },
  locationText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4
  },
  nomadType: {
    fontSize: 14,
    color: '#6B7280'
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16
  },
  emptyState: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 12
  },
  emptySubtext: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4
  }
});
