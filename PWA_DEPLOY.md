# 🚀 Déployer ModelFit PWA sur Vercel

## ✅ Ce qui a été fait:

- ✅ `manifest.json` - Permet d'installer l'app sur iOS/Android
- ✅ `sw.js` - Service Worker pour fonctionnement hors-ligne
- ✅ `index.html` mis à jour - Support PWA complet
- ✅ `vercel.json` - Configuration de déploiement

## 📋 Étapes de déploiement (30 secondes)

### 1️⃣ Créer un compte Vercel (gratuit)

Va sur https://vercel.com et crée un compte avec GitHub/Google

### 2️⃣ Connecter ton repo GitHub

1. Push ton code sur GitHub:
```bash
git init
git add .
git commit -m "Initial commit with PWA config"
git branch -M main
git remote add origin https://github.com/tonaccount/modelfit.git
git push -u origin main
```

2. Va sur https://vercel.com/new
3. Importe le repo `modelfit`
4. Clique sur "Deploy" (Vercel détecte automatiquement Vite)

### 3️⃣ Configurer les variables d'environnement

Dans Vercel Dashboard:
1. Va sur **Settings** → **Environment Variables**
2. Ajoute: `VITE_GROQ_API_KEY` = (ta clé API Groq depuis https://console.groq.com)
3. Clique **Deploy**

✅ **C'est fait!** L'app est en ligne à `https://modelfit.vercel.app`

---

## 📱 Installer sur iPhone 15

### Via Safari:
1. Ouvre Safari sur ton iPhone
2. Va sur `https://modelfit.vercel.app`
3. Menu (bas-droit) → **"Ajouter à l'écran d'accueil"**
4. Donne-lui un nom et clique **Ajouter**

✅ L'app apparaît comme une vraie app sur ton écran d'accueil!

### Features de la PWA:
- 📸 Caméra intégrée (autorisée)
- 💾 Fonctionne hors-ligne (données en cache)
- ⚡ Accès complet à Groq API
- 🔄 Mise à jour automatique

---

## 🔄 Déployer les mises à jour

Chaque fois que tu modifies le code:
```bash
git add .
git commit -m "Update: description"
git push
```

Vercel re-déploie automatiquement en ~1 minute!

---

## 🎯 URL finale

`https://modelfit.vercel.app`

Donne ce lien à tes amis, ils peuvent l'utiliser directement! 🎉

---

## 📊 Avantages PWA vs Expo

| Feature | PWA | Expo |
|---------|-----|------|
| Déploiement | 30 sec ✅ | 15 min |
| Hebergement | Vercel (gratuit) | EAS Cloud |
| Caméra | ✅ | ✅ |
| Offline | ✅ | ✅ |
| Installation | 1 clicSafari | TestFlight |
| Store Apple | ❌ | ✅ |

**Choix: PWA si tu veux juste partager l'app, Expo si tu veux vendre sur App Store**

---

## 🆘 Troubleshooting

### "Service Worker ne s'enregistre pas"
→ Attends quelques secondes, rafraîchis la page (`Ctrl+Shift+R`)

### "VITE_GROQ_API_KEY undefined"
→ Vérifie les variables d'environnement Vercel

### "Pas de caméra sur iPhone"
→ Accorde la permission quand l'app la demande

### "L'app bug après update"
→ Force-refresh: `Cmd+Shift+R` sur Mac, ou désinstalle et réinstalle l'app

---

## 📞 C'est bon?

Dis-moi quand tu as pushé sur GitHub, et je te dis comment la configurer! 🚀
