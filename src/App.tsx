import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  Camera as CameraIcon,
  Calendar,
  ShoppingCart,
  User,
  Plus,
  ChevronRight,
  Target,
  Flame,
  Dna,
  Droplets,
  Settings,
  LogOut,
  History,
  CheckCircle2,
  Loader2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip
} from 'recharts';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { cn, calculateBMR, calculateTDEE, calculateTargetMacros } from './utils';
import { Goal, ActivityLevel, type UserProfile, type Meal, type Nutrients, MEAL_SCAN_SCHEMA, PLAN_GENERATION_SCHEMA } from './types';

// --- Constants & Defaults ---
const DEFAULT_PROFILE: UserProfile = {
  age: 25,
  gender: 'male',
  weight: 75,
  height: 180,
  activityLevel: ActivityLevel.MODERATE,
  goal: Goal.MAINTENANCE,
};

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

// --- Components ---

const BottomNav = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Accueil' },
    { id: 'scan', icon: CameraIcon, label: 'Scanner' },
    { id: 'calc', icon: Target, label: 'Besoins' },
    { id: 'plan', icon: Calendar, label: 'Plan' },
    { id: 'profile', icon: Settings, label: 'Profil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe pt-2 px-6 flex justify-between items-center z-50">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors relative",
            activeTab === tab.id ? "text-emerald-600" : "text-gray-400"
          )}
        >
          <tab.icon size={24} />
          <span className="text-[10px] font-medium">{tab.label}</span>
          {activeTab === tab.id && (
            <motion.div
              layoutId="nav-indicator"
              className="absolute -top-2 w-1 h-1 bg-emerald-600 rounded-full"
            />
          )}
        </button>
      ))}
    </nav>
  );
};

const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-white rounded-3xl p-5 shadow-sm border border-gray-50", className)}>
    {children}
  </div>
);

const ProgressBar = ({ current, target, color, label }: { current: number, target: number, color: string, label: string }) => {
  const percentage = Math.min(Math.round((current / target) * 100), 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-gray-500">{label}</span>
        <span className="text-gray-900">{current} / {target}g</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={cn("h-full rounded-full", color)}
        />
      </div>
    </div>
  );
};

// --- Splash Screen ---

const SplashScreen = ({ onDone }: { onDone: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onDone, 2500);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center gap-4"
      >
        {/* Logo Icon */}
        <div className="w-24 h-24 rounded-3xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/40">
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="22" width="8" height="8" rx="2" fill="white"/>
            <rect x="42" y="22" width="8" height="8" rx="2" fill="white"/>
            <rect x="10" y="18" width="6" height="16" rx="3" fill="white"/>
            <rect x="36" y="18" width="6" height="16" rx="3" fill="white"/>
            <rect x="16" y="24" width="20" height="4" rx="2" fill="white"/>
          </svg>
        </div>

        {/* Brand Name */}
        <div className="text-center">
          <h1 className="text-4xl font-black text-white tracking-widest uppercase">BATAL PRO</h1>
          <p className="text-emerald-400 text-sm font-medium tracking-wider mt-1">Nutrition & Performance</p>
        </div>
      </motion.div>

      {/* Loading bar */}
      <div className="absolute bottom-16 w-32 h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-emerald-400 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 2.2, ease: 'easeInOut' }}
        />
      </div>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('nutriscan_profile');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });
  const [meals, setMeals] = useState<Meal[]>(() => {
    const saved = localStorage.getItem('nutriscan_meals');
    return saved ? JSON.parse(saved) : [];
  });
  const [dailyPlan, setDailyPlan] = useState<any>(() => {
    const saved = localStorage.getItem('nutriscan_plan');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('nutriscan_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    const toSave = meals.map(({ imageUrl: _img, ...rest }) => rest);
    localStorage.setItem('nutriscan_meals', JSON.stringify(toSave));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem('nutriscan_plan', JSON.stringify(dailyPlan));
  }, [dailyPlan]);

  const bmr = calculateBMR(profile.weight, profile.height, profile.age, profile.gender);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const targets = calculateTargetMacros(tdee, profile.goal);

  const todayMeals = meals.filter(m => {
    const d = new Date(m.timestamp);
    const today = new Date();
    return d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
  });

  const totals = todayMeals.reduce((acc, m) => ({
    calories: acc.calories + m.nutrients.calories,
    protein: acc.protein + m.nutrients.protein,
    carbs: acc.carbs + m.nutrients.carbs,
    fat: acc.fat + m.nutrients.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  const generatePlan = async (customProfile?: UserProfile) => {
    setIsGeneratingPlan(true);
    const targetProfile = customProfile || profile;
    const targetBmr = calculateBMR(targetProfile.weight, targetProfile.height, targetProfile.age, targetProfile.gender);
    const targetTdee = calculateTDEE(targetBmr, targetProfile.activityLevel);
    const targetMacros = calculateTargetMacros(targetTdee, targetProfile.goal);

    try {
      const apiKey = profile.customApiKey || import.meta.env.VITE_GROQ_API_KEY || "";
      if (!apiKey) throw new Error("Clé API Groq requise. Allez dans Profil → Configuration Groq → Entrez votre clé Groq ou ajoutez là dans .env");

      // Calcul de la distribution des macros par repas
      const breakfastCals = Math.round(targetMacros.calories * 0.15);
      const lunchCals = Math.round(targetMacros.calories * 0.40);
      const dinnerCals = Math.round(targetMacros.calories * 0.35);
      const snacksCals = Math.round(targetMacros.calories * 0.10);

      const breakfastProtein = Math.round(targetMacros.protein * 0.15);
      const lunchProtein = Math.round(targetMacros.protein * 0.40);
      const dinnerProtein = Math.round(targetMacros.protein * 0.35);
      const snacksProtein = Math.round(targetMacros.protein * 0.10);

      const breakfastCarbs = Math.round(targetMacros.carbs * 0.20);
      const lunchCarbs = Math.round(targetMacros.carbs * 0.40);
      const dinnerCarbs = Math.round(targetMacros.carbs * 0.30);
      const snacksCarbs = Math.round(targetMacros.carbs * 0.10);

      const breakfastFat = Math.round(targetMacros.fat * 0.20);
      const lunchFat = Math.round(targetMacros.fat * 0.35);
      const dinnerFat = Math.round(targetMacros.fat * 0.35);
      const snacksFat = Math.round(targetMacros.fat * 0.10);

      const prompt = `Tu es un nutritionniste expert. Génère un plan alimentaire journalier PRÉCIS basé sur ces macros EXACTES. Les aliments doivent être  RÉALISTES et CALCULÉS pour atteindre exactement ces cibles.

Macros CIBLES TOTALES A ATTEINDRE:
- Calories TOTALES: ${targetMacros.calories} kcal
- Protéines TOTALES: ${targetMacros.protein}g
- Glucides TOTAUX: ${targetMacros.carbs}g
- Lipides TOTAUX: ${targetMacros.fat}g

DISTRIBUTION PAR REPAS (calculée pour atteindre les cibles):

PETIT-DÉJEUNER (15% calories):
- ${breakfastCals} kcal
- ${breakfastProtein}g protéines
- ${breakfastCarbs}g glucides
- ${breakfastFat}g lipides

DÉJEUNER (40% calories):
- ${lunchCals} kcal
- ${lunchProtein}g protéines
- ${lunchCarbs}g glucides
- ${lunchFat}g lipides

DÎNER (35% calories):
- ${dinnerCals} kcal
- ${dinnerProtein}g protéines
- ${dinnerCarbs}g glucides
- ${dinnerFat}g lipides

COLLATIONS (10% calories):
- ${snacksCals} kcal
- ${snacksProtein}g protéines
- ${snacksCarbs}g glucides
- ${snacksFat}g lipides

IMPORTANT: Propose des aliments RÉALISTES avec des portions PRÉCISES. Chaque repas doit atteindre EXACTEMENT ses macros cibles. Réponds UNIQUEMENT avec du JSON valide, pas de markdown. Les valeurs doivent être CALCULÉES et PRÉCISES:

{
  "breakfast": {
    "description": "description détaillée avec portions exact (exemple: 2 oeufs + 100g flocons avoine)",
    "calories": ${breakfastCals},
    "protein": ${breakfastProtein},
    "carbs": ${breakfastCarbs},
    "fat": ${breakfastFat}
  },
  "lunch": {
    "description": "description détaillée avec portions (exemple: 200g poulet + 300g riz blanc)",
    "calories": ${lunchCals},
    "protein": ${lunchProtein},
    "carbs": ${lunchCarbs},
    "fat": ${lunchFat}
  },
  "dinner": {
    "description": "description détaillée avec portions",
    "calories": ${dinnerCals},
    "protein": ${dinnerProtein},
    "carbs": ${dinnerCarbs},
    "fat": ${dinnerFat}
  },
  "snacks": [
    {
      "description": "exemple: 1 barre protéinée",
      "calories": ${Math.round(snacksCals * 0.5)},
      "protein": ${Math.round(snacksProtein * 0.5)},
      "carbs": ${Math.round(snacksCarbs * 0.5)},
      "fat": ${Math.round(snacksFat * 0.5)}
    },
    {
      "description": "exemple: 50g cacahuètes",
      "calories": ${Math.round(snacksCals * 0.5)},
      "protein": ${Math.round(snacksProtein * 0.5)},
      "carbs": ${Math.round(snacksCarbs * 0.5)},
      "fat": ${Math.round(snacksFat * 0.5)}
    }
  ],
  "groceryList": ["aliment 1", "aliment 2"]
}`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: profile.customModel || "llama-3.3-70b-versatile",
          messages: [
            {
              role: "user",
              content: prompt + "\n\nRespond with valid JSON only, no markdown or extra text."
            }
          ],
          temperature: 0.3,
          max_tokens: 1024,
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Erreur API Groq");
      }

      const data = await response.json();
      const text = data.choices[0]?.message?.content || '{}';

      // Extraire le JSON de la réponse (peut contenir du markdown ou du texte)
      let jsonStr = text;

      // Chercher le premier { et le dernier }
      const startIdx = jsonStr.indexOf('{');
      const endIdx = jsonStr.lastIndexOf('}');

      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        jsonStr = jsonStr.substring(startIdx, endIdx + 1);
      }

      // Nettoyer les guillemets mal échappés
      jsonStr = jsonStr.replace(/\\'/g, "'").replace(/\n/g, " ");

      const planData = JSON.parse(jsonStr);
      setDailyPlan(planData);
      return planData;
    } catch (error) {
      console.error("Plan error:", error);
      alert("Erreur lors de la génération du plan: " + (error instanceof Error ? error.message : 'Veuillez réessayer.'));
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      </AnimatePresence>
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 font-sans pb-24">
      <div className="max-w-md mx-auto px-5 pt-8">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <header className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold">Bonjour !</h1>
                  <p className="text-gray-500 text-sm">Prêt pour vos objectifs ?</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <User size={20} />
                </div>
              </header>

              <Card className="bg-emerald-600 text-white border-none">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-emerald-100 text-xs font-medium uppercase tracking-wider">Calories du jour</p>
                    <h2 className="text-4xl font-bold mt-1">{totals.calories} <span className="text-lg font-normal opacity-80">/ {targets.calories} kcal</span></h2>
                  </div>
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Flame size={20} />
                  </div>
                </div>
                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((totals.calories / targets.calories) * 100, 100)}%` }}
                    className="h-full bg-white rounded-full"
                  />
                </div>
              </Card>

              <div className="grid grid-cols-1 gap-4">
                <Card className="space-y-4">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <Target size={16} className="text-emerald-600" />
                    Macros Objectifs
                  </h3>
                  <div className="space-y-4">
                    <ProgressBar label="Protéines" current={totals.protein} target={targets.protein} color="bg-blue-500" />
                    <ProgressBar label="Glucides" current={totals.carbs} target={targets.carbs} color="bg-amber-500" />
                    <ProgressBar label="Lipides" current={totals.fat} target={targets.fat} color="bg-red-500" />
                  </div>
                </Card>

                <div className="flex justify-between items-center">
                  <h3 className="font-bold">Repas récents</h3>
                  <button onClick={() => setActiveTab('scan')} className="text-emerald-600 text-sm font-medium">Voir tout</button>
                </div>

                {todayMeals.length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-gray-200">
                    <p className="text-gray-400 text-sm">Aucun repas scanné aujourd'hui</p>
                    <button
                      onClick={() => setActiveTab('scan')}
                      className="mt-3 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold"
                    >
                      Scanner mon premier repas
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayMeals.slice(0, 3).map((meal) => (
                      <div key={meal.id} className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
                          {meal.imageUrl ? <img src={meal.imageUrl} className="w-full h-full object-cover" /> : <Plus className="text-gray-300" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-sm">{meal.name}</h4>
                          <p className="text-xs text-gray-500">{meal.nutrients.calories} kcal • {meal.nutrients.protein}g P</p>
                        </div>
                        <button
                          onClick={() => setMeals(meals.filter(m => m.id !== meal.id))}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'scan' && (
            <ScanPage onMealAdded={(meal) => setMeals([meal, ...meals])} profile={profile} />
          )}

          {activeTab === 'calc' && (
            <CalculatorPage
              profile={profile}
              setProfile={setProfile}
              generatePlan={generatePlan}
              isGenerating={isGeneratingPlan}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'plan' && (
            <PlanPage
              dailyPlan={dailyPlan}
              profile={profile}
              generatePlan={generatePlan}
              isGenerating={isGeneratingPlan}
            />
          )}

          {activeTab === 'grocery' && (
            <GroceryPage dailyPlan={dailyPlan} />
          )}

          {activeTab === 'profile' && (
            <ProfilePage profile={profile} setProfile={setProfile} />
          )}
        </AnimatePresence>
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
    </>
  );
}

// --- Sub-Pages ---

function ScanPage({ onMealAdded, profile }: { onMealAdded: (meal: Meal) => void, profile: UserProfile }) {
  const [isScanning, setIsScanning] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleScan = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Prompt
      });

      if (!image.base64String) return;

      setIsScanning(true);
      const dataUrl = `data:image/${image.format};base64,${image.base64String}`;
      setPreviewUrl(dataUrl);
      const base64 = image.base64String;

      try {
        const apiKey = profile.customApiKey || import.meta.env.VITE_GROQ_API_KEY || "";
        if (!apiKey) throw new Error("Clé API Groq requise. Allez dans Profil → Configuration Groq → Entrez votre clé Groq ou ajoutez là dans .env");

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `Tu es un expert en nutrition. Analyse ce repas et fournis des estimations nutritionnelles précises en format JSON valide UNIQUEMENT.\n\nIMPORTANT: Réponds UNIQUEMENT avec du JSON valide, pas de markdown, pas de texte supplémentaire. Utilise cette structure exacte:\n{\n  "name": "nom du repas ou description",\n  "calories": nombre_de_calories,\n  "protein": grammes_de_proteines_nombre,\n  "carbs": grammes_de_glucides_nombre,\n  "fat": grammes_de_lipides_nombre\n}`
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:image/${image.format};base64,${base64}`
                    }
                  }
                ]
              }
            ],
            temperature: 0.3,
            max_tokens: 256,
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || "Erreur API Groq");
        }

        const data = await response.json();
        const text = data.choices[0]?.message?.content || '{}';

        // Extraire et nettoyer le JSON
        let jsonStr = text;
        const startIdx = jsonStr.indexOf('{');
        const endIdx = jsonStr.lastIndexOf('}');

        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
          jsonStr = jsonStr.substring(startIdx, endIdx + 1);
        }

        jsonStr = jsonStr.replace(/\\'/g, "'").replace(/\n/g, " ");
        const result = JSON.parse(jsonStr);
        setResult(result);
      } catch (error) {
        console.error("Scan error:", error);
        alert("Erreur lors de l'analyse: " + (error instanceof Error ? error.message : 'Veuillez réessayer.'));
      } finally {
        setIsScanning(false);
      }
    } catch (e) {
      console.error("Camera error:", e);
    }
  };

  const confirmMeal = () => {
    if (!result) return;
    const newMeal: Meal = {
      id: Date.now().toString(),
      name: result.name,
      timestamp: Date.now(),
      imageUrl: previewUrl || undefined,
      nutrients: {
        calories: result.calories,
        protein: result.protein,
        carbs: result.carbs,
        fat: result.fat,
      }
    };
    onMealAdded(newMeal);
    setResult(null);
    setPreviewUrl(null);
  };

  return (
    <motion.div
      key="scan"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Scanner un repas</h1>
          <p className="text-gray-500 text-sm">Prenez une photo pour analyser</p>
        </div>
        {profile.customApiKey && (
          <div className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[8px] font-bold uppercase tracking-wider flex items-center gap-1">
            <Settings size={8} />
            Custom AI
          </div>
        )}
      </header>

      {!previewUrl ? (
        <div
          onClick={handleScan}
          className="aspect-square w-full bg-white rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CameraIcon size={32} />
          </div>
          <p className="text-sm font-medium text-gray-500">Appuyez pour prendre une photo</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-gray-100">
            <img src={previewUrl} className="w-full h-full object-cover" />
            {isScanning && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-3">
                <Loader2 className="animate-spin" size={40} />
                <p className="font-bold">Analyse en cours...</p>
              </div>
            )}
          </div>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Card>
                <h3 className="text-xl font-bold mb-4">{result.name}</h3>
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Kcal</p>
                    <p className="font-bold text-emerald-600">{result.calories}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Prot</p>
                    <p className="font-bold text-blue-600">{result.protein}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Gluc</p>
                    <p className="font-bold text-amber-600">{result.carbs}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Lip</p>
                    <p className="font-bold text-red-600">{result.fat}g</p>
                  </div>
                </div>
              </Card>

              <div className="flex gap-3">
                <button
                  onClick={() => { setPreviewUrl(null); setResult(null); }}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmMeal}
                  className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200"
                >
                  Ajouter au journal
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}

function PlanPage({ dailyPlan, profile, generatePlan, isGenerating }: { dailyPlan: any, profile: UserProfile, generatePlan: () => void, isGenerating: boolean }) {
  return (
    <motion.div
      key="plan"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Plan Alimentaire</h1>
          <p className="text-gray-500 text-sm">Généré selon vos besoins</p>
        </div>
        <div className="flex items-center gap-2">
          {profile.customApiKey && (
            <div className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[8px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Settings size={8} />
              Custom AI
            </div>
          )}
          <button
            onClick={() => generatePlan()}
            disabled={isGenerating}
            className="p-2 bg-emerald-50 text-emerald-600 rounded-xl disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <History size={20} />}
          </button>
        </div>
      </header>

      {!dailyPlan ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <Calendar size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400 text-sm mb-6">Aucun plan généré pour le moment</p>
          <button
            onClick={() => generatePlan()}
            disabled={isGenerating}
            className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 flex items-center gap-2 mx-auto"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={20} /> : "Générer mon plan IA"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <Card className="bg-emerald-50 border-emerald-100">
            <h3 className="font-bold text-emerald-800 mb-2">Résumé du plan</h3>
            <p className="text-xs text-emerald-700">Ce plan est optimisé pour votre objectif de ${profile.goal === 'MASS' ? 'Prise de masse' : profile.goal === 'CUTTING' ? 'Sèche' : 'Maintien'}.</p>
          </Card>

          <div className="space-y-3">
            <MealItem title="Petit-déjeuner" description={dailyPlan.breakfast} />
            <MealItem title="Déjeuner" description={dailyPlan.lunch} />
            <MealItem title="Dîner" description={dailyPlan.dinner} />
            {dailyPlan.snacks?.map((snack: any, i: number) => (
              <MealItem key={i} title={`Collation ${i + 1}`} description={snack} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

const MealItem = ({ title, description }: { title: string, description: any }) => {
  // Supporter à la fois l'ancien format (string) et le nouveau (objet)
  if (typeof description === 'string') {
    return (
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
        <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">{title}</h4>
        <p className="text-sm text-gray-800 font-medium">{description}</p>
      </div>
    );
  }

  // Nouveau format avec macros
  const { description: desc, calories, protein, carbs, fat } = description;
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 space-y-3">
      <div>
        <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">{title}</h4>
        <p className="text-sm text-gray-800 font-medium">{desc}</p>
      </div>
      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-gray-100">
        <div className="text-center">
          <p className="text-[10px] text-gray-400 uppercase font-bold">Kcal</p>
          <p className="font-bold text-emerald-600 text-sm">{calories || 0}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-400 uppercase font-bold">Prot</p>
          <p className="font-bold text-blue-600 text-sm">{protein || 0}g</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-400 uppercase font-bold">Gluc</p>
          <p className="font-bold text-amber-600 text-sm">{carbs || 0}g</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-400 uppercase font-bold">Lip</p>
          <p className="font-bold text-red-600 text-sm">{fat || 0}g</p>
        </div>
      </div>
    </div>
  );
};

function GroceryPage({ dailyPlan }: { dailyPlan: any }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  if (!dailyPlan) {
    return (
      <div className="text-center py-20">
        <ShoppingCart size={48} className="mx-auto text-gray-200 mb-4" />
        <p className="text-gray-400 text-sm">Générez d'abord un plan pour voir votre liste de courses</p>
      </div>
    );
  }

  return (
    <motion.div
      key="grocery"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <header>
        <h1 className="text-2xl font-bold">Liste de courses</h1>
        <p className="text-gray-500 text-sm">Basée sur votre plan hebdomadaire</p>
      </header>

      <div className="bg-white rounded-3xl p-2 shadow-sm border border-gray-50">
        {dailyPlan.groceryList?.map((item: string, i: number) => (
          <div
            key={i}
            onClick={() => setChecked(prev => ({ ...prev, [item]: !prev[item] }))}
            className={cn(
              "flex items-center gap-4 p-4 rounded-2xl transition-colors cursor-pointer",
              checked[item] ? "bg-gray-50 opacity-50" : "hover:bg-emerald-50/50"
            )}
          >
            <div className={cn(
              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
              checked[item] ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-200"
            )}>
              {checked[item] && <CheckCircle2 size={14} />}
            </div>
            <span className={cn("text-sm font-medium", checked[item] && "line-through")}>{item}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function ProfilePage({ profile, setProfile }: { profile: UserProfile, setProfile: (p: UserProfile) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState(profile);

  useEffect(() => {
    if (!isEditing) {
      setTempProfile(profile);
    }
  }, [profile, isEditing]);

  const save = () => {
    setProfile(tempProfile);
    setIsEditing(false);
  };

  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Profil & Paramètres</h1>
        <button
          onClick={() => isEditing ? save() : setIsEditing(true)}
          className="text-emerald-600 font-bold text-sm"
        >
          {isEditing ? "Enregistrer" : "Modifier"}
        </button>
      </header>

      <div className="space-y-4">
        <Card className="space-y-4">
          <div className="flex items-center gap-4 pb-4 border-bottom border-gray-100">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-2xl font-bold">
              {profile.gender === 'male' ? 'M' : 'F'}
            </div>
            <div>
              <h3 className="font-bold text-lg">Utilisateur</h3>
              <p className="text-gray-500 text-sm">{profile.age} ans • {profile.weight} kg • {profile.height} cm</p>
            </div>
          </div>

          <div className="space-y-4">
            <ProfileField
              label="Objectif"
              value={isEditing ? (
                <select
                  className="bg-gray-50 border-none rounded-lg p-1 text-sm outline-none"
                  value={tempProfile.goal}
                  onChange={(e) => setTempProfile({ ...tempProfile, goal: e.target.value as Goal })}
                >
                  <option value={Goal.MASS}>Prise de masse</option>
                  <option value={Goal.CUTTING}>Sèche</option>
                  <option value={Goal.MAINTENANCE}>Maintien</option>
                </select>
              ) : (profile.goal === 'MASS' ? 'Prise de masse' : profile.goal === 'CUTTING' ? 'Sèche' : 'Maintien')}
            />
            <ProfileField
              label="Activité"
              value={isEditing ? (
                <select
                  className="bg-gray-50 border-none rounded-lg p-1 text-sm outline-none"
                  value={tempProfile.activityLevel}
                  onChange={(e) => setTempProfile({ ...tempProfile, activityLevel: e.target.value as ActivityLevel })}
                >
                  <option value={ActivityLevel.SEDENTARY}>Sédentaire</option>
                  <option value={ActivityLevel.LIGHT}>Léger</option>
                  <option value={ActivityLevel.MODERATE}>Modéré</option>
                  <option value={ActivityLevel.ACTIVE}>Actif</option>
                  <option value={ActivityLevel.VERY_ACTIVE}>Très actif</option>
                </select>
              ) : profile.activityLevel}
            />
            <ProfileField
              label="Poids (kg)"
              value={isEditing ? (
                <input
                  type="number"
                  className="bg-gray-50 border-none rounded-lg p-1 text-sm outline-none w-16 text-right"
                  value={tempProfile.weight || ''}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setTempProfile({ ...tempProfile, weight: e.target.value === '' ? 0 : Number(e.target.value) })}
                />
              ) : profile.weight}
            />
          </div>
        </Card>

        <Card className="space-y-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Settings size={16} className="text-gray-400" />
            Configuration IA
          </h3>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase">Clé API</label>
              <input
                type="text"
                placeholder="Entrez votre clé API..."
                className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={tempProfile.customApiKey || ''}
                onChange={(e) => setTempProfile({ ...tempProfile, customApiKey: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase">Modèle (ex: gemini-2.0-flash)</label>
              <input
                type="text"
                placeholder="gemini-3-flash-preview"
                className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={tempProfile.customModel || ''}
                onChange={(e) => setTempProfile({ ...tempProfile, customModel: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 font-bold uppercase">Base URL (Optionnel)</label>
              <input
                type="text"
                placeholder="https://generativelanguage.googleapis.com"
                className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={tempProfile.customBaseUrl || ''}
                onChange={(e) => setTempProfile({ ...tempProfile, customBaseUrl: e.target.value })}
              />
            </div>

            {(tempProfile.customApiKey !== profile.customApiKey ||
              tempProfile.customModel !== profile.customModel ||
              tempProfile.customBaseUrl !== profile.customBaseUrl) && (
                <button
                  onClick={() => setProfile({
                    ...profile,
                    customApiKey: tempProfile.customApiKey,
                    customModel: tempProfile.customModel,
                    customBaseUrl: tempProfile.customBaseUrl
                  })}
                  className="w-full py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Enregistrer la configuration IA
                </button>
              )}

            <div className="flex items-center gap-2 pt-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                profile.customApiKey ? "bg-emerald-500 animate-pulse" : "bg-gray-300"
              )} />
              <p className="text-[10px] text-gray-400 font-medium">
                {profile.customApiKey ? "Clé personnalisée active" : "Utilisation de la clé par défaut"}
              </p>
            </div>
          </div>
        </Card>

        <button className="w-full py-4 text-red-500 font-bold text-sm flex items-center justify-center gap-2">
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </motion.div>
  );
}

const ProfileField = ({ label, value }: { label: string, value: React.ReactNode }) => (
  <div className="flex justify-between items-center">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-sm font-bold">{value}</span>
  </div>
);

function CalculatorPage({ profile, setProfile, generatePlan, isGenerating, setActiveTab }: { profile: UserProfile, setProfile: (p: UserProfile) => void, generatePlan: (p: UserProfile) => Promise<any>, isGenerating: boolean, setActiveTab: (t: string) => void }) {
  const [tempProfile, setTempProfile] = useState(profile);

  const bmr = calculateBMR(tempProfile.weight, tempProfile.height, tempProfile.age, tempProfile.gender);
  const tdee = calculateTDEE(bmr, tempProfile.activityLevel);
  const targets = calculateTargetMacros(tdee, tempProfile.goal);

  const handleSave = async () => {
    setProfile(tempProfile);
    const plan = await generatePlan(tempProfile);
    if (plan) {
      setActiveTab('plan');
    }
  };

  return (
    <motion.div
      key="calc"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6 pb-10"
    >
      <header>
        <h1 className="text-2xl font-bold">Calculateur de Besoins</h1>
        <p className="text-gray-500 text-sm">Définissez votre profil métabolique</p>
      </header>

      <Card className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Sexe</label>
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setTempProfile({ ...tempProfile, gender: 'male' })}
                className={cn("flex-1 py-2 text-sm font-bold rounded-lg transition-all", tempProfile.gender === 'male' ? "bg-white shadow-sm text-emerald-600" : "text-gray-500")}
              >
                Homme
              </button>
              <button
                onClick={() => setTempProfile({ ...tempProfile, gender: 'female' })}
                className={cn("flex-1 py-2 text-sm font-bold rounded-lg transition-all", tempProfile.gender === 'female' ? "bg-white shadow-sm text-emerald-600" : "text-gray-500")}
              >
                Femme
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Âge</label>
            <input
              type="number"
              className="w-full bg-gray-100 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
              value={tempProfile.age || ''}
              onFocus={(e) => e.target.select()}
              onChange={(e) => setTempProfile({ ...tempProfile, age: e.target.value === '' ? 0 : Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Poids (kg)</label>
            <input
              type="number"
              className="w-full bg-gray-100 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
              value={tempProfile.weight || ''}
              onFocus={(e) => e.target.select()}
              onChange={(e) => setTempProfile({ ...tempProfile, weight: e.target.value === '' ? 0 : Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Taille (cm)</label>
            <input
              type="number"
              className="w-full bg-gray-100 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
              value={tempProfile.height || ''}
              onFocus={(e) => e.target.select()}
              onChange={(e) => setTempProfile({ ...tempProfile, height: e.target.value === '' ? 0 : Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase">Niveau d'activité / Entraînement</label>
          <select
            className="w-full bg-gray-100 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none"
            value={tempProfile.activityLevel}
            onChange={(e) => setTempProfile({ ...tempProfile, activityLevel: e.target.value as ActivityLevel })}
          >
            <option value={ActivityLevel.SEDENTARY}>Sédentaire (Bureau, peu d'exercice)</option>
            <option value={ActivityLevel.LIGHT}>Léger (1-2 jours d'entraînement)</option>
            <option value={ActivityLevel.MODERATE}>Modéré (3-5 jours d'entraînement)</option>
            <option value={ActivityLevel.ACTIVE}>Actif (6-7 jours d'entraînement)</option>
            <option value={ActivityLevel.VERY_ACTIVE}>Très actif (Athlète, travail physique)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase">Objectif Personnel</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: Goal.CUTTING, label: 'Sèche', icon: Droplets },
              { id: Goal.MAINTENANCE, label: 'Maintien', icon: CheckCircle2 },
              { id: Goal.MASS, label: 'Masse', icon: Dna },
            ].map((g) => (
              <button
                key={g.id}
                onClick={() => setTempProfile({ ...tempProfile, goal: g.id })}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all",
                  tempProfile.goal === g.id ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-100 text-gray-400"
                )}
              >
                <g.icon size={20} />
                <span className="text-[10px] font-bold uppercase">{g.label}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="bg-emerald-600 text-white border-none space-y-4">
        <h3 className="font-bold text-emerald-100 uppercase text-[10px] tracking-widest">Résultats Estimés</h3>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-3xl font-bold">{Math.round(tdee)} <span className="text-sm font-normal opacity-70">kcal/jour</span></p>
            <p className="text-xs opacity-70">Maintenance (TDEE)</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-emerald-200">{targets.calories} <span className="text-sm font-normal opacity-70">kcal</span></p>
            <p className="text-xs opacity-70">Cible Objectif</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
          <div className="text-center">
            <p className="text-[10px] opacity-70 uppercase font-bold">Prot</p>
            <p className="font-bold">{targets.protein}g</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] opacity-70 uppercase font-bold">Gluc</p>
            <p className="font-bold">{targets.carbs}g</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] opacity-70 uppercase font-bold">Lip</p>
            <p className="font-bold">{targets.fat}g</p>
          </div>
        </div>
      </Card>

      <button
        onClick={handleSave}
        disabled={isGenerating}
        className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Génération du plan...
          </>
        ) : "Appliquer et générer mes repas"}
      </button>
    </motion.div>
  );
}
