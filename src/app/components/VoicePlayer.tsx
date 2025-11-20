"use client";

import { useState, useEffect } from "react";

interface VoicePlayerProps {
  plan: any;
}

export default function VoicePlayer({ plan }: VoicePlayerProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      const englishVoice = voices.find((v) => v.lang.includes("en")) || voices[0];
      setVoice(englishVoice);
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      speechSynthesis.cancel();
    };
  }, []);

  const speak = (text: string, section: string) => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;

      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setCurrentSection(section);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setCurrentSection(null);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setCurrentSection(null);
      };

      speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported in your browser. Try Chrome or Edge.");
    }
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
    setCurrentSection(null);
  };

  const speakWorkoutPlan = () => {
    const workoutText = plan.workout.dailyRoutines
      .map(
        (routine: any) =>
          `${routine.day}. ${routine.exercises
            .map(
              (ex: any) =>
                `${ex.name}. ${ex.sets} sets of ${ex.reps}. Rest ${ex.rest}. ${ex.description}`
            )
            .join(". ")}`
      )
      .join(". ");

    speak(`Your workout plan. ${workoutText}`, "workout");
  };

  const speakDietPlan = () => {
    const dietText = `Your diet plan. Breakfast: ${plan.diet.meals.breakfast}. Lunch: ${plan.diet.meals.lunch}. Dinner: ${plan.diet.meals.dinner}. Snacks: ${plan.diet.meals.snacks}. Remember to stay hydrated and eat at regular intervals.`;
    speak(dietText, "diet");
  };

  const speakTips = () => {
    const tipsText = `Here are your fitness tips. ${plan.tips.join(
      ". "
    )}. And remember: ${plan.motivation}`;
    speak(tipsText, "tips");
  };

  return (
    <div className="card p-6">
      <h2 className="section-title mb-4">🔊 Voice Guide</h2>

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <button
          onClick={speakWorkoutPlan}
          disabled={isSpeaking && currentSection !== "workout"}
          className={`flex flex-col items-center gap-1 rounded-xl border-2 p-4 text-sm transition ${
            isSpeaking && currentSection === "workout"
              ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/40"
              : "border-slate-200 hover:border-blue-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-blue-500 dark:hover:bg-slate-800"
          } ${isSpeaking && currentSection !== "workout" ? "opacity-50" : ""}`}
        >
          <span className="text-xl">🏋️</span>
          <span className="font-semibold text-slate-900 dark:text-slate-50">
            Workout Plan
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Listen to exercises
          </span>
        </button>

        <button
          onClick={speakDietPlan}
          disabled={isSpeaking && currentSection !== "diet"}
          className={`flex flex-col items-center gap-1 rounded-xl border-2 p-4 text-sm transition ${
            isSpeaking && currentSection === "diet"
              ? "border-emerald-500 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-950/40"
              : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-emerald-500 dark:hover:bg-slate-800"
          } ${isSpeaking && currentSection !== "diet" ? "opacity-50" : ""}`}
        >
          <span className="text-xl">🥗</span>
          <span className="font-semibold text-slate-900 dark:text-slate-50">
            Diet Plan
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Listen to meals
          </span>
        </button>

        <button
          onClick={speakTips}
          disabled={isSpeaking && currentSection !== "tips"}
          className={`flex flex-col items-center gap-1 rounded-xl border-2 p-4 text-sm transition ${
            isSpeaking && currentSection === "tips"
              ? "border-purple-500 bg-purple-50 dark:border-purple-500 dark:bg-purple-950/40"
              : "border-slate-200 hover:border-purple-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-purple-500 dark:hover:bg-slate-800"
          } ${isSpeaking && currentSection !== "tips" ? "opacity-50" : ""}`}
        >
          <span className="text-xl">💡</span>
          <span className="font-semibold text-slate-900 dark:text-slate-50">
            Tips & Motivation
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Get inspired
          </span>
        </button>
      </div>

      {isSpeaking ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm dark:border-amber-800 dark:bg-amber-950/50">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="animate-pulse text-xl">🔊</div>
              <div>
                <p className="font-semibold text-amber-900 dark:text-amber-100">
                  Reading your {currentSection}...
                </p>
                <p className="text-xs text-amber-800/80 dark:text-amber-200/80">
                  Audio guide is playing.
                </p>
              </div>
            </div>
            <button
              onClick={stopSpeaking}
              className="rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-600"
            >
              ⏹️ Stop
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          🔊 Tap any section above to listen to your plan.
        </p>
      )}
    </div>
  );
}
