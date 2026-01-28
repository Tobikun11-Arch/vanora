import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface PollPostProps {
  username: string;
}

export default function PollPost({username}: PollPostProps) {
  const [caption, setCaption] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  return (
    <View style={styles.container}>
      {/* User Info */}
      <View style={styles.userRow}>
        <View style={styles.avatar}>
          <MaterialCommunityIcons name="account" size={24} color="#6B7280" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.username}>@{username}</Text>
          <TouchableOpacity style={styles.locationBtn}>
            <MaterialCommunityIcons
              name="map-marker"
              size={14}
              color="#4A7C59"
            />
            <Text style={styles.locationText}>Add Location</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.visibilityBtn}>
          <MaterialCommunityIcons name="earth" size={14} color="#6B7280" />
          <Text style={styles.visibilityText}>Everyone</Text>
        </TouchableOpacity>
      </View>

      {/* Poll Question */}
      <TextInput
        style={styles.captionInput}
        placeholder="Ask a question to the community..."
        placeholderTextColor="#9CA3AF"
        multiline
        value={caption}
        onChangeText={setCaption}
      />

      {/* Poll Options */}
      <View style={styles.optionsContainer}>
        <Text style={styles.optionsLabel}>Poll Options</Text>
        {options.map((option, index) => (
          <View key={index} style={styles.optionInputRow}>
            <TextInput
              style={styles.optionInput}
              placeholder={`Option ${index + 1}`}
              placeholderTextColor="#9CA3AF"
              value={option}
              onChangeText={value => updateOption(index, value)}
            />
          </View>
        ))}
        <Text style={styles.helperText}>Add 2-4 options for your poll</Text>
      </View>

      {/* Poll Settings */}
      <View style={styles.settingsContainer}>
        <TouchableOpacity style={styles.settingRow}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={20}
            color="#4A7C59"
          />
          <Text style={styles.settingText}>Poll Duration</Text>
          <Text style={styles.settingValue}>2 days</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color="#9CA3AF"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center'
  },
  userInfo: {
    flex: 1,
    marginLeft: 12
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937'
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2
  },
  locationText: {
    fontSize: 12,
    color: '#4A7C59',
    marginLeft: 4
  },
  visibilityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  visibilityText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4
  },
  captionInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#374151',
    minHeight: 60
  },
  optionsContainer: {
    paddingHorizontal: 16,
    marginTop: 8
  },
  optionsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8
  },
  optionInputRow: {
    marginBottom: 8
  },
  optionInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937'
  },
  helperText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4
  },
  settingsContainer: {
    marginTop: 20
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6'
  },
  settingText: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 12
  },
  settingValue: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8
  }
});
