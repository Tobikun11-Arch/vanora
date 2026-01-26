import {useRouter} from 'expo-router';
import {StyleSheet, Text, View} from 'react-native';
import {Button} from '../../components/Button';

export default function GetStartedScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.appName}>Vandora</Text>
        <Text style={styles.subtitle}>
          Community for Nomads, Van Lifers & Travelers
        </Text>
        <Text style={styles.description}>
          Connect with fellow nomads, share adventures, find support, and build
          your van life community.
        </Text>
      </View>

      <Button
        title="Get Started"
        onPress={() => router.push('/(auth)/login')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 40
  },
  content: {
    alignItems: 'center',
    marginTop: 60
  },
  appName: {
    fontSize: 44,
    fontWeight: 'bold',
    color: '#4a90e2',
    marginBottom: 16
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center'
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20
  }
});
