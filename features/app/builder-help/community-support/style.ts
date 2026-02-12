import {StyleSheet} from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDF7F2",
  },
  topBar: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 20,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  topBarSpacer: {
    width: 44,
    height: 44,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
    marginBottom: 16,
  },
  feed: {
    gap: 16,
  },
  postCard: {
    backgroundColor: "#FFF9F5",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F2E8DC",
    shadowColor: "#9A6B4F",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 2,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  postHeaderText: {
    flex: 1,
  },
  postUser: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F2937",
  },
  postTime: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },
  postBody: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 18,
  },
  verifiedReply: {
    marginTop: 14,
    backgroundColor: "#FFF4E8",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F3DCC8",
  },
  verifiedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  verifiedHeaderText: {
    flex: 1,
  },
  verifiedNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  verifiedUser: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1F2937",
  },
  verifiedTime: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: "#D1FAE5",
    borderRadius: 999,
  },
  verifiedBadgeText: {
    fontSize: 10,
    color: "#0F5132",
    fontWeight: "700",
  },
  verifiedText: {
    fontSize: 12,
    color: "#3F3F46",
    lineHeight: 18,
  },
  commentsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    marginBottom: 8,
  },
  commentsTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1F2937",
  },
  commentsCount: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  commentsList: {
    gap: 12,
  },
  commentRow: {
    flexDirection: "row",
    gap: 10,
  },
  commentBody: {
    flex: 1,
  },
  commentMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  commentUser: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1F2937",
  },
  commentTime: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  commentText: {
    fontSize: 12,
    color: "#4B5563",
    lineHeight: 18,
  },
  commentActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  actionButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },
  likeCount: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
  },
  replyList: {
    marginTop: 10,
    paddingLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: "#F3DCC8",
    gap: 10,
  },
  replyRow: {
    flexDirection: "row",
    gap: 8,
  },
  avatar: {
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
  },
});
