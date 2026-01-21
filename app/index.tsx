import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import { useEffect, useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import * as Location from "expo-location";
import { useRouter, Link } from "expo-router";
import { registerUser } from "../src/services/api";
import { airports } from "../src/data/airports";
import AsyncStorage from "@react-native-async-storage/async-storage";
/* ================= HELPERS ================= */
const getDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/* ================= COMPONENT ================= */
export default function RegisterScreen() {
  const router = useRouter();
  const [locationCaptured, setLocationCaptured] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [employeeIDLabel, setEmployeeIDLabel] = useState("");

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [airportCode, setAirportCode] = useState("");

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status === "granted") {
      await Location.getCurrentPositionAsync({});
      setLocationCaptured(true);
    }
  };
  /* ================= GET LOCATION & NEAREST AIRPORT ================= */
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location access is required");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const lat = location.coords.latitude;
      const lon = location.coords.longitude;

      setLatitude(lat);
      setLongitude(lon);
      setLocationCaptured(true);

      // Find nearest airport
      let nearest = airports[0];
      let shortest = getDistance(lat, lon, nearest.latitude, nearest.longitude);

      for (const airport of airports) {
        const d = getDistance(lat, lon, airport.latitude, airport.longitude);
        if (d < shortest) {
          shortest = d;
          nearest = airport;
        }
      }

      setAirportCode(nearest.code);
    })();
  }, []);

  /* ================= PHONE VERIFY ================= */
  const handleVerifyPhone = () => {
    if (phone.length !== 10) {
      Alert.alert("Error", "Please enter a valid 10-digit phone number");
      return;
    }
    setIsPhoneVerified(true);
    Alert.alert("Success", "Phone number verified");
  };

  /* ================= FILE UPLOAD ================= */
  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
      });
      if (!result.canceled) setEmployeeIDLabel("Employee ID selected");
    } catch {
      Alert.alert("Error", "File upload failed");
    }
  };

  /* ================= REGISTER ================= */
  const handleRegister = async () => {
    await getLocation();
    if (!email || !password || !phone || !airportCode) {
      Alert.alert("Error", "All required fields must be filled");
      return;
    }

    if (!isPhoneVerified) {
      Alert.alert("Error", "Please verify your phone number");
      return;
    }

    if (latitude === null || longitude === null) {
      Alert.alert("Error", "Location not captured");
      return;
    }

    try {
      const response = await registerUser({
        email,
        password,
        phone,
        role: "USER",
        airportCode,
        company,
        latitude,
        longitude,
      });

      if (response.message?.toLowerCase().includes("success")) {
        // ✅ Store airport info locally so dashboard can access it later
        await AsyncStorage.setItem("airportCode", airportCode);
        await AsyncStorage.setItem(
          "airportName",
          airports.find((a) => a.code === airportCode)?.name || "",
        );

        Alert.alert("Success", "Registered successfully", [
          { text: "OK", onPress: () => router.push("/login") },
        ]);
      } else {
        Alert.alert("Error", response.message || "Registration failed");
      }
    } catch {
      Alert.alert("Error", "Something went wrong");
    }
  };

  /* ================= UI ================= */
  return (
    <View style={styles.container}>
      {/* Welcome Text */}
      <Text style={styles.welcome}>
        Welcome to the Airports Authority of India Survey Portal
      </Text>

      {/* Logo */}
      <Image source={require("../assets/images/aai.png")} style={styles.logo} />

      {/* Instruction */}
      <Text style={styles.instruction}>
        Fill in the details to create your account
      </Text>

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
        placeholder="Create a password"
        placeholderTextColor="#888"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Phone Number with Verify */}
      <View style={styles.phoneContainer}>
        <TextInput
          placeholder="Enter your phone number"
          placeholderTextColor="#888"
          style={styles.phoneInput}
          value={phone}
          onChangeText={(text) => {
            setPhone(text);
            setIsPhoneVerified(false);
          }}
          keyboardType="phone-pad"
          maxLength={10}
        />

        <Pressable
          onPress={handleVerifyPhone}
          disabled={phone.length !== 10 || isPhoneVerified}
          style={styles.verifyButton}
        >
          <Text
            style={[
              styles.verifyText,
              phone.length === 10 && !isPhoneVerified && styles.verifyActive,
              isPhoneVerified && styles.verifiedText,
            ]}
          >
            {isPhoneVerified ? "Verified" : "Verify"}
          </Text>
        </Pressable>
      </View>

      {/* Airport Code (auto-filled, read-only) */}
      <TextInput style={styles.input} value={airportCode} editable={false} />

      {/* Company */}
      <TextInput
        placeholder="Enter your Company / Organization"
        placeholderTextColor="#888"
        style={styles.input}
        value={company}
        onChangeText={setCompany}
      />

      {/* Upload Employee ID */}
      <Pressable
        style={[
          styles.input,
          { justifyContent: "center", alignItems: "center" },
        ]}
        onPress={handleFileUpload}
      >
        <Text style={{ color: employeeIDLabel ? "#000" : "#888" }}>
          {employeeIDLabel || "Upload Employee ID (Image / PDF)"}
        </Text>
      </Pressable>

      {locationCaptured && (
        <Text style={styles.locationText}>📍 Location captured</Text>
      )}

      {/* Register Button */}
      <Pressable style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </Pressable>

      {/* OR */}
      <Text style={styles.or}>OR</Text>

      {/* IT Support */}
      <Text style={styles.itSupport}>Need help? Contact IT Support</Text>

      {/* Login Link */}
      <Link href="/login" asChild>
        <Pressable>
          <Text style={styles.link}>Already have an account? Login</Text>
        </Pressable>
      </Link>

      {/* Privacy */}
      <Text style={styles.privacy}>
        <Text style={styles.linkText}>Privacy Policy</Text> ·{" "}
        <Text style={styles.linkText}>Terms of Service</Text>
      </Text>
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#E0F2FF",
    justifyContent: "flex-start",
    paddingTop: 40,
  },
  welcome: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginBottom: 20,
    resizeMode: "contain",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  phoneContainer: { position: "relative", marginBottom: 10 },
  phoneInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    paddingRight: 70,
    backgroundColor: "#fff",
  },
  verifyButton: { position: "absolute", right: 12, top: 14 },
  verifyText: { color: "#edb4fb" },
  verifyActive: { color: "#6A0DAD", fontWeight: "600" },
  verifiedText: { color: "#4CAF50", fontWeight: "600" },
  button: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  instruction: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
    color: "#333",
  },

  or: {
    marginVertical: 12,
    textAlign: "center", // ✅ centers the text
    alignSelf: "center", // ✅ centers the Text component
    fontWeight: "600",
    color: "#555",
  },

  itSupport: {
    color: "#007AFF",
    fontWeight: "500",
    marginBottom: 15,
    textAlign: "center",
  },

  link: {
    marginBottom: 15,
    textAlign: "center",
    color: "#007AFF",
    fontWeight: "500",
  },

  privacy: {
    fontSize: 12,
    color: "#555",
    textAlign: "center",
    marginTop: 10,
  },

  linkText: {
    color: "#007AFF",
    textDecorationLine: "underline",
  },
  locationText: {
    textAlign: "center",
    color: "#4CAF50",
    marginBottom: 12,
    fontSize: 14,
  },
});
