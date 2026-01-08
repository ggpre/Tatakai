# 🎬 Tatakai - Android App

A feature-rich anime streaming mobile app built with React Native and Expo, matching the web version's beautiful UI.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.76-blue)
![Expo](https://img.shields.io/badge/Expo-52-blue)

## ✨ Features

### 🎥 Core Features
- **Anime Streaming** - Watch anime with HLS video player
- **Search & Discovery** - Find your favorite anime
- **Continue Watching** - Resume where you left off
- **Favorites & Watchlist** - Save anime for later
- **Episode Selection** - Browse and select episodes

### 📱 Mobile-Specific Features
- **Offline Downloads** - Download episodes for offline viewing
- **Background Downloads** - Downloads continue in background
- **Download Management** - Pause, resume, delete downloads
- **Offline Playback** - Watch without internet connection
- **Fullscreen Mode** - Immersive video playback
- **Gesture Controls** - Swipe to seek, double-tap to skip
- **Skip Intro/Outro** - AniSkip integration

### 👥 User Features
- **Authentication** - Sign in with Supabase Auth
- **Profile Management** - User profiles
- **Watch History** - Track viewing progress
- **Cross-Device Sync** - Sync progress across devices

### 🎨 Design
- **Dark Theme** - Beautiful dark glassmorphic UI
- **Smooth Animations** - Native feeling transitions
- **Responsive Layout** - Adapts to all screen sizes
- **Bottom Navigation** - Easy one-handed use

## 🚀 Tech Stack

- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **React Navigation** - Navigation library
- **Zustand** - State management
- **Expo AV** - Video playback
- **Expo File System** - File downloads
- **Supabase** - Backend as a Service

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Setup

1. **Navigate to the Android app directory**
```bash
cd tatakai-android
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npx expo start
```

4. **Run on Android**
```bash
npx expo run:android
```

5. **Run on iOS** (macOS only)
```bash
npx expo run:ios
```

## 📱 Building for Production

### Android APK
```bash
npx expo build:android -t apk
```

### Android App Bundle (for Play Store)
```bash
npx expo build:android -t app-bundle
```

### iOS (requires Apple Developer account)
```bash
npx expo build:ios
```

### Using EAS Build (recommended)
```bash
npm install -g eas-cli
eas build --platform android
```

## 🗂 Project Structure

```
tatakai-android/
├── App.tsx                 # App entry point
├── app.json               # Expo configuration
├── src/
│   ├── components/        # Reusable components
│   │   ├── layout/       # Layout components
│   │   ├── ui/           # UI components
│   │   ├── anime/        # Anime-specific components
│   │   └── video/        # Video player components
│   ├── screens/          # App screens
│   ├── navigation/       # Navigation configuration
│   ├── contexts/         # React contexts
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utilities and API
│   ├── services/        # Services (download, etc.)
│   ├── store/           # Zustand stores
│   └── types/           # TypeScript types
├── assets/              # Images and fonts
└── package.json
```

## 🔐 Environment Variables

Create a `.env` file (optional - defaults are built-in):

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

## 📲 Key Screens

1. **Home** - Spotlight anime, trending, continue watching
2. **Search** - Search for anime
3. **Trending** - Top airing anime
4. **Favorites** - Saved anime
5. **Profile** - User profile and settings
6. **Anime Details** - Episode list, info, download
7. **Watch** - Video player with controls
8. **Downloads** - Manage offline content
9. **Settings** - App preferences

## 🎮 Video Player Features

- Play/Pause controls
- Seek forward/backward (10s)
- Fullscreen toggle
- Progress bar
- Skip intro/outro buttons
- Server selection
- Sub/Dub toggle
- Subtitle support

## 📥 Download Features

- Download individual episodes
- View download progress
- Pause/Resume downloads
- Delete downloads
- Offline playback
- Download queue management

## 🙏 Acknowledgments

- [Consumet API](https://github.com/consumet/consumet.ts) - Anime data
- [AniSkip API](https://api.aniskip.com) - Skip timestamps
- [Supabase](https://supabase.com) - Backend
- [Expo](https://expo.dev) - Development platform

## 👨‍💻 Author

**Snozxyx** - [GitHub](https://github.com/Snozxyx)

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ by [Snozxyx](https://github.com/Snozxyx)
