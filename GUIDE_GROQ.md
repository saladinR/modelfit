# Guide d'utilisation de Groq avec ModelFit

## 🚀 Configuration Groq

### Ce qui fonctionne avec Groq ✅
- **Génération de plans repas**: Groq peut générer vos plans alimentaires personnalisés
- **Texte et traitement naturel du langage**

### Ce qui NE fonctionne PAS avec Groq ❌
- **Scan/Analyse d'images**: Groq ne supporte pas la vision par ordinateur
- Pour analyser les images de repas, vous DEVEZ utiliser **Google Gemini**

## 📱 Instructions d'utilisation

### Étape 1: Obtenir une clé API
- **Pour Groq**: Allez sur https://console.groq.com/keys et créez une clé API
- **Pour Google Gemini** (obligatoire pour les images): Allez sur https://ai.google.dev/

### Étape 2: Configurer dans l'app
1. Allez dans l'onglet **"Profil"** (⚙️)
2. Trouvez la section **"Configuration IA"**
3. Sélectionnez le **fournisseur IA**:
   - Pour **plans repas**: Choisissez "Groq"
   - Pour **scan d'images**: Vous devez toujours avoir une clé Google

### Étape 3: Utiliser Groq
1. **Plans repas**: Avec Groq sélectionné, cliquez sur "Générer mon plan IA" pour créer vos plans
2. **Modèles Groq disponibles**:
   - `mixtral-8x7b-32768` (recommandé)
   - `llama2-70b-4096`
   - `llama3-8b-8192`
   - `llama3.1-70b-versatile`

### Exemple de configuration
```
Fournisseur IA: Groq
Clé API: (depuis https://console.groq.com)
Modèle: mixtral-8x7b-32768
```

## 🐛 Dépannage

### Le scan d'image ne marche pas?
✅ **Solution**: C'est normal! Groq ne supporte pas la vision. Vous devez utiliser Google Gemini.
- Allez en profileEdit
- Changez le fournisseur à "Google Gemini"
- Entrez votre clé API Google
- Réessayez le scan

### La génération de plan échoue avec Groq?
- Vérifiez que votre clé API Groq est correcte
- Vérifiez le nom du modèle (mixtral-8x7b-32768 par défaut)
- Assurez-vous d'avoir du quota restant sur votre compte Groq

### Plus d'informations
- Site Groq: https://groq.com/
- API Groq: https://console.groq.com/docs
- Modèles disponibles: https://console.groq.com/docs/models

---

**Important**: Pour l'analyse d'images (Scanner un repas), gardez toujours une clé Google Gemini active. Groq ne peut pas analyser les images.
