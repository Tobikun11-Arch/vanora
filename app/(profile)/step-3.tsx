import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useRouter} from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#4a90e2" />
        </TouchableOpacity>
        <Text style={styles.stepIndicator}>Step 3 of 4</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Interests & Personality</Text>

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20
  },
  stepIndicator: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
    marginRight: 24
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginTop: 16
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9'
  },
  chipSelected: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2'
  },
  chipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500'
  },
  chipTextSelected: {
    color: '#fff'
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40
  }
});
