import {Dimensions, StyleSheet} from 'react-native';

const {width, height} = Dimensions.get('window');
const H_PADDING = Math.max(16, Math.round(width * 0.05));
const V_SPACING = Math.max(10, Math.round(height * 0.015));
const CARD_WIDTH = width - H_PADDING * 2;

export const findMatchTabStyles = StyleSheet.create({
  tabContent: {
    flex: 1,
    paddingHorizontal: H_PADDING,
    paddingTop: V_SPACING,
    paddingBottom: V_SPACING * 1.5,
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
  cardStacked: {
    position: 'absolute',
    top: 0
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
    padding: Math.max(14, Math.round(width * 0.04)),
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
    marginVertical: V_SPACING
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Math.max(6, Math.round(V_SPACING * 0.7))
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
    marginTop: V_SPACING,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Math.max(8, Math.round(H_PADDING * 0.6))
  },
  introHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: Math.max(10, Math.round(H_PADDING * 0.6)),
    paddingVertical: Math.max(8, Math.round(V_SPACING * 0.8)),
    borderRadius: 12,
    gap: 8,
    marginBottom: V_SPACING
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
  challengeInfoIcon: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 25,
    height: 25,
    borderRadius: 11,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 2
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
    marginTop: V_SPACING,
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
  challengeInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    width: '85%',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: {width: 0, height: 6},
    shadowRadius: 12,
    elevation: 4
  },
  challengeInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  challengeInfoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    paddingRight: 8
  },
  challengeInfoClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  challengeInfoText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 16
  },
  challengeInfoButton: {
    backgroundColor: '#2e7d64',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  challengeInfoButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700'
  },
  premiumModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: Math.max(18, Math.round(H_PADDING * 1.2)),
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
    padding: Math.max(20, Math.round(H_PADDING * 1.5)),
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
