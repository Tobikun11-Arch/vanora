import {MaterialCommunityIcons} from '@expo/vector-icons';
import {Text, View} from 'react-native';
import {eventsTabStyles as styles} from '@/styles';

export default function EventsTab() {
  return (
    <View style={styles.tabContent}>
      <Text style={styles.tabContentTitle}>Events</Text>
      <View style={styles.emptyState}>
        <MaterialCommunityIcons
          name="calendar-blank"
          size={48}
          color="#D1D5DB"
        />
        <Text style={styles.emptyText}>No upcoming events</Text>
        <Text style={styles.emptySubtext}>Check back for community events</Text>
      </View>
    </View>
  );
}
