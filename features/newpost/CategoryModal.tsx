import {MaterialCommunityIcons} from '@expo/vector-icons';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface CategoryModalProps {
  visible: boolean;
  onClose: () => void;
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const CATEGORIES = [
  {
    id: 'van-build',
    name: 'Van Build',
    icon: 'hammer-wrench',
    color: '#F59E0B',
    description: 'Build progress, DIY projects, renovations'
  },
  {
    id: 'travel',
    name: 'Travel & Adventures',
    icon: 'compass',
    color: '#10B981',
    description: 'Road trips, destinations, travel tips'
  },
  {
    id: 'campsite',
    name: 'Campsites & Spots',
    icon: 'pine-tree',
    color: '#4A7C59',
    description: 'Camping locations, boondocking spots, reviews'
  },
  {
    id: 'gear-review',
    name: 'Gear & Reviews',
    icon: 'star',
    color: '#8B5CF6',
    description: 'Product reviews, recommendations, comparisons'
  },
  {
    id: 'tips',
    name: 'Tips & Advice',
    icon: 'lightbulb',
    color: '#3B82F6',
    description: 'Van life hacks, how-tos, lessons learned'
  },
  {
    id: 'meetup',
    name: 'Meetups & Events',
    icon: 'account-group',
    color: '#EC4899',
    description: 'Community gatherings, caravan plans, events'
  },
  {
    id: 'question',
    name: 'Questions & Help',
    icon: 'help-circle',
    color: '#F97316',
    description: 'Ask the community for advice or help'
  },
  {
    id: 'maintenance',
    name: 'Maintenance & Repairs',
    icon: 'wrench',
    color: '#6B7280',
    description: 'Vehicle maintenance, repairs, troubleshooting'
  },
  {
    id: 'remote-work',
    name: 'Remote Work',
    icon: 'laptop',
    color: '#0EA5E9',
    description: 'Working on the road, internet solutions, co-working'
  },
  {
    id: 'pets',
    name: 'Pets & Van Life',
    icon: 'paw',
    color: '#A855F7',
    description: 'Traveling with pets, pet-friendly spots'
  },
  {
    id: 'cooking',
    name: 'Van Cooking',
    icon: 'pot-steam',
    color: '#EF4444',
    description: 'Recipes, meal prep, kitchen setups'
  },
  {
    id: 'solar-power',
    name: 'Solar & Power',
    icon: 'solar-power',
    color: '#FBBF24',
    description: 'Solar setups, electrical systems, off-grid power'
  },
  {
    id: 'budget',
    name: 'Budget & Finance',
    icon: 'cash',
    color: '#22C55E',
    description: 'Cost breakdowns, budgeting, income on the road'
  },
  {
    id: 'lifestyle',
    name: 'Van Life Lifestyle',
    icon: 'heart',
    color: '#F43F5E',
    description: 'Daily life, mindset, relationships on the road'
  },
  {
    id: 'for-sale',
    name: 'For Sale / Trade',
    icon: 'tag',
    color: '#14B8A6',
    description: 'Selling gear, van parts, or your build'
  }
];

export default function CategoryModal({
  visible,
  onClose,
  selectedCategory,
  onSelectCategory
}: CategoryModalProps) {
  const handleSelect = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      onSelectCategory(null); // Deselect
    } else {
      onSelectCategory(categoryId);
    }
    onClose();
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
          <Text style={styles.title}>Select Category</Text>
          <View style={{width: 24}} />
        </View>

        <Text style={styles.subtitle}>
          Choose a category to help others find your post
        </Text>

        {/* Clear Selection */}
        {selectedCategory && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => {
              onSelectCategory(null);
              onClose();
            }}
          >
            <MaterialCommunityIcons
              name="close-circle"
              size={18}
              color="#6B7280"
            />
            <Text style={styles.clearBtnText}>Clear Selection</Text>
          </TouchableOpacity>
        )}

        {/* Categories List */}
        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {CATEGORIES.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryItem,
                selectedCategory === category.id && styles.categoryItemSelected
              ]}
              onPress={() => handleSelect(category.id)}
            >
              <View
                style={[
                  styles.iconContainer,
                  {backgroundColor: category.color + '20'}
                ]}
              >
                <MaterialCommunityIcons
                  name={category.icon as any}
                  size={24}
                  color={category.color}
                />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryDescription}>
                  {category.description}
                </Text>
              </View>
              {selectedCategory === category.id && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={24}
                  color="#4A7C59"
                />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
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
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 6
  },
  clearBtnText: {
    fontSize: 14,
    color: '#6B7280'
  },
  list: {
    flex: 1
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: 'transparent'
  },
  categoryItemSelected: {
    backgroundColor: '#F0FDF4',
    borderColor: '#4A7C59'
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  categoryInfo: {
    flex: 1
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2
  },
  categoryDescription: {
    fontSize: 13,
    color: '#6B7280'
  }
});
