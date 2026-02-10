import {Dimensions, StyleSheet} from 'react-native';

const {width, height} = Dimensions.get('window');
const scale = Math.min(Math.min(width, height) / 375, 1.2);
const s = (value: number) => Math.round(value * scale);
const mediaSize = Math.min(s(118), Math.floor((width - s(48)) / 3));

const COLORS = {
  primary: '#2e7d64',
  surface: '#ffffff',
  surfaceMuted: '#f1f5f3',
  border: '#e6efea',
  text: '#1f2a24',
  muted: '#8a9590'
};

export const mediaStyles = StyleSheet.create({
  mediaBox: {
    marginHorizontal: s(16),
    marginVertical: s(12),
    paddingVertical: s(44),
    borderRadius: s(18),
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#0b1a12',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 8},
    elevation: 3
  },
  mediaTitle: {
    fontSize: s(15),
    fontWeight: '600',
    color: COLORS.text,
    marginTop: s(12),
    letterSpacing: 0.2
  },
  mediaSubtitle: {
    fontSize: s(12),
    color: COLORS.muted,
    marginTop: s(4)
  },
  mediaPreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: s(16),
    paddingVertical: s(12),
    gap: s(10)
  },
  mediaPreviewItem: {
    position: 'relative'
  },
  mediaPreview: {
    width: mediaSize,
    height: mediaSize,
    borderRadius: s(12),
    backgroundColor: COLORS.surfaceMuted
  },
  removeMediaBtn: {
    position: 'absolute',
    top: s(6),
    right: s(6),
    backgroundColor: 'rgba(12, 20, 16, 0.72)',
    borderRadius: s(12),
    padding: s(4)
  },
  addMoreMedia: {
    width: mediaSize,
    height: mediaSize,
    borderRadius: s(12),
    backgroundColor: COLORS.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed'
  }
});
