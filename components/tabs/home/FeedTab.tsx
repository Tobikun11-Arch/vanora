import {supabase} from '@/services/supabase';
import {feedTabStyles as styles} from '@/styles';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface PostMedia {
  id: string;
  media_url: string;
  media_type: 'image' | 'video';
  display_order: number;
}

interface PostAuthor {
  id: string;
  username: string | null;
  display_name: string | null;
  profile_picture_url: string | null;
}

interface FeedPost {
  id: string;
  user_id: string;
  caption: string | null;
  location: string | null;
  category: string | null;
  visibility: 'everyone' | 'followers';
  created_at: string;
  profiles: PostAuthor;
  post_media: PostMedia[];
  likes_count: number;
  comments_count: number;
}

interface FeedTabProps {
  refreshTrigger?: number;
}

export default function FeedTab({refreshTrigger}: FeedTabProps) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const {
        data: {user}
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
      await fetchPosts(user?.id || null);
    };

    init();
  }, []);

  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchPosts(currentUserId);
    }
  }, [refreshTrigger]);

  const fetchPosts = async (userId: string | null) => {
    try {
      // who am I following?
      let followingIds: string[] = [];
      if (userId) {
        const {data: followingData} = await supabase
          .from('user_follows')
          .select('following_id')
          .eq('follower_id', userId);
        followingIds = followingData?.map(f => f.following_id) || [];
      }

      // fetch posts with authors and media
      const {data: postsData, error} = await supabase
        .from('posts')
        .select(
          `
          id,
          user_id,
          caption,
          location,
          category,
          visibility,
          created_at,
          profiles:user_id (
            id,
            username,
            display_name,
            profile_picture_url
          ),
          post_media (
            id,
            media_url,
            media_type,
            display_order
          )
        `
        )
        .eq('post_type', 'feed')
        .order('created_at', {ascending: false})
        .limit(50);

      if (error) {
        console.error('Error fetching posts:', error);
        return;
      }

      const filtered = (postsData || []).filter(p => {
        if (p.user_id === userId) return true; // my posts
        if (p.visibility === 'everyone') return true; // public
        if (p.visibility === 'followers' && followingIds.includes(p.user_id))
          return true; // following-only
        return false;
      });
      const withStats: FeedPost[] = await Promise.all(
        filtered.map(async p => {
          const sortedMedia = (p.post_media || []).sort(
            (a, b) => a.display_order - b.display_order
          );

          const {count: likesCount} = await supabase
            .from('post_likes')
            .select('*', {count: 'exact', head: true})
            .eq('post_id', p.id);

          const {count: commentsCount} = await supabase
            .from('post_comments')
            .select('*', {count: 'exact', head: true})
            .eq('post_id', p.id);

          // Fix: profiles is an object, not an array
          const profileData = Array.isArray(p.profiles)
            ? p.profiles[0]
            : p.profiles;

          return {
            ...p,
            profiles: profileData,
            post_media: sortedMedia,
            likes_count: likesCount || 0,
            comments_count: commentsCount || 0
          } as FeedPost;
        })
      );

      setPosts(withStats);
    } catch (e) {
      console.error('Error building feed:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts(currentUserId);
  }, [currentUserId]);

  const renderItem = ({item}: {item: FeedPost}) => {
    const author = item.profiles;
    const displayName = author?.username
      ? `@${author.username}`
      : author?.display_name || 'Unknown';
    const firstMedia = item.post_media?.[0];

    return (
      <View style={styles.feedPost}>
        <View
          style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}
        >
          {author?.profile_picture_url ? (
            <Image
              source={{uri: author.profile_picture_url}}
              style={{width: 32, height: 32, borderRadius: 16, marginRight: 8}}
            />
          ) : (
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#E5E7EB',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8
              }}
            >
              <MaterialCommunityIcons
                name="account"
                size={18}
                color="#6B7280"
              />
            </View>
          )}
          <View>
            <Text style={{fontWeight: '600', color: '#1F2937'}}>
              {displayName}
            </Text>
            {!!item.location && (
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={12}
                  color="#4A7C59"
                />
                <Text style={{fontSize: 12, color: '#4A7C59', marginLeft: 2}}>
                  {item.location}
                </Text>
              </View>
            )}
          </View>
        </View>

        {!!item.caption && (
          <Text style={styles.feedPostText}>{item.caption}</Text>
        )}

        {!!firstMedia && firstMedia.media_type === 'image' && (
          <Image
            source={{uri: firstMedia.media_url}}
            style={{
              width: '100%',
              height: 220,
              borderRadius: 8,
              marginTop: 8,
              backgroundColor: '#F3F4F6'
            }}
            resizeMode="cover"
          />
        )}

        <View style={styles.feedPostActions}>
          <View style={styles.feedAction}>
            <MaterialCommunityIcons name="heart" size={18} color="#6B7280" />
            <Text style={styles.feedActionText}>{item.likes_count}</Text>
          </View>
          <View style={styles.feedAction}>
            <MaterialCommunityIcons
              name="comment-outline"
              size={18}
              color="#6B7280"
            />
            <Text style={styles.feedActionText}>{item.comments_count}</Text>
          </View>
          <TouchableOpacity style={styles.feedAction}>
            <MaterialCommunityIcons
              name="share-outline"
              size={18}
              color="#6B7280"
            />
            <Text style={styles.feedActionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.tabContent}>
        <ActivityIndicator size="large" color="#4A7C59" />
      </View>
    );
  }

  // If no posts, show empty state
  if (posts.length === 0) {
    return (
      <View style={styles.tabContent}>
        <Text style={styles.tabContentTitle}>Story Area</Text>
        <View style={{alignItems: 'center', marginTop: 24}}>
          <MaterialCommunityIcons
            name="post-outline"
            size={48}
            color="#D1D5DB"
          />
          <Text style={{marginTop: 8, color: '#9CA3AF'}}>No posts yet</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      <Text style={styles.tabContentTitle}>Story area</Text>
      {posts.map(item => (
        <View key={item.id}>{renderItem({item})}</View>
      ))}
    </View>
  );
}
