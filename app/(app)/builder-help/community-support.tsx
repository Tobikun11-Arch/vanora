import {posts} from "@/features/app/builder-help/community-support/data";
import {styles} from "@/features/app/builder-help/community-support/style";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const getInitials = (name: string) =>
  name
    .replace("@", "")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function Avatar({name, size = 34}: {name: string; size?: number}) {
  return (
    <View
      style={[
        styles.avatar,
        {width: size, height: size, borderRadius: size / 2},
      ]}
    >
      <Text style={styles.avatarText}>{getInitials(name)}</Text>
    </View>
  );
}

function VerifiedBadge() {
  return (
    <View style={styles.verifiedBadge}>
      <MaterialCommunityIcons name="check-decagram" size={12} color="#0F5132" />
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
          {posts.map((post) => (
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
                  &quot;{post.verifiedReply.text}&quot;
                </Text>
              </View>

              <View style={styles.commentsHeader}>
                <Text style={styles.commentsTitle}>Comments</Text>
                <Text style={styles.commentsCount}>
                  {post.comments.length} replies
                </Text>
              </View>

              <View style={styles.commentsList}>
                {post.comments.map((comment) => (
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
                          {comment.replies.map((reply) => (
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
