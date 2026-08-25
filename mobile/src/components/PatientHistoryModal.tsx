import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Patient, Visit } from "../types/clinic";
import { getPatientHistoryService, PatientHistoryResponse } from "../services/patientService";

interface PatientHistoryModalProps {
  visible: boolean;
  patient: Patient | null;
  onClose: () => void;
}

export default function PatientHistoryModal({
  visible,
  patient,
  onClose,
}: PatientHistoryModalProps) {
  const [historyData, setHistoryData] = useState<PatientHistoryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [expandedVisitIds, setExpandedVisitIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (visible && patient) {
      setSearchQuery("");
      fetchHistory(patient.id);
    } else {
      setHistoryData(null);
      setExpandedVisitIds([]);
      setSearchQuery("");
    }
  }, [visible, patient]);

  const fetchHistory = async (id: number) => {
    setLoading(true);
    try {
      const data = await getPatientHistoryService(id);
      setHistoryData(data);
      // Kunjungan paling baru otomatis terbuka (expanded)
      if (data.visits && data.visits.length > 0) {
        setExpandedVisitIds([data.visits[0].id]);
      } else {
        setExpandedVisitIds([]);
      }
    } catch (error) {
      console.log("Error fetch patient history:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleVisitExpand = (visitId: number) => {
    setExpandedVisitIds((prev) =>
      prev.includes(visitId) ? prev.filter((id) => id !== visitId) : [...prev, visitId]
    );
  };

  const filteredVisits = (historyData?.visits || []).filter((v) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const doctorName = v.doctor?.name?.toLowerCase() || "";
    const complaint = v.consultation?.complaint?.toLowerCase() || "";
    const diagnosis = v.consultation?.diagnosis?.toLowerCase() || "";
    const notes = v.consultation?.notes?.toLowerCase() || "";
    const medicines = (v.consultation?.consultationMedicines || [])
      .map((m) => m.medicine?.name?.toLowerCase() || "")
      .join(" ");

    return (
      doctorName.includes(q) ||
      complaint.includes(q) ||
      diagnosis.includes(q) ||
      notes.includes(q) ||
      medicines.includes(q)
    );
  });

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 justify-end">
        <View className="bg-white border-t-4 border-[#18181b] rounded-t-3xl p-5 max-h-[90%]">
          {/* Modal Header */}
          <View className="flex-row items-center justify-between pb-3 mb-3 border-b-2 border-[#18181b]">
            <View>
              <View className="bg-[#bae6fd] border border-[#18181b] px-2 py-0.5 self-start rounded mb-1">
                <Text className="text-[9px] font-black text-[#18181b] uppercase tracking-wider">
                  ELECTRONIC HEALTH RECORD
                </Text>
              </View>
              <Text className="text-xl font-black text-[#18181b]">RIWAYAT REKAM MEDIS</Text>
            </View>
            <TouchableOpacity
              className="bg-[#f4f3ed] border-2 border-[#18181b] rounded-full p-1.5"
              onPress={onClose}
            >
              <Ionicons name="close" size={18} color="#18181b" />
            </TouchableOpacity>
          </View>

          {/* Patient Header Card */}
          {patient && (
            <View className="bg-[#f4f3ed] border-2 border-[#18181b] rounded-2xl p-3.5 mb-2.5">
              <View className="flex-row justify-between items-center mb-1.5">
                <Text className="text-base font-black text-[#18181b] uppercase">
                  {patient.name}
                </Text>
                <View className="bg-[#a3e635] border border-[#18181b] px-2 py-0.5 rounded">
                  <Text className="text-[10px] font-black text-[#18181b]">{patient.noRm}</Text>
                </View>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-xs font-bold text-[#71717a]">
                  {patient.gender === "MALE" ? "Laki-laki" : "Perempuan"} • {patient.age} Tahun
                </Text>
                <Text className="text-xs font-black text-[#18181b]">•</Text>
                <Text className="text-xs font-black text-[#059669]">
                  Total {historyData?.totalVisits || 0} Kunjungan
                </Text>
              </View>
            </View>
          )}

          {/* Mini Search Bar (Jika Ada Lebih Dari 1 Riwayat Kunjungan) */}
          {historyData && historyData.visits.length > 1 && (
            <View className="mb-3">
              <View className="flex-row items-center bg-[#f4f3ed] border-2 border-[#18181b] rounded-xl px-3 py-1.5">
                <Ionicons name="search" size={14} color="#71717a" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Cari diagnosa, keluhan, obat, atau dokter..."
                  placeholderTextColor="#a1a1aa"
                  className="flex-1 ml-2 text-xs font-bold text-[#18181b] p-0"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Ionicons name="close-circle" size={15} color="#71717a" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* History Content */}
          <ScrollView showsVerticalScrollIndicator={false} className="mb-2">
            {loading ? (
              <View className="py-12 items-center justify-center">
                <ActivityIndicator size="large" color="#18181b" />
                <Text className="text-xs font-bold text-[#71717a] mt-2">
                  Memuat riwayat rekam medis...
                </Text>
              </View>
            ) : !historyData || historyData.visits.length === 0 ? (
              <View className="py-10 items-center justify-center bg-[#f4f3ed] border-2 border-dashed border-[#18181b]/30 rounded-2xl p-6">
                <Ionicons name="document-text-outline" size={36} color="#71717a" />
                <Text className="text-xs font-black text-[#18181b] mt-2">
                  Belum Ada Riwayat Kunjungan
                </Text>
                <Text className="text-[11px] font-medium text-[#71717a] text-center mt-1">
                  Pasien ini belum pernah menyelesaikan sesi konsultasi dokter.
                </Text>
              </View>
            ) : filteredVisits.length === 0 ? (
              <View className="py-8 items-center justify-center bg-[#f4f3ed] border-2 border-dashed border-[#18181b]/30 rounded-2xl p-4">
                <Ionicons name="search-outline" size={28} color="#71717a" />
                <Text className="text-xs font-black text-[#18181b] mt-1.5">
                  Tidak Ditemukan
                </Text>
                <Text className="text-[11px] font-medium text-[#71717a] text-center mt-0.5">
                  Tidak ada rekam medis yang cocok dengan "{searchQuery}"
                </Text>
              </View>
            ) : (
              <View className="gap-y-3 pb-4">
                {filteredVisits.map((visit: Visit, idx: number) => {
                  const isExpanded = expandedVisitIds.includes(visit.id);
                  const consultation = visit.consultation;
                  const medicines = consultation?.consultationMedicines || [];

                  return (
                    <View key={visit.id} className="relative">
                      <View className="absolute top-1 left-1 -right-1 -bottom-1 bg-[#18181b] rounded-2xl" />
                      <View className="bg-white border-2 border-[#18181b] rounded-2xl p-3.5">
                        {/* Header Visit Card (Bisa di-tap untuk Expand / Collapse) */}
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => toggleVisitExpand(visit.id)}
                          className={`flex-row justify-between items-center ${
                            isExpanded ? "pb-2 mb-2 border-b border-zinc-200" : ""
                          }`}
                        >
                          <View className="flex-row items-center gap-2 flex-1 mr-2">
                            <View className="bg-[#fef08a] border border-[#18181b] px-2 py-0.5 rounded">
                              <Text className="text-[9px] font-black text-[#18181b]">
                                #{historyData.visits.length - idx}
                              </Text>
                            </View>
                            <Text className="text-xs font-black text-[#18181b]">
                              {formatDate(visit.visitDate)}
                            </Text>
                            {!isExpanded && (
                              <Text
                                numberOfLines={1}
                                className="text-[11px] font-medium text-[#71717a] flex-1"
                              >
                                • {consultation?.diagnosis || visit.doctor?.name}
                              </Text>
                            )}
                          </View>

                          <View className="flex-row items-center gap-1.5">
                            <View className="w-6 h-6 rounded-full bg-[#f4f3ed] border border-[#18181b] items-center justify-center">
                              <Ionicons
                                name={isExpanded ? "chevron-up" : "chevron-down"}
                                size={14}
                                color="#18181b"
                              />
                            </View>
                          </View>
                        </TouchableOpacity>

                        {/* Rincian Konten Kunjungan (Hanya Muncul Jika isExpanded: true) */}
                        {isExpanded && (
                          <View>
                            {/* Dokter Pemeriksa */}
                            <View className="flex-row items-center gap-2 mb-2 bg-[#f4f3ed] p-2 rounded-xl border border-zinc-200">
                              <Ionicons name="medical" size={14} color="#18181b" />
                              <Text className="text-xs font-black text-[#18181b]">
                                {visit.doctor?.name}{" "}
                                <Text className="text-[10px] font-bold text-[#71717a]">
                                  (Poli {visit.doctor?.spesialis || "Umum"})
                                </Text>
                              </Text>
                            </View>

                            {/* Keluhan & Diagnosa */}
                            <View className="gap-y-1.5 mb-2.5">
                              <View>
                                <Text className="text-[10px] font-black text-[#71717a] uppercase">
                                  Keluhan Utama:
                                </Text>
                                <Text className="text-xs font-bold text-[#18181b]">
                                  {consultation?.complaint || "Tidak ada keluhan tercatat"}
                                </Text>
                              </View>

                              <View>
                                <Text className="text-[10px] font-black text-[#71717a] uppercase">
                                  Diagnosa Medis:
                                </Text>
                                <Text className="text-xs font-black text-[#0284c7]">
                                  {consultation?.diagnosis || "Belum ada diagnosa"}
                                </Text>
                              </View>

                              {consultation?.notes && (
                                <View>
                                  <Text className="text-[10px] font-black text-[#71717a] uppercase">
                                    Catatan Dokter:
                                  </Text>
                                  <Text className="text-[11px] font-medium text-[#52525b]">
                                    {consultation.notes}
                                  </Text>
                                </View>
                              )}
                            </View>

                            {/* Resep Obat yang Diberikan */}
                            {medicines.length > 0 && (
                              <View className="bg-[#ecfdf5] border border-[#059669]/30 rounded-xl p-2.5">
                                <View className="flex-row items-center gap-1.5 mb-1.5">
                                  <Ionicons name="flask" size={12} color="#059669" />
                                  <Text className="text-[10px] font-black text-[#059669] uppercase">
                                    Resep Obat Diberikan ({medicines.length}):
                                  </Text>
                                </View>
                                <View className="gap-y-1">
                                  {medicines.map((m: any, mIdx: number) => (
                                    <View
                                      key={m.id || mIdx}
                                      className="flex-row justify-between items-start"
                                    >
                                      <Text className="text-[11px] font-bold text-[#18181b] flex-1 mr-2">
                                        • {m.medicine?.name}{" "}
                                        <Text className="font-normal text-[#52525b]">
                                          ({m.qty} {m.medicine?.unit})
                                        </Text>
                                      </Text>
                                      {m.instructions && (
                                        <Text className="text-[10px] font-bold text-[#059669]">
                                          {m.instructions}
                                        </Text>
                                      )}
                                    </View>
                                  ))}
                                </View>
                              </View>
                            )}
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>

          {/* Close Button */}
          <TouchableOpacity
            className="w-full bg-[#18181b] py-3 rounded-xl items-center active:bg-zinc-800"
            onPress={onClose}
          >
            <Text className="text-xs font-black text-white uppercase">TUTUP</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
