import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function ThankYouScreen() {
  const router = useRouter();
  const { submittedAt } = useLocalSearchParams();

  const dateObj = submittedAt ? new Date(String(submittedAt)) : null;

  const formattedTime = dateObj
    ? dateObj.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "";

  const formattedDate = dateObj
    ? dateObj.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🙏</Text>
      <Text style={styles.title}>Thank You!</Text>
      <Text style={styles.message}>
        Your feedback has been successfully submitted. It helps us improve
        airport services across India.
      </Text>

      {submittedAt && (
        <Text style={styles.submittedTime}>
          Feedback submitted at {formattedTime}, {formattedDate}
        </Text>
      )}

      <Pressable style={styles.button} onPress={() => router.replace("/login")}>
        <Text style={styles.buttonText}>Back to Login</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E0F2FF",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emoji: {
    fontSize: 50,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  message: {
    textAlign: "center",
    fontSize: 16,
    color: "#333",
    marginBottom: 30,
  },
  submittedTime: {
    textAlign: "center",
    fontSize: 14,
    color: "#D32F2F",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 10,
    width: "70%",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});
