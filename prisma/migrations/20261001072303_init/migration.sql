-- CreateTable
CREATE TABLE "Posyandu" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama_pos" TEXT NOT NULL,
    "dusun" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "id_pos" TEXT,
    "nama" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'kader',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_id_pos_fkey" FOREIGN KEY ("id_pos") REFERENCES "Posyandu" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Anak" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "id_pos" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "no_kk" TEXT,
    "nama_anak" TEXT NOT NULL,
    "jenis_kelamin" TEXT NOT NULL,
    "tanggal_lahir" DATETIME NOT NULL,
    "nama_ayah" TEXT,
    "nama_ibu" TEXT NOT NULL,
    "no_hp_ortu" TEXT,
    "alamat" TEXT NOT NULL,
    "berat_lahir_gram" REAL NOT NULL,
    "panjang_lahir_cm" REAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Anak_id_pos_fkey" FOREIGN KEY ("id_pos") REFERENCES "Posyandu" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PengukuranAnak" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "id_anak" TEXT NOT NULL,
    "id_user_input" TEXT NOT NULL,
    "tanggal_ukur" DATETIME NOT NULL,
    "berat_kg" REAL NOT NULL,
    "tinggi_cm" REAL NOT NULL,
    "cara_ukur" TEXT NOT NULL DEFAULT 'telentang',
    "lila_cm" REAL,
    "umur_bulan" INTEGER NOT NULL,
    "status_bbu" TEXT NOT NULL,
    "status_tbu" TEXT NOT NULL,
    "status_bbtb" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PengukuranAnak_id_anak_fkey" FOREIGN KEY ("id_anak") REFERENCES "Anak" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PengukuranAnak_id_user_input_fkey" FOREIGN KEY ("id_user_input") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IbuHamil" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "id_pos" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tanggal_lahir" DATETIME NOT NULL,
    "nama_suami" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "kehamilan_ke" INTEGER NOT NULL DEFAULT 1,
    "hpht" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "IbuHamil_id_pos_fkey" FOREIGN KEY ("id_pos") REFERENCES "Posyandu" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PengukuranBumil" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "id_bumil" TEXT NOT NULL,
    "id_user_input" TEXT NOT NULL,
    "tanggal_periksa" DATETIME NOT NULL,
    "usia_kehamilan_minggu" INTEGER NOT NULL,
    "berat_kg" REAL NOT NULL,
    "tinggi_cm" REAL NOT NULL,
    "lila_cm" REAL NOT NULL,
    "tekanan_darah" TEXT NOT NULL,
    "status_gizi_bumil" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PengukuranBumil_id_bumil_fkey" FOREIGN KEY ("id_bumil") REFERENCES "IbuHamil" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PengukuranBumil_id_user_input_fkey" FOREIGN KEY ("id_user_input") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Imunisasi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "id_anak" TEXT NOT NULL,
    "jenis_imunisasi" TEXT NOT NULL,
    "tanggal" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Imunisasi_id_anak_fkey" FOREIGN KEY ("id_anak") REFERENCES "Anak" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PmtBalita" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "id_anak" TEXT NOT NULL,
    "tanggal_mulai" DATETIME NOT NULL,
    "tanggal_selesai" DATETIME,
    "hasil_bb_akhir" REAL,
    "catatan" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PmtBalita_id_anak_fkey" FOREIGN KEY ("id_anak") REFERENCES "Anak" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PelatihanPrePost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "id_user" TEXT NOT NULL,
    "jenis_pelatihan" TEXT NOT NULL,
    "skor_pretest" REAL NOT NULL,
    "skor_posttest" REAL NOT NULL,
    "tanggal" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PelatihanPrePost_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Anak_nik_key" ON "Anak"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "IbuHamil_nik_key" ON "IbuHamil"("nik");
