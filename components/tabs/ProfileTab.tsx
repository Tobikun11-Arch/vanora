import {useRevenueCatSubscription} from '@/hooks/use-revenuecat-subscription';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useRouter} from 'expo-router';
import {useRef, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {authService} from '../../services/auth.service';
import {showToast} from '../Toast';

const {width} = Dimensions.get('window');
const GALLERY_IMAGE_SIZE = (width - 60) / 3;
const FALLBACK_HEADER_HEIGHT = 64;
const SETTINGS_MENU_OFFSET = 8;

interface GalleryPhoto {
  id: string;
  photo_url: string;
  photo_type: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  display_name: string;
  nomad_type: string;
  travel_style: string;
  relationship_intent: string[];
  current_location: string;
  movement_pattern: string;
  age: number;
  gender: string;
  pronouns: string | null;
  bio: string;
  profile_picture_url: string | null;
  years_in_van_life: number;
  hobbies: string[];
  skills: string[];
  lifestyle_tags: string[];
  favorite_activities: string[];
  created_at: string;
  updated_at: string;
  gallery_photos?: GalleryPhoto[];
  followers_count?: number;
  following_count?: number;
}

interface ProfileTabProps {
  profile: UserProfile;
}

export default function ProfileTab({profile}: ProfileTabProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const {isSubscribed, isLoading} = useRevenueCatSubscription();
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [settingsAnchor, setSettingsAnchor] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const settingsButtonRef = useRef<View>(null);

  const handleLogout = async () => {
    const result = await authService.signOut();
    if (result.success) {
      showToast('success', 'Success', 'Logged out successfully');
      router.replace('/(auth)/get-started');
    }
  };

  const handleSettings = () => {
    if (settingsButtonRef.current?.measureInWindow) {
      settingsButtonRef.current.measureInWindow((x, y, width, height) => {
        setSettingsAnchor({x, y, width, height});
        setShowSettingsMenu(prev => !prev);
      });
      return;
    }
    setShowSettingsMenu(prev => !prev);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Premium Modal */}
      {!isSubscribed && (
        <Modal
          visible={showPremiumModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPremiumModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.premiumModalContent}>
              <MaterialCommunityIcons
                name="crown"
                size={60}
                color="#F59E0B"
                style={styles.premiumIcon}
              />

              <Text style={styles.premiumModalTitle}>Vandora Premium</Text>

              <Text style={styles.premiumModalDescription}>
                Unlock Challenge Match invites, boost visibility by 3x, and get
                your exclusive verified nomad badge.
              </Text>

              <View style={styles.premiumFeatures}>
                <View style={styles.featureItem}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={20}
                    color="#10B981"
                  />
                  <Text style={styles.featureText}>3x visibility boost</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={20}
                    color="#10B981"
                  />
                  <Text style={styles.featureText}>
                    Challenge Match invites
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={20}
                    color="#10B981"
                  />
                  <Text style={styles.featureText}>Verified nomad badge</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.goPremiumButton}
                onPress={() => {
                  setShowPremiumModal(false);
                  router.push('/(app)/membership-subscription');
                }}
              >
                <Text style={styles.goPremiumButtonText}>Go Premium</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowPremiumModal(false)}>
                <Text style={styles.maybeLaterText}>Maybe later</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Settings Menu */}
      <Modal
        visible={showSettingsMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSettingsMenu(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowSettingsMenu(false)}
          style={[
            styles.settingsOverlay,
            {
              paddingTop:
                settingsAnchor?.y != null
                  ? settingsAnchor.y +
                    settingsAnchor.height +
                    SETTINGS_MENU_OFFSET
                  : headerHeight > 0
                  ? headerHeight
                  : insets.top + FALLBACK_HEADER_HEIGHT,
              paddingLeft: settingsAnchor?.x != null ? settingsAnchor.x : 16
            }
          ]}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              // Prevent backdrop close when tapping menu itself
            }}
            style={styles.settingsMenu}
          >
            <TouchableOpacity
              style={styles.settingsMenuItem}
              onPress={() => {
                setShowSettingsMenu(false);
                router.push('/(app)/membership-subscription');
              }}
            >
              <Text style={styles.settingsMenuItemText}>
                Membership & Subscription
              </Text>
            </TouchableOpacity>

            <View style={styles.settingsMenuDivider} />

            <TouchableOpacity
              style={styles.settingsMenuItem}
              onPress={() => {
                setShowSettingsMenu(false);
                router.push('/(app)/privacy-and-safety');
              }}
            >
              <Text style={styles.settingsMenuItemText}>
                Privacy and Safety
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Header */}
      <View
        style={styles.header}
        onLayout={event => {
          const {height} = event.nativeEvent.layout;
          if (height !== headerHeight) {
            setHeaderHeight(height);
          }
        }}
      >
        <View ref={settingsButtonRef} collapsable={false}>
          <TouchableOpacity
            onPress={handleSettings}
            style={styles.headerIconButton}
          >
            <MaterialCommunityIcons name="cog" size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>

        <Text style={styles.headerTitle}>Profile</Text>

        <TouchableOpacity
          onPress={handleLogout}
          style={styles.headerIconButton}
        >
          <MaterialCommunityIcons name="logout" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Go Premium Card */}
      {!isSubscribed && (
        <TouchableOpacity
          style={styles.premiumCard}
          onPress={() => setShowPremiumModal(true)}
        >
          <View style={styles.premiumCardContent}>
            <View style={styles.premiumCardLeft}>
              <MaterialCommunityIcons name="crown" size={28} color="#10B981" />
              <View style={styles.premiumCardText}>
                <Text style={styles.premiumCardTitle}>Vandora Premium</Text>
                <Text style={styles.premiumCardSubtitle}>
                  Unlock Challenge Match invites and get your verified nomad
                  badge.
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.premiumCardButton}
              onPress={() => setShowPremiumModal(true)}
            >
              <Text style={styles.premiumCardButtonText}>Go Premium</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      {/* Profile Header - Avatar, Stats & Basic Info */}
      <View style={styles.profileHeader}>
        <View style={styles.profileTopRow}>
          {/* Profile Picture */}
          {profile.profile_picture_url ? (
            <Image
              source={{uri: profile.profile_picture_url}}
              style={styles.profilePicture}
            />
          ) : (
            <View style={[styles.profilePicture, styles.placeholderPicture]}>
              <MaterialCommunityIcons
                name="account"
                size={60}
                color="#9CA3AF"
              />
            </View>
          )}

          {/* Header Stats beside avatar */}
          <View style={styles.headerStatsColumn}>
            <View style={styles.headerStatsRow}>
              <View style={styles.headerStatItem}>
                <Text style={styles.headerStatValue}>
                  {profile.posts_count ?? 0}
                </Text>
                <Text style={styles.headerStatLabel}>Posts</Text>
              </View>
              <View style={styles.headerStatItem}>
                <Text style={styles.headerStatValue}>
                  {profile.followers_count ?? 0}
                </Text>
                <Text style={styles.headerStatLabel}>Followers</Text>
              </View>
              <View style={styles.headerStatItem}>
                <Text style={styles.headerStatValue}>
                  {profile.following_count ?? 0}
                </Text>
                <Text style={styles.headerStatLabel}>Following</Text>
              </View>
            </View>
            <View style={styles.headerActionRow}>
              <TouchableOpacity style={styles.headerActionButton}>
                <Text style={styles.headerActionText}>Follow</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerActionButtonOutline}>
                <Text style={styles.headerActionTextOutline}>Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Name, gender, location, pronouns & nomad type */}
        <View style={styles.profileInfoContainer}>
          <Text style={styles.nameText}>
            {profile.display_name}, {profile.age}
          </Text>

          <View style={styles.genderRow}>
            <MaterialCommunityIcons
              name="gender-male-female"
              size={14}
              color="#6B7280"
            />
            <Text style={styles.genderText}>{profile.gender}</Text>
          </View>

          <View style={styles.locationRowCentered}>
            <MaterialCommunityIcons
              name="map-marker"
              size={14}
              color="#6B7280"
            />
            <Text style={styles.locationCentered}>
              {profile.current_location}
            </Text>
          </View>

          <View style={styles.profileMetaRow}>
            {profile.pronouns && (
              <Text style={styles.verifiedStatus}>{profile.pronouns}</Text>
            )}
          </View>

          {profile.bio ? <Text style={styles.bioText}>{profile.bio}</Text> : null}
        </View>
      </View>

      <View style={styles.sectionDivider} />

      {/* Photo Gallery - directly beneath bio */}
      {profile.gallery_photos && profile.gallery_photos.length > 0 && (
        <View style={[styles.section, styles.photoGallerySection]}>
          <Text style={styles.sectionTitle}>Photo Gallery</Text>
          <View style={styles.galleryGrid}>
            {profile.gallery_photos.map(photo => (
              <View key={photo.id} style={styles.galleryImageContainer}>
                <Image
                  source={{uri: photo.photo_url}}
                  style={styles.galleryImage}
                  resizeMode="cover"
                />
                <View style={styles.photoTypeLabel}>
                  <Text style={styles.photoTypeLabelText}>
                    {photo.photo_type}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Nomad Life Section - 2 Column Grid */}
      <View style={styles.nomadLifeSection}>
        <Text style={styles.sectionTitle}>Nomad Life</Text>
        <View style={styles.nomadCardsContainer}>
          {profile.nomad_type ? (
            <View style={styles.nomadCard}>
              <MaterialCommunityIcons
                name="van-utility"
                size={24}
                color="#6B7280"
              />
              <Text style={styles.nomadCardValue} numberOfLines={2}>
                {profile.nomad_type}
              </Text>
            </View>
          ) : null}
          <View style={styles.nomadCard}>
            <MaterialCommunityIcons name="airplane" size={24} color="#6B7280" />
            <Text style={styles.nomadCardValue} numberOfLines={2}>
              {profile.travel_style}
            </Text>
          </View>
          <View style={styles.nomadCard}>
            <MaterialCommunityIcons
              name="map-marker-path"
              size={24}
              color="#6B7280"
            />
            <Text style={styles.nomadCardValue} numberOfLines={2}>
              {profile.movement_pattern}
            </Text>
          </View>
          <View style={styles.nomadCard}>
            <MaterialCommunityIcons
              name="calendar-clock"
              size={24}
              color="#6B7280"
            />
            <Text style={styles.nomadCardValue} numberOfLines={2}>
              {profile.years_in_van_life} years in van life
            </Text>
          </View>
        </View>
      </View>
      {/* Relationship Intent */}
      {profile.relationship_intent &&
        profile.relationship_intent.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Looking For</Text>
            <View style={styles.tagsContainer}>
              {profile.relationship_intent.map((intent, index) => (
                <View key={index} style={styles.intentTag}>
                  <MaterialCommunityIcons
                    name="heart"
                    size={14}
                    color="#EF4444"
                  />
                  <Text style={styles.intentTagText}>{intent}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

      {/* Combined Interest Section - Hobbies, Skills, Lifestyle */}
      {(profile.hobbies?.length > 0 ||
        profile.skills?.length > 0 ||
        profile.lifestyle_tags?.length > 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interest</Text>
          <View style={styles.tagsContainer}>
            {/* Lifestyle Tags */}
            {profile.lifestyle_tags &&
              profile.lifestyle_tags.map((tag, index) => (
                <View key={`lifestyle-${index}`} style={styles.lifestyleTag}>
                  <MaterialCommunityIcons
                    name="leaf"
                    size={14}
                    color="#4338CA"
                  />
                  <Text style={styles.lifestyleTagText}>{tag}</Text>
                </View>
              ))}

            {/* Hobbies */}
            {profile.hobbies &&
              profile.hobbies.map((hobby, index) => (
                <View key={`hobby-${index}`} style={styles.hobbyTag}>
                  <MaterialCommunityIcons
                    name="tag"
                    size={14}
                    color="#0C4A6E"
                  />
                  <Text style={styles.hobbyTagText}>{hobby}</Text>
                </View>
              ))}

            {/* Skills */}
            {profile.skills &&
              profile.skills.map((skill, index) => (
                <View key={`skill-${index}`} style={styles.skillTag}>
                  <MaterialCommunityIcons
                    name="star"
                    size={12}
                    color="#F59E0B"
                  />
                  <Text style={styles.skillTagText}>{skill}</Text>
                </View>
              ))}
          </View>
        </View>
      )}

      {/* Favorite Activities */}
      {profile.favorite_activities &&
        profile.favorite_activities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Favorite Activities</Text>
            <View style={styles.tagsContainer}>
              {profile.favorite_activities.map((activity, index) => (
                <View key={index} style={styles.activityTag}>
                  <MaterialCommunityIcons
                    name="run"
                    size={14}
                    color="#10B981"
                  />
                  <Text style={styles.activityTagText}>{activity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

      {/* Member Since */}
      <View style={styles.memberSection}>
        <MaterialCommunityIcons
          name="account-clock"
          size={20}
          color="#9CA3AF"
        />
        <Text style={styles.memberSince}>
          Member since {formatDate(profile.created_at)}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9F8'
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F7F9F8',
    alignItems: 'center',
    justifyContent: 'center'
  },
  scrollContent: {
    paddingBottom: 48
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    textAlign: 'center'
  },
  headerIconButton: {
    padding: 8,
    borderRadius: 10
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  settingsOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingLeft: 16
  },
  settingsMenu: {
    backgroundColor: '#fff',
    borderRadius: 14,
    minWidth: 240,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6ECE9',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8
  },
  settingsMenuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16
  },
  settingsMenuItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827'
  },
  settingsMenuDivider: {
    height: 1,
    backgroundColor: '#E5E7EB'
  },
  premiumModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    alignItems: 'center'
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 10
  },
  premiumIcon: {
    marginTop: 16,
    marginBottom: 16
  },
  premiumModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center'
  },
  premiumModalDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24
  },
  premiumFeatures: {
    width: '100%',
    marginBottom: 24,
    gap: 12
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500'
  },
  goPremiumButton: {
    width: '100%',
    backgroundColor: '#2e7d64',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12
  },
  goPremiumButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  maybeLaterText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500'
  },
  premiumCard: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 20,
    backgroundColor: '#EAF7F0',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#2e7d64',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2
  },
  premiumCardContent: {
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: 14,
    rowGap: 10
  },
  premiumCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0
  },
  premiumCardText: {
    gap: 4,
    flexShrink: 1,
    minWidth: 0
  },
  premiumCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flexShrink: 1
  },
  premiumCardSubtitle: {
    fontSize: 12,
    color: '#5B6B61',
    flexShrink: 1
  },
  premiumCardButton: {
    backgroundColor: '#2e7d64',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'stretch',
    alignItems: 'center'
  },
  premiumCardButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  profileHeader: {
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 8
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 16,
    marginBottom: 10
  },
  profileInfoContainer: {
    width: '100%'
  },
  profilePicture: {
    width: 112,
    height: 112,
    borderRadius: 56,
    marginBottom: 5,
    borderWidth: 2,
    borderColor: '#2e7d64'
  },
  placeholderPicture: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  nameText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'left',
    letterSpacing: 0.2
  },
  genderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  genderText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'left',
    fontWeight: '500'
  },
  locationRowCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 5,
    marginBottom: 8
  },
  locationCentered: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'left',
    fontWeight: '500'
  },
  headerStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1
  },
  headerStatsColumn: {
    flex: 1,
    gap: 0
  },
  headerStatItem: {
    alignItems: 'center',
    minWidth: 60
  },
  headerStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A'
  },
  headerStatLabel: {
    fontSize: 12,
    color: '#64748B'
  },
  headerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: -20,
    marginBottom: 10
  },
  headerActionButton: {
    flex: 1,
    backgroundColor: '#2e7d64',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center'
  },
  headerActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  headerActionButtonOutline: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2e7d64'
  },
  headerActionTextOutline: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2e7d64'
  },
  profileMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 6
  },
  statItem: {
    alignItems: 'center'
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937'
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280'
  },
  nomadPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },
  nomadPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2e7d64'
  },
  verifiedStatus: {
    fontSize: 12,
    color: '#2e7d64',
    fontWeight: '600',
    textAlign: 'left',
    marginTop: 4
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24
  },
  sectionDivider: {
    height: 2,
    backgroundColor: '#E6ECE9',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4
  },
  photoGallerySection: {
    marginTop: 12
  },
  nomadLifeSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
    marginTop: 6
  },
  nomadLifeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2e7d64',
    marginBottom: 10,
    textAlign: 'left',
    letterSpacing: 0.3
  },
  nomadCardsContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12
  },
  nomadCard: {
    width: '48%',
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E6ECE9',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2
  },
  nomadCardValue: {
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'left'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2e7d64',
    marginBottom: 10,
    letterSpacing: 0.3
  },
  bioText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
    marginTop: 4,
    lineHeight: 20
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  intentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 22,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FECACA'
  },
  intentTagText: {
    fontSize: 13,
    color: '#991B1B',
    fontWeight: '600'
  },
  hobbyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 22,
    gap: 6,
    borderWidth: 1,
    borderColor: '#BAE6FD'
  },
  hobbyTagText: {
    fontSize: 13,
    color: '#0C4A6E',
    fontWeight: '600'
  },
  skillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 22,
    gap: 5,
    borderWidth: 1,
    borderColor: '#FDE68A'
  },
  skillTagText: {
    fontSize: 13,
    color: '#B45309',
    fontWeight: '600'
  },
  lifestyleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 22,
    gap: 6,
    borderWidth: 1,
    borderColor: '#C7D2FE'
  },
  lifestyleTagText: {
    fontSize: 13,
    color: '#4338CA',
    fontWeight: '600'
  },
  activityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 22,
    gap: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },
  activityTagText: {
    fontSize: 13,
    color: '#047857',
    fontWeight: '600'
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  galleryImageContainer: {
    position: 'relative'
  },
  galleryImage: {
    width: GALLERY_IMAGE_SIZE,
    height: GALLERY_IMAGE_SIZE,
    borderRadius: 14
  },
  photoTypeLabel: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  photoTypeLabelText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '500'
  },
  memberSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E6ECE9',
    marginHorizontal: 16
  },
  memberSince: {
    fontSize: 13,
    color: '#9CA3AF'
  }
});
