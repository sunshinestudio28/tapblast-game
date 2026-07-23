# Tap Blast — APK Build Guide (with AdMob Ads)

Yeh project **Capacitor** use karta hai — game ko native Android app mein wrap karta hai taaki AdMob ads real device pe chal sakein (plain PWA mein ye kaam nahi karta).

## Kya-kya chahiye (ek baar install karna hai)

1. **Node.js** — https://nodejs.org (LTS version download karo, install karo)
2. **Android Studio** — https://developer.android.com/studio (isme Android SDK bhi aa jata hai automatically)
3. Android Studio open karke pehli baar SDK download hone do (Setup Wizard follow karo)

## Build steps

Terminal/Command Prompt kholo aur is project folder ke andar jao, phir:

```bash
npm install
npx cap add android
npx cap sync
npx cap open android
```

Last command Android Studio kholega project ke saath. Wahan se:

1. Upar menu se **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Build complete hone ke baad "locate" link pe click karo — APK file mil jayegi (`app-debug.apk`)
3. Yeh **test/debug APK** hoga — apne phone pe install karke turant test kar sakte ho (test AdMob ads dikhenge)

## Real AdMob IDs daalne se pehle

`www/ads-config.js` file kholo aur:

```js
bannerAdId: 'YOUR_REAL_BANNER_AD_UNIT_ID',
interstitialAdId: 'YOUR_REAL_INTERSTITIAL_AD_UNIT_ID',
isTesting: false
```

Apna **AdMob App ID** (admob.google.com se, format: `ca-app-pub-XXXXXXXX~YYYYYYYY`) is file mein daalo:
`android/app/src/main/AndroidManifest.xml` — is line ko dhundo aur apna App ID daalo:

```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-XXXXXXXX~YYYYYYYY"/>
```

(Agar ye meta-data tag file mein nahi hai, to `<application>` tag ke andar add kar dena.)

Iske baad phir se:
```bash
npx cap sync
```
Aur Android Studio se rebuild karo.

## Publish-ready APK (signed release build)

Debug APK sirf testing ke liye hota hai. Uptodown pe publish karne ke liye **signed release APK** chahiye:

1. Android Studio mein: **Build → Generate Signed Bundle / APK**
2. **APK** select karo → "Create new..." se ek keystore banao (password yaad rakhna — future updates ke liye same keystore chahiye hoga)
3. Release build select karo, finish karo
4. Signed APK milega — yehi Uptodown pe upload karna hai

## Uptodown pe publish karna

1. **uptodown.com** pe developer/uploader account banao
2. App details fill karo (naam, description, screenshots, icon — icons `www/icons/` folder mein already hain)
3. Signed release APK upload karo
4. Unki review process ke baad app live ho jayegi (Play Store jaisa $25 fee nahi lagta)

## Google Login + Leaderboard setup (Firebase — free)

1. **console.firebase.google.com** pe jao, naya project banao (Google Analytics skip kar sakte ho)
2. Left menu → **Build → Authentication** → "Get started" → **Google** provider enable karo
3. Left menu → **Build → Firestore Database** → "Create database" → **test mode** mein start karo (baad mein rules tight kar sakte ho)
4. **Project Settings (⚙️) → General** tab → "Your apps" → **Android icon** pe click karke Android app add karo:
   - Package name: `com.sunshinestudio28.tapblast` (same jo `capacitor.config.json` mein hai)
   - `google-services.json` file download hogi — isse `android/app/` folder ke andar daal dena (android folder banne ke baad, `npx cap add android` chalane ke baad)
5. Usi Project Settings page pe **Web app** bhi add karo (</> icon) — wahan se milne wala config `www/firebase-config.js` mein paste karo

### Firestore security rules (test mode ke baad, publish se pehle zaroor lagana)

Firestore Console → Rules tab mein ye daal dena, taaki koi bhi kisi aur ka score edit na kar sake:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /leaderboard/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Login button

Game screen ke top-right mein "Sign in with Google" button hai — tap karte hi Google account chooser khulega. Sign-in ke baad naam/photo button pe dikhega, aur leaderboard start-screen pe automatically load ho jayega. Har game-over pe agar new score purane best se zyada hai, tabhi save hota hai.



- **Banner ad** — screen ke bottom pe, game shuru hote hi dikhta hai
- **Interstitial ad** — har 2nd game-over pe (har baar nahi, taaki players annoy na hon) — `www/ads.js` mein `SHOW_INTERSTITIAL_EVERY_N_GAMES` number change kar sakte ho

## Koi dikkat aaye to

- `npx cap sync` errors — Node.js version check karo (LTS use karo)
- Ads na dikhein — pehle test IDs (already set) ke saath try karo, phir real IDs
- AdMob account "pending"/naya hai to real ads live hone mein Google ki taraf se 24-48 ghante lag sakte hain
