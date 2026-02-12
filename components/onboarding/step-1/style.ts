import {Dimensions, Platform, StatusBar, StyleSheet} from "react-native";

const {width, height} = Dimensions.get("window");
const scale = (size: number) =>
  Math.round((Math.min(width, height) / 375) * size);
const STATUS_BAR_HEIGHT =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) : 0;
const SAFE_TOP_PADDING = Math.max(0, STATUS_BAR_HEIGHT);
const IS_IOS = Platform.OS === "ios";

export const SPACING = {
  xs: scale(6),
  sm: scale(10),
  md: scale(14),
  lg: scale(18),
  xl: scale(24),
};

export const COLORS = {
  primary: "#2e7d64",
  bg: "#f6f8f7",
  card: "#ffffff",
  text: "#0f1a15",
  sub: "#5e6b65",
  muted: "#8b9591",
  border: "#e3e9e6",
  chipBg: "#f1f5f3",
};

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingTop: SAFE_TOP_PADDING,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.sm,
    paddingRight: SPACING.md,
    paddingTop: IS_IOS ? 0 : SPACING.xl,
    paddingBottom: SPACING.md,
  },
  headerBlock: {
    marginHorizontal: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  backButton: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  progressArea: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.xs,
  },
  progressStep: {
    fontSize: scale(12),
    color: COLORS.sub,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  progressPercent: {
    fontSize: scale(12),
    color: COLORS.primary,
    fontWeight: "700",
  },
  progressTrack: {
    height: scale(6),
    backgroundColor: COLORS.border,
    borderRadius: scale(999),
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.lg,
    borderRadius: scale(20),
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 2,
  },
  sectionTitle: {
    fontSize: scale(20),
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.sm,
    letterSpacing: 0.2,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: scale(13),
    fontWeight: "600",
    color: COLORS.sub,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
    letterSpacing: 0.2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: scale(18),
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.chipBg,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: scale(12),
    color: COLORS.sub,
    fontWeight: "600",
  },
  chipTextSelected: {
    color: "#fff",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: scale(12),
    paddingHorizontal: SPACING.md,
    backgroundColor: "#fff",
    minHeight: scale(48),
    marginBottom: SPACING.sm,
  },
  inputIcon: {
    marginRight: SPACING.xs,
  },
  input: {
    flex: 1,
    fontSize: scale(13),
    color: COLORS.text,
  },
  buttonContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.md,
  },
});
