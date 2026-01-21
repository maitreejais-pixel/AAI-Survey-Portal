import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: "Register" }} />
      <Stack.Screen name="login" options={{ title: "Login" }} />
    </Stack>
  );
}
