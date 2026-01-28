import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { loginUser } from "../src/services/api";
import { getDeviceId } from "@/src/utils/device";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const deviceId = await getDeviceId();
      const response = await loginUser({ email, password, deviceId });

      if (response?.token && response?.user?.role) {
        Alert.alert("Success", "Login successful");

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const location = await Location.getCurrentPositionAsync({});
          await AsyncStorage.setItem(
            "loginLocation",
            JSON.stringify({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }),
          );
        }

        // 🔐 Role-based dashboard routing
        if (response.user.role === "ADMIN") {
          router.replace("/dashboard/admin");
        } else {
          router.replace("/dashboard/user");
        }
      } else {
        Alert.alert("Error", response.message || "Login failed");
      }
    } catch (error: any) {
      console.log("LOGIN ERROR:", error);
      Alert.alert("Login Error", error?.message || "Server error");
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Forgot Password",
      "Please contact IT support to reset your password.",
    );
  };

  const handleITSupport = () => {
    Alert.alert("IT Support", "Please contact IT support for help.");
  };

  return (
    <View style={styles.container}>
      {/* Welcome Text */}
      <Text style={styles.welcome}>
        Welcome to the Airports Authority of India Survey Portal
      </Text>

      {/* Logo */}
      <Image source={require("../assets/images/aai.png")} style={styles.logo} />

      {/* Instruction */}
      <Text style={styles.instruction}>Enter your credentials to continue</Text>

      {/* Email */}
      <TextInput
        placeholder="Enter your email"
        placeholderTextColor="#888"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password */}
      <TextInput
        placeholder="Enter your password"
        placeholderTextColor="#888"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Forgot Password */}
      <Pressable onPress={handleForgotPassword}>
        <Text style={styles.forgot}>Forgot Password?</Text>
      </Pressable>

      {/* Sign-In Button */}
      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign In</Text>
      </Pressable>

      {/* OR */}
      <Text style={styles.or}>OR</Text>

      {/* IT Support */}
      <Pressable onPress={handleITSupport}>
        <Text style={styles.itSupport}>Need help? Contact IT Support</Text>
      </Pressable>

      {/* Privacy & Terms */}
      <Text style={styles.privacy}>
        <Text style={styles.linkText}>Privacy Policy</Text> .{" "}
        <Text style={styles.linkText}>Terms of Service</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#E0F2FF",
  },
  welcome: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    resizeMode: "contain",
  },
  instruction: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
    color: "#333",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  forgot: {
    alignSelf: "flex-end",
    marginBottom: 15,
    color: "#007AFF",
    fontWeight: "500",
  },
  button: {
    width: "100%",
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  or: {
    marginVertical: 10,
    fontWeight: "bold",
    color: "#555",
  },
  itSupport: {
    color: "#007AFF",
    fontWeight: "500",
    marginBottom: 15,
    textAlign: "center",
  },
  privacy: {
    fontSize: 12,
    color: "#555",
    textAlign: "center",
    marginTop: 20,
  },
  linkText: {
    color: "#007AFF",
    textDecorationLine: "underline",
  },
});
