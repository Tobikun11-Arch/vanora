import {showToast} from '@/components/Toast';
import {useRevenueCatSubscription} from '@/hooks/use-revenuecat-subscription';
import {revenueCatService} from '@/services/revenuecat.service';
import {useUserStore} from '@/store/userStore';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useRouter} from 'expo-router';
import {useEffect, useMemo, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {PurchasesPackage} from 'react-native-purchases';

type PlanType = 'vanora' | 'mechanic';

type Benefit = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description: string;
};

export default function MembershipSubscriptionScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('vanora');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [planPackages, setPlanPackages] = useState<
    Record<PlanType, PurchasesPackage | null>
  >({
    vanora: null,
    mechanic: null
  });
  const [isLoadingOfferings, setIsLoadingOfferings] = useState(true);
  const profile = useUserStore(state => state.profile);
  const isMechanic = profile?.nomad_type?.toLowerCase() === 'mechanic';
  const effectivePlan = isMechanic ? selectedPlan : 'vanora';
  const {isSubscribed, refresh: refreshSubscription} =
    useRevenueCatSubscription();
  const goBackToDashboard = () => {
    router.replace('/(app)/dashboard');
  };

  useEffect(() => {
    if (!isMechanic && selectedPlan === 'mechanic') {
      setSelectedPlan('vanora');
    }
  }, [isMechanic, selectedPlan]);

  useEffect(() => {
    let isMounted = true;
    const loadOfferings = async () => {
      setIsLoadingOfferings(true);
      try {
        const [vanoraPkg, mechanicPkg] = await Promise.all([
          revenueCatService.getPlanPackage('vanora'),
          revenueCatService.getPlanPackage('mechanic')
        ]);
        if (isMounted) {
          setPlanPackages({
            vanora: vanoraPkg,
            mechanic: mechanicPkg
          });
        }
      } catch (error) {
        console.warn('[RevenueCat] Offerings error:', error);
      } finally {
        if (isMounted) {
          setIsLoadingOfferings(false);
        }
      }
    };

    loadOfferings();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleContinue = async () => {
    if (isPurchasing) {
      return;
    }

    if (isSubscribed) {
      return;
    }

    try {
      setIsPurchasing(true);
      const pkg =
        effectivePlan === 'vanora'
          ? planPackages.vanora
          : planPackages.mechanic;
      if (!pkg && !isLoadingOfferings) {
        console.warn('[RevenueCat] Package not available for', effectivePlan);
        return;
      }
      const result = await revenueCatService.purchasePlan(effectivePlan);
      if (!result.success) {
        console.warn('[RevenueCat] Purchase failed:', result.reason);
        showToast('error', 'Subscription Failed', 'Please try again.');
        return;
      }

      await refreshSubscription();
      // TODO(revenuecat): Persist entitlement state and update user profile.
      // Example: result.customerInfo.entitlements.active
      showToast(
        'success',
        'Subscription Active',
        'Your premium access is now live.'
      );
      goBackToDashboard();
    } catch (error) {
      console.warn('[RevenueCat] Purchase error:', error);
      showToast('error', 'Purchase Error', 'Something went wrong. Try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      await revenueCatService.showManageSubscriptions();
    } catch (error) {
      console.warn('[RevenueCat] Manage subscription error:', error);
    }
  };

  const vanoraPrice = planPackages.vanora?.product?.priceString ?? '$10.00';
  const mechanicPrice = planPackages.mechanic?.product?.priceString ?? '$15.99';

  const planContent = useMemo(() => {
    const common = {
      logo: require('@/assets/images/vanora.png'),
      primary: '#2e7d64'
    };

    if (effectivePlan === 'vanora') {
      return {
        ...common,
        heading: 'Vanora Premium',
        subheading:
          'Upgrade your experience and stand out in the Vanora community.',
        price: vanoraPrice,
        cadenceLabel: 'Monthly',
        cadenceSuffix: '/mo',
        footnote: 'Billed monthly. Cancel anytime in settings.',
        benefits: [
          {
            icon: 'rocket-launch',
            title: 'Visibility Boost',
            description:
              'Get prioritized exposure so more people can see and connect with you.'
          },
          {
            icon: 'sword-cross',
            title: 'Challenge Match Invites',
            description:
              'Access exclusive challenge-based matches and invitations.'
          },
          {
            icon: 'account-multiple-plus',
            title: 'Expanded Event Reach',
            description:
              'Invite more participants and increase engagement in your events.'
          },
          {
            icon: 'check-decagram',
            title: 'Verified Premium Badge',
            description:
              'Earn a verified badge that builds trust and credibility.'
          }
        ] as Benefit[]
      };
    }

    return {
      ...common,
      heading: 'Mechanic Subscription',
      subheading: 'Turn visibility into real opportunities and future clients.',
      price: mechanicPrice,
      cadenceLabel: 'Quarterly',
      cadenceSuffix: '/qtr',
      footnote: 'Billed quarterly. Cancel anytime in settings.',
      benefits: [
        {
          icon: 'tools',
          title: 'Featured Mechanic Profile',
          description: 'Get highlighted in the Featured Mechanics section.'
        },
        {
          icon: 'map-marker-radius',
          title: 'Location-Based Discovery',
          description:
            'Appear in scanning results based on proximity to nearby users.'
        },
        {
          icon: 'account-search',
          title: 'Increased Client Opportunities',
          description:
            'Be seen by users actively looking for trusted mechanics.'
        },
        {
          icon: 'trending-up',
          title: 'Profit-Driven Exposure',
          description:
            'Grow your reputation and convert visibility into long-term clients.'
        }
      ] as Benefit[]
    };
  }, [effectivePlan, mechanicPrice, vanoraPrice]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={goBackToDashboard}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={32}
            color="#111827"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription</Text>
        <View style={styles.topBarSpacer} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{planContent.heading}</Text>
        <Text style={styles.subtitle}>{planContent.subheading}</Text>

        <View style={styles.benefitsList}>
          {planContent.benefits.map(b => (
            <View key={b.title} style={styles.benefitRow}>
              <View style={styles.benefitIconWrap}>
                <MaterialCommunityIcons
                  name={b.icon}
                  size={18}
                  color={planContent.primary}
                />
              </View>
              <View style={styles.benefitTextWrap}>
                <Text style={styles.benefitTitle}>{b.title}</Text>
                <Text style={styles.benefitDesc}>{b.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.cardsRow}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setSelectedPlan('vanora')}
            style={[
              styles.planCard,
              selectedPlan === 'vanora'
                ? styles.planCardSelected
                : styles.planCardUnselected
            ]}
          >
            <View
              style={[
                styles.planPill,
                selectedPlan === 'vanora'
                  ? styles.planPillSelected
                  : styles.planPillUnselected
              ]}
            >
              <Text
                style={[
                  styles.planPillText,
                  selectedPlan === 'vanora'
                    ? styles.planPillTextSelected
                    : styles.planPillTextUnselected
                ]}
              >
                VANORA
              </Text>
            </View>

            <View style={styles.planHeaderRow}>
              <Text
                style={[
                  styles.planName,
                  selectedPlan === 'vanora'
                    ? styles.planNameSelected
                    : styles.planNameUnselected
                ]}
              >
                Vanora
              </Text>
              <View
                style={[
                  styles.radio,
                  selectedPlan === 'vanora' && styles.radioSelected
                ]}
              >
                {selectedPlan === 'vanora' ? (
                  <View style={styles.radioDot} />
                ) : null}
              </View>
            </View>

            <Text style={styles.planCadence}>{'Monthly'}</Text>

            <View style={styles.priceRow}>
              <Text
                style={[
                  styles.price,
                  selectedPlan === 'vanora'
                    ? styles.priceSelected
                    : styles.priceUnselected
                ]}
              >
                {vanoraPrice}
              </Text>
              <Text style={styles.priceSuffix}>/mo</Text>
            </View>
          </TouchableOpacity>

          {isMechanic ? (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setSelectedPlan('mechanic')}
              style={[
                styles.planCard,
                selectedPlan === 'mechanic'
                  ? styles.planCardSelected
                  : styles.planCardUnselected
              ]}
            >
              <View
                style={[
                  styles.planPill,
                  selectedPlan === 'mechanic'
                    ? styles.planPillSelected
                    : styles.planPillUnselected
                ]}
              >
                <Text
                  style={[
                    styles.planPillText,
                    selectedPlan === 'mechanic'
                      ? styles.planPillTextSelected
                      : styles.planPillTextUnselected
                  ]}
                >
                  MECHANIC
                </Text>
              </View>

              <View style={styles.planHeaderRow}>
                <Text
                  style={[
                    styles.planName,
                    selectedPlan === 'mechanic'
                      ? styles.planNameSelected
                      : styles.planNameUnselected
                  ]}
                >
                  Mechanic
                </Text>
                <View
                  style={[
                    styles.radio,
                    selectedPlan === 'mechanic' && styles.radioSelected
                  ]}
                >
                  {selectedPlan === 'mechanic' ? (
                    <View style={styles.radioDot} />
                  ) : null}
                </View>
              </View>

              <Text style={styles.planCadence}>{'Quarterly'}</Text>

              <View style={styles.priceRow}>
                <Text
                  style={[
                    styles.price,
                    selectedPlan === 'mechanic'
                      ? styles.priceSelected
                      : styles.priceUnselected
                  ]}
                >
                  {mechanicPrice}
                </Text>
                <Text style={styles.priceSuffix}>/qtr</Text>
              </View>
            </TouchableOpacity>
          ) : null}
        </View>

        <Text style={styles.footnote}>{planContent.footnote}</Text>
      </View>

      <View style={styles.bottomArea}>
        {isSubscribed ? (
          <>
            <View style={styles.subscribedBadge}>
              <MaterialCommunityIcons
                name="check-decagram"
                size={18}
                color="#2e7d64"
              />
              <Text style={styles.subscribedText}>
                You are already premium.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleManageSubscription}
              accessibilityRole="button"
              accessibilityLabel="Manage subscription"
            >
              <Text style={styles.continueText}>Manage Subscription</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[
              styles.continueButton,
              isPurchasing && styles.continueButtonDisabled
            ]}
            onPress={handleContinue}
            disabled={isPurchasing}
            accessibilityRole="button"
            accessibilityLabel="Continue"
          >
            <Text style={styles.continueText}>
              {isPurchasing ? 'Processing...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAF9'
  },
  topBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    marginTop: 30,
    backgroundColor: '#F7FAF9'
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 0.2
  },
  backButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },
  topBarSpacer: {
    width: 38,
    height: 38
  },
  content: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 4
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2e7d64',
    textAlign: 'center',
    marginTop: 15,
    letterSpacing: 0.2
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
    textAlign: 'center',
    paddingHorizontal: 10
  },
  benefitsList: {
    marginTop: 20,
    flexDirection: 'column',
    gap: 6
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6ECE9'
  },
  benefitIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#f0fdf9',
    borderWidth: 1,
    borderColor: '#9ed6c3',
    alignItems: 'center',
    justifyContent: 'center'
  },
  benefitTextWrap: {
    flex: 1
  },
  benefitTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1F2937',
    letterSpacing: 0.1
  },
  benefitDesc: {
    marginTop: 2,
    fontSize: 9,
    color: '#6B7280',
    lineHeight: 12
  },
  cardsRow: {
    marginTop: 8,
    flexDirection: 'column',
    gap: 8
  },
  planCard: {
    width: '100%',
    borderRadius: 14,
    padding: 10,
    height: 96,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2
  },
  planCardSelected: {
    borderWidth: 2,
    borderColor: '#2e7d64',
    backgroundColor: '#f0fdf9',
    shadowColor: '#2e7d64',
    shadowOpacity: 0.12
  },
  planCardUnselected: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff'
  },
  planPill: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1
  },
  planPillSelected: {
    backgroundColor: '#2e7d64',
    opacity: 1
  },
  planPillUnselected: {
    backgroundColor: '#E5E7EB',
    opacity: 0.7
  },
  planPillText: {
    fontWeight: '800',
    fontSize: 9,
    letterSpacing: 0.9
  },
  planPillTextSelected: {
    color: '#fff'
  },
  planPillTextUnselected: {
    color: '#6B7280'
  },
  planHeaderRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  planName: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2
  },
  planNameSelected: {
    color: '#2e7d64'
  },
  planNameUnselected: {
    color: '#6B7280'
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  radioSelected: {
    borderColor: '#2e7d64',
    backgroundColor: '#f0fdf9'
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2e7d64'
  },
  planCadence: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF'
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    marginTop: 6
  },
  price: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5
  },
  priceSelected: {
    color: '#2e7d64'
  },
  priceUnselected: {
    color: '#9CA3AF'
  },
  priceSuffix: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    paddingBottom: 4
  },
  footnote: {
    marginTop: 8,
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 14
  },
  bottomArea: {
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 10,
    backgroundColor: '#F7FAF9'
  },
  subscribedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8
  },
  subscribedText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2e7d64'
  },
  continueButton: {
    height: 46,
    borderRadius: 23,
    backgroundColor: '#2e7d64',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2e7d64',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4
  },
  continueButtonDisabled: {
    opacity: 0.6
  },
  continueText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3
  },
  secondaryButton: {
    marginTop: 12,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center'
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151'
  }
});
