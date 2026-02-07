import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useRevenueCatSubscription} from '@/hooks/use-revenuecat-subscription';
import {useRouter} from 'expo-router';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const question = {
  title: 'How do I fix wiring issues in my van?',
  user: 'VanLifeNewbie',
  timestamp: '2h ago'
};

const answer = {
  user: 'John Elemor',
  timestamp: '1h ago',
  text: 'Check your fuse box first, then trace the wiring harness. Look for loose terminals, heat discoloration, or frayed runs. Test continuity at each segment and re-crimp any weak connections.'
};

const comments = [
  {
    id: 'c1',
    user: 'DIYer',
    timestamp: '50m ago',
    text: 'This worked for me too!'
  },
  {
    id: 'c2',
    user: 'Nomad123',
    timestamp: '35m ago',
    text: 'Any tips for solar setups?',
    replies: [
      {
        id: 'c2-1',
        user: 'BuilderPro',
        verified: true,
        timestamp: '30m ago',
        text: 'Yes, start with a clean panel layout, then size your controller for peak amps and leave room for expansion.'
      }
    ]
  }
];

const getInitials = (name: string) =>
  name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

function Avatar({name}: {name: string}) {
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{getInitials(name)}</Text>
    </View>
  );
}

function MetaRow({
  name,
  timestamp,
  verified
}: {
  name: string;
  timestamp: string;
  verified?: boolean;
}) {
  return (
    <View style={styles.metaRow}>
      <Avatar name={name} />
      <View style={styles.metaTextWrap}>
        <View style={styles.metaNameRow}>
          <Text style={styles.metaName}>@{name}</Text>
          {verified ? (
            <View style={styles.verifiedBadge}>
              <MaterialCommunityIcons
                name="check-decagram"
                size={12}
                color="#0F5132"
              />
              <Text style={styles.verifiedText}>Verified Builder</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.metaTimestamp}>{timestamp}</Text>
      </View>
    </View>
  );
}

function CommentItem({
  name,
  timestamp,
  text,
  verified,
  level = 0
}: {
  name: string;
  timestamp: string;
  text: string;
  verified?: boolean;
  level?: number;
}) {
  return (
    <View
      style={[
        styles.commentCard,
        level > 0 ? styles.commentNested : null
      ]}
    >
      <MetaRow name={name} timestamp={timestamp} verified={verified} />
      <Text style={styles.commentText}>{text}</Text>
      <View style={styles.commentActions}>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialCommunityIcons name="arrow-up" size={16} color="#64748b" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialCommunityIcons
            name="arrow-down"
            size={16}
            color="#64748b"
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialCommunityIcons name="reply" size={16} color="#64748b" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function TroubleshootingQAScreen() {
  const router = useRouter();
  const {isSubscribed} = useRevenueCatSubscription();
  const canComment = isSubscribed;

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
        <Text style={styles.headerTitle}>Troubleshooting Q&A</Text>
        <View style={styles.topBarSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.questionCard}>
          <Text style={styles.questionTitle}>{question.title}</Text>
          <MetaRow
            name={question.user}
            timestamp={question.timestamp}
          />
        </View>

        <View style={styles.answerCard}>
          <MetaRow
            name={answer.user}
            timestamp={answer.timestamp}
            verified
          />
          <Text style={styles.answerText}>{answer.text}</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Comments</Text>
          <Text style={styles.sectionSubtitle}>Threaded replies</Text>
        </View>

        <View style={styles.commentsShell}>
          <ScrollView
            style={styles.commentsScroll}
            contentContainerStyle={styles.commentsContent}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >
            {comments.map(comment => (
              <View key={comment.id} style={styles.commentGroup}>
                <CommentItem
                  name={comment.user}
                  timestamp={comment.timestamp}
                  text={comment.text}
                />
                {comment.replies?.map(reply => (
                  <CommentItem
                    key={reply.id}
                    name={reply.user}
                    timestamp={reply.timestamp}
                    text={reply.text}
                    verified={reply.verified}
                    level={1}
                  />
                ))}
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.composerCard}>
          {canComment ? (
            <>
              <Text style={styles.composerTitle}>Add Comment</Text>
              <TextInput
                placeholder="Share a fix or ask a follow-up"
                placeholderTextColor="#94A3B8"
                style={styles.composerInput}
                multiline
              />
              <TouchableOpacity style={styles.composerButton}>
                <Text style={styles.composerButtonText}>Post Comment</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.lockRow}>
                <MaterialCommunityIcons
                  name="lock"
                  size={18}
                  color="#64748b"
                />
                <Text style={styles.lockTitle}>Verified builders only</Text>
              </View>
              <Text style={styles.lockSubtitle}>
                Verification keeps troubleshooting advice accurate and safe.
              </Text>
              <TouchableOpacity style={styles.verifyButton}>
                <Text style={styles.verifyButtonText}>Verify to Comment</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8'
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
    paddingBottom: 28,
    gap: 16
  },
  questionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 2
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12
  },
  answerCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    shadowColor: '#14532D',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: {width: 0, height: 8},
    elevation: 3
  },
  answerText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#0F172A',
    marginTop: 12
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  metaTextWrap: {
    flex: 1
  },
  metaNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap'
  },
  metaName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A'
  },
  metaTimestamp: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    fontSize: 12,
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
  verifiedText: {
    fontSize: 10,
    color: '#0F5132',
    fontWeight: '700'
  },
  sectionHeader: {
    marginTop: 4
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A'
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4
  },
  commentsShell: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 2
  },
  commentsScroll: {
    maxHeight: 320
  },
  commentsContent: {
    paddingHorizontal: 14,
    paddingBottom: 10,
    gap: 12
  },
  commentGroup: {
    gap: 10
  },
  commentCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  commentNested: {
    marginLeft: 22,
    borderLeftWidth: 2,
    borderLeftColor: '#CBD5F5',
    paddingLeft: 12,
    backgroundColor: '#F1F5F9'
  },
  commentText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    color: '#334155'
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E2E8F0'
  },
  composerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 2
  },
  composerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10
  },
  composerInput: {
    minHeight: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5F5',
    padding: 12,
    fontSize: 13,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    textAlignVertical: 'top'
  },
  composerButton: {
    marginTop: 12,
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center'
  },
  composerButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13
  },
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  lockTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A'
  },
  lockSubtitle: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 17,
    marginBottom: 12
  },
  verifyButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center'
  },
  verifyButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13
  }
});
