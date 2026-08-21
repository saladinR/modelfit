# Setup Capacitor iOS - ModelFit

## ✅ Ce qui a été fait sur Windows:

1. ✅ Instalé Capacitor CLI et core
2. ✅ Installé plugins Capacitor: Camera, Geolocation, Local Notifications
3. ✅ Initialisé la configuration Capacitor (`capacitor.config.ts`)
4. ✅ Builtd le projet Vite (dossier `dist/` prêt)
5. ✅ Créé le projet iOS Xcode (dossier `ios/` prêt)

## ⚠️ Prochaines étapes (sur Mac uniquement):

### 1. Copier le projet sur un Mac
```bash
# Copier le dossier du projet sur Mac
scp -r /chemin/vers/modelfit/version\ v2 utilisateur@mac:/chemin/destination
```

### 2. Sur le Mac, terminer l'installation:
```bash
cd /chemin/vers/modelfit/version\ v2

# Installer les dépendances CocoaPods (gérant les dépendances iOS)
npx cap sync ios

# Vérifier l'installation
npx cap doctor

# Ouvrir le projet dans Xcode
npx cap open ios
```

### 3. Dans Xcode (sur le Mac):
1. Ouvrir le fichier `ios/App/App.xcodeproj` ou `ios/App/App.xcworkspace`
2. Sélectionner "ModelFit" en haut
3. Cliquer sur "Build" (⌘B) ou "Run" (⌘R)
4. Sélectionner un simulateur iOS ou connecter un appareil
5. L'app se lance sur l'appareil/simulateur

## 🔐 Permissions iOS requises:

Le fichier `ios/App/App/Info.plist` doit contenir ces permissions:

```xml
<!-- Caméra (pour scanner les repas) -->
<key>NSCameraUsageDescription</key>
<string>Nous avons besoin d'accès à la caméra pour scanner vos repas</string>

<!-- Géolocalisation (réservé pour futur usage) -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>Nous avons besoin de votre localisation pour des services localisés</string>

<!-- Photos (pour choisir des images de la galerie) -->
<key>NSPhotoLibraryUsageDescription</key>
<string>Nous avons besoin d'accès à votre galerie pour les photos</string>
```

## 📱 Commandes utiles:

```bash
# Après modifications, synchroniser avec iOS:
npx cap sync ios

# Copier uniquement les fichiers web (sans pod install):
npx cap copy ios

# Ouvrir Xcode:
npx cap open ios

# Vérifier l'état du projet:
npx cap doctor
```

## 🚀 Build et distribution:

Une fois que tout fonctionne sur le simulateur:

1. **Test sur appareil réel**: Connecter un iPhone au Mac et builder
2. **Release**: Dans Xcode → Product → Archive → Export et uploader sur l'App Store

## 📝 Fichiers créés:

- `capacitor.config.ts` - Configuration Capacitor
- `ios/` - Projet Xcode complet
- `dist/` - Build du projet React

## 🔄 Workflow de développement:

Chaque fois que tu modifies le code React:
```bash
npm run build          # Builder React
npx cap sync ios       # Copier dans iOS
# Puis relancer dans Xcode ou sur l'appareil
```

Bon courage! 🎉
