# Jiwo.AI System Analysis Report

**Generated:** December 17, 2025  
**Analysis Type:** Comprehensive System Architecture Review

---

## 1. System Overview

### 1.1 Application Type
- **Framework:** Next.js 14 (App Router)
- **Type:** Mental Wellness Progressive Web App (PWA)
- **Target Market:** Indonesian users & corporations
- **Deployment:** Vercel-ready

### 1.2 Key Statistics
| Metric | Count |
|--------|-------|
| App Routes | 12 directories |
| Main Components | 33 files |
| UI Components | 45 shadcn/ui |
| Database Tables | 20 tables |
| Database Indexes | 40+ indexes |
| API Endpoints | 7 routes |
| Total Migrations | 44 files |

---

## 2. User Role System

### 2.1 Roles Identified

| Role | Dashboard Route | Capabilities |
|------|----------------|--------------|
| `user` | `/dashboard/user` | Personal wellness features |
| `professional` | `/dashboard/professional` | Manage clients, bookings |
| `admin` | `/dashboard/admin` | System administration |
| `company_admin` | `/dashboard/corporate` | HR analytics, employee wellness |

### 2.2 Role Routing Logic
```
/dashboard → checkUserRole() → redirect based on role
  ├── user → /dashboard/user (DashboardCarousel UI)
  ├── professional → /dashboard/professional
  ├── admin → /dashboard/admin
  └── company_admin → /dashboard/corporate (CorporateDashboard)
```

---

## 3. Navigation System

### 3.1 Current Menu Items (7 total)

| ID | Label | Icon | Mobile Nav |
|----|-------|------|------------|
| `dashboard` | Dashboard | BarChart3 | ✅ |
| `mood` | Mood Check-in | Heart | ✅ |
| `chat` | AI Chat | MessageCircle | ✅ |
| `journal` | Journal | BookOpen | ✅ |
| `screening` | Self Screening | ClipboardList | ✅ |
| `insights` | Weekly Insights | TrendingUp | ❌ (hidden) |
| `professionals` | Professional Care | Users | ❌ (hidden) |

### 3.2 Navigation Components

| Component | Purpose | Platform |
|-----------|---------|----------|
| `MobileNavigation` | Bottom nav bar | Mobile (5 items) |
| `DesktopSidebar` | Fixed sidebar | Desktop (all items) |
| `MobileHeader` | Hamburger menu | Mobile (all items) |

### 3.3 Issues Identified

1. **Inconsistent Mobile Access**
   - Mobile bottom nav only shows 5/7 items
   - "Insights" and "Professionals" hidden from quick access
   - Must use hamburger menu to access all features

2. **No Holistic Care Section**
   - Yoga Studio, Art Therapy not in main nav
   - Accessed via dashboard cards only

3. **Missing EAP/Support Section**
   - No crisis/emergency support access
   - No dedicated support menu

---

## 4. Database Schema Analysis

### 4.1 Core Tables (20 tables)

**User Management:**
- `users` - Core user data with role & company_id
- `companies` - Corporate accounts
- `company_admins` - HR admin access
- `company_employees` - Employee enrollment

**Wellness Features:**
- `moods` - Mood entries (1-5 scale)
- `journals` - Journal entries with tags
- `screenings` - PHQ-9 & MBTI results
- `insights` - Individual weekly insights

**Professional Care:**
- `professionals` - 6 categories of professionals
- `bookings` - Session bookings
- `chat_channels` - User-professional channels
- `care_chat_messages` - Chat messages

**AI Chat:**
- `chat_messages` - AI conversation history
- `chat_usage` - Usage limits tracking

**Payments:**
- `plans` - Subscription plans
- `subscriptions` - Active subscriptions
- `payments` - Transaction records

**Corporate Wellness:**
- `company_insights` - Aggregated analytics
- `company_alerts` - HR alerts

**Gamification:**
- `rewards` - Points & achievements

### 4.2 Key Relationships

```
users (1) ──── (N) moods
users (1) ──── (N) journals
users (1) ──── (N) screenings
users (1) ──── (N) bookings
users (1) ──── (1) chat_usage
users (N) ──── (1) companies

professionals (1) ──── (N) bookings
professionals (1) ──── (N) chat_channels

companies (1) ──── (N) company_employees
companies (1) ──── (N) company_admins
companies (1) ──── (N) company_insights
companies (1) ──── (N) company_alerts
```

### 4.3 Realtime-Enabled Tables
- users, moods, journals, screenings
- bookings, chat_channels, care_chat_messages
- chat_messages, chat_usage, payments
- company_insights, company_alerts

---

## 5. Corporate Wellness Analysis

### 5.1 Current Features

| Feature | Status | Description |
|---------|--------|-------------|
| HR Dashboard | ✅ | Stats overview for company admin |
| Employee Stats | ✅ | Total, active users, engagement rate |
| Mood Analytics | ✅ | Average mood, trends by department |
| AI Insights | ✅ | Automated recommendations |
| Department View | ✅ | Per-department breakdown |
| Alerts Tab | ✅ | Wellness alerts |
| Stress Detection | ✅ | Monday pattern analysis |

### 5.2 Corporate Dashboard Metrics

```typescript
interface CompanyStats {
  totalEmployees: number;
  activeUsers: number;        // This week
  avgMoodScore: number;       // 1-5 scale
  moodTrend: string;         // positive/negative/stable
  stressLevel: string;       // low/moderate/high
  engagementRate: number;    // % active
  journalCount: number;
  sessionCount: number;
}
```

### 5.3 AI Insights Generation

Current automated insights:
1. **Monday Stress Pattern** - Detects low moods on Mondays
2. **Department Engagement** - Alerts for low-performing teams
3. **Positive Trends** - Recognizes good wellness metrics

---

## 6. Feature Mapping

### 6.1 User Dashboard Flow

```
UserDashboard
├── Header (greeting, logout)
├── Subscription Banner (collapsible)
│   └── QrisSubscription (payment plans)
└── DashboardCarousel
    ├── Self Screening (PHQ-9 + MBTI)
    ├── Relaxation (Yoga/Art Therapy)
    ├── Weekly Insight
    ├── Holistic Care
    └── Art Therapy
```

### 6.2 Feature Access Points

| Feature | Access Method |
|---------|---------------|
| AI Chat | Nav menu + FAB |
| Mood Check-in | Nav menu |
| Journal | Nav menu |
| Self-Screening | Dashboard carousel |
| Weekly Insights | Dashboard carousel + nav |
| Professional Care | Nav menu |
| Yoga Studio | Dashboard carousel |
| Art Therapy | Dashboard carousel |
| Subscription | Dashboard banner |

---

## 7. Technical Debt & Issues

### 7.1 High Priority

| Issue | Location | Impact |
|-------|----------|--------|
| Inconsistent nav access | `navigation.tsx` | UX fragmentation |
| Missing loading states | Multiple components | Poor UX |
| Backup files uncommitted | `ai-chat-old-backup.tsx` | Codebase clutter |
| Stripe unused | `package.json` | Bundle size |

### 7.2 Medium Priority

| Issue | Location | Recommendation |
|-------|----------|----------------|
| No error boundaries | App-wide | Add React ErrorBoundary |
| No test files | N/A | Add unit tests |
| tempodevtools in prod | `package.json` | Move to devDependencies |
| Hardcoded strings | Components | Use i18n |

### 7.3 Missing Features for EAP

| Feature | Priority | Notes |
|---------|----------|-------|
| Crisis hotline | High | No emergency access |
| Legal consultation | Medium | Not implemented |
| Financial counseling | Medium | Not implemented |
| Manager support | Medium | No MAP |
| Session limits | Low | Currently unlimited |

---

## 8. Security Analysis

### 8.1 Current Security Measures

- ✅ Supabase Auth (JWT-based)
- ✅ Role-based access control
- ✅ RLS policies on tables
- ✅ Environment variables for secrets
- ✅ HTTPS deployment

### 8.2 Recommendations

- ⚠️ Add rate limiting on API routes
- ⚠️ Add input validation (Zod schemas)
- ⚠️ Implement CSRF protection
- ⚠️ Add audit logging for sensitive actions
- ⚠️ Encrypt sensitive data (EAP notes)

---

## 9. Performance Observations

### 9.1 Current Optimizations
- Next.js automatic code splitting
- React hooks for state management
- Supabase realtime subscriptions
- PWA with service worker

### 9.2 Improvement Opportunities
- Add React Query/SWR for caching
- Implement lazy loading for heavy components
- Add skeleton loading states
- Optimize bundle size (remove unused deps)

---

## 10. Recommendations for EAP Integration

### 10.1 Navigation Changes Required

**Option A: Add to existing Professional Care**
```typescript
navigationItems = [
  // ... existing items
  { id: 'professionals', label: 'Professional Care', icon: Users,
    subItems: [
      { id: 'counseling', label: 'Counseling' },
      { id: 'eap', label: 'EAP Services' },  // NEW
    ]
  },
];
```

**Option B: Add new Support section**
```typescript
navigationItems = [
  // ... existing items (reduce to 6)
  { id: 'support', label: 'Support', icon: LifeBuoy }, // NEW
];
```

**Option C: FAB for Crisis + Profile for full EAP**
- Add floating SOS button
- Add EAP section in Profile/Settings

### 10.2 Database Changes Required

New tables for EAP:
- `eap_services` - Service catalog
- `eap_consultations` - Session records
- `eap_referrals` - External referrals
- `crisis_requests` - Emergency requests

### 10.3 New Components Required

- `eap-dashboard.tsx` - EAP service hub
- `crisis-chat.tsx` - 24/7 support
- `legal-consultation.tsx` - Legal service
- `financial-counseling.tsx` - Financial advisor
- `sos-button.tsx` - Crisis FAB

---

## 11. Summary

### System Strengths
- ✅ Comprehensive wellness feature set
- ✅ Role-based access (4 roles)
- ✅ Corporate wellness dashboard
- ✅ Real-time chat capabilities
- ✅ QRIS payment integration
- ✅ PWA support

### System Gaps
- ❌ No EAP/crisis support
- ❌ Mobile nav limited to 5 items
- ❌ No test coverage
- ❌ No i18n support
- ❌ No error monitoring

### Priority Actions
1. **Add EAP module** with crisis support
2. **Improve navigation** to accommodate new features
3. **Add test coverage** for critical paths
4. **Implement error boundaries** and monitoring

---

**Analysis Complete**  
**Next Steps:** Review PRD02.md for EAP implementation details
