import {StyleSheet} from "react-native";

export const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingGif: {
    width: 140,
    height: 140,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  contentContainer: {
    flex: 1,
  },
  bottomBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 4,
  },
  activeTabItem: {
    backgroundColor: "#F3F4F6",
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: "#9CA3AF",
    marginTop: 2,
  },
  activeTabLabel: {
    color: "#2E7D64",
    fontWeight: "600",
  },
  notificationWrapper: {
    position: "relative",
    alignItems: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
  },
  separator: {
    display: "none",
  },
});
