import {StyleSheet} from 'react-native';

export const feedTabStyles = StyleSheet.create({
  tabContent: {
    padding: 20
  },
  tabContentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20
  },
  feedPost: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1
  },
  feedPostText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
    marginBottom: 12
  },
  feedPostActions: {
    flexDirection: 'row',
    gap: 24,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12
  },
  feedAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  feedActionText: {
    fontSize: 14,
    color: '#6B7280'
  },
  pollContainer: {
    marginTop: 12,
    gap: 10
  },
  pollOption: {
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB'
  },
  pollOptionSelected: {
    borderColor: '#4A7C59'
  },
  pollOptionFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F9FAFB'
  },
  pollOptionFillActive: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#E8F5E9'
  },
  pollOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  pollOptionText: {
    fontSize: 14,
    color: '#1F2937'
  },
  pollOptionPercent: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600'
  },
  pollMetaText: {
    fontSize: 12,
    color: '#6B7280'
  }
});
