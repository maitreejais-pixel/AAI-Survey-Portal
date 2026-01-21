import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

// Haversine formula (distance in KM)
const getDistanceInKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const R = 6371; // Earth radius (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function DashboardLayout() {
  const router = useRouter();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const startGeofencing = async () => {
      const saved = await AsyncStorage.getItem("loginLocation");
      if (!saved) return;

      const { latitude: loginLat, longitude: loginLon } = JSON.parse(saved);

      interval = setInterval(async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") return;

          const current = await Location.getCurrentPositionAsync({});
          const distance = getDistanceInKm(
            loginLat,
            loginLon,
            current.coords.latitude,
            current.coords.longitude,
          );

          if (distance > 2) {
            clearInterval(interval);

            await AsyncStorage.multiRemove(["loginLocation", "token", "user"]);

            Alert.alert(
              "Session Ended",
              "You have moved outside the 2 km allowed area.",
              [
                {
                  text: "OK",
                  onPress: () => router.replace("/login"),
                },
              ],
            );
          }
        } catch (error) {
          console.log("Geofencing error:", error);
        }
      }, 3000); // every 3 seconds
    };

    startGeofencing();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [router]);

  return <Stack screenOptions={{ headerShown: true }} />;
}
