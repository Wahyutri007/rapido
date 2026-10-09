# Rapido

Mobile app for Rapido - a point-of-sale / operations suite built with **React Native (Expo)** and **expo-router**. It serves four role-based modes: **Back Office**, **Cashier**, **Operator**, and **Absence**, each mapped to its own route group.

## Tech Stack

- React Native 0.86 · React 19.2 · Expo SDK 57
- **expo-router 57** - file-based routing
- **TypeScript** (strict) with `@/*` path alias
- **NativeWind v4** (TailwindCSS) + **gluestack-ui**
- **TanStack Query** + **axios** for data
- **react-hook-form** + **zod** for forms
- **zustand** (persisted to SecureStore) for client state

## Getting Started

> Use npm with the committed `package-lock.json` for reproducible installs.

```bash
npm ci
npm start       # start Expo dev server
npx expo start --android
npx expo start --ios
npm run lint    # ESLint
```

Then open the app in a development build, emulator, or [Expo Go](https://expo.dev/go).

## Project Structure

```
app/           Screens (expo-router). One folder per mode/route group.
components/    Gluestack primitives (ui/), shared (common/, custom/), feature-specific (feature/)
api/           HTTP + data layer with factory-based hooks
hooks/         Shared app hooks (route guarding, secure store, ...)
store/         Zustand client state
schema/        Zod form schemas
types/         API DTOs (mirror the backend response shape)
constants/     Keys, URLs, Colors, enums
docs/          Developer docs
```

## Docs

For anything more than a quick start, see:

- **[AGENTS.md](./AGENTS.md)** - commands, folder map, and all conventions (API factory, forms, auth, styling, component placement). Read this before contributing.
- **[docs/api-scaffolding.md](./docs/api-scaffolding.md)** - how to add a new API endpoint using the factory pattern.
- **[docs/SDK57_UPGRADE.md](./docs/SDK57_UPGRADE.md)** - SDK 57 compatibility changes, validation, and Android USB setup.
- **[docs/WORKERS_UI_PROGRESS.md](./docs/WORKERS_UI_PROGRESS.md)** - hasil Karyawan, integrasi akun Role, screenshot, lokasi code, dan verifikasi API/browser.
- **[docs/MEMBER_UI_PROGRESS.md](./docs/MEMBER_UI_PROGRESS.md)** - hasil Member/pelanggan, integrasi CRUD API, screenshot, lokasi code, dan verifikasi izin.

## Backend configuration

Copy `.env.example` to `.env.local` and set the backend base/API URLs for your environment. Login and API-backed features require a running Rapido backend; some design previews still use local fixtures.

## Android over USB without an Expo account

From PowerShell in the application directory, with the backend running and USB
debugging authorized, run `npm.cmd run start:hp`. The launcher finds ADB,
checks the device/Expo Go/backend, reconnects USB port forwarding, reuses this
project's Metro server or starts one, and opens Rapido on the phone. Repeat it
after reconnecting the cable. See [the step-by-step Android guide](docs/RUN_DI_HP.md)
for prerequisites and troubleshooting. Use `npm.cmd run start:hp -- --check`
for a readiness check without opening the phone.

Install Expo Go for SDK 57, enable USB debugging, connect the phone, and authorize the computer. With Android Platform Tools installed:

```powershell
adb reverse tcp:8088 tcp:8088
adb reverse tcp:8001 tcp:8001
$env:EXPO_OFFLINE="1"
npm run start:usb
```

Run the backend on port 8001 and set `.env.local` URLs to `http://127.0.0.1:8001` and `http://127.0.0.1:8001/api`. Open `exp://127.0.0.1:8088` in Expo Go. Keep USB connected; reapply `adb reverse` after reconnecting.
