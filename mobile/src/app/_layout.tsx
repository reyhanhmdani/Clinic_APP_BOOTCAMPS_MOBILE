import { Stack } from "expo-router";
import "../global.css";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "Login" }} />
      <Stack.Screen name="queue" options={{ title: "Antrean Pasien" }} />
      <Stack.Screen name="patients" options={{ title: "Data Pasien" }} />
      <Stack.Screen name="doctors" options={{ title: "Data Dokter" }} />
      <Stack.Screen name="medicines" options={{ title: "Data Obat" }} />
      <Stack.Screen name="consultation" options={{ title: "Konsultasi Dokter" }} />
      <Stack.Screen name="invoice" options={{ title: "Kasir & Tagihan" }} />
    </Stack>
  );
}
