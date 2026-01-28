import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

const DEVICE_ID_KEY = "DEVICE_ID";

export async function getDeviceId(): Promise<string> {
  // Check if device ID already exists
  const existingId = await AsyncStorage.getItem(DEVICE_ID_KEY);

  if (existingId) {
    return existingId;
  }

  // Generate new secure ID
  const random = Crypto.randomUUID();
  const hashed = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    random,
  );

  // Save permanently
  await AsyncStorage.setItem(DEVICE_ID_KEY, hashed);

  return hashed;
}
