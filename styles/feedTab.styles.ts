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
  }
});
