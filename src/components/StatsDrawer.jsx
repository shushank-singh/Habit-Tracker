import React from 'react';
import { X, Award, Flame, CheckCircle, TrendingUp, Calendar } from 'lucide-react';
import { TRACK_COLORS } from './HabitTrackerSheet';

export default function StatsDrawer({ isOpen, onClose, state }) {
  if (!isOpen) return null;

  const totalDays = state.monthType || 29;

  // Calculate stats for each daily habit
  const habitStats = state.dailyHabits
    .map((habit, idx) => {
      if (!habit.name.trim()) return null;

      let completedDays = 0;
      let maxStreak = 0;
      let currentStreak = 0;

      for (let day = 1; day <= totalDays; day++) {
        const isChecked = Boolean(state.checks[`${idx}-${day}`]);
        if (isChecked) {
          completedDays++;
          currentStreak++;
          if (currentStreak > maxStreak) {
            maxStreak = currentStreak;
          }
        } else {
          currentStreak = 0;
        }
      }

      const percent = Math.round((completedDays / totalDays) * 100);

      return {
        id: habit.id,
        idx,
        num: habit.num || `${idx + 1}`,
        name: habit.name,
        color: TRACK_COLORS[idx],
        completedDays,
        totalDays,
        percent,
        maxStreak,
        currentStreak,
      };
    })
    .filter(Boolean);

  const totalPossible = habitStats.length * totalDays;
  const totalCompleted = habitStats.reduce((sum, h) => sum + h.completedDays, 0);
  const overallRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end transition-opacity">
      <div className="w-full max-w-md bg-stone-900 text-stone-100 h-full shadow-2xl flex flex-col border-l border-stone-800 animate-slide-left">
        {/* Header */}
        <div className="p-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-rose-400" />
            <h2 className="text-base font-bold font-serif tracking-wide">
              {state.month} Habit Insights
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          {/* Overall Card */}
          <div className="bg-gradient-to-br from-stone-800 to-stone-800/80 p-4 rounded-xl border border-stone-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-stone-400 font-semibold">
                  Monthly Consistency
                </p>
                <p className="text-3xl font-extrabold text-white mt-1">
                  {overallRate}%
                </p>
                <p className="text-xs text-stone-400 mt-0.5">
                  {totalCompleted} of {totalPossible} habit targets completed
                </p>
              </div>
              <div className="w-14 h-14 rounded-full border-4 border-stone-700 flex items-center justify-center bg-stone-900/60">
                <TrendingUp className="w-6 h-6 text-rose-400" />
              </div>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-stone-700 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${overallRate}%` }}
              />
            </div>
          </div>

          {/* Daily Habits Breakdown */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-stone-400 font-semibold mb-3 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Daily Habits Performance ({habitStats.length})</span>
            </h3>

            {habitStats.length === 0 ? (
              <p className="text-sm text-stone-500 italic py-2">
                No daily habits named yet. Enter habit names on the sheet to track their streaks!
              </p>
            ) : (
              <div className="space-y-3">
                {habitStats.map((h) => (
                  <div
                    key={`stat-habit-${h.id}`}
                    className="bg-stone-800/70 p-3 rounded-lg border border-stone-700/70 hover:border-stone-600 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 truncate">
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/20"
                          style={{ backgroundColor: h.color }}
                        />
                        <span className="font-medium text-sm text-stone-200 truncate">
                          {h.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 text-xs">
                        <span className="flex items-center gap-1 text-amber-300 font-semibold">
                          <Flame className="w-3.5 h-3.5 fill-amber-400/20" />
                          {h.maxStreak}d streak
                        </span>
                        <span className="text-stone-300 font-bold w-9 text-right">
                          {h.percent}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-stone-700/60 h-1.5 rounded-full mt-2.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${h.percent}%`,
                          backgroundColor: h.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weekly Habits Summary */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-stone-400 font-semibold mb-3 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-sky-400" />
              <span>Weekly Goals</span>
            </h3>
            <div className="space-y-2">
              {state.weeklyHabits
                .filter((w) => w.name.trim())
                .map((w, idx) => {
                  const doneWeeks = w.weeks.filter(Boolean).length;
                  return (
                    <div
                      key={`weekly-summary-${idx}`}
                      className="flex items-center justify-between p-2.5 bg-stone-800/50 rounded-lg border border-stone-700/50 text-xs"
                    >
                      <span className="text-stone-200 font-medium">{w.name}</span>
                      <span className="text-stone-400 font-mono">
                        {doneWeeks}/5 weeks checked
                      </span>
                    </div>
                  );
                })}
              {state.weeklyHabits.filter((w) => w.name.trim()).length === 0 && (
                <p className="text-sm text-stone-500 italic py-1">No weekly habits entered yet.</p>
              )}
            </div>
          </div>

          {/* Monthly Habits Summary */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-stone-400 font-semibold mb-3 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Monthly Target</span>
            </h3>
            <div className="space-y-2">
              {state.monthlyHabits
                .filter((m) => m.name.trim())
                .map((m, idx) => (
                  <div
                    key={`monthly-summary-${idx}`}
                    className="flex items-center justify-between p-2.5 bg-stone-800/50 rounded-lg border border-stone-700/50 text-xs"
                  >
                    <span className="text-stone-200 font-medium">{m.name}</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded ${
                        m.status === 'Yes' || m.status === '✓'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                          : 'text-stone-500'
                      }`}
                    >
                      {m.status || 'Pending'}
                    </span>
                  </div>
                ))}
              {state.monthlyHabits.filter((m) => m.name.trim()).length === 0 && (
                <p className="text-sm text-stone-500 italic py-1">No monthly habits entered yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-sm font-medium transition-colors"
          >
            Close Insights
          </button>
        </div>
      </div>
    </div>
  );
}
