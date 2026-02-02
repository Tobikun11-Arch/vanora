import {showToast} from '@/components/Toast';
import {supabase} from '@/services/supabase';
import {useFindTechStore} from '@/store/techStore';
import {useUserStore} from '@/store/userStore';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function FindTechTab() {
  const [activeTab, setActiveTab] = useState('featured');
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
          profile: item.profiles ?? null
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
      showToast('error', 'Location Error', 'Failed to get current location');
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

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="account-wrench" size={48} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No verified mechanics yet</Text>
      <Text style={styles.emptySubtitle}>
        Verified mechanics will appear here once available.
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
            <Text style={styles.bioDescript}>
              {tech.bio || 'No bio available yet.'}
            </Text>
            <View style={styles.locationRow}>
              <MaterialCommunityIcons
                name="map-marker"
                size={14}
                color="#6B7280"
              />
              <Text style={styles.locationText}>{location}</Text>
            </View>
          </View>
        </View>

        {(tech.skills || []).length > 0 && (
          <View style={styles.tagsContainer}>
            {(tech.skills || []).slice(0, 3).map((tag, index) => (
              <Text key={`${tech.id}-tag-${index}`} style={styles.tag}>
                {tag}
              </Text>
            ))}
          </View>
        )}

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
    if (activeTab !== 'scan' && isScanning) {
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
        <ActivityIndicator size="large" color="#1dd1a1" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  if (isMechanic) {
    return (
      <View style={styles.container}>
        <View style={styles.mechanicHeader}>
          <Text style={styles.mechanicTitle}>Community Requests</Text>
          <Text style={styles.mechanicSubtitle}>
            Nearby travelers are looking for support
          </Text>
        </View>

        <ScrollView
          style={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {loadingHelpSignals ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="large" color="#1dd1a1" />
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
                      <Text style={styles.helpIssue}>{description}</Text>
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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header} />

      <View style={styles.tabsContainer}>
        {['Featured', 'Scan'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab.toLowerCase() && styles.tabActive
            ]}
            onPress={() => setActiveTab(tab.toLowerCase())}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.toLowerCase() && styles.tabTextActive
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'featured' && (
        <ScrollView
          style={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.resultsTitle}>Verified Mechanics</Text>
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="large" color="#1dd1a1" />
            </View>
          ) : featuredList.length === 0 ? (
            renderEmpty()
          ) : (
            featuredList.map(tech => renderTechCard(tech))
          )}
          {error && <Text style={styles.errorText}>{error}</Text>}
        </ScrollView>
      )}

      {activeTab === 'scan' && (
        <View style={styles.scanContainer}>
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
                    <Text style={styles.radarText}>Scan nearby mechanics</Text>
                  )}
                  {isScanning && (
                    <View style={styles.scanIndicator}>
                      <Text style={styles.scanIndicatorText}>
                        Scanning nearby mechanics...
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <TouchableOpacity
                style={[styles.scanButton, isScanning && styles.scanButtonBusy]}
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
            <ScrollView
              style={styles.scanResultsContainer}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.resultsTitle}>Mechanics Near You</Text>
              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="large" color="#1dd1a1" />
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
            </ScrollView>
          )}
        </View>
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
              <Text style={styles.modalTitle}>Hire Mechanic</Text>
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
                  color="#1dd1a1"
                />
                <Text style={styles.modalContactText}>{contactWhatsapp}</Text>
              </View>
              <View style={styles.modalContactRow}>
                <MaterialCommunityIcons
                  name="email-outline"
                  size={16}
                  color="#1dd1a1"
                />
                <Text style={styles.modalContactText}>{contactEmail}</Text>
              </View>
              <View style={styles.modalContactRow}>
                <MaterialCommunityIcons
                  name="instagram"
                  size={16}
                  color="#1dd1a1"
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
        <View style={styles.modalOverlay}>
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
                  <ActivityIndicator size="small" color="#1dd1a1" />
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
        </View>
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 0,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 24,
    padding: 4
  },
  tab: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'transparent',
    alignItems: 'center'
  },
  tabActive: {
    backgroundColor: '#ffffff'
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999999'
  },
  tabTextActive: {
    color: '#1dd1a1'
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 6,
    marginBottom: 20
  },
  scanContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: 'space-between'
  },
  scanContent: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20
  },
  radarCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C4D8CC',
    shadowColor: '#0f172a',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 8},
    elevation: 4
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
    color: '#6B7280',
    fontWeight: '500'
  },
  scanButton: {
    backgroundColor: '#1dd1a1',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center'
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
    borderWidth: 2,
    borderColor: '#1dd1a1',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 12
  },
  signalButtonBusy: {
    opacity: 0.7
  },
  signalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1dd1a1'
  },
  scanResultsContainer: {
    flex: 1,
    paddingBottom: 16
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12
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
    gap: 6,
    marginTop: 6
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
    color: '#1dd1a1',
    backgroundColor: '#e8faf6',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 16,
    lineHeight: 5,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },
  followButton: {
    flex: 1,
    backgroundColor: '#1dd1a1',
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
    color: '#1dd1a1'
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10
  },
  hireButton: {
    flex: 1,
    backgroundColor: '#111827',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
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
    color: '#1dd1a1'
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
    paddingTop: 25,
    paddingHorizontal: 20,
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
  modalOverlay: {
    flex: 1,
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
    backgroundColor: '#1dd1a1',
    borderColor: '#1dd1a1'
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
    backgroundColor: '#1dd1a1',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  modalPrimaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14
  },
  respondButton: {
    backgroundColor: '#1dd1a1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  respondButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff'
  }
});
