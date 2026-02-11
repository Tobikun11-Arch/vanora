import {StyleSheet} from 'react-native';

export const feedTabStyles = StyleSheet.create({
  tabContent: {
    flex: 1,
    padding: 18,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F7F6'
  },
  createBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E3EAE6',
    marginBottom: 8,
    shadowColor: '#0B1D18',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3
  },
  createBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    marginRight: 10
  },
  createAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB'
  },
  createAvatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D9E2DE',
    borderWidth: 1,
    borderColor: '#CBD5D0'
  },
  createPlaceholder: {
    fontSize: 13,
    color: '#5C6A63',
    flexShrink: 1
  },
  createActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  createIconButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F6F4',
    borderWidth: 1,
    borderColor: '#DDE6E1'
  },
  tabContentTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
    letterSpacing: 0.2
  },
  storySection: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: 'hidden',
    paddingTop: 16,
    paddingLeft: 0,
     borderWidth: 1,
    borderColor: '#E3EAE6',
    shadowColor: '#0B1D18',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3
  },
  storyCardWrap: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E3EAE6',
    shadowColor: '#0B1D18',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3
  },
  roadSeparator: {
    height: 4,
    backgroundColor: '#a8a9a9',
    borderRadius: 999,
    marginBottom: 10
  },
  storyScrollContent: {
    paddingRight: 24,
    paddingBottom: 22
  },
  storyBus: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7EEF3',
    borderTopLeftRadius: 90,
    borderBottomLeftRadius: 8,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderWidth: 2,
    borderColor: '#A7B4BF',
    height: 150,
    paddingVertical: 16,
    marginLeft: 5
  },
  storyStripe: {
    position: 'absolute',
    left: 128,
    right: 22,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#2E7D64',
    top: 70
  },
  storyFront: {
    width: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 2,
    borderColor: '#A7B4BF',
    height: '100%',
    marginRight: 2,
  },
  storyHeadlight: {
    position: 'absolute',
    left: 2,
    bottom:10,
    width: 40,
    height: 20,
    borderRadius: 999,
    backgroundColor: '#FFF7C2',
    borderWidth: 2,
    borderColor: '#2E7D64',
    shadowColor: '#FFF1A6',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 2,
  },
  storyFrontBumper: {
    position: 'absolute',
    left: 1,
    bottom: 10,
    height: 20,
    width: 118,
    borderRadius: 10,
    backgroundColor: '#1F2937'
  },
  joinTripCard: {
    position: 'absolute',
    top: 1,
    width: 86,
    height: 80,
    borderRadius: 18,
    borderTopLeftRadius: 80,
    backgroundColor: '#EAF3EF',
    borderWidth: 2,
    borderColor: '#2E7D64',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    zIndex: 2
  },
  joinTripIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB'
  },
  joinTripText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2E7D64',
    letterSpacing: 0.4
  },
  storyBody: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingRight: 58,
    gap: 10
  },
  storyCard: {
    width: 86,
    height: 100,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#2E7D64',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden'
  },
  storyCardLast: {
    marginRight: 10
  },
  storyImage: {
    width: '100%',
    height: '100%'
  },
  storyLabel: {
    position: 'absolute',
    left: 6,
    right: 6,
    bottom: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8
  },
  storyLabelText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600'
  },
  storyRearCap: {
    position: 'absolute',
    right: -20,
    top: -2,
    bottom: -2,
    width: 34,
    backgroundColor: '#E7EEF3',
    borderWidth: 2,
    borderLeftWidth: 0,
    borderColor: '#A7B4BF',
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30
  },
  storyWheelFront: {
    position: 'absolute',
    left: 60,
    bottom: -18,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: '#1F2937',
    zIndex: 3
  },
  storyWheelBack: {
    position: 'absolute',
    right: 20,
    bottom: -18,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: '#1F2937',
    zIndex: 3
  },
  storyWheelInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    borderWidth: 3,
    borderColor: '#9CA3AF'
  },
  feedPost: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E3EAE6',
    shadowColor: '#0B1D18',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  feedHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    paddingRight: 8
  },
  feedHeaderAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E1E7E3'
  },
  feedHeaderAvatarPlaceholder: {
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center'
  },
  feedHeaderInfo: {
    flex: 1
  },
  feedHeaderTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  feedHeaderNameWrap: {
    flex: 1,
    minWidth: 0
  },
  feedHeaderName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flexShrink: 1
  },
  followButton: {
    borderWidth: 1,
    borderColor: '#2E7D64',
    backgroundColor: '#F2FAF6',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999
  },
  followButtonText: {
    color: '#2E7D64',
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.2
  },
  followButtonActive: {
    backgroundColor: '#2E7D64',
    borderColor: '#2E7D64'
  },
  followButtonTextActive: {
    color: '#FFFFFF'
  },
  feedHeaderLocationRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  feedHeaderLocationText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4
  },
  feedHeaderTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
    marginBottom: 8
  },
  feedHeaderTagPill: {
    backgroundColor: '#ECF4F1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999
  },
  feedHeaderTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3D5A51',
    letterSpacing: 0.4
  },
  feedHeaderMenu: {
    padding: 4
  },
  feedPostText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
    marginBottom: 6
  },
  feedPostActions: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    alignItems: 'center'
  },
  feedActionsSeparator: {
    height: 1,
    backgroundColor: '#ECF1EE',
    marginTop: 10
  },
  feedAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: '#F5F8F7'
  },
  feedActionText: {
    fontSize: 13,
    color: '#5C6A63',
    fontWeight: '600'
  },
  actionActiveText: {
    color: '#2E7D64',
    fontWeight: '700'
  },
  actionTagsWrap: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  actionTagPill: {
    backgroundColor: '#ECF4F1',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999
  },
  actionTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#3D5A51',
    letterSpacing: 0.3
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
    borderColor: '#2E7D64'
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
    backgroundColor: '#E6F2ED'
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
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.12)'
  },
  menuSheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 4,
    minWidth: 120,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#EEF2F3'
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12
  },
  menuItemText: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '600'
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.25)',
    justifyContent: 'flex-end'
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '50%'
  },
  commentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F3'
  },
  commentHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827'
  },
  commentList: {
    paddingTop: 12,
    paddingBottom: 16,
    gap: 16
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10
  },
  commentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center'
  },
  commentContent: {
    flex: 1
  },
  commentRowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  commentNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap'
  },
  commentUsername: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827'
  },
  commentFollowButton: {
    borderWidth: 1,
    borderColor: '#2E7D64',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2
  },
  commentFollowText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2E7D64'
  },
  commentMeta: {
    fontSize: 11,
    color: '#9CA3AF'
  },
  commentText: {
    fontSize: 13,
    color: '#1F2937',
    marginTop: 2,
    lineHeight: 18
  },
  commentReply: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 6,
    fontWeight: '600'
  },
  commentLikeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  commentLikeText: {
    fontSize: 10,
    color: '#9CA3AF'
  },
  commentComposer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F3'
  },
  commentComposerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center'
  },
  commentComposerField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 15,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 999,
    backgroundColor: '#FFFFFF'
  },
  storyModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(9, 20, 28, 0.72)',
    justifyContent: 'center',
    paddingHorizontal: 18
  },
  storyModalCard: {
    backgroundColor: '#0B1D18',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: {width: 0, height: 14},
    elevation: 6
  },
  storyModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  storyModalTitleWrap: {
    gap: 2
  },
  storyModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC'
  },
  storyModalSubtitle: {
    fontSize: 11,
    color: '#A7B4BF',
    fontWeight: '600'
  },
  storyModalClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(207, 195, 195, 0.12)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  storyModalImageWrap: {
    height: 360,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#0F2A22'
  },
  storyModalImage: {
    width: '100%',
    height: '100%'
  },
  storyModalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14
  },
  storyModalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EAF3EF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999
  },
  storyModalPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2E7D64'
  },
  storyModalAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(109, 61, 61, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  storyModalActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D1FAE5'
  },
  commentComposerPlaceholder: {
    fontSize: 12,
    color: '#9CA3AF'
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  modalAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937'
  },
  modalBody: {
    paddingBottom: 6
  },
  modalComment: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20
  }
});
