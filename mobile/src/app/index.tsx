import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { loginService } from "../services/authService";
import { useAuthStore } from "../stores/authStore";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const isLogIn = useAuthStore((state) => state.isLogIn);
  const logIn = useAuthStore((state) => state.logIn);

  useEffect(() => {
    if (isLogIn) {
      router.replace("/queue");
    }
  }, [isLogIn]);

  const handleLoginPress = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Validasi Gagal", "Email dan password wajib diisi");
      return;
    }

    setLoading(true);

    try {
      const res = await loginService({ email: email.trim(), password });
      logIn(res.token, res.user as any);
      router.replace("/queue");
    } catch (error: any) {
      const message = error.response?.data?.message || "Email atau password salah";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f4f3ed]" edges={["top", "left", "right", "bottom"]}>
      {/* Top Header App Bar (Fixed at the very top) */}
      <View className="w-full bg-[#f4f3ed] border-b-2 border-[#18181b] px-6 py-3.5 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2.5">
          {/* <View className="w-8 h-8 bg-[#a3e635] border-2 border-[#18181b] rounded-lg items-center justify-center">
            <Ionicons name="medical" size={18} color="#18181b" />
          </View> */}
          <Text className="text-xl font-black text-[#18181b] tracking-tight">REYCLINIC</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 24,
            paddingVertical: 24,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Main Title Section */}
          <View className="mb-6">
            <Text className="text-3xl font-black text-[#18181b] tracking-tight">Log in</Text>
            <Text className="text-xs font-semibold text-[#71717a] mt-1">
              Masuk untuk mengelola sistem antrean & rekam medis.
            </Text>
          </View>

          {/* Form Fields */}
          <View className="gap-y-4 mb-5">
            {/* Email Field */}
            <View>
              <Text className="text-xs font-black text-[#18181b] uppercase mb-1.5 tracking-wider">
                Email / Username
              </Text>
              <View className="bg-white border-2 border-[#18181b] rounded-xl px-4 h-14 flex-row items-center justify-between">
                <TextInput
                  placeholder="admin@clinic.com"
                  placeholderTextColor="#a1a1aa"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  className="flex-1 text-sm font-bold text-[#18181b] h-full"
                />
                {email.length > 0 && (
                  <TouchableOpacity onPress={() => setEmail("")} className="p-1">
                    <Ionicons name="close-circle" size={18} color="#71717a" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Password Field */}
            <View>
              <View className="flex-row justify-between items-center mb-1.5">
                <Text className="text-xs font-black text-[#18181b] uppercase tracking-wider">
                  Password
                </Text>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text className="text-[11px] font-black text-[#71717a] underline">
                    Lupa Password?
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="bg-white border-2 border-[#18181b] rounded-xl px-4 h-14 flex-row items-center justify-between">
                <TextInput
                  placeholder="Masukkan kata sandi..."
                  placeholderTextColor="#a1a1aa"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  className="flex-1 text-sm font-bold text-[#18181b] h-full"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                  className="p-1"
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#18181b"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Primary Action Button (Log in) */}
          <View className="relative w-full mb-5">
            <View className="absolute top-1.5 left-1.5 -right-1.5 -bottom-1.5 bg-[#18181b] rounded-xl" />
            <TouchableOpacity
              onPress={handleLoginPress}
              disabled={loading}
              activeOpacity={0.85}
              className="bg-[#a3e635] border-2 border-[#18181b] rounded-xl h-14 justify-center items-center active:bg-lime-400"
            >
              {loading ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator size="small" color="#18181b" />
                  <Text className="text-sm font-black text-[#18181b] uppercase tracking-wider">
                    Memverifikasi...
                  </Text>
                </View>
              ) : (
                <Text className="text-sm font-black text-[#18181b] uppercase tracking-wider">
                  Log in
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Divider "Or" */}
          <View className="flex-row items-center my-3">
            <View className="flex-1 h-[2px] bg-[#18181b]" />
            <Text className="mx-4 text-xs font-black text-[#18181b]">Or</Text>
            <View className="flex-1 h-[2px] bg-[#18181b]" />
          </View>

          {/* Full-width Social Button (Continue with Google) - Exact to Image 2 */}
          <View className="relative w-full mb-6">
            <View className="absolute top-1.5 left-1.5 -right-1.5 -bottom-1.5 bg-[#18181b] rounded-xl" />
            <TouchableOpacity
              activeOpacity={0.85}
              className="bg-white border-2 border-[#18181b] rounded-xl h-14 flex-row justify-center items-center active:bg-zinc-100"
              onPress={() => Alert.alert("Informasi", "Fitur login Google akan segera hadir!")}
            >
              <Ionicons name="logo-google" size={18} color="#ea4335" style={{ marginRight: 8 }} />
              <Text className="text-sm font-black text-[#18181b]">Continue with Google</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Terms */}
          <View className="items-center pt-2">
            <Text className="text-[11px] font-medium text-[#71717a] text-center leading-relaxed">
              Dengan masuk, Anda menyetujui{"\n"}
              <Text className="font-bold text-[#18181b] underline">
                Syarat & Ketentuan Layanan REYCLINIC
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
