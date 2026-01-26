import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useRouter} from 'expo-router';
import {useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {Button} from '../../components/Button';
import {InputField} from '../../components/InputField';
import {showToast} from '../../components/Toast';
import {authService} from '../../services/auth.service';

export default function SignupScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {fullName: '', email: '', password: ''};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
      isValid = false;
    }

    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const result = await authService.signUp(email, password, fullName);

    if (result.success) {
      showToast('success', 'Success', 'Account created successfully');
      router.replace('/(profile)/step-1');
    } else {
      if (result.error?.includes('already registered')) {
        showToast('error', 'Error', 'Email already registered. Please login.');
        router.push('/(auth)/login');
      } else {
        showToast('error', 'Signup Failed', result.error);
      }
    }

    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    // TODO: Implement Google OAuth signup flow
    showToast('info', 'Coming Soon', 'Google signup is being configured');
    setLoading(false);
  };

  const handleAzureSignup = async () => {
    setLoading(true);
    // TODO: Implement Azure OAuth signup flow
    showToast('info', 'Coming Soon', 'Azure signup is being configured');
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#4a90e2" />
        </TouchableOpacity>
        <Text style={styles.title}>Create Account</Text>
      </View>

      <View style={styles.form}>
        <InputField
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
          leftIcon="account-outline"
          error={errors.fullName}
        />

        <InputField
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          leftIcon="email-outline"
          keyboardType="email-address"
          error={errors.email}
        />

        <InputField
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          leftIcon="lock-outline"
          rightIcon="eye"
          error={errors.password}
        />

        <Button
          title="Sign Up"
          onPress={handleSignup}
          loading={loading}
          disabled={loading}
        />
      </View>

      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>Or sign up with</Text>
        <View style={styles.line} />
      </View>

      <View style={styles.oauthContainer}>
        <TouchableOpacity
          style={styles.oauthButton}
          onPress={handleGoogleSignup}
          disabled={loading}
        >
          <MaterialCommunityIcons name="google" size={24} color="#EA4335" />
          <Text style={styles.oauthText}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.oauthButton}
          onPress={handleAzureSignup}
          disabled={loading}
        >
          <MaterialCommunityIcons name="microsoft" size={24} color="#0078D4" />
          <Text style={styles.oauthText}>Azure</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.loginLink}>Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginRight: 24
  },
  form: {
    marginBottom: 24
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd'
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#999',
    fontSize: 12
  },
  oauthContainer: {
    flexDirection: 'row',
    gap: 12
  },
  oauthButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8
  },
  oauthText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 40
  },
  footerText: {
    color: '#666',
    fontSize: 14
  },
  loginLink: {
    color: '#4a90e2',
    fontSize: 14,
    fontWeight: '600'
  }
});
