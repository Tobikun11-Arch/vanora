import {MaterialCommunityIcons} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {Button} from "../../components/Button";
import {showToast} from "../../components/Toast";
import {useProfileStore} from "../../store/profileStore";
import {
  FAVORITE_ACTIVITIES,
  HOBBIES,
  LIFESTYLE_TAGS,
  SKILLS,
} from "../../utils/constants";

import {COLORS, styles} from "@/features/onboarding/step-3/style";
import React from "react";

export default function Step3Screen() {
  const router = useRouter();
  const {step3: data, setStep3} = useProfileStore();

  const toggleItem = (category: keyof typeof data, item: string) => {
    setStep3({
      ...data,
      [category]: (data[category] as string[]).includes(item)
        ? (data[category] as string[]).filter((i) => i !== item)
        : [...(data[category] as string[]), item],
    });
  };

  const handleNext = () => {
    if (data.hobbies.length === 0) {
      showToast("error", "Required", "Please select at least one hobby");
      return;
    }

    router.push("/(profile)/step-4");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.headerBlock}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={22}
                color={COLORS.primary}
              />
            </TouchableOpacity>
            <View style={styles.progressArea}>
              <View style={styles.progressRow}>
                <Text style={styles.progressStep}>Step 3 of 4</Text>
                <Text style={styles.progressPercent}>75% Complete</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, {width: "75%"}]} />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Interests & Personality</Text>
          <View style={styles.sectionDivider} />

          <Text style={styles.label}>Hobbies & Interests</Text>
          <View style={styles.grid}>
            {HOBBIES.map((hobby) => (
              <TouchableOpacity
                key={hobby}
                style={[
                  styles.chip,
                  data.hobbies.includes(hobby) && styles.chipSelected,
                ]}
                onPress={() => toggleItem("hobbies", hobby)}
              >
                <Text
                  style={[
                    styles.chipText,
                    data.hobbies.includes(hobby) && styles.chipTextSelected,
                  ]}
                >
                  {hobby}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Skills / Strengths</Text>
          <View style={styles.grid}>
            {SKILLS.map((skill) => (
              <TouchableOpacity
                key={skill}
                style={[
                  styles.chip,
                  data.skills.includes(skill) && styles.chipSelected,
                ]}
                onPress={() => toggleItem("skills", skill)}
              >
                <Text
                  style={[
                    styles.chipText,
                    data.skills.includes(skill) && styles.chipTextSelected,
                  ]}
                >
                  {skill}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Lifestyle Tags</Text>
          <View style={styles.grid}>
            {LIFESTYLE_TAGS.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.chip,
                  data.lifestyle_tags.includes(tag) && styles.chipSelected,
                ]}
                onPress={() => toggleItem("lifestyle_tags", tag)}
              >
                <Text
                  style={[
                    styles.chipText,
                    data.lifestyle_tags.includes(tag) &&
                      styles.chipTextSelected,
                  ]}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Favorite Activities</Text>
          <View style={styles.grid}>
            {FAVORITE_ACTIVITIES.map((activity) => (
              <TouchableOpacity
                key={activity}
                style={[
                  styles.chip,
                  data.favorite_activities.includes(activity) &&
                    styles.chipSelected,
                ]}
                onPress={() => toggleItem("favorite_activities", activity)}
              >
                <Text
                  style={[
                    styles.chipText,
                    data.favorite_activities.includes(activity) &&
                      styles.chipTextSelected,
                  ]}
                >
                  {activity}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Next" onPress={handleNext} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
