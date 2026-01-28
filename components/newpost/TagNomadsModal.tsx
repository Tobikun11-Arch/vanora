import {supabase} from '@/services/supabase';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface Friend {
  id: string;
  username: string | null;
  display_name: string | null;
  profile_picture_url: string | null;
}

interface TagNomadsModalProps {
  visible: boolean;
  onClose: () => void;
  selectedUsers: Friend[];
  onUpdateUsers: (users: Friend[]) => void;
}

export default function TagNomadsModal({
  visible,
  onClose,
  selectedUsers,
  onUpdateUsers
}: TagNomadsModalProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (visible) {
      fetchFriends();
    }
  }, [visible]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      setFilteredFriends(
        friends.filter(
          friend =>
            friend.username?.toLowerCase().includes(query) ||
            friend.display_name?.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredFriends(friends);
    }
  }, [searchQuery, friends]);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const {
        data: {user}
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get users that current user follows
      const {data: following, error: followingError} = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id);

      if (followingError) throw followingError;

      // Get users that follow current user
      const {data: followers, error: followersError} = await supabase
        .from('user_follows')
        .select('follower_id')
        .eq('following_id', user.id);

      if (followersError) throw followersError;

      // Find mutual follows (friends)
      const followingIds = new Set(following?.map(f => f.following_id) || []);
      const followerIds = new Set(followers?.map(f => f.follower_id) || []);

      const mutualIds = [...followingIds].filter(id => followerIds.has(id));

      if (mutualIds.length === 0) {
        setFriends([]);
        setFilteredFriends([]);
        return;
      }

      // Fetch profiles of mutual friends
      const {data: profiles, error: profilesError} = await supabase
        .from('profiles')
        .select('id, username, display_name, profile_picture_url')
        .in('id', mutualIds);

      if (profilesError) throw profilesError;

      setFriends(profiles || []);
      setFilteredFriends(profiles || []);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const isUserSelected = (userId: string) => {
    return selectedUsers.some(u => u.id === userId);
  };

  const toggleUser = (friend: Friend) => {
    if (isUserSelected(friend.id)) {
      onUpdateUsers(selectedUsers.filter(u => u.id !== friend.id));
    } else {
      onUpdateUsers([...selectedUsers, friend]);
    }
  };

  const removeUser = (userId: string) => {
    onUpdateUsers(selectedUsers.filter(u => u.id !== userId));
  };

  const getDisplayName = (friend: Friend) => {
    if (friend.display_name) return friend.display_name;
    if (friend.username) return `@${friend.username}`;
    return 'Nomad';
  };

  const renderFriendItem = ({item}: {item: Friend}) => (
    <TouchableOpacity
      style={[
        styles.friendItem,
        isUserSelected(item.id) && styles.friendItemSelected
      ]}
      onPress={() => toggleUser(item)}
    >
      {item.profile_picture_url ? (
        <Image source={{uri: item.profile_picture_url}} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <MaterialCommunityIcons name="account" size={24} color="#6B7280" />
        </View>
      )}
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{getDisplayName(item)}</Text>
        {item.username && item.display_name && (
          <Text style={styles.friendUsername}>@{item.username}</Text>
        )}
      </View>
      {isUserSelected(item.id) ? (
        <MaterialCommunityIcons name="check-circle" size={24} color="#4A7C59" />
      ) : (
        <MaterialCommunityIcons
          name="circle-outline"
          size={24}
          color="#D1D5DB"
        />
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons
        name="account-group-outline"
        size={64}
        color="#D1D5DB"
      />
      <Text style={styles.emptyTitle}>No Friends Yet</Text>
      <Text style={styles.emptySubtitle}>
        Friends are people who follow you and you follow back. Start connecting
        with other nomads!
      </Text>
    </View>
  );

  const renderNoResults = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons
        name="account-search-outline"
        size={64}
        color="#D1D5DB"
      />
      <Text style={styles.emptyTitle}>No Results</Text>
      <Text style={styles.emptySubtitle}>No friends match {searchQuery}</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.title}>Tag Nomads</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.doneBtn}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Selected Users */}
        {selectedUsers.length > 0 && (
          <View style={styles.selectedContainer}>
            <Text style={styles.sectionTitle}>
              Tagged ({selectedUsers.length})
            </Text>
            <View style={styles.selectedRow}>
              {selectedUsers.map(user => (
                <TouchableOpacity
                  key={user.id}
                  style={styles.selectedTag}
                  onPress={() => removeUser(user.id)}
                >
                  {user.profile_picture_url ? (
                    <Image
                      source={{uri: user.profile_picture_url}}
                      style={styles.selectedAvatar}
                    />
                  ) : (
                    <View
                      style={[
                        styles.selectedAvatar,
                        styles.selectedAvatarPlaceholder
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="account"
                        size={12}
                        color="#fff"
                      />
                    </View>
                  )}
                  <Text style={styles.selectedTagText}>
                    {user.username ? `@${user.username}` : user.display_name}
                  </Text>
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={16}
                    color="#fff"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Search */}
        {friends.length > 0 && (
          <View style={styles.searchContainer}>
            <MaterialCommunityIcons name="magnify" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search friends..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialCommunityIcons
                  name="close-circle"
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Friends List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A7C59" />
            <Text style={styles.loadingText}>Loading friends...</Text>
          </View>
        ) : friends.length === 0 ? (
          renderEmptyState()
        ) : filteredFriends.length === 0 ? (
          renderNoResults()
        ) : (
          <FlatList
            data={filteredFriends}
            keyExtractor={item => item.id}
            renderItem={renderFriendItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937'
  },
  doneBtn: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A7C59'
  },
  selectedContainer: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12
  },
  selectedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A7C59',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6
  },
  selectedAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10
  },
  selectedAvatarPlaceholder: {
    backgroundColor: '#3D6B4A',
    justifyContent: 'center',
    alignItems: 'center'
  },
  selectedTagText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    gap: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280'
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F9FAFB'
  },
  friendItemSelected: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#4A7C59'
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12
  },
  avatarPlaceholder: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center'
  },
  friendInfo: {
    flex: 1
  },
  friendName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937'
  },
  friendUsername: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20
  }
});
