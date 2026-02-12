import {styles} from "@/components/auth/login/style";
import {supabase} from "@/services/supabase";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import React, {useState} from "react";
import {
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {Button} from "../../components/Button";
import {InputField} from "../../components/InputField";
import {showToast} from "../../components/Toast";
import {authService} from "../../services/auth.service";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({email: "", password: ""});

  const validateForm = () => {
    let isValid = true;
    const newErrors = {email: "", password: ""};

    if (!email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
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
      showToast("success", "Success", "Login successful");

      // Check if user has a profile
      try {
        const {
          data: {user},
        } = await supabase.auth.getUser();

        if (user) {
          const {data} = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (data) {
            router.replace("/(app)/dashboard");
          } else {
            router.replace("/(profile)/step-1");
          }
        } else {
          router.replace("/(profile)/step-1");
        }
      } catch (error) {
        console.error("Error checking profile:", error);
        router.replace("/(profile)/step-1");
      }
    } else {
      if (result.error?.includes("Invalid login credentials")) {
        showToast("error", "Error", "Invalid email or password");
      } else if (result.error?.includes("not found")) {
        showToast("error", "Account Not Found", "Please sign up first");
        router.push("/(auth)/signup");
      } else {
        showToast("error", "Login Failed", result.error);
      }
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    showToast("info", "Coming Soon", "Google login is being configured");
    setLoading(false);
  };

  const handleAzureLogin = async () => {
    setLoading(true);
    showToast("info", "Coming Soon", "Azure login is being configured");
    setLoading(false);
  };

  const handleForgotPassword = () => {
    showToast("info", "Coming Soon", "Password reset is being configured");
  };

  return (
    <View style={styles.screen}>
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1000&auto=format&fit=crop",
        }}
        style={styles.topBackground}
      >
        <View style={styles.topOverlay} />
        <View style={styles.headerRow}>
          <Image
            source={require("../../assets/images/vanora-logo-only.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.appName}>anora</Text>
        </View>
      </ImageBackground>

      <View style={styles.cardContainer}>
        <View style={styles.pullBar} />
        <Text style={styles.cardTitle}>Welcome Back</Text>
        <Text style={styles.cardSubtitle}>Log in to continue your journey</Text>

        <View style={styles.inputsWrap}>
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

          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgot}>Forgot Password?</Text>
          </TouchableOpacity>

          <View style={styles.loginButtonWrap}>
            <Button
              title="Log In"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
            />
          </View>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>OR LOGIN WITH</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.socialRow}>
          <TouchableOpacity
            style={styles.socialBtn}
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <MaterialCommunityIcons name="google" size={18} color="#EA4335" />
            <Text style={styles.socialText}>Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialBtn}
            onPress={handleAzureLogin}
            disabled={loading}
          >
            <MaterialCommunityIcons name="apple" size={18} color="#000" />
            <Text style={styles.socialText}>Apple</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.signupRow}>
          <Text style={styles.newText}>New to Vanora? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
