import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useDoctorStore } from "../stores/doctorStore";
import { usePatientStore } from "../stores/patientStore";
import { useVisitStore } from "../stores/visitStore";
import { createVisitService } from "../services/visitService";
import { formatRupiah } from "../utils/formatRupiah";

interface CreateVisitModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function CreateVisitModal({ visible, onClose }: CreateVisitModalProps) {
  const { doctors, loading: loadingDoctors, fetchDoctors } = useDoctorStore();
  const { patients, loading: loadingPatients, fetchPatients } = usePatientStore();
  const fetchVisits = useVisitStore((state) => state.fetchVisits);

  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [searchPatient, setSearchPatient] = useState<string>("");
  const [showSearchPatient, setShowSearchPatient] = useState<boolean>(false);
  const [searchDoctor, setSearchDoctor] = useState<string>("");
  const [showSearchDoctor, setShowSearchDoctor] = useState<boolean>(false);

  // tarik data nya ketika modal di buka
  useEffect(() => {
    if (visible) {
      fetchDoctors();
      fetchPatients();
      setSearchPatient("");
      setShowSearchPatient(false);
      setSearchDoctor("");
      setShowSearchDoctor(false);
    }
  }, [visible]);

  // hanya doctor yang aktif yang ada
  const activeDoctors = doctors.filter((doc) => doc.isActive);

  // Filter Data
  const filteredPatients = patients.filter((p) => {
    if (!searchPatient.trim()) return true;
    const q = searchPatient.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.noRm.toLowerCase().includes(q);
  });

  const filteredDoctors = activeDoctors.filter((d) => {
    if (!searchDoctor.trim()) return true;
    const q = searchDoctor.toLowerCase();
    return d.name.toLowerCase().includes(q) || d.spesialis.toLowerCase().includes(q);
  });

  // form state
  const handleCreateVisit = async () => {
    if (!selectedDoctorId || !selectedPatientId) {
      Alert.alert("Perhatian", "Harap pilih pasien dan dokter tujuan terlebih dahulu!");
      return;
    }
    try {
      await createVisitService({
        patientId: selectedPatientId,
        doctorId: selectedDoctorId,
      });

      await fetchVisits();

      setSelectedPatientId(null);
      setSelectedDoctorId(null);
      onClose();
      Alert.alert("Sukses", "Antrian pasien berhasil didaftarkan");
    } catch (error: any) {
      Alert.alert("Gagal", error?.response?.data?.message || "Gagal membuat antrean");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-center items-center px-4">
        <View className="relative w-full max-w-sm">
          {/* Hard Drop Shadow Neubrutalism */}
          <View className="absolute top-2 left-2 -right-2 -bottom-2 bg-[#18181b] rounded-3xl" />

          {/* Modal Container */}
          <View className="bg-[#f4f3ed] border-2 border-[#18181b] rounded-3xl overflow-hidden">
            {/* Header Modal */}
            <View className="bg-[#a3e635] border-b-2 border-[#18181b] p-4 flex-row justify-between items-center">
              <View className="flex-row items-center gap-2">
                <Ionicons name="calendar" size={18} color="#18181b" />
                <Text className="text-sm font-black text-[#18181b] uppercase tracking-wide">
                  DAFTAR ANTREAN BARU
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.8}
                className="bg-white border-2 border-[#18181b] rounded-lg p-1"
              >
                <Ionicons name="close" size={18} color="#18181b" />
              </TouchableOpacity>
            </View>

            {/* Content Form Scrollable */}
            <View className="p-4 gap-y-4">
              {/* 1. Pilih Pasien */}
              <View>
                <View className="flex-row justify-between items-center mb-1.5">
                  <Text className="text-[11px] font-black text-[#18181b] uppercase tracking-wider">
                    1. PILIH PASIEN *
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setShowSearchPatient(!showSearchPatient);
                      if (showSearchPatient) setSearchPatient("");
                    }}
                    className={`border border-[#18181b] px-2 py-0.5 rounded flex-row items-center gap-1 ${
                      showSearchPatient || searchPatient ? "bg-[#18181b]" : "bg-white"
                    }`}
                  >
                    <Ionicons
                      name="search"
                      size={10}
                      color={showSearchPatient || searchPatient ? "#ffffff" : "#18181b"}
                    />
                    <Text
                      className={`text-[9px] font-black uppercase ${
                        showSearchPatient || searchPatient ? "text-white" : "text-[#18181b]"
                      }`}
                    >
                      {searchPatient ? "FILTER" : "CARI"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Input Search Pasien Muncul saat Tombol Cari Ditekan */}
                {showSearchPatient && (
                  <View className="bg-white border-2 border-[#18181b] rounded-lg px-2.5 py-1 flex-row items-center mb-1.5">
                    <Ionicons name="search-outline" size={12} color="#71717a" style={{ marginRight: 4 }} />
                    <TextInput
                      placeholder="Ketik nama pasien / No RM..."
                      placeholderTextColor="#a1a1aa"
                      value={searchPatient}
                      onChangeText={setSearchPatient}
                      className="flex-1 text-xs font-bold text-[#18181b] p-0"
                      autoFocus
                    />
                    {searchPatient.length > 0 && (
                      <TouchableOpacity onPress={() => setSearchPatient("")}>
                        <Ionicons name="close-circle" size={14} color="#71717a" />
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                <ScrollView
                  className="max-h-36 border-2 border-[#18181b] rounded-xl bg-white p-1.5"
                  nestedScrollEnabled
                >
                  {loadingPatients ? (
                    <View className="py-4 items-center justify-center">
                      <ActivityIndicator size="small" color="#18181b" />
                      <Text className="text-[10px] font-bold text-[#71717a] mt-1">
                        Memuat pasien...
                      </Text>
                    </View>
                  ) : filteredPatients.length === 0 ? (
                    <View className="py-3 items-center justify-center">
                      <Text className="text-[10px] font-bold text-[#71717a]">
                        Pasien tidak ditemukan.
                      </Text>
                    </View>
                  ) : (
                    filteredPatients.map((patient) => {
                      const isSelected = selectedPatientId === patient.id;
                      return (
                        <TouchableOpacity
                          key={patient.id}
                          onPress={() => setSelectedPatientId(patient.id)}
                          activeOpacity={0.8}
                          className={`p-2.5 rounded-lg border mb-1.5 flex-row justify-between items-center ${
                            isSelected
                              ? "bg-[#18181b] border-[#18181b]"
                              : "bg-[#f4f3ed] border-zinc-200"
                          }`}
                        >
                          <View className="flex-1 mr-2">
                            <Text
                              className={`text-xs font-black uppercase ${
                                isSelected ? "text-white" : "text-[#18181b]"
                              }`}
                            >
                              {patient.name}
                            </Text>
                            <Text
                              className={`text-[10px] font-bold ${
                                isSelected ? "text-zinc-300" : "text-[#71717a]"
                              }`}
                            >
                              {patient.noRm} • {patient.gender === "MALE" ? "Laki-laki" : "Perempuan"} ({patient.age} th)
                            </Text>
                          </View>
                          {isSelected && (
                            <Ionicons name="checkmark-circle" size={16} color="#a3e635" />
                          )}
                        </TouchableOpacity>
                      );
                    })
                  )}
                </ScrollView>
              </View>

              {/* 2. Pilih Dokter */}
              <View>
                <View className="flex-row justify-between items-center mb-1.5">
                  <Text className="text-[11px] font-black text-[#18181b] uppercase tracking-wider">
                    2. PILIH DOKTER TUJUAN *
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setShowSearchDoctor(!showSearchDoctor);
                      if (showSearchDoctor) setSearchDoctor("");
                    }}
                    className={`border border-[#18181b] px-2 py-0.5 rounded flex-row items-center gap-1 ${
                      showSearchDoctor || searchDoctor ? "bg-[#18181b]" : "bg-white"
                    }`}
                  >
                    <Ionicons
                      name="search"
                      size={10}
                      color={showSearchDoctor || searchDoctor ? "#ffffff" : "#18181b"}
                    />
                    <Text
                      className={`text-[9px] font-black uppercase ${
                        showSearchDoctor || searchDoctor ? "text-white" : "text-[#18181b]"
                      }`}
                    >
                      {searchDoctor ? "FILTER" : "CARI"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Input Search Dokter Muncul saat Tombol Cari Ditekan */}
                {showSearchDoctor && (
                  <View className="bg-white border-2 border-[#18181b] rounded-lg px-2.5 py-1 flex-row items-center mb-1.5">
                    <Ionicons name="search-outline" size={12} color="#71717a" style={{ marginRight: 4 }} />
                    <TextInput
                      placeholder="Ketik nama dokter / spesialis..."
                      placeholderTextColor="#a1a1aa"
                      value={searchDoctor}
                      onChangeText={setSearchDoctor}
                      className="flex-1 text-xs font-bold text-[#18181b] p-0"
                      autoFocus
                    />
                    {searchDoctor.length > 0 && (
                      <TouchableOpacity onPress={() => setSearchDoctor("")}>
                        <Ionicons name="close-circle" size={14} color="#71717a" />
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                <ScrollView
                  className="max-h-36 border-2 border-[#18181b] rounded-xl bg-white p-1.5"
                  nestedScrollEnabled
                >
                  {loadingDoctors ? (
                    <View className="py-4 items-center justify-center">
                      <ActivityIndicator size="small" color="#18181b" />
                      <Text className="text-[10px] font-bold text-[#71717a] mt-1">
                        Memuat dokter...
                      </Text>
                    </View>
                  ) : filteredDoctors.length === 0 ? (
                    <View className="py-3 items-center justify-center">
                      <Text className="text-[10px] font-bold text-[#71717a]">
                        Dokter tidak ditemukan / sedang libur.
                      </Text>
                    </View>
                  ) : (
                    filteredDoctors.map((doctor) => {
                      const isSelected = selectedDoctorId === doctor.id;
                      return (
                        <TouchableOpacity
                          key={doctor.id}
                          onPress={() => setSelectedDoctorId(doctor.id)}
                          activeOpacity={0.8}
                          className={`p-2.5 rounded-lg border mb-1.5 flex-row justify-between items-center ${
                            isSelected
                              ? "bg-[#18181b] border-[#18181b]"
                              : "bg-[#f4f3ed] border-zinc-200"
                          }`}
                        >
                          <View className="flex-1 mr-2">
                            <Text
                              className={`text-xs font-black ${
                                isSelected ? "text-white" : "text-[#18181b]"
                              }`}
                            >
                              {doctor.name}
                            </Text>
                            <Text
                              className={`text-[10px] font-bold ${
                                isSelected ? "text-zinc-300" : "text-[#71717a]"
                              }`}
                            >
                              Poli {doctor.spesialis || "Umum"}
                            </Text>
                          </View>
                          <Text
                            className={`text-[11px] font-black ${
                              isSelected ? "text-[#a3e635]" : "text-[#18181b]"
                            }`}
                          >
                            {formatRupiah(doctor.fee)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </ScrollView>
              </View>

              {/* 3. Info Tanggal Kunjungan */}
              <View className="bg-[#fde047] border-2 border-[#18181b] rounded-xl p-3 flex-row justify-between items-center">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="time-outline" size={16} color="#18181b" />
                  <Text className="text-xs font-black text-[#18181b] uppercase">
                    TANGGAL ANTREAN
                  </Text>
                </View>
                <Text className="text-xs font-bold text-[#18181b]">Hari Ini (Otomatis)</Text>
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-2 pt-2">
                <TouchableOpacity
                  onPress={onClose}
                  activeOpacity={0.8}
                  className="flex-1 bg-white border-2 border-[#18181b] rounded-xl h-11 justify-center items-center active:bg-zinc-100"
                >
                  <Text className="text-xs font-black text-[#18181b] uppercase">BATAL</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleCreateVisit}
                  className="flex-1 bg-[#a3e635] border-2 border-[#18181b] rounded-xl h-11 flex-row justify-center items-center active:bg-lime-400"
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={16}
                    color="#18181b"
                    style={{ marginRight: 4 }}
                  />
                  <Text className="text-xs font-black text-[#18181b] uppercase">DAFTARKAN</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
