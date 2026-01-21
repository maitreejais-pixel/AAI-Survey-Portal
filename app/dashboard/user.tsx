import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { db, initDB } from "@/src/db/database";
import { submitSurvey } from "@/src/services/api";

/* ================= AIRPORT DATA ================= */
const AIRPORTS = [
  {
    name: "Ahmedabad – Sardar Vallabhbhai Patel International Airport",
    code: "AMD",
  },
  {
    name: "Amritsar – Sri Guru Ram Dass Jee International Airport",
    code: "ATQ",
  },
  { name: "Bengaluru – Kempegowda International Airport", code: "BLR" },
  { name: "Bhopal – Raja Bhoj Airport", code: "BHO" },
  { name: "Bhubaneswar – Biju Patnaik International Airport", code: "BBI" },
  { name: "Chandigarh International Airport", code: "IXC" },
  { name: "Chennai International Airport", code: "MAA" },
  { name: "Cochin International Airport", code: "COK" },
  { name: "Coimbatore International Airport", code: "CJB" },
  { name: "Delhi – Indira Gandhi International Airport", code: "DEL" },
  { name: "Goa – Dabolim Airport", code: "GOI" },
  {
    name: "Guwahati – Lokpriya Gopinath Bordoloi International Airport",
    code: "GAU",
  },
  { name: "Hyderabad – Rajiv Gandhi International Airport", code: "HYD" },
  { name: "Jaipur International Airport", code: "JAI" },
  {
    name: "Kolkata – Netaji Subhas Chandra Bose International Airport",
    code: "CCU",
  },
  {
    name: "Lucknow – Chaudhary Charan Singh International Airport",
    code: "LKO",
  },
  {
    name: "Mumbai – Chhatrapati Shivaji Maharaj International Airport",
    code: "BOM",
  },
  {
    name: "Nagpur – Dr. Babasaheb Ambedkar International Airport",
    code: "NAG",
  },
  { name: "Patna – Jay Prakash Narayan Airport", code: "PAT" },
  { name: "Pune International Airport", code: "PNQ" },
  { name: "Raipur – Swami Vivekananda Airport", code: "RPR" },
  { name: "Ranchi – Birsa Munda Airport", code: "IXR" },
  { name: "Srinagar International Airport", code: "SXR" },
  { name: "Thiruvananthapuram International Airport", code: "TRV" },
  { name: "Tiruchirappalli International Airport", code: "TRZ" },
  { name: "Udaipur – Maharana Pratap Airport", code: "UDR" },
  { name: "Varanasi – Lal Bahadur Shastri International Airport", code: "VNS" },
  { name: "Vijayawada International Airport", code: "VGA" },
  { name: "Visakhapatnam International Airport", code: "VTZ" },
].sort((a, b) => a.name.localeCompare(b.name));

/* ================= COMPONENT ================= */
export default function UserDashboard() {
  const router = useRouter();

  /* ===== STATE ===== */
  const [airportName, setAirportName] = useState("");
  const [airportCode, setAirportCode] = useState("");
  const [destination, setDestination] = useState("");

  const [showDestinationList, setShowDestinationList] = useState(false);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [tripReason, setTripReason] = useState("");
  const [travelClass, setTravelClass] = useState("");
  const [returnTrips, setReturnTrips] = useState("");
  const [ratings, setRatings] = useState<{ [key: string]: string }>({});
  const [additionalFeedback, setAdditionalFeedback] = useState("");
  const [cooldownLeft, setCooldownLeft] = useState(0); // seconds
  const COOLDOWN_TIME = 120; // 2 minutes

  useEffect(() => {
    initDB()
      .then(() => console.log("SQLite DB initialized"))
      .catch((err) => console.error("DB init failed", err));
  }, []);

  useEffect(() => {
    const checkCooldown = async () => {
      const lastSubmit = await AsyncStorage.getItem("lastSubmitTime");

      if (lastSubmit) {
        const now = Date.now();
        const diff = Math.floor((now - Number(lastSubmit)) / 1000);

        if (diff < COOLDOWN_TIME) {
          setCooldownLeft(COOLDOWN_TIME - diff);
        }
      }
    };

    checkCooldown();
  }, []);

  useEffect(() => {
    if (cooldownLeft <= 0) return;

    const interval = setInterval(() => {
      setCooldownLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownLeft]);

  useEffect(() => {
    (async () => {
      const code = await AsyncStorage.getItem("airportCode");
      const name = await AsyncStorage.getItem("airportName");
      if (code) setAirportCode(code);
      if (name) setAirportName(name);
    })();
  }, []);

  /* ===== QUESTIONS & RATING OPTIONS ===== */
  const questions = [
    "Experience at parking facility",
    "Experience at check-in",
    "Cleanliness of washrooms",
    "Experience at security check",
    "Were F&B and retail facilities as per expectation?",
    "Experience at boarding gate",
  ];

  const ratingOptions = [
    { label: "Excellent", emoji: "😄" },
    { label: "Very Good", emoji: "🙂" },
    { label: "Good", emoji: "😐" },
    { label: "Fair", emoji: "😕" },
    { label: "Poor", emoji: "😠" },
  ];

  /* ===== AUTO DATE & TIME ===== */
  useEffect(() => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yyyy = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    setDate(`${dd}-${mm}-${yyyy}`);
    setTime(`${hh}:${min}`);
  }, []);

  const saveOffline = async (payload: any) => {
    await db.runAsync("INSERT INTO submissions (data, synced) VALUES (?, ?)", [
      JSON.stringify(payload),
      0,
    ]);
  };

  const checkSQLiteData = async () => {
    const rows = await db.getAllAsync(
      "SELECT id, synced, data FROM submissions",
    );
    console.log("📦 SQLITE DATA:", rows);
  };

  type SubmissionRow = {
    id: number;
    data: string;
    synced: number;
  };

  const syncOfflineData = useCallback(async () => {
    try {
      const rows = await db.getAllAsync<SubmissionRow>(
        "SELECT * FROM submissions WHERE synced = 0",
      );

      if (rows.length === 0) return;

      for (const row of rows) {
        const payload = JSON.parse(row.data);
        await submitSurvey(payload);

        await db.runAsync("UPDATE submissions SET synced = 1 WHERE id = ?", [
          row.id,
        ]);
      }
    } catch (error) {
      console.error("Offline sync failed:", error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable) {
        syncOfflineData();
      }
    });

    return () => unsubscribe();
  }, [syncOfflineData]);

  /* ===== HANDLE SUBMIT ===== */
  const handleSubmit = async () => {
    if (cooldownLeft > 0) return; // prevent multiple submits during cooldown

    // Save submit time in AsyncStorage
    const submittedAt = new Date().toISOString();
    await AsyncStorage.setItem("lastSubmitTime", Date.now().toString());

    const payload = {
      airportName,
      airportCode,
      destination,
      tripReason,
      travelClass,
      returnTrips,
      ratings,
      additionalFeedback,
      submittedAt,
    };

    // log all values so they are "used" and avoid ESLint warnings
    console.log("Form submitted at:", submittedAt);
    console.log("Airport Name:", airportName);
    console.log("Airport Code:", airportCode);
    console.log("Destination:", destination);
    console.log("Trip Reason:", tripReason);
    console.log("Travel Class:", travelClass);
    console.log("Return Trips:", returnTrips);
    console.log("Ratings:", ratings);
    console.log("Additional Feedback:", additionalFeedback);

    const netState = await NetInfo.fetch();

    if (!netState.isConnected) {
      // 🔴 OFFLINE → save to SQLite
      await saveOffline(payload);
      await checkSQLiteData();
    } else {
      // 🟢 ONLINE → send to backend
      await submitSurvey(payload);
    }

    setCooldownLeft(COOLDOWN_TIME);

    router.replace({
      pathname: "/thankyou",
      params: { submittedAt },
    });
  };

  /* ================= RENDER ================= */
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Airports Authority of India</Text>
        <Text style={styles.subTitle}>Customer Satisfaction Survey</Text>
      </View>

      {/* Airport Selection */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Airport Details</Text>

        <TextInput
          style={styles.input}
          value={airportCode}
          editable={false}
          placeholder="Airport Code"
        />

        <TextInput
          style={styles.input}
          value={airportName}
          editable={false}
          placeholder="Airport Name"
        />
      </View>

      {/* Travel Details */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Travel Details</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.flightInputText]}
            placeholder="Flight Number"
            placeholderTextColor="#888"
          />
          <TextInput style={styles.input} value={date} editable={false} />
        </View>
        <View style={styles.row}>
          <TextInput style={styles.input} value={time} editable={false} />
          {/* Destination Selection */}
          <Pressable
            style={styles.input}
            onPress={() => setShowDestinationList(!showDestinationList)}
          >
            <Text style={styles.airportText}>
              {destination || "Destination"}
            </Text>
          </Pressable>
        </View>
        {showDestinationList &&
          AIRPORTS.map((airport) => (
            <Pressable
              key={airport.code}
              style={styles.listItem}
              onPress={() => {
                setDestination(airport.name);
                setShowDestinationList(false);
              }}
            >
              <Text style={styles.airportListText}>{airport.name}</Text>
            </Pressable>
          ))}
      </View>

      {/* Trip Reason */}
      <Text style={styles.sectionTitle}>Main reason for this air trip</Text>
      <View style={styles.optionRow}>
        {["Business", "Leisure", "Other"].map((item) => (
          <Pressable
            key={item}
            style={[
              styles.option,
              tripReason === item && styles.optionSelected,
            ]}
            onPress={() => setTripReason(item)}
          >
            <Text>{item}</Text>
          </Pressable>
        ))}
      </View>

      {/* Travel Class */}
      <Text style={styles.sectionTitle}>Aircraft Section</Text>
      <View style={styles.optionRow}>
        {["First Class", "Business", "Economy", "Tourist"].map((item) => (
          <Pressable
            key={item}
            style={[
              styles.option,
              travelClass === item && styles.optionSelected,
            ]}
            onPress={() => setTravelClass(item)}
          >
            <Text>{item}</Text>
          </Pressable>
        ))}
      </View>

      {/* Return Trips */}
      <Text style={styles.sectionTitle}>Return trips in last 12 months</Text>
      <View style={styles.optionRow}>
        {["1–2", "3–5", "6–10", "11–20", "21+"].map((item) => (
          <Pressable
            key={item}
            style={[
              styles.option,
              returnTrips === item && styles.optionSelected,
            ]}
            onPress={() => setReturnTrips(item)}
          >
            <Text>{item}</Text>
          </Pressable>
        ))}
      </View>

      {/* Ratings */}
      {questions.map((question) => (
        <View key={question} style={styles.questionBlock}>
          <Text style={styles.questionText}>{question}</Text>
          <View style={styles.ratingRow}>
            {ratingOptions.map((item) => (
              <Pressable
                key={item.label}
                style={[
                  styles.ratingOption,
                  ratings[question] === item.label && styles.ratingSelected,
                ]}
                onPress={() =>
                  setRatings({ ...ratings, [question]: item.label })
                }
              >
                <Text>{item.emoji}</Text>
                <Text>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}

      {/* Additional Feedback */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Additional Feedback</Text>
        <TextInput
          style={styles.feedbackInput}
          multiline
          value={additionalFeedback}
          onChangeText={setAdditionalFeedback}
          placeholder="Please share your experience, suggestions, or any concerns..."
          placeholderTextColor="#999"
        />
      </View>

      {cooldownLeft > 0 && (
        <Text style={{ color: "#D32F2F", fontWeight: "600", marginBottom: 10 }}>
          Please wait {Math.floor(cooldownLeft / 60)}:
          {(cooldownLeft % 60).toString().padStart(2, "0")} before submitting
          again
        </Text>
      )}

      {/* Submit */}
      <Pressable
        style={[
          styles.submitButton,
          cooldownLeft > 0 && { backgroundColor: "#999" },
        ]}
        onPress={handleSubmit}
        disabled={cooldownLeft > 0}
      >
        <Text style={styles.submitText}>SUBMIT FEEDBACK</Text>
      </Pressable>
    </ScrollView>
  );
}
/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { backgroundColor: "#F4F7FB", padding: 15 },
  header: { alignItems: "center", marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  subTitle: { fontSize: 14, color: "#555" },
  card: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  sectionTitle: { fontWeight: "bold", marginVertical: 10 },
  row: { flexDirection: "row", gap: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#FFF",
    marginBottom: 10,
    color: "#555",
  },
  airportText: { color: "#999", fontWeight: "400" },
  airportListText: { color: "#222", fontWeight: "500" },
  flightInputText: { color: "#222" },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#FFF",
  },
  optionRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  option: {
    borderWidth: 1,
    borderColor: "#999",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#FFF",
  },
  optionSelected: { borderColor: "#007AFF" },
  questionBlock: { marginBottom: 15 },
  questionText: { fontWeight: "600", marginBottom: 8 },
  ratingRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  ratingOption: {
    borderWidth: 1,
    borderColor: "#999",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    width: 80,
    backgroundColor: "#FFF",
  },
  ratingSelected: { borderColor: "#007AFF" },
  feedbackInput: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
    padding: 12,
    height: 100,
    color: "#000",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 10,
    marginTop: 30,
    alignItems: "center",
  },
  submitText: { color: "#FFF", fontWeight: "bold" },
});
