import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useRouter} from 'expo-router';
import React, {useMemo, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const guides = [
  {
    id: 'solar',
    title: 'Installing Solar Panels',
    description:
      'A straightforward guide to mounting, wiring, and testing a solar setup that is safe for long-term travel.',
    author: '@BuilderPro',
    timestamp: '1d ago',
    verified: true,
    steps: [
      'Mount brackets securely and seal all penetrations.',
      'Connect wiring harness and route cables cleanly.',
      'Test voltage output before final tie-down.'
    ],
    tips: [
      'Use anti-corrosion paste on terminals in humid climates.',
      'Leave service loops for future maintenance.'
    ],
    comments: [
      {
        id: 'c1',
        user: '@Nomad123',
        timestamp: '6h ago',
        text: 'Worked perfectly, thanks!',
        replies: []
      },
      {
        id: 'c2',
        user: '@DIYer',
        timestamp: '4h ago',
        text: 'Any tips for smaller vans?',
        replies: [
          {
            id: 'c2-1',
            user: '@BuilderPro',
            timestamp: '2h ago',
            verified: true,
            text: 'Use flexible panels for tight spaces.'
          }
        ]
      }
    ]
  },
  {
    id: 'insulation',
    title: 'Choosing Insulation Materials',
    description:
      'Compare foam, wool, and polyiso with real-world moisture and weight tradeoffs.',
    author: '@BuildCraft',
    timestamp: '3d ago',
    verified: false,
    steps: [
      'Measure cavities and note condensation risk zones.',
      'Choose a primary insulation and seal vapor gaps.',
      'Install acoustic layers where panels resonate.'
    ],
    tips: [
      'Closed-cell foam resists moisture better than fibrous options.'
    ],
    comments: [
      {
        id: 'c3',
        user: '@TrailBuilt',
        timestamp: '1d ago',
        text: 'Really helpful for planning my budget.',
        replies: []
      }
    ]
  },
  {
    id: 'water',
    title: 'Water System Plumbing',
    description:
      'Step-by-step guide to sizing tanks, routing hoses, and pressure testing.',
    author: '@PipeSensei',
    timestamp: '5d ago',
    verified: true,
    steps: [
      'Fit tanks with proper supports and straps.',
      'Route hoses with smooth bends to reduce leaks.',
      'Pressurize and check fittings for drips.'
    ],
    tips: ['Install shutoff valves near each major fixture.'],
    comments: []
  }
];

const getInitials = (name: string) =>
  name
    .replace('@', '')
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

function Avatar({name, size = 32}: {name: string; size?: number}) {
  return (
    <View style={[styles.avatar, {width: size, height: size, borderRadius: size / 2}]}>
      <Text style={styles.avatarText}>{getInitials(name)}</Text>
    </View>
  );
}

function VerifiedBadge() {
  return (
    <View style={styles.verifiedBadge}>
      <MaterialCommunityIcons
        name="check-decagram"
        size={12}
        color="#0F5132"
      />
      <Text style={styles.verifiedBadgeText}>Verified Builder</Text>
    </View>
  );
}

export default function BuildGuidesScreen() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(guides[0]?.id ?? '');

  const selectedGuide = useMemo(
    () => guides.find(guide => guide.id === selectedId) ?? guides[0],
    [selectedId]
  );

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
        <Text style={styles.headerTitle}>Build Guides</Text>
        <View style={styles.topBarSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Builder-approved guides with steps, diagrams, and community Q&A.
        </Text>

        <View style={styles.guideList}>
          {guides.map(guide => (
            <TouchableOpacity
              key={guide.id}
              style={[
                styles.card,
                selectedId === guide.id ? styles.cardActive : null
              ]}
              onPress={() => setSelectedId(guide.id)}
              activeOpacity={0.9}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{guide.title}</Text>
                {guide.verified ? <VerifiedBadge /> : null}
              </View>
              <Text style={styles.cardDescription}>{guide.description}</Text>
              <View style={styles.metaRow}>
                <Avatar name={guide.author} size={26} />
                <Text style={styles.metaUser}>{guide.author}</Text>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.metaTime}>{guide.timestamp}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {selectedGuide ? (
          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>{selectedGuide.title}</Text>
            <View style={styles.detailMetaRow}>
              <Avatar name={selectedGuide.author} size={28} />
              <Text style={styles.metaUser}>{selectedGuide.author}</Text>
              {selectedGuide.verified ? <VerifiedBadge /> : null}
              <Text style={styles.metaTime}>{selectedGuide.timestamp}</Text>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Step-by-Step</Text>
              <Text style={styles.sectionSubtitle}>Checklist style</Text>
            </View>
            <View style={styles.stepsList}>
              {selectedGuide.steps.map((step, index) => (
                <View key={step} style={styles.stepRow}>
                  <View style={styles.stepIndex}>
                    <Text style={styles.stepIndexText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>

            <View style={styles.tipCard}>
              <View style={styles.tipHeader}>
                <MaterialCommunityIcons
                  name="star-four-points"
                  size={14}
                  color="#7C2D12"
                />
                <Text style={styles.tipTitle}>Verified Builder Tips</Text>
              </View>
              {selectedGuide.tips.map(tip => (
                <Text key={tip} style={styles.tipText}>
                  {tip}
                </Text>
              ))}
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Comments</Text>
              <Text style={styles.sectionSubtitle}>Threaded replies</Text>
            </View>

            <View style={styles.commentsList}>
              {selectedGuide.comments.length === 0 ? (
                <Text style={styles.emptyText}>
                  No comments yet. Ask a clarifying question.
                </Text>
              ) : (
                selectedGuide.comments.map(comment => (
                  <View key={comment.id} style={styles.commentRow}>
                    <Avatar name={comment.user} size={26} />
                    <View style={styles.commentBody}>
                      <View style={styles.commentMeta}>
                        <Text style={styles.commentUser}>{comment.user}</Text>
                        <Text style={styles.commentTime}>
                          {comment.timestamp}
                        </Text>
                      </View>
                      <Text style={styles.commentText}>{comment.text}</Text>

                      {comment.replies.length > 0 ? (
                        <View style={styles.replyList}>
                          {comment.replies.map(reply => (
                            <View key={reply.id} style={styles.replyRow}>
                              <Avatar name={reply.user} size={22} />
                              <View style={styles.commentBody}>
                                <View style={styles.commentMeta}>
                                  <Text style={styles.commentUser}>
                                    {reply.user}
                                  </Text>
                                  {reply.verified ? <VerifiedBadge /> : null}
                                  <Text style={styles.commentTime}>
                                    {reply.timestamp}
                                  </Text>
                                </View>
                                <Text style={styles.commentText}>
                                  {reply.text}
                                </Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      ) : null}
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        ) : null}
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
  guideList: {
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
  cardActive: {
    borderColor: '#93C5FD',
    shadowColor: '#1D4ED8',
    shadowOpacity: 0.1
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a'
  },
  cardDescription: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
    marginBottom: 10
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  metaUser: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a'
  },
  metaDot: {
    fontSize: 12,
    color: '#94A3B8'
  },
  metaTime: {
    fontSize: 11,
    color: '#94A3B8'
  },
  avatar: {
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569'
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#D1FAE5',
    borderRadius: 999
  },
  verifiedBadgeText: {
    fontSize: 10,
    color: '#0F5132',
    fontWeight: '700'
  },
  detailCard: {
    marginTop: 18,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 8},
    elevation: 2
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8
  },
  detailMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12
  },
  sectionHeader: {
    marginTop: 10,
    marginBottom: 8
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a'
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2
  },
  stepsList: {
    gap: 10
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10
  },
  stepIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0ECFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepIndexText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8'
  },
  stepText: {
    flex: 1,
    fontSize: 12,
    color: '#334155',
    lineHeight: 18
  },
  tipCard: {
    marginTop: 14,
    backgroundColor: '#FFF7ED',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FED7AA'
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6
  },
  tipTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C2D12'
  },
  tipText: {
    fontSize: 12,
    color: '#7C2D12',
    lineHeight: 17
  },
  commentsList: {
    gap: 12
  },
  emptyText: {
    fontSize: 12,
    color: '#94A3B8'
  },
  commentRow: {
    flexDirection: 'row',
    gap: 10
  },
  commentBody: {
    flex: 1
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
    flexWrap: 'wrap'
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
  }
});
