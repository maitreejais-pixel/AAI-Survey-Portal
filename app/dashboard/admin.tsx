import { View, Text, StyleSheet, ScrollView, FlatList } from "react-native";

const mockStats = {
  total: 128,
  positive: 82,
  neutral: 26,
  negative: 20,
};

const feedbacks = [
  {
    id: "1",
    airport: "DEL",
    washroom: "Poor",
    security: "Fair",
    boarding: "Good",
    overall: "Negative",
    comment: "Washrooms were very unclean near Gate 23.",
  },
  {
    id: "2",
    airport: "BOM",
    washroom: "Excellent",
    security: "Very Good",
    boarding: "Excellent",
    overall: "Positive",
    comment: "Very smooth experience and helpful staff.",
  },
];

export default function AdminDashboard() {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>AAI Admin Dashboard</Text>
      <Text style={styles.subTitle}>Customer Feedback & Analytics</Text>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <StatCard label="Total Feedbacks" value={mockStats.total} />
        <StatCard label="Positive" value={mockStats.positive} />
        <StatCard label="Neutral" value={mockStats.neutral} />
        <StatCard label="Negative" value={mockStats.negative} />
      </View>

      {/* Insights */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Key Insights</Text>
        <Text>• Most Complaints: Washrooms</Text>
        <Text>• Best Rated Airport: BOM</Text>
        <Text>• Most Complaints From: DEL</Text>
        <Text>• Peak Feedback Time: Morning Hours</Text>
      </View>

      {/* Feedback List */}
      <Text style={styles.sectionTitle}>User Feedbacks</Text>

      <FlatList
        data={feedbacks}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View
            style={[
              styles.feedbackCard,
              item.overall === "Negative" && styles.negativeCard,
            ]}
          >
            <Text style={styles.feedbackTitle}>Airport: {item.airport}</Text>
            <Text>Washrooms: {item.washroom}</Text>
            <Text>Security: {item.security}</Text>
            <Text>Boarding: {item.boarding}</Text>
            <Text style={styles.comment}>{item.comment}</Text>
          </View>
        )}
      />
    </ScrollView>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F4F7FB",
    padding: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  subTitle: {
    textAlign: "center",
    color: "#555",
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007AFF",
  },
  statLabel: {
    fontSize: 12,
    color: "#555",
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 10,
    fontSize: 16,
  },
  feedbackCard: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
  },
  negativeCard: {
    borderLeftWidth: 5,
    borderLeftColor: "#FF3B30",
  },
  feedbackTitle: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  comment: {
    marginTop: 8,
    fontStyle: "italic",
    color: "#444",
  },
});
