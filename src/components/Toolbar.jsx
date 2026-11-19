import React from 'react';
import {
  Printer,
  Download,
  RotateCcw,
  Volume2,
  VolumeX,
  Type,
  FileCheck,
  BarChart2,
  Palette,
  Calendar,
} from 'lucide-react';
import { exportToPNG, exportToSVG } from '../utils/export';
import { PHOTO_INITIAL_STATE, BLANK_INITIAL_STATE } from './HabitTrackerSheet';

const INK_PALETTES = [
  { name: 'Photo Blue Ink', color: '#1d3557' },
  { name: 'Royal Violet', color: '#4338ca' },
  { name: 'Ballpoint Black', color: '#1c1917' },
  { name: 'Berry Magenta', color: '#9f1239' },
  { name: 'Forest Green', color: '#065f46' },
];

const MONTH_OPTIONS = [
  { name: 'January', days: 31 },
  { name: 'February (29 days)', days: 29 },
  { name: 'February (28 days)', days: 28 },
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
  const handleMonthChange = (e) => {
    const selected = MONTH_OPTIONS.find((m) => m.name === e.target.value);
    if (selected) {
      const monthCleanName = selected.name.split(' ')[0];
      setState({
        ...state,
        month: monthCleanName,
        monthType: selected.days,
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPNG = () => {
    if (svgRef.current) {
      exportToPNG(svgRef.current, `${state.month.toLowerCase()}-habit-tracker.png`, 2.5);
    }
  };

  const handleExportSVG = () => {
    if (svgRef.current) {
      exportToSVG(svgRef.current, `${state.month.toLowerCase()}-habit-tracker.svg`);
    }
  };

  const loadSample = () => {
    if (window.confirm('Reset tracker to the exact photo sample?')) {
      setState(PHOTO_INITIAL_STATE);
    }
  };

  const loadBlank = () => {
    if (window.confirm('Clear all habits and checkmarks for a fresh sheet?')) {
      setState(BLANK_INITIAL_STATE);
    }
  };

  return (
    <header className="no-print bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md sticky top-0 z-40 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Branding & Presets */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-400 animate-pulse"></span>
            <span className="font-serif tracking-wider font-bold text-base md:text-lg">
              HABIT TRACKER
            </span>
            <span className="text-xs bg-stone-800 text-stone-400 px-2 py-0.5 rounded-full border border-stone-700 hidden sm:inline-block">
              Exact Replica
            </span>
          </div>

          <div className="h-5 w-px bg-stone-700 hidden md:block"></div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={loadSample}
              className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors"
              title="Load the exact entries and checkmarks from the photo"
            >
              Photo Sample
            </button>
            <button
              onClick={loadBlank}
              className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors"
              title="Clear all habits for a blank printable sheet"
            >
              Blank Sheet
            </button>
          </div>
        </div>

        {/* Center: Controls (Month, Days, Ink, Font) */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Month & Days Picker */}
          <div className="flex items-center gap-1.5 bg-stone-800 px-2.5 py-1 rounded-md border border-stone-700">
            <Calendar className="w-3.5 h-3.5 text-rose-300" />
            <select
              value={
                MONTH_OPTIONS.find(
                  (m) =>
                    m.name.startsWith(state.month) && m.days === state.monthType
                )?.name || 'February (29 days)'
              }
              onChange={handleMonthChange}
              className="bg-transparent text-stone-200 outline-none cursor-pointer pr-1"
            >
              {MONTH_OPTIONS.map((m) => (
                <option key={m.name} value={m.name} className="bg-stone-800 text-white">
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Ink Color Selector */}
          <div className="flex items-center gap-1 bg-stone-800 px-2 py-1 rounded-md border border-stone-700">
            <Palette className="w-3.5 h-3.5 text-stone-400 mr-1" />
            {INK_PALETTES.map((p) => (
              <button
                key={p.name}
                onClick={() => setInkColor(p.color)}
                title={p.name}
                className={`w-4 h-4 rounded-full border transition-transform ${
                  inkColor === p.color ? 'scale-125 border-white ring-1 ring-rose-400' : 'border-stone-600 opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: p.color }}
              />
            ))}
          </div>

          {/* Font Toggle */}
          <button
            onClick={() => setFontStyle(fontStyle === 'handwriting' ? 'clean' : 'handwriting')}
            className="flex items-center gap-1 px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-md border border-stone-700 transition-colors"
            title="Toggle between handwritten ink and clean print typography"
          >
            <Type className="w-3.5 h-3.5 text-stone-400" />
            <span>{fontStyle === 'handwriting' ? 'Ink Font' : 'Print Font'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-md border border-stone-700 transition-colors"
            title={soundEnabled ? 'Mute Pen Tick Sound' : 'Enable Pen Tick Sound'}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-rose-300" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-stone-500" />
            )}
          </button>
        </div>

        {/* Right: Actions (Stats, Print, Export) */}
        <div className="flex items-center gap-2">
          {/* Stats Button */}
          <button
            onClick={onOpenStats}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-md border border-stone-700 text-xs font-medium transition-colors"
          >
            <BarChart2 className="w-3.5 h-3.5 text-rose-300" />
            <span className="hidden sm:inline">Stats & Streaks</span>
          </button>

          {/* Export Dropdown / Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleExportPNG}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-md border border-stone-700 text-xs transition-colors"
              title="Download high-resolution 300DPI PNG"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PNG</span>
            </button>
            <button
              onClick={handleExportSVG}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-md border border-stone-700 text-xs transition-colors"
              title="Download Scalable Vector Graphics (SVG)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>SVG</span>
            </button>
          </div>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-md font-medium text-xs shadow-sm transition-all hover:shadow"
            title="Print or Save as PDF (Formatted for A4/Letter)"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
}
