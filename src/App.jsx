import React, { useState, useEffect, useRef } from 'react';
import HabitTrackerSheet, {
  SAMPLE_INITIAL_STATE,
} from './components/HabitTrackerSheet';
import Toolbar from './components/Toolbar';
import StatsDrawer from './components/StatsDrawer';
import { ZoomIn, ZoomOut, Maximize2, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'habit_tracker_a3_state_v1';
const PREFS_KEY = 'habit_tracker_a3_prefs_v1';

export default function App() {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.dailyHabits) && Array.isArray(parsed.weeklyHabits)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load from localStorage:', e);
    }
    return SAMPLE_INITIAL_STATE;
  });

  const [prefs, setPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem(PREFS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load prefs:', e);
    }
    return { inkColor: '#1d3557', fontStyle: 'handwriting', soundEnabled: true };
  });

  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showTip, setShowTip] = useState(true);

  const svgRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [state]);

  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch (e) {
      console.warn('Failed to save prefs:', e);
    }
  }, [prefs]);

  const setInkColor = (inkColor) => setPrefs((p) => ({ ...p, inkColor }));
  const setFontStyle = (fontStyle) => setPrefs((p) => ({ ...p, fontStyle }));
  const setSoundEnabled = (soundEnabled) => setPrefs((p) => ({ ...p, soundEnabled }));

  const handleZoom = (delta) => {
    setZoomLevel((prev) => Math.min(Math.max(prev + delta, 0.5), 1.6));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  return (
    <div className="min-h-screen bg-stone-200/80 flex flex-col font-clean">
      {/* Top Navigation & Controls */}
      <Toolbar
        state={state}
        setState={setState}
        inkColor={prefs.inkColor}
        setInkColor={setInkColor}
        fontStyle={prefs.fontStyle}
        setFontStyle={setFontStyle}
        soundEnabled={prefs.soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onOpenStats={() => setIsStatsOpen(true)}
        svgRef={svgRef}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col items-center justify-start p-3 sm:p-6 md:p-8 overflow-auto">
        {showTip && (
          <div className="no-print mb-4 w-full max-w-3xl bg-white/90 backdrop-blur border border-stone-300 rounded-xl px-4 py-2.5 shadow-xs flex items-center justify-between text-xs text-stone-700">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
              <span>
                <strong>Interactive A3 Sheet:</strong> Click any wheel cell or Weekly/Monthly box to toggle checkmarks. Click any colored bar, Month line, Weekly/Monthly line, or Notes line to type directly on the sheet.
              </span>
            </div>
            <button
              onClick={() => setShowTip(false)}
              className="text-stone-400 hover:text-stone-700 ml-2 font-bold cursor-pointer"
              aria-label="Dismiss tip"
            >
              ×
            </button>
          </div>
        )}

        {/* A3 Landscape Paper Sheet Wrapper */}
        <div
          className="sheet-viewport-wrapper transition-transform duration-200 origin-top flex justify-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <div className="paper-page bg-white text-stone-900 rounded-sm shadow-xl border border-stone-300/80 overflow-hidden relative">
            <HabitTrackerSheet
              state={state}
              setState={setState}
              inkColor={prefs.inkColor}
              fontStyle={prefs.fontStyle}
              soundEnabled={prefs.soundEnabled}
              svgRef={svgRef}
            />
          </div>
        </div>

        {/* Floating Zoom Controls (bottom right) */}
        <div className="no-print fixed bottom-5 right-5 flex items-center gap-1.5 bg-stone-900/90 text-stone-100 backdrop-blur px-3 py-1.5 rounded-full shadow-lg border border-stone-700 text-xs z-30">
          <button
            onClick={() => handleZoom(-0.15)}
            className="p-1 hover:text-teal-300 transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="px-2 py-0.5 hover:text-teal-300 font-mono text-[11px] transition-colors cursor-pointer"
            title="Reset Zoom to 100%"
          >
            {Math.round(zoomLevel * 100)}%
          </button>
          <button
            onClick={() => handleZoom(0.15)}
            className="p-1 hover:text-teal-300 transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-3.5 bg-stone-700 mx-0.5" />
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1 hover:text-teal-300 transition-colors cursor-pointer"
            title="Fit Page"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </main>

      {/* Side Stats Drawer */}
      <StatsDrawer
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        state={state}
      />
    </div>
  );
}
