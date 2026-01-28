import { supabase } from "@/services/supabase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button } from "../../components/Button";
import { InputField } from "../../components/InputField";
import { showToast } from "../../components/Toast";
import { authService } from "../../services/auth.service";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: "", password: "" };

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
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data } = await supabase
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
    // TODO: Implement Google OAuth with proper session handling
    showToast("info", "Coming Soon", "Google login is being configured");
    setLoading(false);
  };

  const handleAzureLogin = async () => {
    setLoading(true);
    // TODO: Implement Azure OAuth with proper session handling
    showToast("info", "Coming Soon", "Azure login is being configured");
    setLoading(false);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.topBackground}>
        <Text style={styles.appName}>Vanora</Text>
        <Text style={styles.appSubtitle}>Connect. Roam. Belong.</Text>
      </View>

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

          <TouchableOpacity onPress={() => router.push("/(auth)/forgot")}>
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
            <Text style={styles.signupLink}>SignUp</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topBackground: {
    backgroundColor: "#2e7d64",
    paddingTop: 50,
    paddingBottom: 70,
    alignItems: "center",
  },
  appName: {
    fontSize: 34,
    fontWeight: "800",
    color: "#fff",
  },
  appSubtitle: {
    color: "rgba(255,255,255,0.9)",
    marginTop: 6,
  },
  cardContainer: {
    backgroundColor: "#fff",
    borderRadius: 28,
    paddingVertical: 30,
    paddingHorizontal: 24,
    marginTop: -20,
    elevation: 6,
    alignItems: "stretch",
  },
  pullBar: {
    width: 48,
    height: 6,
    borderRadius: 4,
    backgroundColor: "#ececec",
    alignSelf: "center",
    marginBottom: 18,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 2,
    marginBottom: 4,
  },
  cardSubtitle: {
    textAlign: "center",
    color: "#777",
    marginBottom: 18,
  },
  inputsWrap: {
    marginTop: 12,
    width: "100%",
  },

  socialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  socialText: {
    marginLeft: 8,
    fontWeight: "600",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#eee",
  },
  dividerText: {
    marginHorizontal: 12,
    color: "#999",
    fontSize: 12,
  },
  loginButtonWrap: {
    marginTop: 16,
  },
  forgot: {
    textAlign: "right",
    color: "#2e7d64",
    marginTop: 6,
    marginBottom: 6,
    fontWeight: "600",
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    paddingBottom: 12,
  },
  newText: {
    color: "#777",
  },
  signupLink: {
    color: "#2e7d64",
    fontWeight: "700",
    marginLeft: 6,
  },
});
