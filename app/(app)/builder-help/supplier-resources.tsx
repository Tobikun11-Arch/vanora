import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useRouter} from 'expo-router';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const suppliers = [
  {
    id: 'solarvan',
    name: 'SolarVan Co.',
    icon: 'solar-power-variant-outline',
    category: 'Solar Panels',
    contact: 'solarvan.com',
    verifiedReview: {
      user: '@BuilderPro',
      text: 'Panels are durable, great for off-grid setups.'
    },
    comments: [
      {
        id: 'c1',
        user: '@Nomad123',
        time: '2h ago',
        text: 'Shipping was fast!',
        replies: [
          {
            id: 'c1-1',
            user: '@BuilderPro',
            time: '1h ago',
            text: 'Agree. They shipped in 3 days for me.'
          }
        ]
      },
      {
        id: 'c2',
        user: '@DIYer',
        time: '5h ago',
        text: 'Any cheaper alternatives?',
        replies: [
          {
            id: 'c2-1',
            user: '@VanLab',
            time: '4h ago',
            text: 'Check SunVolt; slightly less output but affordable.'
          }
        ]
      }
    ]
  },
  {
    id: 'voltcraft',
    name: 'VoltCraft Supply',
    icon: 'flash-outline',
    category: 'Electrical',
    contact: 'voltcraft.io',
    verifiedReview: {
      user: '@WireGuru',
      text: 'I’ve used this supplier for wiring kits, reliable quality.'
    },
    comments: [
      {
        id: 'c3',
        user: '@RangerBuilt',
        time: '1d ago',
        text: 'Their fuse blocks are solid.',
        replies: []
      },
      {
        id: 'c4',
        user: '@Switchback',
        time: '18h ago',
        text: 'Any bulk discount details?',
        replies: [
          {
            id: 'c4-1',
            user: '@WireGuru',
            time: '12h ago',
            text: 'Ask support; they gave 8% off on my last order.'
          }
        ]
      }
    ]
  },
  {
    id: 'timberline',
    name: 'Timberline Works',
    icon: 'hammer-screwdriver',
    category: 'Carpentry',
    contact: 'timberlineworks.com',
    verifiedReview: {
      user: '@BuildCraft',
      text: 'Great hardwood panels and consistent finish.'
    },
    comments: [
      {
        id: 'c5',
        user: '@RoadWood',
        time: '2d ago',
        text: 'Love the walnut options.',
        replies: []
      }
    ]
  }
];

export default function SupplierResourcesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={30}
            color="#111827"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Supplier Resources</Text>
        <View style={styles.topBarSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Verified builder notes and community feedback to help you pick the
          right supplier.
        </Text>

        <View style={styles.list}>
          {suppliers.map(supplier => (
            <View key={supplier.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconWrap}>
                  <MaterialCommunityIcons
                    name={supplier.icon}
                    size={22}
                    color="#2563EB"
                  />
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.cardTitle}>{supplier.name}</Text>
                  <Text style={styles.cardCategory}>{supplier.category}</Text>
                </View>
                <View style={styles.contactWrap}>
                  <Text style={styles.contactLabel}>Contact</Text>
                  <Text style={styles.contactLink}>{supplier.contact}</Text>
                </View>
              </View>

              <View style={styles.verifiedBlock}>
                <View style={styles.verifiedHeader}>
                  <Text style={styles.verifiedTitle}>
                    Verified Builder Review
                  </Text>
                  <View style={styles.verifiedBadge}>
                    <MaterialCommunityIcons
                      name="check-decagram"
                      size={12}
                      color="#0F5132"
                    />
                    <Text style={styles.verifiedText}>Verified Builder</Text>
                  </View>
                </View>
                <Text style={styles.verifiedUser}>{supplier.verifiedReview.user}</Text>
                <Text style={styles.verifiedReviewText}>
                  "{supplier.verifiedReview.text}"
                </Text>
              </View>

              <View style={styles.commentsHeader}>
                <Text style={styles.commentsTitle}>Community Comments</Text>
                <Text style={styles.commentsCount}>
                  {supplier.comments.length} comments
                </Text>
              </View>

              <View style={styles.commentsList}>
                {supplier.comments.map(comment => (
                  <View key={comment.id} style={styles.commentRow}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {comment.user.replace('@', '').slice(0, 2).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.commentBody}>
                      <View style={styles.commentMeta}>
                        <Text style={styles.commentUser}>{comment.user}</Text>
                        <Text style={styles.commentTime}>{comment.time}</Text>
                      </View>
                      <Text style={styles.commentText}>{comment.text}</Text>

                      {comment.replies.length > 0 && (
                        <View style={styles.replyList}>
                          {comment.replies.map(reply => (
                            <View key={reply.id} style={styles.replyRow}>
                              <View style={styles.replyAvatar}>
                                <Text style={styles.replyAvatarText}>
                                  {reply.user
                                    .replace('@', '')
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </Text>
                              </View>
                              <View style={styles.replyBody}>
                                <View style={styles.commentMeta}>
                                  <Text style={styles.commentUser}>
                                    {reply.user}
                                  </Text>
                                  <Text style={styles.commentTime}>
                                    {reply.time}
                                  </Text>
                                </View>
                                <Text style={styles.commentText}>
                                  {reply.text}
                                </Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  topBar: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 20
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#111827'
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center'
  },
  topBarSpacer: {
    width: 44,
    height: 44
  },
  scroll: {
    flex: 1
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 16
  },
  list: {
    gap: 14
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 6},
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0ECFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerText: {
    flex: 1
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a'
  },
  cardCategory: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2
  },
  contactWrap: {
    alignItems: 'flex-end'
  },
  contactLabel: {
    fontSize: 10,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.6
  },
  contactLink: {
    fontSize: 12,
    color: '#2563EB',
    textDecorationLine: 'underline'
  },
  verifiedBlock: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12
  },
  verifiedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  verifiedTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a'
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2
  },
  verifiedText: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '700'
  },
  verifiedUser: {
    fontSize: 12,
    color: '#0f172a',
    fontWeight: '600',
    marginBottom: 2
  },
  verifiedReviewText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  commentsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a'
  },
  commentsCount: {
    fontSize: 11,
    color: '#94A3B8'
  },
  commentsList: {
    gap: 12
  },
  commentRow: {
    flexDirection: 'row',
    gap: 10
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569'
  },
  commentBody: {
    flex: 1
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2
  },
  commentUser: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a'
  },
  commentTime: {
    fontSize: 11,
    color: '#94A3B8'
  },
  commentText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18
  },
  replyList: {
    marginTop: 10,
    paddingLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#E2E8F0',
    gap: 10
  },
  replyRow: {
    flexDirection: 'row',
    gap: 8
  },
  replyAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  replyAvatarText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b'
  },
  replyBody: {
    flex: 1
  }
});
