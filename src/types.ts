import { Type } from "@google/genai";

export enum Goal {
  MASS = "MASS",
  CUTTING = "CUTTING",
  MAINTENANCE = "MAINTENANCE"
}

export enum ActivityLevel {
  SEDENTARY = "SEDENTARY",
  LIGHT = "LIGHT",
  MODERATE = "MODERATE",
  ACTIVE = "ACTIVE",
  VERY_ACTIVE = "VERY_ACTIVE"
}

export interface UserProfile {
  age: number;
  gender: 'male' | 'female';
  weight: number; // kg
  height: number; // cm
  activityLevel: ActivityLevel;
  goal: Goal;
  customApiKey?: string;
  customModel?: string;
  customBaseUrl?: string;
}

export interface Nutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  name: string;
  timestamp: number;
  nutrients: Nutrients;
  imageUrl?: string;
}

export interface DailyPlan {
  date: string;
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks: string[];
  };
  totalNutrients: Nutrients;
}

export const MEAL_SCAN_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Name of the meal" },
    calories: { type: Type.NUMBER, description: "Estimated calories" },
    protein: { type: Type.NUMBER, description: "Grams of protein" },
    carbs: { type: Type.NUMBER, description: "Grams of carbohydrates" },
    fat: { type: Type.NUMBER, description: "Grams of fat" }
  },
  required: ["name", "calories", "protein", "carbs", "fat"]
};

export const PLAN_GENERATION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    breakfast: { type: Type.STRING },
    lunch: { type: Type.STRING },
    dinner: { type: Type.STRING },
    snacks: { type: Type.ARRAY, items: { type: Type.STRING } },
    groceryList: { type: Type.ARRAY, items: { type: Type.STRING } },
    totalNutrients: {
      type: Type.OBJECT,
      properties: {
        calories: { type: Type.NUMBER },
        protein: { type: Type.NUMBER },
        carbs: { type: Type.NUMBER },
        fat: { type: Type.NUMBER }
      }
    }
  },
  required: ["breakfast", "lunch", "dinner", "snacks", "groceryList", "totalNutrients"]
};
