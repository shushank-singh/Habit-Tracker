import React from 'react';
import { X, Award, Flame, CheckCircle, TrendingUp, Calendar, Trophy } from 'lucide-react';
import { NUMBER_BOX_COLORS, TRACK_COLORS } from './HabitTrackerSheet';

export default function StatsDrawer({ isOpen, onClose, state }) {
  if (!isOpen) return null;

  const totalDays = state.monthType || 31;

  // Calculate stats for each named daily habit
  const habitStats = (state.dailyHabits || [])
    .map((habit, idx) => {
      if (!habit.name?.trim()) return null;

      let completedDays = 0;
      let bestStreak = 0;
      let runningStreak = 0;
      let lastCheckedDay = 0;

      for (let day = 1; day <= totalDays; day++) {
        const isChecked = Boolean(state.checks?.[`${idx}-${day}`]);
        if (isChecked) {
          completedDays++;
          runningStreak++;
          lastCheckedDay = day;
          if (runningStreak > bestStreak) {
            bestStreak = runningStreak;
          }
        } else {
          runningStreak = 0;
        }
      }

      // Current streak: consecutive checked days ending at the latest checked day
      let currentStreak = 0;
      if (lastCheckedDay > 0) {
        for (let day = lastCheckedDay; day >= 1; day--) {
          if (state.checks?.[`${idx}-${day}`]) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      const percent = Math.round((completedDays / totalDays) * 100);

      return {
        id: habit.id,
        idx,
        num: habit.num || `${idx + 1}`,
        name: habit.name,
        badgeColor: NUMBER_BOX_COLORS[idx],
        trackColor: TRACK_COLORS[idx],
        completedDays,
        totalDays,
        percent,
        currentStreak,
        bestStreak,
      };
    })
    .filter(Boolean);

  const totalPossible = habitStats.length * totalDays;
  const totalCompleted = habitStats.reduce((sum, h) => sum + h.completedDays, 0);
  const overallRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

  return (
    <div
      className="no-print fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-stone-900 text-stone-100 h-full shadow-2xl flex flex-col border-l border-stone-800 animate-slide-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-teal-400" />
            <h2 className="text-base font-bold font-serif italic tracking-wide">
              {state.month || 'Monthly'} Habit Insights
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Close Stats"
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
                  Monthly Consistency ({totalDays} Days)
                </p>
                <p className="text-3xl font-extrabold text-white mt-1">
                  {overallRate}%
                </p>
                <p className="text-xs text-stone-400 mt-0.5">
                  {totalCompleted} of {totalPossible} habit targets completed
                </p>
              </div>
              <div className="w-14 h-14 rounded-full border-4 border-stone-700 flex items-center justify-center bg-stone-900/60">
                <TrendingUp className="w-6 h-6 text-teal-400" />
              </div>
            </div>
            <div className="w-full bg-stone-700 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-teal-600 h-full rounded-full transition-all duration-500"
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
                No daily habits named yet. Click any colored bar on the sheet to name a habit!
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
                          className="w-5 h-5 rounded text-[11px] font-bold text-stone-900 flex items-center justify-center shrink-0 border border-black/20"
                          style={{ backgroundColor: h.badgeColor }}
                        >
                          {h.num}
                        </span>
                        <span className="font-medium text-sm text-stone-200 truncate">
                          {h.name}
                        </span>
                      </div>
                      <span className="text-stone-200 font-bold text-xs shrink-0">
                        {h.percent}% ({h.completedDays}/{h.totalDays})
                      </span>
                    </div>

                    {/* Streaks row */}
                    <div className="flex items-center justify-between mt-2 text-[11px]">
                      <span className="flex items-center gap-1 text-amber-300 font-semibold">
                        <Flame className="w-3.5 h-3.5" />
                        Current: {h.currentStreak}d
                      </span>
                      <span className="flex items-center gap-1 text-teal-300 font-semibold">
                        <Trophy className="w-3.5 h-3.5" />
                        Best: {h.bestStreak}d
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-stone-700/60 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${h.percent}%`,
                          backgroundColor: h.badgeColor,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weekly Goals Summary */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-stone-400 font-semibold mb-3 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-sky-400" />
              <span>Weekly Goals</span>
            </h3>
            <div className="space-y-2">
              {(state.weeklyHabits || [])
                .filter((w) => w.name?.trim())
                .map((w, idx) => {
                  const doneWeeks = (w.weeks || []).filter(Boolean).length;
                  return (
                    <div
                      key={`weekly-summary-${idx}`}
                      className="flex items-center justify-between p-2.5 bg-stone-800/50 rounded-lg border border-stone-700/50 text-xs"
                    >
                      <span className="text-stone-200 font-medium truncate mr-2">{w.name}</span>
                      <span className="text-stone-400 font-mono shrink-0">
                        {doneWeeks}/5 weeks
                      </span>
                    </div>
                  );
                })}
              {(state.weeklyHabits || []).filter((w) => w.name?.trim()).length === 0 && (
                <p className="text-sm text-stone-500 italic py-1">No weekly goals entered yet.</p>
              )}
            </div>
          </div>

          {/* Monthly Goals Summary */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-stone-400 font-semibold mb-3 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Monthly Goals</span>
            </h3>
            <div className="space-y-2">
              {(state.monthlyHabits || [])
                .filter((m) => m.name?.trim())
                .map((m, idx) => (
                  <div
                    key={`monthly-summary-${idx}`}
                    className="flex items-center justify-between p-2.5 bg-stone-800/50 rounded-lg border border-stone-700/50 text-xs"
                  >
                    <span className="text-stone-200 font-medium truncate mr-2">{m.name}</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded shrink-0 ${
                        m.status
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                          : 'text-stone-500'
                      }`}
                    >
                      {m.status ? 'Done ✓' : 'Pending'}
                    </span>
                  </div>
                ))}
              {(state.monthlyHabits || []).filter((m) => m.name?.trim()).length === 0 && (
                <p className="text-sm text-stone-500 italic py-1">No monthly goals entered yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            Close Insights
          </button>
        </div>
      </div>
    </div>
  );
}
