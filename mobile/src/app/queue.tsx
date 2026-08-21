import React, { useCallback, useEffect, useState } from "react";
import BottomNav from "../components/BottomNav";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, Alert, RefreshControl, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { logoutService } from "../services/authService";
import { useAuthStore } from "../stores/authStore";
import { Visit } from "../types/clinic";
import { useVisitStore } from "../stores/visitStore";
import CreateVisitModal from "../components/CreateVisitModal";

export default function QueueScreen() {
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // untuk modal create antrian
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const { visits, loading, fetchVisits, callPatient } = useVisitStore();

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    fetchVisits();
  }, []);

  const handleLogoutPress = async () => {
    try {
      await logoutService();
      logout();
      router.replace("/");
    } catch (error: any) {
      const message = error.response?.data?.message || "Gagal ketika logout";
      Alert.alert("Error", message);
    }
  };

  // Filter queue data
  const filteredData = visits.filter((item) => {
    // 1. Kondisi Status
    const isUnpaid = item.invoice?.status === "UNPAID" || (item.status === "COMPLETED" && item.invoice?.status !== "PAID");
    const isWaiting = item.status === "WAITING" && item.invoice?.status !== "UNPAID";
    const isConsulting = item.status === "IN_KONSULTASI";
    const isCompleted = item.status === "COMPLETED" && item.invoice?.status === "PAID";
    // 2. Filter Berdasarkan Tab yang Dipilih
    if (activeFilter === "WAITING" && !isWaiting) return false;
    if (activeFilter === "IN_KONSULTASI" && !isConsulting) return false;
    if (activeFilter === "UNPAID" && !isUnpaid) return false;
    if (activeFilter === "COMPLETED" && !isCompleted) return false;
    // 3. Filter Berdasarkan Search Bar (Nama Pasien / No RM / Dokter)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.patient?.name.toLowerCase().includes(q) || item.patient?.noRm.toLowerCase().includes(q) || item.doctor?.name.toLowerCase().includes(q);
    }
    return true;
  });

  const countWaiting = visits.filter((q) => q.status === "WAITING" && q.invoice?.status !== "UNPAID").length;
  const countInConsult = visits.filter((q) => q.status === "IN_KONSULTASI").length;
  const countUnpaid = visits.filter((q) => q.invoice?.status === "UNPAID" || (q.status === "COMPLETED" && q.invoice?.status !== "PAID")).length;
  const countCompleted = visits.filter((q) => q.status === "COMPLETED" && q.invoice?.status === "PAID").length;

  const renderStatusBadge = (visit: Visit) => {
    if (visit.invoice?.status === "UNPAID") {
      return (
        <View className="bg-[#f43f5e] border-2 border-[#18181b] px-2 py-0.5 rounded-md">
          <Text className="text-[10px] font-black text-white uppercase tracking-wider">BELUM BAYAR</Text>
        </View>
      );
    } else if (visit.status === "IN_KONSULTASI") {
      return (
        <View className="bg-[#38bdf8] border-2 border-[#18181b] px-2 py-0.5 rounded-md">
          <Text className="text-[10px] font-black text-[#18181b] uppercase tracking-wider">DIPERIKSA</Text>
        </View>
      );
    } else if (visit.status === "COMPLETED") {
      return (
        <View className="bg-[#4ade80] border-2 border-[#18181b] px-2 py-0.5 rounded-md">
          <Text className="text-[10px] font-black text-[#18181b] uppercase tracking-wider">SELESAI</Text>
        </View>
      );
    } else if (visit.status === "WAITING") {
      return (
        <View className="bg-[#fde047] border-2 border-[#18181b] px-2 py-0.5 rounded-md">
          <Text className="text-[10px] font-black text-[#18181b] uppercase tracking-wider">MENUNGGU</Text>
        </View>
      );
    } else if (visit.status === "CANCELLED") {
      return (
        <View className="bg-[#cbd5e1] border-2 border-[#18181b] px-2 py-0.5 rounded-md">
          <Text className="text-[10px] font-black text-[#52525b] uppercase tracking-wider">Cancel</Text>
        </View>
      );
    }
  };

  const renderActionButton = (item: Visit) => {
    // 1. Prioritas 1: Jika invoice belum dibayar -> Tombol BAYAR
    if (item.invoice?.status === "UNPAID" || (item.status === "COMPLETED" && item.invoice?.status !== "PAID")) {
      return (
        <TouchableOpacity
          className="bg-[#f43f5e] border-2 border-[#18181b] px-3.5 py-1.5 rounded-lg flex-row items-center active:bg-rose-600"
          activeOpacity={0.85}
          onPress={() => router.push({ pathname: "/invoice", params: { visitId: item.id } })}
        >
          <Ionicons name="cash-outline" size={14} color="#ffffff" style={{ marginRight: 4 }} />
          <Text className="text-xs font-black text-white uppercase tracking-wider">BAYAR</Text>
        </TouchableOpacity>
      );
    }

    // 2. Jika antrean masih WAITING -> Tombol PANGGIL
    if (item.status === "WAITING") {
      return (
        <TouchableOpacity
          className="bg-[#a3e635] border-2 border-[#18181b] px-3.5 py-1.5 rounded-lg flex-row items-center active:bg-lime-400"
          activeOpacity={0.85}
          onPress={() => callPatient(item.id)}
        >
          <Ionicons name="megaphone-outline" size={14} color="#18181b" style={{ marginRight: 4 }} />
          <Text className="text-xs font-black text-[#18181b] uppercase tracking-wider">PANGGIL</Text>
        </TouchableOpacity>
      );
    }

    // 3. Jika sedang IN_KONSULTASI -> Tombol PERIKSAw
    if (item.status === "IN_KONSULTASI") {
      return (
        <TouchableOpacity
          className="bg-[#38bdf8] border-2 border-[#18181b] px-3.5 py-1.5 rounded-lg flex-row items-center active:bg-sky-400"
          activeOpacity={0.85}
          onPress={() => router.push({ pathname: "/consultation", params: { visitId: item.id } })}
        >
          <Ionicons name="medical-outline" size={14} color="#18181b" style={{ marginRight: 4 }} />
          <Text className="text-xs font-black text-[#18181b] uppercase tracking-wider">PERIKSA</Text>
        </TouchableOpacity>
      );
    }

    // 4. Default: Selesai & Lunas -> Tombol STRUK
    if (item.status === "COMPLETED") {
      return (
        <TouchableOpacity
          className="bg-[#fef08a] border-2 border-[#18181b] px-3.5 py-1.5 rounded-lg flex-row items-center active:bg-yellow-300"
          activeOpacity={0.85}
          onPress={() => router.push({ pathname: "/invoice", params: { visitId: item.id } })}
        >
          <Ionicons name="receipt-outline" size={14} color="#18181b" style={{ marginRight: 4 }} />
          <Text className="text-xs font-black text-[#18181b] uppercase tracking-wider">STRUK</Text>
        </TouchableOpacity>
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f4f3ed]" edges={["top", "left", "right", "bottom"]}>
      {/* Top App Bar Header */}
      <View className="bg-[#f4f3ed] border-b-2 border-[#18181b] px-5 py-3.5 flex-row items-center justify-between">
        <View>
          <View className="bg-[#a3e635] border-2 border-[#18181b] px-2 py-0.5 self-start mb-1">
            <Text className="text-[9px] font-black text-[#18181b] tracking-wider uppercase">KLINIK RAWAT JALAN</Text>
          </View>
          <Text className="text-2xl font-black text-[#18181b] tracking-tight">REYCLINIC</Text>
        </View>
        <TouchableOpacity
          className="bg-white border-2 border-[#18181b] rounded-xl w-10 h-10 justify-center items-center active:bg-zinc-100"
          activeOpacity={0.8}
          onPress={handleLogoutPress}
        >
          <Ionicons name="log-out-outline" size={20} color="#18181b" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchVisits} colors={["#18181b"]} tintColor="#18181b" />}
      >
        {/* Quick Operational Stats Cards (2 Columns Balanced Grid) */}
        <View className="gap-y-3 mb-5">
          {/* Row 1 */}
          <View className="flex-row gap-3">
            {/* Card 1: Check-in */}
            <View className="flex-1 relative">
              <View className="absolute top-1 left-1 -right-1 -bottom-1 bg-[#18181b] rounded-xl" />
              <View className="bg-white border-2 border-[#18181b] rounded-xl p-3.5">
                <View className="flex-row items-center gap-1.5 mb-1">
                  <Ionicons name="people-outline" size={16} color="#18181b" />
                  <Text className="text-[10px] font-black text-[#18181b] tracking-wider uppercase">CHECK-IN</Text>
                </View>
                <Text className="text-2xl font-black text-[#18181b]">{visits.length}</Text>
              </View>
            </View>

            {/* Card 2: Menunggu */}
            <View className="flex-1 relative">
              <View className="absolute top-1 left-1 -right-1 -bottom-1 bg-[#18181b] rounded-xl" />
              <View className="bg-[#fef08a] border-2 border-[#18181b] rounded-xl p-3.5">
                <View className="flex-row items-center gap-1.5 mb-1">
                  <Ionicons name="hourglass-outline" size={16} color="#18181b" />
                  <Text className="text-[10px] font-black text-[#18181b] tracking-wider uppercase">MENUNGGU</Text>
                </View>
                <Text className="text-2xl font-black text-[#18181b]">{countWaiting}</Text>
              </View>
            </View>
          </View>

          {/* Row 2 */}
          <View className="flex-row gap-3">
            {/* Card 3: Diperiksa */}
            <View className="flex-1 relative">
              <View className="absolute top-1 left-1 -right-1 -bottom-1 bg-[#18181b] rounded-xl" />
              <View className="bg-[#bae6fd] border-2 border-[#18181b] rounded-xl p-3.5">
                <View className="flex-row items-center gap-1.5 mb-1">
                  <Ionicons name="pulse-outline" size={16} color="#18181b" />
                  <Text className="text-[10px] font-black text-[#18181b] tracking-wider uppercase">DIPERIKSA</Text>
                </View>
                <Text className="text-2xl font-black text-[#18181b]">{countInConsult}</Text>
              </View>
            </View>

            {/* Card 4: Selesai */}
            <View className="flex-1 relative">
              <View className="absolute top-1 left-1 -right-1 -bottom-1 bg-[#18181b] rounded-xl" />
              <View className="bg-[#a3e635] border-2 border-[#18181b] rounded-xl p-3.5">
                <View className="flex-row items-center gap-1.5 mb-1">
                  <Ionicons name="checkmark-done-outline" size={16} color="#18181b" />
                  <Text className="text-[10px] font-black text-[#18181b] tracking-wider uppercase">SELESAI</Text>
                </View>
                <Text className="text-2xl font-black text-[#18181b]">{countCompleted}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View className="relative mb-4">
          <View className="absolute top-1 left-1 -right-1 -bottom-1 bg-[#18181b] rounded-xl" />
          <View className="bg-white border-2 border-[#18181b] rounded-xl px-3.5 h-12 flex-row items-center">
            <Ionicons name="search-outline" size={18} color="#18181b" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Cari pasien / No. RM / Dokter..."
              placeholderTextColor="#71717a"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 text-xs font-bold text-[#18181b]"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")} className="p-1">
                <Ionicons name="close-circle" size={18} color="#71717a" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Edge-to-Edge Workflow Filter Chips (Smooth Horizontal Scroll) */}
        <View className="mb-5">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4" contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
            {[
              { id: "ALL", label: "SEMUA", count: visits.length },
              { id: "WAITING", label: "MENUNGGU", count: countWaiting },
              { id: "IN_KONSULTASI", label: "DIPERIKSA", count: countInConsult },
              { id: "UNPAID", label: "BELUM BAYAR", count: countUnpaid },
              { id: "COMPLETED", label: "SELESAI", count: countCompleted },
            ].map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => setActiveFilter(tab.id)}
                  activeOpacity={0.8}
                  className={`flex-row items-center border-2 border-[#18181b] rounded-xl px-3.5 py-2 gap-2 ${isActive ? "bg-[#18181b]" : "bg-white"}`}
                >
                  <Text className={`text-[11px] font-black uppercase tracking-wider ${isActive ? "text-white" : "text-[#18181b]"}`}>{tab.label}</Text>
                  <View className={`border border-[#18181b] px-1.5 py-0.5 rounded ${isActive ? "bg-white" : "bg-zinc-200"}`}>
                    <Text className="text-[10px] font-black text-[#18181b]">{tab.count}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Queue Header Row with + ANTREAN Button */}
        <View className="flex-row justify-between items-center mb-3.5">
          <View>
            <Text className="text-xs font-black text-[#18181b] tracking-wider uppercase">ANTREAN HARI INI</Text>
            <Text className="text-[11px] font-bold text-[#71717a]">{filteredData.length} Pasien Terdaftar</Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsCreateModalOpen(true)}
            activeOpacity={0.85}
            className="bg-[#a3e635] border-2 border-[#18181b] px-3.5 py-2 rounded-xl flex-row items-center active:bg-lime-400"
          >
            <Ionicons name="add-circle" size={16} color="#18181b" style={{ marginRight: 5 }} />
            <Text className="text-xs font-black text-[#18181b] tracking-wider uppercase">+ ANTREAN</Text>
          </TouchableOpacity>
        </View>

        {/* Patient Cards List */}
        {filteredData.length === 0 ? (
          <View className="bg-white border-2 border-[#18181b] rounded-2xl p-8 items-center justify-center gap-2 mt-2">
            <Ionicons name="hourglass-outline" size={40} color="#71717a" />
            <Text className="text-xs font-bold text-[#71717a] text-center">Tidak ada antrean yang cocok dengan filter atau kata kunci.</Text>
          </View>
        ) : (
          filteredData.map((item) => (
            <View key={item.id} className="relative mb-4">
              {/* Neubrutal Drop Shadow Layer */}
              <View className="absolute top-1.5 left-1.5 -right-1.5 -bottom-1.5 bg-[#18181b] rounded-2xl" />

              {/* Front Card */}
              <View className="bg-white border-2 border-[#18181b] rounded-2xl p-4">
                {/* Top Row: Queue Badge & Time/Status */}
                <View className="flex-row justify-between items-center mb-3">
                  <View className="bg-zinc-100 border-2 border-[#18181b] px-2.5 py-1 rounded-md">
                    <Text
                      style={{
                        fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
                      }}
                      className="text-xs font-black text-[#18181b]"
                    >
                      {`A-${String(item.queueNumber || item.id).padStart(2, "0")}`}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="time-outline" size={13} color="#52525b" />
                      <Text className="text-xs font-bold text-[#52525b]">
                        {item.checkInTime ? new Date(item.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}
                      </Text>
                    </View>
                    {renderStatusBadge(item)}
                  </View>
                </View>

                {/* Patient Info */}
                <View className="mb-3">
                  <Text className="text-base font-black text-[#18181b] uppercase tracking-tight">{item.patient?.name}</Text>
                  <Text className="text-xs font-semibold text-[#71717a] mt-0.5">
                    {item.patient?.noRm} • {item.patient?.gender === "MALE" ? "Laki-laki" : "Perempuan"} ({item.patient?.age} th)
                  </Text>
                </View>

                {/* Divider */}
                <View className="h-[1px] bg-zinc-200 mb-3" />

                {/* Bottom Row: Doctor Info & Action Button */}
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center flex-1 mr-3">
                    <Ionicons name="person-circle-outline" size={20} color="#52525b" />
                    <View className="ml-2 flex-1">
                      <Text className="text-xs font-extrabold text-[#18181b]" numberOfLines={1}>
                        {item.doctor?.name}
                      </Text>
                      <Text className="text-[10px] font-semibold text-[#71717a]">{item.doctor?.spesialis}</Text>
                    </View>
                  </View>
                  {renderActionButton(item)}
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Create Visit Modal */}
      <CreateVisitModal
        visible={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Bottom Master Data Navigation Bar (Antrean, Dokter, Obat) */}
      <BottomNav activeTab="queue" />
    </SafeAreaView>
  );
}
