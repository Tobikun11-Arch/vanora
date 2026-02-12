import {Dimensions, StyleSheet} from "react-native";

const {width} = Dimensions.get("window");
export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topBackground: {
    paddingTop: 40,
    paddingBottom: 70,
    alignItems: "center",
  },
  topOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  logoImage: {
    width: width * 0.35, // scales to ~28% of screen width
    height: width * 0.35, // keeps square ratio
    tintColor: "#fff",
    resizeMode: "contain",
    marginRight: -25, // tuck text closer
  },
  appName: {
    fontSize: width * 0.1, // scales with screen width
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 1,
    marginLeft: -8, // small overlap for “Vanora” look
    marginTop: 15, // vertical alignment tweak
  },
  appSubtitle: {
    color: "rgba(255,255,255,0.9)",
    marginTop: 6,
  },
  cardContainer: {
    backgroundColor: "#fff",
    borderRadius: 28,
    paddingVertical: 30,
    paddingHorizontal: 24,
    marginTop: -46,
    alignItems: "stretch",
  },
  pullBar: {
    width: 48,
    height: 6,
    borderRadius: 4,
    backgroundColor: "#ececec",
    alignSelf: "center",
    marginBottom: 18,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 2,
    marginBottom: 4,
    color: "#2e7d64",
  },
  cardSubtitle: {
    textAlign: "center",
    color: "#777",
    marginBottom: 18,
  },
  inputsWrap: {
    marginTop: 12,
    width: "100%",
  },

  socialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  socialText: {
    marginLeft: 8,
    fontWeight: "600",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#eee",
  },
  dividerText: {
    marginHorizontal: 12,
    color: "#999",
    fontSize: 12,
  },
  loginButtonWrap: {
    marginTop: 16,
  },
  forgot: {
    textAlign: "right",
    color: "#2e7d64",
    marginTop: 6,
    marginBottom: 6,
    fontWeight: "600",
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    paddingBottom: 12,
  },
  newText: {
    color: "#777",
  },
  signupLink: {
    color: "#2e7d64",
    fontWeight: "700",
    marginLeft: 6,
  },
});
