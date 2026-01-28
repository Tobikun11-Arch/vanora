import {MaterialCommunityIcons} from '@expo/vector-icons';
import debounce from 'lodash.debounce';
import {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface LocationResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface LocationSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (location: string) => void;
}

// Replace with your Google Places API key
const GOOGLE_PLACES_API_KEY = 'YOUR_GOOGLE_PLACES_API_KEY';

export default function LocationSearchModal({
  visible,
  onClose,
  onSelectLocation
}: LocationSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);

  const searchLocations = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          searchQuery
        )}&types=(regions)&key=${GOOGLE_PLACES_API_KEY}`
      );
      const data = await response.json();

      if (data.predictions) {
        setResults(data.predictions);
      }
    } catch (error) {
      console.error('Error searching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((text: string) => {
      if (!text.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          text
        )}&types=(regions)&key=${GOOGLE_PLACES_API_KEY}`
      )
        .then(response => response.json())
        .then(data => {
          if (data.predictions) {
            setResults(data.predictions);
          }
        })
        .catch(error => {
          console.error('Error searching locations:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 300),
    []
  );

  const handleQueryChange = (text: string) => {
    setQuery(text);
    debouncedSearch(text);
  };

  const handleSelectLocation = (location: LocationResult) => {
    onSelectLocation(location.structured_formatting.main_text);
    setQuery('');
    setResults([]);
    onClose();
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <MaterialCommunityIcons name="close" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.title}>Add Location</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a location..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={handleQueryChange}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear}>
              <MaterialCommunityIcons
                name="close-circle"
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#4A7C59" />
          </View>
        )}

        {/* Results List */}
        <FlatList
          data={results}
          keyExtractor={item => item.place_id}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.resultItem}
              onPress={() => handleSelectLocation(item)}
            >
              <MaterialCommunityIcons
                name="map-marker"
                size={20}
                color="#4A7C59"
              />
              <View style={styles.resultTextContainer}>
                <Text style={styles.resultMainText}>
                  {item.structured_formatting.main_text}
                </Text>
                <Text style={styles.resultSecondaryText}>
                  {item.structured_formatting.secondary_text}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            !loading && query.length > 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No locations found</Text>
              </View>
            ) : null
          }
        />
      </SafeAreaView>
    </Modal>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  closeBtn: {
    padding: 4
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937'
  },
  placeholder: {
    width: 32
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 10
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    marginLeft: 8
  },
  loadingContainer: {
    paddingVertical: 20
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  resultTextContainer: {
    flex: 1,
    marginLeft: 12
  },
  resultMainText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937'
  },
  resultSecondaryText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 15,
    color: '#9CA3AF'
  }
});
