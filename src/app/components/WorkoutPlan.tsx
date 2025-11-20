"use client";

import { useState } from "react";
import { generateExerciseImage } from "../lib/image-service";

interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  description: string;
}

interface DailyRoutine {
  day: string;
  exercises: Exercise[];
}

interface WorkoutPlanProps {
  plan: {
    dailyRoutines: DailyRoutine[];
  };
}

export default function WorkoutPlan({ plan }: WorkoutPlanProps) {
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  // image state per exercise card
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorById, setErrorById] = useState<Record<string, string | null>>({});

  if (!plan.dailyRoutines || plan.dailyRoutines.length === 0) {
    return (
      <div className="card p-6">
        <h2 className="section-title mb-3">🏋️ Workout Plan</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          No workout routines available. Please regenerate your plan.
        </p>
      </div>
    );
  }

  const safeIndex = Math.min(activeDayIndex, plan.dailyRoutines.length - 1);
  const currentRoutine = plan.dailyRoutines[safeIndex];

  const handleViewImage = async (exercise: Exercise, id: string) => {
    console.log("🖱 CLICKED:", exercise.name);

    // If we already have the image cached, just toggle loading off
    if (imageUrls[id]) {
      setLoadingId(null);
      setErrorById((prev) => ({ ...prev, [id]: null }));
      return;
    }

    setLoadingId(id);
    setErrorById((prev) => ({ ...prev, [id]: null }));

    try {
      const url = await generateExerciseImage(exercise.name);
      console.log("🎨 FINAL IMAGE URL:", url);

      if (!url) {
        setErrorById((prev) => ({
          ...prev,
          [id]: "Failed to load image",
        }));
      } else {
        setImageUrls((prev) => ({
          ...prev,
          [id]: url,
        }));
      }
    } catch (err: any) {
      console.error("❌ Error loading image:", err);
      setErrorById((prev) => ({
        ...prev,
        [id]: "Error generating image",
      }));
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="card card-wide p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">🏋️ Workout Plan</h2>
        <div className="chip">{plan.dailyRoutines.length} workout days</div>
      </div>

      {/* Day selector */}
      <div className="week-row">
        {plan.dailyRoutines.map((routine, idx) => (
          <button
            key={idx}
            type="button"
            className={`week-pill ${
              safeIndex === idx ? "week-pill--active" : ""
            }`}
            onClick={() => {
              setActiveDayIndex(idx);
              setLoadingId(null);
            }}
          >
            <span className="week-pill-day">{routine.day}</span>
            <span className="week-pill-meta">
              {routine.exercises?.length || 0} exercises
            </span>
          </button>
        ))}
      </div>

      {/* Exercises for current day */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          {currentRoutine.day}
        </h3>

        {currentRoutine.exercises.map((exercise, index) => {
          const id = `${safeIndex}-${index}`;
          const url = imageUrls[id];
          const isLoading = loadingId === id;
          const error = errorById[id];

          return (
            <div key={index} className="exercise-card">
              <div className="exercise-header">
                <div>
                  <div className="exercise-name">
                    {exercise.name}
                    <span className="exercise-index">#{index + 1}</span>
                  </div>
                  <p className="exercise-desc">{exercise.description}</p>
                </div>

                <div className="exercise-meta">
                  <div className="meta-box">
                    <div className="meta-label">SETS</div>
                    <div className="meta-value">{exercise.sets}</div>
                  </div>
                  <div className="meta-box">
                    <div className="meta-label">REPS</div>
                    <div className="meta-value">{exercise.reps}</div>
                  </div>
                  <div className="meta-box">
                    <div className="meta-label">REST</div>
                    <div className="meta-value">{exercise.rest}</div>
                  </div>
                </div>
              </div>

              <div className="exercise-footer">
                <button
                  type="button"
                  className="view-image-btn"
                  onClick={() => handleViewImage(exercise, id)}
                >
                  📷 View image
                </button>
              </div>

              {/* Inline image / status */}
              <div className="exercise-image-wrap">
                {isLoading && (
                  <p className="exercise-image-status">Loading image...</p>
                )}

                {error && !isLoading && (
                  <p className="exercise-image-status error">{error}</p>
                )}

                {url && !isLoading && !error && (
                  <img
                    src={url}
                    alt={exercise.name}
                    className="exercise-image"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
