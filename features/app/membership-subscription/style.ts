import {Dimensions, Platform, StatusBar, StyleSheet} from "react-native";

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get("window");
const H_PADDING = Math.round(Math.max(16, Math.min(28, SCREEN_WIDTH * 0.06)));
const V_SPACING = Math.round(Math.max(10, Math.min(20, SCREEN_HEIGHT * 0.018)));
const CARD_RADIUS = Math.round(Math.max(16, Math.min(22, SCREEN_WIDTH * 0.05)));
const TITLE_SIZE = Math.round(Math.max(22, Math.min(30, SCREEN_WIDTH * 0.075)));
const SUBTITLE_SIZE = Math.round(
  Math.max(15, Math.min(17, SCREEN_WIDTH * 0.042)),
);
const STATUS_BAR_HEIGHT =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) : 0;
const SAFE_TOP_PADDING = Math.max(0, STATUS_BAR_HEIGHT);

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingTop: SAFE_TOP_PADDING,
  },
  topBar: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: H_PADDING,
    backgroundColor: "#F9FAFB",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2e7d64",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    flex: 1,
    letterSpacing: 0.2,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  topBarSpacer: {
    width: 44,
    height: 44,
  },
  content: {
    paddingHorizontal: H_PADDING,
    paddingTop: V_SPACING,
    paddingBottom: V_SPACING,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Math.max(16, V_SPACING),
  },
  title: {
    fontSize: TITLE_SIZE,
    fontWeight: "700",
    color: "#2e7d64",
    textAlign: "center",
    marginTop: V_SPACING * 0.4,
    letterSpacing: 0.3,
  },
  subtitle: {
    marginTop: V_SPACING * 0.4,
    fontSize: SUBTITLE_SIZE,
    color: "#6B7280",
    lineHeight: 24,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  benefitsList: {
    marginTop: V_SPACING,
    gap: Math.max(8, V_SPACING - 6),
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: CARD_RADIUS,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  benefitIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#f0fdf9",
    borderWidth: 1.5,
    borderColor: "#9ed6c3",
    alignItems: "center",
    justifyContent: "center",
  },
  benefitTextWrap: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: 0.2,
  },
  benefitDesc: {
    marginTop: 2,
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  cardsRow: {
    marginTop: V_SPACING,
    flexDirection: "row",
    gap: 10,
  },
  planCard: {
    flex: 1,
    borderRadius: CARD_RADIUS,
    padding: 16,
    minHeight: 130,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  planCardSelected: {
    borderWidth: 2.5,
    borderColor: "#2e7d64",
    backgroundColor: "#f0fdf9",
    shadowColor: "#2e7d64",
    shadowOpacity: 0.15,
  },
  planCardUnselected: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  planPill: {
    position: "absolute",
    top: -12,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  planPillSelected: {
    backgroundColor: "#2e7d64",
    opacity: 1,
  },
  planPillUnselected: {
    backgroundColor: "#E5E7EB",
    opacity: 0.7,
  },
  planPillText: {
    fontWeight: "700",
    fontSize: 11,
    letterSpacing: 1,
  },
  planPillTextSelected: {
    color: "#fff",
  },
  planPillTextUnselected: {
    color: "#6B7280",
  },
  planHeaderRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  planName: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  planNameSelected: {
    color: "#2e7d64",
  },
  planNameUnselected: {
    color: "#6B7280",
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  radioSelected: {
    borderColor: "#2e7d64",
    backgroundColor: "#f0fdf9",
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2e7d64",
  },
  planCadence: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "700",
    color: "#9CA3AF",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    marginTop: 8,
  },
  price: {
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  priceSelected: {
    color: "#2e7d64",
  },
  priceUnselected: {
    color: "#9CA3AF",
  },
  priceSuffix: {
    fontSize: 14,
    fontWeight: "700",
    color: "#9CA3AF",
    paddingBottom: 4,
  },
  footnote: {
    marginTop: V_SPACING,
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 18,
  },
  bottomArea: {
    paddingHorizontal: H_PADDING,
    paddingTop: V_SPACING * 0.6,
    paddingBottom: Math.max(12, V_SPACING),
    backgroundColor: "#F9FAFB",
  },
  subscribedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  subscribedText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2e7d64",
  },
  continueButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2e7d64",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2e7d64",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  secondaryButton: {
    marginTop: 12,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
});
