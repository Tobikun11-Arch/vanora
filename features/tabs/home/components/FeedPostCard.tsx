import {supabase} from '@/services/supabase';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useState} from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const {width} = Dimensions.get('window');

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
  is_liked: boolean;
}

interface FeedPostCardProps {
  post: FeedPost;
  currentUserId: string | null;
  onLikeUpdate?: () => void;
}

export default function FeedPostCard({
  post,
  currentUserId,
  onLikeUpdate
}: FeedPostCardProps) {
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [isLiking, setIsLiking] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const author = post.profiles;
  const displayName = author?.username
    ? `@${author.username}`
    : author?.display_name || 'Unknown User';

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const handleLike = async () => {
    if (!currentUserId || isLiking) return;

    setIsLiking(true);
    const wasLiked = isLiked;

    // Optimistic update
    setIsLiked(!wasLiked);
    setLikesCount(prev => (wasLiked ? prev - 1 : prev + 1));

    try {
      if (wasLiked) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', currentUserId);
      } else {
        await supabase
          .from('post_likes')
          .insert({post_id: post.id, user_id: currentUserId});
      }
      onLikeUpdate?.();
    } catch (error) {
      // Revert on error
      setIsLiked(wasLiked);
      setLikesCount(prev => (wasLiked ? prev + 1 : prev - 1));
      console.error('Error toggling like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const getCategoryInfo = (category: string | null) => {
    if (!category) return null;
    const categories: Record<string, {name: string; color: string}> = {
      'van-build': {name: 'Van Build', color: '#F59E0B'},
      travel: {name: 'Travel', color: '#10B981'},
      campsite: {name: 'Campsite', color: '#4A7C59'},
      'gear-review': {name: 'Gear', color: '#8B5CF6'},
      tips: {name: 'Tips', color: '#3B82F6'},
      meetup: {name: 'Meetup', color: '#EC4899'},
      question: {name: 'Question', color: '#F97316'},
      maintenance: {name: 'Maintenance', color: '#6B7280'},
      'remote-work': {name: 'Remote Work', color: '#0EA5E9'},
      pets: {name: 'Pets', color: '#A855F7'},
      cooking: {name: 'Cooking', color: '#EF4444'},
      'solar-power': {name: 'Solar', color: '#FBBF24'},
      budget: {name: 'Budget', color: '#22C55E'},
      lifestyle: {name: 'Lifestyle', color: '#F43F5E'},
      'for-sale': {name: 'For Sale', color: '#14B8A6'}
    };
    return categories[category] || null;
  };

  const categoryInfo = getCategoryInfo(post.category);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.authorRow}>
          {author?.profile_picture_url ? (
            <Image
              source={{uri: author.profile_picture_url}}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <MaterialCommunityIcons
                name="account"
                size={20}
                color="#6B7280"
              />
            </View>
          )}
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{displayName}</Text>
            <View style={styles.metaRow}>
              {post.location && (
                <>
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={12}
                    color="#4A7C59"
                  />
                  <Text style={styles.location}>{post.location}</Text>
                  <Text style={styles.dot}>•</Text>
                </>
              )}
              <Text style={styles.time}>{formatTimeAgo(post.created_at)}</Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.moreBtn}>
          <MaterialCommunityIcons
            name="dots-horizontal"
            size={20}
            color="#6B7280"
          />
        </TouchableOpacity>
      </View>

      {/* Category Badge */}
      {categoryInfo && (
        <View style={styles.categoryContainer}>
          <View
            style={[
              styles.categoryBadge,
              {backgroundColor: categoryInfo.color + '20'}
            ]}
          >
            <Text style={[styles.categoryText, {color: categoryInfo.color}]}>
              {categoryInfo.name}
            </Text>
          </View>
        </View>
      )}

      {/* Caption */}
      {post.caption && <Text style={styles.caption}>{post.caption}</Text>}

      {/* Media */}
      {post.post_media && post.post_media.length > 0 && (
        <View style={styles.mediaContainer}>
          <Image
            source={{uri: post.post_media[currentMediaIndex]?.media_url}}
            style={styles.media}
            resizeMode="cover"
          />
          {post.post_media.length > 1 && (
            <View style={styles.mediaIndicator}>
              <Text style={styles.mediaIndicatorText}>
                {currentMediaIndex + 1}/{post.post_media.length}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleLike}
          disabled={isLiking}
        >
          <MaterialCommunityIcons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={22}
            color={isLiked ? '#EF4444' : '#6B7280'}
          />
          {likesCount > 0 && (
            <Text
              style={[styles.actionText, isLiked && styles.actionTextLiked]}
            >
              {likesCount}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <MaterialCommunityIcons
            name="comment-outline"
            size={22}
            color="#6B7280"
          />
          {post.comments_count > 0 && (
            <Text style={styles.actionText}>{post.comments_count}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <MaterialCommunityIcons
            name="share-outline"
            size={22}
            color="#6B7280"
          />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, styles.bookmarkBtn]}>
          <MaterialCommunityIcons
            name="bookmark-outline"
            size={22}
            color="#6B7280"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20
  },
  avatarPlaceholder: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center'
  },
  authorInfo: {
    marginLeft: 10,
    flex: 1
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937'
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2
  },
  location: {
    fontSize: 12,
    color: '#4A7C59',
    marginLeft: 2
  },
  dot: {
    fontSize: 12,
    color: '#9CA3AF',
    marginHorizontal: 4
  },
  time: {
    fontSize: 12,
    color: '#9CA3AF'
  },
  moreBtn: {
    padding: 4
  },
  categoryContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500'
  },
  caption: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20
  },
  mediaContainer: {
    position: 'relative'
  },
  media: {
    width: width,
    height: width * 0.75,
    backgroundColor: '#F3F4F6'
  },
  mediaIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  mediaIndicatorText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500'
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6
  },
  actionText: {
    marginLeft: 4,
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500'
  },
  actionTextLiked: {
    color: '#EF4444'
  },
  bookmarkBtn: {
    marginLeft: 'auto'
  }
});
