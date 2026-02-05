import {MaterialCommunityIcons} from '@expo/vector-icons';
import {supabase} from '@/services/supabase';
import {showToast} from '@/components/Toast';
import {useRevenueCatSubscription} from '@/hooks/use-revenuecat-subscription';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {findMatchTabStyles as styles} from '@/styles';

interface MatchProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  age: number;
  gender: string | null;
  current_location: string | null;
  bio: string | null;
  profile_picture_url: string | null;
  match_photo_url: string | null;
  hobbies: string[] | null;
  skills: string[] | null;
  lifestyle_tags: string[] | null;
  favorite_activities: string[] | null;
}

const FREE_CHALLENGES = 3;

export default function FindMatchTab() {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<MatchProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentProfile, setCurrentProfile] = useState<MatchProfile | null>(
    null
  );
  const [challengeCount, setChallengeCount] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [containerHeight, setContainerHeight] = useState(0);
  const [showIntroHint, setShowIntroHint] = useState(false);
  const {isSubscribed} = useRevenueCatSubscription();
  const isPremium = isSubscribed;
  const swipe = useRef(new Animated.ValueXY()).current;
  const matchesRef = useRef<MatchProfile[]>([]);

  const getOppositeGender = (gender?: string | null) => {
    if (!gender) return null;
    const normalized = gender.trim().toLowerCase();
    if (normalized === 'male') return 'Female';
    if (normalized === 'female') return 'Male';
    return null;
  };

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const cached = await AsyncStorage.getItem('findMatchCacheV1');
        let cachedMatches: MatchProfile[] = [];
        let cachedProfile: MatchProfile | null = null;
        if (cached) {
          const parsed = JSON.parse(cached) as {
            matches: MatchProfile[];
            profile: MatchProfile | null;
          };
          if (parsed?.matches?.length) {
            cachedMatches = parsed.matches;
          }
          if (parsed?.profile) {
            cachedProfile = parsed.profile;
          }
        }

        const {
          data: {user}
        } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const {data: myProfile} = await supabase
          .from('profiles')
          .select(
            `
            id,
            username,
            display_name,
            age,
            gender,
            current_location,
            bio,
            profile_picture_url,
            match_photo_url,
            hobbies,
            skills,
            lifestyle_tags,
            favorite_activities
          `
          )
          .eq('id', user.id)
          .maybeSingle();

        setCurrentProfile(myProfile || null);

        const oppositeGender = getOppositeGender(myProfile?.gender);
        const filterByGender = (list: MatchProfile[]) => {
          if (oppositeGender) {
            return list.filter(profile => profile.gender === oppositeGender);
          }
          if (myProfile?.gender) {
            return list.filter(profile => profile.gender !== myProfile.gender);
          }
          return list;
        };

        if (cachedMatches.length) {
          setMatches(filterByGender(cachedMatches));
          setCurrentIndex(0);
        }
        if (cachedProfile) {
          setCurrentProfile(cachedProfile);
        }

        let matchQuery = supabase
          .from('profiles')
          .select(
            `
            id,
            username,
            display_name,
            age,
            gender,
            current_location,
            bio,
            profile_picture_url,
            match_photo_url,
            hobbies,
            skills,
            lifestyle_tags,
            favorite_activities
          `
          )
          .neq('id', user.id);

        if (oppositeGender) {
          matchQuery = matchQuery.eq('gender', oppositeGender);
        } else if (myProfile?.gender) {
          matchQuery = matchQuery.neq('gender', myProfile.gender);
        }

        const {data: matchData, error} = await matchQuery.order('created_at', {
          ascending: false
        });

        if (error) {
          console.error('Error fetching matches:', error);
          setMatches([]);
        } else {
          const filteredMatches = filterByGender(matchData || []);
          setMatches(filteredMatches);
          setCurrentIndex(0);
          await AsyncStorage.setItem(
            'findMatchCacheV1',
            JSON.stringify({
              matches: filteredMatches,
              profile: myProfile || null
            })
          );
        }
      } catch (e) {
        console.error('Error loading matches:', e);
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, []);

  useEffect(() => {
    matchesRef.current = matches;
    if (matches.length > 0 && currentIndex >= matches.length) {
      setCurrentIndex(0);
    }
  }, [matches, currentIndex]);

  useEffect(() => {
    const urls = matches
      .map(match => match.match_photo_url || match.profile_picture_url)
      .filter((url): url is string => !!url);
    urls.forEach(url => {
      Image.prefetch(url).catch(() => {});
    });
  }, [matches]);

  useEffect(() => {
    const loadHint = async () => {
      try {
        const seen = await AsyncStorage.getItem('findMatchIntroSeen');
        if (!seen) {
          setShowIntroHint(true);
        }
      } catch {}
    };
    loadHint();
  }, []);

  const activeMatch = matches[currentIndex] || null;
  const displayName = activeMatch?.display_name || activeMatch?.username || '';
  const locationText = activeMatch?.current_location || 'Unknown location';
  const cardImage =
    activeMatch?.match_photo_url || activeMatch?.profile_picture_url || null;

  const canUseChallenge = isPremium || challengeCount < FREE_CHALLENGES;

  const intersectTags = (left?: string[] | null, right?: string[] | null) => {
    const rightSet = new Set(right || []);
    const seen = new Set<string>();
    return (left || []).filter(item => {
      if (!rightSet.has(item)) return false;
      if (seen.has(item)) return false;
      seen.add(item);
      return true;
    });
  };

  const commonInterests = useMemo(() => {
    if (!currentProfile || !activeMatch) return [];
    const combined = [
      ...intersectTags(currentProfile.hobbies, activeMatch.hobbies),
      ...intersectTags(currentProfile.skills, activeMatch.skills),
      ...intersectTags(currentProfile.lifestyle_tags, activeMatch.lifestyle_tags)
    ];
    return combined.slice(0, 6);
  }, [activeMatch, currentProfile]);

  const handleAdvance = () => {
    setCurrentIndex(prev => {
      const length = matchesRef.current.length;
      if (!length) return 0;
      const nextIndex = prev + 1;
      return nextIndex >= length ? 0 : nextIndex;
    });
  };

  const handleChallenge = () => {
    if (!activeMatch) return;
    if (canUseChallenge) {
      setChallengeCount(prev => prev + 1);
      showToast('success', 'Challenge Sent', `Invited ${displayName}`);
      return;
    }
    if (!isPremium) {
      setShowUpgradeModal(true);
    }
  };

  const resetSwipe = () => {
    swipe.setValue({x: 0, y: 0});
  };

  const animateSwipe = (direction: 'left' | 'right') => {
    const {width} = Dimensions.get('window');
    const toX = direction === 'right' ? width : -width;
    Animated.timing(swipe, {
      toValue: {x: toX, y: 0},
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      resetSwipe();
      handleAdvance();
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onStartShouldSetPanResponderCapture: () => false,
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 3 && Math.abs(gesture.dy) < 14,
        onMoveShouldSetPanResponderCapture: (_, gesture) =>
          Math.abs(gesture.dx) > 6 && Math.abs(gesture.dy) < 14,
        onPanResponderTerminationRequest: () => false,
        onPanResponderMove: Animated.event([null, {dx: swipe.x}], {
          useNativeDriver: false
        }),
        onPanResponderRelease: (_, gesture) => {
          const threshold = 60;
          const fastSwipe = Math.abs(gesture.vx) > 0.4;
          if (gesture.dx > threshold || (fastSwipe && gesture.vx > 0)) {
            animateSwipe('right');
            return;
          }
          if (gesture.dx < -threshold || (fastSwipe && gesture.vx < 0)) {
            animateSwipe('left');
            return;
          }
          Animated.spring(swipe, {
            toValue: {x: 0, y: 0},
            useNativeDriver: true
          }).start();
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [swipe]
  );

  const rotate = swipe.x.interpolate({
    inputRange: [-150, 0, 150],
    outputRange: ['-8deg', '0deg', '8deg']
  });

  const handleDismissIntro = async () => {
    setShowIntroHint(false);
    try {
      await AsyncStorage.setItem('findMatchIntroSeen', 'true');
    } catch {}
  };

  const cardHeight = useMemo(() => {
    if (!containerHeight) return 360;
    const {width} = Dimensions.get('window');
    const maxByWidth = Math.round((width - 40) * 1.5);
    const available = containerHeight - 120; // title + actions + padding
    return Math.max(440, Math.min(available, maxByWidth));
  }, [containerHeight]);

  if (loading) {
    return (
      <View style={styles.tabContent}>
        <ActivityIndicator size="large" color="#4A7C59" />
      </View>
    );
  }

  if (!activeMatch) {
    return (
      <View style={styles.tabContent}>
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="account-search"
            size={48}
            color="#D1D5DB"
          />
          <Text style={styles.emptyText}>Find your travel match</Text>
          <Text style={styles.emptySubtext}>
            Discover nomads with similar interests
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={styles.tabContent}
      onLayout={event => setContainerHeight(event.nativeEvent.layout.height)}
    >
      {showIntroHint && (
        <View style={styles.introHint}>
          <MaterialCommunityIcons name="gesture-swipe" size={16} color="#fff" />
          <Text style={styles.introHintText}>
            Swipe right to like, left to pass. The blue bolt is Challenge.
          </Text>
          <TouchableOpacity onPress={handleDismissIntro}>
            <MaterialCommunityIcons name="close" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {!isPremium && (
        <Modal
          visible={showUpgradeModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowUpgradeModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.premiumModalContent}>
              <MaterialCommunityIcons name="crown" size={52} color="#F59E0B" />
              <Text style={styles.premiumTitle}>Unlock Challenge Match</Text>
              <Text style={styles.premiumDescription}>
                Send unlimited challenges and stand out to new matches.
              </Text>
              <View style={styles.premiumFeatures}>
                <View style={styles.premiumFeatureRow}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={18}
                    color="#10B981"
                  />
                  <Text style={styles.premiumFeatureText}>
                    Unlimited challenge invites
                  </Text>
                </View>
                <View style={styles.premiumFeatureRow}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={18}
                    color="#10B981"
                  />
                  <Text style={styles.premiumFeatureText}>
                    Boost visibility by 3x
                  </Text>
                </View>
                <View style={styles.premiumFeatureRow}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={18}
                    color="#10B981"
                  />
                  <Text style={styles.premiumFeatureText}>
                    Verified nomad badge
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.premiumButton}>
                <Text style={styles.premiumButtonText}>Go Premium</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowUpgradeModal(false)}>
                <Text style={styles.laterText}>Maybe later</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      <View style={styles.cardWrap}>
        <Animated.View
          key={activeMatch.id}
          style={[
            styles.card,
            {height: cardHeight},
            {transform: [{translateX: swipe.x}, {rotate}]}
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.cardTouchable}>
            <View style={styles.cardFill}>
              {cardImage ? (
                <Image
                  source={{uri: cardImage}}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[
                    styles.cardImage,
                    {alignItems: 'center', justifyContent: 'center'}
                  ]}
                >
                  <MaterialCommunityIcons
                    name="account"
                    size={64}
                    color="#9CA3AF"
                  />
                </View>
              )}
              <View style={styles.cardOverlay}>
                <View style={styles.nameRow}>
                  <Text style={styles.cardTitle}>
                    {displayName}, {activeMatch.age}
                  </Text>
                </View>
                <View style={styles.locationRow}>
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={14}
                    color="#E5E7EB"
                  />
                  <Text style={styles.locationText}>{locationText}</Text>
                </View>

                <View style={styles.overlayDivider} />

                <View style={styles.pillRow}>
                  {commonInterests.length > 0 ? (
                    commonInterests.map((tag, index) => (
                      <View key={`${tag}-${index}`} style={styles.pill}>
                        <Text style={styles.pillText}>{tag}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.overlayHint}>
                      Add more interests to see matches here.
                    </Text>
                  )}
                </View>

                <View style={styles.pillRow}>
                  {(activeMatch.hobbies || []).length > 0 ? (
                    (activeMatch.hobbies || []).map((hobby, index) => (
                      <View key={`${hobby}-${index}`} style={styles.pillAlt}>
                        <Text style={styles.pillText}>{hobby}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.overlayHint}>
                      No hobbies listed yet.
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.passButton]}
          onPress={() => animateSwipe('left')}
        >
          <MaterialCommunityIcons name="close" size={30} color="#EF4444" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.challengeButton]}
          onPress={handleChallenge}
        >
          <MaterialCommunityIcons name="flash" size={28} color="#2563EB" />
          {!canUseChallenge && (
            <View style={styles.lockBadge}>
              <MaterialCommunityIcons name="lock" size={12} color="#fff" />
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => animateSwipe('right')}
        >
          <MaterialCommunityIcons name="heart" size={28} color="#22C55E" />
        </TouchableOpacity>
      </View>

      {!isPremium && (
        <Text style={styles.freeHint}>
          {Math.max(FREE_CHALLENGES - challengeCount, 0)} free challenges left
        </Text>
      )}
    </View>
  );
}
