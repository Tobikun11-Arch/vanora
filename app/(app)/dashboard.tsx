import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useRouter} from 'expo-router';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {showToast} from '../../components/Toast';
import {authService} from '../../services/auth.service';

export default function DashboardScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    const result = await authService.signOut();
    if (result.success) {
      showToast('success', 'Success', 'Logged out successfully');
      router.replace('/(auth)/get-started');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <TouchableOpacity onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={24} color="#4a90e2" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.welcomeText}>Welcome to Vandora</Text>
        <Text style={styles.description}>
          Your profile is set up. More features coming soon!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333'
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  }
});
