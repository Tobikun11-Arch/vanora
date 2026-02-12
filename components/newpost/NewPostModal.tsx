import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useRef, useState} from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import FeedPost, {FeedPostRef} from './FeedPost';
import ImagePollPost, {ImagePollPostRef} from './ImagePollPost';
import PollPost, {PollPostRef} from './PollPost';

type PostTabType = 'feed' | 'poll' | 'imagePoll';

interface NewPostModalProps {
  visible: boolean;
  onClose: () => void;
  onPostSuccess?: () => void;
  username: string;
}

export default function NewPostModal({
  visible,
  onClose,
  onPostSuccess,
  username
}: NewPostModalProps) {
  const [activeTab, setActiveTab] = useState<PostTabType>('feed');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const feedPostRef = useRef<FeedPostRef>(null);
  const pollPostRef = useRef<PollPostRef>(null);
  const imagePollPostRef = useRef<ImagePollPostRef>(null);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'feed':
        return <FeedPost ref={feedPostRef} onPostSuccess={handlePostSuccess} />;
      case 'poll':
        return (
          <PollPost
            ref={pollPostRef}
            username={username}
            onPostSuccess={handlePostSuccess}
          />
        );
      case 'imagePoll':
        return (
          <ImagePollPost
            ref={imagePollPostRef}
            username={username}
            onPostSuccess={handlePostSuccess}
          />
        );
    }
  };

  const handlePostSuccess = () => {
    onPostSuccess?.();
    onClose();
  };

  const handleShare = async () => {
    if (activeTab === 'feed' && feedPostRef.current) {
      if (!feedPostRef.current.canSubmit()) return;
      setIsSubmitting(true);
      try {
        await feedPostRef.current.submit();
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (activeTab === 'poll' && pollPostRef.current) {
      if (!pollPostRef.current.canSubmit()) return;
      setIsSubmitting(true);
      try {
        await pollPostRef.current.submit();
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (activeTab === 'imagePoll' && imagePollPostRef.current) {
      if (!imagePollPostRef.current.canSubmit()) return;
      setIsSubmitting(true);
      try {
        await imagePollPostRef.current.submit();
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            disabled={isSubmitting}
          >
            <MaterialCommunityIcons name="close" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Post</Text>
          <TouchableOpacity
            onPress={handleShare}
            style={[styles.shareBtn, isSubmitting && styles.shareBtnDisabled]}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#4A7C59" size="small" />
            ) : (
              <Text style={styles.shareText}>Share</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabNav}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'feed' && styles.activeTab]}
            onPress={() => setActiveTab('feed')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'feed' && styles.activeTabText
              ]}
            >
              Feed
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'poll' && styles.activeTab]}
            onPress={() => setActiveTab('poll')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'poll' && styles.activeTabText
              ]}
            >
              Poll
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'imagePoll' && styles.activeTab]}
            onPress={() => setActiveTab('imagePoll')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'imagePoll' && styles.activeTabText
              ]}
            >
              Image Poll
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderTabContent()}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  closeBtn: {
    padding: 4
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937'
  },
  shareBtn: {
    padding: 4,
    minWidth: 50,
    alignItems: 'center'
  },
  shareBtnDisabled: {
    opacity: 0.6
  },
  shareText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A7C59'
  },
  tabNav: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F3F4F6'
  },
  activeTab: {
    backgroundColor: '#E8F5E9'
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280'
  },
  activeTabText: {
    color: '#4A7C59'
  },
  content: {
    flex: 1
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF'
  },
  bottomIcon: {
    padding: 8
  }
});
