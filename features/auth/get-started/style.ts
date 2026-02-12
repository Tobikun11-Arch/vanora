import {Platform, StyleSheet} from "react-native";
import {CARD_SIDE_PADDING, CARD_WIDTH, width} from "./constants";

export const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  backgroundImageStyle: {
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.08)",
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === "android" ? 28 : 40,
    zIndex: 1,
  },
  topSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  logoImage: {
    width: width * 0.35, // scales to ~22% of screen width
    height: width * 0.35, // keeps square ratio
    tintColor: "#2e7d64",
    resizeMode: "contain",
    marginRight: -25,
  },
  appName: {
    fontSize: width * 0.1, // scales with screen width
    fontWeight: "900",
    color: "#2e7d64",
    letterSpacing: 1,
    marginLeft: -8, // consistent spacing from logo
    marginTop: 15,
  },

  cardsContainer: {
    flex: 1,
    marginTop: Platform.OS === "android" ? 10 : 140,
    marginBottom: 20,
    marginHorizontal: -20,
  },
  cardWrapper: {
    width,
    paddingHorizontal: CARD_SIDE_PADDING,
    justifyContent: "center",
    height: "100%",
  },
  cardShadowContainer: {
    width: CARD_WIDTH,
    alignSelf: "center",
    flex: 1,
    minHeight: 460,
    borderRadius: 20,
    // Shadow for iOS - light from top

    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    // Shadow for Android - light from top
  },
  glassCardSurface: {
    flex: 1,
    minHeight: 460,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor:
      Platform.OS === "android" ? "rgba(235, 232, 232, 0)" : "transparent",
  },
  glassCard: {
    flex: 1,
    minHeight: 460,
    backgroundColor:
      Platform.OS === "android"
        ? "rgba(198, 205, 207, 0)"
        : "rgba(153, 74, 74, 0.21)",
    borderRadius: 20,
    padding: 32,
    borderWidth: 1.5,
    borderColor:
      Platform.OS === "android"
        ? "rgba(214, 247, 245, 0.14)"
        : "rgba(255, 255, 255, 0.75)",
    alignItems: "stretch",
    justifyContent: "flex-start",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  cardIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#cfe7deff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  cardTitle: {
    fontSize: Platform.OS === "android" ? 20 : 26,
    fontWeight: Platform.OS === "android" ? "800" : "700",
    color: "#2e7d64",
    marginBottom: 0,
    textAlign: "center",
  },
  cardDescription: {
    fontSize: Platform.OS === "android" ? 14 : 15,
    color: "rgba(255, 255, 255, 0.95)",
    textAlign: "center",
    lineHeight: Platform.OS === "android" ? 17 : 22,
    marginTop: 2,
    marginBottom: 24,
  },
  cardImage: {
    width: "100%",
    flex: 1,
    minHeight: 240,
    borderRadius: 12,
    marginBottom: 0,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 6,
  },
  dotActive: {
    backgroundColor: "#2e7d64",
    width: 24,
  },
  bottomSection: {
    paddingBottom: 10,
  },
  loginPrompt: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  loginText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
  },
  loginLink: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
