import {showToast} from '@/components/Toast';
import {supabase} from '@/services/supabase';
import {useFindTechStore} from '@/store/techStore';
import {useUserStore} from '@/store/userStore';
import {useRevenueCatSubscription} from '@/hooks/use-revenuecat-subscription';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useRouter} from 'expo-router';
import {useFocusEffect} from '@react-navigation/native';
import * as Location from 'expo-location';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface DiscussionPost {
  id: string;
  author: {
    name: string;
    handle: string;
    avatarUrl: string | null;
  };
  body: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  liked: boolean;
  disliked: boolean;
  shared: boolean;
}

interface DiscussionComment {
  id: string;
  author: string;
  body: string;
  created_at: string;
}

export default function FindTechTab() {
  const {width: windowWidth, height: windowHeight} = Dimensions.get('window');
  const H_PADDING = Math.max(16, Math.round(windowWidth * 0.05));
  const V_SPACING = Math.max(10, Math.round(windowHeight * 0.015));
  const MARKETPLACE_GAP = 14;
  const marketplaceCardWidth = Math.floor(
    (windowWidth - H_PADDING * 2 - MARKETPLACE_GAP) / 2
  );
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('mechanics');
  const [mechanicTab, setMechanicTab] = useState('requests');
  const [scanned, setScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const scanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scanSweep = useRef(new Animated.Value(0)).current;
  const scanPulse = useRef(new Animated.Value(0)).current;
  const scanSweepRef = useRef<Animated.CompositeAnimation | null>(null);
  const scanPulseRef = useRef<Animated.CompositeAnimation | null>(null);
  const [showHireModal, setShowHireModal] = useState(false);
  const [showSignalModal, setShowSignalModal] = useState(false);
  const [signalLocation, setSignalLocation] = useState('');
  const [signalStatus, setSignalStatus] = useState('');
  const [signalDescription, setSignalDescription] = useState('');
  const [loadingSignalLocation, setLoadingSignalLocation] = useState(false);
  const [sendingSignal, setSendingSignal] = useState(false);
  const [sendingNotify, setSendingNotify] = useState(false);
  const [helpSignals, setHelpSignals] = useState<
    {
      id: string;
      location: string;
      status: 'emergency' | 'urgent' | 'normal';
      description: string | null;
      created_at: string | null;
      profile: {
        id: string;
        username: string | null;
        display_name: string | null;
        current_location: string | null;
        profile_picture_url: string | null;
      } | null;
    }[]
  >([]);
  const [loadingHelpSignals, setLoadingHelpSignals] = useState(false);
  const [helpSignalsError, setHelpSignalsError] = useState<string | null>(null);
  const [selectedTech, setSelectedTech] = useState<{
    id: string;
    display_name: string | null;
    username: string | null;
    bio: string | null;
    current_location: string | null;
    profile_picture_url: string | null;
    is_verified: boolean | null;
    mechanic_whatsapp: string | null;
    mechanic_email: string | null;
    mechanic_instagram: string | null;
  } | null>(null);
  const userProfile = useUserStore(state => state.profile);
  const contactName =
    selectedTech?.display_name || selectedTech?.username || 'Nomad';
  const contactHandle = contactName.toLowerCase().replace(/\s+/g, '');
  const contactEmail =
    selectedTech?.mechanic_email?.trim() || `${contactHandle}@gmail.com`;
  const contactWhatsapp =
    selectedTech?.mechanic_whatsapp?.trim() || '+1 (555) 014-2248';
  const contactInstagramRaw = selectedTech?.mechanic_instagram?.trim();
  const contactInstagram = contactInstagramRaw
    ? contactInstagramRaw.startsWith('@')
      ? contactInstagramRaw
      : `@${contactInstagramRaw}`
    : `@${contactHandle}`;
  const [showDiscussionModal, setShowDiscussionModal] = useState(false);
  const [discussionDraft, setDiscussionDraft] = useState('');
  const [discussionPosts, setDiscussionPosts] = useState<DiscussionPost[]>([
    {
      id: 'discussion-1',
      author: {
        name: 'Ari Novak',
        handle: '@wrenchwave',
        avatarUrl: null
      },
      body: 'Anyone have a quick fix for a squealing serpentine belt after a long desert run? Heard about soap trick but unsure.',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      likes_count: 12,
      comments_count: 1,
      shares_count: 1,
      liked: false,
      disliked: false,
      shared: false
    },
    {
      id: 'discussion-2',
      author: {
        name: 'Maya Patel',
        handle: '@trailgarage',
        avatarUrl: null
      },
      body: 'Pro tip: keep a spare crank sensor in your kit. Saved my weekend and cost $22.',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
      likes_count: 31,
      comments_count: 0,
      shares_count: 3,
      liked: true,
      disliked: false,
      shared: false
    }
  ]);
  const [discussionComments, setDiscussionComments] = useState<
    Record<string, DiscussionComment[]>
  >({
    'discussion-1': [
      {
        id: 'discussion-1-comment-1',
        author: '@boxerfix',
        body: 'Try a light mist of water to confirm belt slip first.',
        created_at: new Date(Date.now() - 1000 * 60 * 40).toISOString()
      }
    ],
    'discussion-2': []
  });
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [discussionFollowing, setDiscussionFollowing] = useState<
    Record<string, boolean>
  >({});
  const {
    isSubscribed,
    isLoading: isSubscriptionLoading,
    refresh
  } = useRevenueCatSubscription();

  // ✅ Fix: select each piece individually (no object literal)
  const mechanics = useFindTechStore(state => state.mechanics);
  const loading = useFindTechStore(state => state.loading);
  const error = useFindTechStore(state => state.error);
  const fetchMechanics = useFindTechStore(state => state.fetchMechanics);
  const followingIds = useFindTechStore(state => state.followingIds);
  const toggleFollow = useFindTechStore(state => state.toggleFollow);

  useEffect(() => {
    if (!userProfile) return;
    const isMechanic = userProfile.nomad_type?.toLowerCase() === 'mechanic';
    if (!isMechanic) {
      fetchMechanics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile?.nomad_type]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  useEffect(() => {
    const inMarketplace =
      (userProfile?.nomad_type?.toLowerCase() === 'mechanic' &&
        mechanicTab === 'marketplace') ||
      (userProfile?.nomad_type?.toLowerCase() !== 'mechanic' &&
        activeTab === 'marketplace');

    if (inMarketplace) {
      refresh();
    }
  }, [activeTab, mechanicTab, refresh, userProfile?.nomad_type]);

  useEffect(() => {
    if (!userProfile) return;
    const isMechanicProfile =
      userProfile.nomad_type?.toLowerCase() === 'mechanic';
    if (!isMechanicProfile) return;

    const fetchHelpSignals = async () => {
      setLoadingHelpSignals(true);
      setHelpSignalsError(null);
      try {
        const {data, error} = await supabase
          .from('help_signals')
          .select(
            `
            id,
            location,
            status,
            description,
            created_at,
            profiles:profiles!help_signals_user_id_fkey (
              id,
              username,
              display_name,
              current_location,
              profile_picture_url
            )
          `
          )
          .order('created_at', {ascending: false});

        if (error) {
          throw error;
        }

        const normalized = (data || []).map(item => ({
          id: item.id,
          location: item.location,
          status: item.status,
          description: item.description ?? null,
          created_at: item.created_at ?? null,
          profile: Array.isArray(item.profiles)
            ? item.profiles[0] ?? null
            : item.profiles ?? null
        }));

        setHelpSignals(normalized);
      } catch (err) {
        console.error('Fetch help signals error:', err);
        setHelpSignalsError('Unable to load requests right now.');
      } finally {
        setLoadingHelpSignals(false);
      }
    };

    fetchHelpSignals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile?.nomad_type]);

  const handleFollow = async (id: string) => {
    const isFollowing = followingIds.includes(id);
    try {
      await toggleFollow(id);
      showToast(
        'success',
        isFollowing ? 'Unfollowed' : 'Following',
        isFollowing
          ? 'You no longer follow this mechanic.'
          : 'Mechanic added to your following.'
      );
    } catch (err) {
      console.error('Follow error:', err);
      showToast('error', 'Error', 'Unable to update follow status.');
    }
  };

  const handleScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    const delayMs = 3000 + Math.floor(Math.random() * 2001);
    if (scanTimerRef.current) {
      clearTimeout(scanTimerRef.current);
    }
    scanTimerRef.current = setTimeout(() => {
      setIsScanning(false);
      setScanned(true);
    }, delayMs);
  };

  const getLocationName = async (latitude: number, longitude: number) => {
    try {
      const result = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });
      if (result[0]) {
        const {city, region, country} = result[0];
        return `${city || region}, ${country}`;
      }
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  };

  const handleGetSignalLocation = async () => {
    setLoadingSignalLocation(true);
    try {
      const {status} = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showToast(
          'error',
          'Permission Denied',
          'Location permission is required'
        );
        setLoadingSignalLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });

      const locationName = await getLocationName(
        location.coords.latitude,
        location.coords.longitude
      );

      setSignalLocation(locationName);
      showToast('success', 'Location Found', locationName);
    } catch (error) {
      console.error('Location error:', error);
    } finally {
      setLoadingSignalLocation(false);
    }
  };

  const handleSignalRequest = () => {
    setShowSignalModal(true);
  };

  const handleSubmitSignal = async () => {
    if (!signalLocation.trim()) {
      showToast('error', 'Required', 'Please set your current location.');
      return;
    }
    if (!signalStatus) {
      showToast('error', 'Required', 'Please select a status.');
      return;
    }
    if (!userProfile?.id) {
      showToast('error', 'Profile Error', 'Please sign in again.');
      return;
    }

    setSendingSignal(true);
    try {
      const {error} = await supabase.from('help_signals').insert({
        user_id: userProfile.id,
        location: signalLocation.trim(),
        status: signalStatus.toLowerCase(),
        description: signalDescription.trim() || null
      });

      if (error) {
        throw error;
      }

      setShowSignalModal(false);
      showToast(
        'success',
        'Signal sent',
        'Nearby mechanics have been notified.'
      );
      setSignalDescription('');
      setSignalStatus('');
      setSignalLocation('');
    } catch (err) {
      console.error('Signal submit error:', err);
      showToast('error', 'Send failed', 'Unable to send signal right now.');
    } finally {
      setSendingSignal(false);
    }
  };

  const handleNotifyMechanic = async () => {
    if (!selectedTech?.id) {
      showToast('error', 'Select mechanic', 'Please choose a mechanic first.');
      return;
    }
    if (!userProfile?.id) {
      showToast('error', 'Profile Error', 'Please sign in again.');
      return;
    }

    const requesterName =
      userProfile.display_name || userProfile.username || 'A traveler';
    const title = 'New service request';
    const message = `${requesterName} wants to get in touch about a repair. Check your contacts or social media accounts for possible message inquiries from ${requesterName}.`;

    setSendingNotify(true);
    try {
      const {error} = await supabase.from('notifications').insert({
        recipient_id: selectedTech.id,
        actor_id: userProfile.id,
        type: 'mechanic_request',
        title,
        message
      });

      if (error) {
        throw error;
      }

      setShowHireModal(false);
      showToast(
        'success',
        'Mechanic notified',
        'Your request was sent successfully.'
      );
    } catch (err) {
      console.error('Notify mechanic error:', err);
      showToast('error', 'Send failed', 'Unable to notify this mechanic.');
    } finally {
      setSendingNotify(false);
    }
  };

  const formatRelativeTime = (isoDate: string) => {
    const now = Date.now();
    const then = new Date(isoDate).getTime();
    const diff = Math.max(0, now - then);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return 'Just now';
  };

  const handleCreateDiscussionPost = () => {
    if (!discussionDraft.trim()) {
      showToast('error', 'Add text', 'Please write something to post.');
      return;
    }

    const displayName =
      userProfile?.display_name || userProfile?.username || 'Nomad';
    const handle = userProfile?.username
      ? `@${userProfile.username}`
      : `@${displayName.toLowerCase().replace(/\s+/g, '')}`;
    const avatarUrl = userProfile?.profile_picture_url || null;

    const newPost: DiscussionPost = {
      id: `discussion-${Date.now()}`,
      author: {
        name: displayName,
        handle,
        avatarUrl
      },
      body: discussionDraft.trim(),
      created_at: new Date().toISOString(),
      likes_count: 0,
      comments_count: 0,
      shares_count: 0,
      liked: false,
      disliked: false,
      shared: false
    };

    setDiscussionPosts(prev => [newPost, ...prev]);
    setDiscussionDraft('');
    setShowDiscussionModal(false);
  };

  const updateDiscussionPost = (
    postId: string,
    updater: (post: DiscussionPost) => DiscussionPost
  ) => {
    setDiscussionPosts(prev =>
      prev.map(post => (post.id === postId ? updater(post) : post))
    );
  };

  const handleDiscussionLike = (postId: string) => {
    updateDiscussionPost(postId, post => {
      const nextLiked = !post.liked;
      const nextCount = nextLiked
        ? post.likes_count + 1
        : Math.max(0, post.likes_count - 1);
      return {
        ...post,
        liked: nextLiked,
        disliked: nextLiked ? false : post.disliked,
        likes_count: nextCount
      };
    });
  };

  const handleDiscussionShare = (postId: string) => {
    updateDiscussionPost(postId, post => {
      const nextShared = !post.shared;
      const nextCount = nextShared
        ? post.shares_count + 1
        : Math.max(0, post.shares_count - 1);
      return {...post, shared: nextShared, shares_count: nextCount};
    });
  };

  const handleDiscussionDislike = (postId: string) => {
    updateDiscussionPost(postId, post => {
      const nextDisliked = !post.disliked;
      const nextCount = post.liked
        ? Math.max(0, post.likes_count - 1)
        : post.likes_count;
      return {
        ...post,
        liked: false,
        disliked: nextDisliked,
        likes_count: nextCount
      };
    });
  };

  const handleAddComment = () => {
    if (!commentPostId) return;
    if (!commentDraft.trim()) {
      showToast('error', 'Add a comment', 'Please write a comment to post.');
      return;
    }

    const newComment: DiscussionComment = {
      id: `comment-${Date.now()}`,
      author:
        userProfile?.username != null ? `@${userProfile.username}` : 'Nomad',
      body: commentDraft.trim(),
      created_at: new Date().toISOString()
    };

    setDiscussionComments(prev => ({
      ...prev,
      [commentPostId]: [...(prev[commentPostId] || []), newComment]
    }));

    updateDiscussionPost(commentPostId, post => ({
      ...post,
      comments_count: post.comments_count + 1
    }));

    setCommentDraft('');
  };

  const handleDiscussionFollow = (authorHandle: string) => {
    setDiscussionFollowing(prev => ({
      ...prev,
      [authorHandle]: !prev[authorHandle]
    }));
  };

  const handleRequestInvite = () => {
    router.push('/membership-subscription');
  };

  const handleOpenBuilderHelp = (route: string) => {
    router.push(route);
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="account-wrench" size={48} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No verified builders yet</Text>
      <Text style={styles.emptySubtitle}>
        Verified builders will appear here once available.
      </Text>
    </View>
  );

  const renderTechCard = (tech: {
    id: string;
    display_name: string | null;
    username: string | null;
    bio: string | null;
    current_location: string | null;
    profile_picture_url: string | null;
    is_verified: boolean | null;
    skills: string[] | null;
    mechanic_whatsapp: string | null;
    mechanic_email: string | null;
    mechanic_instagram: string | null;
  }) => {
    const name = tech.display_name || tech.username || 'Nomad';
    const location = tech.current_location || 'Unknown location';
    const isFollowing = followingIds.includes(tech.id);

    return (
      <View key={tech.id} style={styles.techCard}>
        <View style={styles.cardHeader}>
          {tech.profile_picture_url ? (
            <Image
              source={{uri: tech.profile_picture_url}}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <MaterialCommunityIcons
                name="account"
                size={28}
                color="#9CA3AF"
              />
            </View>
          )}
          <View style={styles.infoContainer}>
            <View style={styles.nameRow}>
              <Text style={styles.techName}>{name}</Text>
              {tech.is_verified && (
                <MaterialCommunityIcons
                  name="check-decagram"
                  size={16}
                  color="#2563EB"
                />
              )}
            </View>
            <View style={styles.locationRow}>
              <MaterialCommunityIcons
                name="map-marker"
                size={14}
                color="#6B7280"
              />
              <Text style={styles.locationText}>{location}</Text>
            </View>
            <Text style={styles.bioDescript}>
              {tech.bio || 'No bio available yet.'}
            </Text>
          </View>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[
              styles.followButton,
              isFollowing && styles.followButtonActive
            ]}
            onPress={() => handleFollow(tech.id)}
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
          <TouchableOpacity
            style={styles.hireButton}
            onPress={() => {
              setSelectedTech(tech);
              setShowHireModal(true);
            }}
          >
            <Text style={styles.hireButtonText}>Get in Touch</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const featuredList = mechanics.slice(0, 3);
  const scanList = mechanics.slice(0, 2);
  const isMechanic = userProfile?.nomad_type?.toLowerCase() === 'mechanic';
  const builderHelpItems = [
    {
      title: 'Build Guides',
      subtitle:
        'Step-by-step plans created by experienced builders to help nomads confidently design and complete van projects.',
      icon: 'book-open-page-variant',
      route: '/(app)/builder-help/build-guides',
      accent: '#2E7D64',
      tint: '#E7F5EF',
      border: '#CFE9DD'
    },
    {
      title: 'Troubleshooting Q&A',
      subtitle:
        'Ask questions and get reliable solutions from verified builders when you run into issues on the road or during a build.',
      icon: 'chat-question',
      route: '/(app)/builder-help/troubleshooting-qa',
      accent: '#0F766E',
      tint: '#E1F3F1',
      border: '#CBE7E2'
    },
    {
      title: 'Supplier Resources',
      subtitle:
        'A curated directory of trusted vendors and parts lists, organized by builders and nomads to save time and avoid guesswork.',
      icon: 'truck-delivery',
      route: '/(app)/builder-help/supplier-resources',
      accent: '#C2410C',
      tint: '#FCEFE6',
      border: '#F5D8C9'
    },
    {
      title: 'Community Support',
      subtitle:
        'Private discussion threads that connect you with other builders for advice, feedback, and collaboration.',
      icon: 'account-group',
      route: '/(app)/builder-help/community-support',
      accent: '#1D4ED8',
      tint: '#E8F0FE',
      border: '#D3E0FD'
    }
  ];

  const getStatusLabel = (status: 'emergency' | 'urgent' | 'normal') => {
    if (status === 'emergency') return 'Emergency';
    if (status === 'urgent') return 'Urgent';
    return 'Normal';
  };

  const getStatusBadgeStyle = (status: 'emergency' | 'urgent' | 'normal') => {
    if (status === 'emergency') return styles.statusBadgeEmergency;
    if (status === 'urgent') return styles.statusBadgeUrgent;
    return styles.statusBadgeNormal;
  };

  const getStatusTextStyle = (status: 'emergency' | 'urgent' | 'normal') => {
    if (status === 'emergency') return styles.statusBadgeTextEmergency;
    if (status === 'urgent') return styles.statusBadgeTextUrgent;
    return styles.statusBadgeTextNormal;
  };

  useEffect(() => {
    return () => {
      if (scanTimerRef.current) {
        clearTimeout(scanTimerRef.current);
      }
      scanSweepRef.current?.stop();
      scanPulseRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (activeTab !== 'mechanics' && isScanning) {
      if (scanTimerRef.current) {
        clearTimeout(scanTimerRef.current);
      }
      setIsScanning(false);
    }
  }, [activeTab, isScanning]);

  useEffect(() => {
    if (!isScanning) {
      scanSweepRef.current?.stop();
      scanPulseRef.current?.stop();
      scanSweep.setValue(0);
      scanPulse.setValue(0);
      return;
    }

    const sweepAnim = Animated.loop(
      Animated.timing(scanSweep, {
        toValue: 1,
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: true
      })
    );
    scanSweepRef.current = sweepAnim;
    sweepAnim.start();

    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(scanPulse, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true
        }),
        Animated.timing(scanPulse, {
          toValue: 0,
          duration: 1200,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true
        })
      ])
    );
    scanPulseRef.current = pulseAnim;
    pulseAnim.start();

    return () => {
      sweepAnim.stop();
      pulseAnim.stop();
    };
  }, [isScanning, scanPulse, scanSweep]);

  const renderMarketplace = () => (
    <ScrollView
      style={styles.contentContainer}
      contentContainerStyle={{
        paddingHorizontal: H_PADDING,
        paddingBottom: V_SPACING * 2
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.marketplaceHeader}>
        <Text style={styles.marketplaceTitle}>Welcome to the Marketplace</Text>
        <Text style={styles.marketplaceSubtitle}>
          Your central hub for tools, knowledge, and community built for nomads
          and builders alike.
        </Text>
      </View>

      <View style={styles.marketplaceGrid}>
        {builderHelpItems.map(item => {
          const primaryAccent = builderHelpItems[0];
          const accent = primaryAccent.accent;
          const tint = primaryAccent.tint;
          const border = primaryAccent.border;
          return (
            <TouchableOpacity
              key={item.title}
              style={[
                styles.marketplaceCard,
                {
                  borderColor: border,
                  width: marketplaceCardWidth,
                  marginBottom: MARKETPLACE_GAP
                }
              ]}
              onPress={() => {
                if (!isSubscribed) {
                  showToast(
                    'info',
                    'Unlock Premium',
                    'Subscribe to access Marketplace tools.'
                  );
                  return;
                }
                handleOpenBuilderHelp(item.route);
              }}
              activeOpacity={0.9}
            >
              <View
                style={[
                  styles.marketplaceCardAccent,
                  {backgroundColor: accent}
                ]}
              />
              <View
                style={[styles.marketplaceCardIcon, {backgroundColor: tint}]}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={22}
                  color={accent}
                />
              </View>
              <Text style={styles.marketplaceCardTitle}>{item.title}</Text>
              <Text style={styles.marketplaceCardSubtitle}>
                {item.subtitle}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {!isSubscribed && (
        <TouchableOpacity
          style={styles.requestInviteButton}
          onPress={handleRequestInvite}
        >
          <View style={styles.requestInviteButtonContent}>
            <MaterialCommunityIcons name="crown" size={18} color="#ffffff" />
            <Text style={styles.requestInviteButtonText}>
              Unlock Marketplace
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </ScrollView>
  );

  const sweepRotate = scanSweep.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const pulseScale = scanPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1.05]
  });

  const pulseOpacity = scanPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0]
  });

  if (!userProfile) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#2E7D64" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  if (isMechanic) {
    return (
      <View style={styles.container}>
        <View style={styles.topNavContainer}>
          <View style={styles.topNav}>
            {[
              {label: 'Help Requests', value: 'requests'},
              {label: 'Marketplace', value: 'marketplace'}
            ].map(tab => (
              <TouchableOpacity
                key={tab.value}
                style={[
                  styles.tabButton,
                  mechanicTab === tab.value && styles.tabButtonActive
                ]}
                onPress={() => setMechanicTab(tab.value)}
              >
                <Text
                  style={[
                    styles.tabText,
                    mechanicTab === tab.value && styles.tabTextActive
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {mechanicTab === 'marketplace' && renderMarketplace()}

        {mechanicTab === 'requests' && (
          <ScrollView
            style={styles.contentContainer}
            contentContainerStyle={{
              paddingHorizontal: H_PADDING,
              paddingBottom: V_SPACING * 2
            }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.mechanicHeader}>
              <Text style={styles.mechanicTitle}>Community Requests</Text>
              <Text style={styles.mechanicSubtitle}>
                Nearby travelers are looking for support
              </Text>
            </View>
            {loadingHelpSignals ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="large" color="#2E7D64" />
              </View>
            ) : helpSignals.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={44}
                  color="#CBD5F5"
                />
                <Text style={styles.emptyTitle}>No active signals yet</Text>
                <Text style={styles.emptySubtitle}>
                  New requests will appear here as they come in.
                </Text>
              </View>
            ) : (
              helpSignals.map(request => {
                const profile = request.profile;
                const displayName =
                  profile?.display_name || profile?.username || 'Nomad';
                const profileLocation =
                  profile?.current_location || request.location;
                const description =
                  request.description || 'No description provided.';

                return (
                  <View key={request.id} style={styles.helpCard}>
                    <View style={styles.helpHeader}>
                      {profile?.profile_picture_url ? (
                        <Image
                          source={{uri: profile.profile_picture_url}}
                          style={styles.helpAvatarImage}
                        />
                      ) : (
                        <View style={styles.helpAvatar}>
                          <MaterialCommunityIcons
                            name="account"
                            size={22}
                            color="#94A3B8"
                          />
                        </View>
                      )}
                      <View style={styles.helpInfo}>
                        <View style={styles.helpTitleRow}>
                          <Text style={styles.helpName}>{displayName}</Text>
                          <View
                            style={[
                              styles.statusBadge,
                              getStatusBadgeStyle(request.status)
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusBadgeText,
                                getStatusTextStyle(request.status)
                              ]}
                            >
                              {getStatusLabel(request.status)}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.locationRow}>
                          <MaterialCommunityIcons
                            name="map-marker"
                            size={14}
                            color="#6B7280"
                          />
                          <Text style={styles.locationText}>
                            {profileLocation}
                          </Text>
                        </View>
                        <Text style={styles.helpIssue}>{description}</Text>
                      </View>
                    </View>

                    <TouchableOpacity style={styles.respondButton}>
                      <Text style={styles.respondButtonText}>Respond</Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
            {helpSignalsError && (
              <Text style={styles.errorText}>{helpSignalsError}</Text>
            )}
          </ScrollView>
        )}

        <Modal
          visible={showDiscussionModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDiscussionModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.discussionModalCard}>
              <View style={styles.discussionModalHeader}>
                <Text style={styles.discussionModalTitle}>New Post</Text>
                <TouchableOpacity onPress={() => setShowDiscussionModal(false)}>
                  <MaterialCommunityIcons
                    name="close"
                    size={22}
                    color="#64748b"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.discussionModalUserRow}>
                {userProfile?.profile_picture_url ? (
                  <Image
                    source={{uri: userProfile.profile_picture_url}}
                    style={styles.discussionModalAvatar}
                  />
                ) : (
                  <View
                    style={[
                      styles.discussionModalAvatar,
                      styles.discussionAvatarPlaceholder
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="account"
                      size={20}
                      color="#64748b"
                    />
                  </View>
                )}
                <View>
                  <Text style={styles.discussionModalName}>
                    {userProfile?.display_name ||
                      userProfile?.username ||
                      'Nomad'}
                  </Text>
                  <Text style={styles.discussionModalHandle}>
                    {userProfile?.username
                      ? `@${userProfile.username}`
                      : 'Posting to Mechanics'}
                  </Text>
                </View>
              </View>

              <TextInput
                style={styles.discussionModalInput}
                placeholder="Ask a question or share a quick fix..."
                placeholderTextColor="#94A3B8"
                multiline
                value={discussionDraft}
                onChangeText={setDiscussionDraft}
              />

              <TouchableOpacity
                style={styles.discussionModalButton}
                onPress={handleCreateDiscussionPost}
              >
                <Text style={styles.discussionModalButtonText}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          transparent
          animationType="slide"
          visible={!!commentPostId}
          onRequestClose={() => setCommentPostId(null)}
        >
          <KeyboardAvoidingView
            style={styles.commentModalBackdrop}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.commentModalCard}>
              <View style={styles.commentModalHeader}>
                <Text style={styles.commentModalTitle}>Comments</Text>
                <TouchableOpacity onPress={() => setCommentPostId(null)}>
                  <MaterialCommunityIcons
                    name="close"
                    size={20}
                    color="#64748b"
                  />
                </TouchableOpacity>
              </View>
              <ScrollView
                contentContainerStyle={styles.commentModalList}
                showsVerticalScrollIndicator={false}
              >
                {(commentPostId && (discussionComments[commentPostId] || []))
                  ?.length ? (
                  (discussionComments[commentPostId] || []).map(comment => (
                    <View key={comment.id} style={styles.commentModalItem}>
                      <View style={styles.commentModalAvatar}>
                        <MaterialCommunityIcons
                          name="account"
                          size={16}
                          color="#64748b"
                        />
                      </View>
                      <View style={styles.commentModalBody}>
                        <View style={styles.commentModalRow}>
                          <Text style={styles.commentModalAuthor}>
                            {comment.author}
                          </Text>
                          <Text style={styles.commentModalTime}>
                            {formatRelativeTime(comment.created_at)}
                          </Text>
                        </View>
                        <Text style={styles.commentModalText}>
                          {comment.body}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.commentModalEmpty}>
                    <Text style={styles.commentModalEmptyText}>
                      No comments yet. Start the conversation.
                    </Text>
                  </View>
                )}
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
                    placeholder="Add a comment..."
                    placeholderTextColor="#9CA3AF"
                    style={{flex: 1, marginRight: 8}}
                    value={commentDraft}
                    onChangeText={setCommentDraft}
                  />
                  <TouchableOpacity onPress={handleAddComment}>
                    <MaterialCommunityIcons
                      name="send"
                      size={18}
                      color="#2E7D64"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topNavContainer}>
        <View style={styles.topNav}>
          {[
            {label: 'Request Help', value: 'mechanics'},
            {label: 'Marketplace', value: 'marketplace'}
          ].map(tab => (
            <TouchableOpacity
              key={tab.value}
              style={[
                styles.tabButton,
                activeTab === tab.value && styles.tabButtonActive
              ]}
              onPress={() => setActiveTab(tab.value)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.value && styles.tabTextActive
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {activeTab === 'marketplace' && renderMarketplace()}

      {activeTab === 'mechanics' && (
        <ScrollView
          style={styles.contentContainer}
          contentContainerStyle={{
            paddingHorizontal: H_PADDING,
            paddingBottom: V_SPACING * 2
          }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.resultsTitle}>Featured Builders</Text>
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="large" color="#2E7D64" />
            </View>
          ) : featuredList.length === 0 ? (
            renderEmpty()
          ) : (
            featuredList.map(tech => renderTechCard(tech))
          )}
          {error && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.sectionDivider} />

          <Text style={styles.sectionTitle}>Builders Near Me</Text>
          <View style={styles.scanSection}>
            {!scanned ? (
              <View style={styles.scanContent}>
                <View style={styles.radarCard}>
                  <View style={styles.radarContainer}>
                    <View style={styles.radarFrame}>
                      <View style={styles.radarSurface}>
                        <View style={styles.radarGrid}>
                          {['25%', '50%', '75%'].map(position => (
                            <View
                              key={`v-${position}`}
                              style={[
                                styles.gridLine,
                                styles.gridLineVertical,
                                {left: position}
                              ]}
                            />
                          ))}
                          {['25%', '50%', '75%'].map(position => (
                            <View
                              key={`h-${position}`}
                              style={[
                                styles.gridLine,
                                styles.gridLineHorizontal,
                                {top: position}
                              ]}
                            />
                          ))}
                        </View>

                        {[180, 135, 95, 55].map(size => (
                          <View
                            key={`ring-${size}`}
                            style={[
                              styles.radarRing,
                              {
                                width: size,
                                height: size,
                                borderRadius: size / 2
                              }
                            ]}
                          />
                        ))}

                        <View style={styles.radarCrosshairVertical} />
                        <View style={styles.radarCrosshairHorizontal} />

                        <Animated.View
                          style={[
                            styles.radarSweep,
                            {transform: [{rotate: sweepRotate}]}
                          ]}
                        >
                          <View style={styles.radarSweepLine} />
                          <View style={styles.radarSweepGlow} />
                        </Animated.View>

                        <Animated.View
                          style={[
                            styles.radarPulse,
                            {
                              transform: [{scale: pulseScale}],
                              opacity: pulseOpacity
                            }
                          ]}
                        />

                        <View
                          style={[styles.radarBlip, styles.radarBlipBright]}
                        />
                        <View
                          style={[
                            styles.radarBlip,
                            styles.radarBlipMid,
                            {top: '28%', left: '34%'}
                          ]}
                        />
                        <View
                          style={[
                            styles.radarBlip,
                            styles.radarBlipSoft,
                            {top: '62%', left: '68%'}
                          ]}
                        />

                        <View style={styles.radarCenter} />
                      </View>
                    </View>
                    {!isScanning && (
                      <Text style={styles.radarText}>Scan nearby builders</Text>
                    )}
                    {isScanning && (
                      <View style={styles.scanIndicator}>
                        <Text style={styles.scanIndicatorText}>
                          Scanning nearby builders...
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.scanButton,
                    isScanning && styles.scanButtonBusy
                  ]}
                  onPress={handleScan}
                  disabled={isScanning}
                >
                  <Text style={styles.scanButtonText}>
                    {isScanning ? 'Scanning...' : 'Scan'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.signalButton,
                    isScanning && styles.signalButtonBusy
                  ]}
                  onPress={handleSignalRequest}
                  disabled={isScanning}
                >
                  <Text style={styles.signalButtonText}>Send Signal</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.scanResultsContainer}>
                <Text style={styles.resultsTitle}>Builders Near You</Text>
                {loading ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator size="large" color="#2E7D64" />
                  </View>
                ) : scanList.length === 0 ? (
                  renderEmpty()
                ) : (
                  scanList.map(tech => renderTechCard(tech))
                )}

                <TouchableOpacity
                  style={styles.backScanButton}
                  onPress={() => {
                    if (scanTimerRef.current) {
                      clearTimeout(scanTimerRef.current);
                    }
                    setIsScanning(false);
                    setScanned(false);
                  }}
                >
                  <Text style={styles.backScanButtonText}>Scan Again</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      <Modal
        visible={showHireModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowHireModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Hire Builder</Text>
              <TouchableOpacity onPress={() => setShowHireModal(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={22}
                  color="#64748b"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.modalProfile}>
              {selectedTech?.profile_picture_url ? (
                <Image
                  source={{uri: selectedTech.profile_picture_url}}
                  style={styles.modalAvatar}
                />
              ) : (
                <View style={[styles.modalAvatar, styles.avatarPlaceholder]}>
                  <MaterialCommunityIcons
                    name="account"
                    size={28}
                    color="#9CA3AF"
                  />
                </View>
              )}
              <View style={styles.modalProfileInfo}>
                <Text style={styles.modalName}>{contactName}</Text>
                <Text style={styles.modalMeta}>Age: 29</Text>
                <Text style={styles.modalMeta}>
                  {selectedTech?.current_location || 'Unknown location'}
                </Text>
              </View>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>
                Contact {contactName}
              </Text>
              <View style={styles.modalContactRow}>
                <MaterialCommunityIcons
                  name="phone"
                  size={16}
                  color="#2E7D64"
                />
                <Text style={styles.modalContactText}>{contactWhatsapp}</Text>
              </View>
              <View style={styles.modalContactRow}>
                <MaterialCommunityIcons
                  name="email-outline"
                  size={16}
                  color="#2E7D64"
                />
                <Text style={styles.modalContactText}>{contactEmail}</Text>
              </View>
              <View style={styles.modalContactRow}>
                <MaterialCommunityIcons
                  name="instagram"
                  size={16}
                  color="#2E7D64"
                />
                <Text style={styles.modalContactText}>{contactInstagram}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalPrimaryButton}
              onPress={handleNotifyMechanic}
              disabled={sendingNotify}
            >
              {sendingNotify ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.modalPrimaryButtonText}>
                  Notify Mechanic
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showSignalModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSignalModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalKeyboard}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.modalOverlay}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Send Signal</Text>
              <TouchableOpacity onPress={() => setShowSignalModal(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={22}
                  color="#64748b"
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSectionTitle}>Current Location</Text>
            <TouchableOpacity
              onPress={handleGetSignalLocation}
              disabled={loadingSignalLocation}
            >
              <View style={styles.locationInputWrapper}>
                {loadingSignalLocation ? (
                  <ActivityIndicator size="small" color="#2E7D64" />
                ) : (
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={20}
                    color="#6B7280"
                    style={styles.locationIcon}
                  />
                )}
                <Text style={styles.locationPlaceholder}>
                  {signalLocation || 'Tap to select location'}
                </Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.modalSectionTitle}>Status</Text>
            <View style={styles.statusGrid}>
              {['Emergency', 'Urgent', 'Normal'].map(status => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusChip,
                    signalStatus === status && styles.statusChipSelected
                  ]}
                  onPress={() => setSignalStatus(status)}
                >
                  <Text
                    style={[
                      styles.statusChipText,
                      signalStatus === status && styles.statusChipTextSelected
                    ]}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalSectionTitle}>Description</Text>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Describe the issue..."
              placeholderTextColor="#94A3B8"
              multiline
              value={signalDescription}
              onChangeText={setSignalDescription}
            />

            <TouchableOpacity
              style={styles.modalPrimaryButton}
              onPress={handleSubmitSignal}
              disabled={sendingSignal}
            >
              {sendingSignal ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.modalPrimaryButtonText}>Send Signal</Text>
              )}
            </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280'
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#fff'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center'
  },
  topNavContainer: {
    backgroundColor: '#ffffff',
    paddingTop:
      Platform.OS === 'ios' ? 52 : (StatusBar.currentHeight ?? 0) + 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  topNav: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 18
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  tabButtonActive: {
    borderBottomColor: '#2E7D64'
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.2
  },
  tabTextActive: {
    color: '#2E7D64'
  },
  contentContainer: {
    flex: 1,
    paddingVertical: 6,
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 10,
    letterSpacing: 0.2
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#E6ECE9',
    marginVertical: 18
  },
  scanSection: {
    marginBottom: 16
  },
  scanContent: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20
  },
  marketplaceHeader: {
    marginTop: 10,
    marginBottom: 18
  },
  marketplaceTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: 0.2
  },
  marketplaceSubtitle: {
    marginTop: 8,
    fontSize: 13,
    color: '#5B6B61',
    lineHeight: 19
  },
  marketplaceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  marketplaceCard: {
    backgroundColor: '#F7FBF9',
    borderRadius: 16,
    padding: 16,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    minHeight: 170,
    borderWidth: 1,
    borderColor: '#DCEFE6',
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 3
  },
  marketplaceCardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16
  },
  marketplaceCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E1F3EA',
    alignItems: 'center',
    justifyContent: 'center'
  },
  marketplaceCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 12
  },
  marketplaceCardSubtitle: {
    marginTop: 6,
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
    textAlign: 'left'
  },
  requestInviteButton: {
    backgroundColor: '#2E7D64',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16
  },
  requestInviteButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  requestInviteButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700'
  },
  radarCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E6ECE9',
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 8},
    elevation: 3
  },
  radarContainer: {
    alignItems: 'center',
    width: '100%'
  },
  radarFrame: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#101A16',
    borderWidth: 6,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 8},
    elevation: 6
  },
  radarSurface: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#22362A',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center'
  },
  radarGrid: {
    ...StyleSheet.absoluteFillObject
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(88, 186, 130, 0.22)'
  },
  gridLineVertical: {
    width: 1,
    top: 0,
    bottom: 0
  },
  gridLineHorizontal: {
    height: 1,
    left: 0,
    right: 0
  },
  radarRing: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(88, 186, 130, 0.28)'
  },
  radarCrosshairVertical: {
    position: 'absolute',
    width: 1.5,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(132, 219, 150, 0.35)'
  },
  radarCrosshairHorizontal: {
    position: 'absolute',
    height: 1.5,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(132, 219, 150, 0.35)'
  },
  radarSweep: {
    position: 'absolute',
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center'
  },
  radarSweepLine: {
    position: 'absolute',
    width: '50%',
    height: 2,
    backgroundColor: 'rgba(122, 255, 169, 0.75)',
    left: '50%'
  },
  radarSweepGlow: {
    position: 'absolute',
    width: '45%',
    height: 90,
    backgroundColor: 'rgba(122, 255, 169, 0.22)',
    left: '50%',
    top: 10,
    borderTopLeftRadius: 90,
    borderBottomLeftRadius: 90
  },
  radarCenter: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#7AFFA9',
    shadowColor: '#7AFFA9',
    shadowOpacity: 0.6,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 0},
    elevation: 6
  },
  radarPulse: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(122, 255, 169, 0.4)'
  },
  radarBlip: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7AFFA9',
    top: '18%',
    left: '64%',
    shadowColor: '#7AFFA9',
    shadowOpacity: 0.7,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 0},
    elevation: 4
  },
  radarBlipBright: {
    width: 7,
    height: 7,
    borderRadius: 3.5
  },
  radarBlipMid: {
    opacity: 0.6
  },
  radarBlipSoft: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    opacity: 0.45
  },
  radarText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#C4D8CC'
  },
  scanIndicator: {
    marginTop: 12,
    alignItems: 'center',
    gap: 6
  },
  scanIndicatorText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600'
  },
  scanButton: {
    backgroundColor: '#2E7D64',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#2E7D64',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 6},
    elevation: 3
  },
  scanButtonBusy: {
    opacity: 0.7
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff'
  },
  signalButton: {
    borderWidth: 1.5,
    borderColor: '#2E7D64',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#EAF7F0'
  },
  signalButtonBusy: {
    opacity: 0.7
  },
  signalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D64'
  },
  scanResultsContainer: {
    flex: 1,
    paddingBottom: 16
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginVertical: 12,
    letterSpacing: 0.2
  },
  techCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30
  },
  avatarPlaceholder: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  infoContainer: {
    flex: 1
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  techName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    flexShrink: 1
  },
  bioDescript: {
    fontSize: 12,
    fontWeight: '400',
    color: '#555555',
    lineHeight: 16
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
    marginTop: 2
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280'
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12
  },
  tag: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2E7D64',
    backgroundColor: '#EAF7F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    lineHeight: 14,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#CFE9DD'
  },
  followButton: {
    flex: 1,
    backgroundColor: '#2E7D64',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  followButtonActive: {
    backgroundColor: '#f0f0f0'
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff'
  },
  followButtonTextActive: {
    color: '#2E7D64'
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10
  },
  hireButton: {
    flex: 1,
    backgroundColor: '#2E7D64',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#2E7D64',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 3
  },
  hireButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff'
  },
  backScanButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32
  },
  backScanButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D64'
  },
  loadingRow: {
    paddingVertical: 24,
    alignItems: 'center'
  },
  errorText: {
    marginTop: 8,
    color: '#EF4444',
    fontSize: 12
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937'
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center'
  },
  mechanicHeader: {
    paddingTop: 5,
    paddingHorizontal: 10,
    paddingBottom: 12
  },
  mechanicTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 8
  },
  mechanicSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 6
  },
  mechanicCard: {
    marginHorizontal: 20,
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start'
  },
  mechanicCardText: {
    flex: 1
  },
  mechanicCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a'
  },
  mechanicCardBody: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 16
  },
  helpCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 6},
    elevation: 2
  },
  helpHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12
  },
  helpAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  helpAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24
  },
  helpInfo: {
    flex: 1
  },
  helpTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  helpName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a'
  },
  helpIssue: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
    lineHeight: 16
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3
  },
  statusBadgeEmergency: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5'
  },
  statusBadgeUrgent: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D'
  },
  statusBadgeNormal: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC'
  },
  statusBadgeTextEmergency: {
    color: '#B91C1C'
  },
  statusBadgeTextUrgent: {
    color: '#92400E'
  },
  statusBadgeTextNormal: {
    color: '#166534'
  },
  modalKeyboard: {
    flex: 1
  },
  modalOverlay: {
    flexGrow: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a'
  },
  modalProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16
  },
  modalAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32
  },
  modalProfileInfo: {
    flex: 1
  },
  modalName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a'
  },
  modalMeta: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4
  },
  modalSection: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16
  },
  modalSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 10
  },
  locationInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    minHeight: 48,
    marginBottom: 16
  },
  locationIcon: {
    marginRight: 8
  },
  locationPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: '#94A3B8'
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC'
  },
  statusChipSelected: {
    backgroundColor: '#2E7D64',
    borderColor: '#2E7D64'
  },
  statusChipText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600'
  },
  statusChipTextSelected: {
    color: '#ffffff'
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 90,
    textAlignVertical: 'top',
    color: '#0f172a',
    backgroundColor: '#F8FAFC',
    marginBottom: 16
  },
  modalContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  modalContactText: {
    fontSize: 12,
    color: '#1f2937'
  },
  modalPrimaryButton: {
    backgroundColor: '#2E7D64',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  modalPrimaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14
  },
  discussionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 12
  },
  discussionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a'
  },
  discussionSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    maxWidth: 220
  },
  discussionNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2E7D64',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999
  },
  discussionNewButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12
  },
  discussionList: {
    flex: 1,
    marginTop: 6
  },
  discussionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 6},
    elevation: 2
  },
  discussionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  discussionAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18
  },
  discussionAvatarPlaceholder: {
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  discussionCardInfo: {
    flex: 1
  },
  discussionNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  discussionCardName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a'
  },
  discussionCardHandle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2
  },
  discussionCardTime: {
    fontSize: 11,
    color: '#94A3B8'
  },
  discussionCardBody: {
    marginTop: 10,
    fontSize: 13,
    color: '#1f2937',
    lineHeight: 18
  },
  discussionActionsRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0'
  },
  discussionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  discussionActionText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600'
  },
  discussionActionTextActive: {
    color: '#2E7D64'
  },
  discussionDislikeTextActive: {
    color: '#f97316'
  },
  discussionFollowButton: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#ffffff'
  },
  discussionFollowButtonActive: {
    borderColor: '#2E7D64',
    backgroundColor: '#e8faf6'
  },
  discussionFollowButtonText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b'
  },
  discussionFollowButtonTextActive: {
    color: '#2E7D64'
  },
  discussionModalCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18
  },
  discussionModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  discussionModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a'
  },
  discussionModalUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 12
  },
  discussionModalAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22
  },
  discussionModalName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a'
  },
  discussionModalHandle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2
  },
  discussionModalInput: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlignVertical: 'top',
    color: '#0f172a',
    backgroundColor: '#F8FAFC',
    marginBottom: 16
  },
  discussionModalButton: {
    backgroundColor: '#2E7D64',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  discussionModalButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14
  },
  commentModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end'
  },
  commentModalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    height: '50%'
  },
  commentModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  commentModalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a'
  },
  commentModalList: {
    paddingBottom: 12
  },
  commentModalItem: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  commentModalAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  commentModalBody: {
    flex: 1
  },
  commentModalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  commentModalAuthor: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a'
  },
  commentModalTime: {
    fontSize: 10,
    color: '#94A3B8'
  },
  commentModalText: {
    fontSize: 12,
    color: '#334155',
    marginTop: 4,
    lineHeight: 16
  },
  commentModalEmpty: {
    alignItems: 'center',
    paddingVertical: 24
  },
  commentModalEmptyText: {
    fontSize: 12,
    color: '#94A3B8'
  },
  commentComposer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC'
  },
  commentComposerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  commentComposerField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  respondButton: {
    backgroundColor: '#2E7D64',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  respondButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff'
  }
});
