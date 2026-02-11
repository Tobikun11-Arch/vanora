import {Dimensions, StyleSheet} from 'react-native';

const {width, height} = Dimensions.get('window');
const scale = Math.min(Math.min(width, height) / 375, 1.2);
const s = (value: number) => Math.round(value * scale);

const COLORS = {
  primary: '#2e7d64',
  text: '#1f2a24',
  muted: '#7f8b85',
  border: '#e6efea',
  surface: '#ffffff',
  surfaceMuted: '#f1f5f3'
};

export const userStyles = StyleSheet.create({
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(16),
    paddingVertical: s(12)
  },
  avatarContainer: {
    marginRight: s(12)
  },
  avatar: {
    width: s(44),
    height: s(44),
    borderRadius: s(22)
  },
  avatarPlaceholder: {
    backgroundColor: '#eef2f1',
    justifyContent: 'center',
    alignItems: 'center'
  },
  userInfo: {
    flex: 1
  },
  username: {
    fontSize: s(15),
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: 0.2
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: s(2),
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: s(12),
    paddingHorizontal: s(6),
    paddingVertical: s(3),
    alignSelf: 'flex-start'
  },
  locationText: {
    fontSize: s(11),
    color: COLORS.primary,
    marginLeft: s(4)
  },
  clearLocationBtn: {
    marginLeft: s(4)
  },
  visibilityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(10),
    paddingVertical: s(6),
    borderRadius: s(16),
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignSelf: 'center'
  },
  visibilityText: {
    fontSize: s(11),
    color: COLORS.muted,
    marginLeft: s(6)
  }
});
