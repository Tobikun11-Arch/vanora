import {Dimensions, StyleSheet} from 'react-native';

const {width} = Dimensions.get('window');
const CARD_WIDTH = width - 40;

export const findMatchTabStyles = StyleSheet.create({
  tabContent: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  tabContentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16
  },
  cardWrap: {
    alignItems: 'center'
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: {width: 0, height: 8},
    shadowRadius: 16,
    elevation: 6
  },
  cardFill: {
    flex: 1
  },
  cardTouchable: {
    flex: 1
  },
  cardImage: {
    width: '100%',
    height: '100%'
  },
  cardOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.45)'
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  cardTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800'
  },
  verifiedBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(96,165,250,0.2)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4
  },
  locationText: {
    color: '#E5E7EB',
    fontSize: 13
  },
  overlayDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginVertical: 12
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16,185,129,0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18
  },
  pillAlt: {
    backgroundColor: 'rgba(31,41,55,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)'
  },
  pillIcon: {
    marginRight: 6
  },
  pillText: {
    fontSize: 12,
    color: '#F9FAFB',
    fontWeight: '600'
  },
  overlayHint: {
    fontSize: 12,
    color: '#E5E7EB'
  },
  actionRow: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12
  },
  introHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12
  },
  introHintText: {
    color: '#F9FAFB',
    fontSize: 12,
    flex: 1
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 8,
    elevation: 4
  },
  passButton: {
    borderWidth: 2,
    borderColor: '#FCA5A5'
  },
  likeButton: {
    borderWidth: 2,
    borderColor: '#86EFAC'
  },
  challengeButton: {
    borderWidth: 2,
    borderColor: '#93C5FD'
  },
  lockBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#111827',
    borderRadius: 10,
    padding: 2
  },
  freeHint: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 12,
    color: '#6B7280'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  premiumModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    alignItems: 'center'
  },
  premiumTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center'
  },
  premiumDescription: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16
  },
  premiumFeatures: {
    width: '100%',
    marginBottom: 16,
    gap: 10
  },
  premiumFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  premiumFeatureText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600'
  },
  premiumButton: {
    width: '100%',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10
  },
  premiumButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600'
  },
  laterText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '500'
  },
  emptyState: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 12
  },
  emptySubtext: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4
  }
});
