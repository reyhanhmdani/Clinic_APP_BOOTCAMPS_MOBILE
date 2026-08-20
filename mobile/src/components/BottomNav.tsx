import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";

interface BottomNavProps {
  activeTab: "queue" | "doctors" | "medicines";
}

export default function BottomNav({ activeTab }: BottomNavProps) {
  return (
    <View className="bg-white border-t-2 border-[#18181b] flex-row justify-around py-3 px-4 shadow-sm">
      {/* 1. Antrean */}
      <TouchableOpacity className="items-center gap-1 flex-1" activeOpacity={0.8} onPress={() => activeTab !== "queue" && router.push("/queue" as any)}>
        {activeTab === "queue" ? (
          <View className="bg-[#a3e635] border-2 border-[#18181b] px-3.5 py-1 rounded-full">
            <Ionicons name="list" size={18} color="#18181b" />
          </View>
        ) : (
          <Ionicons name="list-outline" size={22} color="#71717a" />
        )}
        <Text className={`text-[11px] ${activeTab === "queue" ? "font-black text-[#18181b]" : "font-bold text-[#71717a]"}`}>Antrean</Text>
      </TouchableOpacity>
      {/* 2. Dokter */}
      <TouchableOpacity className="items-center gap-1 flex-1" activeOpacity={0.8} onPress={() => activeTab !== "doctors" && router.push("/doctors" as any)}>
        {activeTab === "doctors" ? (
          <View className="bg-[#a3e635] border-2 border-[#18181b] px-3.5 py-1 rounded-full">
            <Ionicons name="people" size={18} color="#18181b" />
          </View>
        ) : (
          <Ionicons name="people-outline" size={22} color="#71717a" />
        )}
        <Text className={`text-[11px] ${activeTab === "doctors" ? "font-black text-[#18181b]" : "font-bold text-[#71717a]"}`}>Dokter</Text>
      </TouchableOpacity>
      {/* 3. Obat */}
      <TouchableOpacity className="items-center gap-1 flex-1" activeOpacity={0.8} onPress={() => activeTab !== "medicines" && router.push("/medicines" as any)}>
        {activeTab === "medicines" ? (
          <View className="bg-[#a3e635] border-2 border-[#18181b] px-3.5 py-1 rounded-full">
            <Ionicons name="medkit" size={18} color="#18181b" />
          </View>
        ) : (
          <Ionicons name="medkit-outline" size={22} color="#71717a" />
        )}
        <Text className={`text-[11px] ${activeTab === "medicines" ? "font-black text-[#18181b]" : "font-bold text-[#71717a]"}`}>Obat</Text>
      </TouchableOpacity>
    </View>
  );
}
