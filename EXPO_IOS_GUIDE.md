# 🚀 Expo iOS Build - Guide Complet pour Windows + iPhone 15

## ✅ Étape 1: Configuration Expo (FAIT sur Windows)

Déjà installé:
- ✅ Expo CLI
- ✅ EAS CLI
- ✅ `app.json` créé
- ✅ Dépendances Expo: Camera, Location, Local-Authentication

## 📝 Étape 2: Créer un compte Expo (Windows)

Sur https://expo.dev:
1. Clique sur "Sign up"
2. Crée un compte avec email/password
3. Vérifie ton email
4. **Garde tes identifiants à proximité**

## 🔑 Étape 3: Login dans EAS (Windows - Terminal)

```bash
cd "C:\Users\Admin\Desktop\AI code projects\modelfit\version v2"
npx eas login
```

Puis:
- Entre ton email Expo
- Entre ton password
- Valide le code envoyé par email (si 2FA)

## 🏗️ Étape 4: Configurer le Build iOS (Windows - Terminal)

```bash
npx eas build:configure --platform ios
```

Cela va te poser des questions:
- **Apple Team ID**: Laisse vide pour maintenant (utilisera un compte Expo)
- **Apple Distribution Certificate**: Expo peut l'auto-générer

## 🎬 Étape 5: Lancer le Build iOS (Windows - Terminal)

```bash
npx eas build --platform ios --auto-submit
```

Cela va:
1. Télécharger ton code depuis GitHub (ou local)
2. **Compiler sur les serveurs Apple dans le cloud** ☁️
3. Créer un fichier `.ipa` (l'app iOS compilée)
4. Te donner un lien de download

⏳ **Le build prend environ 5-10 minutes**

## 📱 Étape 6: Installer sur iPhone 15

Une fois le build terminé, EAS te donne deux options:

### Option A: **TestFlight** (Recommandé)
```
1. Tu reçois un lien TestFlight par email
2. Ouvre le lien sur ton iPhone 15
3. Installe via l'app TestFlight
4. L'app apparaît automatiquement
```

### Option B: **Télécharger le fichier .ipa**
```
1. Download le fichier .ipa depuis le lien
2. Transfère-le via iTunes ou une app comme Cydia Impactor
3. Installe manuellement
```

## ⚠️ Problèmes Courants

### "Pod install failed"
➜ Cela ne s'aplique au build EAS cloud (pas de problème sur Windows)

### "Apple Team ID manquant"
➜ Expo auto-génère un certificat, c'est OK

### "Puis-je tester avant de builder?"
```bash
npx expo start
# Puis sur iPhone: Scanner le QR code avec l'app Expo Go
```

## 🔄 Workflow futurs

**Chaque fois que tu mets à jour le code:**

```bash
# 1. Commit les changements
git add .
git commit -m "Update: nouvelles fonctionnalités"
git push

# 2. Builder la nouvelle version
npx eas build --platform ios

# 3. Installer sur iPhone (TestFlight ou replay)
```

## 📊 Statut du Projet

Ton projet React est **compatible avec Expo** via expo-web. EAS compile le code en app iOS native.

- React ✅
- TypeScript ✅
- Vite ✅
- Tailwind CSS ✅
- Camera (Expo) ✅
- Geolocation (Expo) ✅

## 💡 Tips Utiles

1. **Tester en local d'abord:**
   ```bash
   npx expo start
   ```
   Scanne le QR sur iPhone avec Expo Go

2. **Voir logs en temps réel:**
   ```bash
   npx expo start --web
   ```

3. **Checker les permissions:**
   Vérifie que `app.json` a tous les plugins nécessaires

4. **Metrics du build:**
   ```bash
   npx eas build:list
   ```

## 🎉 C'est tout!

Tu es prêt à faire ton premier build iOS depuis Windows!

**Besoin d'aide?** Dis-moi à quelle étape tu es bloqué.
