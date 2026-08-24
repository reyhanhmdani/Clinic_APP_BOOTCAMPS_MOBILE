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
import { useMedicineStore } from "../stores/medicineStore";
import { Medicine } from "../types/clinic";
import { formatRupiah } from "../utils/formatRupiah";
import {
  createMedicineService,
  deleteMedicineService,
  updateMedicineService,
} from "../services/medicineService";

export default function MedicinesScreen() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [stockFilter, setStockFilter] = useState<"ALL" | "LOW_STOCK">("ALL");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [unit, setUnit] = useState("");

  const commonUnits = ["Tablet", "Strip", "Botol", "Kapsul", "Tube", "Sachet"];

  const { medicines, loading, fetchMedicines } = useMedicineStore();

  useEffect(() => {
    fetchMedicines();
  }, []);

  const openCreateModal = () => {
    setEditingMedicine(null);
    setName("");
    setPrice("");
    setStock("");
    setUnit("Tablet");
    setIsModalOpen(true);
  };

  const openEditModal = (med: Medicine) => {
    setEditingMedicine(med);
    setName(med.name);
    setPrice(String(med.price));
    setStock(String(med.stock));
    setUnit(med.unit);
    setIsModalOpen(true);
  };

  const handleSaveMedicine = async () => {
    if (!name.trim()) {
      Alert.alert("Perhatian", "Nama obat wajib diisi!");
      return;
    }
    if (!price.trim() || isNaN(Number(price))) {
      Alert.alert("Perhatian", "Harga obat harus berupa angka valid!");
      return;
    }
    if (!stock.trim() || isNaN(Number(stock))) {
      Alert.alert("Perhatian", "Jumlah stok harus berupa angka valid!");
      return;
    }

    const payload = {
      name: name.trim(),
      price: Number(price),
      stock: Number(stock),
      unit: unit,
    };

    try {
      if (editingMedicine) {
        await updateMedicineService(editingMedicine.id, payload);
        Alert.alert("Sukses", `Medicine ${name} berhasil di perbarui`);
      } else {
        await createMedicineService(payload);
        Alert.alert("Sukses", `Medicine ${name} berhasil di tambahkan`);
      }
      setIsModalOpen(false);
      fetchMedicines();
    } catch (error: any) {
      const message = error.response?.data?.message || "Gagal menyimpan data medicine";
      Alert.alert("error", message);
    }
  };

  const handleDeleteMedicine = async (id: number, name: string) => {
    Alert.alert("Konfirmasi Hapus", `Apakah kamu yakin ingin hapus medicine ${name}`, [
      { text: "Batal", style: "cancel" },
      {
        text: "hapus",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMedicineService(id);
            Alert.alert("Sukses", `Data medicine ${name} berhasil di hapus`);
            await fetchMedicines();
          } catch (error: any) {
            const message = error.response?.data?.message || "Gagal menghapus data medicine";
            Alert.alert("Error", message);
          }
        },
      },
    ]);
  };

  // Filter Data Obat
  const filteredMedicines = medicines.filter((med) => {
    if (stockFilter === "LOW_STOCK" && med.stock >= 10) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = med.name.toLowerCase().includes(q);
      const matchCode = med.code.toLowerCase().includes(q);
      const matchUnit = med.unit.toLowerCase().includes(q);
      return matchName || matchCode || matchUnit;
    }
    return true;
  });

  const lowStockCount = medicines.filter((m) => m.stock < 10).length;
  const safeStockCount = medicines.filter((m) => m.stock >= 10).length;

  return (
    <SafeAreaView className="flex-1 bg-[#f4f3ed]" edges={["top", "left", "right", "bottom"]}>
      {/* Top Header */}
      <View className="bg-[#f4f3ed] border-b-2 border-[#18181b] px-5 py-3.5 flex-row items-center justify-between">
        <View>
          <View className="bg-[#fde047] border-2 border-[#18181b] px-2 py-0.5 self-start mb-1">
            <Text className="text-[9px] font-black text-[#18181b] tracking-wider uppercase">
              MASTER DATA
            </Text>
          </View>
          <Text className="text-2xl font-black text-[#18181b] tracking-tight">DATA OBAT</Text>
        </View>

        {/* Tombol Tambah Obat Baru */}
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
            onRefresh={fetchMedicines}
            colors={["#18181b"]}
            tintColor="#18181b"
          />
        }
      >
        {/* Quick Stats Grid */}
        <View className="flex-row gap-3 mb-4">
          {/* Total Jenis Obat */}
          <View className="flex-1 relative">
            <View className="absolute top-1 left-1 -right-1 -bottom-1 bg-[#18181b] rounded-xl" />
            <View className="bg-white border-2 border-[#18181b] rounded-xl p-3">
              <View className="flex-row items-center gap-1.5 mb-1">
                <Ionicons name="flask" size={14} color="#18181b" />
                <Text className="text-[10px] font-black text-[#18181b] uppercase">TOTAL OBAT</Text>
              </View>
              <Text className="text-xl font-black text-[#18181b]">{medicines.length}</Text>
            </View>
          </View>

          {/* Stok Aman */}
          <View className="flex-1 relative">
            <View className="absolute top-1 left-1 -right-1 -bottom-1 bg-[#18181b] rounded-xl" />
            <View className="bg-[#a3e635] border-2 border-[#18181b] rounded-xl p-3">
              <View className="flex-row items-center gap-1.5 mb-1">
                <Ionicons name="cube" size={14} color="#18181b" />
                <Text className="text-[10px] font-black text-[#18181b] uppercase">STOK AMAN</Text>
              </View>
              <Text className="text-xl font-black text-[#18181b]">{safeStockCount}</Text>
            </View>
          </View>

          {/* Stok Kritis (<10) */}
          <View className="flex-1 relative">
            <View className="absolute top-1 left-1 -right-1 -bottom-1 bg-[#18181b] rounded-xl" />
            <View className="bg-[#fecdd3] border-2 border-[#18181b] rounded-xl p-3">
              <View className="flex-row items-center gap-1.5 mb-1">
                <Ionicons name="warning" size={14} color="#e11d48" />
                <Text className="text-[10px] font-black text-[#e11d48] uppercase">
                  KRITIS (&lt;10)
                </Text>
              </View>
              <Text className="text-xl font-black text-[#e11d48]">{lowStockCount}</Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View className="relative mb-3">
          <View className="absolute top-1 left-1 -right-1 -bottom-1 bg-[#18181b] rounded-xl" />
          <View className="bg-white border-2 border-[#18181b] rounded-xl px-3.5 h-12 flex-row items-center">
            <Ionicons name="search-outline" size={18} color="#18181b" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Cari nama obat / kode / satuan..."
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

        {/* Stock Filter Pills */}
        <View className="flex-row gap-2 mb-4">
          <TouchableOpacity
            className={`px-3 py-1.5 rounded-lg border-2 border-[#18181b] ${
              stockFilter === "ALL" ? "bg-[#18181b]" : "bg-white"
            }`}
            activeOpacity={0.8}
            onPress={() => setStockFilter("ALL")}
          >
            <Text
              className={`text-xs font-black ${
                stockFilter === "ALL" ? "text-white" : "text-[#18181b]"
              }`}
            >
              Semua Obat
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`px-3 py-1.5 rounded-lg border-2 border-[#18181b] flex-row items-center gap-1.5 ${
              stockFilter === "LOW_STOCK" ? "bg-[#f43f5e]" : "bg-white"
            }`}
            activeOpacity={0.8}
            onPress={() => setStockFilter("LOW_STOCK")}
          >
            <Ionicons
              name="alert-circle"
              size={14}
              color={stockFilter === "LOW_STOCK" ? "#ffffff" : "#f43f5e"}
            />
            <Text
              className={`text-xs font-black ${
                stockFilter === "LOW_STOCK" ? "text-white" : "text-[#18181b]"
              }`}
            >
              Stok Kritis ({lowStockCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Loading Indicator */}
        {loading && medicines.length === 0 && (
          <View className="py-12 items-center justify-center">
            <ActivityIndicator size="large" color="#18181b" />
            <Text className="text-xs font-bold text-[#71717a] mt-3">Memuat data obat...</Text>
          </View>
        )}

        {/* Empty State */}
        {!loading && filteredMedicines.length === 0 && (
          <View className="relative mt-4">
            <View className="absolute top-1.5 left-1.5 -right-1.5 -bottom-1.5 bg-[#18181b] rounded-2xl" />
            <View className="bg-white border-2 border-[#18181b] rounded-2xl p-8 items-center justify-center">
              <View className="w-14 h-14 bg-[#f4f3ed] border-2 border-[#18181b] rounded-full items-center justify-center mb-3">
                <Ionicons name="flask-outline" size={26} color="#71717a" />
              </View>
              <Text className="text-base font-black text-[#18181b] mb-1">
                Tidak Ada Obat Ditemukan
              </Text>
              <Text className="text-xs font-medium text-[#71717a] text-center mb-4">
                {searchQuery
                  ? "Coba kata kunci pencarian yang lain."
                  : stockFilter === "LOW_STOCK"
                    ? "Semua stok obat dalam kondisi aman!"
                    : "Belum ada master data obat terdaftar."}
              </Text>
              <TouchableOpacity
                className="bg-[#a3e635] border-2 border-[#18181b] px-4 py-2 rounded-xl"
                onPress={openCreateModal}
              >
                <Text className="text-xs font-black text-[#18181b]">TAMBAH OBAT BARU</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Medicine Cards List */}
        <View className="gap-y-3">
          {filteredMedicines.map((medicine) => {
            const isLowStock = medicine.stock < 10;
            return (
              <View key={medicine.id} className="relative">
                <View className="absolute top-1.5 left-1.5 -right-1.5 -bottom-1.5 bg-[#18181b] rounded-2xl" />
                <View className="bg-white border-2 border-[#18181b] rounded-2xl p-4">
                  {/* Header: Code & Stock Status Badge */}
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="bg-[#38bdf8] border-2 border-[#18181b] px-2.5 py-0.5 rounded-md">
                      <Text className="text-[11px] font-black text-[#18181b]">{medicine.code}</Text>
                    </View>

                    <View
                      className={`px-2.5 py-0.5 rounded-md border-2 border-[#18181b] flex-row items-center gap-1 ${
                        isLowStock ? "bg-[#f43f5e]" : "bg-[#a3e635]"
                      }`}
                    >
                      <Ionicons
                        name={isLowStock ? "warning" : "checkmark-circle"}
                        size={12}
                        color={isLowStock ? "#ffffff" : "#18181b"}
                      />
                      <Text
                        className={`text-[10px] font-black ${
                          isLowStock ? "text-white" : "text-[#18181b]"
                        }`}
                      >
                        {isLowStock
                          ? `KRITIS: ${medicine.stock} ${medicine.unit}`
                          : `Stok: ${medicine.stock} ${medicine.unit}`}
                      </Text>
                    </View>
                  </View>

                  {/* Medicine Name */}
                  <Text className="text-base font-black text-[#18181b] mb-2">{medicine.name}</Text>

                  {/* Pricing & Unit Info Grid */}
                  <View className="flex-row gap-2 mb-3">
                    <View className="flex-1 bg-[#f4f3ed] p-2.5 rounded-xl border border-[#18181b]">
                      <Text className="text-[10px] font-bold text-[#71717a] uppercase mb-0.5">
                        Harga / Unit
                      </Text>
                      <Text className="text-xs font-black text-[#059669]">
                        {formatRupiah(medicine.price)}
                      </Text>
                    </View>

                    <View className="flex-1 bg-[#f4f3ed] p-2.5 rounded-xl border border-[#18181b]">
                      <Text className="text-[10px] font-bold text-[#71717a] uppercase mb-0.5">
                        Satuan Kemasan
                      </Text>
                      <Text className="text-xs font-black text-[#18181b]">{medicine.unit}</Text>
                    </View>
                  </View>

                  {/* Actions Row */}
                  <View className="flex-row items-center justify-end gap-2 pt-2 border-t border-zinc-200">
                    <TouchableOpacity
                      className="bg-white border-2 border-[#18181b] px-3 py-1.5 rounded-lg flex-row items-center active:bg-zinc-100"
                      activeOpacity={0.8}
                      onPress={() => openEditModal(medicine)}
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
                      onPress={() => handleDeleteMedicine(medicine.id, medicine.name)}
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
            );
          })}
        </View>
      </ScrollView>

      {/* Modal Form Tambah / Edit Obat (UI Only) */}
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
                  {editingMedicine ? "Edit Data Obat" : "Tambah Obat Baru"}
                </Text>
                <Text className="text-xs font-medium text-[#71717a]">
                  Formulir katalog obat & tarif apotek
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
              {/* Nama Obat */}
              <View className="mb-3">
                <Text className="text-xs font-black text-[#18181b] uppercase mb-1.5">
                  Nama Obat *
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Contoh: Paracetamol 500mg"
                  placeholderTextColor="#a1a1aa"
                  className="bg-[#f4f3ed] border-2 border-[#18181b] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#18181b]"
                />
              </View>

              {/* Harga & Stok */}
              <View className="flex-row gap-3 mb-3">
                <View className="flex-1">
                  <Text className="text-xs font-black text-[#18181b] uppercase mb-1.5">
                    Harga Jual (Rp) *
                  </Text>
                  <TextInput
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="numeric"
                    placeholder="15000"
                    placeholderTextColor="#a1a1aa"
                    className="bg-[#f4f3ed] border-2 border-[#18181b] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#18181b]"
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-xs font-black text-[#18181b] uppercase mb-1.5">
                    Stok Saat Ini *
                  </Text>
                  <TextInput
                    value={stock}
                    onChangeText={setStock}
                    keyboardType="numeric"
                    placeholder="50"
                    placeholderTextColor="#a1a1aa"
                    className="bg-[#f4f3ed] border-2 border-[#18181b] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#18181b]"
                  />
                </View>
              </View>

              {/* Satuan Obat Selection */}
              <View className="mb-5">
                <Text className="text-xs font-black text-[#18181b] uppercase mb-1.5">
                  Satuan Kemasan *
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {commonUnits.map((u) => (
                    <TouchableOpacity
                      key={u}
                      className={`px-3.5 py-2 rounded-xl border-2 border-[#18181b] ${
                        unit === u ? "bg-[#38bdf8]" : "bg-white"
                      }`}
                      onPress={() => setUnit(u)}
                    >
                      <Text className="text-xs font-black text-[#18181b]">{u}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
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
                  onPress={handleSaveMedicine}
                >
                  <Text className="text-xs font-black text-[#18181b]">
                    {editingMedicine ? "SIMPAN PERUBAHAN" : "TAMBAH OBAT"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Persistent BottomNav with 'medicines' active tab */}
      <BottomNav activeTab="medicines" />
    </SafeAreaView>
  );
}
