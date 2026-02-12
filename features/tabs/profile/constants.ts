import { Dimensions } from 'react-native';

export const {width} = Dimensions.get('window');
export const GALLERY_IMAGE_SIZE = (width - 60) / 3;
export const FALLBACK_HEADER_HEIGHT = 64;
export const SETTINGS_MENU_OFFSET = 8;
