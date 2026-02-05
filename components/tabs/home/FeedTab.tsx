import {supabase} from '@/services/supabase';
import {feedTabStyles as styles} from '@/styles';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
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
  post_type: 'feed' | 'poll' | 'image_poll';
  caption: string | null;
  location: string | null;
  category: string | null;
  visibility: 'everyone' | 'followers';
  created_at: string;
  profiles: PostAuthor;
  post_media: PostMedia[];
  likes_count: number;
  comments_count: number;
  poll_results?: PollResultOption[];
  poll_vote_option_id?: string | null;
}

interface PollResultOption {
  option_id: string;
  poll_id: string;
  option_text: string;
  display_order: number;
  post_id: string;
  ends_at: string;
  vote_count: number;
  total_votes: number;
}

interface FeedTabProps {
  refreshTrigger?: number;
}

const CACHE_TTL_MS = 60 * 1000;
const MENU_WIDTH = 140;
const MENU_OFFSET = 8;

export default function FeedTab({refreshTrigger}: FeedTabProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [votingPollIds, setVotingPollIds] = useState<Record<string, boolean>>(
    {}
  );
  const [followingUserIds, setFollowingUserIds] = useState<
    Record<string, boolean>
  >({});
  const [likedPostIds, setLikedPostIds] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [sharedPostIds, setSharedPostIds] = useState<Record<string, boolean>>(
    {}
  );
  const [shareCounts, setShareCounts] = useState<Record<string, number>>({});
  const [showMenu, setShowMenu] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const menuButtonRefs = useRef<Record<string, View | null>>({});

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
          post_type,
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
        .in('post_type', ['feed', 'poll', 'image_poll'])
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

      const pollPostIds = filtered
        .filter(p => p.post_type === 'poll' || p.post_type === 'image_poll')
        .map(p => p.id);

      let pollResultsByPostId: Record<string, PollResultOption[]> = {};
      let userVoteByPollId: Record<string, string> = {};

      if (pollPostIds.length > 0) {
        const {data: pollResultsData, error: pollResultsError} = await supabase
          .from('poll_results')
          .select('*')
          .in('post_id', pollPostIds);

        if (pollResultsError) {
          console.error('Error fetching poll results:', pollResultsError);
        } else {
          const grouped: Record<string, PollResultOption[]> = {};
          (pollResultsData || []).forEach(option => {
            if (!grouped[option.post_id]) grouped[option.post_id] = [];
            grouped[option.post_id].push(option);
          });

          Object.keys(grouped).forEach(postId => {
            grouped[postId].sort((a, b) => a.display_order - b.display_order);
          });

          pollResultsByPostId = grouped;

          if (userId) {
            const pollIds = Array.from(
              new Set((pollResultsData || []).map(r => r.poll_id))
            );

            if (pollIds.length > 0) {
              const {data: voteData, error: voteError} = await supabase
                .from('poll_votes')
                .select('poll_id, option_id')
                .eq('user_id', userId)
                .in('poll_id', pollIds);

              if (voteError) {
                console.error('Error fetching poll votes:', voteError);
              } else {
                (voteData || []).forEach(vote => {
                  userVoteByPollId[vote.poll_id] = vote.option_id;
                });
              }
            }
          }
        }
      }
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

          const pollResults = pollResultsByPostId[p.id] || [];
          const pollId = pollResults[0]?.poll_id;

          return {
            ...p,
            profiles: profileData,
            post_media: sortedMedia,
            likes_count: likesCount || 0,
            comments_count: commentsCount || 0,
            poll_results: pollResults,
            poll_vote_option_id: pollId ? userVoteByPollId[pollId] : null
          } as FeedPost;
        })
      );

      return withStats;
    } catch (e) {
      console.error('Error building feed:', e);
      return [];
    }
  };

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

  const {
    data: posts = [],
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['feed', currentUserId],
    queryFn: () => fetchPosts(currentUserId),
    enabled: currentUserId !== undefined,
    staleTime: CACHE_TTL_MS,
    gcTime: CACHE_TTL_MS * 5
  });

  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      refetch();
    }
  }, [refreshTrigger, refetch]);

  const voteMutation = useMutation({
    mutationFn: async ({
      pollId,
      optionId,
      userId
    }: {
      pollId: string;
      optionId: string;
      userId: string;
    }) => {
      const {error} = await supabase.from('poll_votes').insert({
        poll_id: pollId,
        option_id: optionId,
        user_id: userId
      });

      if (error && error.code !== '23505') {
        throw error;
      }
    },
    onMutate: async variables => {
      const {pollId, optionId, userId} = variables;
      setVotingPollIds(prev => ({...prev, [pollId]: true}));
      await queryClient.cancelQueries({queryKey: ['feed', userId]});
      const previous =
        queryClient.getQueryData<FeedPost[]>(['feed', userId]) || [];

      const next = previous.map(post => {
        if (!post.poll_results?.length) return post;
        const postPollId = post.poll_results[0]?.poll_id;
        if (postPollId !== pollId) return post;
        if (post.poll_vote_option_id) return post;

        const updatedResults = post.poll_results.map(option => {
          const increment = option.option_id === optionId ? 1 : 0;
          return {
            ...option,
            vote_count: option.vote_count + increment,
            total_votes: option.total_votes + 1
          };
        });

        return {
          ...post,
          poll_results: updatedResults,
          poll_vote_option_id: optionId
        };
      });

      queryClient.setQueryData(['feed', userId], next);

      return {previous, userId, pollId};
    },
    onError: (_error, _variables, context) => {
      if (!context) return;
      queryClient.setQueryData(['feed', context.userId], context.previous);
    },
    onSettled: (_data, _error, _variables, context) => {
      if (context?.pollId) {
        setVotingPollIds(prev => ({...prev, [context.pollId]: false}));
      }
      if (context?.userId) {
        queryClient.invalidateQueries({queryKey: ['feed', context.userId]});
      }
    }
  });

  const handleVote = (postId: string, pollId: string, optionId: string) => {
    if (!currentUserId) return;
    if (votingPollIds[pollId]) return;
    const existingVote = posts.find(p => p.id === postId)?.poll_vote_option_id;
    if (existingVote) return;
    voteMutation.mutate({
      pollId,
      optionId,
      userId: currentUserId
    });
  };

  const handleFollow = (authorId?: string | null) => {
    if (!authorId) return;
    setFollowingUserIds(prev => ({...prev, [authorId]: !prev[authorId]}));
  };

  const handleLike = (postId: string, baseCount: number) => {
    setLikedPostIds(prev => {
      const nextLiked = !prev[postId];
      setLikeCounts(counts => {
        const current = counts[postId] ?? baseCount;
        const next = nextLiked ? current + 1 : Math.max(baseCount, current - 1);
        return {...counts, [postId]: next};
      });
      return {...prev, [postId]: nextLiked};
    });
  };

  const handleShare = (postId: string, baseCount: number) => {
    setSharedPostIds(prev => {
      const nextShared = !prev[postId];
      setShareCounts(counts => {
        const current = counts[postId] ?? baseCount;
        const next = nextShared
          ? current + 1
          : Math.max(baseCount, current - 1);
        return {...counts, [postId]: next};
      });
      return {...prev, [postId]: nextShared};
    });
  };

  const renderItem = ({item}: {item: FeedPost}) => {
    const author = item.profiles;
    const authorId = author?.id || item.user_id;
    const displayName = author?.username
      ? `@${author.username}`
      : author?.display_name || 'Unknown';
    const firstMedia = item.post_media?.[0];
    const tags = item.category
      ? item.category
          .split(',')
          .map(tag => tag.trim())
          .filter(Boolean)
      : [];
    const actionTags = tags.slice(0, 2);
    const pollOptions = item.poll_results || [];
    const pollId = pollOptions[0]?.poll_id;
    const totalVotes = pollOptions[0]?.total_votes || 0;
    const hasVoted = !!item.poll_vote_option_id;
    const isVoting = pollId ? !!votingPollIds[pollId] : false;
    const isPoll = item.post_type === 'poll';
    const isImagePoll = item.post_type === 'image_poll';
    const isFollowing = !!followingUserIds[authorId];
    const isLiked = !!likedPostIds[item.id];
    const isShared = !!sharedPostIds[item.id];
    const likeCount = likeCounts[item.id] ?? item.likes_count;
    const shareCount = shareCounts[item.id] ?? 0;

    return (
      <View style={styles.feedPost}>
        <View style={styles.feedHeader}>
          <View style={styles.feedHeaderLeft}>
            {author?.profile_picture_url ? (
              <Image
                source={{uri: author.profile_picture_url}}
                style={styles.feedHeaderAvatar}
              />
            ) : (
              <View
                style={[
                  styles.feedHeaderAvatar,
                  styles.feedHeaderAvatarPlaceholder
                ]}
              >
                <MaterialCommunityIcons
                  name="account"
                  size={20}
                  color="#6B7280"
                />
              </View>
            )}
            <View style={styles.feedHeaderInfo}>
              <View style={styles.feedHeaderTopRow}>
                <Text style={styles.feedHeaderName}>{displayName}</Text>
                <TouchableOpacity
                  style={[
                    styles.followButton,
                    isFollowing && styles.followButtonActive
                  ]}
                  onPress={() => handleFollow(authorId)}
                >
                  <Text
                    style={[
                      styles.followButtonText,
                      isFollowing && styles.followButtonTextActive
                    ]}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Text>
                </TouchableOpacity>
              </View>
              {!!item.location && (
                <View style={styles.feedHeaderLocationRow}>
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={12}
                    color="#6B7280"
                  />
                  <Text style={styles.feedHeaderLocationText}>
                    {item.location}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View
            ref={ref => {
              menuButtonRefs.current[item.id] = ref;
            }}
            collapsable={false}
          >
            <TouchableOpacity
              style={styles.feedHeaderMenu}
              onPress={() => {
                const ref = menuButtonRefs.current[item.id];
                if (ref?.measureInWindow) {
                  ref.measureInWindow((x, y, width, height) => {
                    setMenuAnchor({x, y, width, height});
                    setShowMenu(prev => !prev);
                  });
                  return;
                }
                setShowMenu(prev => !prev);
              }}
            >
              <MaterialCommunityIcons
                name="dots-horizontal"
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
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

        {(isPoll || isImagePoll) && pollOptions.length > 0 && (
          <View style={styles.pollContainer}>
            {pollOptions.map(option => {
              const percent =
                option.total_votes > 0
                  ? Math.round((option.vote_count / option.total_votes) * 100)
                  : 0;
              const isSelected = option.option_id === item.poll_vote_option_id;
              return (
                <TouchableOpacity
                  key={option.option_id}
                  style={[
                    styles.pollOption,
                    isSelected && styles.pollOptionSelected
                  ]}
                  onPress={() =>
                    pollId &&
                    !hasVoted &&
                    !isVoting &&
                    handleVote(item.id, pollId, option.option_id)
                  }
                  disabled={hasVoted || isVoting}
                >
                  <View style={styles.pollOptionFill} />
                  <View
                    style={[
                      styles.pollOptionFillActive,
                      {width: `${percent}%`}
                    ]}
                  />
                  <View style={styles.pollOptionContent}>
                    <Text style={styles.pollOptionText}>
                      {option.option_text}
                    </Text>
                    <Text style={styles.pollOptionPercent}>{percent}%</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            <Text style={styles.pollMetaText}>{totalVotes} votes</Text>
          </View>
        )}

        <View style={styles.feedActionsSeparator} />
        <View style={styles.feedPostActions}>
          <TouchableOpacity
            style={styles.feedAction}
            onPress={() => handleLike(item.id, item.likes_count)}
          >
            <MaterialCommunityIcons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={20}
              color={isLiked ? '#2E7D64' : '#6B7280'}
            />
            <Text
              style={[
                styles.feedActionText,
                isLiked && styles.actionActiveText
              ]}
            >
              {likeCount}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.feedAction}
            onPress={() => setCommentPostId(item.id)}
          >
            <MaterialCommunityIcons
              name="comment-outline"
              size={20}
              color="#6B7280"
            />
            <Text style={styles.feedActionText}>Comment</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.feedAction}
            onPress={() => handleShare(item.id, 0)}
          >
            <MaterialCommunityIcons
              name="share-outline"
              size={20}
              color={isShared ? '#2E7D64' : '#6B7280'}
            />
            <Text
              style={[
                styles.feedActionText,
                isShared && styles.actionActiveText
              ]}
            >
              {shareCount}
            </Text>
          </TouchableOpacity>
          {actionTags.length > 0 && (
            <View style={styles.actionTagsWrap}>
              {actionTags.map(tag => (
                <View key={tag} style={styles.actionTagPill}>
                  <Text style={styles.actionTagText}>
                    {tag.toUpperCase().replace(/-/g, ' ')}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  if (isLoading) {
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

      <Modal
        transparent
        animationType="fade"
        visible={showMenu}
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
          style={[
            styles.menuBackdrop,
            {
              paddingTop:
                menuAnchor?.y != null
                  ? menuAnchor.y + menuAnchor.height + MENU_OFFSET
                  : 0,
              paddingLeft:
                menuAnchor?.x != null
                  ? Math.max(8, menuAnchor.x + menuAnchor.width - MENU_WIDTH)
                  : 0
            }
          ]}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              // keep menu open when tapping inside
            }}
            style={styles.menuSheet}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setShowMenu(false)}
            >
              <MaterialCommunityIcons
                name="eye-off-outline"
                size={16}
                color="#334155"
              />
              <Text style={styles.menuItemText}>Hide</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setShowMenu(false)}
            >
              <MaterialCommunityIcons
                name="bookmark-outline"
                size={16}
                color="#334155"
              />
              <Text style={styles.menuItemText}>Save</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        transparent
        animationType="slide"
        visible={!!commentPostId}
        onRequestClose={() => setCommentPostId(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setCommentPostId(null)}
        >
          <Pressable style={styles.modalCard}>
            <View style={styles.commentHeaderRow}>
              <Text style={styles.commentHeaderTitle}>Comments</Text>
            </View>
            <ScrollView
              contentContainerStyle={styles.commentList}
              showsVerticalScrollIndicator={false}
            >
              {[
                {
                  id: '1',
                  name: 'ashahfawgs',
                  time: '6d',
                  text: "Where is this? Can the public view it? It's unbelievably beautiful",
                  likes: '80'
                },
                {
                  id: '2',
                  name: 'towstudios',
                  time: '6d',
                  text: 'Where is this? Its amazing',
                  likes: '10'
                },
                {
                  id: '3',
                  name: 'challah_cat',
                  time: '3d',
                  text: 'This reminds me of the airport in Madrid...',
                  likes: '4'
                }
              ].map(comment => (
                <View key={comment.id} style={styles.commentItem}>
                  <View style={styles.commentAvatar}>
                    <MaterialCommunityIcons
                      name="account"
                      size={18}
                      color="#6B7280"
                    />
                  </View>
                  <View style={styles.commentContent}>
                    <View style={styles.commentRowTop}>
                      <View style={styles.commentNameRow}>
                        <Text style={styles.commentUsername}>
                          {comment.name}
                        </Text>
                        <Text style={styles.commentMeta}>{comment.time}</Text>
                        <TouchableOpacity
                          style={styles.commentFollowButton}
                          onPress={() => handleFollow(`comment-${comment.id}`)}
                        >
                          <Text style={styles.commentFollowText}>Follow</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.commentLikeRow}>
                        <MaterialCommunityIcons
                          name="heart-outline"
                          size={16}
                          color="#9CA3AF"
                        />
                        <Text style={styles.commentLikeText}>
                          {comment.likes}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.commentText}>{comment.text}</Text>
                    <Text style={styles.commentReply}>Reply</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            <View style={styles.commentComposer}>
              <View style={styles.commentComposerAvatar}>
                <MaterialCommunityIcons
                  name="account"
                  size={18}
                  color="#6B7280"
                />
              </View>
              <View style={styles.commentComposerField}>
                <TextInput
                  placeholder="Add a comment for architectand..."
                  placeholderTextColor="#9CA3AF"
                />
                <MaterialCommunityIcons
                  name="sticker-emoji"
                  size={18}
                  color="#9CA3AF"
                />
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
