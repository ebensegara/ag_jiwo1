# Dokumentasi Routing Aplikasi

## Struktur Routing

Aplikasi ini menggunakan **Next.js App Router** dengan file-based routing. Berikut adalah struktur lengkap routing aplikasi:

---

## 🏠 Root Routes

### `/` - Home Page
- **File**: `src/app/page.tsx`
- **Component**: `HomePage`
- **Deskripsi**: Halaman utama yang otomatis redirect ke `/dashboard`
- **Akses**: Public
- **Fitur**: Loading state dengan redirect otomatis

---

## 🔐 Authentication Routes

### `/auth` - Login Page
- **File**: `src/app/auth/page.tsx`
- **Component**: `LoginPage`
- **Deskripsi**: Halaman login untuk user yang sudah terdaftar
- **Akses**: Public (redirect jika sudah login)
- **Fitur**: 
  - Email & password login
  - Link ke signup page
  - Error handling

### `/auth/signup` - Signup Page
- **File**: `src/app/auth/signup/page.tsx`
- **Component**: `SignupPage`
- **Deskripsi**: Halaman registrasi user baru
- **Akses**: Public (redirect jika sudah login)
- **Fitur**:
  - Form registrasi (email, password, full name)
  - Role selection (user/professional)
  - Link ke login page

---

## 📊 Dashboard Routes

### `/dashboard` - Dashboard Router
- **File**: `src/app/dashboard/page.tsx`
- **Component**: `DashboardPage`
- **Deskripsi**: Router yang mengarahkan user ke dashboard sesuai role
- **Akses**: Protected (requires authentication)
- **Logic**:
  - `role: "user"` → redirect ke `/dashboard/user`
  - `role: "professional"` → redirect ke `/dashboard/professional`
  - `role: "admin"` → redirect ke `/dashboard/admin`
  - `role: "company_admin"` → redirect ke `/dashboard/corporate`

### `/dashboard/user` - User Dashboard
- **File**: `src/app/dashboard/user/page.tsx`
- **Component**: `UserDashboard`
- **Deskripsi**: Dashboard untuk user biasa
- **Akses**: Protected (role: user)
- **Fitur**:
  - Welcome header dengan nama user
  - Collapsible subscription banner (upgrade to premium)
  - Dashboard carousel dengan berbagai fitur:
    - Mood Check-in
    - AI Chat
    - Journal
    - Self Screening
    - Professional Care
    - Art Therapy
    - Yoga Studio
    - Weekly Insights
  - Logout button

### `/dashboard/professional` - Professional Dashboard
- **File**: `src/app/dashboard/professional/page.tsx`
- **Component**: `ProfessionalDashboard`
- **Deskripsi**: Dashboard untuk professional/therapist
- **Akses**: Protected (role: professional)
- **Fitur**:
  - Professional inbox untuk chat dengan clients
  - Booking management
  - Client list

### `/dashboard/admin` - Admin Dashboard
- **File**: `src/app/dashboard/admin/page.tsx`
- **Component**: `AdminDashboard`
- **Deskripsi**: Dashboard untuk administrator
- **Akses**: Protected (role: admin)
- **Fitur**:
  - User management
  - System statistics
  - Content moderation

### `/dashboard/corporate` - Corporate Dashboard
- **File**: `src/app/dashboard/corporate/page.tsx`
- **Component**: `CorporateDashboard`
- **Deskripsi**: Dashboard untuk company admin
- **Akses**: Protected (role: company_admin)
- **Fitur**:
  - Employee wellness overview
  - Mood trend charts
  - Company statistics
  - Employee management

---

## 💬 Care & Communication Routes

### `/care/inbox` - User Inbox
- **File**: `src/app/care/inbox/page.tsx`
- **Component**: `InboxPage`
- **Deskripsi**: Halaman inbox untuk chat dengan professional
- **Akses**: Protected (role: user)
- **Fitur**:
  - Chat list dengan professionals
  - Real-time messaging
  - Chat history

---

## 🏢 Corporate Routes

### `/corporate/setup` - Corporate Setup
- **File**: `src/app/corporate/setup/page.tsx`
- **Component**: `CorporateSetup`
- **Deskripsi**: Halaman setup untuk corporate account
- **Akses**: Protected (role: company_admin)
- **Fitur**:
  - Company profile setup
  - Employee onboarding
  - Wellness program configuration

---

## 💳 Subscription & Plans Routes

### `/plans` - Plans Page
- **File**: `src/app/plans/page.tsx`
- **Component**: `PlansPage`
- **Deskripsi**: Halaman daftar paket subscription
- **Akses**: Public/Protected
- **Fitur**:
  - List semua paket subscription
  - Pricing details
  - Feature comparison
  - QRIS payment integration

---

## 👥 Professional Routes

### `/professionals` - Professionals List
- **File**: `src/app/professionals/page.tsx`
- **Component**: `ProfessionalsPage`
- **Deskripsi**: Halaman daftar professional/therapist
- **Akses**: Protected (role: user)
- **Fitur**:
  - Filter by category (psychologist, counselor, etc.)
  - Professional profiles
  - Booking modal
  - Availability status

---

## 🎯 Landing & Welcome Routes

### `/welcome` - Welcome Page
- **File**: `src/app/welcome/page.tsx`
- **Component**: `WelcomePage`
- **Deskripsi**: Halaman welcome untuk first-time users
- **Akses**: Public
- **Fitur**:
  - Onboarding flow
  - Feature introduction
  - CTA to signup/login

### `/landing` - Landing Page
- **File**: `src/app/landing/page.tsx`
- **Component**: `LandingPage`
- **Deskripsi**: Landing page utama untuk marketing
- **Akses**: Public
- **Fitur**:
  - Hero section
  - Features showcase
  - Testimonials
  - CTA sections

### `/landing-old` - Old Landing Page
- **File**: `src/app/landing-old/page.tsx`
- **Component**: `LandingPageOld`
- **Deskripsi**: Landing page versi lama (backup)
- **Akses**: Public
- **Status**: Deprecated

---

## 🔄 Flow Diagram

```
┌─────────────┐
│      /      │ (Root)
└──────┬──────┘
       │ auto redirect
       ▼
┌─────────────┐
│  /dashboard │ (Router)
└──────┬──────┘
       │ check role
       ├─────────────┬─────────────┬─────────────┐
       ▼             ▼             ▼             ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│   /user  │  │/professional│  │  /admin  │  │/corporate│
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

---

## 🔒 Route Protection

### Public Routes
- `/auth`
- `/auth/signup`
- `/welcome`
- `/landing`
- `/landing-old`

### Protected Routes (Requires Authentication)
- `/dashboard/*` (all dashboard routes)
- `/care/inbox`
- `/corporate/setup`
- `/professionals`
- `/plans` (dapat diakses public tapi ada fitur tambahan untuk authenticated users)

### Role-Based Access
- **User**: `/dashboard/user`, `/care/inbox`, `/professionals`
- **Professional**: `/dashboard/professional`
- **Admin**: `/dashboard/admin`
- **Company Admin**: `/dashboard/corporate`, `/corporate/setup`

---

## 📝 Notes

1. **Auto Redirect**: Root path `/` otomatis redirect ke `/dashboard`
2. **Role-Based Routing**: `/dashboard` akan redirect sesuai role user
3. **Auth Protection**: Semua dashboard routes memerlukan authentication
4. **History Management**: Menggunakan `router.push()` untuk maintain browser history
5. **Loading States**: Setiap protected route memiliki loading state saat check authentication

---

## 🛠️ Technical Details

- **Framework**: Next.js 14 (App Router)
- **Routing Type**: File-based routing
- **Auth**: Supabase Auth
- **State Management**: React hooks (useState, useEffect)
- **Navigation**: next/navigation (useRouter)
