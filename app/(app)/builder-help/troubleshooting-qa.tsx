import {
  answer,
  comments,
  question,
} from "@/features/app/builder-help/troubleshooting-qa/data";
import {styles} from "@/features/app/builder-help/troubleshooting-qa/style";
import {useRevenueCatSubscription} from "@/hooks/use-revenuecat-subscription";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
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
  verified,
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
  level = 0,
}: {
  name: string;
  timestamp: string;
  text: string;
  verified?: boolean;
  level?: number;
}) {
  return (
    <View style={[styles.commentCard, level > 0 ? styles.commentNested : null]}>
      <MetaRow name={name} timestamp={timestamp} verified={verified} />
      <Text style={styles.commentText}>{text}</Text>
      <View style={styles.commentActions}>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialCommunityIcons name="arrow-up" size={16} color="#64748b" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialCommunityIcons name="arrow-down" size={16} color="#64748b" />
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
          <MetaRow name={question.user} timestamp={question.timestamp} />
        </View>

        <View style={styles.answerCard}>
          <MetaRow name={answer.user} timestamp={answer.timestamp} verified />
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
            {comments.map((comment) => (
              <View key={comment.id} style={styles.commentGroup}>
                <CommentItem
                  name={comment.user}
                  timestamp={comment.timestamp}
                  text={comment.text}
                />
                {comment.replies?.map((reply) => (
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
                <MaterialCommunityIcons name="lock" size={18} color="#64748b" />
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
