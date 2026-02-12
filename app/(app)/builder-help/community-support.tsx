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

const posts = [
  {
    id: 'p1',
    title: 'Feeling stuck on insulation choices.',
    body: 'I keep bouncing between foam and wool. Any real-world tips?',
    user: '@VanLifeNewbie',
    timestamp: '3h ago',
    verifiedReply: {
      user: '@BuilderPro',
      timestamp: '2h ago',
      text: 'Go with closed-cell foam for moisture resistance.'
    },
    comments: [
      {
        id: 'c1',
        user: '@Nomad123',
        timestamp: '2h ago',
        text: 'I used wool, works fine!',
        likes: 12,
        replies: [
          {
            id: 'c1-1',
            user: '@BuilderPro',
            timestamp: '90m ago',
            text: 'Wool is comfy, just watch moisture barriers.',
            likes: 4
          }
        ]
      },
      {
        id: 'c2',
        user: '@DIYer',
        timestamp: '1h ago',
        text: 'Foam is easier to install.',
        likes: 7,
        replies: []
      }
    ]
  },
  {
    id: 'p2',
    title: 'Need help routing wiring for lights.',
    body: 'Any tips to avoid sagging runs over time?',
    user: '@TrailBuilt',
    timestamp: '5h ago',
    verifiedReply: {
      user: '@WireGuru',
      timestamp: '4h ago',
      text: 'Hang in there, wiring issues are common. Here’s a checklist.'
    },
    comments: [
      {
        id: 'c3',
        user: '@RangerBuilt',
        timestamp: '4h ago',
        text: 'Use adhesive mounts every 10-12 inches.',
        likes: 9,
        replies: []
      }
    ]
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

function Avatar({name, size = 34}: {name: string; size?: number}) {
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

export default function CommunitySupportScreen() {
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
        <Text style={styles.headerTitle}>Community Support</Text>
        <View style={styles.topBarSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Warm community guidance, verified answers, and supportive threads.
        </Text>

        <View style={styles.feed}>
          {posts.map(post => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <Avatar name={post.user} />
                <View style={styles.postHeaderText}>
                  <Text style={styles.postUser}>{post.user}</Text>
                  <Text style={styles.postTime}>{post.timestamp}</Text>
                </View>
              </View>

              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postBody}>{post.body}</Text>

              <View style={styles.verifiedReply}>
                <View style={styles.verifiedHeader}>
                  <Avatar name={post.verifiedReply.user} size={28} />
                  <View style={styles.verifiedHeaderText}>
                    <View style={styles.verifiedNameRow}>
                      <Text style={styles.verifiedUser}>
                        {post.verifiedReply.user}
                      </Text>
                      <VerifiedBadge />
                    </View>
                    <Text style={styles.verifiedTime}>
                      {post.verifiedReply.timestamp}
                    </Text>
                  </View>
                </View>
                <Text style={styles.verifiedText}>
                  "{post.verifiedReply.text}"
                </Text>
              </View>

              <View style={styles.commentsHeader}>
                <Text style={styles.commentsTitle}>Comments</Text>
                <Text style={styles.commentsCount}>
                  {post.comments.length} replies
                </Text>
              </View>

              <View style={styles.commentsList}>
                {post.comments.map(comment => (
                  <View key={comment.id} style={styles.commentRow}>
                    <Avatar name={comment.user} size={28} />
                    <View style={styles.commentBody}>
                      <View style={styles.commentMeta}>
                        <Text style={styles.commentUser}>{comment.user}</Text>
                        <Text style={styles.commentTime}>
                          {comment.timestamp}
                        </Text>
                      </View>
                      <Text style={styles.commentText}>{comment.text}</Text>
                      <View style={styles.commentActions}>
                        <TouchableOpacity style={styles.actionButton}>
                          <MaterialCommunityIcons
                            name="arrow-up"
                            size={14}
                            color="#64748b"
                          />
                        </TouchableOpacity>
                        <Text style={styles.likeCount}>{comment.likes}</Text>
                        <TouchableOpacity style={styles.actionButton}>
                          <MaterialCommunityIcons
                            name="reply"
                            size={14}
                            color="#64748b"
                          />
                        </TouchableOpacity>
                      </View>

                      {comment.replies.length > 0 ? (
                        <View style={styles.replyList}>
                          {comment.replies.map(reply => (
                            <View key={reply.id} style={styles.replyRow}>
                              <Avatar name={reply.user} size={24} />
                              <View style={styles.commentBody}>
                                <View style={styles.commentMeta}>
                                  <Text style={styles.commentUser}>
                                    {reply.user}
                                  </Text>
                                  <Text style={styles.commentTime}>
                                    {reply.timestamp}
                                  </Text>
                                </View>
                                <Text style={styles.commentText}>
                                  {reply.text}
                                </Text>
                                <View style={styles.commentActions}>
                                  <TouchableOpacity style={styles.actionButton}>
                                    <MaterialCommunityIcons
                                      name="arrow-up"
                                      size={14}
                                      color="#64748b"
                                    />
                                  </TouchableOpacity>
                                  <Text style={styles.likeCount}>
                                    {reply.likes}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          ))}
                        </View>
                      ) : null}
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
    backgroundColor: '#FDF7F2'
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
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 16
  },
  feed: {
    gap: 16
  },
  postCard: {
    backgroundColor: '#FFF9F5',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F2E8DC',
    shadowColor: '#9A6B4F',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 2
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10
  },
  postHeaderText: {
    flex: 1
  },
  postUser: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937'
  },
  postTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6
  },
  postBody: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18
  },
  verifiedReply: {
    marginTop: 14,
    backgroundColor: '#FFF4E8',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3DCC8'
  },
  verifiedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6
  },
  verifiedHeaderText: {
    flex: 1
  },
  verifiedNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap'
  },
  verifiedUser: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937'
  },
  verifiedTime: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2
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
  verifiedText: {
    fontSize: 12,
    color: '#3F3F46',
    lineHeight: 18
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 8
  },
  commentsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937'
  },
  commentsCount: {
    fontSize: 11,
    color: '#9CA3AF'
  },
  commentsList: {
    gap: 12
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
    marginBottom: 2
  },
  commentUser: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937'
  },
  commentTime: {
    fontSize: 10,
    color: '#9CA3AF'
  },
  commentText: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6
  },
  actionButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9'
  },
  likeCount: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600'
  },
  replyList: {
    marginTop: 10,
    paddingLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#F3DCC8',
    gap: 10
  },
  replyRow: {
    flexDirection: 'row',
    gap: 8
  },
  avatar: {
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280'
  }
});
