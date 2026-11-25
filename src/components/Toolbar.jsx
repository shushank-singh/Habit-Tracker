import React from 'react';
import {
  Printer,
  Download,
  Volume2,
  VolumeX,
  Type,
  BarChart2,
  Calendar,
  Sparkles,
  Eraser,
  SlidersHorizontal,
  X,
  LayoutList,
  CircleDot,
} from 'lucide-react';
import { exportToPNG, exportToSVG } from '../utils/export';
import { SAMPLE_INITIAL_STATE, BLANK_INITIAL_STATE } from './HabitTrackerSheet';

const INK_PALETTES = [
  { name: 'Ballpoint Black', color: '#1c1917' },
  { name: 'Navy Ink', color: '#1d3557' },
  { name: 'Crimson', color: '#9f1239' },
  { name: 'Forest Green', color: '#065f46' },
  { name: 'Royal Violet', color: '#4338ca' },
];

const MONTHS = [
  { name: 'January', days: 31 },
  { name: 'February', days: 28 },
  { name: 'March', days: 31 },
  { name: 'April', days: 30 },
  { name: 'May', days: 31 },
  { name: 'June', days: 30 },
  { name: 'July', days: 31 },
  { name: 'August', days: 31 },
  { name: 'September', days: 30 },
  { name: 'October', days: 31 },
  { name: 'November', days: 30 },
  { name: 'December', days: 31 },
];

export default function Toolbar({
  state,
  setState,
  inkColor,
  setInkColor,
  fontStyle,
  setFontStyle,
  soundEnabled,
  setSoundEnabled,
  onOpenStats,
  onNotify,
  svgRef,
  mobileView,
  setMobileView,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) {
  const matchedMonth = MONTHS.find(
    (m) => m.name.toLowerCase() === (state.month || '').trim().toLowerCase()
  );
  const isFebruary = matchedMonth?.name === 'February';

  // Quick monthly completion badge
  const totalDays = state.monthType || 31;
  const activeHabits = (state.dailyHabits || []).filter((h) => h.name?.trim());
  const totalPossible = activeHabits.length * totalDays;
  let totalDone = 0;
  if (totalPossible > 0) {
    (state.dailyHabits || []).forEach((h, idx) => {
      if (!h.name?.trim()) return;
      for (let d = 1; d <= totalDays; d++) {
        if (state.checks?.[`${idx}-${d}`]) totalDone++;
      }
    });
  }
  const completionPct = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;

  const handleMonthChange = (e) => {
    const selected = MONTHS.find((m) => m.name === e.target.value);
    if (selected) {
      setState({
        ...state,
        month: selected.name,
        monthType: selected.days,
      });
    }
  };

  const handleLeapToggle = () => {
    setState({
      ...state,
      month: 'February',
      monthType: state.monthType === 29 ? 28 : 29,
    });
  };

  const handlePrint = () => {
    setIsMobileMenuOpen?.(false);
    window.print();
  };

  const fileSlug = (state.month || 'habit-tracker').trim().toLowerCase().replace(/\s+/g, '-');

  const handleExportPNG = () => {
    if (svgRef.current) {
      exportToPNG(svgRef.current, `${fileSlug}-a4-habit-tracker.png`);
      setIsMobileMenuOpen?.(false);
      onNotify?.({ text: 'Exported A4 PNG (3508 × 2480)' });
    }
  };

  const handleExportSVG = () => {
    if (svgRef.current) {
      exportToSVG(svgRef.current, `${fileSlug}-a4-habit-tracker.svg`);
      setIsMobileMenuOpen?.(false);
      onNotify?.({ text: 'Exported A4 Vector SVG (297 × 210 mm)' });
    }
  };

  const loadSample = () => {
    const prevState = state;
    setState(SAMPLE_INITIAL_STATE);
    setIsMobileMenuOpen?.(false);
    onNotify?.({
      text: 'Sample habits loaded',
      undo: () => setState(prevState),
    });
  };

  const clearSheet = () => {
    const prevState = state;
    setState({
      ...BLANK_INITIAL_STATE,
      month: state.month,
      monthType: state.monthType,
    });
    setIsMobileMenuOpen?.(false);
    onNotify?.({
      text: 'Sheet cleared',
      undo: () => setState(prevState),
    });
  };

  const renderControlsCluster = () => (
    <>
      <div className="tb-seg-group">
        <button
          onClick={loadSample}
          className="tb-seg-btn"
          title="Load sample habits and checkmarks"
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: '#b48a14' }} />
          <span>Sample</span>
        </button>
        <div className="tb-seg-divider" />
        <button
          onClick={clearSheet}
          className="tb-seg-btn"
          title="Clear all habits, checkmarks, and notes"
        >
          <Eraser className="w-3.5 h-3.5 text-stone-500 shrink-0" />
          <span>Clear</span>
        </button>
      </div>

      <div className="tb-pill">
        <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: '#1D9589' }} />
        <select
          value={matchedMonth ? matchedMonth.name : ''}
          onChange={handleMonthChange}
          aria-label="Select Month"
          className="tb-select"
        >
          {!matchedMonth && (
            <option value="">
              {state.month || 'Custom'} ({state.monthType}d)
            </option>
          )}
          {MONTHS.map((m) => (
            <option key={m.name} value={m.name}>
              {m.name} ({m.name === 'February' ? (state.monthType === 29 ? '29d' : '28d') : `${m.days}d`})
            </option>
          ))}
        </select>
        {isFebruary && (
          <button
            onClick={handleLeapToggle}
            className={`tb-leap-btn ${state.monthType === 29 ? 'is-active' : ''}`}
            title="Toggle Leap Year February (28 vs 29 days)"
          >
            {state.monthType === 29 ? '29d' : '28d'}
          </button>
        )}
      </div>

      <div className="tb-pill tb-ink-group" title="Pen Ink Color">
        {INK_PALETTES.map((p) => (
          <button
            key={p.name}
            onClick={() => setInkColor(p.color)}
            title={p.name}
            aria-label={p.name}
            className={`tb-ink-dot ${inkColor === p.color ? 'is-selected' : ''}`}
            style={{ backgroundColor: p.color }}
          />
        ))}
      </div>

      <button
        onClick={() => setFontStyle(fontStyle === 'handwriting' ? 'clean' : 'handwriting')}
        className="tb-btn"
        title="Toggle between handwritten ink and clean sans-serif typography"
      >
        <Type className="w-3.5 h-3.5 text-stone-500 shrink-0" />
        <span>{fontStyle === 'handwriting' ? 'Ink Font' : 'Sans Font'}</span>
      </button>

      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className={`tb-icon-btn ${soundEnabled ? 'is-sound-on' : ''}`}
        title={soundEnabled ? 'Mute Pen Tick Sound' : 'Enable Pen Tick Sound'}
        aria-label={soundEnabled ? 'Mute Pen Tick Sound' : 'Enable Pen Tick Sound'}
      >
        {soundEnabled ? (
          <Volume2 className="w-3.5 h-3.5" style={{ color: '#1D9589' }} />
        ) : (
          <VolumeX className="w-3.5 h-3.5 text-stone-400" />
        )}
      </button>
    </>
  );

  return (
    <>
      <header className="no-print tb-header">
        <div className="tb-accent-bar" />
        <div className="tb-main-row">
          {/* Brand */}
          <div className="tb-brand">
            <svg width="21" height="21" viewBox="0 0 24 24" className="shrink-0" aria-hidden="true">
              <path d="M12 2 A10 10 0 1 1 2 12" fill="none" stroke="#1D9589" strokeWidth="3.2" strokeLinecap="round" />
              <path d="M12 5.5 A6.5 6.5 0 1 1 5.5 12" fill="none" stroke="#D4C467" strokeWidth="3" strokeLinecap="round" />
              <rect x="4" y="4" width="6" height="2.6" rx="1" fill="#E06B5E" />
              <rect x="4" y="7.6" width="6" height="2.6" rx="1" fill="#64B76B" />
            </svg>
            <span className="font-serif italic font-bold tb-brand-title">
              Habit Tracker
            </span>
            <span className="tb-badge-a4">
              A4 · {completionPct}%
            </span>
          </div>

          {/* Desktop center controls (>= 1024px) */}
          <div className="tb-desktop-controls">
            {renderControlsCluster()}
          </div>

          {/* Right Actions */}
          <div className="tb-actions">
            <button onClick={onOpenStats} className="tb-btn tb-stats-btn" title="View Stats & Streaks">
              <BarChart2 className="w-3.5 h-3.5 shrink-0" style={{ color: '#1D9589' }} />
              <span className="tb-stats-label-full">Stats & Streaks</span>
              <span className="tb-stats-label-short">Stats</span>
            </button>

            <div className="tb-seg-group tb-desktop-export">
              <button
                onClick={handleExportPNG}
                className="tb-seg-btn"
                title="Download A4 Landscape 300 DPI PNG (3508 × 2480)"
              >
                <Download className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span>PNG</span>
              </button>
              <div className="tb-seg-divider" />
              <button
                onClick={handleExportSVG}
                className="tb-seg-btn"
                title="Download A4 Landscape Vector SVG (297mm × 210mm)"
              >
                <span>SVG</span>
              </button>
            </div>

            {/* Mobile-only Customize / Export Sheet button (< 768px) */}
            <button
              onClick={() => setIsMobileMenuOpen?.(true)}
              className="tb-btn tb-mobile-menu-btn"
              title="Customize & Export"
              aria-label="Customize & Export"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" style={{ color: '#1D9589' }} />
              <span>Menu</span>
            </button>

            <button
              onClick={handlePrint}
              className="tb-print-btn"
              title="Print or Save as PDF (A4 Landscape)"
            >
              <Printer className="w-3.5 h-3.5 shrink-0" />
              <span className="tb-print-label-full">Print / PDF</span>
              <span className="tb-print-label-short">PDF</span>
            </button>
          </div>
        </div>

        {/* Tablet scrollable strip (768px..1023px only) */}
        <div className="tb-tablet-strip">
          {renderControlsCluster()}
          <div className="tb-seg-group">
            <button onClick={handleExportPNG} className="tb-seg-btn">
              <Download className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              <span>PNG</span>
            </button>
            <div className="tb-seg-divider" />
            <button onClick={handleExportSVG} className="tb-seg-btn">
              <span>SVG</span>
            </button>
          </div>
        </div>

        {/* Mobile View Switcher (< 768px only) */}
        <div className="tb-mobile-viewbar">
          <div className="tb-view-switch">
            <button
              onClick={() => setMobileView?.('checkin')}
              className={`tb-view-tab ${mobileView === 'checkin' ? 'is-active' : ''}`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Daily Check-In</span>
            </button>
            <button
              onClick={() => setMobileView?.('sheet')}
              className={`tb-view-tab ${mobileView === 'sheet' ? 'is-active' : ''}`}
            >
              <CircleDot className="w-3.5 h-3.5" />
              <span>A4 Wheel</span>
            </button>
          </div>
          <span className="tb-mobile-pct">{completionPct}% done</span>
        </div>
      </header>

      {/* Mobile Customize & Export Bottom Sheet (< 768px) */}
      {isMobileMenuOpen && (
        <div
          className="no-print mob-sheet-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="mob-sheet-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mob-sheet-handle" />
            <div className="mob-sheet-header">
              <span className="font-serif italic mob-sheet-title">Customize & Export</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="stats-close-btn"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mob-sheet-body">
              {/* Month */}
              <div className="mob-sheet-row">
                <span className="mob-sheet-label">Month</span>
                <div className="flex items-center gap-2">
                  <select
                    value={matchedMonth ? matchedMonth.name : ''}
                    onChange={handleMonthChange}
                    className="mob-sheet-select"
                  >
                    {!matchedMonth && (
                      <option value="">
                        {state.month || 'Custom'} ({state.monthType}d)
                      </option>
                    )}
                    {MONTHS.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name} ({m.name === 'February' ? (state.monthType === 29 ? '29d' : '28d') : `${m.days}d`})
                      </option>
                    ))}
                  </select>
                  {isFebruary && (
                    <button
                      onClick={handleLeapToggle}
                      className={`tb-leap-btn ${state.monthType === 29 ? 'is-active' : ''}`}
                    >
                      {state.monthType === 29 ? 'Leap 29d' : '28d'}
                    </button>
                  )}
                </div>
              </div>

              {/* Pen Ink Color */}
              <div className="mob-sheet-row">
                <span className="mob-sheet-label">Ink Color</span>
                <div className="flex items-center gap-2">
                  {INK_PALETTES.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => setInkColor(p.color)}
                      aria-label={p.name}
                      className={`mob-ink-swatch ${inkColor === p.color ? 'is-selected' : ''}`}
                      style={{ backgroundColor: p.color }}
                    />
                  ))}
                </div>
              </div>

              {/* Typography & Sound */}
              <div className="mob-sheet-row">
                <span className="mob-sheet-label">Font & Sound</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFontStyle(fontStyle === 'handwriting' ? 'clean' : 'handwriting')}
                    className="tb-btn"
                  >
                    <Type className="w-3.5 h-3.5 text-stone-500" />
                    <span>{fontStyle === 'handwriting' ? 'Ink Font' : 'Sans Font'}</span>
                  </button>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`tb-icon-btn ${soundEnabled ? 'is-sound-on' : ''}`}
                    aria-label="Toggle sound"
                  >
                    {soundEnabled ? (
                      <Volume2 className="w-4 h-4" style={{ color: '#1D9589' }} />
                    ) : (
                      <VolumeX className="w-4 h-4 text-stone-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Presets */}
              <div className="mob-sheet-actions-grid">
                <button onClick={loadSample} className="mob-sheet-action-btn">
                  <Sparkles className="w-4 h-4" style={{ color: '#b48a14' }} />
                  <span>Load Sample</span>
                </button>
                <button onClick={clearSheet} className="mob-sheet-action-btn">
                  <Eraser className="w-4 h-4 text-stone-500" />
                  <span>Clear Sheet</span>
                </button>
              </div>

              {/* A4 Exports */}
              <div className="mob-sheet-export-grid">
                <button onClick={handleExportPNG} className="mob-sheet-action-btn">
                  <Download className="w-4 h-4 text-stone-600" />
                  <span>A4 PNG</span>
                </button>
                <button onClick={handleExportSVG} className="mob-sheet-action-btn">
                  <Download className="w-4 h-4 text-stone-600" />
                  <span>A4 SVG</span>
                </button>
                <button onClick={handlePrint} className="mob-sheet-print-btn">
                  <Printer className="w-4 h-4" />
                  <span>A4 PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
