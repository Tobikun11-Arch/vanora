import { Dimensions } from 'react-native';

export const {width: WINDOW_WIDTH, height: WINDOW_HEIGHT} = Dimensions.get('window');
export const H_PADDING = Math.max(16, Math.round(WINDOW_WIDTH * 0.045));
export const V_SPACING = Math.max(10, Math.round(WINDOW_HEIGHT * 0.012));
export const SECTION_SPACING = Math.max(12, Math.round(WINDOW_HEIGHT * 0.016));
