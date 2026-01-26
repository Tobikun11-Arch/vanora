import {StyleSheet} from 'react-native';

import GetStartedScreen from '../(auth)/get-started';
import {ThemedView} from '@/components/themed-view';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <GetStartedScreen />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
