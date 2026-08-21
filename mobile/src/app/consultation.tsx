import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import BottomNav from "../components/BottomNav";
import { useVisitStore } from "../stores/visitStore";
import { useMedicineStore } from "../stores/medicineStore";
import { createConsultationService } from "../services/consulService";
import { createInvoiceService } from "../services/invoiceService";
import { formatRupiah } from "../utils/formatRupiah";

export default function ConsultationScreen() {
  // cari kunjungan id tertentu
  const { visitId } = useLocalSearchParams();
  const visits = useVisitStore((state) => state.visits);
  const selectedVisit = visits.find((item) => item.id === Number(visitId));

  const { medicines, fetchMedicines } = useMedicineStore();

  useEffect(() => {
    fetchMedicines();
  }, []);

  // Form Rekam Medis States
  const [complaint, setComplaint] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");

  // untuk handle submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fetchVisits = useVisitStore((state) => state.fetchVisits);

  // Modal & Add Medicine Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedId, setSelectedMedId] = useState<number | null>(null);
  const [qty, setQty] = useState("1");
  const [dosage, setDosage] = useState("3x1 tablet sesudah makan");

  // Prescribed Medicines list in current consultation
  const [prescribedMedicines, setPrescribedMedicines] = useState<any[]>([]);

  // handle add medicine di konsul
  const handleAddMedicine = () => {
    if (!selectedMedId) {
      Alert.alert("Perhatikan", "Silahkan pilih salah satu obat dari daftar clinic");
      return;
    }

    const numQty = Number(qty);
    if (isNaN(numQty) || numQty <= 0) {
      Alert.alert("Perhatian", "Jumlah kuantiti obat minimal 1!");
      return;
    }

    // cari detail obat dari daftar
    const selectedMed = medicines.find((m) => m.id === selectedMedId);
    if (!selectedMed) return;

    // cek sisa stok
    if (numQty > selectedMed.stock) {
      Alert.alert(
        "Stok tidak cukup",
        `Sisa stok ${selectedMed.name} hanya ${selectedMed.stock} ${selectedMed.unit}`
      );
      return;
    }

    if (!dosage.trim()) {
      Alert.alert("Perhatian", "Aturan pakai / instruksi wajib di isi");
      return;
    }

    // Buat object obat resep baru
    const newItem = {
      id: selectedMed.id,
      medicineId: selectedMed.id,
      name: selectedMed.name,
      price: selectedMed.price,
      qty: numQty,
      dosage: dosage.trim(),
    };

    // masukkan ke array, jika obat sudah ada update datanya
    setPrescribedMedicines((prev) => {
      const exist = prev.find((item) => item.medicineId === selectedMed.id);
      if (exist) {
        return prev.map((item) => (item.medicineId === selectedMed.id ? newItem : item));
      }
      return [...prev, newItem];
    });

    // reset input modal dan tutup popup nya
    setSelectedMedId(null);
    setQty("1");
    setDosage("3x1 Tablet sesudah Makan");
    setIsModalOpen(false);
  };

  // fungsi hapus obat dari daftar resep
  const handleDeleteMedicine = (medicineId: number) => {
    setPrescribedMedicines((prev) => prev.filter((item) => item.medicineId !== medicineId));
  };

  const handleSubmitConsultation = async () => {
    // validasi
    if (!complaint.trim()) {
      Alert.alert("Keluhan Utama pasien wajib diisi!");
      return;
    }
    if (!diagnosis.trim()) {
      Alert.alert("Diagnosa dokter wajib diisi!");
      return;
    }

    try {
      // kunci tombol, mencegah double klik atau auto spam
      setIsSubmitting(true);
      // kemas payload nya sesuai format backend kita
      const payload = {
        visitId: Number(visitId),
        complaint: complaint.trim(),
        diagnosis: diagnosis.trim(),
        notes: notes.trim() || undefined,
        medicine: prescribedMedicines.map((item) => ({
          medicineId: item.medicineId,
          qty: item.qty,
          instructions: item.dosage,
        })),
      };

      // kirim ke server backend
      await createConsultationService(payload);
      await createInvoiceService({ visitId: Number(visitId) });

      // refresh data antrean pasien di zustand store
      await fetchVisits();

      // beri notifikasi dan arahkan ke layar kasir / antrian
      Alert.alert("Sukses", "Konsul / Pemeriksaan Selesai dan rekam medis berhasil di simpan!", [
        {
          text: "Menuju Pembayaran",
          onPress: () => router.replace({ pathname: "/invoice", params: { visitId } }),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Gagal menyimpan",
        error?.response?.data?.message || "Terjadi keselahan saat menyimpan rekam medis"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedTime = selectedVisit?.checkInTime
    ? new Date(selectedVisit.checkInTime).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "08:00 WIB";

  return (
    <SafeAreaView className="flex-1 bg-[#f4f3ed]" edges={["top", "left", "right"]}>
      {/* 1. Header App Bar */}
      <View className="bg-[#f4f3ed] border-b-2 border-[#18181b] px-5 py-3.5 flex-row items-center justify-between">
        <View>
          <View className="bg-[#a3e635] border-2 border-[#18181b] px-2 py-0.5 self-start mb-1">
            <Text className="text-[9px] font-black text-[#18181b] tracking-wider uppercase">
              REKAM MEDIS PASIEN
            </Text>
          </View>
          <Text className="text-2xl font-black text-[#18181b] tracking-tight">
            KONSULTASI DOKTER
          </Text>
        </View>
        <TouchableOpacity
          className="bg-white border-2 border-[#18181b] rounded-xl w-10 h-10 justify-center items-center active:bg-zinc-100"
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back-outline" size={20} color="#18181b" />
        </TouchableOpacity>
      </View>

      {/* 2. Scrollable Content Form */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Card: Ringkasan Pasien & Dokter */}
        <View className="relative mb-5">
          <View className="absolute top-1.5 left-1.5 -right-1.5 -bottom-1.5 bg-[#18181b] rounded-2xl" />
          <View className="bg-white border-2 border-[#18181b] rounded-2xl p-4">
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center gap-2">
                <View className="bg-[#fde047] border-2 border-[#18181b] px-2.5 py-0.5 rounded-md">
                  <Text
                    style={{ fontFamily: Platform.OS === "ios" ? "Courier" : "monospace" }}
                    className="text-xs font-black text-[#18181b]"
                  >
                    {`A-${String(selectedVisit?.queueNumber || 0).padStart(2, "0")}`}
                  </Text>
                </View>
                <View className="bg-[#38bdf8] border-2 border-[#18181b] px-2 py-0.5 rounded-md">
                  <Text className="text-[10px] font-black text-[#18181b] uppercase">DIPERIKSA</Text>
                </View>
              </View>
              <View className="flex-row items-center gap-1">
                <Ionicons name="time-outline" size={13} color="#71717a" />
                <Text className="text-xs font-bold text-[#71717a]">{formattedTime}</Text>
              </View>
            </View>

            <Text className="text-lg font-black text-[#18181b] uppercase tracking-tight">
              {selectedVisit?.patient?.name || "Nama Pasien"}
            </Text>
            <Text className="text-xs font-semibold text-[#71717a] mt-0.5">
              {selectedVisit?.patient?.noRm} •{" "}
              {selectedVisit?.patient?.gender === "MALE" ? "Laki-laki" : "Perempuan"} (
              {selectedVisit?.patient?.age} th)
            </Text>

            <View className="h-[1px] bg-zinc-200 my-3" />

            <View className="flex-row items-center">
              <Ionicons name="medkit-outline" size={16} color="#18181b" />
              <View className="ml-2 flex-1">
                <Text className="text-xs font-black text-[#18181b]">
                  {selectedVisit?.doctor?.name}
                </Text>
                <Text className="text-[10px] font-semibold text-[#71717a]">
                  {selectedVisit?.doctor?.spesialis}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section: Formulir Rekam Medis Utama */}
        <View className="relative mb-5">
          <View className="absolute top-1.5 left-1.5 -right-1.5 -bottom-1.5 bg-[#18181b] rounded-2xl" />
          <View className="bg-white border-2 border-[#18181b] rounded-2xl p-4">
            <View className="flex-row items-center gap-2 mb-4 pb-2 border-b-2 border-[#18181b]/10">
              <Ionicons name="document-text-outline" size={18} color="#18181b" />
              <Text className="text-sm font-black text-[#18181b] uppercase tracking-wide">
                DIAGNOSA & CATATAN MEDIS
              </Text>
            </View>

            {/* 1. Keluhan Pasien */}
            <View className="mb-4">
              <Text className="text-[11px] font-black text-[#18181b] uppercase tracking-wider mb-1.5">
                KELUHAN UTAMA PASIEN *
              </Text>
              <View className="bg-[#f4f3ed] border-2 border-[#18181b] rounded-xl p-3">
                <TextInput
                  placeholder="Tuliskan keluhan atau gejala yang dirasakan pasien..."
                  placeholderTextColor="#a1a1aa"
                  multiline
                  numberOfLines={3}
                  value={complaint}
                  onChangeText={setComplaint}
                  className="text-xs font-bold text-[#18181b] text-top"
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* 2. Diagnosa Dokter */}
            <View className="mb-4">
              <Text className="text-[11px] font-black text-[#18181b] uppercase tracking-wider mb-1.5">
                DIAGNOSA DOKTER *
              </Text>
              <View className="bg-[#f4f3ed] border-2 border-[#18181b] rounded-xl p-3">
                <TextInput
                  placeholder="Contoh: Faringitis Akut (J02.9) / Demam Dengue..."
                  placeholderTextColor="#a1a1aa"
                  value={diagnosis}
                  onChangeText={setDiagnosis}
                  className="text-xs font-bold text-[#18181b]"
                />
              </View>
            </View>

            {/* 3. Tindakan & Anjuran */}
            <View className="mb-4">
              <Text className="text-[11px] font-black text-[#18181b] uppercase tracking-wider mb-1.5">
                TINDAKAN / ANJURAN DOKTER
              </Text>
              <View className="bg-[#f4f3ed] border-2 border-[#18181b] rounded-xl p-3">
                <TextInput
                  placeholder="Anjuran istirahat, pantangan makanan, atau rencana kontrol..."
                  placeholderTextColor="#a1a1aa"
                  multiline
                  numberOfLines={3}
                  value={notes}
                  onChangeText={setNotes}
                  className="text-xs font-bold text-[#18181b] text-top"
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* 4. Biaya Jasa Dokter */}
            <View>
              <Text className="text-[11px] font-black text-[#18181b] uppercase tracking-wider mb-1.5">
                BIAYA KONSULTASI (JASA DOKTER)
              </Text>
              <View className="bg-[#f4f3ed] border-2 border-[#18181b] rounded-xl px-3.5 h-11 flex-row items-center justify-between">
                <Text className="text-xs font-bold text-[#52525b]">Tarif Dokter</Text>
                <Text className="text-xs font-black text-[#18181b]">
                  {formatRupiah(Number(selectedVisit?.doctor?.fee || 0))}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section: Resep Obat Pasien */}
        <View className="relative mb-6">
          <View className="absolute top-1.5 left-1.5 -right-1.5 -bottom-1.5 bg-[#18181b] rounded-2xl" />
          <View className="bg-white border-2 border-[#18181b] rounded-2xl p-4">
            <View className="flex-row justify-between items-center mb-3 pb-2 border-b-2 border-[#18181b]/10">
              <View className="flex-row items-center gap-2">
                <Ionicons name="medical-outline" size={18} color="#18181b" />
                <Text className="text-sm font-black text-[#18181b] uppercase tracking-wide">
                  RESEP OBAT PASIEN
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsModalOpen(true)}
                className="bg-[#a3e635] border-2 border-[#18181b] px-3 py-1 rounded-lg flex-row items-center active:bg-lime-400"
                activeOpacity={0.85}
              >
                <Ionicons name="add" size={14} color="#18181b" style={{ marginRight: 2 }} />
                <Text className="text-[10px] font-black text-[#18181b] uppercase">TAMBAH</Text>
              </TouchableOpacity>
            </View>

            {/* List Obat yang Diresepkan */}
            {prescribedMedicines.length === 0 ? (
              <View className="p-4 items-center justify-center bg-[#f4f3ed] rounded-xl border border-dashed border-zinc-400">
                <Text className="text-xs font-bold text-[#71717a]">
                  Belum ada obat yang diresepkan.
                </Text>
              </View>
            ) : (
              <View className="gap-y-2.5">
                {prescribedMedicines.map((med) => (
                  <View
                    key={med.id}
                    className="bg-[#f4f3ed] border-2 border-[#18181b] rounded-xl p-3"
                  >
                    <View className="flex-row justify-between items-start mb-1.5">
                      <View className="flex-1 mr-2">
                        <Text className="text-xs font-black text-[#18181b]">{med.name}</Text>
                        <Text className="text-[11px] font-semibold text-[#52525b] mt-0.5">
                          {formatRupiah(med.price)} / Strip
                        </Text>
                      </View>
                      <TouchableOpacity
                        className="p-1 rounded-md active:bg-rose-100"
                        activeOpacity={0.7}
                        onPress={() => handleDeleteMedicine(med.medicineId)}
                      >
                        <Ionicons name="trash-outline" size={16} color="#f43f5e" />
                      </TouchableOpacity>
                    </View>

                    <View className="flex-row justify-between items-center pt-2 border-t border-zinc-200 mt-1">
                      <View className="flex-1 mr-3">
                        <Text className="text-[10px] font-black text-[#71717a] uppercase mb-0.5">
                          Aturan Pakai
                        </Text>
                        <Text className="text-xs font-bold text-[#18181b]">{med.dosage}</Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-[10px] font-black text-[#71717a] uppercase mb-0.5">
                          Jumlah
                        </Text>
                        <Text className="text-xs font-black text-[#18181b]">{med.qty}x</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* 3. Tombol Eksekusi Simpan Rekam Medis */}
        <View className="relative mb-8">
          <View className="absolute top-1.5 left-1.5 -right-1.5 -bottom-1.5 bg-[#18181b] rounded-2xl" />
          <TouchableOpacity
            onPress={handleSubmitConsultation}
            disabled={isSubmitting}
            activeOpacity={isSubmitting ? 1 : 0.85}
            style={{ backgroundColor: isSubmitting ? "#e4e4e7" : "#a3e635" }}
            className="border-2 border-[#18181b] rounded-2xl h-14 flex-row justify-center items-center"
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#18181b" style={{ marginRight: 10 }} />
            ) : (
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#18181b"
                style={{ marginRight: 8 }}
              />
            )}
            <Text className="text-sm font-black text-[#18181b] tracking-wider uppercase">
              {isSubmitting ? "MENYIMPAN DATA..." : "SIMPAN & SELESAIKAN PERIKSA"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 5. MODAL TAMBAH OBAT (Eco-Neubrutalism UI Layout) */}
      <Modal
        visible={isModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View className="relative w-full max-w-sm">
            {/* Hard drop shadow */}
            <View className="absolute top-2 left-2 -right-2 -bottom-2 bg-[#18181b] rounded-3xl" />

            <View className="bg-white border-2 border-[#18181b] rounded-3xl overflow-hidden">
              {/* Modal Header */}
              <View className="bg-[#a3e635] border-b-2 border-[#18181b] p-4 flex-row justify-between items-center">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="medical" size={18} color="#18181b" />
                  <Text className="text-base font-black text-[#18181b] uppercase">
                    PILIH RESEP OBAT
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsModalOpen(false)}
                  className="bg-white border-2 border-[#18181b] rounded-lg p-1"
                >
                  <Ionicons name="close" size={18} color="#18181b" />
                </TouchableOpacity>
              </View>

              {/* Modal Body Form */}
              <View className="p-4 gap-y-4">
                {/* 1. Pilih Obat Tersedia */}
                <View>
                  <Text className="text-[11px] font-black text-[#18181b] uppercase mb-1.5">
                    PILIH OBAT APOTEK *
                  </Text>
                  <ScrollView
                    className="max-h-36 border-2 border-[#18181b] rounded-xl bg-[#f4f3ed] p-1.5"
                    nestedScrollEnabled
                  >
                    {medicines.map((m) => {
                      const isSelected = selectedMedId === m.id;
                      return (
                        <TouchableOpacity
                          key={m.id}
                          onPress={() => setSelectedMedId(m.id)}
                          className={`p-2.5 rounded-lg border mb-1.5 flex-row justify-between items-center ${
                            isSelected
                              ? "bg-[#18181b] border-[#18181b]"
                              : "bg-white border-zinc-200"
                          }`}
                        >
                          <View className="flex-1 mr-2">
                            <Text
                              className={`text-xs font-black ${isSelected ? "text-white" : "text-[#18181b]"}`}
                            >
                              {m.name}
                            </Text>
                            <Text
                              className={`text-[10px] font-bold ${isSelected ? "text-zinc-300" : "text-[#71717a]"}`}
                            >
                              Stok: {m.stock} {m.unit}
                            </Text>
                          </View>
                          <Text
                            className={`text-xs font-black ${isSelected ? "text-[#a3e635]" : "text-emerald-700"}`}
                          >
                            {formatRupiah(m.price)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* 2. Jumlah / Qty */}
                <View>
                  <Text className="text-[11px] font-black text-[#18181b] uppercase mb-1.5">
                    JUMLAH (QTY) *
                  </Text>
                  <View className="bg-[#f4f3ed] border-2 border-[#18181b] rounded-xl px-3.5 h-11 justify-center">
                    <TextInput
                      keyboardType="numeric"
                      placeholder="Contoh: 10"
                      placeholderTextColor="#a1a1aa"
                      value={qty}
                      onChangeText={setQty}
                      className="text-xs font-bold text-[#18181b]"
                    />
                  </View>
                </View>

                {/* 3. Dosis / Aturan Pakai */}
                <View>
                  <Text className="text-[11px] font-black text-[#18181b] uppercase mb-1.5">
                    INSTRUKSI / ATURAN PAKAI *
                  </Text>
                  <View className="bg-[#f4f3ed] border-2 border-[#18181b] rounded-xl px-3.5 h-11 justify-center">
                    <TextInput
                      placeholder="Contoh: 3x1 tablet sesudah makan"
                      placeholderTextColor="#a1a1aa"
                      value={dosage}
                      onChangeText={setDosage}
                      className="text-xs font-bold text-[#18181b]"
                    />
                  </View>
                </View>

                {/* Modal Action Buttons */}
                <View className="flex-row gap-2 pt-2">
                  <TouchableOpacity
                    onPress={() => setIsModalOpen(false)}
                    className="flex-1 bg-white border-2 border-[#18181b] rounded-xl h-11 justify-center items-center active:bg-zinc-100"
                  >
                    <Text className="text-xs font-black text-[#18181b] uppercase">BATAL</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleAddMedicine()}
                    className="flex-1 bg-[#a3e635] border-2 border-[#18181b] rounded-xl h-11 justify-center items-center active:bg-lime-400"
                  >
                    <Text className="text-xs font-black text-[#18181b] uppercase">TAMBAHKAN</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* 4. Bottom Nav */}
      <BottomNav activeTab="queue" />
    </SafeAreaView>
  );
}
