import {COLORS, styles} from "@/components/onboarding/step-1/style";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import React from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {Button} from "../../components/Button";
import {showToast} from "../../components/Toast";
import {useProfileStore} from "../../store/profileStore";
import {
  LIFESTYLE_TYPES,
  MOVEMENT_PATTERNS,
  NOMAD_TYPE_MECHANIC,
  RELATIONSHIP_INTENTS,
  TRAVEL_STYLES,
} from "../../utils/constants";

export default function Step1Screen() {
  const router = useRouter();
  const {step1: data, setStep1} = useProfileStore();
  const displayLifestyleType = (type: string) =>
    type === "Digital Nomad" ? "Nomad" : type;

  const toggleRelationshipIntent = (intent: string) => {
    setStep1({
      ...data,
      relationship_intent: data.relationship_intent.includes(intent)
        ? data.relationship_intent.filter((i) => i !== intent)
        : [...data.relationship_intent, intent],
    });
  };

  const handleNext = () => {
    if (!data.nomad_type) {
      showToast("error", "Required", "Please select nomad type");
      return;
    }
    if (!data.travel_style) {
      showToast("error", "Required", "Please select travel style");
      return;
    }
    if (data.relationship_intent.length === 0) {
      showToast(
        "error",
        "Required",
        "Please select at least one relationship intent",
      );
      return;
    }
    if (!data.movement_pattern) {
      showToast("error", "Required", "Please select movement pattern");
      return;
    }
    if (data.nomad_type === NOMAD_TYPE_MECHANIC) {
      if (!data.mechanic_whatsapp.trim()) {
        showToast("error", "Required", "Please enter WhatsApp number");
        return;
      }
      if (!data.mechanic_email.trim()) {
        showToast("error", "Required", "Please enter email address");
        return;
      }
      if (!data.mechanic_instagram.trim()) {
        showToast("error", "Required", "Please enter Instagram handle");
        return;
      }
    }

    router.push("/(profile)/step-2");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
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
                    <Text style={styles.progressStep}>Step 1 of 4</Text>
                    <Text style={styles.progressPercent}>25% Complete</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, {width: "25%"}]} />
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.content}>
              <Text style={styles.sectionTitle}>Identity & Lifestyle</Text>
              <View style={styles.sectionDivider} />

              <Text style={styles.label}>Lifestyle type</Text>
              <View style={styles.grid}>
                {LIFESTYLE_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.chip,
                      data.nomad_type === type && styles.chipSelected,
                    ]}
                    onPress={() => setStep1({...data, nomad_type: type})}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        data.nomad_type === type && styles.chipTextSelected,
                      ]}
                    >
                      {displayLifestyleType(type)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {data.nomad_type === NOMAD_TYPE_MECHANIC && (
                <View>
                  <Text style={styles.label}>Builder Contact</Text>

                  <View style={styles.inputWrapper}>
                    <MaterialCommunityIcons
                      name="whatsapp"
                      size={20}
                      color={COLORS.muted}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Whatsapp number"
                      placeholderTextColor={COLORS.muted}
                      keyboardType="phone-pad"
                      value={data.mechanic_whatsapp}
                      onChangeText={(text) =>
                        setStep1({...data, mechanic_whatsapp: text})
                      }
                    />
                  </View>

                  <View style={styles.inputWrapper}>
                    <MaterialCommunityIcons
                      name="email-outline"
                      size={20}
                      color={COLORS.muted}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Email address"
                      placeholderTextColor={COLORS.muted}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={data.mechanic_email}
                      onChangeText={(text) =>
                        setStep1({...data, mechanic_email: text})
                      }
                    />
                  </View>

                  <View style={styles.inputWrapper}>
                    <MaterialCommunityIcons
                      name="instagram"
                      size={20}
                      color={COLORS.muted}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="username"
                      placeholderTextColor={COLORS.muted}
                      autoCapitalize="none"
                      value={data.mechanic_instagram}
                      onChangeText={(text) =>
                        setStep1({...data, mechanic_instagram: text})
                      }
                    />
                  </View>
                </View>
              )}

              <Text style={styles.label}>Travel Style</Text>
              <View style={styles.grid}>
                {TRAVEL_STYLES.map((style) => (
                  <TouchableOpacity
                    key={style}
                    style={[
                      styles.chip,
                      data.travel_style === style && styles.chipSelected,
                    ]}
                    onPress={() => setStep1({...data, travel_style: style})}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        data.travel_style === style && styles.chipTextSelected,
                      ]}
                    >
                      {style}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Movement Pattern</Text>
              <View style={styles.grid}>
                {MOVEMENT_PATTERNS.map((pattern) => (
                  <TouchableOpacity
                    key={pattern}
                    style={[
                      styles.chip,
                      data.movement_pattern === pattern && styles.chipSelected,
                    ]}
                    onPress={() =>
                      setStep1({...data, movement_pattern: pattern})
                    }
                  >
                    <Text
                      style={[
                        styles.chipText,
                        data.movement_pattern === pattern &&
                          styles.chipTextSelected,
                      ]}
                    >
                      {pattern}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Relationship Intent</Text>
              <View style={styles.grid}>
                {RELATIONSHIP_INTENTS.map((intent) => (
                  <TouchableOpacity
                    key={intent}
                    style={[
                      styles.chip,
                      data.relationship_intent.includes(intent) &&
                        styles.chipSelected,
                    ]}
                    onPress={() => toggleRelationshipIntent(intent)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        data.relationship_intent.includes(intent) &&
                          styles.chipTextSelected,
                      ]}
                    >
                      {intent}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <Button title="Next" onPress={handleNext} />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
