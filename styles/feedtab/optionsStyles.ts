import {StyleSheet} from 'react-native';

export const optionsStyles = StyleSheet.create({
  optionsContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6'
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    marginLeft: 12
  },
  chevron: {
    marginLeft: 'auto'
  },
  badge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '500'
  }
});
