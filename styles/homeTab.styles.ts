import { Platform, StatusBar, StyleSheet } from "react-native";

export const homeTabStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  topNavContainer: {
    backgroundColor: "#ffffff",
    paddingTop: Platform.OS === "ios" ? 52 : (StatusBar.currentHeight ?? 0) + 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  topNav: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 18,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#94A3B8",
    letterSpacing: 0.2,
  },
  tabTextActive: {
    color: "#2E7D64",
  },
  tabButtonActive: {
    borderBottomColor: "#2E7D64",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  fab: {
    position: "absolute",
    bottom: 35,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
});
