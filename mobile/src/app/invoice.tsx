import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import BottomNav from "../components/BottomNav";
import { useVisitStore } from "../stores/visitStore";
import { payInvoiceService } from "../services/invoiceService";

export default function InvoiceScreen() {
  // cari kunjungan id tertentu
  const { visitId } = useLocalSearchParams();
  const visits = useVisitStore((state) => state.visits);
  const fetchVisits = useVisitStore((state) => state.fetchVisits);
  const selectedVisit = visits.find((item) => item.id === Number(visitId));
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "QRIS" | "TRANSFER" | "CARD">("CASH");

  const isAlreadyPaid = selectedVisit?.invoice?.status === "PAID";
  const invoiceNo = selectedVisit?.invoice?.invoiceNo || "-";
  const patientName = selectedVisit?.patient?.name;
  const patientNoRm = selectedVisit?.patient?.noRm;
  const doctorName = selectedVisit?.doctor?.name;
  const doctorSpecialist = selectedVisit?.doctor?.spesialis;
  const totalConsultationFee = Number(selectedVisit?.invoice?.totalConsultationFee || 0);
  const totalMedicineFee = Number(selectedVisit?.invoice?.totalMedicineFee || 0);
  const totalAmount = selectedVisit?.invoice?.totalAmount
    ? Number(selectedVisit?.invoice?.totalAmount)
    : 0;

  const formattedTotal = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(totalAmount);

  const paymentMethods = [
    { id: "CASH", label: "Tunai (Cash)", icon: "cash-outline", bg: "bg-[#fde047]" },
    { id: "QRIS", label: "QRIS / E-Wallet", icon: "qr-code-outline", bg: "bg-[#38bdf8]" },
    { id: "TRANSFER", label: "Bank Transfer", icon: "business-outline", bg: "bg-[#a3e635]" },
    { id: "CARD", label: "Kartu Debit / EDC", icon: "card-outline", bg: "bg-[#f472b6]" },
  ];

  const handlePayInvoice = async () => {
    if (!selectedVisit?.invoice?.id) {
      return Alert.alert("Data tagihan ga ada");
    }
    setIsProcessing(true);

    try {
      await payInvoiceService(selectedVisit.invoice.id, {
        paymentMethod: paymentMethod,
      });

      await fetchVisits();

      Alert.alert("Pembayaran berhasil dilunasi(PAID)");
      router.replace({ pathname: "/queue" });
    } catch (error: any) {
      Alert.alert(`Gagal memproses pembayaran: ${error?.response?.data?.message || error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f4f3ed]" edges={["top", "left", "right"]}>
      {/* 1. Top Header App Bar */}
      <View className="bg-[#f4f3ed] border-b-2 border-[#18181b] px-5 py-3.5 flex-row items-center justify-between">
        <View>
          <View className="bg-[#a3e635] border-2 border-[#18181b] px-2 py-0.5 self-start mb-1">
            <Text className="text-[9px] font-black text-[#18181b] tracking-wider uppercase">
              BILLING & POS SYSTEM
            </Text>
          </View>
          <Text className="text-2xl font-black text-[#18181b] tracking-tight">
            KASIR & PELUNASAN
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

      {/* 2. Scrollable Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Badge Ribbon */}
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="receipt-outline" size={16} color="#18181b" />
            <Text className="text-xs font-black text-[#18181b] uppercase tracking-wider">
              FAKTUR PEMBAYARAN
            </Text>
          </View>
          <View
            className={`border-2 border-[#18181b] px-3 py-1 rounded-lg ${isAlreadyPaid ? "bg-[#4ade80]" : "bg-[#f43f5e]"}`}
          >
            <Text
              className={`text-[10px] font-black uppercase tracking-wider ${isAlreadyPaid ? "text-[#18181b]" : "text-white"}`}
            >
              {isAlreadyPaid ? "STATUS: LUNAS (PAID)" : "STATUS: BELUM BAYAR"}
            </Text>
          </View>
        </View>

        {/* Card: Struk Nota Transaksi (Receipt Card) */}
        <View className="relative mb-5">
          <View className="absolute top-1.5 left-1.5 -right-1.5 -bottom-1.5 bg-[#18181b] rounded-2xl" />
          <View className="bg-white border-2 border-[#18181b] rounded-2xl p-4">
            {/* Nota Header */}
            <View className="flex-row justify-between items-start pb-3 border-b-2 border-[#18181b]/10">
              <View>
                <Text className="text-sm font-black text-[#18181b] uppercase">
                  REYCLINIC RECEIPT
                </Text>
                <Text className="text-[11px] font-semibold text-[#71717a] mt-0.5">
                  No. Faktur:{" "}
                  <Text
                    style={{ fontFamily: Platform.OS === "ios" ? "Courier" : "monospace" }}
                    className="font-bold text-[#18181b]"
                  >
                    {invoiceNo}
                  </Text>
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-[11px] font-black text-[#18181b]">Hari Ini</Text>
                <Text className="text-[10px] font-semibold text-[#71717a]">Kasir: Admin Rey</Text>
              </View>
            </View>

            {/* Banner Pasien & Dokter (Kuning Neubrutal) */}
            <View className="bg-[#fef08a] border-2 border-[#18181b] rounded-xl p-3 my-3">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-xs font-black text-[#18181b] uppercase">{patientName}</Text>
                <Text className="text-[10px] font-bold text-[#52525b]">RM: {patientNoRm}</Text>
              </View>
              <Text className="text-[11px] font-bold text-[#18181b]">
                Dokter: {doctorName} ({doctorSpecialist})
              </Text>
            </View>

            {/* Rincian Item Tagihan */}
            <View className="space-y-2 mb-3">
              <Text className="text-[11px] font-black text-[#18181b] uppercase tracking-wider mb-1">
                RINCIAN BIAYA LAYANAN
              </Text>

              {/* 1. Jasa Dokter */}
              <View className="flex-row justify-between items-center py-2 border-b border-zinc-200">
                <View>
                  <Text className="text-xs font-black text-[#18181b]">Jasa Konsultasi Medis</Text>
                  <Text className="text-[10px] font-semibold text-[#71717a]">
                    Pemeriksaan & Tindakan Dokter
                  </Text>
                </View>
                <Text className="text-xs font-black text-[#18181b]">
                  Rp {totalConsultationFee.toLocaleString("id-ID")}
                </Text>
              </View>

              {/* 2. Biaya Resep Obat */}
              <View className="flex-row justify-between items-center py-2 border-b border-zinc-200">
                <View>
                  <Text className="text-xs font-black text-[#18181b]">Total Resep Obat Apotek</Text>
                  <Text className="text-[10px] font-semibold text-[#71717a]">
                    Farmasi & Obat-obatan Pasien
                  </Text>
                </View>
                <Text className="text-xs font-black text-[#18181b]">
                  Rp {totalMedicineFee.toLocaleString("id-ID")}
                </Text>
              </View>
            </View>

            {/* Banner Total Tagihan Akhir */}
            <View className="bg-[#a3e635] border-2 border-[#18181b] rounded-xl p-3.5 flex-row justify-between items-center">
              <Text className="text-xs font-black text-[#18181b] uppercase">TOTAL TAGIHAN</Text>
              <Text className="text-lg font-black text-[#18181b]">
                Rp {totalAmount.toLocaleString("id-ID")}
              </Text>
            </View>
          </View>
        </View>

        {/* Card: Pilihan Metode Pembayaran */}
        <View className="relative mb-6">
          <View className="absolute top-1.5 left-1.5 -right-1.5 -bottom-1.5 bg-[#18181b] rounded-2xl" />
          <View className="bg-white border-2 border-[#18181b] rounded-2xl p-4">
            <View className="flex-row items-center gap-2 mb-3 pb-2 border-b-2 border-[#18181b]/10">
              <Ionicons name="card-outline" size={18} color="#18181b" />
              <Text className="text-sm font-black text-[#18181b] uppercase tracking-wide">
                PILIH METODE PEMBAYARAN
              </Text>
            </View>

            {/* Grid 4 Metode Pembayaran */}
            <View className="gap-y-2">
              {paymentMethods.map((method) => {
                const isSelected = paymentMethod === method.id;
                return (
                  <TouchableOpacity
                    key={method.id}
                    disabled={isAlreadyPaid}
                    onPress={() => setPaymentMethod(method.id as any)}
                    activeOpacity={0.8}
                    className={`p-3 rounded-xl border-2 border-[#18181b] flex-row justify-between items-center ${isSelected ? "bg-[#18181b]" : "bg-white"}`}
                  >
                    <View className="flex-row items-center gap-3">
                      <View
                        className={`w-8 h-8 rounded-lg border-2 border-[#18181b] justify-center items-center ${method.bg}`}
                      >
                        <Ionicons name={method.icon as any} size={16} color="#18181b" />
                      </View>
                      <Text
                        className={`text-xs font-black uppercase ${isSelected ? "text-white" : "text-[#18181b]"}`}
                      >
                        {method.label}
                      </Text>
                    </View>

                    <View
                      className={`w-5 h-5 rounded-full border-2 border-[#18181b] justify-center items-center ${isSelected ? "bg-[#a3e635]" : "bg-zinc-100"}`}
                    >
                      {isSelected && <Ionicons name="checkmark" size={12} color="#18181b" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Action Button */}
        <View className="relative mb-8">
          <View className="absolute top-1.5 left-1.5 -right-1.5 -bottom-1.5 bg-[#18181b] rounded-2xl" />
          {isAlreadyPaid ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.replace("/queue")}
              className="bg-[#fde047] border-2 border-[#18181b] rounded-2xl h-14 flex-row justify-center items-center active:bg-yellow-300"
            >
              <Ionicons
                name="checkmark-done-circle-outline"
                size={20}
                color="#18181b"
                style={{ marginRight: 8 }}
              />
              <Text className="text-sm font-black text-[#18181b] tracking-wider uppercase">
                KEMBALI KE DAFTAR ANTREAN
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handlePayInvoice}
              disabled={isProcessing}
              className="bg-[#a3e635] border-2 border-[#18181b] rounded-2xl h-14 flex-row justify-center items-center active:bg-lime-400"
            >
              <Ionicons name="cash-outline" size={20} color="#18181b" style={{ marginRight: 8 }} />
              <Text className="text-sm font-black text-[#18181b] tracking-wider uppercase">
                LUNASI & PROSES PEMBAYARAN
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* 3. Bottom Nav */}
      <BottomNav activeTab="queue" />
    </SafeAreaView>
  );
}
