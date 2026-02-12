import {Dimensions, StyleSheet} from 'react-native';

const {width, height} = Dimensions.get('window');
const scale = Math.min(Math.min(width, height) / 375, 1.2);
const s = (value: number) => Math.round(value * scale);

const COLORS = {
  primary: '#2e7d64',
  border: '#e6efea',
  surface: '#ffffff',
  soft: '#eef6f2',
  text: '#1f2a24',
  muted: '#6b7a73'
};

export const previewStyles = StyleSheet.create({
  gearPreviewContainer: {
    marginTop: s(12),
    marginHorizontal: s(16),
    paddingHorizontal: s(14),
    paddingVertical: s(12),
    backgroundColor: COLORS.surface,
    borderRadius: s(16),
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#0b1a12',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 2
  },
  gearPreviewTitle: {
    fontSize: s(12),
    fontWeight: '600',
    color: COLORS.muted,
    marginBottom: s(8),
    letterSpacing: 0.2
  },
  gearPreviewTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: s(6)
  },
  gearPreviewTag: {
    backgroundColor: COLORS.soft,
    paddingHorizontal: s(10),
    paddingVertical: s(4),
    borderRadius: s(12)
  },
  gearPreviewTagText: {
    fontSize: s(12),
    color: COLORS.text
  },
  gearMoreText: {
    fontSize: s(12),
    color: COLORS.primary,
    fontWeight: '600'
  },
  taggedPreviewContainer: {
    marginTop: s(12),
    marginHorizontal: s(16),
    paddingHorizontal: s(14),
    paddingVertical: s(12),
    backgroundColor: COLORS.surface,
    borderRadius: s(16),
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#0b1a12',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 2
  },
  taggedPreviewTitle: {
    fontSize: s(12),
    fontWeight: '600',
    color: COLORS.muted,
    marginBottom: s(8),
    letterSpacing: 0.2
  },
  taggedPreviewUsers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: s(8)
  },
  taggedPreviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.soft,
    paddingHorizontal: s(10),
    paddingVertical: s(4),
    borderRadius: s(12),
    gap: s(6)
  },
  taggedPreviewAvatar: {
    width: s(18),
    height: s(18),
    borderRadius: s(9)
  },
  taggedPreviewAvatarPlaceholder: {
    backgroundColor: '#d9efe5',
    justifyContent: 'center',
    alignItems: 'center'
  },
  taggedPreviewText: {
    fontSize: s(12),
    color: COLORS.text,
    fontWeight: '600'
  },
  taggedMoreText: {
    fontSize: s(12),
    color: COLORS.primary,
    fontWeight: '600'
  }
});
