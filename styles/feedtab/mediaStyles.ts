import {StyleSheet} from 'react-native';

export const mediaStyles = StyleSheet.create({
  mediaBox: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  mediaTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12
  },
  mediaSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4
  },
  mediaPreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8
  },
  mediaPreviewItem: {
    position: 'relative'
  },
  mediaPreview: {
    width: 100,
    height: 100,
    borderRadius: 8
  },
  removeMediaBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4
  },
  addMoreMedia: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed'
  }
});
