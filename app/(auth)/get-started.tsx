import ScrollViewComponent from "@/components/auth/get-started/components/ScrollView";
import {width} from "@/components/auth/get-started/constants";
import {cardsData} from "@/components/auth/get-started/data";
import {styles} from "@/components/auth/get-started/style";
import {useRouter} from "expo-router";
import React, {useEffect, useRef, useState} from "react";
import {Image, ImageBackground, ScrollView, Text, View} from "react-native";
import {Button} from "../../components/Button";

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

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1000&auto=format&fit=crop",
      }}
      style={styles.backgroundImage}
      imageStyle={styles.backgroundImageStyle}
    >
      {/* Overlay */}
      <View style={styles.overlay} />

      <View style={styles.container}>
        {/* Top Section with Logo and Name */}
        <View style={styles.topSection}>
          <Image
            source={require("../../assets/images/vanora-logo-only.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.appName}>anora</Text>
        </View>

        {/* Swipeable Cards */}
        <ScrollViewComponent
          setActiveIndex={setActiveIndex}
          scrollViewRef={scrollViewRef}
        ></ScrollViewComponent>

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
            onPress={() => router.push("/(auth)/signup")}
          />
          <View style={styles.loginPrompt}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Text
              style={styles.loginLink}
              onPress={() => router.push("/login")}
            >
              Log In
            </Text>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}
