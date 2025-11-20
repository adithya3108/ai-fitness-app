import { UserData, FitnessPlan } from '../utils/storage';
import { generateFitnessPlanWithGemini } from './gemini-service';

export async function generateFitnessPlan(userData: UserData): Promise<FitnessPlan> {
  return await generateFitnessPlanWithGemini(userData);
}