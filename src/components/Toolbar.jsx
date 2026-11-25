import React from 'react';
import {
  Printer,
  Download,
  Volume2,
  VolumeX,
  Type,
  BarChart2,
  Palette,
  Calendar,
  Sparkles,
  Eraser,
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
  svgRef,
}) {
  const matchedMonth = MONTHS.find(
    (m) => m.name.toLowerCase() === (state.month || '').trim().toLowerCase()
  );
  const isFebruary = matchedMonth?.name === 'February';

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
    window.print();
  };

  const fileSlug = (state.month || 'habit-tracker').trim().toLowerCase().replace(/\s+/g, '-');

  const handleExportPNG = () => {
    if (svgRef.current) {
      exportToPNG(svgRef.current, `${fileSlug}-a4-habit-tracker.png`);
    }
  };

  const handleExportSVG = () => {
    if (svgRef.current) {
      exportToSVG(svgRef.current, `${fileSlug}-a4-habit-tracker.svg`);
    }
  };

  const loadSample = () => {
    setState(SAMPLE_INITIAL_STATE);
  };

  const clearSheet = () => {
    setState({
      ...BLANK_INITIAL_STATE,
      month: state.month,
      monthType: state.monthType,
    });
  };

  const renderControlsCluster = () => (
    <>
      {/* Sample / Clear */}
      <div className="tb-seg-group">
        <button
          onClick={loadSample}
          className="tb-seg-btn"
          title="Load sample habits and checkmarks"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Sample</span>
        </button>
        <div className="tb-seg-divider" />
        <button
          onClick={clearSheet}
          className="tb-seg-btn"
          title="Clear all habits, checkmarks, and notes"
        >
          <Eraser className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span>Clear</span>
        </button>
      </div>

      {/* Month & Leap Toggle */}
      <div className="tb-pill">
        <Calendar className="w-3.5 h-3.5 text-teal-400 shrink-0" />
        <select
          value={matchedMonth ? matchedMonth.name : ''}
          onChange={handleMonthChange}
          aria-label="Select Month"
          className="tb-select"
        >
          {!matchedMonth && (
            <option value="" className="bg-stone-800 text-white">
              {state.month || 'Custom'} ({state.monthType}d)
            </option>
          )}
          {MONTHS.map((m) => (
            <option key={m.name} value={m.name} className="bg-stone-800 text-white">
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

      {/* Ink Color Picker */}
      <div className="tb-pill tb-ink-group">
        <Palette className="w-3.5 h-3.5 text-stone-400 shrink-0" />
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

      {/* Font Toggle */}
      <button
        onClick={() => setFontStyle(fontStyle === 'handwriting' ? 'clean' : 'handwriting')}
        className="tb-btn"
        title="Toggle between handwritten ink and clean sans-serif typography"
      >
        <Type className="w-3.5 h-3.5 text-stone-400 shrink-0" />
        <span>{fontStyle === 'handwriting' ? 'Ink Font' : 'Sans Font'}</span>
      </button>

      {/* Sound Toggle */}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="tb-icon-btn"
        title={soundEnabled ? 'Mute Pen Tick Sound' : 'Enable Pen Tick Sound'}
        aria-label={soundEnabled ? 'Mute Pen Tick Sound' : 'Enable Pen Tick Sound'}
      >
        {soundEnabled ? (
          <Volume2 className="w-3.5 h-3.5 text-teal-400" />
        ) : (
          <VolumeX className="w-3.5 h-3.5 text-stone-500" />
        )}
      </button>
    </>
  );

  return (
    <header className="no-print tb-header">
      {/* Row 1: Always clean & uncrowded on both Mobile & Desktop */}
      <div className="tb-main-row">
        {/* Brand */}
        <div className="tb-brand">
          <span className="tb-brand-dot animate-pulse" />
          <span className="font-serif italic font-bold tb-brand-title">
            Habit Tracker
          </span>
          <span className="tb-badge-a3">A4</span>
        </div>

        {/* Desktop-only center controls (single-row layout >= 1024px) */}
        <div className="tb-desktop-controls">
          {renderControlsCluster()}
        </div>

        {/* Right Actions */}
        <div className="tb-actions">
          <button onClick={onOpenStats} className="tb-btn" title="View Stats & Streaks">
            <BarChart2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span className="tb-stats-label-full">Stats & Streaks</span>
            <span className="tb-stats-label-short">Stats</span>
          </button>

          <div className="tb-seg-group tb-desktop-export">
            <button
              onClick={handleExportPNG}
              className="tb-seg-btn"
              title="Download A4 Landscape 300 DPI PNG (3508 × 2480)"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
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

      {/* Row 2: Mobile/Tablet scrollable control strip (< 1024px) */}
      <div className="tb-mobile-strip">
        {renderControlsCluster()}
        <div className="tb-seg-group">
          <button
            onClick={handleExportPNG}
            className="tb-seg-btn"
            title="Download A4 Landscape 300 DPI PNG (3508 × 2480)"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
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
      </div>
    </header>
  );
}
