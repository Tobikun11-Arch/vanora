import {Dimensions, StyleSheet} from 'react-native';

const {width, height} = Dimensions.get('window');
const scale = Math.min(Math.min(width, height) / 375, 1.2);
const s = (value: number) => Math.round(value * scale);

const COLORS = {
  background: '#ffffff',
  text: '#1f2a24',
  placeholder: '#9aa6a1',
  border: '#e6efea',
  primary: '#2e7d64'
};

export const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingBottom: s(16)
  },
  contentContainer: {
    paddingBottom: s(300)
  },
  captionInput: {
    marginHorizontal: s(16),
    marginTop: s(4),
    paddingHorizontal: s(14),
    paddingVertical: s(10),
    fontSize: s(14),
    color: COLORS.text,
    minHeight: s(72),
    lineHeight: s(20),
    borderRadius: s(14),
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: COLORS.border,
    letterSpacing: 0.2,
    shadowColor: '#0b1a12',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 6},
    elevation: 2
  }
});
