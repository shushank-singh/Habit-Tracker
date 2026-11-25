import React, { useState, useEffect, useRef } from 'react';
import { playPenTickSound, playCelebrationSound } from '../utils/audio';
import confetti from 'canvas-confetti';

// Saturated number square colors (1–10) matching Habit_Tracker_A3.pdf
export const NUMBER_BOX_COLORS = [
  '#E06B5E', // 1: Coral Red
  '#EA963E', // 2: Orange
  '#F0C944', // 3: Yellow
  '#97C248', // 4: Lime Green
  '#64B76B', // 5: Emerald / Mint Green
  '#44B1A7', // 6: Teal / Cyan
  '#55A2D7', // 7: Sky Blue
  '#6F86D2', // 8: Periwinkle / Blue
  '#9B76C7', // 9: Lavender / Purple
  '#D472A8', // 10: Pink / Magenta
];

// Pastel bar & wheel track colors (1–10) matching Habit_Tracker_A3.pdf
export const TRACK_COLORS = [
  '#F3B6B0', // 1: Soft Coral / Salmon
  '#F9D1A4', // 2: Soft Apricot / Peach
  '#FCE9A7', // 3: Soft Butter Yellow
  '#D4E8AC', // 4: Soft Lime Pistachio
  '#BCE3BE', // 5: Soft Mint Green
  '#B0E0DA', // 6: Soft Aqua Teal
  '#B6DAF1', // 7: Soft Sky Blue
  '#C2CDF0', // 8: Soft Periwinkle
  '#D8C5ED', // 9: Soft Lavender
  '#F0C1DC', // 10: Soft Rose Pink
];

// Theme banner & outer wheel colors from Habit_Tracker_A3.pdf
export const THEME_COLORS = {
  goldBanner: '#D4C467',
  tealBanner: '#1D9589',
  wheelRing: '#C6C461',
  inkDefault: '#242424',
  gridStroke: '#222222',
};

// Sample initial data (31-day month so the default wheel shows 1..31 like Habit_Tracker_A3.pdf)
export const SAMPLE_INITIAL_STATE = {
  month: 'March',
  monthType: 31,
  dailyHabits: [
    { id: 1, num: '1', name: 'Morning Stretch / Pilates' },
    { id: 2, num: '2', name: 'Drink 2L Water' },
    { id: 3, num: '3', name: 'Take Vitamins & Probiotics' },
    { id: 4, num: '4', name: 'Read 20 Pages' },
    { id: 5, num: '5', name: '10,000 Steps Walk' },
    { id: 6, num: '6', name: 'Mindful Journaling' },
    { id: 7, num: '7', name: 'No Sugar After Dinner' },
    { id: 8, num: '8', name: 'Deep Focus Session (90m)' },
    { id: 9, num: '9', name: 'Skincare Routine' },
    { id: 10, num: '10', name: 'Sleep Before 11 PM' },
  ],
  weeklyHabits: [
    { id: 1, name: 'Meal prep for the week', weeks: [true, true, false, false, false] },
    { id: 2, name: 'Call family & catch up', weeks: [true, false, false, false, false] },
    { id: 3, name: 'Clean & reset workspace', weeks: [true, true, false, false, false] },
    { id: 4, name: 'Long outdoor run / hike', weeks: [true, false, false, false, false] },
    { id: 5, name: 'Review weekly budget', weeks: [false, true, false, false, false] },
    { id: 6, name: '', weeks: [false, false, false, false, false] },
    { id: 7, name: '', weeks: [false, false, false, false, false] },
    { id: 8, name: '', weeks: [false, false, false, false, false] },
    { id: 9, name: '', weeks: [false, false, false, false, false] },
    { id: 10, name: '', weeks: [false, false, false, false, false] },
  ],
  monthlyHabits: [
    { id: 1, name: 'Finish 2 books this month', status: '✓' },
    { id: 2, name: 'Full digital declutter day', status: '' },
    { id: 3, name: 'Plan next month goals', status: '' },
    { id: 4, name: '', status: '' },
  ],
  checks: {
    '0-1': true, '1-1': true, '2-1': true, '3-1': true, '4-1': true, '5-1': true, '7-1': true, '8-1': true, '9-1': true,
    '0-2': true, '1-2': true, '2-2': true, '3-2': true, '5-2': true, '6-2': true, '7-2': true, '8-2': true,
    '0-3': true, '1-3': true, '2-3': true, '4-3': true, '5-3': true, '6-3': true, '8-3': true, '9-3': true,
    '0-4': true, '1-4': true, '2-4': true, '3-4': true, '4-4': true, '6-4': true, '7-4': true, '8-4': true, '9-4': true,
    '0-5': true, '1-5': true, '2-5': true, '3-5': true, '4-5': true, '5-5': true, '7-5': true, '8-5': true,
    '0-6': true, '1-6': true, '2-6': true, '4-6': true, '5-6': true, '6-6': true, '8-6': true, '9-6': true,
    '0-7': true, '1-7': true, '2-7': true, '3-7': true, '5-7': true, '7-7': true, '8-7': true,
    '0-8': true, '1-8': true, '2-8': true, '3-8': true, '4-8': true,
  },
  notes: [
    '',
    'Focus on consistency over perfection.',
    'Keep water bottle on desk all morning.',
    'Sunday evening reset makes Monday effortless.',
    '',
    '',
  ],
};

export const BLANK_INITIAL_STATE = {
  month: '',
  monthType: 31,
  dailyHabits: Array.from({ length: 10 }, (_, idx) => ({
    id: idx + 1,
    num: `${idx + 1}`,
    name: '',
  })),
  weeklyHabits: Array.from({ length: 10 }, (_, idx) => ({
    id: idx + 1,
    name: '',
    weeks: [false, false, false, false, false],
  })),
  monthlyHabits: Array.from({ length: 4 }, (_, idx) => ({
    id: idx + 1,
    name: '',
    status: '',
  })),
  checks: {},
  notes: ['', '', '', '', '', ''],
};

// A3 Landscape SVG coordinate space (420mm x 297mm @ 3px/mm = 1260 x 891)
const SHEET_W = 1260;
const SHEET_H = 891;

// Wheel geometry
const CX = 388;
const CY = 487;
const R_IN = 104;
const TRACK_H = 22;
const NUM_TRACKS = 10;
const R_OUT = R_IN + NUM_TRACKS * TRACK_H; // 324
const RING_H = 22;
const R_HEADER = R_OUT + RING_H; // 346

// Left daily bars geometry
const BAR_X = 39;
const NUM_BOX_W = 25;
const BAR_TEXT_X = BAR_X + NUM_BOX_W; // 64
const BAR_TEXT_W = CX - BAR_TEXT_X; // 324

// Right side geometry
const RIGHT_EDGE = 1214;
const BASE_LEFT_X = 820;
const COL_W = 39.6;
const WEEKLY_GRID_X = RIGHT_EDGE - 5 * COL_W; // 1016
const WEEKLY_TOP_Y = 204.2;
const ROW_H = 24.2;
const WEEKLY_LINE_STARTS = [
  640, // Line 0 (under "Weekly" heading / header bottom)
  680, // Line 1
  716, // Line 2
  748, // Line 3
  776, // Line 4
  820, // Line 5
  820, // Line 6
  820, // Line 7
  820, // Line 8
  820, // Line 9
  820, // Line 10
];

const MONTHLY_TOP_Y = 515;
const MONTHLY_COL_X = RIGHT_EDGE - COL_W; // 1174.4

const NOTES_TOP_Y = 685;
const NOTES_LINE_STARTS = [820, 792, 762, 728, 686, 636];

const DISPLAY_SERIF_FONT =
  "'Lucida Calligraphy', 'Apple Chancery', 'Cormorant Garamond', 'Playfair Display', Georgia, serif";

export default function HabitTrackerSheet({
  state,
  setState,
  inkColor = '#1d3557',
  fontStyle = 'handwriting',
  soundEnabled = true,
  svgRef,
}) {
  const [activeEdit, setActiveEdit] = useState(null); // { kind, index }
  const inputRef = useRef(null);

  const TOTAL_DAYS = state.monthType || 31;
  const DEG_PER_DAY = 270 / TOTAL_DAYS;

  useEffect(() => {
    if (activeEdit && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [activeEdit]);

  function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  }

  function describeSector(x, y, innerR, outerR, startAngle, endAngle) {
    const startOuter = polarToCartesian(x, y, outerR, startAngle);
    const endOuter = polarToCartesian(x, y, outerR, endAngle);
    const startInner = polarToCartesian(x, y, innerR, startAngle);
    const endInner = polarToCartesian(x, y, innerR, endAngle);

    const arcSweep = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      `M ${startOuter.x} ${startOuter.y}`,
      `A ${outerR} ${outerR} 0 ${arcSweep} 1 ${endOuter.x} ${endOuter.y}`,
      `L ${endInner.x} ${endInner.y}`,
      `A ${innerR} ${innerR} 0 ${arcSweep} 0 ${startInner.x} ${startInner.y}`,
      'Z',
    ].join(' ');
  }

  const handleWheelCellClick = (habitIdx, day) => {
    const key = `${habitIdx}-${day}`;
    const nextChecks = { ...state.checks, [key]: !state.checks[key] };
    setState({ ...state, checks: nextChecks });
    playPenTickSound(soundEnabled);

    const activeHabitIndices = state.dailyHabits
      .map((h, i) => (h.name.trim() ? i : null))
      .filter((i) => i !== null);

    if (activeHabitIndices.length > 0 && !state.checks[key]) {
      const allDone = activeHabitIndices.every((i) =>
        i === habitIdx ? true : nextChecks[`${i}-${day}`]
      );
      if (allDone) {
        playCelebrationSound(soundEnabled);
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#E06B5E', '#F0C944', '#64B76B', '#55A2D7', '#D472A8'],
        });
      }
    }
  };

  const handleWeeklyCheckToggle = (habitIdx, weekIdx) => {
    const updated = [...state.weeklyHabits];
    const current = updated[habitIdx] || { id: habitIdx + 1, name: '', weeks: [false, false, false, false, false] };
    const weeks = [...(current.weeks || [false, false, false, false, false])];
    weeks[weekIdx] = !weeks[weekIdx];
    updated[habitIdx] = { ...current, weeks };
    setState({ ...state, weeklyHabits: updated });
    playPenTickSound(soundEnabled);
  };

  const handleMonthlyStatusToggle = (habitIdx) => {
    const updated = [...state.monthlyHabits];
    const current = updated[habitIdx] || { id: habitIdx + 1, name: '', status: '' };
    const nextStatus = current.status ? '' : '✓';
    updated[habitIdx] = { ...current, status: nextStatus };
    setState({ ...state, monthlyHabits: updated });
    playPenTickSound(soundEnabled);
  };

  // Helper for computing active overlay input geometry & value
  const getActiveInputSpec = () => {
    if (!activeEdit) return null;
    const { kind, index } = activeEdit;
    const isHand = fontStyle === 'handwriting';

    if (kind === 'month') {
      return {
        x: 1005,
        y: 52,
        w: 240,
        h: 38,
        value: state.month || '',
        fontSizePx: isHand ? 32 : 22,
        fontWeight: isHand ? 700 : 600,
        placeholder: 'Month name...',
        onChange: (val) => setState({ ...state, month: val }),
        onNext: () => setActiveEdit({ kind: 'daily', index: 0 }),
      };
    }

    if (kind === 'daily') {
      const yStart = CY - R_OUT + index * TRACK_H;
      return {
        x: BAR_TEXT_X + 6,
        y: yStart + 1,
        w: BAR_TEXT_W - 12,
        h: TRACK_H - 2,
        value: state.dailyHabits[index]?.name || '',
        fontSizePx: isHand ? 20 : 13,
        fontWeight: isHand ? 600 : 500,
        placeholder: `Habit ${index + 1}...`,
        onChange: (val) => {
          const updated = [...state.dailyHabits];
          updated[index] = { ...updated[index], name: val };
          setState({ ...state, dailyHabits: updated });
        },
        onNext: () =>
          index < 9
            ? setActiveEdit({ kind: 'daily', index: index + 1 })
            : setActiveEdit({ kind: 'weekly', index: 0 }),
      };
    }

    if (kind === 'weekly') {
      const yBottom = WEEKLY_TOP_Y + (index + 1) * ROW_H;
      const lineX = WEEKLY_LINE_STARTS[index + 1];
      return {
        x: lineX + 4,
        y: yBottom - ROW_H + 2,
        w: WEEKLY_GRID_X - lineX - 10,
        h: ROW_H - 3,
        value: state.weeklyHabits[index]?.name || '',
        fontSizePx: isHand ? 20 : 13,
        fontWeight: isHand ? 600 : 500,
        placeholder: `Weekly goal ${index + 1}...`,
        onChange: (val) => {
          const updated = [...state.weeklyHabits];
          updated[index] = { ...updated[index], name: val };
          setState({ ...state, weeklyHabits: updated });
        },
        onNext: () =>
          index < 9
            ? setActiveEdit({ kind: 'weekly', index: index + 1 })
            : setActiveEdit({ kind: 'monthly', index: 0 }),
      };
    }

    if (kind === 'monthly') {
      const yTop = MONTHLY_TOP_Y + index * ROW_H;
      return {
        x: BASE_LEFT_X + 4,
        y: yTop + 2,
        w: MONTHLY_COL_X - BASE_LEFT_X - 10,
        h: ROW_H - 3,
        value: state.monthlyHabits[index]?.name || '',
        fontSizePx: isHand ? 20 : 13,
        fontWeight: isHand ? 600 : 500,
        placeholder: `Monthly goal ${index + 1}...`,
        onChange: (val) => {
          const updated = [...state.monthlyHabits];
          updated[index] = { ...updated[index], name: val };
          setState({ ...state, monthlyHabits: updated });
        },
        onNext: () =>
          index < 3
            ? setActiveEdit({ kind: 'monthly', index: index + 1 })
            : setActiveEdit({ kind: 'note', index: 1 }),
      };
    }

    if (kind === 'note') {
      const lineY = NOTES_TOP_Y + index * ROW_H;
      const startX = index === 0 ? 975 : NOTES_LINE_STARTS[index];
      return {
        x: startX + 4,
        y: lineY - ROW_H + 2,
        w: RIGHT_EDGE - startX - 8,
        h: ROW_H - 3,
        value: state.notes?.[index] || '',
        fontSizePx: isHand ? 20 : 13,
        fontWeight: isHand ? 600 : 500,
        placeholder: 'Write note...',
        onChange: (val) => {
          const notes = [...(state.notes || ['', '', '', '', '', ''])];
          notes[index] = val;
          setState({ ...state, notes });
        },
        onNext: () =>
          index < 5
            ? setActiveEdit({ kind: 'note', index: index + 1 })
            : setActiveEdit(null),
      };
    }

    return null;
  };

  const activeInput = getActiveInputSpec();
  const penFontFamily =
    fontStyle === 'handwriting' ? "'Caveat', cursive" : "'Inter', sans-serif";

  // 9 o'clock end point of inner circle
  const endAngleWheel = -90 + TOTAL_DAYS * DEG_PER_DAY;
  const innerEndPt = polarToCartesian(CX, CY, R_IN, endAngleWheel);
  const outerEndPt = polarToCartesian(CX, CY, R_HEADER, endAngleWheel);

  return (
    <div
      className="sheet-container relative select-none w-full h-full"
      style={{ containerType: 'inline-size' }}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SHEET_W} ${SHEET_H}`}
        className="w-full h-full habit-sheet-svg"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          fontFamily: "'Inter', sans-serif",
          shapeRendering: 'geometricPrecision',
          textRendering: 'geometricPrecision',
        }}
      >
        <defs>
          {/* Clip paths for clean text bounds inside bars/rows (for SVG/PNG export) */}
          <clipPath id="clip-month-line">
            <rect x="1002" y="40" width="248" height="52" />
          </clipPath>
          {Array.from({ length: 10 }, (_, i) => {
            const yStart = CY - R_OUT + i * TRACK_H;
            return (
              <clipPath key={`clip-daily-${i}`} id={`clip-daily-${i}`}>
                <rect x={BAR_TEXT_X + 4} y={yStart} width={BAR_TEXT_W - 10} height={TRACK_H} />
              </clipPath>
            );
          })}
          {Array.from({ length: 10 }, (_, i) => {
            const yTop = WEEKLY_TOP_Y + i * ROW_H;
            const lineX = WEEKLY_LINE_STARTS[i + 1];
            return (
              <clipPath key={`clip-weekly-${i}`} id={`clip-weekly-${i}`}>
                <rect x={lineX + 2} y={yTop} width={WEEKLY_GRID_X - lineX - 6} height={ROW_H} />
              </clipPath>
            );
          })}
          {Array.from({ length: 4 }, (_, i) => {
            const yTop = MONTHLY_TOP_Y + i * ROW_H;
            return (
              <clipPath key={`clip-monthly-${i}`} id={`clip-monthly-${i}`}>
                <rect x={BASE_LEFT_X + 2} y={yTop} width={MONTHLY_COL_X - BASE_LEFT_X - 6} height={ROW_H} />
              </clipPath>
            );
          })}
          {Array.from({ length: 6 }, (_, i) => {
            const lineY = NOTES_TOP_Y + i * ROW_H;
            const startX = i === 0 ? 975 : NOTES_LINE_STARTS[i];
            return (
              <clipPath key={`clip-note-${i}`} id={`clip-note-${i}`}>
                <rect x={startX + 2} y={lineY - ROW_H} width={RIGHT_EDGE - startX - 6} height={ROW_H} />
              </clipPath>
            );
          })}
        </defs>

        {/* ============================================================== */}
        {/* 1. CLEAN WHITE A3 PAPER BACKGROUND                             */}
        {/* ============================================================== */}
        <rect x="0" y="0" width={SHEET_W} height={SHEET_H} fill="#ffffff" />

        {/* ============================================================== */}
        {/* 2. TOP HEADER BANNERS ("Habit Tracker" & "Month")              */}
        {/* ============================================================== */}
        <g id="top-header-banners">
          {/* Left Gold Banner */}
          <polygon
            points="40,24 736,24 818,106 40,106"
            fill={THEME_COLORS.goldBanner}
          />
          {/* Thin Teal Underline Bar */}
          <rect
            x="40"
            y="112"
            width="732"
            height="8"
            fill={THEME_COLORS.tealBanner}
          />
          {/* Title: "Habit Tracker" */}
          <text
            x="60"
            y="84"
            fontSize="74"
            fontStyle="italic"
            fontFamily={DISPLAY_SERIF_FONT}
            fill={THEME_COLORS.inkDefault}
          >
            Habit Tracker
          </text>

          {/* Right Teal Banner (bleeds to right edge) */}
          <polygon
            points={`744,24 ${SHEET_W},24 ${SHEET_W},106 826,106`}
            fill={THEME_COLORS.tealBanner}
          />
          {/* Thin Gold Underline Bar */}
          <rect
            x="846"
            y="112"
            width={SHEET_W - 846}
            height="8"
            fill={THEME_COLORS.goldBanner}
          />
          {/* Heading: "Month" */}
          <text
            x="850"
            y="86"
            fontSize="44"
            fontStyle="italic"
            fontFamily={DISPLAY_SERIF_FONT}
            fill={THEME_COLORS.inkDefault}
          >
            Month
          </text>
          {/* Month Horizontal Rule */}
          <line
            x1="848"
            y1="91"
            x2={SHEET_W}
            y2="91"
            stroke={THEME_COLORS.inkDefault}
            strokeWidth="1.2"
          />

          {/* Month Editable Text */}
          {!(activeEdit?.kind === 'month') && (
            <text
              x="1010"
              y="84"
              fontSize={fontStyle === 'handwriting' ? '32' : '22'}
              fontWeight={fontStyle === 'handwriting' ? '700' : '600'}
              fontFamily={penFontFamily}
              fill={inkColor}
              clipPath="url(#clip-month-line)"
              className="pointer-events-none select-none"
            >
              {state.month}
            </text>
          )}
          <rect
            x="1002"
            y="42"
            width="250"
            height="48"
            fill="transparent"
            className="editable-zone-hover"
            style={{ cursor: 'text' }}
            onClick={() => setActiveEdit({ kind: 'month', index: 0 })}
          />
        </g>

        {/* ============================================================== */}
        {/* 3. LEFT SIDE: 10 RAINBOW HORIZONTAL BARS + "Daily" HEADING     */}
        {/* ============================================================== */}
        <g id="daily-habit-bars">
          {TRACK_COLORS.map((pastelColor, i) => {
            const yStart = CY - R_OUT + i * TRACK_H;
            const habit = state.dailyHabits[i] || { id: i + 1, num: `${i + 1}`, name: '' };
            const isEditing = activeEdit?.kind === 'daily' && activeEdit.index === i;

            return (
              <g key={`daily-bar-${i}`}>
                {/* Saturated Number Square (1–10) */}
                <rect
                  x={BAR_X}
                  y={yStart}
                  width={NUM_BOX_W}
                  height={TRACK_H}
                  fill={NUMBER_BOX_COLORS[i]}
                />
                <text
                  x={BAR_X + 6}
                  y={yStart + 15.5}
                  fontSize="12.5"
                  fontFamily="'Inter', sans-serif"
                  fontWeight="500"
                  fill="#222222"
                  className="pointer-events-none select-none"
                >
                  {habit.num || i + 1}
                </text>

                {/* Pastel Habit Name Bar */}
                <rect
                  x={BAR_TEXT_X}
                  y={yStart}
                  width={BAR_TEXT_W}
                  height={TRACK_H}
                  fill={pastelColor}
                />

                {/* Habit Name Text (Native SVG for crisp export) */}
                {!isEditing && (
                  <text
                    x={BAR_TEXT_X + 8}
                    y={yStart + (fontStyle === 'handwriting' ? 16.5 : 15)}
                    fontSize={fontStyle === 'handwriting' ? '20' : '13'}
                    fontWeight={fontStyle === 'handwriting' ? '600' : '500'}
                    fontFamily={penFontFamily}
                    fill={inkColor}
                    clipPath={`url(#clip-daily-${i})`}
                    className="pointer-events-none select-none"
                  >
                    {habit.name}
                  </text>
                )}

                {/* Clickable Edit Hitbox */}
                <rect
                  x={BAR_TEXT_X}
                  y={yStart}
                  width={BAR_TEXT_W}
                  height={TRACK_H}
                  fill="transparent"
                  className="editable-zone-hover"
                  style={{ cursor: 'text' }}
                  onClick={() => setActiveEdit({ kind: 'daily', index: i })}
                />
              </g>
            );
          })}

          {/* Crisp horizontal lines across the 10 pastel bars (matching PDF) */}
          {Array.from({ length: 11 }, (_, idx) => {
            const yLine = CY - R_OUT + idx * TRACK_H;
            return (
              <line
                key={`bar-h-line-${idx}`}
                x1={BAR_TEXT_X}
                y1={yLine}
                x2={CX}
                y2={yLine}
                stroke={THEME_COLORS.gridStroke}
                strokeWidth="0.75"
                className="pointer-events-none"
              />
            );
          })}

          {/* Heading: "Daily" in the open gap below Bar 10 and above Day 31 */}
          <text
            x="48"
            y="464"
            fontSize="44"
            fontStyle="italic"
            fontFamily={DISPLAY_SERIF_FONT}
            fill={THEME_COLORS.inkDefault}
          >
            Daily
          </text>
        </g>

        {/* ============================================================== */}
        {/* 4. 270-DEGREE RAINBOW WHEEL (12 o'clock clockwise to 9 o'clock) */}
        {/* ============================================================== */}
        <g id="circular-tracker-wheel">
          {/* Outer Olive-Gold Ring with Day Numbers (1 to TOTAL_DAYS) */}
          {Array.from({ length: TOTAL_DAYS }, (_, dIdx) => {
            const dayNum = dIdx + 1;
            const startAngle = -90 + dIdx * DEG_PER_DAY;
            const endAngle = -90 + (dIdx + 1) * DEG_PER_DAY;
            const midAngle = (startAngle + endAngle) / 2;
            const rMid = (R_OUT + R_HEADER) / 2;
            const pos = polarToCartesian(CX, CY, rMid, midAngle);
            const pathD = describeSector(CX, CY, R_OUT, R_HEADER, startAngle, endAngle);

            // Angle from 12 o'clock clockwise (0°..270°)
            const clockAngle = midAngle + 90;
            const textRotation = clockAngle > 130 ? clockAngle - 180 : clockAngle;

            return (
              <g key={`day-header-${dayNum}`}>
                <path
                  d={pathD}
                  fill={THEME_COLORS.wheelRing}
                  stroke={THEME_COLORS.gridStroke}
                  strokeWidth="0.75"
                />
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="11.5"
                  fontFamily="'Inter', sans-serif"
                  fontWeight="500"
                  fill="#222222"
                  transform={`rotate(${textRotation}, ${pos.x}, ${pos.y})`}
                  className="pointer-events-none select-none"
                >
                  {dayNum}
                </text>
              </g>
            );
          })}

          {/* 10 Concentric Inner Habit Tracks */}
          {Array.from({ length: TOTAL_DAYS }, (_, dIdx) => {
            const dayNum = dIdx + 1;
            const startAngle = -90 + dIdx * DEG_PER_DAY;
            const endAngle = -90 + (dIdx + 1) * DEG_PER_DAY;
            const midAngle = (startAngle + endAngle) / 2;
            const clockAngle = midAngle + 90;
            const checkRotation = clockAngle > 130 ? clockAngle - 180 : clockAngle;

            return (
              <g key={`day-col-${dayNum}`}>
                {TRACK_COLORS.map((color, hIdx) => {
                  // Track 0 (Row 1) is outermost; Track 9 (Row 10) is innermost
                  const innerR = R_IN + (NUM_TRACKS - 1 - hIdx) * TRACK_H;
                  const outerR = innerR + TRACK_H;
                  const rMid = (innerR + outerR) / 2;
                  const pos = polarToCartesian(CX, CY, rMid, midAngle);
                  const pathD = describeSector(CX, CY, innerR, outerR, startAngle, endAngle);
                  const isChecked = Boolean(state.checks[`${hIdx}-${dayNum}`]);

                  return (
                    <g
                      key={`cell-${hIdx}-${dayNum}`}
                      className="cursor-pointer"
                      onClick={() => handleWheelCellClick(hIdx, dayNum)}
                    >
                      <path
                        d={pathD}
                        fill={color}
                        stroke={THEME_COLORS.gridStroke}
                        strokeWidth="0.75"
                        className="wheel-cell-sector"
                      />
                      {isChecked && (
                        <g
                          transform={`translate(${pos.x}, ${pos.y}) rotate(${checkRotation})`}
                          className="pointer-events-none"
                        >
                          <path
                            d="M -4.2 -0.6 L -1.1 3.6 L 5.0 -4.4"
                            fill="none"
                            stroke={inkColor}
                            strokeWidth="2.1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Crisp 9 o'clock end radial line */}
          <line
            x1={innerEndPt.x}
            y1={innerEndPt.y}
            x2={outerEndPt.x}
            y2={outerEndPt.y}
            stroke={THEME_COLORS.gridStroke}
            strokeWidth="0.85"
            className="pointer-events-none"
          />

          {/* Crisp 12 o'clock seam line */}
          <line
            x1={CX}
            y1={CY - R_HEADER}
            x2={CX}
            y2={CY - R_IN}
            stroke={THEME_COLORS.gridStroke}
            strokeWidth="0.85"
            className="pointer-events-none"
          />

          {/* Inner hole arc border */}
          <path
            d={`M ${CX} ${CY - R_IN} A ${R_IN} ${R_IN} 0 1 1 ${innerEndPt.x} ${innerEndPt.y}`}
            fill="none"
            stroke={THEME_COLORS.gridStroke}
            strokeWidth="0.85"
            className="pointer-events-none"
          />
        </g>

        {/* ============================================================== */}
        {/* 5. TOP-RIGHT: "Weekly" + 5-COLUMN GRID (1..5)                  */}
        {/* ============================================================== */}
        <g id="weekly-section">
          <text
            x="644"
            y="196"
            fontSize="44"
            fontStyle="italic"
            fontFamily={DISPLAY_SERIF_FONT}
            fill={THEME_COLORS.inkDefault}
          >
            Weekly
          </text>

          {/* Header row: 1 2 3 4 5 */}
          {[1, 2, 3, 4, 5].map((num, cIdx) => {
            const cellX = WEEKLY_GRID_X + cIdx * COL_W;
            const headerY = WEEKLY_TOP_Y - ROW_H;
            return (
              <g key={`weekly-col-hdr-${num}`}>
                <rect
                  x={cellX}
                  y={headerY}
                  width={COL_W}
                  height={ROW_H}
                  fill="#ffffff"
                  stroke={THEME_COLORS.gridStroke}
                  strokeWidth="0.75"
                />
                <text
                  x={cellX + COL_W / 2}
                  y={headerY + ROW_H / 2 + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="14.5"
                  fontStyle="italic"
                  fontFamily="'Cormorant Garamond', 'Playfair Display', Georgia, serif"
                  fontWeight="600"
                  fill={THEME_COLORS.inkDefault}
                >
                  {num}
                </text>
              </g>
            );
          })}

          {/* Top horizontal line under "Weekly" & header */}
          <line
            x1={WEEKLY_LINE_STARTS[0]}
            y1={WEEKLY_TOP_Y}
            x2={RIGHT_EDGE}
            y2={WEEKLY_TOP_Y}
            stroke={THEME_COLORS.gridStroke}
            strokeWidth="0.75"
          />

          {/* 10 Weekly Data Rows */}
          {Array.from({ length: 10 }, (_, rIdx) => {
            const yTop = WEEKLY_TOP_Y + rIdx * ROW_H;
            const yBottom = yTop + ROW_H;
            const lineStartX = WEEKLY_LINE_STARTS[rIdx + 1];
            const habit = state.weeklyHabits[rIdx] || {
              id: rIdx + 1,
              name: '',
              weeks: [false, false, false, false, false],
            };
            const isEditing = activeEdit?.kind === 'weekly' && activeEdit.index === rIdx;

            return (
              <g key={`weekly-row-${rIdx}`}>
                {/* Ruled horizontal bottom line extending left around the wheel */}
                <line
                  x1={lineStartX}
                  y1={yBottom}
                  x2={RIGHT_EDGE}
                  y2={yBottom}
                  stroke={THEME_COLORS.gridStroke}
                  strokeWidth="0.75"
                />

                {/* Weekly habit text */}
                {!isEditing && (
                  <text
                    x={lineStartX + 6}
                    y={yBottom - 6}
                    fontSize={fontStyle === 'handwriting' ? '20' : '13'}
                    fontWeight={fontStyle === 'handwriting' ? '600' : '500'}
                    fontFamily={penFontFamily}
                    fill={inkColor}
                    clipPath={`url(#clip-weekly-${rIdx})`}
                    className="pointer-events-none select-none"
                  >
                    {habit.name}
                  </text>
                )}

                {/* Editable text hitbox */}
                <rect
                  x={lineStartX}
                  y={yTop}
                  width={WEEKLY_GRID_X - lineStartX}
                  height={ROW_H}
                  fill="transparent"
                  className="editable-zone-hover"
                  style={{ cursor: 'text' }}
                  onClick={() => setActiveEdit({ kind: 'weekly', index: rIdx })}
                />

                {/* 5 Weekly Checkbox Cells */}
                {[0, 1, 2, 3, 4].map((wIdx) => {
                  const cellX = WEEKLY_GRID_X + wIdx * COL_W;
                  const isChecked = Boolean(habit.weeks?.[wIdx]);
                  return (
                    <g
                      key={`weekly-cell-${rIdx}-${wIdx}`}
                      className="cursor-pointer"
                      onClick={() => handleWeeklyCheckToggle(rIdx, wIdx)}
                    >
                      <rect
                        x={cellX}
                        y={yTop}
                        width={COL_W}
                        height={ROW_H}
                        fill="transparent"
                        stroke={THEME_COLORS.gridStroke}
                        strokeWidth="0.75"
                        className="editable-zone-hover"
                      />
                      {isChecked && (
                        <path
                          d={`M ${cellX + 13} ${yTop + 12.5} L ${cellX + 17.5} ${yTop + 17.5} L ${cellX + 26.5} ${yTop + 7}`}
                          fill="none"
                          stroke={inkColor}
                          strokeWidth="2.1"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="pointer-events-none"
                        />
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </g>

        {/* ============================================================== */}
        {/* 6. MIDDLE-RIGHT: "Monthly" + 4 ROWS & 1 STATUS COLUMN          */}
        {/* ============================================================== */}
        <g id="monthly-section">
          <text
            x="832"
            y="508"
            fontSize="44"
            fontStyle="italic"
            fontFamily={DISPLAY_SERIF_FONT}
            fill={THEME_COLORS.inkDefault}
          >
            Monthly
          </text>

          {/* Top line under "Monthly" */}
          <line
            x1={BASE_LEFT_X}
            y1={MONTHLY_TOP_Y}
            x2={RIGHT_EDGE}
            y2={MONTHLY_TOP_Y}
            stroke={THEME_COLORS.gridStroke}
            strokeWidth="0.75"
          />

          {/* 4 Monthly Rows */}
          {Array.from({ length: 4 }, (_, rIdx) => {
            const yTop = MONTHLY_TOP_Y + rIdx * ROW_H;
            const yBottom = yTop + ROW_H;
            const habit = state.monthlyHabits[rIdx] || { id: rIdx + 1, name: '', status: '' };
            const isEditing = activeEdit?.kind === 'monthly' && activeEdit.index === rIdx;

            return (
              <g key={`monthly-row-${rIdx}`}>
                <line
                  x1={BASE_LEFT_X}
                  y1={yBottom}
                  x2={RIGHT_EDGE}
                  y2={yBottom}
                  stroke={THEME_COLORS.gridStroke}
                  strokeWidth="0.75"
                />

                {/* Monthly habit text */}
                {!isEditing && (
                  <text
                    x={BASE_LEFT_X + 6}
                    y={yBottom - 6}
                    fontSize={fontStyle === 'handwriting' ? '20' : '13'}
                    fontWeight={fontStyle === 'handwriting' ? '600' : '500'}
                    fontFamily={penFontFamily}
                    fill={inkColor}
                    clipPath={`url(#clip-monthly-${rIdx})`}
                    className="pointer-events-none select-none"
                  >
                    {habit.name}
                  </text>
                )}

                {/* Editable hitbox */}
                <rect
                  x={BASE_LEFT_X}
                  y={yTop}
                  width={MONTHLY_COL_X - BASE_LEFT_X}
                  height={ROW_H}
                  fill="transparent"
                  className="editable-zone-hover"
                  style={{ cursor: 'text' }}
                  onClick={() => setActiveEdit({ kind: 'monthly', index: rIdx })}
                />

                {/* Right-hand checkbox box */}
                <g
                  className="cursor-pointer"
                  onClick={() => handleMonthlyStatusToggle(rIdx)}
                >
                  <rect
                    x={MONTHLY_COL_X}
                    y={yTop}
                    width={COL_W}
                    height={ROW_H}
                    fill="transparent"
                    stroke={THEME_COLORS.gridStroke}
                    strokeWidth="0.75"
                    className="editable-zone-hover"
                  />
                  {habit.status && (
                    <path
                      d={`M ${MONTHLY_COL_X + 13} ${yTop + 12.5} L ${MONTHLY_COL_X + 17.5} ${yTop + 17.5} L ${MONTHLY_COL_X + 26.5} ${yTop + 7}`}
                      fill="none"
                      stroke={inkColor}
                      strokeWidth="2.1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="pointer-events-none"
                    />
                  )}
                </g>
              </g>
            );
          })}
        </g>

        {/* ============================================================== */}
        {/* 7. BOTTOM-RIGHT: "Notes" + 6 CURVE-FOLLOWING RULED LINES       */}
        {/* ============================================================== */}
        <g id="notes-section">
          <text
            x="832"
            y="678"
            fontSize="44"
            fontStyle="italic"
            fontFamily={DISPLAY_SERIF_FONT}
            fill={THEME_COLORS.inkDefault}
          >
            Notes
          </text>

          {NOTES_LINE_STARTS.map((startX, idx) => {
            const lineY = NOTES_TOP_Y + idx * ROW_H;
            const editX = idx === 0 ? 975 : startX;
            const isEditing = activeEdit?.kind === 'note' && activeEdit.index === idx;
            const noteVal = state.notes?.[idx] || '';

            return (
              <g key={`notes-line-${idx}`}>
                <line
                  x1={startX}
                  y1={lineY}
                  x2={RIGHT_EDGE}
                  y2={lineY}
                  stroke={THEME_COLORS.gridStroke}
                  strokeWidth="0.75"
                />

                {!isEditing && (
                  <text
                    x={editX + 6}
                    y={lineY - 6}
                    fontSize={fontStyle === 'handwriting' ? '20' : '13'}
                    fontWeight={fontStyle === 'handwriting' ? '600' : '500'}
                    fontFamily={penFontFamily}
                    fill={inkColor}
                    clipPath={`url(#clip-note-${idx})`}
                    className="pointer-events-none select-none"
                  >
                    {noteVal}
                  </text>
                )}

                <rect
                  x={editX}
                  y={lineY - ROW_H}
                  width={RIGHT_EDGE - editX}
                  height={ROW_H}
                  fill="transparent"
                  className="editable-zone-hover"
                  style={{ cursor: 'text' }}
                  onClick={() => setActiveEdit({ kind: 'note', index: idx })}
                />
              </g>
            );
          })}
        </g>
      </svg>

      {/* ================================================================ */}
      {/* IN-PLACE HTML INPUT OVERLAY (Only mounted during active edit)    */}
      {/* ================================================================ */}
      {activeInput && (
        <input
          ref={inputRef}
          type="text"
          value={activeInput.value}
          placeholder={activeInput.placeholder}
          onChange={(e) => activeInput.onChange(e.target.value)}
          onBlur={() => setActiveEdit(null)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              setActiveEdit(null);
            } else if (e.key === 'Enter' || e.key === 'Tab') {
              e.preventDefault();
              activeInput.onNext();
            }
          }}
          className="no-print absolute bg-transparent border-0 outline-none"
          style={{
            left: `${(activeInput.x / SHEET_W) * 100}%`,
            top: `${(activeInput.y / SHEET_H) * 100}%`,
            width: `${(activeInput.w / SHEET_W) * 100}%`,
            height: `${(activeInput.h / SHEET_H) * 100}%`,
            color: inkColor,
            fontFamily: penFontFamily,
            fontSize: `${(activeInput.fontSizePx / SHEET_W) * 100}cqw`,
            fontWeight: activeInput.fontWeight,
            lineHeight: 1.1,
            padding: '0 2px',
            backgroundColor: 'rgba(255, 255, 255, 0.45)',
            borderRadius: '2px',
            boxShadow: `inset 0 -1.5px 0 ${inkColor}`,
          }}
        />
      )}
    </div>
  );
}
