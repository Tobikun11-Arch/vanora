import {supabase} from '@/services/supabase';
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

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({email: '', password: ''});

  const validateForm = () => {
    let isValid = true;
    const newErrors = {email: '', password: ''};

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

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const result = await authService.signIn(email, password);

    if (result.success) {
      showToast('success', 'Success', 'Login successful');

      // Check if user has a profile
      try {
        const {
          data: {user}
        } = await supabase.auth.getUser();

        if (user) {
          const {data} = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (data) {
            router.replace('/(app)/dashboard');
          } else {
            router.replace('/(profile)/step-1');
          }
        } else {
          router.replace('/(profile)/step-1');
        }
      } catch (error) {
        console.error('Error checking profile:', error);
        router.replace('/(profile)/step-1');
      }
    } else {
      if (result.error?.includes('Invalid login credentials')) {
        showToast('error', 'Error', 'Invalid email or password');
      } else if (result.error?.includes('not found')) {
        showToast('error', 'Account Not Found', 'Please sign up first');
        router.push('/(auth)/signup');
      } else {
        showToast('error', 'Login Failed', result.error);
      }
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    // TODO: Implement Google OAuth with proper session handling
    showToast('info', 'Coming Soon', 'Google login is being configured');
    setLoading(false);
  };

  const handleAzureLogin = async () => {
    setLoading(true);
    // TODO: Implement Azure OAuth with proper session handling
    showToast('info', 'Coming Soon', 'Azure login is being configured');
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appName}>Vanora</Text>
        <Text style={styles.welcomeText}>Welcome back</Text>
      </View>

      <View style={styles.form}>
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
          title="Login"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
        />
      </View>

      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>Or login with</Text>
        <View style={styles.line} />
      </View>

      <View style={styles.oauthContainer}>
        <TouchableOpacity
          style={styles.oauthButton}
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          <MaterialCommunityIcons name="google" size={24} color="#EA4335" />
          <Text style={styles.oauthText}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.oauthButton}
          onPress={handleAzureLogin}
          disabled={loading}
        >
          <MaterialCommunityIcons name="microsoft" size={24} color="#0078D4" />
          <Text style={styles.oauthText}>Azure</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don&apos;t have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
          <Text style={styles.signupLink}>Sign up</Text>
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
    marginTop: 60,
    marginBottom: 40,
    alignItems: 'center'
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4a90e2',
    marginBottom: 8
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333'
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
  signupLink: {
    color: '#4a90e2',
    fontSize: 14,
    fontWeight: '600'
  }
});
