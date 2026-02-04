import {supabase} from '@/services/supabase';
import {feedTabStyles as styles} from '@/styles';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

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

export default function FeedTab({refreshTrigger}: FeedTabProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [votingPollIds, setVotingPollIds] = useState<Record<string, boolean>>({});
  const queryClient = useQueryClient();

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
      const {error} = await supabase
        .from('poll_votes')
        .insert({
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
      const previous = queryClient.getQueryData<FeedPost[]>(['feed', userId]) || [];

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

  const renderItem = ({item}: {item: FeedPost}) => {
    const author = item.profiles;
    const displayName = author?.username
      ? `@${author.username}`
      : author?.display_name || 'Unknown';
    const firstMedia = item.post_media?.[0];
    const pollOptions = item.poll_results || [];
    const pollId = pollOptions[0]?.poll_id;
    const totalVotes = pollOptions[0]?.total_votes || 0;
    const hasVoted = !!item.poll_vote_option_id;
    const isVoting = pollId ? !!votingPollIds[pollId] : false;
    const isPoll = item.post_type === 'poll';
    const isImagePoll = item.post_type === 'image_poll';

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
            {(isPoll || isImagePoll) && (
              <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 2}}>
                <MaterialCommunityIcons
                  name={isImagePoll ? 'image' : 'poll'}
                  size={12}
                  color="#6B7280"
                />
                <Text style={{fontSize: 12, color: '#6B7280', marginLeft: 4}}>
                  {isImagePoll ? 'Image Poll' : 'Community Poll'}
                </Text>
              </View>
            )}
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
                    pollId && !hasVoted && !isVoting && handleVote(item.id, pollId, option.option_id)
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
            <Text style={styles.pollMetaText}>
              {totalVotes} votes
            </Text>
          </View>
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
    </View>
  );
}
