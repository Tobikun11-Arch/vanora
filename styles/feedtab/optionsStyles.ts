import {Dimensions, StyleSheet} from 'react-native';

const {width, height} = Dimensions.get('window');
const scale = Math.min(Math.min(width, height) / 375, 1.2);
const s = (value: number) => Math.round(value * scale);

const COLORS = {
  text: '#1f2a24',
  muted: '#7f8b85',
  border: '#e6efea',
  surface: '#ffffff',
  primary: '#2e7d64'
};

export const optionsStyles = StyleSheet.create({
  optionsContainer: {
    marginTop: s(16),
    marginHorizontal: s(16),
    borderRadius: s(16),
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#0b1a12',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: {width: 0, height: 8},
    elevation: 3,
    overflow: 'hidden'
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(16),
    paddingVertical: s(14),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  optionText: {
    flex: 1,
    fontSize: s(15),
    color: COLORS.text,
    marginLeft: s(12),
    letterSpacing: 0.2
  },
  chevron: {
    marginLeft: 'auto'
  },
  badge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: s(8),
    paddingVertical: s(2),
    borderRadius: s(10),
    marginRight: s(8)
  },
  badgeText: {
    color: '#fff',
    fontSize: s(11),
    fontWeight: '600'
  },
  categoryBadge: {
    paddingHorizontal: s(10),
    paddingVertical: s(4),
    borderRadius: s(12),
    marginRight: s(8)
  },
  categoryBadgeText: {
    fontSize: s(11),
    fontWeight: '600'
  }
});
