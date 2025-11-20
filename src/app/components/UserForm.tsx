'use client';

import { useState } from 'react';
import { UserData } from '../utils/storage';

interface UserFormProps {
  onSubmit: (data: UserData) => void;
  loading: boolean;
}

export default function UserForm({ onSubmit, loading }: UserFormProps) {
  const [formData, setFormData] = useState<UserData>({
    name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    fitnessGoal: '',
    fitnessLevel: '',
    workoutLocation: '',
    dietaryPreferences: '',
    medicalHistory: '',
    stressLevel: '',
  });

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="form-shell">
      {/* Hero section */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-500 text-2xl">
          🧠
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Your Personal AI Fitness Coach
        </h1>
        <p className="mt-3 max-w-xl mx-auto text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Enter your details and let AI craft your personalized workout and diet
          plan.
        </p>
      </div>

      {/* Card with form */}
      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-grid">
          {/* Name */}
          <div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Name"
              className="form-field"
            />
          </div>

          {/* Age */}
          <div>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              min={16}
              max={80}
              placeholder="Age"
              className="form-field"
            />
          </div>

          {/* Gender */}
          <div>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="">Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Height */}
          <div>
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              required
              min={100}
              max={250}
              placeholder="Height (cm)"
              className="form-field"
            />
          </div>

          {/* Weight */}
          <div>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              required
              min={30}
              max={200}
              placeholder="Weight (kg)"
              className="form-field"
            />
          </div>

          {/* Fitness Goal */}
          <div>
            <select
              name="fitnessGoal"
              value={formData.fitnessGoal}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="">Fitness Goal</option>
              <option value="weight_loss">Weight Loss</option>
              <option value="muscle_gain">Muscle Gain</option>
              <option value="maintenance">Maintenance</option>
              <option value="endurance">Endurance</option>
            </select>
          </div>

          {/* Fitness Level */}
          <div>
            <select
              name="fitnessLevel"
              value={formData.fitnessLevel}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="">Current Fitness Level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Workout Location */}
          <div>
            <select
              name="workoutLocation"
              value={formData.workoutLocation}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="">Workout Location</option>
              <option value="home">Home</option>
              <option value="gym">Gym</option>
              <option value="outdoor">Outdoor</option>
            </select>
          </div>

          {/* Dietary Preference */}
          <div>
            <select
              name="dietaryPreferences"
              value={formData.dietaryPreferences}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="">Dietary Preference</option>
              <option value="veg">Vegetarian</option>
              <option value="non-veg">Non-Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="keto">Keto</option>
            </select>
          </div>

          {/* Medical History */}
          <div className="full-span">
            <textarea
              name="medicalHistory"
              value={formData.medicalHistory}
              onChange={handleChange}
              rows={3}
              placeholder="Medical History (optional)"
              className="form-textarea"
            />
          </div>

          {/* Stress Level */}
          <div className="full-span">
            <select
              name="stressLevel"
              value={formData.stressLevel}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">Stress Level (optional)</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="form-submit-btn"
        >
          {loading ? (
            <>
              <span
                style={{
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  borderRadius: '9999px',
                  border: '2px solid rgba(255,255,255,0.7)',
                  borderBottomColor: 'transparent',
                  marginRight: '8px',
                  animation: 'spin 0.7s linear infinite',
                }}
              />
              Generating your plan...
            </>
          ) : (
            'Generate My Plan 💪'
          )}
        </button>
      </form>
    </div>
  );
}
