import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type PlanType = "vanora" | "mechanic";

type Benefit = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description: string;
};

export default function MembershipSubscriptionScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("vanora");

  const planContent = useMemo(() => {
    const common = {
      logo: require("../../assets/images/vanora.png"),
      primary: "#2e7d64",
    };

    if (selectedPlan === "vanora") {
      return {
        ...common,
        heading: "Vanora Premium",
        subheading:
          "Upgrade your experience and stand out in the Vanora community.",
        price: "$10.00",
        cadenceLabel: "Monthly",
        cadenceSuffix: "/mo",
        footnote: "Billed monthly. Cancel anytime in settings.",
        benefits: [
          {
            icon: "rocket-launch",
            title: "Visibility Boost",
            description:
              "Get prioritized exposure so more people can see and connect with you.",
          },
          {
            icon: "sword-cross",
            title: "Challenge Match Invites",
            description:
              "Access exclusive challenge-based matches and invitations.",
          },
          {
            icon: "account-multiple-plus",
            title: "Expanded Event Reach",
            description:
              "Invite more participants and increase engagement in your events.",
          },
          {
            icon: "check-decagram",
            title: "Verified Premium Badge",
            description:
              "Earn a verified badge that builds trust and credibility.",
          },
        ] as Benefit[],
      };
    }

    return {
      ...common,
      heading: "Mechanic Subscription",
      subheading: "Turn visibility into real opportunities and future clients.",
      price: "$15.99",
      cadenceLabel: "Quarterly",
      cadenceSuffix: "/qtr",
      footnote: "Billed quarterly. Cancel anytime in settings.",
      benefits: [
        {
          icon: "tools",
          title: "Featured Mechanic Profile",
          description: "Get highlighted in the Featured Mechanics section.",
        },
        {
          icon: "map-marker-radius",
          title: "Location-Based Discovery",
          description:
            "Appear in scanning results based on proximity to nearby users.",
        },
        {
          icon: "account-search",
          title: "Increased Client Opportunities",
          description:
            "Be seen by users actively looking for trusted mechanics.",
        },
        {
          icon: "trending-up",
          title: "Profit-Driven Exposure",
          description:
            "Grow your reputation and convert visibility into long-term clients.",
        },
      ] as Benefit[],
    };
  }, [selectedPlan]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
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
        <Text style={styles.headerTitle}>Membership &amp; Subscription</Text>
        <View style={styles.topBarSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoWrap}>
          <View style={styles.logoCard}>
            <Image source={planContent.logo} style={styles.logoImage} />
          </View>
        </View>

        <Text style={styles.title}>{planContent.heading}</Text>
        <Text style={styles.subtitle}>{planContent.subheading}</Text>

        <View style={styles.benefitsList}>
          {planContent.benefits.map((b) => (
            <View key={b.title} style={styles.benefitRow}>
              <View style={styles.benefitIconWrap}>
                <MaterialCommunityIcons
                  name={b.icon}
                  size={22}
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
            onPress={() => setSelectedPlan("vanora")}
            style={[
              styles.planCard,
              selectedPlan === "vanora"
                ? styles.planCardSelected
                : styles.planCardUnselected,
            ]}
          >
            <View
              style={[
                styles.planPill,
                selectedPlan === "vanora"
                  ? styles.planPillSelected
                  : styles.planPillUnselected,
              ]}
            >
              <Text
                style={[
                  styles.planPillText,
                  selectedPlan === "vanora"
                    ? styles.planPillTextSelected
                    : styles.planPillTextUnselected,
                ]}
              >
                VANORA
              </Text>
            </View>

            <View style={styles.planHeaderRow}>
              <Text
                style={[
                  styles.planName,
                  selectedPlan === "vanora"
                    ? styles.planNameSelected
                    : styles.planNameUnselected,
                ]}
              >
                Vanora
              </Text>
              <View
                style={[
                  styles.radio,
                  selectedPlan === "vanora" && styles.radioSelected,
                ]}
              >
                {selectedPlan === "vanora" ? (
                  <View style={styles.radioDot} />
                ) : null}
              </View>
            </View>

            <Text style={styles.planCadence}>{"Monthly"}</Text>

            <View style={styles.priceRow}>
              <Text
                style={[
                  styles.price,
                  selectedPlan === "vanora"
                    ? styles.priceSelected
                    : styles.priceUnselected,
                ]}
              >
                $10.00
              </Text>
              <Text style={styles.priceSuffix}>/mo</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setSelectedPlan("mechanic")}
            style={[
              styles.planCard,
              selectedPlan === "mechanic"
                ? styles.planCardSelected
                : styles.planCardUnselected,
            ]}
          >
            <View
              style={[
                styles.planPill,
                selectedPlan === "mechanic"
                  ? styles.planPillSelected
                  : styles.planPillUnselected,
              ]}
            >
              <Text
                style={[
                  styles.planPillText,
                  selectedPlan === "mechanic"
                    ? styles.planPillTextSelected
                    : styles.planPillTextUnselected,
                ]}
              >
                MECHANIC
              </Text>
            </View>

            <View style={styles.planHeaderRow}>
              <Text
                style={[
                  styles.planName,
                  selectedPlan === "mechanic"
                    ? styles.planNameSelected
                    : styles.planNameUnselected,
                ]}
              >
                Mechanic
              </Text>
              <View
                style={[
                  styles.radio,
                  selectedPlan === "mechanic" && styles.radioSelected,
                ]}
              >
                {selectedPlan === "mechanic" ? (
                  <View style={styles.radioDot} />
                ) : null}
              </View>
            </View>

            <Text style={styles.planCadence}>{"Quarterly"}</Text>

            <View style={styles.priceRow}>
              <Text
                style={[
                  styles.price,
                  selectedPlan === "mechanic"
                    ? styles.priceSelected
                    : styles.priceUnselected,
                ]}
              >
                $15.99
              </Text>
              <Text style={styles.priceSuffix}>/qtr</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.footnote}>{planContent.footnote}</Text>
      </ScrollView>

      <View style={styles.bottomArea}>
        <TouchableOpacity
          style={styles.continueButton}
          accessibilityRole="button"
          accessibilityLabel="Continue"
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topBar: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 6,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  topBarSpacer: {
    width: 44,
    height: 44,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  logoWrap: {
    alignItems: "center",
    paddingTop: 18,
    paddingBottom: 14,
  },
  logoCard: {
    width: 86,
    height: 86,
    borderRadius: 22,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  logoImage: {
    width: 42,
    height: 42,
    resizeMode: "contain",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#2e7d64",
    textAlign: "center",
    marginTop: 4,
  },
  subtitle: {
    marginTop: 1,
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 22,
    textAlign: "center",
  },
  benefitsList: {
    marginTop: 22,
    gap: 16,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  benefitIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  benefitTextWrap: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2e7d64",
  },
  benefitDesc: {
    marginTop: 4,
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  cardsRow: {
    marginTop: 26,
    flexDirection: "row",
    gap: 14,
  },
  planCard: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
    minHeight: 148,
    justifyContent: "space-between",
  },
  planCardSelected: {
    borderWidth: 2,
    borderColor: "#2e7d64",
    backgroundColor: "#ECFDF5",
  },
  planCardUnselected: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  planPill: {
    position: "absolute",
    top: -14,
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  planPillSelected: {
    backgroundColor: "#2e7d64",
    opacity: 1,
  },
  planPillUnselected: {
    backgroundColor: "#E5E7EB",
    opacity: 0.65,
  },
  planPillText: {
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 0.8,
  },
  planPillTextSelected: {
    color: "#fff",
  },
  planPillTextUnselected: {
    color: "#6B7280",
  },
  planHeaderRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  planName: {
    fontSize: 18,
    fontWeight: "800",
  },
  planNameSelected: {
    color: "#2e7d64",
  },
  planNameUnselected: {
    color: "#6B7280",
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  radioSelected: {
    borderColor: "#2e7d64",
    backgroundColor: "#ECFDF5",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2e7d64",
  },
  planCadence: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "700",
    color: "#9CA3AF",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    marginTop: 10,
  },
  price: {
    fontSize: 28,
    fontWeight: "900",
  },
  priceSelected: {
    color: "#2e7d64",
  },
  priceUnselected: {
    color: "#9CA3AF",
  },
  priceSuffix: {
    fontSize: 14,
    fontWeight: "700",
    color: "#9CA3AF",
    paddingBottom: 4,
  },
  footnote: {
    marginTop: 18,
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
  },
  bottomArea: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 18,
    backgroundColor: "#fff",
  },
  continueButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2e7d64",
    alignItems: "center",
    justifyContent: "center",
  },
  continueText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },
});
