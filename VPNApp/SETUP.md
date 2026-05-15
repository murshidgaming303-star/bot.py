# TurboVPN App — Setup Guide

## Requirements

- Node.js 18+
- React Native CLI: `npm install -g react-native-cli`
- Android Studio with SDK 33+
- Java 17

## Install & Run

```bash
cd VPNApp
npm install
npx react-native run-android
```

## Real WireGuard Server Setup

1. Get a Linux VPS (Ubuntu 22.04)
2. Run: `apt install wireguard`
3. Generate server keys:
   ```bash
   wg genkey | tee server_priv.key | wg pubkey > server_pub.key
   ```
4. Copy `server_pub.key` into `src/services/ApiService.js` → `publicKey` field
5. Set `endpoint` to your server IP:51820

## Backend API (Optional)

Connect to your Telegram bot backend to:
- Generate per-user WireGuard private keys
- Store user plans (free/premium)
- Serve real configs via `/api/config`

Edit `src/services/WireGuardService.js` → `fetchUserConfig()` function.

## Customize

| File | What to change |
|------|----------------|
| `src/services/ApiService.js` | Server list, endpoints, public keys |
| `src/services/WireGuardService.js` | Backend API URL |
| `src/screens/AccountScreen.js` | Telegram support link, pricing |
| `src/theme.js` | Colors, fonts |

## Build APK (Release)

```bash
cd android
./gradlew assembleRelease
# APK at: android/app/build/outputs/apk/release/app-release.apk
```
