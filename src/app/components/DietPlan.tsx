"use client";

interface DietPlanProps {
  plan: {
    meals: {
      [key: string]: string | undefined;
      breakfast?: string;
      lunch?: string;
      dinner?: string;
      snacks?: string;
    };
  };
}

const MEAL_META: Record<
  string,
  { emoji: string; timing: string; calories: string; importance: string }
> = {
  breakfast: {
    emoji: "🍳",
    timing: "7:00 - 8:00 AM",
    calories: "350-450 kcal",
    importance: "High - Kickstarts metabolism",
  },
  lunch: {
    emoji: "🥗",
    timing: "12:00 - 1:00 PM",
    calories: "450-550 kcal",
    importance: "High - Sustained energy",
  },
  dinner: {
    emoji: "🍲",
    timing: "6:00 - 7:00 PM",
    calories: "400-500 kcal",
    importance: "Medium - Light & nutritious",
  },
  snacks: {
    emoji: "🍎",
    timing: "10:00 AM & 4:00 PM",
    calories: "150-200 kcal each",
    importance: "Medium - Prevents overeating",
  },
};

export default function DietPlan({ plan }: DietPlanProps) {
  const meals = Object.entries(plan.meals || {})
    .filter(([, content]) => !!content)
    .map(([key, content]) => {
      const lower = key.toLowerCase();
      const meta =
        MEAL_META[lower] || {
          emoji: "🍽️",
          timing: "",
          calories: "",
          importance: "",
        };

      const label = lower.charAt(0).toUpperCase() + lower.slice(1);

      // split "350-450 kcal" -> "350-450" + "kcal"
      let mainCal = "";
      let calLabel = "";
      if (meta.calories) {
        const parts = meta.calories.split(" ");
        mainCal = parts[0] || "";
        calLabel = (parts.slice(1).join(" ") || "kcal").trim();
      }

      return {
        key: lower,
        label,
        content: content as string,
        emoji: meta.emoji,
        timing: meta.timing,
        importance: meta.importance,
        mainCal,
        calLabel,
      };
    });

  return (
    <div className="card card-narrow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="section-title">🥗 Diet Plan</h2>
        <div className="chip">Balanced Nutrition</div>
      </div>

      {/* Meal cards */}
      <div className="space-y-4">
        {meals.map((meal) => (
          <div
            key={meal.key}
            className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700"
          >
            <div className="flex items-start justify-between mb-3 gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{meal.emoji}</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {meal.label}
                  </h3>
                  {meal.timing && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {meal.timing}
                    </p>
                  )}
                </div>
              </div>

              {meal.mainCal && (
                <div className="diet-cal-box">
                  <span className="diet-cal-box-main">{meal.mainCal}</span>
                  <span className="diet-cal-box-label">
                    {meal.calLabel || "kcal"}
                  </span>
                </div>
              )}
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed text-sm">
              {meal.content}
            </p>

            {meal.importance && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {meal.importance}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Nutrition Tips block (unchanged) */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
          💡 Nutrition Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700 dark:text-blue-300">
          <div className="flex items-start gap-2">
            <span>💧</span>
            <span>Drink 2-3 liters of water throughout the day</span>
          </div>
          <div className="flex items-start gap-2">
            <span>⏰</span>
            <span>Eat every 3-4 hours to maintain energy levels</span>
          </div>
          <div className="flex items-start gap-2">
            <span>🥗</span>
            <span>Include vegetables in at least 2 meals daily</span>
          </div>
          <div className="flex items-start gap-2">
            <span>⚖️</span>
            <span>Balance protein, carbs, and healthy fats</span>
          </div>
        </div>
      </div>
    </div>
  );
}
