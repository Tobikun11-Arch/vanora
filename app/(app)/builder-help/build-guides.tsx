import {guides} from "@/features/app/builder-help/build-guides/data";
import {styles} from "@/features/app/builder-help/build-guides/style";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import React, {useMemo, useState} from "react";
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

function Avatar({name, size = 32}: {name: string; size?: number}) {
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

export default function BuildGuidesScreen() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(guides[0]?.id ?? "");

  const selectedGuide = useMemo(
    () => guides.find((guide) => guide.id === selectedId) ?? guides[0],
    [selectedId],
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
          {guides.map((guide) => (
            <TouchableOpacity
              key={guide.id}
              style={[
                styles.card,
                selectedId === guide.id ? styles.cardActive : null,
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
              {selectedGuide.tips.map((tip) => (
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
                selectedGuide.comments.map((comment) => (
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
                          {comment.replies.map((reply) => (
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
