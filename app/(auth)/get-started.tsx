import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button } from "../../components/Button";

const { width } = Dimensions.get("window");

interface CardData {
  icon: string;
  title: string;
  description: string;
  image: string;
}

const cardsData: CardData[] = [
  {
    icon: "❤️",
    title: "Find Your Co-Pilot",
    description:
      "Connect with fellow travelers who share your passion for the open road and the freedom of van life.",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500",
  },
  {
    icon: "🗺️",
    title: "Discover Adventures",
    description:
      "Explore hidden gems and popular destinations recommended by our community of experienced nomads.",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500",
  },
  {
    icon: "🤝",
    title: "Build Community",
    description:
      "Join groups, share experiences, and find support from people who understand the van life lifestyle.",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500",
  },
  {
    icon: "📍",
    title: "Share Your Journey",
    description:
      "Document your travels, post photos, and inspire others with your unique nomadic lifestyle stories.",
    image: "https://images.unsplash.com/photo-1516238323209-271f07db0f5f?w=500",
  },
  {
    icon: "🚐",
    title: "Van Life Made Easy",
    description:
      "Find tips, resources, and connect with mechanics and service providers trusted by van lifers.",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500",
  },
];

export default function GetStartedScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % cardsData.length;
        scrollViewRef.current?.scrollTo({
          x: next * width,
          animated: true,
        });
        return next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setActiveIndex(index);
  };

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1000&auto=format&fit=crop",
      }}
      style={styles.backgroundImage}
    >
      {/* Overlay */}
      <View style={styles.overlay} />

      <View style={styles.container}>
        {/* Top Section with Logo and Name */}
        <View style={styles.topSection}>
          <Text style={styles.logoIcon}>🚐</Text>
          <Text style={styles.appName}>Vanora</Text>
        </View>

        {/* Swipeable Cards */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          scrollEventThrottle={16}
          onScroll={handleScroll}
          showsHorizontalScrollIndicator={false}
          style={styles.cardsContainer}
        >
          {cardsData.map((card, index) => (
            <View key={index} style={styles.cardWrapper}>
              <View style={styles.glassCard}>
                {/* Card Icon */}
                <Text style={styles.cardIcon}>{card.icon}</Text>

                {/* Card Header */}
                <Text style={styles.cardTitle}>{card.title}</Text>

                {/* Card Description */}
                <Text style={styles.cardDescription}>{card.description}</Text>

                {/* Card Image */}
                <Image source={{ uri: card.image }} style={styles.cardImage} />
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {cardsData.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, activeIndex === index && styles.dotActive]}
            />
          ))}
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <Button
            title="Get Started"
            onPress={() => router.push("/(auth)/login")}
          />
          <View style={styles.loginPrompt}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Text
              style={styles.loginLink}
              onPress={() => router.push("/(auth)/login")}
            >
              Log In
            </Text>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 40,
    zIndex: 1,
  },
  topSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    marginBottom: 60,
  },
  logoIcon: {
    fontSize: 48,
    marginRight: 12,
  },
  appName: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  cardsContainer: {
    flex: 1,
    marginVertical: 20,
  },
  cardWrapper: {
    width: width - 40,
    paddingHorizontal: 0,
    justifyContent: "center",
  },
  glassCard: {
    backgroundColor: "rgba(202, 238, 227, 0.15)",
    backdropFilter: "blur(10px)",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
    alignItems: "center",
    overflow: "hidden",
  },
  cardIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  cardDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  cardImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 0,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 6,
  },
  dotActive: {
    backgroundColor: "#2e7d64",
    width: 24,
  },
  bottomSection: {
    marginBottom: 10,
  },
  loginPrompt: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  loginText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
  },
  loginLink: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
