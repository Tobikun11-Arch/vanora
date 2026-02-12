import {suppliers} from "@/features/app/builder-help/supplier-resource/data";
import {styles} from "@/features/app/builder-help/supplier-resource/style";
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
          {suppliers.map((supplier) => (
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
                <Text style={styles.verifiedUser}>
                  {supplier.verifiedReview.user}
                </Text>
                <Text style={styles.verifiedReviewText}>
                  &ldquo;{supplier.verifiedReview.text}&quot;
                </Text>
              </View>

              <View style={styles.commentsHeader}>
                <Text style={styles.commentsTitle}>Community Comments</Text>
                <Text style={styles.commentsCount}>
                  {supplier.comments.length} comments
                </Text>
              </View>

              <View style={styles.commentsList}>
                {supplier.comments.map((comment) => (
                  <View key={comment.id} style={styles.commentRow}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {comment.user
                          .replace("@", "")
                          .slice(0, 2)
                          .toUpperCase()}
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
                          {comment.replies.map((reply) => (
                            <View key={reply.id} style={styles.replyRow}>
                              <View style={styles.replyAvatar}>
                                <Text style={styles.replyAvatarText}>
                                  {reply.user
                                    .replace("@", "")
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
