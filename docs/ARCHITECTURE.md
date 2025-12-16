# System Architecture Document
# Jiwo.AI - Mental Wellness Companion

## 1. Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Next.js 14 (App Router) + React 18             │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐ │  │
│  │  │   Pages    │  │ Components │  │  Hooks & Context   │ │  │
│  │  └────────────┘  └────────────┘  └────────────────────┘ │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │         Tailwind CSS + shadcn/ui                   │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────���──┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                      API & Services Layer                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Next.js API Routes                          │  │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────────┐  │  │
│  │  │  Payment   │  │  Webhook   │  │  Edge Functions  │  │  │
│  │  │   /qris    │  │  Handler   │  │   (Supabase)     │  │  │
│  │  └────────────┘  └────────────┘  └──────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕ REST/Realtime
┌─────────────────────────────────────────────────────────────────┐
│                      Backend Layer (Supabase)                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    PostgreSQL Database                   │  │
│  │  ┌────────┐ ┌────────┐ ┌──────────┐ ┌──────────────┐   │  │
│  │  │ Users  │ │ Moods  │ │ Journals │ │ Professionals│   │  │
│  │  └────────┘ └────────┘ └──────────┘ └──────────────┘   │  │
│  │  ┌────────┐ ┌────────┐ ┌──────────┐ ┌──────────────┐   │  │
│  │  │Bookings│ │Payments│ │  Chats   │ │Subscriptions │   │  │
│  │  └────────┘ └────────┘ └──────────┘ └──────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Supabase Auth (JWT-based)                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Supabase Realtime (WebSocket)                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Row Level Security (RLS)                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕ Webhook
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         n8n Webhook (Payment Processing)                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              QRIS Payment Gateway                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Architecture

### 2.1 Next.js App Structure

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Main app (authenticated)
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   ├── landing/                  # Landing page
│   │   └── page.tsx
│   ├── auth/                     # Authentication pages
│   │   ├── page.tsx              # Login
│   │   └── signup/
│   │       └── page.tsx          # Sign up
│   ├── dashboard/                # Dashboard routes
│   │   ├── page.tsx              # User dashboard
│   │   ├── user/
│   │   │   └── page.tsx
│   │   └── professional/
│   │       └── page.tsx          # Professional dashboard
│   ├── professionals/            # Professional listing
│   │   └── page.tsx
│   ├── plans/                    # Subscription plans
│   │   └── page.tsx
│   ├── care/                     # Care chat
│   │   └── inbox/
│   │       └── page.tsx
│   ├── welcome/                  # Onboarding
│   │   └── page.tsx
│   └── api/                      # API routes
│       └── payment/
│           ├── qris/
│           │   └── route.ts      # QRIS payment creation
│           └── webhook/
│               └── route.ts      # Payment webhook handler
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── calendar.tsx
│   │   └── ... (30+ components)
│   ├── dashboard.tsx             # Main dashboard
│   ├── navigation.tsx            # Navigation components
│   ├── mood-checkin.tsx          # Mood tracking
│   ├── ai-chat.tsx               # AI chat interface
│   ├── journal.tsx               # Journal feature
│   ├── self-screening.tsx        # Mental health screening
│   ├── weekly-insights.tsx       # Analytics dashboard
│   ├── professional-care.tsx     # Professional categories
│   ├── professional-list.tsx     # Professional listing
│   ├── professional-inbox.tsx    # Professional chat inbox
│   ├── booking-modal.tsx         # Session booking
│   ├── qris-payment-modal.tsx    # Payment modal
│   ├── yoga-studio.tsx           # Yoga videos
│   ├── art-therapy.tsx           # Art therapy
│   ├── subscription-banner.tsx   # Subscription CTA
│   ├── floating-action-button.tsx
│   ├── chatbot.tsx
│   └── care-chat/                # Care chat components
│       ├── ChatWindow.tsx
│       ├── ChatInput.tsx
│       ├── ChatMessageList.tsx
│       ├── ChatLauncher.tsx
│       ├── ProfessionalList.tsx
│       └── UserInbox.tsx
│
├── lib/                          # Utilities
│   ├── supabase.ts               # Supabase client
│   └── utils.ts                  # Helper functions
│
├── hooks/                        # Custom React hooks
│   └── useOnlineStatus.ts
│
└── types/                        # TypeScript types
    └── supabase.ts               # Database types
```

### 2.2 Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        App Layout                            │
│  ┌───────────────────────────────────��───────────────────┐  │
│  │                    Navigation                         │  │
│  │  ┌──────────────┐  ┌──────────────┐                  │  │
│  │  │Desktop Sidebar│  │Mobile Bottom │                  │  │
│  │  │              │  │   Nav Bar    │                  │  │
│  │  └──────────────┘  └──────────────┘                  │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  Main Content Area                    │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │         Feature Components (Dynamic)            │  │  │
│  ���  │  • Dashboard                                    │  │  │
│  │  │  • Mood Checkin                                 │  │  │
│  │  │  • AI Chat                                      │  │  │
│  │  │  • Journal                                      │  │  │
│  │  │  • Self Screening                               │  │  │
│  │  │  • Weekly Insights                              │  │  │
│  │  │  • Professional Care                            │  │  │
│  │  │  • Yoga Studio                                  │  │  │
│  │  │  • Art Therapy                                  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │          Floating Action Button (AI Chat)            │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 State Management

**Approach:** React Hooks + Context API (no external state management library)

```typescript
// Authentication State
useEffect(() => {
  const { data: { session } } = await supabase.auth.getSession();
  // Handle auth state
}, []);

// Local Component State
const [activeTab, setActiveTab] = useState('dashboard');
const [moods, setMoods] = useState([]);
const [journals, setJournals] = useState([]);

// Real-time Subscriptions
useEffect(() => {
  const channel = supabase
    .channel('chat_messages')
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'care_chat_messages' 
    }, handleNewMessage)
    .subscribe();
    
  return () => supabase.removeChannel(channel);
}, []);
```

---

## 3. Backend Architecture

### 3.1 Database Schema

```sql
-- Core User Tables
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  role TEXT ('user' | 'professional'),
  created_at TIMESTAMPTZ
)

-- Mental Health Tracking
moods (
  id UUID PRIMARY KEY,
  user_id UUID → users(id),
  mood_value INTEGER (1-5),
  mood_label TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ
)

journals (
  id UUID PRIMARY KEY,
  user_id UUID → users(id),
  title TEXT,
  content TEXT,
  mood_tag TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

ai_chats (
  id UUID PRIMARY KEY,
  user_id UUID → users(id),
  message TEXT,
  sender TEXT ('user' | 'ai'),
  created_at TIMESTAMPTZ
)

-- Professional Care System
professionals (
  id UUID PRIMARY KEY,
  user_id UUID → users(id),
  full_name TEXT,
  specialization TEXT,
  category TEXT,
  experience_years INTEGER,
  price_per_session NUMERIC,
  bio TEXT,
  is_available BOOLEAN,
  created_at TIMESTAMPTZ
)

bookings (
  id UUID PRIMARY KEY,
  user_id UUID → users(id),
  professional_id UUID → professionals(id),
  session_time TIMESTAMPTZ,
  status TEXT ('pending' | 'paid' | 'completed' | 'cancelled'),
  price NUMERIC,
  payment_ref TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ
)

chat_channels (
  id UUID PRIMARY KEY,
  user_id UUID → users(id),
  professional_id UUID → professionals(id),
  booking_id UUID → bookings(id),
  status TEXT ('active' | 'closed'),
  created_at TIMESTAMPTZ,
  UNIQUE(user_id, professional_id)
)

care_chat_messages (
  id UUID PRIMARY KEY,
  channel_id UUID → chat_channels(id),
  sender_id UUID → users(id),
  message TEXT,
  created_at TIMESTAMPTZ
)

-- Payment & Subscription System
plans (
  id UUID PRIMARY KEY,
  name TEXT,
  description TEXT,
  price NUMERIC,
  duration_days INTEGER,
  features JSONB,
  created_at TIMESTAMPTZ
)

subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID → users(id),
  plan_id UUID → plans(id),
  status TEXT ('pending' | 'active' | 'expired' | 'cancelled'),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  payment_ref TEXT,
  created_at TIMESTAMPTZ
)

payments (
  id UUID PRIMARY KEY,
  user_id UUID → users(id),
  amount NUMERIC,
  qris_link TEXT,
  payment_type TEXT ('subscription' | 'booking'),
  ref_code TEXT UNIQUE,
  status TEXT ('pending' | 'paid' | 'failed' | 'expired'),
  metadata JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### 3.2 Database Relationships

```
users (1) ──────────── (N) moods
users (1) ──────────── (N) journals
users (1) ──────────── (N) ai_chats
users (1) ──────────── (N) bookings
users (1) ──────────── (N) subscriptions
users (1) ──────────── (N) payments
users (1) ──────────── (1) professionals
users (1) ──────────── (N) care_chat_messages

professionals (1) ──── (N) bookings
professionals (1) ──── (N) chat_channels

bookings (1) ────────── (1) chat_channels

chat_channels (1) ──── (N) care_chat_messages

plans (1) ──────────── (N) subscriptions
```

### 3.3 Row Level Security (RLS) Policies

```sql
-- Users can only view/edit their own data
CREATE POLICY "Users can view own moods"
ON moods FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own moods"
ON moods FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Professionals can view their bookings
CREATE POLICY "Professionals can view bookings"
ON bookings FOR SELECT
USING (
  auth.uid() = user_id OR 
  auth.uid() IN (SELECT user_id FROM professionals WHERE id = professional_id)
);

-- Chat channel access
CREATE POLICY "Users can view own channels"
ON chat_channels FOR SELECT
USING (
  auth.uid() = user_id OR 
  auth.uid() IN (SELECT user_id FROM professionals WHERE id = professional_id)
);

-- Chat messages access
CREATE POLICY "Users can view channel messages"
ON care_chat_messages FOR SELECT
USING (
  channel_id IN (
    SELECT id FROM chat_channels 
    WHERE user_id = auth.uid() OR professional_id = auth.uid()
  )
);
```

### 3.4 Indexes for Performance

```sql
-- User-related indexes
CREATE INDEX idx_moods_user_id ON moods(user_id);
CREATE INDEX idx_moods_created_at ON moods(created_at DESC);
CREATE INDEX idx_journals_user_id ON journals(user_id);
CREATE INDEX idx_ai_chats_user_id ON ai_chats(user_id);

-- Professional care indexes
CREATE INDEX idx_professionals_category ON professionals(category);
CREATE INDEX idx_professionals_is_available ON professionals(is_available);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_professional_id ON bookings(professional_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Chat indexes
CREATE INDEX idx_chat_channels_user_id ON chat_channels(user_id);
CREATE INDEX idx_chat_channels_professional_id ON chat_channels(professional_id);
CREATE INDEX idx_chat_channels_booking_id ON chat_channels(booking_id);
CREATE INDEX idx_care_chat_messages_channel_id ON care_chat_messages(channel_id);
CREATE INDEX idx_care_chat_messages_created_at ON care_chat_messages(created_at DESC);

-- Payment indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_ref_code ON payments(ref_code);
CREATE INDEX idx_payments_status ON payments(status);
```

---

## 4. API Architecture

### 4.1 API Routes

```
POST   /api/payment/qris          # Create QRIS payment
POST   /api/payment/webhook       # Handle payment status updates
```

### 4.2 Payment Flow

```
┌──────────┐                    ┌──────────────┐
│  Client  │                    │   Next.js    │
│          │                    │  API Route   │
└────┬─────┘                    └──────┬───────┘
     │                                 │
     │ 1. Book Session                 │
     │ POST /api/payment/qris          │
     ├────────────────────────────────>│
     │                                 │
     │                                 │ 2. Create Payment Record
     │                                 │    in Supabase
     │                                 ├──────────────────────┐
     │                                 │                      │
     │                                 │<─────────────────────┘
     │                                 │
     │                                 │ 3. Call n8n Webhook
     │                                 │    (Generate QRIS)
     │                                 ├──────────────────────┐
     │                                 │                      │
     │                                 │<─────────────────────┘
     │                                 │
     │ 4. Return QRIS Link             │
     │<────────────────────────────────┤
     │                                 │
     │ 5. Display QR Code              │
     │                                 │
     │                                 │
     │ 6. User Scans & Pays            │
     │ (External Payment App)          │
     │                                 │
     │                                 │
     │                                 │ 7. Payment Gateway
     │                                 │    Webhook Callback
     │                                 │<─────────────────────
     │                                 │
     │                                 │ 8. Update Payment Status
     │                                 │    Update Booking Status
     │                                 │    Create Chat Channel
     │                                 ├──────────────────────┐
     │                                 │                      │
     │                                 │<─────────────────────┘
     │                                 │
     │ 9. Realtime Update              │
     │<────────────────────────────────┤
     │                                 │
     │ 10. Redirect to Chat            │
     │                                 │
```

### 4.3 Supabase Edge Functions

```
supabase/functions/
└── n8n-webhook-proxy/
    └── index.ts                  # Proxy to n8n webhook
```

**Purpose:** Securely proxy requests to n8n webhook for payment processing

---

## 5. Real-time Architecture

### 5.1 Supabase Realtime

```typescript
// Subscribe to chat messages
const channel = supabase
  .channel('chat_messages')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'care_chat_messages',
      filter: `channel_id=eq.${channelId}`
    },
    (payload) => {
      setMessages(prev => [...prev, payload.new]);
    }
  )
  .subscribe();
```

### 5.2 Realtime-Enabled Tables

- `chat_channels`
- `care_chat_messages`
- `bookings`
- `subscriptions`
- `payments`

---

## 6. Security Architecture

### 6.1 Authentication Flow

```
┌──────────┐                    ┌──────────────┐
│  Client  │                    │   Supabase   │
│          │                    │     Auth     │
└────┬─────┘                    └──────┬───────┘
     │                                 │
     │ 1. Sign Up / Login              │
     │ (email + password)              │
     ├────────────────────────────────>│
     │                                 │
     │                                 │ 2. Validate Credentials
     │                                 │    Create User Record
     │                                 ├──────────────────────┐
     │                                 │                      │
     │                                 │<─────────────────────┘
     │                                 │
     │ 3. Return JWT Token             │
     │    + Refresh Token              │
     │<────────────────────────────────┤
     │                                 │
     │ 4. Store in localStorage        │
     │                                 │
     │                                 │
     │ 5. API Request with JWT         │
     │    Authorization: Bearer <JWT>  │
     ├────────────────────────────────>│
     │                                 │
     │                                 │ 6. Verify JWT
     │                                 │    Check RLS Policies
     │                                 ├──────────────────────┐
     │                                 │                      │
     │                                 │<─────────────────────┘
     │                                 │
     │ 7. Return Data                  │
     │<────────────────────────────────┤
     │                                 │
```

### 6.2 Security Layers

1. **Transport Security:** HTTPS only
2. **Authentication:** Supabase Auth (JWT-based)
3. **Authorization:** Row Level Security (RLS)
4. **Data Validation:** TypeScript + Zod schemas
5. **Environment Variables:** Secure storage of secrets
6. **CORS:** Configured for specific origins
7. **Rate Limiting:** Supabase built-in rate limiting

---

## 7. Deployment Architecture

### 7.1 Deployment Stack

```
┌─────────────────────────────────────────────────────────────┐
│                         Vercel                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Next.js Application                      │  │
│  │  • Server-side rendering (SSR)                        │  │
│  │  • API routes                                         │  │
│  │  • Static assets                                      │  │
│  │  • Edge functions                                     │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                       Supabase Cloud                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              PostgreSQL Database                      │  │
│  │              Authentication Service                   │  │
│  │              Realtime Service                         │  │
│  │              Storage (future)                         │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                      n8n Webhook                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Payment Processing                       │  │
│  │              QRIS Generation                          │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Environment Variables

```bash
# Supabase
SUPABASE_PROJECT_ID=xxx
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_KEY=xxx
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# n8n Webhook
N8N_WEBHOOK_URL=https://xxx.app.n8n.cloud/webhook/xxx
```

### 7.3 CI/CD Pipeline

```
┌──────────────┐
│   GitHub     │
│  Repository  │
└──────┬───────┘
       │
       │ Push to main
       ↓
┌──────────────┐
│   Vercel     │
│  Auto Deploy │
└──────┬───────┘
       │
       │ Build & Deploy
       ↓
┌──────────────┐
│  Production  │
│   Website    │
└──────────────┘
```

---

## 8. Performance Optimization

### 8.1 Frontend Optimizations

- **Code Splitting:** Next.js automatic code splitting
- **Image Optimization:** Next.js Image component
- **Lazy Loading:** React.lazy() for heavy components
- **Memoization:** React.memo, useMemo, useCallback
- **Bundle Size:** Tree shaking, dynamic imports
- **Caching:** Service Worker (PWA)

### 8.2 Backend Optimizations

- **Database Indexes:** Strategic indexing on frequently queried columns
- **Connection Pooling:** Supabase built-in pooling
- **Query Optimization:** Efficient SQL queries with proper JOINs
- **Realtime Filters:** Filter at database level
- **Pagination:** Limit + offset for large datasets

### 8.3 Caching Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                      Caching Layers                          │
├─────────────────────────────────────────────────────────────┤
│  Browser Cache (Static Assets)          │ 1 year            │
│  Service Worker (PWA)                    │ Custom strategy  │
│  React Query / SWR (API responses)       │ 5 minutes        │
│  Supabase Connection Pool                │ Automatic        │
│  CDN (Vercel Edge Network)               │ Automatic        │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Monitoring & Logging

### 9.1 Monitoring Stack

- **Frontend Errors:** Browser console, Sentry (future)
- **API Monitoring:** Vercel Analytics
- **Database Monitoring:** Supabase Dashboard
- **Performance:** Vercel Speed Insights
- **Uptime:** Vercel Status Page

### 9.2 Logging Strategy

```typescript
// Client-side logging
console.error('Error:', error);
toast({ title: 'Error', description: error.message });

// Server-side logging (API routes)
console.log('[Payment] Creating QRIS payment:', { userId, amount });
console.error('[Webhook] Payment processing failed:', error);
```

---

## 10. Scalability Considerations

### 10.1 Current Capacity

- **Users:** Up to 10,000 concurrent users (Supabase free tier)
- **Database:** 500 MB storage (Supabase free tier)
- **Realtime:** 200 concurrent connections (Supabase free tier)
- **API Requests:** Unlimited (Vercel)

### 10.2 Scaling Strategy

**Phase 1 (0-1,000 users):**
- Current architecture sufficient
- Monitor database size and connections

**Phase 2 (1,000-10,000 users):**
- Upgrade Supabase to Pro plan
- Implement Redis caching
- Add CDN for static assets

**Phase 3 (10,000+ users):**
- Database read replicas
- Horizontal scaling with load balancer
- Microservices architecture for heavy features
- Dedicated payment service

---

## 11. Disaster Recovery

### 11.1 Backup Strategy

- **Database Backups:** Supabase automatic daily backups
- **Point-in-Time Recovery:** 7 days (Supabase Pro)
- **Code Repository:** GitHub (version control)
- **Environment Variables:** Secure vault storage

### 11.2 Recovery Plan

1. **Database Failure:**
   - Restore from latest Supabase backup
   - Estimated downtime: 15-30 minutes

2. **Application Failure:**
   - Rollback to previous Vercel deployment
   - Estimated downtime: 5 minutes

3. **Payment Gateway Failure:**
   - Display maintenance message
   - Queue payments for retry
   - Manual processing if needed

---

## 12. Technology Decisions

### 12.1 Why Next.js?

- ✅ Server-side rendering for SEO
- ✅ API routes for backend logic
- ✅ Excellent developer experience
- ✅ Built-in optimization
- ✅ Vercel deployment integration

### 12.2 Why Supabase?

- ✅ PostgreSQL (reliable, scalable)
- ✅ Built-in authentication
- ✅ Real-time subscriptions
- ✅ Row Level Security
- ✅ Generous free tier
- ✅ Easy to use

### 12.3 Why Tailwind CSS?

- ✅ Utility-first approach
- ✅ Rapid development
- ✅ Consistent design system
- ✅ Small bundle size
- ✅ Great with shadcn/ui

### 12.4 Why shadcn/ui?

- ✅ Accessible components
- ✅ Customizable
- ✅ Copy-paste approach (no npm bloat)
- ✅ Beautiful default styling
- ✅ TypeScript support

---

## 13. Future Architecture Enhancements

### 13.1 Short-term (Q2 2025)

- [ ] Implement Redis caching layer
- [ ] Add Sentry for error tracking
- [ ] Set up automated testing (Jest, Playwright)
- [ ] Implement rate limiting
- [ ] Add API documentation (Swagger)

### 13.2 Long-term (Q3-Q4 2025)

- [ ] Microservices for AI chat (separate service)
- [ ] Video call infrastructure (WebRTC)
- [ ] Mobile apps (React Native)
- [ ] GraphQL API layer
- [ ] Event-driven architecture (message queue)
- [ ] Multi-region deployment

---

## 14. Corporate Wellness Program Architecture

### Overview
The Corporate Wellness Program extends Jiwo.AI to support enterprise clients with HR/admin dashboards for monitoring employee wellness at scale.

### Key Components

#### 1. Database Schema
```
companies
├── company_admins (many-to-many with users)
├── company_employees (many-to-many with users)
├── company_insights (weekly aggregated data)
└── company_alerts (AI-generated notifications)
```

#### 2. Dashboard Features
- **Aggregated Analytics**: Privacy-protected employee wellness metrics
- **Department Insights**: Team-level mood and engagement tracking
- **AI-Powered Insights**: Automated pattern detection and recommendations
- **Real-time Alerts**: Proactive notifications for HR intervention

#### 3. Privacy Architecture
```
Individual Employee Data (Private)
    ↓
Aggregation Layer (Anonymization)
    ↓
Department-Level Metrics (Min 5 employees)
    ↓
Company Dashboard (HR View)
```

**Privacy Rules:**
- No individual employee data visible to HR
- Department insights require minimum 5 employees
- All metrics are aggregated and anonymized
- Employee consent required for participation
- Opt-out available at any time

#### 4. AI Insights Engine

**Pattern Detection:**
- Stress peak analysis (time-of-day, day-of-week)
- Department engagement trends
- Mood trajectory predictions
- Intervention recommendations

**Example Insights:**
```javascript
{
  type: "stress_peak",
  title: "Monday Stress Pattern Detected",
  description: "Stress levels peak on Monday mornings around 10 AM",
  severity: "warning",
  recommendation: "Consider flexible start times or Monday wellness activities"
}
```

#### 5. Data Flow

```
Employee Actions (Mood, Journal, Sessions)
    ↓
Real-time Database Updates
    ↓
Scheduled Aggregation (Daily)
    ↓
AI Analysis Engine
    ↓
Insights & Alerts Generation
    ↓
HR Dashboard Display
```

#### 6. Access Control

**Role Hierarchy:**
```
Super Admin (Jiwo.AI)
    ↓
Company Admin (HR)
    ↓
Company Employee (User)
```

**Permissions:**
- Company Admin: View aggregated data, manage employees, configure settings
- Company Employee: Standard user features + company affiliation
- Super Admin: Full system access

#### 7. Subscription Model

**Corporate Plans:**
- Basic: Rp 25,000/employee/month (min 50)
- Business: Rp 40,000/employee/month (min 100)
- Enterprise: Custom pricing (500+)

**Billing:**
- Monthly recurring
- Per-employee pricing
- Automatic scaling
- Usage-based add-ons

#### 8. Integration Points

**Current:**
- Supabase Auth (user management)
- Supabase Realtime (live updates)
- QRIS Payment (corporate billing)

**Future:**
- HR Systems (Workday, BambooHR)
- SSO (SAML, OAuth)
- Calendar (Google, Outlook)
- Slack/Teams notifications

#### 9. Performance Considerations

**Optimization:**
- Pre-aggregated metrics (daily cron)
- Indexed queries on company_id
- Cached dashboard data (5-minute TTL)
- Lazy loading for large datasets

**Scalability:**
- Horizontal scaling for analytics
- Separate read replicas for reporting
- Queue-based insight generation
- CDN for static assets

#### 10. Compliance & Security

**Data Protection:**
- GDPR compliant
- Indonesian data protection laws
- Employee consent management
- Data retention policies (90 days)
- Audit logs for HR access

**Security Measures:**
- Row-level security (RLS)
- Encrypted data at rest
- HTTPS only
- Regular security audits
- Penetration testing

### API Endpoints (Future)

```typescript
// Corporate Dashboard API
GET /api/corporate/dashboard
GET /api/corporate/insights
GET /api/corporate/departments
GET /api/corporate/alerts
POST /api/corporate/employees/invite
DELETE /api/corporate/employees/:id

// Analytics API
GET /api/corporate/analytics/mood-trends
GET /api/corporate/analytics/engagement
GET /api/corporate/analytics/stress-patterns
GET /api/corporate/analytics/export
```

### Monitoring & Alerts

**System Monitoring:**
- Dashboard load times
- Query performance
- API response times
- Error rates

**Business Monitoring:**
- Active companies
- Employee enrollment
- Feature usage
- Churn indicators

**Alert Triggers:**
- Critical stress levels (avg < 2.0)
- Low engagement (< 20%)
- Department anomalies
- System errors

---

## Appendix

### A. Technology Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | Next.js | 14.2.23 |
| UI Library | React | 18 |
| Language | TypeScript | 5 |
| Styling | Tailwind CSS | 3 |
| Component Library | shadcn/ui | Latest |
| Backend | Supabase | Latest |
| Database | PostgreSQL | 14+ |
| Authentication | Supabase Auth | Latest |
| Real-time | Supabase Realtime | Latest |
| Payment | QRIS via n8n | - |
| Deployment | Vercel | Latest |
| PWA | next-pwa | 5.6.0 |

### B. Key Dependencies

```json
{
  "dependencies": {
    "next": "14.2.23",
    "react": "^18",
    "@supabase/supabase-js": "latest",
    "tailwindcss": "^3",
    "lucide-react": "^0.468.0",
    "date-fns": "^4.1.0",
    "qrcode.react": "^4.2.0",
    "next-pwa": "^5.6.0"
  }
}
```

### C. Database Size Estimates

| Table | Estimated Rows (1 year) | Storage |
|-------|------------------------|---------|
| users | 10,000 | 2 MB |
| moods | 1,000,000 | 50 MB |
| journals | 500,000 | 200 MB |
| ai_chats | 2,000,000 | 400 MB |
| professionals | 500 | 0.5 MB |
| bookings | 50,000 | 10 MB |
| chat_messages | 500,000 | 100 MB |
| payments | 60,000 | 15 MB |
| **Total** | | **~780 MB** |

### D. API Response Times (Target)

| Endpoint | Target | Current |
|----------|--------|---------|
| GET /moods | < 200ms | ~150ms |
| POST /moods | < 300ms | ~200ms |
| GET /journals | < 200ms | ~180ms |
| POST /ai_chats | < 500ms | ~400ms |
| GET /professionals | < 300ms | ~250ms |
| POST /bookings | < 500ms | ~450ms |
| Realtime message | < 100ms | ~80ms |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 2025 | Jiwo.AI Team | Initial architecture document |