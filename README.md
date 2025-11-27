# 🎾 TenisERP - Kulüp Yönetim Sistemi

Tenis kulüpleri için geliştirilmiş profesyonel ERP ve yönetim sistemi. Modern teknolojiler kullanılarak inşa edilmiştir.

## 🚀 Teknolojiler

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** Shadcn UI
- **Database:** PostgreSQL (Supabase)
- **Authentication:** Supabase Auth
- **Form Handling:** React Hook Form + Zod

## 📁 Proje Yapısı

```
tenis-erp/
├── app/
│   ├── (auth)/             # Auth sayfaları (login)
│   ├── (dashboard)/        # Dashboard sayfaları
│   │   ├── dashboard/      # Ana dashboard
│   │   ├── members/        # Üye yönetimi
│   │   ├── groups/         # Grup yönetimi
│   │   ├── lessons/        # Ders yönetimi
│   │   ├── attendance/     # Yoklama
│   │   ├── payments/       # Ödemeler
│   │   ├── inventory/      # Envanter
│   │   └── reports/        # Raporlar
│   └── api/                # API routes
├── components/
│   ├── layout/             # Layout bileşenleri
│   ├── shared/             # Paylaşılan bileşenler
│   └── ui/                 # Shadcn UI bileşenleri
├── hooks/                  # Custom React hooks
├── lib/
│   ├── supabase/          # Supabase client
│   ├── database/          # Database schema
│   └── utils.ts           # Utility fonksiyonları
├── services/              # API servisleri
└── types/                 # TypeScript tipleri
```

## 🛠️ Kurulum

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. Ortam Değişkenlerini Ayarlayın

`.env.local` dosyası oluşturun:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Supabase Kurulumu

1. [Supabase](https://supabase.com) üzerinde yeni bir proje oluşturun
2. `lib/database/schema.sql` dosyasındaki SQL'i Supabase SQL Editor'da çalıştırın
3. Authentication > Providers'dan Email auth'u aktif edin

### 4. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın.

## 📋 Modüller

### 👥 Üye Yönetimi
- Üye ekleme, düzenleme, silme
- Veli bilgileri (çocuk üyeler için)
- Grup ataması
- Yoklama ve ödeme geçmişi

### 👨‍👩‍👧‍👦 Grup Yönetimi
- Grup oluşturma ve düzenleme
- Üye ekleme/çıkarma
- Antrenör ataması
- Ders takvimi

### 📅 Ders/Etkinlik Yönetimi
- Takvim görünümü (haftalık/aylık)
- Ders oluşturma ve düzenleme
- Grup bazlı planlama

### ✅ Yoklama
- Ders bazlı yoklama alma
- Katılım istatistikleri
- Devamsızlık raporları

### 💳 Ödeme Sistemi
- Aylık aidat takibi
- Ödeme durumu kontrolü
- Geciken ödeme uyarıları
- Tahsilat raporları

### 📦 Envanter Takibi
- Ekipman listesi
- Stok yönetimi
- Düşük stok uyarıları

### 📊 Raporlar
- Aylık özet raporları
- Katılım oranları
- Ödeme istatistikleri
- PDF/CSV export

## 🔐 Rol Yönetimi

| Rol | Yetkiler |
|-----|----------|
| Admin | Tüm modüllere tam erişim |
| Coach | Kendi grupları ve dersleri |

## 🎨 Tema

Yeşil-beyaz gradient renk paleti ile modern, mobil uyumlu tasarım.

## 📝 Demo Bilgileri

- **Email:** admin@teniskulubu.com
- **Şifre:** admin123

## 🔄 Geliştirme Aşamaları

- [x] Proje iskeleti
- [x] Renk teması
- [x] Layout + Sidebar
- [x] Database schema
- [x] Temel sayfalar
- [x] Service layer
- [ ] API endpoints
- [ ] Form modalleri
- [ ] Gerçek veri entegrasyonu
- [ ] Mobil optimizasyon
- [ ] Test yazımı

## 📄 Lisans

MIT License
