import {StyleSheet} from 'react-native';

export const feedTabStyles = StyleSheet.create({
  tabContent: {
    padding: 20,
    backgroundColor: '#F6F9F7'
  },
  tabContentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16
  },
  feedPost: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  feedHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    paddingRight: 8
  },
  feedHeaderAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10
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
    gap: 8,
    flexWrap: 'wrap'
  },
  feedHeaderName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937'
  },
  followButton: {
    borderWidth: 1,
    borderColor: '#2E7D64',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999
  },
  followButtonText: {
    color: '#2E7D64',
    fontWeight: '600',
    fontSize: 12
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
    marginBottom: 1
  },
  feedPostActions: {
    flexDirection: 'row',
    gap: 24,
    paddingTop: 12,
    alignItems: 'center'
  },
  feedActionsSeparator: {
    height: 1,
    backgroundColor: '#EEF2F3',
    marginTop: 10
  },
  feedAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  feedActionText: {
    fontSize: 15,
    color: '#6B7280'
  },
  actionActiveText: {
    color: '#2E7D64',
    fontWeight: '600'
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
