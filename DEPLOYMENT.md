# Deployment Guide

This guide covers deploying the Video Generator app as both a web application (Railway) and as an Android mobile app.

---

## 📦 Railway Web Deployment

### Prerequisites

- [Railway Account](https://railway.app) (free tier available)
- Google Gemini API Key

### Method 1: Deploy from GitHub (Recommended)

1. **Push your code to GitHub** (if not already done)
   ```bash
   git push origin main
   ```

2. **Create a new project on Railway**
   - Visit [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure environment variables**
   - In your Railway project dashboard, go to "Variables"
   - Add the following variable:
     ```
     API_KEY=your_gemini_api_key_here
     ```

4. **Deploy**
   - Railway will automatically detect the configuration and deploy
   - The app will be built and deployed automatically
   - You'll get a public URL like `https://your-app.up.railway.app`

### Method 2: Deploy using Railway CLI

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Initialize and deploy**
   ```bash
   railway init
   railway up
   ```

4. **Add environment variables**
   ```bash
   railway variables set API_KEY=your_gemini_api_key_here
   ```

5. **Generate domain**
   ```bash
   railway domain
   ```

### Configuration Files

The following files configure Railway deployment:

- **`railway.json`**: Railway-specific configuration
- **`nixpacks.toml`**: Build configuration for Nixpacks
- **`server.js`**: Production Express server
- **`package.json`**: Contains build and start scripts

### Deployment Process

When you deploy to Railway:

1. Railway installs dependencies: `npm ci`
2. Builds the Vite app: `npm run build`
3. Starts the Express server: `node server.js`
4. App is available on generated domain

### Environment Variables

Required:
- `API_KEY`: Your Google Gemini API key
- `SORA_API_KEY`: Your OpenAI Sora API key

Optional:
- `SORA_MODEL`: Sora model to use (default: `sora-2`)
- `SORA_API_BASE_URL`: Override the Sora API base URL (default: `https://api.openai.com/v1`)
- `PORT`: Server port (Railway sets this automatically)

### Monitoring & Logs

- View logs in Railway dashboard
- Monitor usage and metrics
- Set up custom domains in Railway settings

---

## 📱 Android App Deployment

### Prerequisites

- [Android Studio](https://developer.android.com/studio) installed
- Java JDK 11 or higher
- Android SDK (comes with Android Studio)

### Initial Setup

The Android platform has already been initialized. If you need to re-initialize:

```bash
npm run android:init
```

### Development Build

1. **Build the web assets**
   ```bash
   npm run build
   ```

2. **Sync with Android project**
   ```bash
   npm run android:sync
   ```

3. **Open in Android Studio**
   ```bash
   npm run android:open
   ```

4. **Run on emulator or device**
   - In Android Studio, select your device/emulator
   - Click the "Run" button (green play icon)
   - Or use: `npm run android:run`

### Production Build (APK)

1. **Generate a signing key** (first time only)
   ```bash
   cd android
   keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure signing in `android/app/build.gradle`**
   Add this before the `android` block:
   ```gradle
   def keystoreProperties = new Properties()
   def keystorePropertiesFile = rootProject.file('keystore.properties')
   if (keystorePropertiesFile.exists()) {
       keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
   }
   ```

   Update the `buildTypes` section:
   ```gradle
   buildTypes {
       release {
           minifyEnabled false
           proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
           signingConfig signingConfigs.release
       }
   }

   signingConfigs {
       release {
           keyAlias keystoreProperties['keyAlias']
           keyPassword keystoreProperties['keyPassword']
           storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
           storePassword keystoreProperties['storePassword']
       }
   }
   ```

3. **Create `android/keystore.properties`**
   ```properties
   storePassword=your_store_password
   keyPassword=your_key_password
   keyAlias=my-key-alias
   storeFile=my-release-key.keystore
   ```

4. **Build the APK**
   ```bash
   npm run android:build
   ```

   Or manually:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

5. **Find your APK**
   The signed APK will be at:
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

### Android App Bundle (AAB) for Google Play

1. **Build AAB instead of APK**
   ```bash
   cd android
   ./gradlew bundleRelease
   ```

2. **Find your AAB**
   ```
   android/app/build/outputs/bundle/release/app-release.aab
   ```

### Publishing to Google Play Store

1. **Create a Google Play Console account**
   - Visit [play.google.com/console](https://play.google.com/console)
   - Pay one-time $25 registration fee

2. **Create a new app**
   - Click "Create app"
   - Fill in app details
   - Upload screenshots, icon, description

3. **Upload your AAB**
   - Go to "Production" > "Create new release"
   - Upload your AAB file
   - Fill in release notes
   - Submit for review

4. **Wait for approval**
   - Google typically reviews apps within 1-7 days
   - Address any feedback from Google

### App Configuration

Key files for customization:

- **App Name**: `android/app/src/main/res/values/strings.xml`
- **App Icon**: Replace images in `android/app/src/main/res/mipmap-*/`
- **Package Name**: `capacitor.config.ts` (`appId`)
- **Permissions**: `android/app/src/main/AndroidManifest.xml`

### Updating the App

1. **Make your code changes**

2. **Update version in `android/app/build.gradle`**
   ```gradle
   versionCode 2  // Increment this
   versionName "1.1"  // Update version name
   ```

3. **Rebuild and sync**
   ```bash
   npm run android:sync
   ```

4. **Build new APK/AAB**
   ```bash
   npm run android:build
   ```

### Troubleshooting

#### Build fails with "SDK location not found"

Create `android/local.properties`:
```properties
sdk.dir=/path/to/your/Android/sdk
```

On Mac/Linux:
```properties
sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk
```

On Windows:
```properties
sdk.dir=C\:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\sdk
```

#### "Cleartext Traffic" error

Already configured in `capacitor.config.ts`. If issues persist, add to `AndroidManifest.xml`:
```xml
<application
    android:usesCleartextTraffic="true">
```

#### API calls fail in Android app

Make sure your API key is properly configured. For production, you may want to:
1. Use environment-specific API keys
2. Implement API key rotation
3. Add request signing for security

---

## 🔐 Security Best Practices

### For Web Deployment

1. **Never commit API keys to Git**
   - Use environment variables
   - Add `.env` to `.gitignore`

2. **Enable CORS properly**
   - Configure allowed origins
   - Use HTTPS in production

3. **Rate limiting**
   - Implement API rate limiting
   - Monitor usage to prevent abuse

### For Android App

1. **Secure API keys**
   - Consider using a backend proxy
   - Don't hardcode keys in the app

2. **ProGuard/R8**
   - Enable code minification for production
   - Obfuscate sensitive code

3. **App signing**
   - Keep your keystore file secure
   - Never commit keystore to Git
   - Back up your keystore safely

---

## 📊 Monitoring & Analytics

### Web App

- Use Railway's built-in monitoring
- Consider adding:
  - Google Analytics
  - Sentry for error tracking
  - Uptime monitoring (UptimeRobot, Pingdom)

### Android App

- Google Play Console analytics
- Firebase Analytics (optional)
- Crashlytics for crash reporting

---

## 🚀 Performance Optimization

### Web

- Already using Vite for optimized builds
- Static assets are gzip compressed
- Consider adding:
  - CDN (Cloudflare)
  - Service Workers for offline support
  - Image optimization

### Android

- Enable ProGuard in release builds
- Optimize image assets
- Consider WebP format for images
- Implement lazy loading where possible

---

## 📝 Useful Commands Reference

### Web Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
```

### Android Development
```bash
npm run android:init    # Initialize Android platform
npm run android:sync    # Sync web assets to Android
npm run android:open    # Open in Android Studio
npm run android:run     # Build and run on device
npm run android:build   # Build production APK
```

### Railway
```bash
railway login          # Login to Railway
railway init           # Initialize project
railway up             # Deploy
railway logs           # View logs
railway variables      # Manage environment variables
```

---

## 🆘 Support & Resources

- **Capacitor Docs**: https://capacitorjs.com/docs
- **Railway Docs**: https://docs.railway.app
- **Vite Docs**: https://vitejs.dev
- **Android Developer Docs**: https://developer.android.com
- **Google Gemini API Docs**: https://ai.google.dev/gemini-api/docs

---

## 📄 License

Apache-2.0
