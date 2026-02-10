import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useRouter} from 'expo-router';
import {
  ScrollView,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Platform
} from 'react-native';
import {Button} from '../../components/Button';
import {showToast} from '../../components/Toast';
import {useProfileStore} from '../../store/profileStore';
import {
  FAVORITE_ACTIVITIES,
  HOBBIES,
  LIFESTYLE_TAGS,
  SKILLS
} from '../../utils/constants';

export default function Step3Screen() {
  const router = useRouter();
  const {step3: data, setStep3} = useProfileStore();

  const toggleItem = (category: keyof typeof data, item: string) => {
    setStep3({
      ...data,
      [category]: (data[category] as string[]).includes(item)
        ? (data[category] as string[]).filter(i => i !== item)
        : [...(data[category] as string[]), item]
    });
  };

  const handleNext = () => {
    if (data.hobbies.length === 0) {
      showToast('error', 'Required', 'Please select at least one hobby');
      return;
    }

    router.push('/(profile)/step-4');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
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
              <Text style={styles.progressStep}>Step 3 of 4</Text>
              <Text style={styles.progressPercent}>75% Complete</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, {width: '75%'}]} />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Interests & Personality</Text>
        <View style={styles.sectionDivider} />

        <Text style={styles.label}>Hobbies & Interests</Text>
        <View style={styles.grid}>
          {HOBBIES.map(hobby => (
            <TouchableOpacity
              key={hobby}
              style={[
                styles.chip,
                data.hobbies.includes(hobby) && styles.chipSelected
              ]}
              onPress={() => toggleItem('hobbies', hobby)}
            >
              <Text
                style={[
                  styles.chipText,
                  data.hobbies.includes(hobby) && styles.chipTextSelected
                ]}
              >
                {hobby}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Skills / Strengths</Text>
        <View style={styles.grid}>
          {SKILLS.map(skill => (
            <TouchableOpacity
              key={skill}
              style={[
                styles.chip,
                data.skills.includes(skill) && styles.chipSelected
              ]}
              onPress={() => toggleItem('skills', skill)}
            >
              <Text
                style={[
                  styles.chipText,
                  data.skills.includes(skill) && styles.chipTextSelected
                ]}
              >
                {skill}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Lifestyle Tags</Text>
        <View style={styles.grid}>
          {LIFESTYLE_TAGS.map(tag => (
            <TouchableOpacity
              key={tag}
              style={[
                styles.chip,
                data.lifestyle_tags.includes(tag) && styles.chipSelected
              ]}
              onPress={() => toggleItem('lifestyle_tags', tag)}
            >
              <Text
                style={[
                  styles.chipText,
                  data.lifestyle_tags.includes(tag) && styles.chipTextSelected
                ]}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Favorite Activities</Text>
        <View style={styles.grid}>
          {FAVORITE_ACTIVITIES.map(activity => (
            <TouchableOpacity
              key={activity}
              style={[
                styles.chip,
                data.favorite_activities.includes(activity) &&
                  styles.chipSelected
              ]}
              onPress={() => toggleItem('favorite_activities', activity)}
            >
              <Text
                style={[
                  styles.chipText,
                  data.favorite_activities.includes(activity) &&
                    styles.chipTextSelected
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
  buttonContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.md
  }
});
