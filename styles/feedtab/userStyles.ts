import {StyleSheet} from 'react-native';

export const userStyles = StyleSheet.create({
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  avatarContainer: {
    marginRight: 12
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22
  },
  avatarPlaceholder: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center'
  },
  userInfo: {
    flex: 1
  },
  username: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937'
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  locationText: {
    fontSize: 13,
    color: '#4A7C59',
    marginLeft: 4
  },
  clearLocationBtn: {
    marginLeft: 4
  },
  visibilityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff'
  },
  visibilityText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6
  }
});
