import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";

export type BottomNavTab = "queue" | "patients" | "doctors" | "medicines";

interface BottomNavProps {
  activeTab: BottomNavTab;
}

export default function BottomNav({ activeTab }: BottomNavProps) {
  return (
    <View className="bg-white border-t-2 border-[#18181b] flex-row justify-around py-3 px-2 shadow-sm">
      {/* 1. Antrean */}
      <TouchableOpacity
        className="items-center gap-1 flex-1"
        activeOpacity={0.8}
        onPress={() => activeTab !== "queue" && router.push("/queue" as any)}
      >
        {activeTab === "queue" ? (
          <View className="bg-[#a3e635] border-2 border-[#18181b] px-3.5 py-1 rounded-full">
            <Ionicons name="list" size={18} color="#18181b" />
          </View>
        ) : (
          <Ionicons name="list-outline" size={22} color="#71717a" />
        )}
        <Text className={`text-[11px] ${activeTab === "queue" ? "font-black text-[#2f2f4e]" : "font-bold text-[#71717a]"}`}>
          Antrean
        </Text>
      </TouchableOpacity>

      {/* 2. Pasien */}
      <TouchableOpacity
        className="items-center gap-1 flex-1"
        activeOpacity={0.8}
        onPress={() => activeTab !== "patients" && router.push("/patients" as any)}
      >
        {activeTab === "patients" ? (
          <View className="bg-[#a3e635] border-2 border-[#18181b] px-3.5 py-1 rounded-full">
            <Ionicons name="people" size={18} color="#18181b" />
          </View>
        ) : (
          <Ionicons name="people-outline" size={22} color="#71717a" />
        )}
        <Text className={`text-[11px] ${activeTab === "patients" ? "font-black text-[#18181b]" : "font-bold text-[#71717a]"}`}>
          Pasien
        </Text>
      </TouchableOpacity>

      {/* 3. Dokter */}
      <TouchableOpacity
        className="items-center gap-1 flex-1"
        activeOpacity={0.8}
        onPress={() => activeTab !== "doctors" && router.push("/doctors" as any)}
      >
        {activeTab === "doctors" ? (
          <View className="bg-[#a3e635] border-2 border-[#18181b] px-3.5 py-1 rounded-full">
            <Ionicons name="medical" size={18} color="#18181b" />
          </View>
        ) : (
          <Ionicons name="medical-outline" size={22} color="#71717a" />
        )}
        <Text className={`text-[11px] ${activeTab === "doctors" ? "font-black text-[#18181b]" : "font-bold text-[#71717a]"}`}>
          Dokter
        </Text>
      </TouchableOpacity>

      {/* 4. Obat */}
      <TouchableOpacity
        className="items-center gap-1 flex-1"
        activeOpacity={0.8}
        onPress={() => activeTab !== "medicines" && router.push("/medicines" as any)}
      >
        {activeTab === "medicines" ? (
          <View className="bg-[#a3e635] border-2 border-[#18181b] px-3.5 py-1 rounded-full">
            <Ionicons name="flask" size={18} color="#18181b" />
          </View>
        ) : (
          <Ionicons name="flask-outline" size={22} color="#71717a" />
        )}
        <Text className={`text-[11px] ${activeTab === "medicines" ? "font-black text-[#18181b]" : "font-bold text-[#71717a]"}`}>
          Obat
        </Text>
      </TouchableOpacity>
    </View>
  );
}
