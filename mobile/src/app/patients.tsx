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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import BottomNav from "../components/BottomNav";
import PatientHistoryModal from "../components/PatientHistoryModal";
import { usePatientStore } from "../stores/patientStore";
import { Patient } from "../types/clinic";
import {
  createPatientService,
  deletePatientService,
  updatePatientService,
} from "../services/patientService";

export default function PatientsScreen() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [genderFilter, setGenderFilter] = useState<"ALL" | "MALE" | "FEMALE">("ALL");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // History Modal State
  const [selectedPatientForHistory, setSelectedPatientForHistory] = useState<Patient | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE">("MALE");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const { patients, loading, fetchPatients } = usePatientStore();

  useEffect(() => {
    fetchPatients();
  }, []);

  const openCreateModal = () => {
    setEditingPatient(null);
    setName("");
    setGender("MALE");
    setAge("");
    setPhone("");
    setAddress("");
    setIsModalOpen(true);
  };

  const openEditModal = (patient: Patient) => {
    setEditingPatient(patient);
    setName(patient.name);
    setGender(patient.gender);
    setAge(String(patient.age));
    setPhone(patient.phone || "");
    setAddress(patient.address || "");
    setIsModalOpen(true);
  };

  const openHistoryModal = (patient: Patient) => {
    setSelectedPatientForHistory(patient);
    setIsHistoryModalOpen(true);
  };

  const handleSavePatient = async () => {
    if (!name.trim()) {
      Alert.alert("Perhatian", "Nama pasien ga boleh kosong");
      return;
    }
    if (!age.trim() || isNaN(Number(age))) {
      Alert.alert("Perhatian", "Usia pasien harus berupa angka valid!");
      return;
    }

    const trimmedPhone = phone.trim();
    if (trimmedPhone && (trimmedPhone.length < 11 || trimmedPhone.length > 13)) {
      Alert.alert("Perhatian", "Nomor telepon harus antara 11 - 13 digit!");
      return;
    }

    if (trimmedPhone && !/^\d+$/.test(trimmedPhone)) {
      Alert.alert("Perhatian", "Nomor telepon hanya boleh berisi angka!");
      return;
    }

    // buat object untuk simpan data pasien
    const payload = {
      name: name.trim(),
      gender: gender,
      age: Number(age),
      phone: trimmedPhone || undefined,
      address: address.trim() || undefined,
    };

    try {
      // eksekusi create / update
      if (editingPatient) {
        await updatePatientService(editingPatient.id, payload);
        Alert.alert("Sukses", `Pasien ${name} berhasil di perbarui`);
      } else {
        await createPatientService(payload);
        Alert.alert("Sukses", `Pasien ${name} berhasil di tambahkan`);
      }
      setIsModalOpen(false);
      fetchPatients();
    } catch (error: any) {
      const message = error.response?.data?.message || "Gagal menyimpan data pasien";
      Alert.alert("error", message);
    }
  };

  const handleDeletePatient = async (id: number, name: string) => {
    Alert.alert("Konfirmasi Hapus", `Apakah kamu yakin ingin hapus pasien ${name}`, [
      { text: "Batal", style: "cancel" },
      {
        text: "hapus",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePatientService(id);
            Alert.alert("Sukses", `Data pasien ${name} berhasil di hapus`);
            await fetchPatients();
          } catch (error: any) {
            const message = error.response?.data?.message || "Gagal menghapus data pasien";
            Alert.alert("Error", message);
          }
        },
      },
    ]);
  };

  // Filter Data Pasien
  const filteredPatients = patients.filter((patient) => {
    if (genderFilter !== "ALL" && patient.gender !== genderFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = patient.name.toLowerCase().includes(q);
      const matchNoRm = patient.noRm.toLowerCase().includes(q);
      const matchPhone = patient.phone ? patient.phone.includes(q) : false;
      return matchName || matchNoRm || matchPhone;
    }
    return true;
  });

  const countMale = patients.filter((p) => p.gender === "MALE").length;
  const countFemale = patients.filter((p) => p.gender === "FEMALE").length;

  return (
    <SafeAreaView className="flex-1 bg-[#f4f3ed]" edges={["top", "left", "right", "bottom"]}>
      {/* Top Header */}
      <View className="bg-[#f4f3ed] border-b-2 border-[#18181b] px-5 py-3.5 flex-row items-center justify-between">
        <View>
          <View className="bg-[#38bdf8] border-2 border-[#18181b] px-2 py-0.5 self-start mb-1">
            <Text className="text-[9px] font-black text-[#18181b] tracking-wider uppercase">
              MASTER DATA
            </Text>
          </View>
          <Text className="text-2xl font-black text-[#18181b] tracking-tight">DATA PASIEN</Text>
        </View>

        {/* Tombol Tambah Pasien Baru */}
        <TouchableOpacity
          className="bg-[#a3e635] border-2 border-[#18181b] px-3.5 py-2 rounded-xl flex-row items-center active:bg-lime-400"
          activeOpacity={0.85}
          onPress={openCreateModal}
        >
          <Ionicons name="person-add" size={16} color="#18181b" style={{ marginRight: 6 }} />
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
            onRefresh={fetchPatients}
            colors={["#18181b"]}
            tintColor="#18181b"
          />
        }
      >
        {/* Quick Stats Grid */}
        <View className="flex-row gap-3 mb-4">
          {/* Total Pasien */}
          <View className="flex-1 relative">
            <View className="absolute top-1 left-1 -right-1 -bottom-1 bg-[#18181b] rounded-xl" />
            <View className="bg-white border-2 border-[#18181b] rounded-xl p-3">
              <View className="flex-row items-center gap-1.5 mb-1">
                <Ionicons name="people" size={14} color="#18181b" />
                <Text className="text-[10px] font-black text-[#18181b] uppercase">TOTAL</Text>
              </View>
              <Text className="text-xl font-black text-[#18181b]">{patients.length}</Text>
            </View>
          </View>

          {/* Laki-Laki */}
          <View className="flex-1 relative">
            <View className="absolute top-1 left-1 -right-1 -bottom-1 bg-[#18181b] rounded-xl" />
            <View className="bg-[#bae6fd] border-2 border-[#18181b] rounded-xl p-3">
              <View className="flex-row items-center gap-1.5 mb-1">
                <Ionicons name="man" size={14} color="#18181b" />
                <Text className="text-[10px] font-black text-[#18181b] uppercase">PRIA</Text>
              </View>
              <Text className="text-xl font-black text-[#18181b]">{countMale}</Text>
            </View>
          </View>

          {/* Perempuan */}
          <View className="flex-1 relative">
            <View className="absolute top-1 left-1 -right-1 -bottom-1 bg-[#18181b] rounded-xl" />
            <View className="bg-[#fbcfe8] border-2 border-[#18181b] rounded-xl p-3">
              <View className="flex-row items-center gap-1.5 mb-1">
                <Ionicons name="woman" size={14} color="#18181b" />
                <Text className="text-[10px] font-black text-[#18181b] uppercase">WANITA</Text>
              </View>
              <Text className="text-xl font-black text-[#18181b]">{countFemale}</Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View className="relative mb-3">
          <View className="absolute top-1 left-1 -right-1 -bottom-1 bg-[#18181b] rounded-xl" />
          <View className="bg-white border-2 border-[#18181b] rounded-xl px-3.5 h-12 flex-row items-center">
            <Ionicons name="search-outline" size={18} color="#18181b" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Cari nama pasien / No. RM / HP..."
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

        {/* Gender Filter Pills */}
        <View className="flex-row gap-2 mb-4">
          <TouchableOpacity
            className={`px-3 py-1.5 rounded-lg border-2 border-[#18181b] ${
              genderFilter === "ALL" ? "bg-[#18181b]" : "bg-white"
            }`}
            activeOpacity={0.8}
            onPress={() => setGenderFilter("ALL")}
          >
            <Text
              className={`text-xs font-black ${
                genderFilter === "ALL" ? "text-white" : "text-[#18181b]"
              }`}
            >
              Semua
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`px-3 py-1.5 rounded-lg border-2 border-[#18181b] ${
              genderFilter === "MALE" ? "bg-[#18181b]" : "bg-white"
            }`}
            activeOpacity={0.8}
            onPress={() => setGenderFilter("MALE")}
          >
            <Text
              className={`text-xs font-black ${
                genderFilter === "MALE" ? "text-white" : "text-[#18181b]"
              }`}
            >
              Laki-laki
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`px-3 py-1.5 rounded-lg border-2 border-[#18181b] ${
              genderFilter === "FEMALE" ? "bg-[#18181b]" : "bg-white"
            }`}
            activeOpacity={0.8}
            onPress={() => setGenderFilter("FEMALE")}
          >
            <Text
              className={`text-xs font-black ${
                genderFilter === "FEMALE" ? "text-white" : "text-[#18181b]"
              }`}
            >
              Perempuan
            </Text>
          </TouchableOpacity>
        </View>

        {/* Loading Indicator */}
        {loading && patients.length === 0 && (
          <View className="py-12 items-center justify-center">
            <ActivityIndicator size="large" color="#18181b" />
            <Text className="text-xs font-bold text-[#71717a] mt-3">Memuat data pasien...</Text>
          </View>
        )}

        {/* Empty State */}
        {!loading && filteredPatients.length === 0 && (
          <View className="relative mt-4">
            <View className="absolute top-1.5 left-1.5 -right-1.5 -bottom-1.5 bg-[#18181b] rounded-2xl" />
            <View className="bg-white border-2 border-[#18181b] rounded-2xl p-8 items-center justify-center">
              <View className="w-14 h-14 bg-[#f4f3ed] border-2 border-[#18181b] rounded-full items-center justify-center mb-3">
                <Ionicons name="people-outline" size={26} color="#71717a" />
              </View>
              <Text className="text-base font-black text-[#18181b] mb-1">
                Tidak Ada Pasien Ditemukan
              </Text>
              <Text className="text-xs font-medium text-[#71717a] text-center mb-4">
                {searchQuery
                  ? "Coba kata kunci pencarian yang lain."
                  : "Belum ada master data pasien terdaftar."}
              </Text>
              <TouchableOpacity
                className="bg-[#a3e635] border-2 border-[#18181b] px-4 py-2 rounded-xl"
                onPress={openCreateModal}
              >
                <Text className="text-xs font-black text-[#18181b]">TAMBAH PASIEN BARU</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Patient Cards List */}
        <View className="gap-y-3">
          {filteredPatients.map((patient) => (
            <View key={patient.id} className="relative">
              <View className="absolute top-1.5 left-1.5 -right-1.5 -bottom-1.5 bg-[#18181b] rounded-2xl" />
              <View className="bg-white border-2 border-[#18181b] rounded-2xl p-4">
                {/* Header Card: No RM & Gender Badge */}
                <View className="flex-row items-center justify-between mb-2">
                  <View className="bg-[#a3e635] border-2 border-[#18181b] px-2.5 py-0.5 rounded-md">
                    <Text className="text-[11px] font-black text-[#18181b]">{patient.noRm}</Text>
                  </View>

                  <View className="flex-row items-center gap-1.5">
                    <View
                      className={`px-2 py-0.5 rounded-md border border-[#18181b] ${
                        patient.gender === "MALE" ? "bg-[#bae6fd]" : "bg-[#fbcfe8]"
                      }`}
                    >
                      <Text className="text-[10px] font-black text-[#18181b]">
                        {patient.gender === "MALE" ? "Laki-laki" : "Perempuan"}
                      </Text>
                    </View>
                    <View className="bg-[#f4f3ed] px-2 py-0.5 rounded-md border border-[#18181b]">
                      <Text className="text-[10px] font-black text-[#18181b]">
                        {patient.age} Tahun
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Patient Name */}
                <Text className="text-lg font-black text-[#18181b] mb-2">{patient.name}</Text>

                {/* Contact & Address Details */}
                <View className="gap-y-1.5 mb-3 bg-[#f4f3ed] p-2.5 rounded-xl border border-[#18181b]">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="call-outline" size={13} color="#18181b" />
                    <Text className="text-xs font-bold text-[#18181b]">
                      {patient.phone || "Tidak ada nomor HP"}
                    </Text>
                  </View>
                  <View className="flex-row items-start gap-2">
                    <Ionicons
                      name="location-outline"
                      size={13}
                      color="#18181b"
                      style={{ marginTop: 2 }}
                    />
                    <Text className="text-xs font-medium text-[#52525b] flex-1">
                      {patient.address || "Alamat belum dilengkapi"}
                    </Text>
                  </View>
                </View>

                {/* Actions Row */}
                <View className="flex-row items-center justify-between pt-2 border-t border-zinc-200">
                  {/* Tombol Rekam Medis */}
                  <TouchableOpacity
                    className="bg-[#bae6fd] border-2 border-[#18181b] px-2.5 py-1.5 rounded-lg flex-row items-center active:bg-sky-300"
                    activeOpacity={0.8}
                    onPress={() => openHistoryModal(patient)}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={14}
                      color="#18181b"
                      style={{ marginRight: 4 }}
                    />
                    <Text className="text-xs font-black text-[#18181b]">REKAM MEDIS</Text>
                  </TouchableOpacity>

                  <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                      className="bg-white border-2 border-[#18181b] px-3 py-1.5 rounded-lg flex-row items-center active:bg-zinc-100"
                      activeOpacity={0.8}
                      onPress={() => openEditModal(patient)}
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
                      className="bg-[#f43f5e] border-2 border-[#18181b] px-3 py-1.5 rounded-lg flex-row items-center active:bg-rose-600"
                      activeOpacity={0.8}
                      onPress={() => handleDeletePatient(patient.id, patient.name)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={14}
                        color="#ffffff"
                        style={{ marginRight: 4 }}
                      />
                      <Text className="text-xs font-black text-white">HAPUS</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Modal Form Tambah / Edit Pasien (UI Only) */}
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
                  {editingPatient ? "Edit Pasien" : "Tambah Pasien Baru"}
                </Text>
                <Text className="text-xs font-medium text-[#71717a]">
                  Formulir identitas & rekam medis pasien
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
              {/* Nama Lengkap */}
              <View className="mb-3">
                <Text className="text-xs font-black text-[#18181b] uppercase mb-1.5">
                  Nama Lengkap *
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Contoh: Budi Santoso"
                  placeholderTextColor="#a1a1aa"
                  className="bg-[#f4f3ed] border-2 border-[#18181b] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#18181b]"
                />
              </View>

              {/* Jenis Kelamin */}
              <View className="mb-3">
                <Text className="text-xs font-black text-[#18181b] uppercase mb-1.5">
                  Jenis Kelamin *
                </Text>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    className={`flex-1 py-2.5 rounded-xl border-2 border-[#18181b] items-center ${
                      gender === "MALE" ? "bg-[#38bdf8]" : "bg-white"
                    }`}
                    onPress={() => setGender("MALE")}
                  >
                    <Text className="text-xs font-black text-[#18181b]">Laki-laki</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`flex-1 py-2.5 rounded-xl border-2 border-[#18181b] items-center ${
                      gender === "FEMALE" ? "bg-[#fbcfe8]" : "bg-white"
                    }`}
                    onPress={() => setGender("FEMALE")}
                  >
                    <Text className="text-xs font-black text-[#18181b]">Perempuan</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Usia & Nomor HP */}
              <View className="flex-row gap-3 mb-3">
                <View className="flex-1">
                  <Text className="text-xs font-black text-[#18181b] uppercase mb-1.5">
                    Usia (Tahun) *
                  </Text>
                  <TextInput
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                    placeholder="Contoh: 28"
                    placeholderTextColor="#a1a1aa"
                    className="bg-[#f4f3ed] border-2 border-[#18181b] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#18181b]"
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-xs font-black text-[#18181b] uppercase mb-1.5">
                    No. Telepon / WA
                  </Text>
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    placeholder="08123456789"
                    placeholderTextColor="#a1a1aa"
                    className="bg-[#f4f3ed] border-2 border-[#18181b] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#18181b]"
                  />
                </View>
              </View>

              {/* Alamat */}
              <View className="mb-5">
                <Text className="text-xs font-black text-[#18181b] uppercase mb-1.5">
                  Alamat Tinggal
                </Text>
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Jl. Merdeka No. 12, Jakarta"
                  placeholderTextColor="#a1a1aa"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  className="bg-[#f4f3ed] border-2 border-[#18181b] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#18181b]"
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
                  onPress={handleSavePatient}
                >
                  <Text className="text-xs font-black text-[#18181b]">
                    {editingPatient ? "SIMPAN PERUBAHAN" : "TAMBAH PASIEN"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Riwayat Rekam Medis Pasien */}
      <PatientHistoryModal
        visible={isHistoryModalOpen}
        patient={selectedPatientForHistory}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      {/* Persistent BottomNav with 'patients' active tab */}
      <BottomNav activeTab="patients" />
    </SafeAreaView>
  );
}
