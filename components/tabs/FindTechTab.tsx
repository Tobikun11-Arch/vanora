import {StyleSheet, Text, View} from 'react-native';

export default function FindTechTab() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Find Tech</Text>
      <Text style={styles.subtitle}>Discover tech tools and resources</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  }
});
