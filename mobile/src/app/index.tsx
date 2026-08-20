import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from "react-native";
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
    // 1. Validasi awal
    if (!email.trim() || !password.trim()) {
      Alert.alert("Validasi Gagal", "Email dan password wajib diisi");
      return;
    }

    setLoading(true);

    try {
      const res = await loginService({ email: email.trim(), password });
      // Simpan token dan user ke Zustand
      logIn(res.token, res.user as any);

      // Redirect ke antrean
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
      {/* Top Header App Bar */}
      <View className="w-full bg-[#f4f3ed] border-b-2 border-[#18181b] px-6 py-3.5 flex-row items-center">
        <Text className="text-xl font-black text-[#18181b] tracking-tight">REYCLINIC</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingVertical: 24,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full max-w-[360px] items-center">
            {/* Hero Section */}
            <View className="items-center mb-6">
              <Text className="text-2xl font-black text-[#18181b] tracking-tight uppercase mb-1">WELCOME BACK</Text>
              <Text className="text-xs font-semibold text-[#52525b]">Access your secure clinical portal.</Text>
            </View>

            {/* Login Card with Neubrutalism Solid Shadow */}
            <View className="w-full relative mb-6">
              {/* Solid Black Shadow Layer */}
              <View className="absolute top-1.5 left-1.5 -right-1.5 -bottom-1.5 bg-[#18181b] rounded-3xl" />

              {/* White Front Card */}
              <View className="bg-white border-2 border-[#18181b] rounded-3xl p-5">
                {/* Username / Email Field */}
                <View className="mb-4">
                  <Text className="text-[11px] font-black text-[#18181b] tracking-wider uppercase mb-1.5">USERNAME / EMAIL</Text>
                  <View className="relative w-full">
                    <View className="absolute top-1 left-1 -right-1 -bottom-1 bg-[#18181b] rounded-xl" />
                    <View className="bg-white border-2 border-[#18181b] rounded-xl px-3.5 h-12 flex-row items-center">
                      <Ionicons name="person-outline" size={18} color="#18181b" style={{ marginRight: 8 }} />
                      <TextInput
                        placeholder="johndoe@reyclinic.eco"
                        placeholderTextColor="#9ca3af"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                        className="flex-1 text-xs font-bold text-[#18181b]"
                      />
                    </View>
                  </View>
                </View>

                {/* Password Field */}
                <View className="mb-4">
                  <View className="flex-row justify-between items-center mb-1.5">
                    <Text className="text-[11px] font-black text-[#18181b] tracking-wider uppercase">PASSWORD</Text>
                    <TouchableOpacity activeOpacity={0.7}>
                      <Text className="text-[11px] font-extrabold text-[#18181b] underline">Forgot?</Text>
                    </TouchableOpacity>
                  </View>
                  <View className="relative w-full">
                    <View className="absolute top-1 left-1 -right-1 -bottom-1 bg-[#18181b] rounded-xl" />
                    <View className="bg-white border-2 border-[#18181b] rounded-xl px-3.5 h-12 flex-row items-center">
                      <Ionicons name="lock-closed-outline" size={18} color="#18181b" style={{ marginRight: 8 }} />
                      <TextInput
                        placeholder="••••••••"
                        placeholderTextColor="#9ca3af"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                        className="flex-1 text-xs font-bold text-[#18181b]"
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7} className="p-1">
                        <Text className="text-[10px] font-black text-[#71717a] tracking-wider">{showPassword ? "HIDE" : "SHOW"}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Submit Button (LOG IN) */}
                <View className="relative w-full mt-2">
                  <View className="absolute top-1 left-1 -right-1 -bottom-1 bg-[#18181b] rounded-xl" />
                  <TouchableOpacity
                    onPress={handleLoginPress}
                    disabled={loading}
                    activeOpacity={0.85}
                    className="bg-[#a3e635] border-2 border-[#18181b] rounded-xl h-12 flex-row justify-center items-center active:bg-lime-400"
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#18181b" />
                    ) : (
                      <>
                        <Text className="text-xs font-black text-[#18181b] tracking-wider uppercase mr-1.5">LOG IN</Text>
                        <Ionicons name="arrow-forward-outline" size={18} color="#18181b" />
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Google Button */}
                <View className="relative w-full mt-3">
                  <View className="absolute top-1 left-1 -right-1 -bottom-1 bg-[#18181b] rounded-xl" />
                  <TouchableOpacity
                    activeOpacity={0.85}
                    className="bg-white border-2 border-[#18181b] rounded-xl h-11 flex-row justify-center items-center active:bg-zinc-100"
                  >
                    <Ionicons name="logo-google" size={16} color="#ea4335" style={{ marginRight: 8 }} />
                    <Text className="text-xs font-bold text-[#18181b]">Continue with Google</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Footer */}
            <View className="items-center mt-1">
              <Text className="text-xs font-semibold text-[#71717a]">
                Don't have an account? <Text className="font-black text-[#18181b] underline">Sign up</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
