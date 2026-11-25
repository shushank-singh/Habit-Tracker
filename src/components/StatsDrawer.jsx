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
      className="no-print stats-backdrop"
      onClick={onClose}
    >
      <div
        className="stats-drawer animate-slide-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="stats-header">
          <div className="flex items-center gap-2">
            <span className="stats-header-icon">
              <Award className="w-4 h-4" style={{ color: '#1D9589' }} />
            </span>
            <h2 className="stats-title font-serif italic">
              {state.month || 'Monthly'} Habit Insights
            </h2>
          </div>
          <button
            onClick={onClose}
            className="stats-close-btn"
            aria-label="Close Stats"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="stats-body">
          {/* Overall Card */}
          <div className="stats-hero-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="stats-eyebrow">
                  Monthly Consistency · {totalDays} Days
                </p>
                <p className="stats-big-num">
                  {overallRate}%
                </p>
                <p className="stats-subtext">
                  {totalCompleted} of {totalPossible} habit targets completed
                </p>
              </div>
              <div className="stats-ring-badge">
                <TrendingUp className="w-5 h-5" style={{ color: '#1D9589' }} />
              </div>
            </div>
            <div className="stats-progress-track">
              <div
                className="stats-progress-fill"
                style={{ width: `${overallRate}%` }}
              />
            </div>
          </div>

          {/* Daily Habits Breakdown */}
          <div>
            <h3 className="stats-section-title">
              <Flame className="w-3.5 h-3.5" style={{ color: '#d97706' }} />
              <span>Daily Habits ({habitStats.length})</span>
            </h3>

            {habitStats.length === 0 ? (
              <p className="stats-empty">
                No daily habits named yet. Click any colored bar on the sheet to name a habit!
              </p>
            ) : (
              <div className="space-y-2">
                {habitStats.map((h) => (
                  <div key={`stat-habit-${h.id}`} className="stats-habit-card">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="stats-num-badge"
                          style={{ backgroundColor: h.badgeColor }}
                        >
                          {h.num}
                        </span>
                        <span className="stats-habit-name truncate">
                          {h.name}
                        </span>
                      </div>
                      <span className="stats-habit-pct">
                        {h.percent}% <span className="stats-habit-frac">({h.completedDays}/{h.totalDays})</span>
                      </span>
                    </div>

                    <div className="stats-streak-row">
                      <span className="stats-streak-pill is-current">
                        <Flame className="w-3 h-3" />
                        Current: {h.currentStreak}d
                      </span>
                      <span className="stats-streak-pill is-best">
                        <Trophy className="w-3 h-3" />
                        Best: {h.bestStreak}d
                      </span>
                    </div>

                    <div className="stats-mini-track">
                      <div
                        className="stats-mini-fill"
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
            <h3 className="stats-section-title">
              <Calendar className="w-3.5 h-3.5" style={{ color: '#1D9589' }} />
              <span>Weekly Goals</span>
            </h3>
            <div className="space-y-2">
              {(state.weeklyHabits || [])
                .filter((w) => w.name?.trim())
                .map((w, idx) => {
                  const doneWeeks = (w.weeks || []).filter(Boolean).length;
                  return (
                    <div key={`weekly-summary-${idx}`} className="stats-goal-row">
                      <span className="stats-goal-name truncate">{w.name}</span>
                      <span className="stats-goal-meta">
                        {doneWeeks}/5 weeks
                      </span>
                    </div>
                  );
                })}
              {(state.weeklyHabits || []).filter((w) => w.name?.trim()).length === 0 && (
                <p className="stats-empty">No weekly goals entered yet.</p>
              )}
            </div>
          </div>

          {/* Monthly Goals Summary */}
          <div>
            <h3 className="stats-section-title">
              <CheckCircle className="w-3.5 h-3.5" style={{ color: '#15803d' }} />
              <span>Monthly Goals</span>
            </h3>
            <div className="space-y-2">
              {(state.monthlyHabits || [])
                .filter((m) => m.name?.trim())
                .map((m, idx) => (
                  <div key={`monthly-summary-${idx}`} className="stats-goal-row">
                    <span className="stats-goal-name truncate">{m.name}</span>
                    <span className={`stats-status-pill ${m.status ? 'is-done' : ''}`}>
                      {m.status ? 'Done ✓' : 'Pending'}
                    </span>
                  </div>
                ))}
              {(state.monthlyHabits || []).filter((m) => m.name?.trim()).length === 0 && (
                <p className="stats-empty">No monthly goals entered yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="stats-footer">
          <button onClick={onClose} className="stats-done-btn">
            Close Insights
          </button>
        </div>
      </div>
    </div>
  );
}
