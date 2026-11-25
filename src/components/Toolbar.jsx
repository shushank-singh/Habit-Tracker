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
      exportToPNG(svgRef.current, `${fileSlug}-a3-habit-tracker.png`, 3);
    }
  };

  const handleExportSVG = () => {
    if (svgRef.current) {
      exportToSVG(svgRef.current, `${fileSlug}-a3-habit-tracker.svg`);
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

  return (
    <header className="no-print bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md sticky top-0 z-40 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Branding & Sample/Clear Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-teal-600 animate-pulse" />
            <span className="font-serif italic tracking-wide font-bold text-base md:text-lg">
              Habit Tracker
            </span>
            <span className="text-xs bg-stone-800 text-stone-400 px-2 py-0.5 rounded-full border border-stone-700 hidden sm:inline-block">
              A3 Landscape
            </span>
          </div>

          <div className="h-5 w-px bg-stone-700 hidden md:block" />

          {/* Sample Data / Clear Sheet Toggle Buttons */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={loadSample}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors cursor-pointer"
              title="Load sample habits and checkmarks"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Sample Data</span>
            </button>
            <button
              onClick={clearSheet}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors cursor-pointer"
              title="Clear all habits, checkmarks, and notes"
            >
              <Eraser className="w-3 h-3 text-stone-400" />
              <span>Clear Sheet</span>
            </button>
          </div>
        </div>

        {/* Center: Controls (Month + Leap Year, Ink Color, Font, Sound) */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Month Selector Dropdown + Leap-Year Toggle */}
          <div className="flex items-center gap-1.5 bg-stone-800 px-2.5 py-1 rounded-md border border-stone-700">
            <Calendar className="w-3.5 h-3.5 text-teal-400" />
            <select
              value={matchedMonth ? matchedMonth.name : ''}
              onChange={handleMonthChange}
              aria-label="Select Month"
              className="bg-transparent text-stone-200 outline-none cursor-pointer pr-1"
            >
              {!matchedMonth && (
                <option value="" className="bg-stone-800 text-white">
                  {state.month || 'Custom'} ({state.monthType}d)
                </option>
              )}
              {MONTHS.map((m) => (
                <option key={m.name} value={m.name} className="bg-stone-800 text-white">
                  {m.name} ({m.name === 'February' ? state.monthType === 29 ? '29d' : '28d' : `${m.days}d`})
                </option>
              ))}
            </select>
            {isFebruary && (
              <button
                onClick={handleLeapToggle}
                className={`px-1.5 py-0.5 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
                  state.monthType === 29
                    ? 'bg-teal-700 text-white border-teal-700'
                    : 'bg-stone-700 text-stone-300 border-stone-600'
                }`}
                title="Toggle Leap Year February (28 vs 29 days)"
              >
                {state.monthType === 29 ? 'Leap 29d' : '28d'}
              </button>
            )}
          </div>

          {/* Ink Color Picker */}
          <div className="flex items-center gap-1 bg-stone-800 px-2 py-1 rounded-md border border-stone-700">
            <Palette className="w-3.5 h-3.5 text-stone-400 mr-1" />
            {INK_PALETTES.map((p) => (
              <button
                key={p.name}
                onClick={() => setInkColor(p.color)}
                title={p.name}
                aria-label={p.name}
                className={`w-4 h-4 rounded-full border transition-transform cursor-pointer ${
                  inkColor === p.color
                    ? 'scale-125 border-white'
                    : 'border-stone-600 opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: p.color }}
              />
            ))}
          </div>

          {/* Font Toggle */}
          <button
            onClick={() => setFontStyle(fontStyle === 'handwriting' ? 'clean' : 'handwriting')}
            className="flex items-center gap-1 px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-md border border-stone-700 transition-colors cursor-pointer"
            title="Toggle between handwritten ink and clean sans-serif typography"
          >
            <Type className="w-3.5 h-3.5 text-stone-400" />
            <span>{fontStyle === 'handwriting' ? 'Ink Font' : 'Sans Font'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-md border border-stone-700 transition-colors cursor-pointer"
            title={soundEnabled ? 'Mute Pen Tick Sound' : 'Enable Pen Tick Sound'}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-teal-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-stone-500" />
            )}
          </button>
        </div>

        {/* Right: Stats, PNG, SVG, Print/PDF */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenStats}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-md border border-stone-700 text-xs font-medium transition-colors cursor-pointer"
          >
            <BarChart2 className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Stats & Streaks</span>
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={handleExportPNG}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-md border border-stone-700 text-xs transition-colors cursor-pointer"
              title="Download high-resolution A3 PNG"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PNG</span>
            </button>
            <button
              onClick={handleExportSVG}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-md border border-stone-700 text-xs transition-colors cursor-pointer"
              title="Download Scalable Vector Graphics (SVG)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>SVG</span>
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-md font-medium text-xs shadow-sm transition-all cursor-pointer"
            title="Print or Save as PDF (A3 Landscape)"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
}
