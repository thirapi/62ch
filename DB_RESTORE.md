# Panduan Restorasi Database (Drizzle & Supabase)

Dokumen ini berisi langkah-langkah untuk merestorasi database dari file backup ke database baru menggunakan Drizzle Kit dan `pg_restore`.

---

## Langkah 1: Jalankan Migrasi Drizzle
Langkah pertama adalah membuat struktur tabel di database baru sesuai dengan skema aplikasi saat ini.

```bash
npx drizzle-kit push
# ATAU jika menggunakan migrasi:
npx drizzle-kit migrate
```

## Langkah 2: Bersihkan Data Seed (Truncate)
Jika migrasi otomatis memasukkan data seed atau jika ada data lama yang ingin dihapus, jalankan script SQL berikut untuk mengosongkan semua tabel di schema `public`.

> [!CAUTION]
> Perintah `TRUNCATE` akan menghapus **SEMUA** data yang ada di tabel. Gunakan dengan hati-hati.

```sql
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- Matikan semua trigger & constraint sementara agar truncate berhasil
    SET session_replication_role = 'replica';

    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'TRUNCATE TABLE public.' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE;';
    END LOOP;

    -- Kembalikan trigger ke normal
    SET session_replication_role = 'origin';
END $$;
```

## Langkah 3: Restorasi Data dari Backup
Gunakan `pg_restore` untuk memasukkan data dari file `.dump`. Pastikan koneksi string sudah benar.

### A. Set Role ke Replica
Matikan constraint sementara melalui `psql` sebelum menjalankan restorasi.

```bash
psql "postgresql://postgres.kjrlskoevhstxkltrnwe:[password]@[host].pooler.supabase.com:6543/postgres" -c "ALTER ROLE postgres SET session_replication_role = 'replica';"
```

### B. Jalankan `pg_restore`
Eksekusi pemulihan data saja (`--data-only`) karena skema sudah dibuat oleh Drizzle.

```bash
pg_restore \
  -d "postgresql://postgres.kjrlskoevhstxkltrnwe:[password]@[host].pooler.supabase.com:6543/postgres" \
  --no-owner \
  --no-privileges \
  --data-only \
  --schema=public \
  backups/backup-2026-04-02.dump
```

## Langkah 4: Kembalikan Role ke Origin
Setelah restorasi selesai, pastikan untuk mengaktifkan kembali trigger dan constraint.

```sql
ALTER ROLE postgres SET session_replication_role = 'origin';
```

## Langkah 5: Sinkronisasi Sequence
Langkah ini sangat penting agar kolom ID (Primary Key) tidak bentrok saat ada data baru yang masuk (menghindari error `duplicate key value violates unique constraint`).

```sql
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT table_name, column_name 
        FROM information_schema.columns 
        WHERE column_default LIKE 'nextval%' 
        AND table_schema = 'public'
    ) 
    LOOP
        EXECUTE 'SELECT setval(pg_get_serial_sequence(''public.' || r.table_name || ''', ''' || r.column_name || '''), (SELECT MAX(' || r.column_name || ') FROM public.' || r.table_name || '));';
    END LOOP;
END $$;
```

---
> [!TIP]
> Selalu pastikan file backup tersedia di folder `backups/` sebelum memulai proses ini.