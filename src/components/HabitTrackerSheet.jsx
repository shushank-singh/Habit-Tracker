import React, { useState, useRef } from 'react';
import { playPenTickSound, playCelebrationSound } from '../utils/audio';
import confetti from 'canvas-confetti';

// Track colors matching the pastel rainbow of the photo
export const TRACK_COLORS = [
  '#e2bec1', // Row 1: soft rose / blush
  '#dfc7b8', // Row 2: soft warm peach
  '#ebdec4', // Row 3: soft light apricot / warm yellow
  '#e6e1ce', // Row 4: soft butter yellow
  '#f1f3dd', // Row 5: soft pale mint / lime
  '#daede3', // Row 6: soft seafoam / sage
  '#ccf1f6', // Row 7: soft sky blue
  '#d6e4f5', // Row 8: soft periwinkle
  '#ead3ef', // Row 9: soft lilac
  '#f5cbdb', // Row 10: soft mauve pink
];

// Top tables gradient row colors
export const TOP_ROW_COLORS = [
  '#f0cecc', // Row 1: rose
  '#f6dec7', // Row 2: peach
  '#f8ebcd', // Row 3: apricot
  '#fcf8df', // Row 4: pale yellow
  '#f4f3dc', // Row 5: cream/pale green
];

// Photo default initial data
export const PHOTO_INITIAL_STATE = {
  month: 'February',
  monthType: 29, // 29 days
  monthlyHabits: [
    { id: 1, name: 'Cinema', status: 'Yes' },
    { id: 2, name: '', status: '' },
    { id: 3, name: '', status: '' },
    { id: 4, name: '', status: '' },
    { id: 5, name: '', status: '' },
  ],
  weeklyHabits: [
    { id: 1, name: 'Meet my mom', weeks: [true, false, false, false, false] },
    { id: 2, name: '', weeks: [false, false, false, false, false] },
    { id: 3, name: '', weeks: [false, false, false, false, false] },
    { id: 4, name: '', weeks: [false, false, false, false, false] },
    { id: 5, name: '', weeks: [false, false, false, false, false] },
  ],
  dailyHabits: [
    { id: 1, num: '1', name: 'Pilates' },
    { id: 2, num: '2', name: 'Eat probiotics!' },
    { id: 3, num: '3', name: 'Drink your vitamins!' },
    { id: 4, num: '4', name: 'Take your medicine!' },
    { id: 5, num: '5', name: '' },
    { id: 6, num: '6', name: '' },
    { id: 7, num: '7', name: '' },
    { id: 8, num: '8', name: '' },
    { id: 9, num: '9', name: '' },
    { id: 10, num: '10', name: '' },
  ],
  // Grid checks: { 'habitIndex-day': boolean }
  // Habit indices: 0..9 (Row 1..10)
  // Day indices: 1..29
  checks: {
    // Days 1-7: Habits 1-4
    '0-1': true, '1-1': true, '2-1': true, '3-1': true,
    '0-2': true, '1-2': true, '2-2': true, '3-2': true,
    '0-3': true, '1-3': true, '2-3': true, '3-3': true,
    '0-4': true, '1-4': true, '2-4': true, '3-4': true,
    '0-5': true, '1-5': true, '2-5': true, '3-5': true,
    '0-6': true, '1-6': true, '2-6': true, '3-6': true,
    '0-7': true, '1-7': true, '2-7': true, '3-7': true,
    // Day 8: Habits 1-2
    '0-8': true, '1-8': true,
  },
  notes: {
    topRight: ['', '', '', '', '', ''],
    myNotes: '',
    bottomLeft: ['', '', '', '', ''],
    bottomRight: ['', '', '', '', ''],
  }
};

export const BLANK_INITIAL_STATE = {
  month: 'March',
  monthType: 31,
  monthlyHabits: [
    { id: 1, name: '', status: '' },
    { id: 2, name: '', status: '' },
    { id: 3, name: '', status: '' },
    { id: 4, name: '', status: '' },
    { id: 5, name: '', status: '' },
  ],
  weeklyHabits: [
    { id: 1, name: '', weeks: [false, false, false, false, false] },
    { id: 2, name: '', weeks: [false, false, false, false, false] },
    { id: 3, name: '', weeks: [false, false, false, false, false] },
    { id: 4, name: '', weeks: [false, false, false, false, false] },
    { id: 5, name: '', weeks: [false, false, false, false, false] },
  ],
  dailyHabits: [
    { id: 1, num: '1', name: '' },
    { id: 2, num: '2', name: '' },
    { id: 3, num: '3', name: '' },
    { id: 4, num: '4', name: '' },
    { id: 5, num: '5', name: '' },
    { id: 6, num: '6', name: '' },
    { id: 7, num: '7', name: '' },
    { id: 8, num: '8', name: '' },
    { id: 9, num: '9', name: '' },
    { id: 10, num: '10', name: '' },
  ],
  checks: {},
  notes: {
    topRight: ['', '', '', '', '', ''],
    myNotes: '',
    bottomLeft: ['', '', '', '', ''],
    bottomRight: ['', '', '', '', ''],
  }
};

export default function HabitTrackerSheet({
  state,
  setState,
  inkColor = '#1d3557', // Classic pen ink
  fontStyle = 'handwriting', // 'handwriting' or 'clean'
  soundEnabled = true,
  svgRef,
}) {
  const [editingCell, setEditingCell] = useState(null); // { type, id, field }
  const [hoveredCell, setHoveredCell] = useState(null);

  // Geometric Constants matching our measured coordinates
  const CX = 390.0;
  const CY = 667.0;
  const R_IN = 72.0;
  const TRACK_H = 23.8;
  const NUM_TRACKS = 10;
  const R_OUT = R_IN + NUM_TRACKS * TRACK_H; // 310.0
  const R_HEADER = R_OUT + TRACK_H;          // 333.8
  const TOTAL_DAYS = state.monthType || 29;
  const DEG_PER_DAY = 7.5; // Exactly 48-division standard polar grid

  // Polar coordinate helper (degrees: -90 is top, clockwise)
  function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  }

  // Create an annular sector SVG path
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

  // Toggle checkmark on the wheel
  const handleWheelCellClick = (habitIdx, day) => {
    const key = `${habitIdx}-${day}`;
    const nextChecks = { ...state.checks, [key]: !state.checks[key] };
    setState({ ...state, checks: nextChecks });
    playPenTickSound(soundEnabled);

    // Check if user completed all active habits for that day!
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
          colors: ['#f8b4bc', '#fce2a6', '#c5ece5', '#cbd6f8', '#f1bee8'],
        });
      }
    }
  };

  // Toggle weekly habit checkbox
  const handleWeeklyCheckToggle = (habitIdx, weekIdx) => {
    const updated = [...state.weeklyHabits];
    const weeks = [...updated[habitIdx].weeks];
    weeks[weekIdx] = !weeks[weekIdx];
    updated[habitIdx] = { ...updated[habitIdx], weeks };
    setState({ ...state, weeklyHabits: updated });
    playPenTickSound(soundEnabled);
  };

  // Toggle monthly habit status
  const handleMonthlyStatusToggle = (habitIdx) => {
    const updated = [...state.monthlyHabits];
    const curr = updated[habitIdx].status;
    let next = 'Yes';
    if (curr === 'Yes') next = '✓';
    else if (curr === '✓') next = '';
    else next = 'Yes';
    updated[habitIdx] = { ...updated[habitIdx], status: next };
    setState({ ...state, monthlyHabits: updated });
    playPenTickSound(soundEnabled);
  };

  // Handwriting vs clean font class
  const penFont = fontStyle === 'handwriting' ? 'font-handwriting' : 'font-clean';
  const headerFont = 'font-serif';

  return (
    <div className="sheet-container relative select-none">
      <svg
        ref={svgRef}
        viewBox="0 0 743 1024"
        className="w-full h-auto habit-sheet-svg"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          fontFamily: "'Inter', sans-serif",
          shapeRendering: 'geometricPrecision',
          textRendering: 'geometricPrecision',
        }}
      >
        <defs>
          {/* Subtle paper grain filter */}
          <filter id="paper-texture" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.02 0"
              in="noise"
              result="coloredNoise"
            />
            <feComposite operator="in" in2="SourceGraphic" />
          </filter>

          {/* Ink drop shadow filter */}
          <filter id="ink-bleed" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="0.25" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Paper Background */}
        <rect
          x="0"
          y="0"
          width="743"
          height="1024"
          fill="#faf9f6"
          className="paper-bg"
        />

        {/* ============================================================== */}
        {/* 1. TITLE: "HABIT TRACKER"                                       */}
        {/* ============================================================== */}
        <g id="title-group" transform="translate(371.5, 84)">
          <text
            textAnchor="middle"
            fill="#ffffff"
            stroke="#262626"
            strokeWidth="1.2"
            letterSpacing="0.32em"
            fontSize="34"
            fontFamily="'Cinzel', 'Playfair Display SC', 'Times New Roman', serif"
            fontWeight="700"
            style={{ paintOrder: 'stroke fill' }}
          >
            HABIT TRACKER
          </text>
        </g>

        {/* ============================================================== */}
        {/* 2. TOP-LEFT: MONTHLY HABITS TABLE                              */}
        {/* ============================================================== */}
        <g id="monthly-habits-table">
          {/* Table Container Rect */}
          <rect
            x="58"
            y="143"
            width="332"
            height="141"
            fill="#ffffff"
            stroke="#3a3a3a"
            strokeWidth="1"
          />

          {/* Header Row */}
          <line x1="58" y1="167" x2="390" y2="167" stroke="#3a3a3a" strokeWidth="1" />
          <line x1="127" y1="143" x2="127" y2="284" stroke="#3a3a3a" strokeWidth="1" />

          {/* Header Texts */}
          <text
            x="92.5"
            y="159"
            textAnchor="middle"
            fontSize="14"
            fontFamily="'Inter', sans-serif"
            fontWeight="500"
            fill="#2c2c2c"
          >
            yes/no
          </text>
          <text
            x="258.5"
            y="159"
            textAnchor="middle"
            fontSize="14"
            fontFamily="'Inter', sans-serif"
            fontWeight="500"
            fill="#2c2c2c"
          >
            monthly habits
          </text>

          {/* 5 Rows */}
          {TOP_ROW_COLORS.map((color, i) => {
            const yStart = 167 + i * 23.4;
            const habit = state.monthlyHabits[i] || { name: '', status: '' };
            return (
              <g key={`monthly-row-${i}`}>
                {/* Row Background Fill */}
                <rect
                  x="58"
                  y={yStart}
                  width="332"
                  height="23.4"
                  fill={color}
                  stroke="#3a3a3a"
                  strokeWidth="0.8"
                />
                {/* Horizontal divider */}
                {i < 4 && (
                  <line
                    x1="58"
                    y1={yStart + 23.4}
                    x2="390"
                    y2={yStart + 23.4}
                    stroke="#3a3a3a"
                    strokeWidth="0.8"
                  />
                )}

                {/* Yes/No Cell (Clickable) */}
                <rect
                  x="58"
                  y={yStart}
                  width="69"
                  height="23.4"
                  fill="transparent"
                  className="cursor-pointer hover:opacity-80"
                  onClick={() => handleMonthlyStatusToggle(i)}
                />
                <text
                  x="92.5"
                  y={yStart + 16.5}
                  textAnchor="middle"
                  fontSize={fontStyle === 'handwriting' ? '20' : '14'}
                  fontFamily={fontStyle === 'handwriting' ? "'Caveat', cursive" : "'Inter', sans-serif"}
                  fontWeight={fontStyle === 'handwriting' ? '700' : '600'}
                  fill={inkColor}
                  className="pointer-events-none select-none"
                >
                  {habit.status}
                </text>

                {/* Habit Name Cell (Editable) */}
                <foreignObject
                  x="132"
                  y={yStart + 0.5}
                  width="253"
                  height="22"
                  className="overflow-visible"
                >
                  <input
                    type="text"
                    value={habit.name}
                    onChange={(e) => {
                      const updated = [...state.monthlyHabits];
                      updated[i] = { ...updated[i], name: e.target.value };
                      setState({ ...state, monthlyHabits: updated });
                    }}
                    placeholder=""
                    className={`w-full h-full bg-transparent border-0 outline-none px-1 text-sm leading-none ${
                      fontStyle === 'handwriting'
                        ? 'font-handwriting text-xl text-blue-900 tracking-wide'
                        : 'font-sans text-xs text-stone-900'
                    }`}
                    style={{
                      color: inkColor,
                      fontFamily: fontStyle === 'handwriting' ? "'Caveat', cursive" : "'Inter', sans-serif",
                    }}
                  />
                </foreignObject>
              </g>
            );
          })}
        </g>

        {/* ============================================================== */}
        {/* 3. TOP-RIGHT: WEEKLY HABITS TABLE                              */}
        {/* ============================================================== */}
        <g id="weekly-habits-table">
          {/* Table Container Rect */}
          <rect
            x="440"
            y="143"
            width="282"
            height="141"
            fill="#ffffff"
            stroke="#3a3a3a"
            strokeWidth="1"
          />

          {/* Header Horizontal Line */}
          <line x1="440" y1="167" x2="722" y2="167" stroke="#3a3a3a" strokeWidth="1" />

          {/* Vertical Divider between Habit Name and Yes/No weeks */}
          <line x1="621" y1="143" x2="621" y2="284" stroke="#3a3a3a" strokeWidth="1" />

          {/* 5 Weekly Sub-columns for Yes/No */}
          {[1, 2, 3, 4].map((w) => (
            <line
              key={`week-vert-${w}`}
              x1={621 + w * 20.2}
              y1="167"
              x2={621 + w * 20.2}
              y2="284"
              stroke="#3a3a3a"
              strokeWidth="0.8"
            />
          ))}

          {/* Header Texts */}
          <text
            x="530.5"
            y="159"
            textAnchor="middle"
            fontSize="14"
            fontFamily="'Inter', sans-serif"
            fontWeight="500"
            fill="#2c2c2c"
          >
            weekly habits
          </text>
          <text
            x="671.5"
            y="159"
            textAnchor="middle"
            fontSize="14"
            fontFamily="'Inter', sans-serif"
            fontWeight="500"
            fill="#2c2c2c"
          >
            yes/no
          </text>

          {/* 5 Rows */}
          {TOP_ROW_COLORS.map((color, i) => {
            const yStart = 167 + i * 23.4;
            const habit = state.weeklyHabits[i] || { name: '', weeks: [false, false, false, false, false] };
            return (
              <g key={`weekly-row-${i}`}>
                {/* Row Background Fill */}
                <rect
                  x="440"
                  y={yStart}
                  width="282"
                  height="23.4"
                  fill={color}
                  stroke="#3a3a3a"
                  strokeWidth="0.8"
                />
                {/* Horizontal divider */}
                {i < 4 && (
                  <line
                    x1="440"
                    y1={yStart + 23.4}
                    x2="722"
                    y2={yStart + 23.4}
                    stroke="#3a3a3a"
                    strokeWidth="0.8"
                  />
                )}

                {/* Habit Name Cell (Editable) */}
                <foreignObject
                  x="445"
                  y={yStart + 0.5}
                  width="172"
                  height="22"
                  className="overflow-visible"
                >
                  <input
                    type="text"
                    value={habit.name}
                    onChange={(e) => {
                      const updated = [...state.weeklyHabits];
                      updated[i] = { ...updated[i], name: e.target.value };
                      setState({ ...state, weeklyHabits: updated });
                    }}
                    placeholder=""
                    className={`w-full h-full bg-transparent border-0 outline-none px-1 text-sm leading-none ${
                      fontStyle === 'handwriting'
                        ? 'font-handwriting text-xl text-blue-900 tracking-wide'
                        : 'font-sans text-xs text-stone-900'
                    }`}
                    style={{
                      color: inkColor,
                      fontFamily: fontStyle === 'handwriting' ? "'Caveat', cursive" : "'Inter', sans-serif",
                    }}
                  />
                </foreignObject>

                {/* 5 Weekly Checkboxes */}
                {[0, 1, 2, 3, 4].map((w) => {
                  const xCell = 621 + w * 20.2;
                  const isChecked = habit.weeks[w];
                  return (
                    <g key={`weekly-check-${i}-${w}`}>
                      <rect
                        x={xCell}
                        y={yStart}
                        width="20.2"
                        height="23.4"
                        fill="transparent"
                        className="cursor-pointer hover:bg-black/5"
                        onClick={() => handleWeeklyCheckToggle(i, w)}
                      />
                      {isChecked && (
                        <path
                          d={`M ${xCell + 5.5} ${yStart + 12} L ${xCell + 8.5} ${yStart + 16} L ${xCell + 15} ${yStart + 7}`}
                          fill="none"
                          stroke={inkColor}
                          strokeWidth="1.8"
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
        {/* 4. NOTES LINES BELOW WEEKLY HABITS (Tapered)                   */}
        {/* ============================================================== */}
        <g id="top-right-notes">
          {[
            { y: 304, x1: 538 },
            { y: 329, x1: 588 },
            { y: 354, x1: 616 },
            { y: 379, x1: 642 },
            { y: 404, x1: 668 },
            { y: 429, x1: 702 },
          ].map((line, idx) => (
            <g key={`top-right-line-${idx}`}>
              <line
                x1={line.x1}
                y1={line.y}
                x2="722"
                y2={line.y}
                stroke="#666666"
                strokeWidth="0.9"
              />
              <foreignObject
                x={line.x1}
                y={line.y - 18}
                width={722 - line.x1}
                height="19"
              >
                <input
                  type="text"
                  value={state.notes.topRight[idx] || ''}
                  onChange={(e) => {
                    const notes = [...state.notes.topRight];
                    notes[idx] = e.target.value;
                    setState({ ...state, notes: { ...state.notes, topRight: notes } });
                  }}
                  className="w-full h-full bg-transparent border-0 outline-none px-1 text-xs leading-none"
                  style={{
                    color: inkColor,
                    fontFamily: fontStyle === 'handwriting' ? "'Caveat', cursive" : "'Inter', sans-serif",
                    fontSize: fontStyle === 'handwriting' ? '17px' : '11px',
                  }}
                />
              </foreignObject>
            </g>
          ))}
        </g>

        {/* ============================================================== */}
        {/* 5. DAILY HABITS HORIZONTAL TABLE (Left Side)                   */}
        {/* ============================================================== */}
        <g id="daily-habits-horizontal-table">
          {/* Header Row: "№" and "daily habits" */}
          <rect
            x="58"
            y="333.2"
            width="332"
            height="23.8"
            fill="#ffffff"
            stroke="#3a3a3a"
            strokeWidth="1"
          />
          <line x1="127" y1="333.2" x2="127" y2="595" stroke="#3a3a3a" strokeWidth="1" />
          <line x1="58" y1="357" x2="390" y2="357" stroke="#3a3a3a" strokeWidth="1" />

          {/* Header text */}
          <text
            x="92.5"
            y="350"
            textAnchor="middle"
            fontSize="14"
            fontFamily="'Inter', sans-serif"
            fontWeight="500"
            fill="#2c2c2c"
          >
            №
          </text>
          <text
            x="258.5"
            y="350"
            textAnchor="middle"
            fontSize="14"
            fontFamily="'Inter', sans-serif"
            fontWeight="500"
            fill="#2c2c2c"
          >
            daily habits
          </text>

          {/* 10 Habit Rows */}
          {TRACK_COLORS.map((color, i) => {
            const yStart = 357 + i * 23.8;
            const habit = state.dailyHabits[i] || { num: `${i + 1}`, name: '' };
            return (
              <g key={`daily-row-${i}`}>
                {/* Background color */}
                <rect
                  x="58"
                  y={yStart}
                  width="332"
                  height="23.8"
                  fill={color}
                  stroke="#3a3a3a"
                  strokeWidth="0.8"
                />
                {/* Horizontal divider */}
                {i < 9 && (
                  <line
                    x1="58"
                    y1={yStart + 23.8}
                    x2="390"
                    y2={yStart + 23.8}
                    stroke="#3a3a3a"
                    strokeWidth="0.8"
                  />
                )}

                {/* Habit Number (Editable or Display) */}
                <foreignObject
                  x="58"
                  y={yStart + 0.5}
                  width="69"
                  height="22"
                  className="overflow-visible text-center"
                >
                  <input
                    type="text"
                    value={habit.num}
                    onChange={(e) => {
                      const updated = [...state.dailyHabits];
                      updated[i] = { ...updated[i], num: e.target.value };
                      setState({ ...state, dailyHabits: updated });
                    }}
                    className="w-full h-full text-center bg-transparent border-0 outline-none text-xs leading-none font-bold"
                    style={{
                      color: habit.name ? inkColor : '#444444',
                      fontFamily:
                        fontStyle === 'handwriting' && habit.name
                          ? "'Caveat', cursive"
                          : "'Inter', sans-serif",
                      fontSize: fontStyle === 'handwriting' && habit.name ? '20px' : '13px',
                    }}
                  />
                </foreignObject>

                {/* Habit Name (Editable) */}
                <foreignObject
                  x="132"
                  y={yStart + 0.5}
                  width="253"
                  height="22"
                  className="overflow-visible"
                >
                  <input
                    type="text"
                    value={habit.name}
                    onChange={(e) => {
                      const updated = [...state.dailyHabits];
                      updated[i] = { ...updated[i], name: e.target.value };
                      setState({ ...state, dailyHabits: updated });
                    }}
                    placeholder=""
                    className={`w-full h-full bg-transparent border-0 outline-none px-1 text-sm leading-none ${
                      fontStyle === 'handwriting'
                        ? 'font-handwriting text-xl text-blue-900 tracking-wide'
                        : 'font-sans text-xs text-stone-900'
                    }`}
                    style={{
                      color: inkColor,
                      fontFamily: fontStyle === 'handwriting' ? "'Caveat', cursive" : "'Inter', sans-serif",
                    }}
                  />
                </foreignObject>
              </g>
            );
          })}

          {/* Left Table Outer Left Border */}
          <line x1="58" y1="333.2" x2="58" y2="595" stroke="#3a3a3a" strokeWidth="1" />
          {/* Bottom border of track 10 */}
          <line x1="58" y1="595" x2="390" y2="595" stroke="#3a3a3a" strokeWidth="1" />
        </g>

        {/* ============================================================== */}
        {/* 6. CIRCULAR WHEEL TRACKER (Seamlessly connects at x=390)       */}
        {/* ============================================================== */}
        <g id="circular-tracker-wheel">
          {/* Outer Header Ring with Day Numbers (1 to TOTAL_DAYS) */}
          {Array.from({ length: TOTAL_DAYS }, (_, dIdx) => {
            const dayNum = dIdx + 1;
            const startAngle = -90 + dIdx * DEG_PER_DAY;
            const endAngle = -90 + (dIdx + 1) * DEG_PER_DAY;
            const midAngle = (startAngle + endAngle) / 2;
            const rMid = (R_OUT + R_HEADER) / 2;
            const pos = polarToCartesian(CX, CY, rMid, midAngle);
            const pathD = describeSector(CX, CY, R_OUT, R_HEADER, startAngle, endAngle);

            return (
              <g key={`day-header-${dayNum}`}>
                <path
                  d={pathD}
                  fill="#ffffff"
                  stroke="#3a3a3a"
                  strokeWidth="0.8"
                />
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="12.5"
                  fontFamily="'Inter', sans-serif"
                  fontWeight="600"
                  fill="#2c2c2c"
                  transform={`rotate(${midAngle + 90}, ${pos.x}, ${pos.y})`}
                  className="pointer-events-none select-none"
                >
                  {dayNum}
                </text>
              </g>
            );
          })}

          {/* Concentric Habit Rings & Interactive Cells */}
          {Array.from({ length: TOTAL_DAYS }, (_, dIdx) => {
            const dayNum = dIdx + 1;
            const startAngle = -90 + dIdx * DEG_PER_DAY;
            const endAngle = -90 + (dIdx + 1) * DEG_PER_DAY;
            const midAngle = (startAngle + endAngle) / 2;

            return (
              <g key={`day-column-${dayNum}`}>
                {TRACK_COLORS.map((color, hIdx) => {
                  // hIdx 0 is Row 1 (outermost track), hIdx 9 is Row 10 (innermost track)
                  const innerR = R_IN + (NUM_TRACKS - 1 - hIdx) * TRACK_H;
                  const outerR = innerR + TRACK_H;
                  const rMid = (innerR + outerR) / 2;
                  const pos = polarToCartesian(CX, CY, rMid, midAngle);
                  const pathD = describeSector(CX, CY, innerR, outerR, startAngle, endAngle);
                  const isChecked = Boolean(state.checks[`${hIdx}-${dayNum}`]);

                  return (
                    <g
                      key={`cell-${hIdx}-${dayNum}`}
                      className="cursor-pointer group"
                      onClick={() => handleWheelCellClick(hIdx, dayNum)}
                    >
                      {/* Cell Sector Path */}
                      <path
                        d={pathD}
                        fill={color}
                        stroke="#3a3a3a"
                        strokeWidth="0.8"
                        className="transition-opacity duration-150 hover:opacity-85"
                      />

                      {/* Checkmark in cell */}
                      {isChecked && (
                        <g
                          transform={`translate(${pos.x}, ${pos.y}) rotate(${midAngle + 90})`}
                          className="pointer-events-none"
                        >
                          <path
                            d="M -4.2 -0.8 L -1.2 3.8 L 5.2 -4.8"
                            fill="none"
                            stroke={inkColor}
                            strokeWidth="1.9"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            filter="url(#ink-bleed)"
                          />
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Boundary line at the end of the last day */}
          {(() => {
            const endAngle = -90 + TOTAL_DAYS * DEG_PER_DAY;
            const pInner = polarToCartesian(CX, CY, R_IN, endAngle);
            const pOuter = polarToCartesian(CX, CY, R_HEADER, endAngle);
            return (
              <line
                x1={pInner.x}
                y1={pInner.y}
                x2={pOuter.x}
                y2={pOuter.y}
                stroke="#3a3a3a"
                strokeWidth="1.2"
              />
            );
          })()}

          {/* The Inner Circle Arc (Hole border) */}
          <path
            d={`M 390 ${CY - R_IN} A ${R_IN} ${R_IN} 0 1 1 ${
              polarToCartesian(CX, CY, R_IN, -90 + TOTAL_DAYS * DEG_PER_DAY).x
            } ${
              polarToCartesian(CX, CY, R_IN, -90 + TOTAL_DAYS * DEG_PER_DAY).y
            }`}
            fill="none"
            stroke="#3a3a3a"
            strokeWidth="1"
          />
        </g>

        {/* ============================================================== */}
        {/* 7. NOTES FAN RAYS (Radiating from R_IN outwards)                */}
        {/* ============================================================== */}
        <g id="notes-fan-rays">
          {/* Continuation of rays from end of last day towards 180° */}
          {Array.from({ length: 8 }, (_, idx) => {
            const rayAngle = -90 + TOTAL_DAYS * DEG_PER_DAY + (idx + 1) * DEG_PER_DAY;
            if (rayAngle > 185) return null;
            const pStart = polarToCartesian(CX, CY, R_IN, rayAngle);
            // Staggered outward reach
            const rayLength = idx === 0 ? 250 : idx === 1 ? 230 : idx === 2 ? 210 : idx === 3 ? 190 : 170;
            const pEnd = polarToCartesian(CX, CY, R_IN + rayLength, rayAngle);

            return (
              <line
                key={`fan-ray-${idx}`}
                x1={pStart.x}
                y1={pStart.y}
                x2={pEnd.x}
                y2={pEnd.y}
                stroke="#666666"
                strokeWidth="0.9"
              />
            );
          })}
        </g>

        {/* ============================================================== */}
        {/* 8. "month:" SECTION                                            */}
        {/* ============================================================== */}
        <g id="month-section" transform="translate(68, 642)">
          <text
            x="0"
            y="0"
            fontSize="15"
            fontFamily="'Inter', sans-serif"
            fontWeight="500"
            fill="#2c2c2c"
          >
            month:
          </text>
          {/* Ruled underline */}
          <line x1="56" y1="5" x2="250" y2="5" stroke="#666666" strokeWidth="0.9" />

          {/* Month input / display */}
          <foreignObject x="58" y="-18" width="190" height="26">
            <input
              type="text"
              value={state.month}
              onChange={(e) => setState({ ...state, month: e.target.value })}
              className="w-full h-full bg-transparent border-0 outline-none px-1 text-sm leading-none"
              style={{
                color: inkColor,
                fontFamily: fontStyle === 'handwriting' ? "'Caveat', cursive" : "'Inter', sans-serif",
                fontSize: fontStyle === 'handwriting' ? '28px' : '15px',
                fontWeight: fontStyle === 'handwriting' ? '700' : '600',
              }}
            />
          </foreignObject>
        </g>

        {/* ============================================================== */}
        {/* 9. "My notes:" SECTION                                         */}
        {/* ============================================================== */}
        <g id="my-notes-section" transform="translate(70, 725)">
          <text
            x="0"
            y="0"
            fontSize="26"
            fontFamily="'Caveat', cursive"
            fontWeight="700"
            fill={inkColor}
            style={{ transform: 'rotate(-4deg)' }}
          >
            My notes:
          </text>
          {/* Note input area on the fan */}
          <foreignObject x="0" y="5" width="220" height="70">
            <textarea
              value={state.notes.myNotes}
              onChange={(e) =>
                setState({
                  ...state,
                  notes: { ...state.notes, myNotes: e.target.value },
                })
              }
              placeholder="Write personal reflections..."
              className="w-full h-full bg-transparent border-0 outline-none resize-none text-xs leading-relaxed"
              style={{
                color: inkColor,
                fontFamily: fontStyle === 'handwriting' ? "'Caveat', cursive" : "'Inter', sans-serif",
                fontSize: fontStyle === 'handwriting' ? '19px' : '12px',
              }}
            />
          </foreignObject>
        </g>

        {/* ============================================================== */}
        {/* 10. BOTTOM-LEFT NOTES LINES                                    */}
        {/* ============================================================== */}
        <g id="bottom-left-notes">
          {[
            { y: 864, x2: 76 },
            { y: 890, x2: 98 },
            { y: 916, x2: 138 },
            { y: 942, x2: 168 },
            { y: 968, x2: 204 },
          ].map((line, idx) => (
            <g key={`bottom-left-line-${idx}`}>
              <line
                x1="58"
                y1={line.y}
                x2={line.x2}
                y2={line.y}
                stroke="#666666"
                strokeWidth="0.9"
              />
              <foreignObject
                x="58"
                y={line.y - 18}
                width={line.x2 - 58}
                height="19"
              >
                <input
                  type="text"
                  value={state.notes.bottomLeft[idx] || ''}
                  onChange={(e) => {
                    const notes = [...state.notes.bottomLeft];
                    notes[idx] = e.target.value;
                    setState({ ...state, notes: { ...state.notes, bottomLeft: notes } });
                  }}
                  className="w-full h-full bg-transparent border-0 outline-none text-xs leading-none"
                  style={{
                    color: inkColor,
                    fontFamily: fontStyle === 'handwriting' ? "'Caveat', cursive" : "'Inter', sans-serif",
                    fontSize: fontStyle === 'handwriting' ? '17px' : '11px',
                  }}
                />
              </foreignObject>
            </g>
          ))}
        </g>

        {/* ============================================================== */}
        {/* 11. BOTTOM-RIGHT NOTES LINES                                   */}
        {/* ============================================================== */}
        <g id="bottom-right-notes">
          {[
            { y: 864, x1: 678 },
            { y: 890, x1: 648 },
            { y: 916, x1: 618 },
            { y: 942, x1: 588 },
            { y: 968, x1: 588 },
          ].map((line, idx) => (
            <g key={`bottom-right-line-${idx}`}>
              <line
                x1={line.x1}
                y1={line.y}
                x2="722"
                y2={line.y}
                stroke="#666666"
                strokeWidth="0.9"
              />
              <foreignObject
                x={line.x1}
                y={line.y - 18}
                width={722 - line.x1}
                height="19"
              >
                <input
                  type="text"
                  value={state.notes.bottomRight[idx] || ''}
                  onChange={(e) => {
                    const notes = [...state.notes.bottomRight];
                    notes[idx] = e.target.value;
                    setState({ ...state, notes: { ...state.notes, bottomRight: notes } });
                  }}
                  className="w-full h-full bg-transparent border-0 outline-none px-1 text-xs leading-none"
                  style={{
                    color: inkColor,
                    fontFamily: fontStyle === 'handwriting' ? "'Caveat', cursive" : "'Inter', sans-serif",
                    fontSize: fontStyle === 'handwriting' ? '17px' : '11px',
                  }}
                />
              </foreignObject>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
