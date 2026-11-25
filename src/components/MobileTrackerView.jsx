import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { NUMBER_BOX_COLORS, TRACK_COLORS } from './HabitTrackerSheet';
import { playPenTickSound, playCelebrationSound } from '../utils/audio';

export default function MobileTrackerView({
  state,
  setState,
  inkColor,
  fontStyle,
  soundEnabled,
  onOpenControls,
}) {
  const totalDays = state.monthType || 31;
  const [selectedDay, setSelectedDay] = useState(1);
  const [showAllWeekly, setShowAllWeekly] = useState(false);
  const dayStripRef = useRef(null);

  // Clamp selectedDay if month changes (e.g. 31 -> 28)
  useEffect(() => {
    if (selectedDay > totalDays) {
      setSelectedDay(totalDays);
    }
  }, [totalDays, selectedDay]);

  // Keep selected day pill centered in horizontal strip
  useEffect(() => {
    const container = dayStripRef.current;
    if (!container) return;
    const activeEl = container.querySelector(`[data-day="${selectedDay}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [selectedDay]);

  const penFontFamily =
    fontStyle === 'handwriting' ? "'Caveat', cursive" : "'Inter', sans-serif";

  // Stats for selected day
  const namedDailyIndices = (state.dailyHabits || [])
    .map((h, i) => (h.name?.trim() ? i : null))
    .filter((i) => i !== null);

  const dayCheckedCount = namedDailyIndices.filter(
    (i) => Boolean(state.checks?.[`${i}-${selectedDay}`])
  ).length;

  const toggleDailyCheck = (habitIdx) => {
    const key = `${habitIdx}-${selectedDay}`;
    const nextChecks = { ...state.checks, [key]: !state.checks[key] };
    setState({ ...state, checks: nextChecks });
    playPenTickSound(soundEnabled);

    if (namedDailyIndices.length > 0 && !state.checks[key]) {
      const allDone = namedDailyIndices.every((i) =>
        i === habitIdx ? true : nextChecks[`${i}-${selectedDay}`]
      );
      if (allDone) {
        playCelebrationSound(soundEnabled);
        confetti({
          particleCount: 40,
          spread: 55,
          origin: { y: 0.7 },
          colors: ['#E06B5E', '#F0C944', '#64B76B', '#55A2D7', '#D472A8'],
        });
      }
    }
  };

  const updateDailyName = (idx, name) => {
    const updated = [...state.dailyHabits];
    updated[idx] = { ...updated[idx], name };
    setState({ ...state, dailyHabits: updated });
  };

  const updateWeeklyName = (idx, name) => {
    const updated = [...state.weeklyHabits];
    updated[idx] = { ...updated[idx], name };
    setState({ ...state, weeklyHabits: updated });
  };

  const toggleWeeklyWeek = (habitIdx, weekIdx) => {
    const updated = [...state.weeklyHabits];
    const current = updated[habitIdx] || {
      id: habitIdx + 1,
      name: '',
      weeks: [false, false, false, false, false],
    };
    const weeks = [...(current.weeks || [false, false, false, false, false])];
    weeks[weekIdx] = !weeks[weekIdx];
    updated[habitIdx] = { ...current, weeks };
    setState({ ...state, weeklyHabits: updated });
    playPenTickSound(soundEnabled);
  };

  const updateMonthlyName = (idx, name) => {
    const updated = [...state.monthlyHabits];
    updated[idx] = { ...updated[idx], name };
    setState({ ...state, monthlyHabits: updated });
  };

  const toggleMonthlyStatus = (idx) => {
    const updated = [...state.monthlyHabits];
    const current = updated[idx] || { id: idx + 1, name: '', status: '' };
    updated[idx] = { ...current, status: current.status ? '' : '✓' };
    setState({ ...state, monthlyHabits: updated });
    playPenTickSound(soundEnabled);
  };

  const updateNote = (idx, val) => {
    const notes = [...(state.notes || ['', '', '', '', '', ''])];
    notes[idx] = val;
    setState({ ...state, notes });
  };

  // Show filled weekly rows + 1 empty slot (or all 10 if expanded)
  const weeklyRows = state.weeklyHabits || [];
  const lastFilledWeeklyIdx = weeklyRows.reduce(
    (acc, w, i) => (w.name?.trim() || (w.weeks || []).some(Boolean) ? i : acc),
    -1
  );
  const visibleWeeklyCount = showAllWeekly
    ? 10
    : Math.min(10, Math.max(3, lastFilledWeeklyIdx + 2));

  return (
    <div className="mob-container">
      {/* Month Hero & Day Stepper */}
      <section className="mob-card mob-day-hero">
        <div className="mob-hero-top">
          <div>
            <button onClick={onOpenControls} className="mob-month-chip">
              <span className="font-serif italic mob-month-name">
                {state.month || 'Select Month'}
              </span>
              <span className="mob-month-days">{totalDays} days</span>
            </button>
            <p className="mob-day-subtitle">
              {namedDailyIndices.length > 0
                ? `${dayCheckedCount} of ${namedDailyIndices.length} habits completed on Day ${selectedDay}`
                : `Tap any habit below to start tracking Day ${selectedDay}`}
            </p>
          </div>
          <div className="mob-day-nav">
            <button
              onClick={() => setSelectedDay((d) => Math.max(1, d - 1))}
              disabled={selectedDay <= 1}
              className="mob-nav-arrow"
              aria-label="Previous day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="mob-day-badge">Day {selectedDay}</span>
            <button
              onClick={() => setSelectedDay((d) => Math.min(totalDays, d + 1))}
              disabled={selectedDay >= totalDays}
              className="mob-nav-arrow"
              aria-label="Next day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Day Strip (1..totalDays) */}
        <div ref={dayStripRef} className="mob-day-strip">
          {Array.from({ length: totalDays }, (_, i) => {
            const d = i + 1;
            const isActive = d === selectedDay;
            const anyDone = (state.dailyHabits || []).some((_, hIdx) =>
              Boolean(state.checks?.[`${hIdx}-${d}`])
            );
            return (
              <button
                key={`mob-day-${d}`}
                data-day={d}
                onClick={() => setSelectedDay(d)}
                className={`mob-day-pill ${isActive ? 'is-active' : ''} ${
                  anyDone ? 'has-checks' : ''
                }`}
              >
                <span>{d}</span>
                <span className="mob-day-dot" />
              </button>
            );
          })}
        </div>
      </section>

      {/* Daily Habits (1–10 Rainbow Cards) */}
      <section className="mob-section">
        <div className="mob-section-head">
          <h2 className="mob-section-title font-serif italic">Daily Habits</h2>
          <span className="mob-section-meta">Day {selectedDay}</span>
        </div>

        <div className="mob-habit-list">
          {TRACK_COLORS.map((pastel, idx) => {
            const habit = state.dailyHabits[idx] || { id: idx + 1, num: `${idx + 1}`, name: '' };
            const isChecked = Boolean(state.checks?.[`${idx}-${selectedDay}`]);

            return (
              <div
                key={`mob-daily-${idx}`}
                className={`mob-habit-row ${isChecked ? 'is-checked' : ''}`}
                style={{
                  backgroundColor: isChecked ? pastel : '#ffffff',
                  borderColor: isChecked ? NUMBER_BOX_COLORS[idx] : '#e4e0d8',
                }}
              >
                <span
                  className="mob-num-badge"
                  style={{ backgroundColor: NUMBER_BOX_COLORS[idx] }}
                >
                  {habit.num || idx + 1}
                </span>

                <input
                  type="text"
                  value={habit.name}
                  placeholder={`Add habit ${idx + 1}...`}
                  onChange={(e) => updateDailyName(idx, e.target.value)}
                  className="mob-inline-input"
                  style={{
                    color: inkColor,
                    fontFamily: penFontFamily,
                    fontSize: fontStyle === 'handwriting' ? '20px' : '14px',
                    fontWeight: fontStyle === 'handwriting' ? 600 : 500,
                  }}
                />

                <button
                  onClick={() => toggleDailyCheck(idx)}
                  aria-label={`Toggle ${habit.name || `Habit ${idx + 1}`} for Day ${selectedDay}`}
                  className={`mob-check-btn ${isChecked ? 'is-checked' : ''}`}
                  style={
                    isChecked
                      ? { backgroundColor: inkColor, borderColor: inkColor }
                      : undefined
                  }
                >
                  {isChecked && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Weekly Goals (1..5 pills) */}
      <section className="mob-section">
        <div className="mob-section-head">
          <h2 className="mob-section-title font-serif italic">Weekly</h2>
          {!showAllWeekly && visibleWeeklyCount < 10 && (
            <button
              onClick={() => setShowAllWeekly(true)}
              className="mob-text-link"
            >
              <Plus className="w-3 h-3" /> Show all 10
            </button>
          )}
        </div>

        <div className="mob-card mob-stack-card">
          {weeklyRows.slice(0, visibleWeeklyCount).map((w, rIdx) => (
            <div key={`mob-weekly-${rIdx}`} className="mob-weekly-item">
              <input
                type="text"
                value={w.name}
                placeholder={`Weekly goal ${rIdx + 1}...`}
                onChange={(e) => updateWeeklyName(rIdx, e.target.value)}
                className="mob-inline-input"
                style={{
                  color: inkColor,
                  fontFamily: penFontFamily,
                  fontSize: fontStyle === 'handwriting' ? '19px' : '13.5px',
                  fontWeight: fontStyle === 'handwriting' ? 600 : 500,
                }}
              />
              <div className="mob-week-pills">
                {[0, 1, 2, 3, 4].map((wIdx) => {
                  const checked = Boolean(w.weeks?.[wIdx]);
                  return (
                    <button
                      key={`mob-w-${rIdx}-${wIdx}`}
                      onClick={() => toggleWeeklyWeek(rIdx, wIdx)}
                      className={`mob-week-pill ${checked ? 'is-checked' : ''}`}
                      style={
                        checked
                          ? { backgroundColor: inkColor, borderColor: inkColor, color: '#fff' }
                          : undefined
                      }
                      aria-label={`Week ${wIdx + 1}`}
                    >
                      {checked ? '✓' : `W${wIdx + 1}`}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Monthly Goals */}
      <section className="mob-section">
        <div className="mob-section-head">
          <h2 className="mob-section-title font-serif italic">Monthly</h2>
        </div>

        <div className="mob-card mob-stack-card">
          {(state.monthlyHabits || []).map((m, rIdx) => {
            const done = Boolean(m.status);
            return (
              <div key={`mob-monthly-${rIdx}`} className="mob-monthly-item">
                <input
                  type="text"
                  value={m.name}
                  placeholder={`Monthly goal ${rIdx + 1}...`}
                  onChange={(e) => updateMonthlyName(rIdx, e.target.value)}
                  className="mob-inline-input"
                  style={{
                    color: inkColor,
                    fontFamily: penFontFamily,
                    fontSize: fontStyle === 'handwriting' ? '19px' : '13.5px',
                    fontWeight: fontStyle === 'handwriting' ? 600 : 500,
                  }}
                />
                <button
                  onClick={() => toggleMonthlyStatus(rIdx)}
                  className={`mob-check-btn ${done ? 'is-checked' : ''}`}
                  style={
                    done
                      ? { backgroundColor: inkColor, borderColor: inkColor }
                      : undefined
                  }
                  aria-label={`Toggle monthly goal ${rIdx + 1}`}
                >
                  {done && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Notes */}
      <section className="mob-section">
        <div className="mob-section-head">
          <h2 className="mob-section-title font-serif italic">Notes</h2>
          <span className="mob-section-meta">
            <Sparkles className="w-3 h-3" style={{ color: '#1D9589' }} /> Auto-saved
          </span>
        </div>

        <div className="mob-card mob-notes-card">
          {[1, 2, 3, 4, 5, 0].map((noteIdx, displayIdx) => (
            <div key={`mob-note-${noteIdx}`} className="mob-note-line">
              <input
                type="text"
                value={state.notes?.[noteIdx] || ''}
                placeholder={displayIdx === 0 ? 'Write a monthly reflection or reminder...' : ''}
                onChange={(e) => updateNote(noteIdx, e.target.value)}
                className="mob-inline-input"
                style={{
                  color: inkColor,
                  fontFamily: penFontFamily,
                  fontSize: fontStyle === 'handwriting' ? '19px' : '13.5px',
                  fontWeight: fontStyle === 'handwriting' ? 600 : 500,
                }}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
