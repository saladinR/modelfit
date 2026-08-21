import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateBMR(weight: number, height: number, age: number, gender: 'male' | 'female'): number {
  if (gender === 'male') {
    return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
}

export function calculateTDEE(bmr: number, activityLevel: string): number {
  const multipliers: Record<string, number> = {
    SEDENTARY: 1.2,
    LIGHT: 1.375,
    MODERATE: 1.55,
    ACTIVE: 1.725,
    VERY_ACTIVE: 1.9
  };
  return bmr * (multipliers[activityLevel] || 1.2);
}

export function calculateTargetMacros(tdee: number, goal: string): { calories: number, protein: number, carbs: number, fat: number } {
  let targetCalories = tdee;
  if (goal === 'MASS') targetCalories += 300;
  if (goal === 'CUTTING') targetCalories -= 500;

  // Standard macro ratios
  // Protein: 2g per kg of body weight is a good rule for active people
  // But let's use percentages for simplicity in this demo
  const proteinPct = goal === 'MASS' ? 0.30 : 0.40;
  const fatPct = 0.25;
  const carbsPct = 1 - proteinPct - fatPct;

  return {
    calories: Math.round(targetCalories),
    protein: Math.round((targetCalories * proteinPct) / 4),
    carbs: Math.round((targetCalories * carbsPct) / 4),
    fat: Math.round((targetCalories * fatPct) / 9)
  };
}
