import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { calculateAgeInMonths, classifyNutritionStatus, classifyBumilStatus } from '../lib/statusGizi';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for SIGIZI Desa Sukomalo...');

  // Clean existing tables
  await prisma.pelatihanPrePost.deleteMany();
  await prisma.pengukuranBumil.deleteMany();
  await prisma.pengukuranAnak.deleteMany();
  await prisma.imunisasi.deleteMany();
  await prisma.pmtBalita.deleteMany();
  await prisma.ibuHamil.deleteMany();
  await prisma.anak.deleteMany();
  await prisma.user.deleteMany();
  await prisma.posyandu.deleteMany();

  // 1. Create 6 Posyandu in Desa Sukomalo
  const posyanduData = [
    { nama_pos: 'Anggrek', dusun: 'Dusun Krajan', alamat: 'RT 02 RW 01 Dusun Krajan, Sukomalo' },
    { nama_pos: 'Bougenfil', dusun: 'Dusun Sukomaju', alamat: 'RT 04 RW 02 Dusun Sukomaju, Sukomalo' },
    { nama_pos: 'Dahlia', dusun: 'Dusun Karanganyar', alamat: 'RT 01 RW 03 Dusun Karanganyar, Sukomalo' },
    { nama_pos: 'Lily', dusun: 'Dusun Wonosari', alamat: 'RT 03 RW 04 Dusun Wonosari, Sukomalo' },
    { nama_pos: 'Mawar', dusun: 'Dusun Sukahening', alamat: 'RT 02 RW 05 Dusun Sukahening, Sukomalo' },
    { nama_pos: 'Melati', dusun: 'Dusun Sumberrejo', alamat: 'RT 05 RW 06 Dusun Sumberrejo, Sukomalo' },
  ];

  const posyandus = [];
  for (const pos of posyanduData) {
    const created = await prisma.posyandu.create({ data: pos });
    posyandus.push(created);
  }
  const posMap = Object.fromEntries(posyandus.map((p) => [p.nama_pos, p.id]));

  console.log('✅ Created 6 Posyandu');

  // 2. Create Users (bcrypt password hash)
  const defaultPasswordHash = await bcrypt.hash('kader123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const koordinatorPasswordHash = await bcrypt.hash('koordinator123', 10);

  // Admin & Koordinator
  await prisma.user.create({
    data: {
      nama: 'Admin Utama Sukomalo',
      username: 'admin',
      no_hp: '081200000001',
      password_hash: adminPasswordHash,
      role: 'admin',
    },
  });

  await prisma.user.create({
    data: {
      nama: 'Bd. Siti Rahayu, A.Md.Keb',
      username: 'koordinator',
      no_hp: '081200000002',
      password_hash: koordinatorPasswordHash,
      role: 'koordinator',
    },
  });

  // Kaders for each pos
  const kaderPhoneList: Record<string, string> = {
    Anggrek: '081200000003',
    Bougenfil: '081200000004',
    Dahlia: '081200000005',
    Lily: '081200000006',
    Mawar: '081200000007',
    Melati: '081200000008',
  };

  const kaders: Record<string, any> = {};
  for (const pos of posyandus) {
    const username = `kader_${pos.nama_pos.toLowerCase()}`;
    const user = await prisma.user.create({
      data: {
        nama: `Kader ${pos.nama_pos}`,
        username: username,
        no_hp: kaderPhoneList[pos.nama_pos],
        password_hash: defaultPasswordHash,
        role: 'kader',
        id_pos: pos.id,
      },
    });
    kaders[pos.nama_pos] = user;
  }

  console.log('✅ Created Users with No HP (admin, koordinator, 6 kader)');

  // 3. Create Anak & Pengukuran (Balita)
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const anakSeedList = [
    // Pos Anggrek
    { nama: 'Arka Putra Pratama', jk: 'L' as const, pos: 'Anggrek', ageM: 14, weight: 9.8, height: 77.0, measuredThisMonth: true },
    { nama: 'Aisyah Humaira', jk: 'P' as const, pos: 'Anggrek', ageM: 22, weight: 10.2, height: 82.5, measuredThisMonth: true },
    { nama: 'Muhammad Bilal', jk: 'L' as const, pos: 'Anggrek', ageM: 10, weight: 7.2, height: 68.0, measuredThisMonth: false },
    { nama: 'Nisa Sabyan', jk: 'P' as const, pos: 'Anggrek', ageM: 30, weight: 11.5, height: 86.0, measuredThisMonth: false },
    
    // Pos Bougenfil
    { nama: 'Bintang Ramadhan', jk: 'L' as const, pos: 'Bougenfil', ageM: 18, weight: 10.5, height: 81.0, measuredThisMonth: true },
    { nama: 'Bayu Samudra', jk: 'L' as const, pos: 'Bougenfil', ageM: 28, weight: 10.1, height: 82.0, measuredThisMonth: true }, // Stunting
    { nama: 'Bella Safira', jk: 'P' as const, pos: 'Bougenfil', ageM: 8, weight: 7.8, height: 67.5, measuredThisMonth: false },

    // Pos Dahlia
    { nama: 'Callysta Putri', jk: 'P' as const, pos: 'Dahlia', ageM: 24, weight: 11.8, height: 85.5, measuredThisMonth: true },
    { nama: 'Candra Wijaya', jk: 'L' as const, pos: 'Dahlia', ageM: 12, weight: 7.5, height: 71.0, measuredThisMonth: true }, // Gizi Kurang

    // Pos Lily
    { nama: 'Daniel Rizky', jk: 'L' as const, pos: 'Lily', ageM: 36, weight: 14.2, height: 95.0, measuredThisMonth: true },
    { nama: 'Dara Puspita', jk: 'P' as const, pos: 'Lily', ageM: 16, weight: 9.0, height: 74.0, measuredThisMonth: false },

    // Pos Mawar
    { nama: 'Elang Perkasa', jk: 'L' as const, pos: 'Mawar', ageM: 20, weight: 11.0, height: 83.0, measuredThisMonth: true },
    { nama: 'Eva Kartika', jk: 'P' as const, pos: 'Mawar', ageM: 14, weight: 8.4, height: 72.0, measuredThisMonth: false },

    // Pos Melati
    { nama: 'Fajar Nugraha', jk: 'L' as const, pos: 'Melati', ageM: 26, weight: 12.0, height: 87.0, measuredThisMonth: true },
    { nama: 'Fiona Azahra', jk: 'P' as const, pos: 'Melati', ageM: 6, weight: 6.8, height: 63.0, measuredThisMonth: true },
  ];

  let nikCounter = 3515010101000001;
  let kkCounter = 3515010101009999;

  for (const item of anakSeedList) {
    const birthDate = new Date();
    birthDate.setMonth(birthDate.getMonth() - item.ageM);

    const posId = posMap[item.pos];
    const kaderUser = kaders[item.pos];

    const child = await prisma.anak.create({
      data: {
        id_pos: posId,
        nik: (nikCounter++).toString(),
        no_kk: (kkCounter--).toString(),
        nama_anak: item.nama,
        jenis_kelamin: item.jk,
        tanggal_lahir: birthDate,
        nama_ayah: `Bpk. ${item.nama.split(' ')[0]}`,
        nama_ibu: `Ibu ${item.nama.split(' ')[1] || 'Siti'}`,
        no_hp_ortu: `081234567${Math.floor(100 + Math.random() * 900)}`,
        alamat: `Dusun ${item.pos}, RT 01 RW 02 Sukomalo`,
        berat_lahir_gram: 3100 + Math.floor(Math.random() * 400),
        panjang_lahir_cm: 49.0 + Math.floor(Math.random() * 3),
      },
    });

    for (let m = 3; m >= 1; m--) {
      const measureDate = new Date(currentYear, currentMonth - m, 15);
      const ageAtM = calculateAgeInMonths(birthDate, measureDate);
      const pastWeight = Math.max(3, item.weight - m * 0.4);
      const pastHeight = Math.max(50, item.height - m * 0.8);
      const nut = classifyNutritionStatus(pastWeight, pastHeight, ageAtM, item.jk);

      await prisma.pengukuranAnak.create({
        data: {
          id_anak: child.id,
          id_user_input: kaderUser.id,
          tanggal_ukur: measureDate,
          berat_kg: parseFloat(pastWeight.toFixed(1)),
          tinggi_cm: parseFloat(pastHeight.toFixed(1)),
          cara_ukur: ageAtM < 24 ? 'telentang' : 'berdiri',
          lila_cm: 14.5,
          umur_bulan: nut.umur_bulan,
          status_bbu: nut.status_bbu,
          status_tbu: nut.status_tbu,
          status_bbtb: nut.status_bbtb,
        },
      });
    }

    if (item.measuredThisMonth) {
      const measureDate = new Date(currentYear, currentMonth, 5);
      const ageAtM = calculateAgeInMonths(birthDate, measureDate);
      const nut = classifyNutritionStatus(item.weight, item.height, ageAtM, item.jk);

      await prisma.pengukuranAnak.create({
        data: {
          id_anak: child.id,
          id_user_input: kaderUser.id,
          tanggal_ukur: measureDate,
          berat_kg: item.weight,
          tinggi_cm: item.height,
          cara_ukur: ageAtM < 24 ? 'telentang' : 'berdiri',
          lila_cm: 15.0,
          umur_bulan: nut.umur_bulan,
          status_bbu: nut.status_bbu,
          status_tbu: nut.status_tbu,
          status_bbtb: nut.status_bbtb,
        },
      });
    }
  }

  console.log('✅ Created Anak & Pengukuran Balita');

  // 4. Seed Ibu Hamil & Pengukuran Bumil
  const bumilSeedList = [
    { nama: 'Ibu Ratna Dewi', pos: 'Anggrek', lila: 24.5, hphtWeeks: 24, weight: 62.0 },
    { nama: 'Ibu Maryam', pos: 'Anggrek', lila: 22.0, hphtWeeks: 16, weight: 51.5 },
    { nama: 'Ibu Nurhayati', pos: 'Bougenfil', lila: 25.0, hphtWeeks: 32, weight: 68.0 },
    { nama: 'Ibu Siska Utami', pos: 'Dahlia', lila: 21.8, hphtWeeks: 12, weight: 48.0 },
    { nama: 'Ibu Tri Wahyuni', pos: 'Lily', lila: 26.2, hphtWeeks: 28, weight: 64.5 },
    { nama: 'Ibu Yulianti', pos: 'Melati', lila: 23.8, hphtWeeks: 20, weight: 58.0 },
  ];

  let bumilNikCounter = 3515014401880001;

  for (const b of bumilSeedList) {
    const posId = posMap[b.pos];
    const kaderUser = kaders[b.pos];

    const hphtDate = new Date();
    hphtDate.setDate(hphtDate.getDate() - b.hphtWeeks * 7);

    const bumil = await prisma.ibuHamil.create({
      data: {
        id_pos: posId,
        nik: (bumilNikCounter++).toString(),
        nama: b.nama,
        tanggal_lahir: new Date(1995, 4, 12),
        nama_suami: `Bpk. ${b.nama.split(' ')[1] || 'Suryo'}`,
        alamat: `Dusun ${b.pos}, Sukomalo`,
        kehamilan_ke: 1,
        hpht: hphtDate,
      },
    });

    const statusBumil = classifyBumilStatus(b.lila);

    await prisma.pengukuranBumil.create({
      data: {
        id_bumil: bumil.id,
        id_user_input: kaderUser.id,
        tanggal_periksa: new Date(currentYear, currentMonth, 10),
        usia_kehamilan_minggu: b.hphtWeeks,
        berat_kg: b.weight,
        tinggi_cm: 156.0,
        lila_cm: b.lila,
        tekanan_darah: '120/80',
        status_gizi_bumil: statusBumil,
      },
    });
  }

  console.log('✅ Created Ibu Hamil & Pengukuran Bumil');

  // 5. Seed Pre-test / Post-test Pelatihan Kader
  const prepostData = [
    { user: kaders['Anggrek'], pre: 65, post: 90, title: 'Pelatihan Standar Antropometri Kemenkes 2026' },
    { user: kaders['Bougenfil'], pre: 60, post: 85, title: 'Pelatihan Standar Antropometri Kemenkes 2026' },
    { user: kaders['Dahlia'], pre: 70, post: 95, title: 'Pelatihan Standar Antropometri Kemenkes 2026' },
    { user: kaders['Lily'], pre: 55, post: 88, title: 'Pelatihan Standar Antropometri Kemenkes 2026' },
    { user: kaders['Mawar'], pre: 65, post: 92, title: 'Pelatihan Standar Antropometri Kemenkes 2026' },
    { user: kaders['Melati'], pre: 70, post: 96, title: 'Pelatihan Standar Antropometri Kemenkes 2026' },
  ];

  for (const item of prepostData) {
    await prisma.pelatihanPrePost.create({
      data: {
        id_user: item.user.id,
        jenis_pelatihan: item.title,
        skor_pretest: item.pre,
        skor_posttest: item.post,
        tanggal: new Date(currentYear, currentMonth - 1, 1),
      },
    });
  }

  console.log('✅ Created Pelatihan Pre/Post Test Data');
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
