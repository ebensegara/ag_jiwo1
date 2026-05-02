# Graph Report - jiwof-master  (2026-05-01)

## Corpus Check
- 191 files · ~138,674 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 466 nodes · 586 edges · 20 communities detected
- Extraction: 82% EXTRACTED · 18% INFERRED · 0% AMBIGUOUS · INFERRED: 105 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 27|Community 27]]

## God Nodes (most connected - your core abstractions)
1. `toast()` - 60 edges
2. `getSafeUser()` - 26 edges
3. `a` - 18 edges
4. `r` - 15 edges
5. `y` - 13 edges
6. `useToast()` - 10 edges
7. `POST()` - 9 edges
8. `f()` - 8 edges
9. `v` - 8 edges
10. `h()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `handleLogout()` --calls--> `toast()`  [INFERRED]
  src\app\dashboard\corporate\page.tsx → src\components\ui\use-toast.ts
- `handleLogout()` --calls--> `toast()`  [INFERRED]
  src\app\dashboard\professional\page.tsx → src\components\ui\use-toast.ts
- `handleLogout()` --calls--> `toast()`  [INFERRED]
  src\app\dashboard\user\page.tsx → src\components\ui\use-toast.ts
- `handleLogout()` --calls--> `toast()`  [INFERRED]
  src\app\dashboard\user\my-journey\page.tsx → src\components\ui\use-toast.ts
- `fetchMessages()` --calls--> `toast()`  [INFERRED]
  src\components\ai-chat-old-backup.tsx → src\components\ui\use-toast.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (19): a, b(), c(), d(), deleteCacheAndMetadata(), e(), et(), f() (+11 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (36): checkAdminAccess(), fetchCompanies(), fetchCompanyDetails(), fetchProfessionals(), handleAddAdmin(), handleAddEmployee(), handleAddProfessional(), handleCreateCompany() (+28 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (20): checkUserRole(), fetchProfessionals(), fetchChannels(), initializeInbox(), fetchChatUsage(), fetchMessages(), handleKeyPress(), handleSendMessage() (+12 more)

### Community 3 - "Community 3"
Cohesion: 0.18
Nodes (10): fetchUserAndPreferences(), handlePanic(), handleProactiveToggle(), triggerProactiveGreeting(), g(), r, st(), T() (+2 more)

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (14): BookingPage(), DesktopSidebar(), MobileHeader(), QRISPaymentModal(), ChatRoomPage(), ProfessionalProfilePage(), PaymentPage(), CorporateSetup() (+6 more)

### Community 5 - "Community 5"
Cohesion: 0.17
Nodes (3): $(), h(), y

### Community 6 - "Community 6"
Cohesion: 0.3
Nodes (9): getGeminiClient(), getSupabaseClient(), POST(), createEmbedding(), getSupabaseAdmin(), recallMemories(), saveMemory(), getGeminiClient() (+1 more)

### Community 7 - "Community 7"
Cohesion: 0.24
Nodes (6): fetchChatUsage(), fetchMessages(), handleKeyPress(), handleSendMessage(), handleTopicSelect(), sendTopicWebhook()

### Community 8 - "Community 8"
Cohesion: 0.42
Nodes (7): generateRefNo(), generateSignature(), getSupabaseClient(), POST(), processBookingPayment(), processSubscriptionPayment(), validateSignature()

### Community 9 - "Community 9"
Cohesion: 0.31
Nodes (6): calculateMBTI(), handleMentalAnswerChange(), handleMentalSubmit(), handlePersonalityAnswerChange(), handlePersonalitySubmit(), handleQuickReply()

### Community 10 - "Community 10"
Cohesion: 0.43
Nodes (6): checkProfessionalAccess(), handleAvailabilityToggle(), handleLogout(), loadBookings(), loadStats(), updateBookingStatus()

### Community 12 - "Community 12"
Cohesion: 0.29
Nodes (2): fetchOnlineProfessionals(), getOnlineProfessionals()

### Community 13 - "Community 13"
Cohesion: 0.33
Nodes (3): fetchSubscriptionStatus(), handlePaymentSuccess(), handlePlanSelect()

### Community 15 - "Community 15"
Cohesion: 0.6
Nodes (5): getSupabaseClient(), POST(), processBookingPayment(), processSubscriptionPayment(), verifySignature()

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (2): b(), s()

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (2): GET(), getSupabaseClient()

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (2): GET(), getSupabaseClient()

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (2): getSupabaseClient(), POST()

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (2): GET(), POST()

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (2): handleKeyPress(), handleSendMessage()

## Knowledge Gaps
- **Thin community `Community 12`** (7 nodes): `fetchOnlineProfessionals()`, `checkChatPaywall()`, `getOnlineProfessionals()`, `subscribeProfessionalStatus()`, `updateProfessionalOnlineStatus()`, `pro-online-list.tsx`, `professional.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (3 nodes): `b()`, `sw.js`, `s()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (3 nodes): `GET()`, `getSupabaseClient()`, `route.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (3 nodes): `route.ts`, `GET()`, `getSupabaseClient()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (3 nodes): `route.ts`, `getSupabaseClient()`, `POST()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (3 nodes): `GET()`, `POST()`, `route.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (3 nodes): `handleKeyPress()`, `handleSendMessage()`, `chatbot.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `toast()` connect `Community 1` to `Community 2`, `Community 3`, `Community 4`, `Community 7`, `Community 9`, `Community 10`, `Community 13`?**
  _High betweenness centrality (0.174) - this node is a cross-community bridge._
- **Why does `getSafeUser()` connect `Community 2` to `Community 1`, `Community 3`, `Community 7`, `Community 9`, `Community 10`, `Community 13`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Are the 57 inferred relationships involving `toast()` (e.g. with `handleSubmit()` and `handleSubmit()`) actually correct?**
  _`toast()` has 57 INFERRED edges - model-reasoned connections that need verification._
- **Are the 25 inferred relationships involving `getSafeUser()` (e.g. with `initChat()` and `checkAdminAccess()`) actually correct?**
  _`getSafeUser()` has 25 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._