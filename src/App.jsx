import React, { useState, useEffect, useRef } from 'react';
import HabitTrackerSheet, {
  SAMPLE_INITIAL_STATE,
} from './components/HabitTrackerSheet';
import Toolbar from './components/Toolbar';
import StatsDrawer from './components/StatsDrawer';
import { ZoomIn, ZoomOut, Maximize2, CheckCircle2, RotateCcw } from 'lucide-react';

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
  const [hoveredCell, setHoveredCell] = useState(null);
  const [toast, setToast] = useState(null);

  const svgRef = useRef(null);
  const toastTimerRef = useRef(null);

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

  const showToast = (payload) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(payload);
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const setInkColor = (inkColor) => setPrefs((p) => ({ ...p, inkColor }));
  const setFontStyle = (fontStyle) => setPrefs((p) => ({ ...p, fontStyle }));
  const setSoundEnabled = (soundEnabled) => setPrefs((p) => ({ ...p, soundEnabled }));

  const handleZoom = (delta) => {
    setZoomLevel((prev) => Math.min(Math.max(Number((prev + delta).toFixed(2)), 0.6), 2.2));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  return (
    <div className="app-shell">
      {/* Top Studio Navigation & Controls */}
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
        onNotify={showToast}
        svgRef={svgRef}
      />

      {/* Main Desk Workspace */}
      <main className="app-main">
        {/* Paper Sheet Wrapper */}
        <div className="sheet-viewport-wrapper">
          <div
            className="paper-page"
            style={{
              width: `calc(min(1160px, 95vw) * ${zoomLevel})`,
            }}
          >
            <HabitTrackerSheet
              state={state}
              setState={setState}
              inkColor={prefs.inkColor}
              fontStyle={prefs.fontStyle}
              soundEnabled={prefs.soundEnabled}
              svgRef={svgRef}
              onCellHover={setHoveredCell}
            />
          </div>
        </div>

        {/* Bottom-Left Live Cell Readout / Subtle Hint (Desktop) */}
        <div className="no-print floating-status-pill">
          {hoveredCell ? (
            <>
              <span
                className="status-dot"
                style={{ backgroundColor: hoveredCell.color }}
              />
              <span className="status-text">
                <strong>Day {hoveredCell.day}</strong> · {hoveredCell.habitName}
                {hoveredCell.checked ? ' ✓' : ''}
              </span>
            </>
          ) : (
            <span className="status-text-muted">
              Click any wheel cell or line to edit · Auto-saved locally
            </span>
          )}
        </div>

        {/* Bottom-Right Frosted Zoom Dock */}
        <div className="no-print floating-zoom-dock">
          <button
            onClick={() => handleZoom(-0.2)}
            className="zoom-btn"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="zoom-readout"
            title="Reset Zoom to 100%"
          >
            {Math.round(zoomLevel * 100)}%
          </button>
          <button
            onClick={() => handleZoom(0.2)}
            className="zoom-btn"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="zoom-divider" />
          <button
            onClick={handleResetZoom}
            className="zoom-btn"
            title="Fit Page"
            aria-label="Fit Page"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </main>

      {/* Subtle Toast Feedback (with Undo) */}
      {toast && (
        <div className="no-print toast-pill" role="status">
          <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#1D9589' }} />
          <span>{toast.text}</span>
          {toast.undo && (
            <button
              onClick={() => {
                toast.undo();
                setToast(null);
              }}
              className="toast-undo-btn"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Undo</span>
            </button>
          )}
        </div>
      )}

      {/* Side Stats Drawer */}
      <StatsDrawer
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        state={state}
      />
    </div>
  );
}
