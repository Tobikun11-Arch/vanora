import {MaterialCommunityIcons} from '@expo/vector-icons';
import * as Location from 'expo-location';
import {useRouter} from 'expo-router';
import {useState} from 'react';
import {
  ActivityIndicator,
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
  MOVEMENT_PATTERNS,
  NOMAD_TYPES,
  RELATIONSHIP_INTENTS,
  TRAVEL_STYLES
} from '../../utils/constants';

export default function Step1Screen() {
  const router = useRouter();
  const {step1: data, setStep1} = useProfileStore();
  const [loadingLocation, setLoadingLocation] = useState(false);

  const toggleRelationshipIntent = (intent: string) => {
    setStep1({
      ...data,
      relationship_intent: data.relationship_intent.includes(intent)
        ? data.relationship_intent.filter(i => i !== intent)
        : [...data.relationship_intent, intent]
    });
  };

  const getLocationName = async (latitude: number, longitude: number) => {
    try {
      const result = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });
      if (result[0]) {
        const {city, region, country} = result[0];
        return `${city || region}, ${country}`;
      }
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  };

  const handleGetCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const {status} = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showToast(
          'error',
          'Permission Denied',
          'Location permission is required'
        );
        setLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });

      const locationName = await getLocationName(
        location.coords.latitude,
        location.coords.longitude
      );

      setStep1({...data, current_location: locationName});
      showToast('success', 'Location Found', locationName);
    } catch (error) {
      console.error('Location error:', error);
      showToast('error', 'Location Error', 'Failed to get current location');
    } finally {
      setLoadingLocation(false);
    }
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
    if (!data.current_location.trim()) {
      showToast('error', 'Required', 'Please enter current location');
      return;
    }
    if (!data.movement_pattern) {
      showToast('error', 'Required', 'Please select movement pattern');
      return;
    }

    router.push('/(profile)/step-2');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#4a90e2" />
        </TouchableOpacity>
        <Text style={styles.stepIndicator}>Step 1 of 4</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>🧍 Identity & Lifestyle</Text>

        <Text style={styles.label}>Nomad Type</Text>
        <View style={styles.grid}>
          {NOMAD_TYPES.map(type => (
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
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

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

        <Text style={styles.label}>Current Location (City/Region)</Text>
        <TouchableOpacity
          onPress={handleGetCurrentLocation}
          disabled={loadingLocation}
        >
          <View style={styles.locationInputWrapper}>
            {loadingLocation ? (
              <ActivityIndicator size="small" color="#4a90e2" />
            ) : (
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={20}
                color="#999"
                style={styles.locationIcon}
              />
            )}
            <Text style={styles.locationPlaceholder}>
              {data.current_location || 'Tap to select location'}
            </Text>
          </View>
        </TouchableOpacity>

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
  locationInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    minHeight: 48,
    marginBottom: 16
  },
  locationIcon: {
    marginRight: 8
  },
  locationPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: '#999'
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40
  }
});
