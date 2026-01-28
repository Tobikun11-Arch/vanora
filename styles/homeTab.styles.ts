import {StyleSheet} from 'react-native';

export const homeTabStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  topNavContainer: {
    backgroundColor: '#fff',
    paddingTop: 50,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  tabButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center'
  },
  tabText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500'
  },
  activeTabText: {
    color: '#1F2937',
    fontWeight: '600'
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 24,
    right: 24,
    height: 3,
    backgroundColor: '#10B981',
    borderRadius: 2
  },
  scrollContainer: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 100
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  }
});
