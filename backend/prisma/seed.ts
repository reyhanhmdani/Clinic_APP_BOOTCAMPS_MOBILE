import { Gender, VisitStatus, InvoiceStatus, PaymentMethod } from '@prisma/client';
import prisma from '../src/config/prisma.js';
import bcrypt from 'bcryptjs';

// --- DATA SEED INLINE ---
const PATIENTS_DATA = [
  {
    id: '1',
    no_rm: 'RM-2025-001',
    name: 'Budi Santoso',
    gender: 'Male',
    age: 28,
    phone: '0812-1111-2222',
    address: 'Jl. Merdeka No. 123, Jakarta Selatan',
  },
  {
    id: '2',
    no_rm: 'RM-2025-002',
    name: 'Siti Aisyah',
    gender: 'Female',
    age: 25,
    phone: '0813-2222-3333',
    address: 'Jl. Mawar No. 45, Bandung',
  },
  {
    id: '3',
    no_rm: 'RM-2025-003',
    name: 'Joko Widodo',
    gender: 'Male',
    age: 35,
    phone: '0814-3333-4444',
    address: 'Jl. Sudirman No. 88, Jakarta Pusat',
  },
  {
    id: '4',
    no_rm: 'RM-2025-004',
    name: 'Ahmad Rizky',
    gender: 'Male',
    age: 30,
    phone: '0815-4444-5555',
    address: 'Jl. Pemuda No. 12, Surabaya',
  },
  {
    id: '5',
    no_rm: 'RM-2025-005',
    name: 'Marina Putri',
    gender: 'Female',
    age: 22,
    phone: '0816-5555-6666',
    address: 'Jl. Pandanaran No. 9, Semarang',
  },
  {
    id: '6',
    no_rm: 'RM-2025-006',
    name: 'Eko Prasetyo',
    gender: 'Male',
    age: 42,
    phone: '0817-6666-7777',
    address: 'Jl. Malioboro No. 50, Yogyakarta',
  },
  {
    id: '7',
    no_rm: 'RM-2025-007',
    name: 'Dewi Lestari',
    gender: 'Female',
    age: 31,
    phone: '0818-7777-8888',
    address: 'Jl. Diponegoro No. 17, Malang',
  },
  {
    id: '8',
    no_rm: 'RM-2025-008',
    name: 'Agus Setiawan',
    gender: 'Male',
    age: 29,
    phone: '0819-8888-9999',
    address: 'Jl. Asia Afrika No. 34, Bandung',
  },
];

const DOCTORS_DATA = [
  { id: '1', name: 'Dr. Andri Wijaya', spesialis: 'Spesialis Penyakit Dalam', phone: '0811-0001-0001', fee: 150000, isActive: true },
  { id: '2', name: 'Dr. Budi Santoso', spesialis: 'Dokter Umum', phone: '0811-0002-0002', fee: 50000, isActive: true },
  { id: '3', name: 'Dr. Sarah Lestari', spesialis: 'Spesialis Gigi & Mulut', phone: '0811-0003-0003', fee: 100000, isActive: true },
  { id: '4', name: 'Dr. Hendra Gunawan', spesialis: 'Spesialis Tulang & Orthopedi', phone: '0811-0004-0004', fee: 200000, isActive: true },
  { id: '5', name: 'Dr. Maya Indah', spesialis: 'Spesialis Kulit & Kelamin', phone: '0811-0005-0005', fee: 120000, isActive: true },
  { id: '6', name: 'Dr. Rizky Alamsyah', spesialis: 'Spesialis Anak', phone: '0811-0006-0006', fee: 130000, isActive: true },
  { id: '7', name: 'Dr. Dewi Sartika', spesialis: 'Spesialis Mata', phone: '0811-0007-0007', fee: 110000, isActive: true },
  { id: '8', name: 'Dr. Fulanah', spesialis: 'Dokter Umum', phone: '0811-0008-0008', fee: 50000, isActive: false },
];

const MEDICINES_DATA = [
  { id: '1', name: 'Paracetamol 500mg', price: 5000, stock: 100, unit: 'Strip' },
  { id: '2', name: 'Vitamin C 500mg', price: 3000, stock: 150, unit: 'Strip' },
  { id: '3', name: 'Amoxicillin 500mg (Antibiotik)', price: 8000, stock: 80, unit: 'Strip' },
  { id: '4', name: 'Antasida Doen (Obat Maag)', price: 4000, stock: 60, unit: 'Strip' },
  { id: '5', name: 'Ibuprofen 400mg (Anti Nyeri)', price: 6000, stock: 90, unit: 'Strip' },
  { id: '6', name: 'CTM 4mg (Obat Alergi)', price: 2500, stock: 120, unit: 'Strip' },
  { id: '7', name: 'OBH Sirup Batuk 100ml', price: 18000, stock: 45, unit: 'Botol' },
  { id: '8', name: 'Degirol Tablet Hisap Tenggorokan', price: 12000, stock: 70, unit: 'Strip' },
  { id: '9', name: 'Neurobion Forte (Vitamin Saraf)', price: 10000, stock: 85, unit: 'Strip' },
  { id: '10', name: 'Salep Acyclovir / Alergi Kulit 5g', price: 15000, stock: 35, unit: 'Tube' },
];

// Semua visit pakai tanggal hari ini agar muncul di dashboard
const today = new Date();
const todayStr = today.toISOString().split('T')[0];

const VISITS_DATA = [
  // --- 3x WAITING (Baru daftar, belum dipanggil) ---
  {
    id: 'V1',
    patient_id: '1',
    doctor_id: '1',
    queue_number: 1,
    status: 'WAITING',
    checkInTime: null,
  },
  {
    id: 'V2',
    patient_id: '2',
    doctor_id: '3',
    queue_number: 2,
    status: 'WAITING',
    checkInTime: null,
  },
  {
    id: 'V3',
    patient_id: '8',
    doctor_id: '1',
    queue_number: 3,
    status: 'WAITING',
    checkInTime: null,
  },

  // --- 2x IN_KONSULTASI (Sedang diperiksa dokter) ---
  {
    id: 'V4',
    patient_id: '3',
    doctor_id: '2',
    queue_number: 4,
    status: 'IN_KONSULTASI',
    checkInTime: new Date(`${todayStr}T08:30:00`),
  },
  {
    id: 'V5',
    patient_id: '7',
    doctor_id: '2',
    queue_number: 5,
    status: 'IN_KONSULTASI',
    checkInTime: new Date(`${todayStr}T09:15:00`),
  },

  // --- 3x COMPLETED (Selesai konsul — 1 UNPAID, 2 PAID) ---
  {
    id: 'V6',
    patient_id: '4',
    doctor_id: '4',
    queue_number: 6,
    status: 'COMPLETED',
    checkInTime: new Date(`${todayStr}T07:45:00`),
  },
  {
    id: 'V7',
    patient_id: '5',
    doctor_id: '5',
    queue_number: 7,
    status: 'COMPLETED',
    checkInTime: new Date(`${todayStr}T08:00:00`),
  },
  {
    id: 'V8',
    patient_id: '6',
    doctor_id: '6',
    queue_number: 8,
    status: 'COMPLETED',
    checkInTime: new Date(`${todayStr}T08:10:00`),
  },

  // --- 1x COMPLETED + UNPAID (Belum bayar) ---
  {
    id: 'V9',
    patient_id: '1',
    doctor_id: '5',
    queue_number: 9,
    status: 'COMPLETED',
    checkInTime: new Date(`${todayStr}T09:00:00`),
  },

  // --- 1x CANCELLED (Pasien batal datang) ---
  {
    id: 'V10',
    patient_id: '7',
    doctor_id: '7',
    queue_number: 10,
    status: 'CANCELLED',
    checkInTime: null,
  },
];

// Konsultasi hanya untuk visit yang COMPLETED
const CONSULTATIONS_DATA = [
  {
    visit_id: 'V6', // Ahmad Rizky → Dr. Hendra (Orthopedi) — UNPAID
    complaint: 'Nyeri pada pergelangan kaki setelah terkilir saat bermain futsal.',
    diagnosis: 'Sprain Ankle Grade 1 (S93.4)',
    notes: 'Istirahat total 3 hari, kompres es 15 menit tiap 4 jam. Kontrol minggu depan.',
    consultation_fee: 200000,
    prescribed_medicines: [
      { medicine_id: '5', qty: 2, price: 6000 },  // Ibuprofen x2
      { medicine_id: '9', qty: 1, price: 10000 }, // Neurobion Forte x1
    ],
  },
  {
    visit_id: 'V7', // Marina Putri → Dr. Maya (Kulit) — PAID QRIS
    complaint: 'Alergi gatal kemerahan pada kulit tangan dan leher sejak 2 hari lalu.',
    diagnosis: 'Dermatitis Alergika (L23.9)',
    notes: 'Hindari pemicu alergi (seafood, debu). Oleskan salep 2x sehari pagi & malam.',
    consultation_fee: 120000,
    prescribed_medicines: [
      { medicine_id: '6', qty: 2, price: 2500 },  // CTM x2
      { medicine_id: '10', qty: 1, price: 15000 }, // Salep Acyclovir x1
    ],
  },
  {
    visit_id: 'V8', // Eko Prasetyo → Dr. Rizky (Anak) — PAID CASH
    complaint: 'Demam tinggi sudah 3 hari disertai mual dan badan lemas.',
    diagnosis: 'Demam Dengue / Viral Infection (A90)',
    notes: 'Minum banyak cairan (air putih, jus), cek lab darah lengkap besok pagi.',
    consultation_fee: 130000,
    prescribed_medicines: [
      { medicine_id: '1', qty: 3, price: 5000 }, // Paracetamol x3
      { medicine_id: '2', qty: 2, price: 3000 }, // Vitamin C x2
    ],
  },
  {
    visit_id: 'V9', // Budi Santoso (visit 2) → Dr. Maya (Kulit) — UNPAID
    complaint: 'Gatal-gatal di area punggung dan perut sejak seminggu terakhir.',
    diagnosis: 'Urticaria / Biduran (L50.9)',
    notes: 'Mandi air hangat, hindari garuk. Kontrol jika tidak membaik dalam 5 hari.',
    consultation_fee: 120000,
    prescribed_medicines: [
      { medicine_id: '6', qty: 3, price: 2500 },  // CTM x3
      { medicine_id: '10', qty: 1, price: 15000 }, // Salep Acyclovir x1
    ],
  },
];

const INVOICES_DATA = [
  {
    visit_id: 'V6', // Ahmad Rizky — UNPAID
    invoice_no: 'INV-2025-0006',
    status: 'UNPAID',
    consultation_fee: 200000,
    medicine_fee: 22000, // (6000*2) + (10000*1)
    total: 222000,
    payment_method: 'CASH',
  },
  {
    visit_id: 'V7', // Marina Putri — PAID QRIS
    invoice_no: 'INV-2025-0007',
    status: 'PAID',
    consultation_fee: 120000,
    medicine_fee: 20000, // (2500*2) + (15000*1)
    total: 140000,
    payment_method: 'QRIS',
  },
  {
    visit_id: 'V8', // Eko Prasetyo — PAID CASH
    invoice_no: 'INV-2025-0008',
    status: 'PAID',
    consultation_fee: 130000,
    medicine_fee: 21000, // (5000*3) + (3000*2)
    total: 151000,
    payment_method: 'CASH',
  },
  {
    visit_id: 'V9', // Budi Santoso (visit 2) — UNPAID
    invoice_no: 'INV-2025-0009',
    status: 'UNPAID',
    consultation_fee: 120000,
    medicine_fee: 22500, // (2500*3) + (15000*1)
    total: 142500,
    payment_method: 'CASH',
  },
];

async function main() {
  console.log('🌱 Start seeding database...');

  // 1. Bersihkan database lama secara berurutan (child → parent)
  await prisma.invoice.deleteMany();
  await prisma.consultationMedicine.deleteMany();
  await prisma.consultation.deleteMany();
  await prisma.visit.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.patient.deleteMany();

  console.log('🧹 Cleaned existing database records.');

  // 2. Seed User Admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      email: 'admin@gmail.com',
      username: 'admin',
      password: hashedPassword,
    },
  });

  // 3. Seed Patients
  const patientIdMap = new Map<string, number>();
  for (const p of PATIENTS_DATA) {
    const createdPatient = await prisma.patient.create({
      data: {
        noRm: p.no_rm,
        name: p.name,
        gender: p.gender.toUpperCase() as Gender,
        age: p.age,
        phone: p.phone,
        address: p.address,
      },
    });
    patientIdMap.set(p.id, createdPatient.id);
  }
  console.log('✅ Patients seeded (8 pasien).');

  // 4. Seed Doctors (termasuk 1 non-aktif: Dr. Fulanah)
  const doctorIdMap = new Map<string, number>();
  for (const d of DOCTORS_DATA) {
    const createdDoctor = await prisma.doctor.create({
      data: {
        name: d.name,
        spesialis: d.spesialis,
        phone: d.phone,
        fee: d.fee,
        isActive: d.isActive,
      },
    });
    doctorIdMap.set(d.id, createdDoctor.id);
  }
  console.log('✅ Doctors seeded (7 aktif + 1 offline).');

  // 5. Seed Medicines
  const medicineIdMap = new Map<string, number>();
  let medIdx = 0;
  for (const m of MEDICINES_DATA) {
    medIdx++;
    const createdMedicine = await prisma.medicine.create({
      data: {
        code: `MED-${String(medIdx).padStart(3, '0')}`,
        name: m.name,
        price: m.price,
        stock: m.stock,
        unit: m.unit,
      },
    });
    medicineIdMap.set(m.id, createdMedicine.id);
  }
  console.log('✅ Medicines seeded (10 obat).');

  // 6. Seed Visits (10 visit — semua hari ini)
  const visitIdMap = new Map<string, number>();

  for (const v of VISITS_DATA) {
    const statusEnum = VisitStatus[v.status as keyof typeof VisitStatus];

    const realPatientId = patientIdMap.get(v.patient_id);
    const realDoctorId = doctorIdMap.get(v.doctor_id);

    if (!realPatientId || !realDoctorId) continue;

    const createdVisit = await prisma.visit.create({
      data: {
        patientId: realPatientId,
        doctorId: realDoctorId,
        queueNumber: v.queue_number,
        visitDate: today,
        status: statusEnum,
        checkInTime: v.checkInTime,
        createdAt: today,
        updatedAt: today,
      },
    });

    visitIdMap.set(v.id, createdVisit.id);
  }
  console.log('✅ Visits seeded (3 WAITING, 2 IN_KONSULTASI, 4 COMPLETED, 1 CANCELLED).');

  // 7. Seed Consultations & ConsultationMedicines
  for (const c of CONSULTATIONS_DATA) {
    const realVisitId = visitIdMap.get(c.visit_id);
    if (!realVisitId) continue;

    const createdConsultation = await prisma.consultation.create({
      data: {
        visitId: realVisitId,
        complaint: c.complaint,
        diagnosis: c.diagnosis,
        notes: c.notes,
        consultationFee: c.consultation_fee,
      },
    });

    if (c.prescribed_medicines) {
      for (const item of c.prescribed_medicines) {
        const realMedicineId = medicineIdMap.get(item.medicine_id);
        if (!realMedicineId) continue;

        await prisma.consultationMedicine.create({
          data: {
            consultationId: createdConsultation.id,
            medicineId: realMedicineId,
            qty: item.qty,
            price: item.price,
            subTotal: item.qty * item.price,
          },
        });
      }
    }
  }
  console.log('✅ Consultations seeded (4 konsultasi + resep obat).');

  // 8. Seed Invoices (2 UNPAID + 2 PAID)
  for (const inv of INVOICES_DATA) {
    const realVisitId = visitIdMap.get(inv.visit_id);
    if (!realVisitId) continue;

    await prisma.invoice.create({
      data: {
        visitId: realVisitId,
        invoiceNo: inv.invoice_no,
        totalConsultationFee: inv.consultation_fee,
        totalMedicineFee: inv.medicine_fee,
        totalAmount: inv.total,
        status: inv.status as InvoiceStatus,
        paymentMethod: inv.payment_method as PaymentMethod,
        paidAt: inv.status === 'PAID' ? today : null,
      },
    });
  }
  console.log('✅ Invoices seeded (2 UNPAID + 2 PAID).');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error Seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
