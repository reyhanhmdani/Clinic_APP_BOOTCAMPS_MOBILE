import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Alert,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import BottomNav from "../components/BottomNav";
import { useDoctorStore } from "../stores/doctorStore";
import { Doctor } from "../types/clinic";
import { formatRupiah } from "../utils/formatRupiah";
import { createDoctorService, updateDoctorService } from "../services/doctorService";

export default function DoctorsScreen() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [spesialis, setSpesialis] = useState("");
  const [phone, setPhone] = useState("");
  const [fee, setFee] = useState("");
  const [isActive, setIsActive] = useState<boolean>(true);

  const { doctors, loading, fetchDoctors } = useDoctorStore();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const openCreateModal = () => {
    setEditingDoctor(null);
    setName("");
    setSpesialis("");
    setPhone("");
    setFee("100000");
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setName(doctor.name);
    setSpesialis(doctor.spesialis);
    setPhone(doctor.phone || "");
    setFee(String(doctor.fee));
    setIsActive(doctor.isActive);
    setIsModalOpen(true);
  };

  const handleSaveDoctor = async () => {
    if (!name.trim()) {
      Alert.alert("Perhatian", "Nama dokter wajib diisi!");
      return;
    }
    if (!spesialis.trim()) {
      Alert.alert("Perhatian", "Spesialisasi dokter wajib diisi!");
      return;
    }
    if (!fee.trim() || isNaN(Number(fee))) {
      Alert.alert("Perhatian", "Tarif konsultasi harus berupa angka valid!");
      return;
    }

    const payload = {
      name: name.trim(),
      spesialis: spesialis,
      phone: phone || undefined,
      fee: Number(fee),
      isActive: true,
    };

    try {
      if (editingDoctor) {
        await updateDoctorService(editingDoctor.id, payload);
        Alert.alert("Sukses", `Doctor ${name} berhasil di perbarui`);
      } else {
        await createDoctorService(payload);
        Alert.alert("Sukses", `Doctor ${name} berhasil di tambahkan`);
      }
      setIsModalOpen(false);
      fetchDoctors();
    } catch (error: any) {
      const message = error.response?.data?.message || "Gagal menyimpan data doctor";
      Alert.alert("error", message);
    }
  };

  // Fungsi Toggle: Bisa Menonaktifkan atau Mengaktifkan Kembali
  const handleToggleActiveDoctor = (doctor: Doctor) => {
    const actionText = doctor.isActive ? "menonaktifkan" : "mengaktifkan kembali";

    Alert.alert(
      `Konfirmasi ${doctor.isActive ? "Nonaktifkan" : "Aktifkan"}`,
      `Apakah kamu yakin ingin ${actionText} dokter ${doctor.name}?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: doctor.isActive ? "Nonaktifkan" : "Aktifkan",
          style: doctor.isActive ? "destructive" : "default",
          onPress: async () => {
            try {
              // Kirim status kebalikannya
              await updateDoctorService(doctor.id, { isActive: !doctor.isActive });
              Alert.alert("Sukses", `Dokter ${doctor.name} berhasil di-${actionText}`);
              fetchDoctors(); // Refresh list dokter
            } catch (error: any) {
              const message = error.response?.data?.message || "Gagal mengubah status dokter";
              Alert.alert("Error", message);
            }
          },
        },
      ]
    );
  };

  // Filter Data Dokter
  const filteredDoctors = doctors.filter((doctor) => {
    if (statusFilter === "ACTIVE" && !doctor.isActive) return false;
    if (statusFilter === "INACTIVE" && doctor.isActive) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = doctor.name.toLowerCase().includes(q);
      const matchSpesialis = doctor.spesialis.toLowerCase().includes(q);
      const matchRoom = doctor.room ? doctor.room.toLowerCase().includes(q) : false;
      return matchName || matchSpesialis || matchRoom;
    }
    return true;
  });

  const countActive = doctors.filter((d) => d.isActive).length;
  const countInactive = doctors.filter((d) => !d.isActive).length;

  return (
    <SafeAreaView className="flex-1 bg-[#f4f3ed]" edges={["top", "left", "right", "bottom"]}>
      {/* Top Header */}
      <View className="bg-[#f4f3ed] border-b-2 border-[#18181b] px-5 py-3.5 flex-row items-center justify-between">
        <View>
          <View className="bg-[#bae6fd] border-2 border-[#18181b] px-2 py-0.5 self-start mb-1">
            <Text className="text-[9px] font-black text-[#18181b] tracking-wider uppercase">
              MASTER DATA
            </Text>
          </View>
          <Text className="text-2xl font-black text-[#18181b] tracking-tight">DATA DOKTER</Text>
        </View>

        {/* Tombol Tambah Dokter Baru */}
        <TouchableOpacity
          className="bg-[#a3e635] border-2 border-[#18181b] px-3.5 py-2 rounded-xl flex-row items-center active:bg-lime-400"
          activeOpacity={0.85}
          onPress={openCreateModal}
        >
          <Ionicons name="add" size={18} color="#18181b" style={{ marginRight: 4 }} />
          <Text className="text-xs font-black text-[#18181b] uppercase">TAMBAH</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchDoctors}
            colors={["#18181b"]}
            tintColor="#18181b"
          />
        }
      >
        {/* Quick Stats Grid */}
        <View className="flex-row gap-3 mb-4">
          {/* Total Dokter */}
          <View className="flex-1 relative">
            <View className="absolute top-1 left-1 -right-1 -bottom-1 bg-[#18181b] rounded-xl" />
            <View className="bg-white border-2 border-[#18181b] rounded-xl p-3">
              <View className="flex-row items-center gap-1.5 mb-1">
                <Ionicons name="medical" size={14} color="#18181b" />
                <Text className="text-[10px] font-black text-[#18181b] uppercase">
                  TOTAL DOKTER
                </Text>
              </View>
              <Text className="text-xl font-black text-[#18181b]">{doctors.length}</Text>
            </View>
          </View>

          {/* Aktif Praktek */}
          <View className="flex-1 relative">
            <View className="absolute top-1 left-1 -right-1 -bottom-1 bg-[#18181b] rounded-xl" />
            <View className="bg-[#a3e635] border-2 border-[#18181b] rounded-xl p-3">
              <View className="flex-row items-center gap-1.5 mb-1">
                <Ionicons name="checkmark-circle" size={14} color="#18181b" />
                <Text className="text-[10px] font-black text-[#18181b] uppercase">PRAKTEK</Text>
              </View>
              <Text className="text-xl font-black text-[#18181b]">{countActive}</Text>
            </View>
          </View>

          {/* Libur / Nonaktif */}
          <View className="flex-1 relative">
            <View className="absolute top-1 left-1 -right-1 -bottom-1 bg-[#18181b] rounded-xl" />
            <View className="bg-[#fef08a] border-2 border-[#18181b] rounded-xl p-3">
              <View className="flex-row items-center gap-1.5 mb-1">
                <Ionicons name="pause-circle" size={14} color="#18181b" />
                <Text className="text-[10px] font-black text-[#18181b] uppercase">LIBUR</Text>
              </View>
              <Text className="text-xl font-black text-[#18181b]">{countInactive}</Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View className="relative mb-3">
          <View className="absolute top-1 left-1 -right-1 -bottom-1 bg-[#18181b] rounded-xl" />
          <View className="bg-white border-2 border-[#18181b] rounded-xl px-3.5 h-12 flex-row items-center">
            <Ionicons name="search-outline" size={18} color="#18181b" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Cari nama dokter / spesialis / poli..."
              placeholderTextColor="#71717a"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 text-xs font-bold text-[#18181b]"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={18} color="#71717a" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Status Filter Pills */}
        <View className="flex-row gap-2 mb-4">
          <TouchableOpacity
            className={`px-3 py-1.5 rounded-lg border-2 border-[#18181b] ${
              statusFilter === "ALL" ? "bg-[#18181b]" : "bg-white"
            }`}
            activeOpacity={0.8}
            onPress={() => setStatusFilter("ALL")}
          >
            <Text
              className={`text-xs font-black ${
                statusFilter === "ALL" ? "text-white" : "text-[#18181b]"
              }`}
            >
              Semua
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`px-3 py-1.5 rounded-lg border-2 border-[#18181b] ${
              statusFilter === "ACTIVE" ? "bg-[#18181b]" : "bg-white"
            }`}
            activeOpacity={0.8}
            onPress={() => setStatusFilter("ACTIVE")}
          >
            <Text
              className={`text-xs font-black ${
                statusFilter === "ACTIVE" ? "text-white" : "text-[#18181b]"
              }`}
            >
              Aktif Praktek
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`px-3 py-1.5 rounded-lg border-2 border-[#18181b] ${
              statusFilter === "INACTIVE" ? "bg-[#18181b]" : "bg-white"
            }`}
            activeOpacity={0.8}
            onPress={() => setStatusFilter("INACTIVE")}
          >
            <Text
              className={`text-xs font-black ${
                statusFilter === "INACTIVE" ? "text-white" : "text-[#18181b]"
              }`}
            >
              Libur
            </Text>
          </TouchableOpacity>
        </View>

        {/* Loading Indicator */}
        {loading && doctors.length === 0 && (
          <View className="py-12 items-center justify-center">
            <ActivityIndicator size="large" color="#18181b" />
            <Text className="text-xs font-bold text-[#71717a] mt-3">Memuat data dokter...</Text>
          </View>
        )}

        {/* Empty State */}
        {!loading && filteredDoctors.length === 0 && (
          <View className="relative mt-4">
            <View className="absolute top-1.5 left-1.5 -right-1.5 -bottom-1.5 bg-[#18181b] rounded-2xl" />
            <View className="bg-white border-2 border-[#18181b] rounded-2xl p-8 items-center justify-center">
              <View className="w-14 h-14 bg-[#f4f3ed] border-2 border-[#18181b] rounded-full items-center justify-center mb-3">
                <Ionicons name="medical-outline" size={26} color="#71717a" />
              </View>
              <Text className="text-base font-black text-[#18181b] mb-1">
                Tidak Ada Dokter Ditemukan
              </Text>
              <Text className="text-xs font-medium text-[#71717a] text-center mb-4">
                {searchQuery
                  ? "Coba kata kunci pencarian yang lain."
                  : "Belum ada master data dokter terdaftar."}
              </Text>
              <TouchableOpacity
                className="bg-[#a3e635] border-2 border-[#18181b] px-4 py-2 rounded-xl"
                onPress={openCreateModal}
              >
                <Text className="text-xs font-black text-[#18181b]">TAMBAH DOKTER BARU</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* List Card Dokter */}
        <View className="gap-y-3">
          {loading && doctors.length === 0 ? (
            <View className="bg-white border-2 border-[#18181b] rounded-2xl p-8 items-center justify-center gap-2">
              <ActivityIndicator size="small" color="#18181b" />
              <Text className="text-xs font-bold text-[#71717a]">Memuat data dokter...</Text>
            </View>
          ) : filteredDoctors.length === 0 ? (
            <View className="bg-white border-2 border-[#18181b] rounded-2xl p-8 items-center justify-center gap-2">
              <Ionicons name="people-outline" size={40} color="#71717a" />
              <Text className="text-xs font-bold text-[#71717a] text-center">
                Tidak ada data dokter yang cocok dengan pencarian.
              </Text>
            </View>
          ) : (
            filteredDoctors.map((doctor) => (
              <View key={doctor.id} className="relative">
                {/* Drop shadow box */}
                <View className="absolute top-1.5 left-1.5 -right-1.5 -bottom-1.5 bg-[#18181b] rounded-2xl" />

                {/* Front Card */}
                <View className="bg-white border-2 border-[#18181b] rounded-2xl p-4">
                  {/* Top: Avatar, Name & Status Badge */}
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center gap-3 flex-1 mr-2">
                      <View className="w-11 h-11 bg-[#bae6fd] border-2 border-[#18181b] rounded-full items-center justify-center">
                        <Ionicons name="medkit" size={20} color="#18181b" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-black text-[#18181b]" numberOfLines={1}>
                          {doctor.name}
                        </Text>
                        <Text className="text-xs font-bold text-[#71717a]">
                          {doctor.spesialis}
                        </Text>
                      </View>
                    </View>

                    {/* Status Badge */}
                    <View
                      className={`border-2 border-[#18181b] px-2.5 py-0.5 rounded-md ${
                        doctor.isActive ? "bg-[#a3e635]" : "bg-zinc-200"
                      }`}
                    >
                      <Text className="text-[10px] font-black text-[#18181b]">
                        {doctor.isActive ? "PRAKTEK" : "LIBUR"}
                      </Text>
                    </View>
                  </View>

                  {/* Details Row: Consultation Fee */}
                  <View className="flex-row gap-2 mb-3">
                    <View className="flex-1 bg-[#f4f3ed] p-2.5 rounded-xl border border-[#18181b]">
                      <Text className="text-[10px] font-bold text-[#71717a] uppercase mb-0.5">
                        Tarif Jasa
                      </Text>
                      <Text className="text-xs font-black text-[#059669]">
                        {formatRupiah(doctor.fee)}
                      </Text>
                    </View>
                  </View>

                  {/* Phone Contact */}
                  {doctor.phone && (
                    <View className="flex-row items-center gap-2 mb-3 px-1">
                      <Ionicons name="call-outline" size={13} color="#71717a" />
                      <Text className="text-xs font-bold text-[#71717a]">{doctor.phone}</Text>
                    </View>
                  )}

                  {/* Actions Row */}
                  <View className="flex-row items-center justify-end gap-2 pt-2 border-t border-zinc-200">
                    <TouchableOpacity
                      className="bg-white border-2 border-[#18181b] px-3 py-1.5 rounded-lg flex-row items-center active:bg-zinc-100"
                      activeOpacity={0.8}
                      onPress={() => openEditModal(doctor)}
                    >
                      <Ionicons
                        name="create-outline"
                        size={14}
                        color="#18181b"
                        style={{ marginRight: 4 }}
                      />
                      <Text className="text-xs font-black text-[#18181b]">EDIT</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className={`${
                        doctor.isActive ? "bg-[#f43f5e] active:bg-rose-600" : "bg-[#a3e635] active:bg-lime-400"
                      } border-2 border-[#18181b] px-3 py-1.5 rounded-lg flex-row items-center`}
                      activeOpacity={0.8}
                      onPress={() => handleToggleActiveDoctor(doctor)}
                    >
                      <Ionicons
                        name={doctor.isActive ? "pause-circle-outline" : "play-circle-outline"}
                        size={14}
                        color={doctor.isActive ? "#ffffff" : "#18181b"}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        className={`text-xs font-black ${
                          doctor.isActive ? "text-white" : "text-[#18181b]"
                        }`}
                      >
                        {doctor.isActive ? "NONAKTIFKAN" : "AKTIFKAN"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal Form Tambah / Edit Dokter */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white border-t-4 border-[#18181b] rounded-t-3xl p-5 max-h-[85%]">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between pb-3 mb-4 border-b-2 border-[#18181b]">
              <View>
                <Text className="text-xl font-black text-[#18181b]">
                  {editingDoctor ? "Edit Dokter" : "Tambah Dokter Baru"}
                </Text>
                <Text className="text-xs font-medium text-[#71717a]">
                  Formulir tenaga medis & spesialisasi
                </Text>
              </View>
              <TouchableOpacity
                className="bg-[#f4f3ed] border-2 border-[#18181b] rounded-full p-1.5"
                onPress={() => setIsModalOpen(false)}
              >
                <Ionicons name="close" size={18} color="#18181b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Nama Lengkap & Gelar */}
              <View className="mb-3">
                <Text className="text-xs font-black text-[#18181b] uppercase mb-1.5">
                  Nama Lengkap & Gelar *
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Contoh: dr. Amanda Sari, Sp.A"
                  placeholderTextColor="#a1a1aa"
                  className="bg-[#f4f3ed] border-2 border-[#18181b] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#18181b]"
                />
              </View>

              {/* Spesialisasi */}
              <View className="mb-3">
                <Text className="text-xs font-black text-[#18181b] uppercase mb-1.5">
                  Spesialisasi *
                </Text>
                <TextInput
                  value={spesialis}
                  onChangeText={setSpesialis}
                  placeholder="Contoh: Dokter Umum / Spesialis Anak"
                  placeholderTextColor="#a1a1aa"
                  className="bg-[#f4f3ed] border-2 border-[#18181b] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#18181b]"
                />
              </View>

              {/* Tarif Konsultasi */}
              <View className="mb-3">
                <Text className="text-xs font-black text-[#18181b] uppercase mb-1.5">
                  Tarif Konsultasi (Rp) *
                </Text>
                <TextInput
                  value={fee}
                  onChangeText={setFee}
                  keyboardType="numeric"
                  placeholder="100000"
                  placeholderTextColor="#a1a1aa"
                  className="bg-[#f4f3ed] border-2 border-[#18181b] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#18181b]"
                />
              </View>

              {/* No HP */}
              <View className="mb-3">
                <Text className="text-xs font-black text-[#18181b] uppercase mb-1.5">
                  No. Telepon / WA Dokter
                </Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder="08129876543"
                  placeholderTextColor="#a1a1aa"
                  className="bg-[#f4f3ed] border-2 border-[#18181b] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#18181b]"
                />
              </View>

              {/* Status Praktek Switch */}
              <View className="flex-row items-center justify-between bg-[#f4f3ed] border-2 border-[#18181b] rounded-xl p-3.5 mb-5">
                <View>
                  <Text className="text-xs font-black text-[#18181b]">Status Praktek</Text>
                  <Text className="text-[11px] font-medium text-[#71717a]">
                    {isActive
                      ? "Dokter sedang aktif menerima pasien"
                      : "Dokter sedang libur / tidak praktek"}
                  </Text>
                </View>
                <Switch
                  value={isActive}
                  onValueChange={setIsActive}
                  trackColor={{ false: "#d4d4d8", true: "#a3e635" }}
                  thumbColor="#18181b"
                />
              </View>

              {/* Submit Buttons */}
              <View className="flex-row gap-3 pb-6">
                <TouchableOpacity
                  className="flex-1 bg-white border-2 border-[#18181b] py-3 rounded-xl items-center"
                  onPress={() => setIsModalOpen(false)}
                >
                  <Text className="text-xs font-black text-[#18181b]">BATAL</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-[#a3e635] border-2 border-[#18181b] py-3 rounded-xl items-center active:bg-lime-400"
                  onPress={handleSaveDoctor}
                >
                  <Text className="text-xs font-black text-[#18181b]">
                    {editingDoctor ? "SIMPAN PERUBAHAN" : "TAMBAH DOKTER"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Persistent BottomNav with 'doctors' active tab */}
      <BottomNav activeTab="doctors" />
    </SafeAreaView>
  );
}
