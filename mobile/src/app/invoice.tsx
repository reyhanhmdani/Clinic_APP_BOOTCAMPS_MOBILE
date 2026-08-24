import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import BottomNav from "../components/BottomNav";
import { useVisitStore } from "../stores/visitStore";
import { payInvoiceService } from "../services/invoiceService";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { formatRupiah } from "../utils/formatRupiah";

export default function InvoiceScreen() {
  // cari kunjungan id tertentu
  const { visitId } = useLocalSearchParams();
  const visits = useVisitStore((state) => state.visits);
  const fetchVisits = useVisitStore((state) => state.fetchVisits);
  const selectedVisit = visits.find((item) => item.id === Number(visitId));
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "QRIS" | "TRANSFER" | "CARD">(
    (selectedVisit?.invoice?.paymentMethod as any) || "CASH"
  );

  // otomatis update metode bayar sesuai data asli di database
  useEffect(() => {
    if (selectedVisit?.invoice?.paymentMethod) {
      setPaymentMethod(selectedVisit.invoice.paymentMethod as any);
    }
  }, [selectedVisit?.invoice?.status, selectedVisit?.invoice?.paymentMethod]);

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

  const handlePrintReceipt = () => {
    setIsReceiptModalOpen(true);
  };

  const getReceiptHtml = () => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800;900&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #f4f3ed;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 24px;
          color: #18181b;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .receipt-wrapper {
          position: relative;
          width: 100%;
          max-width: 480px;
        }

        .receipt-shadow {
          position: absolute;
          top: 8px;
          left: 8px;
          width: 100%;
          height: 100%;
          background-color: #18181b;
          border-radius: 24px;
          z-index: 1;
        }

        .receipt-card {
          position: relative;
          background-color: #ffffff;
          border: 3px solid #18181b;
          border-radius: 24px;
          padding: 24px;
          z-index: 2;
        }

        .receipt-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .header-left .title {
          font-size: 15px;
          font-weight: 900;
          letter-spacing: 0.5px;
          color: #18181b;
          text-transform: uppercase;
        }

        .header-left .invoice-meta {
          font-size: 13px;
          color: #71717a;
          margin-top: 4px;
          font-weight: 600;
        }

        .header-left .invoice-meta strong {
          color: #18181b;
          font-weight: 800;
        }

        .header-right {
          text-align: right;
        }

        .header-right .date {
          font-size: 13px;
          font-weight: 800;
          color: #18181b;
        }

        .header-right .cashier {
          font-size: 11px;
          font-weight: 600;
          color: #71717a;
          margin-top: 4px;
        }

        .patient-box {
          background-color: #fef08a;
          border: 2.5px solid #18181b;
          border-radius: 16px;
          padding: 14px 18px;
          margin-bottom: 22px;
        }

        .patient-top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .patient-name {
          font-size: 14px;
          font-weight: 900;
          color: #18181b;
          text-transform: uppercase;
        }

        .patient-rm {
          font-size: 12px;
          font-weight: 800;
          color: #18181b;
        }

        .doctor-row {
          font-size: 12px;
          font-weight: 700;
          color: #18181b;
        }

        .services-section {
          margin-bottom: 22px;
        }

        .services-title {
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.8px;
          color: #18181b;
          text-transform: uppercase;
          margin-bottom: 14px;
        }

        .service-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }

        .service-desc .service-name {
          font-size: 13px;
          font-weight: 800;
          color: #18181b;
        }

        .service-desc .service-sub {
          font-size: 11px;
          font-weight: 600;
          color: #71717a;
          margin-top: 2px;
        }

        .service-price {
          font-size: 14px;
          font-weight: 800;
          color: #18181b;
        }

        .total-box {
          background-color: #a3e635;
          border: 2.5px solid #18181b;
          border-radius: 16px;
          padding: 14px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .total-label {
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.5px;
          color: #18181b;
          text-transform: uppercase;
        }

        .total-value {
          font-size: 18px;
          font-weight: 900;
          color: #18181b;
        }
      </style>
    </head>
    <body>
      <div class="receipt-wrapper">
        <div class="receipt-shadow"></div>
        <div class="receipt-card">
          <div class="receipt-header">
            <div class="header-left">
              <div class="title">REYCLINIC RECEIPT</div>
              <div class="invoice-meta">No. Faktur: <strong>${invoiceNo}</strong></div>
            </div>
            <div class="header-right">
              <div class="date">${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</div>
              <div class="cashier">Kasir: Admin Rey</div>
            </div>
          </div>

          <div class="patient-box">
            <div class="patient-top-row">
              <span class="patient-name">${patientName}</span>
              <span class="patient-rm">RM: ${patientNoRm}</span>
            </div>
            <div class="doctor-row">
              Dokter: ${doctorName} ${doctorSpecialist ? `(${doctorSpecialist})` : ""}
            </div>
          </div>

          <div class="services-section">
            <div class="services-title">RINCIAN BIAYA LAYANAN</div>
            <div class="service-row">
              <div class="service-desc">
                <div class="service-name">Jasa Konsultasi Medis</div>
                <div class="service-sub">Pemeriksaan & Tindakan Dokter</div>
              </div>
              <div class="service-price">${formatRupiah(totalConsultationFee)}</div>
            </div>
            <div class="service-row">
              <div class="service-desc">
                <div class="service-name">Total Resep Obat Apotek</div>
                <div class="service-sub">Farmasi & Obat-obatan Pasien</div>
              </div>
              <div class="service-price">${formatRupiah(totalMedicineFee)}</div>
            </div>
          </div>

          <div class="total-box">
            <span class="total-label">TOTAL TAGIHAN</span>
            <span class="total-value">${formatRupiah(totalAmount)}</span>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const handleSavePdf = async () => {
    try {
      setIsGeneratingPdf(true);
      const { base64 } = await Print.printToFileAsync({ html: getReceiptHtml(), base64: true });
      if (!base64) throw new Error("Gagal membuat PDF");

      const cleanInvoiceNo = (invoiceNo || "INV").replace(/[^a-zA-Z0-9_-]/g, "_");
      const fileName = `Struk_${cleanInvoiceNo}.pdf`;

      if (Platform.OS === "android") {
        const permissions =
          await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (permissions.granted) {
          const uri = await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            fileName,
            "application/pdf"
          );
          await FileSystem.writeAsStringAsync(uri, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });
          Alert.alert("Berhasil Diunduh", `File struk berhasil disimpan ke folder pilihan Anda.`);
          return;
        }
      }

      const targetPdfUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(targetPdfUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      Alert.alert("Berhasil Diunduh", "File struk berhasil disimpan di memori HP Anda.");
    } catch (error: any) {
      Alert.alert("Gagal Menyimpan", error?.message || "Gagal mengunduh file PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSharePdf = async () => {
    try {
      setIsGeneratingPdf(true);
      // 1. Generate PDF dengan base64
      const { base64, uri } = await Print.printToFileAsync({
        html: getReceiptHtml(),
        base64: true,
      });

      if (!uri) throw new Error("Gagal membuat PDF");

      const cleanInvoiceNo = (invoiceNo || "INV").replace(/[^a-zA-Z0-9_-]/g, "_");
      const targetUri = `${FileSystem.cacheDirectory}Struk_${cleanInvoiceNo}.pdf`;

      // 2. Tulis file langsung di cache directory agar izin file valid di Android
      if (base64) {
        await FileSystem.writeAsStringAsync(targetUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      const fileToShare = base64 ? targetUri : uri;

      // 3. Buka Native Share Dialog (WhatsApp, Telegram, dll)
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileToShare, {
          UTI: ".pdf",
          mimeType: "application/pdf",
          dialogTitle: `Bagikan Struk ${invoiceNo}`,
        });
      } else {
        Alert.alert("Info", "Fitur berbagi tidak didukung di perangkat/simulator ini.");
      }
    } catch (error: any) {
      Alert.alert("Gagal Membagikan", error?.message || "Tidak dapat membagikan file.");
    } finally {
      setIsGeneratingPdf(false);
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
                  {formatRupiah(totalConsultationFee)}
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
                  {formatRupiah(totalMedicineFee)}
                </Text>
              </View>
            </View>

            {/* Banner Total Tagihan Akhir */}
            <View className="bg-[#a3e635] border-2 border-[#18181b] rounded-xl p-3.5 flex-row justify-between items-center">
              <Text className="text-xs font-black text-[#18181b] uppercase">TOTAL TAGIHAN</Text>
              <Text className="text-lg font-black text-[#18181b]">{formatRupiah(totalAmount)}</Text>
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
        <View className="mb-8">
          {isAlreadyPaid ? (
            <View className="flex-row gap-3">
              {/* Tombol Print Ikon Saja (Kotak Minimalis Neubrutalism) */}
              <View className="relative">
                <View className="absolute top-1.5 left-1.5 -right-1.5 -bottom-1.5 bg-[#18181b] rounded-2xl" />
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handlePrintReceipt}
                  className="bg-white border-2 border-[#18181b] rounded-2xl w-14 h-14 justify-center items-center active:bg-zinc-100"
                >
                  <Ionicons name="print-outline" size={22} color="#18181b" />
                </TouchableOpacity>
              </View>

              {/* Tombol Utama Kembali ke Antrean */}
              <View className="flex-1 relative">
                <View className="absolute top-1.5 left-1.5 -right-1.5 -bottom-1.5 bg-[#18181b] rounded-2xl" />
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
                    KEMBALI KE ANTREAN
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className="relative">
              <View className="absolute top-1.5 left-1.5 -right-1.5 -bottom-1.5 bg-[#18181b] rounded-2xl" />
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handlePayInvoice}
                disabled={isProcessing}
                className="bg-[#a3e635] border-2 border-[#18181b] rounded-2xl h-14 flex-row justify-center items-center active:bg-lime-400"
              >
                <Ionicons
                  name="cash-outline"
                  size={20}
                  color="#18181b"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-sm font-black text-[#18181b] tracking-wider uppercase">
                  LUNASI & PROSES PEMBAYARAN
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* E-RECEIPT MODAL (STRUK DIGITAL NEUBRUTALISM) */}
      <Modal
        visible={isReceiptModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsReceiptModalOpen(false)}
      >
        <View className="flex-1 bg-black/60 justify-center items-center px-4 py-8">
          <View className="relative w-full max-w-sm">
            {/* Hard Shadow */}
            <View className="absolute top-2 left-2 -right-2 -bottom-2 bg-[#18181b] rounded-3xl" />

            {/* Receipt Container */}
            <View className="bg-white border-2 border-[#18181b] rounded-3xl p-5 overflow-hidden">
              {/* Header Struk */}
              <View className="flex-row justify-between items-start mb-4">
                <View>
                  <Text className="text-sm font-black text-[#18181b] tracking-wider uppercase">
                    REYCLINIC RECEIPT
                  </Text>
                  <Text className="text-xs font-semibold text-[#71717a] mt-0.5">
                    No. Faktur: <Text className="font-black text-[#18181b]">{invoiceNo}</Text>
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-xs font-black text-[#18181b]">Hari Ini</Text>
                  <Text className="text-[10px] font-bold text-[#71717a] mt-0.5">Kasir: Admin Rey</Text>
                </View>
              </View>

              {/* Yellow Patient & Doctor Card */}
              <View className="bg-[#fef08a] border-2 border-[#18181b] rounded-2xl p-3.5 mb-4">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-xs font-black text-[#18181b] uppercase">
                    {patientName}
                  </Text>
                  <Text className="text-[11px] font-black text-[#18181b]">
                    RM: {patientNoRm}
                  </Text>
                </View>
                <Text className="text-[11px] font-bold text-[#18181b]">
                  Dokter: {doctorName} {doctorSpecialist ? `(${doctorSpecialist})` : ""}
                </Text>
              </View>

              {/* Rincian Biaya Layanan */}
              <View className="mb-4">
                <Text className="text-[11px] font-black text-[#18181b] tracking-wider uppercase mb-2.5">
                  RINCIAN BIAYA LAYANAN
                </Text>

                <View className="flex-row justify-between items-center mb-2.5">
                  <View>
                    <Text className="text-xs font-black text-[#18181b]">Jasa Konsultasi Medis</Text>
                    <Text className="text-[10px] font-semibold text-[#71717a]">
                      Pemeriksaan & Tindakan Dokter
                    </Text>
                  </View>
                  <Text className="text-xs font-black text-[#18181b]">
                    {formatRupiah(totalConsultationFee)}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-xs font-black text-[#18181b]">Total Resep Obat Apotek</Text>
                    <Text className="text-[10px] font-semibold text-[#71717a]">
                      Farmasi & Obat-obatan Pasien
                    </Text>
                  </View>
                  <Text className="text-xs font-black text-[#18181b]">
                    {formatRupiah(totalMedicineFee)}
                  </Text>
                </View>
              </View>

              {/* Lime Total Box */}
              <View className="bg-[#a3e635] border-2 border-[#18181b] rounded-2xl p-3.5 flex-row justify-between items-center mb-4">
                <Text className="text-xs font-black text-[#18181b] tracking-wider uppercase">
                  TOTAL TAGIHAN
                </Text>
                <Text className="text-base font-black text-[#18181b]">
                  {formatRupiah(totalAmount)}
                </Text>
              </View>

              {/* Tombol Aksi Modal: Simpan HP, Bagikan & Tutup */}
              <View className="flex-row gap-2">
                {/* 1. Tombol Simpan Langsung ke HP */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleSavePdf}
                  disabled={isGeneratingPdf}
                  className="flex-1 bg-[#a3e635] border-2 border-[#18181b] rounded-xl h-11 flex-row justify-center items-center active:bg-lime-400"
                >
                  {isGeneratingPdf ? (
                    <ActivityIndicator size="small" color="#18181b" />
                  ) : (
                    <>
                      <Ionicons
                        name="download-outline"
                        size={15}
                        color="#18181b"
                        style={{ marginRight: 3 }}
                      />
                      <Text className="text-[11px] font-black text-[#18181b] uppercase">
                        SIMPAN HP
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* 2. Tombol Bagikan (WhatsApp / Share) */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleSharePdf}
                  disabled={isGeneratingPdf}
                  className="flex-1 bg-[#38bdf8] border-2 border-[#18181b] rounded-xl h-11 flex-row justify-center items-center active:bg-sky-400"
                >
                  <Ionicons
                    name="share-social-outline"
                    size={15}
                    color="#18181b"
                    style={{ marginRight: 3 }}
                  />
                  <Text className="text-[11px] font-black text-[#18181b] uppercase">BAGIKAN</Text>
                </TouchableOpacity>

                {/* 3. Tombol Tutup */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setIsReceiptModalOpen(false)}
                  className="bg-white border-2 border-[#18181b] rounded-xl px-3 h-11 justify-center items-center active:bg-zinc-100"
                >
                  <Text className="text-[11px] font-black text-[#18181b] uppercase">TUTUP</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* 3. Bottom Nav */}
      <BottomNav activeTab="queue" />
    </SafeAreaView>
  );
}
