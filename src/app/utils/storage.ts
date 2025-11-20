const STORAGE_KEY = 'fitness_plan';

export interface UserData {
  name: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  fitnessGoal: string;
  fitnessLevel: string;
  workoutLocation: string;
  dietaryPreferences: string;
  medicalHistory: string;
  stressLevel: string;
}

export interface FitnessPlan {
  workout: {
    dailyRoutines: Array<{
      day: string;
      exercises: Array<{
        name: string;
        sets: string;
        reps: string;
        rest: string;
        description: string;
      }>;
    }>;
  };
  diet: {
    meals: {
      breakfast: string;
      lunch: string;
      dinner: string;
      snacks: string;
    };
  };
  tips: string[];
  motivation: string;
}

export const savePlanToLocalStorage = (plan: FitnessPlan) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  }
};

export const getPlanFromLocalStorage = (): FitnessPlan | null => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  }
  return null;
};

export const clearSavedPlan = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
};

export const saveUserData = (userData: UserData) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user_data', JSON.stringify(userData));
  }
};

export const getUserData = (): UserData | null => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('user_data');
    return saved ? JSON.parse(saved) : null;
  }
  return null;
};