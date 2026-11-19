import React, { useState, useEffect, useRef } from 'react';
import HabitTrackerSheet, {
  PHOTO_INITIAL_STATE,
} from './components/HabitTrackerSheet';
import Toolbar from './components/Toolbar';
import StatsDrawer from './components/StatsDrawer';
import { ZoomIn, ZoomOut, Maximize2, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'circular_habit_tracker_state_v1';

export default function App() {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load from localStorage:', e);
    }
    return PHOTO_INITIAL_STATE;
  });

  const [inkColor, setInkColor] = useState('#1d3557');
  const [fontStyle, setFontStyle] = useState('handwriting');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showTip, setShowTip] = useState(true);

  const svgRef = useRef(null);

  // Auto-save state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [state]);

  const handleZoom = (delta) => {
    setZoomLevel((prev) => Math.min(Math.max(prev + delta, 0.6), 1.8));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  return (
    <div className="min-h-screen bg-stone-200/80 flex flex-col font-sans selection:bg-rose-200">
      {/* Top Navigation & Controls */}
      <Toolbar
        state={state}
        setState={setState}
        inkColor={inkColor}
        setInkColor={setInkColor}
        fontStyle={fontStyle}
        setFontStyle={setFontStyle}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onOpenStats={() => setIsStatsOpen(true)}
        svgRef={svgRef}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col items-center justify-start p-3 sm:p-6 md:p-8 overflow-auto">
        {/* Quick Instructions banner */}
        {showTip && (
          <div className="no-print mb-4 w-full max-w-2xl bg-white/90 backdrop-blur border border-stone-300 rounded-xl px-4 py-2.5 shadow-xs flex items-center justify-between text-xs text-stone-700">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-500 shrink-0" />
              <span>
                <strong>Interactive Canvas:</strong> Click any cell on the wheel to toggle checkmarks. Click any habit name or note line to edit directly in-place!
              </span>
            </div>
            <button
              onClick={() => setShowTip(false)}
              className="text-stone-400 hover:text-stone-700 ml-2 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Paper Sheet Wrapper with Desk Shadow */}
        <div
          className="sheet-viewport-wrapper transition-transform duration-200 origin-top flex justify-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <div className="paper-page bg-[#faf9f6] text-stone-900 rounded-sm shadow-xl border border-stone-300/80 overflow-hidden relative">
            <HabitTrackerSheet
              state={state}
              setState={setState}
              inkColor={inkColor}
              fontStyle={fontStyle}
              soundEnabled={soundEnabled}
              svgRef={svgRef}
            />
          </div>
        </div>

        {/* Floating Zoom & Helper Controls (bottom right) */}
        <div className="no-print fixed bottom-5 right-5 flex items-center gap-1.5 bg-stone-900/90 text-stone-100 backdrop-blur px-3 py-1.5 rounded-full shadow-lg border border-stone-700 text-xs z-30">
          <button
            onClick={() => handleZoom(-0.15)}
            className="p-1 hover:text-rose-400 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="px-2 py-0.5 hover:text-rose-400 font-mono text-[11px] transition-colors"
            title="Reset Zoom to 100%"
          >
            {Math.round(zoomLevel * 100)}%
          </button>
          <button
            onClick={() => handleZoom(0.15)}
            className="p-1 hover:text-rose-400 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-3.5 bg-stone-700 mx-0.5" />
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1 hover:text-rose-400 transition-colors"
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
