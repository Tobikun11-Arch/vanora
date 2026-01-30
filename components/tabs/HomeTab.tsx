import {homeTabStyles as styles} from '@/styles';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useCallback, useEffect, useState} from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {NewPostModal} from '../newpost';
import EventsTab from './home/EventsTab';
import FeedTab from './home/FeedTab';
import FindMatchTab from './home/FindMatchTab';

interface UserProfile {
  id: string;
  nomad_type: string;
  travel_style: string;
  age: number;
  gender: string;
  bio: string;
  profile_picture_url: string | null;
  current_location: string;
}

interface HomeTabProps {
  profile: UserProfile;
}

type TabType = 'findMatch' | 'feed' | 'events';

export default function HomeTab({profile}: HomeTabProps) {
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [feedRefreshTrigger, setFeedRefreshTrigger] = useState(0);

  // Auto-refetch every 1 minute
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 'feed') {
        setFeedRefreshTrigger(prev => prev + 1);
      }
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [activeTab]);

  const handlePostSuccess = useCallback(() => {
    setShowNewPostModal(false);
    setFeedRefreshTrigger(prev => prev + 1);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'findMatch':
        return <FindMatchTab />;
      case 'feed':
        return <FeedTab refreshTrigger={feedRefreshTrigger} />;
      case 'events':
        return <EventsTab />;
    }
  };

  const handleFabFeed = () => {
    if (activeTab === 'feed') {
      setShowNewPostModal(true);
    }
  };

  // Extract username from profile id or use a default
  const username = profile?.id ? 'vandora_official' : 'user';

  return (
    <View style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={styles.topNavContainer}>
        <View style={styles.topNav}>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setActiveTab('findMatch')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'findMatch' && styles.activeTabText
              ]}
            >
              Find Match
            </Text>
            {activeTab === 'findMatch' && (
              <View style={styles.activeIndicator} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabButton}
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
            {activeTab === 'feed' && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setActiveTab('events')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'events' && styles.activeTabText
              ]}
            >
              Events
            </Text>
            {activeTab === 'events' && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Content */}
      {activeTab === 'findMatch' ? (
        <View style={styles.scrollContainer}>{renderTabContent()}</View>
      ) : (
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderTabContent()}
        </ScrollView>
      )}

      {/* Floating Action Button */}
      {activeTab === 'feed' && (
        <TouchableOpacity style={styles.fab} onPress={handleFabFeed}>
          <MaterialCommunityIcons name="plus" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {/* New Post Modal */}
      <NewPostModal
        visible={showNewPostModal}
        onClose={() => setShowNewPostModal(false)}
        onPostSuccess={handlePostSuccess}
        username={username}
      />
    </View>
  );
}
