import {MaterialIcons} from '@expo/vector-icons';
import {BlurView} from 'expo-blur';
import {useRouter} from 'expo-router';
import React, {useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  type ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import {Button} from '../../components/Button';

const {width} = Dimensions.get('window');

const CARD_SIDE_PADDING = 40;
const CARD_WIDTH = width - CARD_SIDE_PADDING * 2;

interface CardData {
  icon: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
}

const cardsData: CardData[] = [
  {
    icon: 'favorite',
    title: 'Find Your Co-Pilot',
    description:
      'Connect with fellow travelers who share your passion for the open road and the freedom of van life.',
    image: require('../../assets/images/copilot-bg-removed.png')
  },
  {
    icon: 'explore',
    title: 'Discover Adventures',
    description:
      'Explore hidden gems and popular destinations recommended by our community of experienced nomads.',
    image: require('../../assets/images/discover-bg-removed.png')
  },
  {
    icon: 'groups',
    title: 'Build Community',
    description:
      'Join groups, share experiences, and find support from people who understand the van life lifestyle.',
    image: require('../../assets/images/community-bg-removed.png')
  },
  {
    icon: 'photo-camera',
    title: 'Share Your Journey',
    description:
      'Document your travels, post photos, and inspire others with your unique nomadic lifestyle stories.',
    image: require('../../assets/images/share-bg-removed.png')
  },
  {
    icon: 'airport-shuttle',
    title: 'Van Life Made Easy',
    description:
      'Find tips, resources, and connect with builders and service providers trusted by van lifers.',
    image: require('../../assets/images/van-bg-removed.png')
  }
];

export default function GetStartedScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => {
        const next = (prev + 1) % cardsData.length;
        scrollViewRef.current?.scrollTo({
          x: next * width,
          animated: true
        });
        return next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    const clampedIndex = Math.max(0, Math.min(cardsData.length - 1, index));
    setActiveIndex(clampedIndex);
  };

  return (
    <ImageBackground
      source={{
        uri: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1000&auto=format&fit=crop'
      }}
      style={styles.backgroundImage}
      imageStyle={styles.backgroundImageStyle}
    >
      {/* Overlay */}
      <View style={styles.overlay} />

      <View style={styles.container}>
        <View style={styles.ambientGlow} />
        {/* Top Section with Logo and Name */}
        <View style={styles.topSection}>
          <Image
            source={require('../../assets/images/vanora-logo-only.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.appName}>anora</Text>
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
          contentContainerStyle={styles.cardsContent}
        >
          {cardsData.map((card, index) => (
            <View key={index} style={styles.cardWrapper}>
              <View style={styles.cardShadowContainer}>
                <BlurView
                  intensity={Platform.OS === 'ios' ? 15 : 15}
                  tint="light"
                  style={styles.glassCardSurface}
                >
                  <View style={styles.glassCard}>
                    <View style={styles.glassTint} />
                    {/* Card Header with Icon */}
                    <View style={styles.cardHeader}>
                      <View style={styles.cardIconCircle}>
                        <MaterialIcons
                          name={card.icon as any}
                          size={30}
                          color="#2e7d64"
                        />
                      </View>
                      <Text style={styles.cardTitle}>{card.title}</Text>
                    </View>

                    {/* Card Description */}
                    <Text style={styles.cardDescription}>
                      {card.description}
                    </Text>

                    {/* Card Image */}
                    <Image
                      source={card.image}
                      style={styles.cardImage}
                      resizeMode="contain"
                    />
                  </View>
                </BlurView>
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
            onPress={() => router.push('/(auth)/signup')}
          />
          <View style={styles.loginPrompt}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Text
              style={styles.loginLink}
              onPress={() => router.push('/login')}
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
    width: '100%',
    height: '100%'
  },
  backgroundImageStyle: {
    resizeMode: 'cover'
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.08)'
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === 'android' ? 28 : 40,
    zIndex: 1
  },
  ambientGlow: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 120 : 180,
    left: -80,
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width * 0.45,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    opacity: 0.45
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20
  },
  logoImage: {
    width: width * 0.35, // scales to ~22% of screen width
    height: width * 0.35, // keeps square ratio
    tintColor: '#2e7d64',
    resizeMode: 'contain',
    marginRight: -25,
  },
  appName: {
    fontSize: width * 0.1, // scales with screen width
    fontWeight: '900',
    color: '#2e7d64',
    letterSpacing: 1,
    marginLeft: -8, // consistent spacing from logo
    marginTop:15,
  },

  cardsContainer: {
    flex: 1,
    marginTop: Platform.OS === 'android' ? 10 : 0,
    marginBottom: 20,
    marginHorizontal: -20
  },
  cardsContent: {
    alignItems: 'center',
    paddingVertical: Platform.OS === 'android' ? 20 : 24
  },
  cardWrapper: {
    width,
    paddingHorizontal: CARD_SIDE_PADDING,
    justifyContent: 'center',
    height: '100%'
  },
  cardShadowContainer: {
    width: CARD_WIDTH,
    alignSelf: 'center',
    flex: 1,
    minHeight: 520,
    borderRadius: 20,
    shadowColor: 'rgba(0,0,0,0.35)',
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  glassCardSurface: {
    flex: 1,
    minHeight: 520,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor:
      Platform.OS === 'android'
        ? 'rgba(255, 255, 255, 0.02)'
        : 'rgba(255, 255, 255, 0)'
  },
  glassCard: {
    flex: 1,
    minHeight: 520,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 20,
    padding: 32,
    borderWidth: 1.5,
    borderColor:
      Platform.OS === 'android'
        ? 'rgba(214, 247, 245, 0.1)'
        : 'rgba(255, 255, 255, 0.35)',
    alignItems: 'stretch',
    justifyContent: 'flex-start'
  },
  glassTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.04)'
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6
  },
  cardIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#cfe7deff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  cardTitle: {
    fontSize: Platform.OS === 'android' ? 20 : 26,
    fontWeight: Platform.OS === 'android' ? '800' : '700',
    color: '#2e7d64',
    marginBottom: 0,
    textAlign: 'center'
  },
  cardDescription: {
    fontSize: Platform.OS === 'android' ? 14 : 15,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: Platform.OS === 'android' ? 17 : 22,
    marginTop: 2,
    marginBottom: 24
  },
  cardImage: {
    width: '100%',
    flex: 1,
    minHeight: 240,
    borderRadius: 12,
    marginBottom: 0
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 6
  },
  dotActive: {
    backgroundColor: '#2e7d64',
    width: 24
  },
  bottomSection: {
    paddingBottom: 10
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16
  },
  loginText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14
  },
  loginLink: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline'
  }
});
