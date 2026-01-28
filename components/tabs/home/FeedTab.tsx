import {MaterialCommunityIcons} from '@expo/vector-icons';
import {Text, View} from 'react-native';
import {feedTabStyles as styles} from '@/styles';

export default function FeedTab() {
  return (
    <View style={styles.tabContent}>
      <Text style={styles.tabContentTitle}>Feed</Text>
      {/* Sample Feed Post */}
      <View style={styles.feedPost}>
        <Text style={styles.feedPostText}>
          Hosted a small bonfire last night with @nomad_ben and @chloe_travels.
          Loving the community here.
        </Text>
        <View style={styles.feedPostActions}>
          <View style={styles.feedAction}>
            <MaterialCommunityIcons name="heart" size={18} color="#6B7280" />
            <Text style={styles.feedActionText}>19</Text>
          </View>
          <View style={styles.feedAction}>
            <MaterialCommunityIcons
              name="comment-outline"
              size={18}
              color="#6B7280"
            />
            <Text style={styles.feedActionText}>42</Text>
          </View>
          <View style={styles.feedAction}>
            <MaterialCommunityIcons
              name="share-outline"
              size={18}
              color="#6B7280"
            />
            <Text style={styles.feedActionText}>12</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
