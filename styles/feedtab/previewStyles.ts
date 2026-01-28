import {StyleSheet} from 'react-native';

export const previewStyles = StyleSheet.create({
  gearPreviewContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFBEB',
    borderTopWidth: 1,
    borderTopColor: '#FEF3C7'
  },
  gearPreviewTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8
  },
  gearPreviewTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6
  },
  gearPreviewTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  gearPreviewTagText: {
    fontSize: 12,
    color: '#92400E'
  },
  gearMoreText: {
    fontSize: 12,
    color: '#B45309',
    fontWeight: '500'
  },
  taggedPreviewContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F0FDF4',
    borderTopWidth: 1,
    borderTopColor: '#DCFCE7'
  },
  taggedPreviewTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 8
  },
  taggedPreviewUsers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8
  },
  taggedPreviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6
  },
  taggedPreviewAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9
  },
  taggedPreviewAvatarPlaceholder: {
    backgroundColor: '#BBF7D0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  taggedPreviewText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '500'
  },
  taggedMoreText: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '500'
  }
});
