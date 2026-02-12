import {MaterialIcons} from "@expo/vector-icons";
import {BlurView} from "expo-blur";
import React from "react";
import {
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Platform,
    ScrollView,
    Text,
    View,
} from "react-native";
import {width} from "../constants";
import {cardsData} from "../data";
import {styles} from "../style";

export default function ScrollViewComponent({
  setActiveIndex,
  scrollViewRef,
}: {
  setActiveIndex: any;
  scrollViewRef: any;
}) {
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    const clampedIndex = Math.max(0, Math.min(cardsData.length - 1, index));
    setActiveIndex(clampedIndex);
  };

  return (
    <>
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
            <View style={styles.cardShadowContainer}>
              <BlurView
                intensity={Platform.OS === "ios" ? 40 : 10}
                tint="light"
                style={styles.glassCardSurface}
              >
                <View style={styles.glassCard}>
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
                  <Text style={styles.cardDescription}>{card.description}</Text>

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
    </>
  );
}
