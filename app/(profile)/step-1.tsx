import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useRouter} from 'expo-router';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Dimensions
} from 'react-native';
import {Button} from '../../components/Button';
import {showToast} from '../../components/Toast';
import {useProfileStore} from '../../store/profileStore';
import {
  MOVEMENT_PATTERNS,
  LIFESTYLE_TYPES,
  NOMAD_TYPE_MECHANIC,
  RELATIONSHIP_INTENTS,
  TRAVEL_STYLES
} from '../../utils/constants';

export default function Step1Screen() {
  const router = useRouter();
  const {step1: data, setStep1} = useProfileStore();
  const displayLifestyleType = (type: string) =>
    type === 'Digital Nomad' ? 'Nomad' : type;

  const toggleRelationshipIntent = (intent: string) => {
    setStep1({
      ...data,
      relationship_intent: data.relationship_intent.includes(intent)
        ? data.relationship_intent.filter(i => i !== intent)
        : [...data.relationship_intent, intent]
    });
  };

  const handleNext = () => {
    if (!data.nomad_type) {
      showToast('error', 'Required', 'Please select nomad type');
      return;
    }
    if (!data.travel_style) {
      showToast('error', 'Required', 'Please select travel style');
      return;
    }
    if (data.relationship_intent.length === 0) {
      showToast(
        'error',
        'Required',
        'Please select at least one relationship intent'
      );
      return;
    }
    if (!data.movement_pattern) {
      showToast('error', 'Required', 'Please select movement pattern');
      return;
    }
    if (data.nomad_type === NOMAD_TYPE_MECHANIC) {
      if (!data.mechanic_whatsapp.trim()) {
        showToast('error', 'Required', 'Please enter WhatsApp number');
        return;
      }
      if (!data.mechanic_email.trim()) {
        showToast('error', 'Required', 'Please enter email address');
        return;
      }
      if (!data.mechanic_instagram.trim()) {
        showToast('error', 'Required', 'Please enter Instagram handle');
        return;
      }
    }

    router.push('/(profile)/step-2');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
      <View style={styles.headerBlock}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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
              <View style={[styles.progressFill, {width: '25%'}]} />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Identity & Lifestyle</Text>
        <View style={styles.sectionDivider} />

        <Text style={styles.label}>Lifestyle type</Text>
        <View style={styles.grid}>
          {LIFESTYLE_TYPES.map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.chip,
                data.nomad_type === type && styles.chipSelected
              ]}
              onPress={() => setStep1({...data, nomad_type: type})}
            >
              <Text
                style={[
                  styles.chipText,
                  data.nomad_type === type && styles.chipTextSelected
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
                onChangeText={text =>
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
                onChangeText={text => setStep1({...data, mechanic_email: text})}
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
                onChangeText={text =>
                  setStep1({...data, mechanic_instagram: text})
                }
              />
            </View>
          </View>
        )}

        <Text style={styles.label}>Travel Style</Text>
        <View style={styles.grid}>
          {TRAVEL_STYLES.map(style => (
            <TouchableOpacity
              key={style}
              style={[
                styles.chip,
                data.travel_style === style && styles.chipSelected
              ]}
              onPress={() => setStep1({...data, travel_style: style})}
            >
              <Text
                style={[
                  styles.chipText,
                  data.travel_style === style && styles.chipTextSelected
                ]}
              >
                {style}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Movement Pattern</Text>
        <View style={styles.grid}>
          {MOVEMENT_PATTERNS.map(pattern => (
            <TouchableOpacity
              key={pattern}
              style={[
                styles.chip,
                data.movement_pattern === pattern && styles.chipSelected
              ]}
              onPress={() => setStep1({...data, movement_pattern: pattern})}
            >
              <Text
                style={[
                  styles.chipText,
                  data.movement_pattern === pattern && styles.chipTextSelected
                ]}
              >
                {pattern}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Relationship Intent</Text>
        <View style={styles.grid}>
          {RELATIONSHIP_INTENTS.map(intent => (
            <TouchableOpacity
              key={intent}
              style={[
                styles.chip,
                data.relationship_intent.includes(intent) && styles.chipSelected
              ]}
              onPress={() => toggleRelationshipIntent(intent)}
            >
              <Text
                style={[
                  styles.chipText,
                  data.relationship_intent.includes(intent) &&
                    styles.chipTextSelected
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

const {width, height} = Dimensions.get('window');
const scale = (size: number) =>
  Math.round((Math.min(width, height) / 375) * size);
const STATUS_BAR_HEIGHT =
  Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0;
const SAFE_TOP_PADDING = Math.max(0, STATUS_BAR_HEIGHT);
const IS_IOS = Platform.OS === 'ios';

const SPACING = {
  xs: scale(6),
  sm: scale(10),
  md: scale(14),
  lg: scale(18),
  xl: scale(24)
};

const COLORS = {
  primary: '#2e7d64',
  bg: '#f6f8f7',
  card: '#ffffff',
  text: '#0f1a15',
  sub: '#5e6b65',
  muted: '#8b9591',
  border: '#e3e9e6',
  chipBg: '#f1f5f3'
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingTop: SAFE_TOP_PADDING
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.bg
  },
  scrollContent: {
    flexGrow: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingRight: SPACING.md,
    paddingTop: IS_IOS ? 0 : SPACING.xl,
    paddingBottom: SPACING.md
  },
  headerBlock: {
    marginHorizontal: SPACING.sm,
    marginBottom: SPACING.sm
  },
  backButton: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  progressArea: {
    flex: 1,
    marginLeft: SPACING.md
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs
  },
  progressStep: {
    fontSize: scale(12),
    color: COLORS.sub,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase'
  },
  progressPercent: {
    fontSize: scale(12),
    color: COLORS.primary,
    fontWeight: '700'
  },
  progressTrack: {
    height: scale(6),
    backgroundColor: COLORS.border,
    borderRadius: scale(999),
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.lg,
    borderRadius: scale(20),
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 2
  },
  sectionTitle: {
    fontSize: scale(20),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    letterSpacing: 0.2
  },
  sectionDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.lg
  },
  label: {
    fontSize: scale(13),
    fontWeight: '600',
    color: COLORS.sub,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
    letterSpacing: 0.2
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: scale(18),
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.chipBg
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  chipText: {
    fontSize: scale(12),
    color: COLORS.sub,
    fontWeight: '600'
  },
  chipTextSelected: {
    color: '#fff'
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: scale(12),
    paddingHorizontal: SPACING.md,
    backgroundColor: '#fff',
    minHeight: scale(48),
    marginBottom: SPACING.sm
  },
  inputIcon: {
    marginRight: SPACING.xs
  },
  input: {
    flex: 1,
    fontSize: scale(13),
    color: COLORS.text
  },
  buttonContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.md
  }
});
