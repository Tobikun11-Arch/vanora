import {Dimensions} from 'react-native';

export const {width: WINDOW_WIDTH, height: WINDOW_HEIGHT} = Dimensions.get('window');
export const SAFE_H_PADDING = Math.max(16, Math.round(WINDOW_WIDTH * 0.045));
export const SAFE_V_SPACING = Math.max(12, Math.round(WINDOW_HEIGHT * 0.016));
export const CACHE_TTL_MS = 60 * 1000;
export const PAGE_SIZE = 8;
export const MENU_WIDTH = 140;
export const MENU_OFFSET = 8;
export const FREE_CHALLENGES = 3;
export const CHALLENGE_COUNT_KEY = 'findMatchChallengeCountV1';
export const STORY_STORAGE_KEY = 'feedStoriesV1';
