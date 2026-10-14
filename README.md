# 🔥 ConfessApp - Anonymous University Confessions

> An ultra-sleek, end-to-end anonymous confession and campus community mobile application built with **React Native**, **Expo SDK 54**, **NativeWind v4 (Tailwind CSS)**, **Zustand**, and **Supabase**.

---

## ✨ Features

* **🔒 100% End-to-End Anonymous**: No user registrations, passwords, tracking, or device fingerprints. Students can post freely and safely.
* **⚡ Live Realtime Feed**: Powered by Supabase Postgres changes (`INSERT`, `UPDATE`, `DELETE`) so posts and reaction counts sync across devices in real time.
* **🏫 Multi-Campus Filtering**:
  * Filter posts strictly by university campus (e.g., *UET Lahore*, *FAST-NUCES*, *NUST*, *LUMS*, *COMSATS*, *GIKI*, *Punjab University*, and custom campuses).
  * Nationwide *"All Universities"* toggle to explore stories from students across the country.
* **🏷️ Categorized Feeds**:
  * **🔥 Confessions**: Crushes, campus secrets, and untold truths.
  * **😤 Rants**: Course complaints, grading woes, and venting.
  * **😂 Funny**: Campus memes, hostel comedy, and relatable moments.
  * **💡 Advice**: Senior tips, exam prep, and relationship guidance.
  * **💬 General**: Open discussion and campus discussions.
* **❤️ Interactive Emoji Reactions**:
  * 4 distinct reaction types: Heart (❤️), Laugh (😂), Shock (😲), and Sad (😢).
  * Instant optimistic UI updates with automatic rollback on network failure.
  * Persistent user reactions stored locally via `AsyncStorage`.
* **✍️ Immersive Full-Screen Composer**:
  * 500-character counter with live countdown.
  * Inline university switcher directly inside the composer.
  * Multi-action submission with visual loading feedback and haptics.
* **🚩 Community Moderation & Safety**:
  * One-tap post reporting that hides flagged content locally and updates community moderation counters.
* **🎨 Ember & Slate Dark Theme**:
  * Custom dark design system (`base-950`, `base-900`, `base-800`, `ember-500`, `ember-400`, `mist-400`) crafted for maximum readability at night.

---

## 🛠️ Tech Stack

* **Framework**: [Expo SDK 54](https://expo.dev) with [Expo Router v6](https://docs.expo.dev/router/introduction) (File-based navigation)
* **Runtime**: React Native 0.81 & React 19
* **Styling**: [NativeWind v4](https://www.nativewind.dev/) (Tailwind CSS 3.4)
* **State Management**: [Zustand v5](https://github.com/pmndrs/zustand)
* **Backend & Realtime**: [Supabase](https://supabase.com) (PostgreSQL Database & WebSockets)
* **Storage**: `@react-native-async-storage/async-storage`
* **Icons**: `@expo/vector-icons` (Ionicons & Feather)
* **Feedback**: `expo-haptics`

---

## 📁 Project Architecture

```
confessions-app/
├── app/
│   ├── _layout.tsx           # Root navigation stack & theme setup
│   └── index.tsx             # Main feed screen with pull-to-refresh & infinite scroll
├── components/
│   ├── Header.tsx            # Top navigation bar, campus pill & live indicator
│   ├── CategoryTabs.tsx      # Horizontal category filter pills
│   ├── PostCard.tsx          # Card with category badge, timestamp & reactions
│   ├── CreatePostModal.tsx   # Full-screen confession composer with inline campus picker
│   ├── CampusSelectorModal.tsx # University picker modal with nationwide toggle
│   └── EmptyFeed.tsx         # Empty state illustration and CTA
├── lib/
│   └── supabase.ts           # Supabase client with AsyncStorage session config
├── stores/
│   └── use-post.store.ts     # Zustand store handling feed, pagination, reactions & realtime
├── types/
│   ├── post.ts               # Post, PostCategory, and ReactionType models
│   └── replies.ts            # Reply model
├── utils/
│   └── date.ts               # Relative time ago formatter (e.g. '5m ago', '2h ago')
├── global.css                # Tailwind directives
├── tailwind.config.js        # Theme palette and content paths
└── babel.config.js           # NativeWind preset configuration
```

---

## 🗄️ Database Schema (Supabase / PostgreSQL)

### `public.posts`
```sql
create table public.posts (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  content text not null,
  reaction_heart bigint not null default 0,
  reaction_shock bigint not null default 0,
  reaction_sad bigint not null default 0,
  reaction_laugh bigint not null default 0,
  category text not null,
  campus text not null,
  reported_count bigint not null default 0,
  constraint posts_pkey primary key (id)
) tablespace pg_default;

create index if not exists idx_posts_campus on public.posts using btree (campus);
```

### `public.replies`
```sql
create table public.replies (
  id uuid not null default gen_random_uuid (),
  post_id uuid not null,
  content text not null,
  created_at timestamp without time zone not null default now(),
  constraint replies_pkey primary key (id),
  constraint replies_post_id_fkey foreign key (post_id) references posts (id) on delete cascade,
  constraint replies_content_check check ((char_length(content) <= 200))
) tablespace pg_default;
```

---

## 🚀 Getting Started

### 1. Prerequisites
* [Node.js](https://nodejs.org) (v18 or higher)
* [Expo Go](https://expo.dev/go) app on your iOS or Android device

### 2. Installation
```bash
git clone <repo-url>
cd confessions-app
npm install
```

### 3. Start Development Server
```bash
npx expo start -c
```
* Press `a` to open in Android Emulator
* Press `i` to open in iOS Simulator
* Scan the QR code using the Expo Go camera to test on a physical device

---

## 🛡️ License
Private project. All rights reserved.