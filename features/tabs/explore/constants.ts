import {Dimensions, Platform, StatusBar} from "react-native";

export const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} =
  Dimensions.get("window");
export const SAFE_H_PADDING = Math.max(16, Math.round(SCREEN_WIDTH * 0.045));
export const SAFE_V_SPACING = Math.max(12, Math.round(SCREEN_HEIGHT * 0.016));
export const CARD_RADIUS = Math.max(14, Math.round(SCREEN_WIDTH * 0.045));
export const STATUS_BAR_HEIGHT =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) : 0;
