'use client';

import { useState, useEffect } from 'react';
import UserForm from './components/UserForm';
import WorkoutPlan from './components/WorkoutPlan';
import DietPlan from './components/DietPlan';
import VoicePlayer from './components/VoicePlayer';
import { generateFitnessPlan } from './lib/ai-service';

import {
  savePlanToLocalStorage,
  getPlanFromLocalStorage,
  saveUserData,
  getUserData,
  UserData,
  FitnessPlan,
} from './utils/storage';

type ActiveSection = 'workout' | 'diet' | 'motivation';

export default function Home() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [fitnessPlan, setFitnessPlan] = useState<FitnessPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [showSavedPlan, setShowSavedPlan] = useState(false);
  const [activeSection, setActiveSection] = useState<ActiveSection>('workout');

  useEffect(() => {
    const savedPlan = getPlanFromLocalStorage();
    const savedUserData = getUserData();

    if (savedPlan && savedUserData) {
      setFitnessPlan(savedPlan);
      setUserData(savedUserData);
      setShowSavedPlan(true);
    }

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleFormSubmit = async (data: UserData) => {
    setLoading(true);
    setError('');
    setUserData(data);
    saveUserData(data);

    try {
      const plan = await generateFitnessPlan(data);
      setFitnessPlan(plan);
      setShowSavedPlan(false);
      setActiveSection('workout');
    } catch (err) {
      setError('Failed to generate fitness plan. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (userData) {
      await handleFormSubmit(userData);
    }
  };

  const handleNewPlan = () => {
    setFitnessPlan(null);
    setUserData(null);
    setShowSavedPlan(false);
  };

  const handleUseSavedPlan = () => {
    setShowSavedPlan(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">💪</div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Fitness Assistant
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {fitnessPlan && (
                <button
                  onClick={handleNewPlan}
                  className="bg-gray-700 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm transition duration-200"
                >
                  New Plan
                </button>
              )}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-200 text-sm"
              >
                {darkMode ? '☀️ Light' : '🌙 Dark'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Saved plan banner */}
        {showSavedPlan && fitnessPlan && (
          <div className="mb-6 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-2xl p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="text-2xl">📋</div>
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-200">
                    Saved Plan Found!
                  </h3>
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    We found your previously generated fitness plan. Would you like to use it?
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleUseSavedPlan}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition duration-200"
                >
                  Use Saved Plan
                </button>
                <button
                  onClick={handleNewPlan}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition duration-200"
                >
                  Create New
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-6 py-4 rounded-2xl text-sm">
            <div className="flex items-center gap-3">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* FORM VIEW */}
        {!fitnessPlan ? (
          <UserForm onSubmit={handleFormSubmit} loading={loading} />
        ) : (
          <div className="space-y-8">
            {/* Welcome card */}
            <div className="card p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-xs tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-1">
                    WELCOME BACK
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {userData?.name?.toUpperCase() || 'ATHLETE'}, your plan is ready 👋
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                    “{fitnessPlan.motivation}”
                  </p>
                </div>
                <div className="text-xs sm:text-sm text-right">
                  <div className="chip mb-1">Goal: {userData?.fitnessGoal}</div>
                  <div className="chip mb-1">Level: {userData?.fitnessLevel}</div>
                  <div className="chip">Location: {userData?.workoutLocation}</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleRegenerate}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"
                >
                  🔄 Regenerate Plan
                </button>
                <button
                  onClick={() => window.print()}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold"
                >
                  📄 Export PDF
                </button>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Plan tailored for <strong>{userData?.fitnessGoal}</strong> •{' '}
                <strong>{userData?.workoutLocation}</strong> •{' '}
                <strong>{userData?.fitnessLevel}</strong>
              </p>
            </div>

            {/* NAV CARDS */}
            <div className="nav-row">
              <div
                className={`nav-card ${activeSection === 'workout' ? 'nav-card--active' : ''}`}
                onClick={() => setActiveSection('workout')}
              >
                <div>
                  <div className="nav-title">Workout Plan</div>
                  <div className="nav-subtitle">
                    Weekly schedule & exercises
                  </div>
                </div>
                <div className="nav-card-emoji">🏋️</div>
              </div>

              <div
                className={`nav-card ${activeSection === 'diet' ? 'nav-card--active' : ''}`}
                onClick={() => setActiveSection('diet')}
              >
                <div>
                  <div className="nav-title">Diet Plan</div>
                  <div className="nav-subtitle">
                    Breakfast, lunch, dinner & snacks
                  </div>
                </div>
                <div className="nav-card-emoji">🥗</div>
              </div>

              <div
                className={`nav-card ${activeSection === 'motivation' ? 'nav-card--active' : ''}`}
                onClick={() => setActiveSection('motivation')}
              >
                <div>
                  <div className="nav-title">Voice & Tips</div>
                  <div className="nav-subtitle">
                    Audio guide & AI advice
                  </div>
                </div>
                <div className="nav-card-emoji">💡</div>
              </div>
            </div>

            {/* SECTION CONTENT */}
            {activeSection === 'workout' && (
              <WorkoutPlan plan={fitnessPlan.workout} />
            )}

            {activeSection === 'diet' && (
              <DietPlan plan={fitnessPlan.diet} />
            )}

            {activeSection === 'motivation' && (
              <>
                <VoicePlayer plan={fitnessPlan} />
                <div className="card p-6">
                  <h2 className="section-title mb-4">💡 AI Tips & Advice</h2>
                  <div className="mt-2 space-y-3">
                    {fitnessPlan.tips.map((tip, index) => (
                      <div key={index} className="ai-tip-row">
                        <span className="ai-tip-dot">•</span>
                        <p>{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      <footer className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400 text-sm">
            <p>Built with Next.js & AI • Your personal fitness assistant</p>
            <p className="mt-1">Stay consistent and trust the process 🚀</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
