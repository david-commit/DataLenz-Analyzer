# DataLens Analyzer - Play Store Release Checklist

This comprehensive guide covers everything you need to prepare your Expo app for Google Play Store release and how to build an APK/AAB locally.

---

## 📋 Pre-Release Checklist

### 1. App Configuration (`app.json`) ✅ DONE

| Item | Status | Value |
|------|--------|-------|
| App Name | ✅ | `DataLens Analyzer` |
| Slug | ✅ | `datalens-analyzer` |
| Version | ✅ | `1.0.0` |
| Android Package | ✅ | `com.datalens.analyzer` |
| Adaptive Icon | ✅ | Configured (need asset) |
| Splash Screen | ✅ | Configured (need asset) |
| Permissions | ✅ | Camera, Storage |

### 2. EAS Configuration (`eas.json`) ✅ DONE

Build profiles configured:
- `development` - APK with dev client
- `preview` - APK for testing/sideloading
- `production` - AAB for Play Store

---

## 🖼️ Asset Requirements (ACTION NEEDED)

| Asset | Dimensions | Status | Location |
|-------|------------|--------|----------|
| App Icon | 1024x1024 px | ⚠️ Verify | `assets/images/icon.png` |
| Adaptive Icon Foreground | 1024x1024 px | ❌ **Create** | `assets/images/adaptive-icon.png` |
| Splash Screen | 1284x2778 px | ❌ **Create** | `assets/images/splash.png` |
| Feature Graphic (Play Store) | 1024x500 px | ❌ Create | Upload to Play Console |
| Screenshots | Various sizes | ❌ Create | Upload to Play Console |

> [!IMPORTANT]
> **Adaptive Icon**: Create a foreground image (your logo centered) with transparent background. Use dimensions 1024x1024px. The logo should be within the safe zone (center 66% of the image) to avoid clipping.

### Quick Asset Creation Tips:
1. **Adaptive Icon**: Use your main icon but ensure the logo is centered with padding
2. **Splash Screen**: Simple design with logo centered on `#1a1a2e` background
3. **Feature Graphic**: Banner image with app name and key value proposition

---

## 🛠️ Android Studio Installation Guide

Since you need to install Android Studio for local builds, follow these steps:

### Step 1: Download Android Studio

1. Go to: https://developer.android.com/studio
2. Download **Android Studio** (Latest version)
3. Run the installer

### Step 2: Install Android Studio

1. Run the downloaded `.exe` file
2. Follow the setup wizard:
   - Choose **Standard** installation
   - Accept all licenses
   - Wait for component downloads (~2-4 GB)

### Step 3: Install Android SDK

1. Open Android Studio
2. Go to **Tools > SDK Manager** (or click "More Actions" on welcome screen)
3. Under **SDK Platforms** tab:
   - Check **Android 14.0 (API 34)** or latest
   - Check **Android 13.0 (API 33)**
4. Under **SDK Tools** tab, ensure these are checked:
   - Android SDK Build-Tools
   - Android SDK Command-line Tools
   - Android SDK Platform-Tools
   - Android Emulator (optional, for testing)
5. Click **Apply** and wait for downloads

### Step 4: Set Environment Variables

1. Open **System Properties** > **Advanced** > **Environment Variables**
2. Under **User variables**, add:

   | Variable | Value |
   |----------|-------|
   | `ANDROID_HOME` | `C:\Users\david\AppData\Local\Android\Sdk` |
   | `JAVA_HOME` | `C:\Program Files\Android\Android Studio\jbr` |

3. Edit **Path** variable and add:
   ```
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\tools
   %ANDROID_HOME%\tools\bin
   ```

4. **Restart your terminal/computer** for changes to take effect

### Step 5: Verify Installation

Open a new terminal and run:
```bash
# Check Android SDK
adb --version

# Check Java
java -version
```

---

## 🔧 Building the APK/AAB

### Prerequisites Checklist
- [ ] Android Studio installed
- [ ] Environment variables set
- [ ] Terminal restarted after env setup
- [ ] EAS CLI installed (`npm install -g eas-cli`)

### Install EAS CLI

```bash
npm install -g eas-cli
```

### Login to Expo

```bash
eas login
```

### Initialize EAS Project

```bash
# Run this first time to link project
eas build:configure
```

> [!NOTE]
> This will prompt you to create/select an Expo project. Follow the prompts.

---

### Option 1: Local Build (Preferred)

```bash
# Build APK locally (for testing/sideloading)
eas build --platform android --profile preview --local

# Build AAB locally (for Play Store submission)
eas build --platform android --profile production --local
```

> [!TIP]
> First local build takes 20-40 minutes as it downloads Android build tools. Subsequent builds are faster.

**Output locations:**
- APK: `build-*.apk` in project root
- AAB: `build-*.aab` in project root

---

### Option 2: Cloud Build (Expo EAS Servers)

```bash
# Build APK in cloud
eas build --platform android --profile preview

# Build AAB for Play Store
eas build --platform android --profile production
```

After build completes, download from the URL provided or from expo.dev dashboard.

---

### Option 3: Expo Prebuild + Android Studio

For full native control:

```bash
# Generate native Android project
npx expo prebuild --platform android

# Then open Android Studio:
# File > Open > Select the "android" folder
# Build > Build Bundle(s) / APK(s) > Build APK(s)
```

---

## 📱 Play Store Console Setup

### 1. Create Developer Account
- Go to: https://play.google.com/console
- Pay one-time $25 registration fee
- Complete identity verification

### 2. Create New App
1. Click **Create app**
2. Enter app details:
   - App name: `DataLens Analyzer`
   - Default language: English
   - App or game: App
   - Free or paid: Choose accordingly
3. Accept declarations

### 3. Store Listing Requirements

| Section | Content Needed |
|---------|----------------|
| **Short description** | Max 80 chars. E.g., "Capture charts and get AI-powered insights instantly" |
| **Full description** | Max 4000 chars. Detailed app features and benefits |
| **App icon** | 512x512 PNG |
| **Feature graphic** | 1024x500 PNG/JPG |
| **Phone screenshots** | Min 2 screenshots (16:9 or 9:16) |
| **Category** | Productivity or Tools |
| **Contact email** | Your support email |
| **Privacy policy URL** | Required - must be publicly accessible |

### 4. Content Rating
- Complete the questionnaire in Play Console
- Expected rating: **Everyone** (E) for a utility app

### 5. Data Safety Declaration

Answer questions about:
- [ ] Data collection (camera images, user data)
- [ ] Data sharing (with analysis backend)
- [ ] Data security measures
- [ ] Data deletion options

---

## 🔐 App Signing

### Recommended: Let Google Manage Signing
1. In Play Console, go to **Setup > App signing**
2. Choose **Let Google manage my app signing key**
3. Upload your AAB - Google handles the rest

### Alternative: Your Own Keystore
```bash
# Generate keystore (save password securely!)
keytool -genkeypair -v -storetype PKCS12 -keystore datalens.keystore -alias datalens -keyalg RSA -keysize 2048 -validity 10000
```

> [!CAUTION]
> **NEVER lose your keystore!** Without it, you cannot update your app. Back it up securely and never commit to git.

---

## ✅ Final Pre-Submission Checklist

### Configuration
- [x] `app.json` updated with correct names and package
- [x] `eas.json` created with build profiles
- [ ] Update `.gitignore` to exclude sensitive files

### Assets
- [ ] Create `assets/images/adaptive-icon.png` (1024x1024)
- [ ] Create `assets/images/splash.png` (1284x2778)
- [ ] Verify `assets/images/icon.png` is 1024x1024

### Environment Setup
- [ ] Install Android Studio
- [ ] Set ANDROID_HOME and JAVA_HOME
- [ ] Install EAS CLI
- [ ] Run `eas login`
- [ ] Run `eas build:configure`

### Testing
- [ ] Build APK: `eas build --platform android --profile preview --local`
- [ ] Install on physical device
- [ ] Test all features
- [ ] Test camera permissions
- [ ] Test dark/light mode
- [ ] Test on different screen sizes

### Play Store
- [ ] Create developer account
- [ ] Prepare store listing content
- [ ] Create feature graphic and screenshots
- [ ] Write privacy policy
- [ ] Complete data safety form

### Build & Submit
- [ ] Build AAB: `eas build --platform android --profile production --local`
- [ ] Upload AAB to Play Console
- [ ] Submit for review

---

## 🚀 Quick Commands Reference

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure project
eas build:configure

# Build APK (testing)
eas build --platform android --profile preview --local

# Build AAB (Play Store)
eas build --platform android --profile production --local

# Check build status (for cloud builds)
eas build:list
```

---

## 📁 Project Files Summary

| File | Status | Purpose |
|------|--------|---------|
| `app.json` | ✅ Updated | Expo app configuration |
| `eas.json` | ✅ Created | EAS build profiles |
| `assets/images/icon.png` | ⚠️ Verify | App icon (1024x1024) |
| `assets/images/adaptive-icon.png` | ❌ Create | Android adaptive icon |
| `assets/images/splash.png` | ❌ Create | Splash screen |

---

> [!WARNING]
> Add to `.gitignore`:
> ```
> *.keystore
> google-service-account.json
> build-*.apk
> build-*.aab
> ```
