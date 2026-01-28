import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useState} from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface GearTag {
  name: string;
  brand?: string;
  link?: string;
}

interface GearTagsModalProps {
  visible: boolean;
  onClose: () => void;
  selectedTags: GearTag[];
  onUpdateTags: (tags: GearTag[]) => void;
}

const SUGGESTED_GEAR = [
  {
    category: 'Solar & Power',
    items: [
      'Solar Panel',
      'Inverter',
      'Battery Bank',
      'Generator',
      'Shore Power Hookup'
    ]
  },
  {
    category: 'Kitchen',
    items: [
      'Portable Stove',
      'Cooler/Fridge',
      'Water Filter',
      'Cookware Set',
      'Sink Setup'
    ]
  },
  {
    category: 'Sleeping',
    items: [
      'Bed Platform',
      'Mattress',
      'Sleeping Bag',
      'Roof Vent Fan',
      'Blackout Curtains'
    ]
  },
  {
    category: 'Storage',
    items: [
      'Roof Rack',
      'Storage Bins',
      'Overhead Cabinet',
      'Under-bed Storage',
      'Cargo Net'
    ]
  },
  {
    category: 'Safety',
    items: [
      'Fire Extinguisher',
      'Carbon Monoxide Detector',
      'First Aid Kit',
      'Emergency Kit',
      'Dash Cam'
    ]
  },
  {
    category: 'Comfort',
    items: [
      'Portable Heater',
      'AC Unit',
      'Insulation',
      'LED Lights',
      'USB Outlets'
    ]
  },
  {
    category: 'Outdoor',
    items: [
      'Awning',
      'Camping Chairs',
      'Outdoor Table',
      'Hammock',
      'Portable Shower'
    ]
  },
  {
    category: 'Tech',
    items: [
      'Starlink',
      'Mobile Hotspot',
      'GPS',
      'Backup Camera',
      'Bluetooth Speaker'
    ]
  },
  {
    category: 'Van Parts',
    items: ['Suspension Upgrade', 'Tires', 'Roof Rack', 'Ladder', 'Tow Hitch']
  }
];

export default function GearTagsModal({
  visible,
  onClose,
  selectedTags,
  onUpdateTags
}: GearTagsModalProps) {
  const [customGear, setCustomGear] = useState('');
  const [customBrand, setCustomBrand] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);

  const isTagSelected = (name: string) => {
    return selectedTags.some(
      tag => tag.name.toLowerCase() === name.toLowerCase()
    );
  };

  const toggleTag = (name: string) => {
    if (isTagSelected(name)) {
      onUpdateTags(
        selectedTags.filter(
          tag => tag.name.toLowerCase() !== name.toLowerCase()
        )
      );
    } else {
      onUpdateTags([...selectedTags, {name}]);
    }
  };

  const addCustomGear = () => {
    if (customGear.trim()) {
      const newTag: GearTag = {
        name: customGear.trim(),
        brand: customBrand.trim() || undefined
      };
      onUpdateTags([...selectedTags, newTag]);
      setCustomGear('');
      setCustomBrand('');
      setShowCustomForm(false);
    }
  };

  const removeTag = (index: number) => {
    onUpdateTags(selectedTags.filter((_, i) => i !== index));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.title}>Add Gear Tags</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.doneBtn}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <View style={styles.selectedContainer}>
            <Text style={styles.sectionTitle}>
              Selected Gear ({selectedTags.length})
            </Text>
            <View style={styles.tagsRow}>
              {selectedTags.map((tag, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.selectedTag}
                  onPress={() => removeTag(index)}
                >
                  <Text style={styles.selectedTagText}>
                    {tag.brand ? `${tag.brand} ` : ''}
                    {tag.name}
                  </Text>
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={16}
                    color="#fff"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Custom Gear Form */}
        {showCustomForm ? (
          <View style={styles.customForm}>
            <Text style={styles.sectionTitle}>Add Custom Gear</Text>
            <TextInput
              style={styles.input}
              placeholder="Gear name (e.g., MaxxAir Fan)"
              placeholderTextColor="#9CA3AF"
              value={customGear}
              onChangeText={setCustomGear}
            />
            <TextInput
              style={styles.input}
              placeholder="Brand (optional)"
              placeholderTextColor="#9CA3AF"
              value={customBrand}
              onChangeText={setCustomBrand}
            />
            <View style={styles.customFormButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setShowCustomForm(false);
                  setCustomGear('');
                  setCustomBrand('');
                }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.addBtn,
                  !customGear.trim() && styles.addBtnDisabled
                ]}
                onPress={addCustomGear}
                disabled={!customGear.trim()}
              >
                <Text style={styles.addBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.customGearBtn}
            onPress={() => setShowCustomForm(true)}
          >
            <MaterialCommunityIcons name="plus" size={20} color="#4A7C59" />
            <Text style={styles.customGearBtnText}>Add Custom Gear</Text>
          </TouchableOpacity>
        )}

        {/* Suggested Gear */}
        <FlatList
          data={SUGGESTED_GEAR}
          keyExtractor={item => item.category}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({item}) => (
            <View style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{item.category}</Text>
              <View style={styles.tagsRow}>
                {item.items.map(gear => (
                  <TouchableOpacity
                    key={gear}
                    style={[
                      styles.gearTag,
                      isTagSelected(gear) && styles.gearTagSelected
                    ]}
                    onPress={() => toggleTag(gear)}
                  >
                    <Text
                      style={[
                        styles.gearTagText,
                        isTagSelected(gear) && styles.gearTagTextSelected
                      ]}
                    >
                      {gear}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        />
      </View>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937'
  },
  doneBtn: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A7C59'
  },
  selectedContainer: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A7C59',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6
  },
  selectedTagText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500'
  },
  customGearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8
  },
  customGearBtnText: {
    fontSize: 15,
    color: '#4A7C59',
    fontWeight: '500'
  },
  customForm: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1F2937',
    marginBottom: 8
  },
  customFormButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  cancelBtnText: {
    fontSize: 14,
    color: '#6B7280'
  },
  addBtn: {
    backgroundColor: '#4A7C59',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8
  },
  addBtnDisabled: {
    backgroundColor: '#9CA3AF'
  },
  addBtnText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600'
  },
  listContent: {
    padding: 16
  },
  categorySection: {
    marginBottom: 20
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 10
  },
  gearTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  gearTagSelected: {
    backgroundColor: '#4A7C59',
    borderColor: '#4A7C59'
  },
  gearTagText: {
    fontSize: 13,
    color: '#4B5563'
  },
  gearTagTextSelected: {
    color: '#fff'
  }
});
