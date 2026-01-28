import {MaterialCommunityIcons} from '@expo/vector-icons';
import {Text, View} from 'react-native';
import {findMatchTabStyles as styles} from '@/styles';

export default function FindMatchTab() {
  return (
    <View style={styles.tabContent}>
      <Text style={styles.tabContentTitle}>Find Match</Text>
      <View style={styles.emptyState}>
        <MaterialCommunityIcons
          name="account-search"
          size={48}
          color="#D1D5DB"
        />
        <Text style={styles.emptyText}>Find your travel match</Text>
        <Text style={styles.emptySubtext}>
          Discover nomads with similar interests
        </Text>
      </View>
    </View>
  );
}
