/* ============================================================
   HabitPro — app.js  |  Production Build v2
   Vanilla JS, no frameworks, no build tools
   ============================================================ */

'use strict';

// ── GLOBAL STATE ───────────────────────────────────────────
const APP = {
  user: null,
  habits: [],
  logs: {},
  tasks: [],
  journal: [],
  settings: { accentColor: '#7c6aff' },
  xp: 0,
  level: 1,
  currentPage: 'dashboard',
  trackerDate: _todayStr(),
  calendarMonth: new Date(),
  schedTab: 'all',
  charts: {},
  editingJournalId: null,
  taskOrder: [],       // custom drag order (array of task IDs)
};

const QUOTES = [
  { text: "Small daily improvements are the key to staggering long-term results.", author: "Robert Collier" },
  { text: "You don't rise to the level of your goals, you fall to the level of your systems.", author: "James Clear" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "A year from now you may wish you had started today.", author: "Karen Lamb" },
  { text: "Success is the product of daily habits — not once-in-a-lifetime transformations.", author: "James Clear" },
  { text: "Habits are the compound interest of self-improvement.", author: "James Clear" },
  { text: "The chains of habit are too light to be felt until they are too heavy to be broken.", author: "Warren Buffett" },
];

const LEVEL_NAMES = ['Beginner','Apprentice','Practitioner','Expert','Master','Legend','Champion','Grandmaster','Elite','Transcendent'];

// ── EXPANDED ACHIEVEMENTS ─────────────────────────────────
const ACHIEVEMENTS = [
  // Habit creation
  { id: 'first_habit',    icon: '🌱', name: 'First Step',        desc: 'Create your first habit',             xp: 20,  cat: 'Habits',       check: () => APP.habits.length >= 1 },
  { id: 'five_habits',    icon: '🌿', name: 'Habit Builder',     desc: 'Create 5 habits',                     xp: 50,  cat: 'Habits',       check: () => APP.habits.length >= 5,  progress: () => [APP.habits.length, 5] },
  { id: 'ten_habits',     icon: '🌳', name: 'Habit Forest',      desc: 'Create 10 habits',                    xp: 100, cat: 'Habits',       check: () => APP.habits.length >= 10, progress: () => [APP.habits.length, 10] },
  { id: 'fifteen_habits', icon: '🏕️', name: 'Habit Village',    desc: 'Create 15 habits',                    xp: 150, cat: 'Habits',       check: () => APP.habits.length >= 15, progress: () => [APP.habits.length, 15] },
  { id: 'twentyfive_habits',icon:'🌲',name: 'Habit City',        desc: 'Create 25 habits',                    xp: 250, cat: 'Habits',       check: () => APP.habits.length >= 25, progress: () => [APP.habits.length, 25] },
  { id: 'fifty_habits',   icon: '🌍', name: 'Habit World',       desc: 'Create 50 habits',                    xp: 500, cat: 'Habits',       check: () => APP.habits.length >= 50, progress: () => [APP.habits.length, 50] },
  // Tasks
  { id: 'first_task',     icon: '✅', name: 'Task Starter',      desc: 'Complete your first task',             xp: 20,  cat: 'Tasks',        check: () => APP.tasks.some(t => t.done) },
  { id: 'ten_tasks',      icon: '📋', name: 'Task Master',       desc: 'Complete 10 tasks',                   xp: 60,  cat: 'Tasks',        check: () => APP.tasks.filter(t => t.done).length >= 10,  progress: () => [APP.tasks.filter(t=>t.done).length, 10] },
  { id: 'twentyfive_tasks',icon:'📌', name: 'Task Hunter',       desc: 'Complete 25 tasks',                   xp: 120, cat: 'Tasks',        check: () => APP.tasks.filter(t => t.done).length >= 25,  progress: () => [APP.tasks.filter(t=>t.done).length, 25] },
  { id: 'hundred_tasks',  icon: '💼', name: 'Century Doer',      desc: 'Complete 100 tasks',                  xp: 400, cat: 'Tasks',        check: () => APP.tasks.filter(t => t.done).length >= 100, progress: () => [APP.tasks.filter(t=>t.done).length, 100] },
  { id: 'fivehundred_tasks',icon:'🚀',name: 'Task Machine',      desc: 'Complete 500 tasks',                  xp: 1000,cat: 'Tasks',        check: () => APP.tasks.filter(t => t.done).length >= 500, progress: () => [APP.tasks.filter(t=>t.done).length, 500] },
  // Journal
  { id: 'first_journal',  icon: '✍️', name: 'Journalist',        desc: 'Write your first journal entry',      xp: 30,  cat: 'Journal',      check: () => APP.journal.length >= 1 },
  { id: 'five_journal',   icon: '📖', name: 'Storyteller',       desc: 'Write 5 journal entries',             xp: 80,  cat: 'Journal',      check: () => APP.journal.length >= 5,   progress: () => [APP.journal.length, 5] },
  { id: 'ten_journal',    icon: '📝', name: 'Chronicler',        desc: 'Write 10 journal entries',            xp: 150, cat: 'Journal',      check: () => APP.journal.length >= 10,  progress: () => [APP.journal.length, 10] },
  { id: 'fifty_journal',  icon: '📚', name: 'Author',            desc: 'Write 50 journal entries',            xp: 400, cat: 'Journal',      check: () => APP.journal.length >= 50,  progress: () => [APP.journal.length, 50] },
  { id: 'hundred_journal',icon: '🖊️', name: 'Sage',              desc: 'Write 100 journal entries',           xp: 800, cat: 'Journal',      check: () => APP.journal.length >= 100, progress: () => [APP.journal.length, 100] },
  // Streaks
  { id: 'streak_3',       icon: '🔥', name: '3-Day Streak',      desc: 'Complete habits 3 days in a row',     xp: 30,  cat: 'Streaks',      check: () => _calcStreak() >= 3,   progress: () => [_calcStreak(), 3] },
  { id: 'week_streak',    icon: '🔥', name: '7-Day Streak',      desc: 'Complete habits 7 days in a row',     xp: 120, cat: 'Streaks',      check: () => _calcStreak() >= 7,   progress: () => [_calcStreak(), 7] },
  { id: 'streak_14',      icon: '🌡️', name: '14-Day Streak',     desc: 'Complete habits 14 days in a row',    xp: 200, cat: 'Streaks',      check: () => _calcStreak() >= 14,  progress: () => [_calcStreak(), 14] },
  { id: 'month_streak',   icon: '🏆', name: 'Month Master',      desc: 'Complete habits 30 days in a row',    xp: 500, cat: 'Streaks',      check: () => _calcStreak() >= 30,  progress: () => [_calcStreak(), 30] },
  { id: 'streak_50',      icon: '💫', name: '50-Day Streak',     desc: 'Complete habits 50 days in a row',    xp: 800, cat: 'Streaks',      check: () => _calcStreak() >= 50,  progress: () => [_calcStreak(), 50] },
  { id: 'streak_100',     icon: '🌠', name: '100-Day Streak',    desc: 'Complete habits 100 days in a row',   xp: 1500,cat: 'Streaks',      check: () => _calcStreak() >= 100, progress: () => [_calcStreak(), 100] },
  { id: 'streak_365',     icon: '🏅', name: 'Year Warrior',      desc: 'Complete habits 365 days in a row',   xp: 5000,cat: 'Streaks',      check: () => _calcStreak() >= 365, progress: () => [_calcStreak(), 365] },
  // Perfect days / consistency
  { id: 'perfect_day',    icon: '💎', name: 'Perfect Day',       desc: 'Complete all habits in a day',        xp: 50,  cat: 'Consistency',  check: () => _hadPerfectDay() },
  { id: 'perfect_week',   icon: '🌈', name: 'Perfect Week',      desc: 'Complete all habits 7 days straight',  xp: 300, cat: 'Consistency',  check: () => _calcPerfectDaysStreak() >= 7,  progress: () => [_calcPerfectDaysStreak(), 7] },
  { id: 'perfect_month',  icon: '🌟', name: 'Perfect Month',     desc: 'Complete all habits 30 days straight', xp: 1200,cat: 'Consistency',  check: () => _calcPerfectDaysStreak() >= 30, progress: () => [_calcPerfectDaysStreak(), 30] },
  { id: 'perfect_90',     icon: '🔮', name: 'Perfect Quarter',   desc: 'Complete all habits 90 days straight', xp: 3000,cat: 'Consistency',  check: () => _calcPerfectDaysStreak() >= 90, progress: () => [_calcPerfectDaysStreak(), 90] },
  // Levels
  { id: 'level5',         icon: '⭐', name: 'Rising Star',       desc: 'Reach level 5',                       xp: 0,   cat: 'Levels',       check: () => APP.level >= 5,  progress: () => [APP.level, 5] },
  { id: 'level10',        icon: '🌟', name: 'Veteran',           desc: 'Reach level 10',                      xp: 0,   cat: 'Levels',       check: () => APP.level >= 10, progress: () => [APP.level, 10] },
  { id: 'level15',        icon: '💡', name: 'Practitioner',      desc: 'Reach level 15',                      xp: 0,   cat: 'Levels',       check: () => APP.level >= 15, progress: () => [APP.level, 15] },
  { id: 'level25',        icon: '🎯', name: 'Expert',            desc: 'Reach level 25',                      xp: 0,   cat: 'Levels',       check: () => APP.level >= 25, progress: () => [APP.level, 25] },
  { id: 'level50',        icon: '👑', name: 'Grandmaster',       desc: 'Reach level 50',                      xp: 0,   cat: 'Levels',       check: () => APP.level >= 50, progress: () => [APP.level, 50] },
  // Special
  { id: 'early_bird',     icon: '🌅', name: 'Early Bird',        desc: 'Complete a habit before 7 AM',         xp: 80,  cat: 'Special',      check: () => _isEarlyBird() },
  { id: 'night_owl',      icon: '🦉', name: 'Night Owl',         desc: 'Complete a habit after 10 PM',         xp: 80,  cat: 'Special',      check: () => _isNightOwl() },
  { id: 'productivity_beast',icon:'⚡',name:'Productivity Beast', desc: 'Complete 5 different habits in a day',  xp: 150, cat: 'Special',      check: () => _productivityBeast() },
  { id: 'focus_master',   icon: '🧘', name: 'Focus Master',      desc: 'Log a time goal habit for 30+ min',    xp: 120, cat: 'Special',      check: () => _focusMaster() },
  { id: 'habit_machine',  icon: '⚙️', name: 'Habit Machine',     desc: 'Log all habits for 14 days in a row',  xp: 300, cat: 'Special',      check: () => _calcStreak() >= 14 },
  { id: 'discipline_titan',icon:'🗿', name: 'Discipline Titan',  desc: 'Reach a 50-day streak',                xp: 800, cat: 'Special',      check: () => _calcStreak() >= 50 },
  { id: 'legendary_human',icon: '🧬', name: 'Legendary Human',   desc: 'Reach a 100-day streak',               xp: 2000,cat: 'Special',      check: () => _calcStreak() >= 100 },
];

// ── UTILS ──────────────────────────────────────────────────
/** Local calendar date as YYYY-MM-DD (avoids UTC off-by-one bugs) */
function _localDateStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function _todayStr() {
  return _localDateStr(new Date());
}

function _parseDateStr(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Compare YYYY-MM-DD strings: -1 if a<b, 0 if equal, 1 if a>b */
function _cmpDate(a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function _uid() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2);
}
function _el(id) { return document.getElementById(id); }
function _clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

function _dateAdd(dateStr, days) {
  const d = _parseDateStr(dateStr);
  d.setDate(d.getDate() + days);
  return _localDateStr(d);
}

function _fmtDate(dateStr) {
  if (!dateStr) return '';
  return _parseDateStr(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function _calcStreak() {
  if (!APP.habits.length) return 0;
  let streak = 0;
  let d = _todayStr();
  for (let i = 0; i < 400; i++) {
    const log = APP.logs[d] || {};
    const total = APP.habits.length;
    const done = APP.habits.filter(h => _isHabitDone(h, log)).length;
    if (total > 0 && done === total) {
      streak++;
      d = _dateAdd(d, -1);
    } else if (i === 0) {
      d = _dateAdd(d, -1);
    } else {
      break;
    }
  }
  return streak;
}

function _calcLongestStreak() {
  if (!APP.habits.length) return 0;
  const sortedDates = Object.keys(APP.logs).sort();
  let longest = 0, cur = 0;
  for (let i = 0; i < sortedDates.length; i++) {
    const log = APP.logs[sortedDates[i]] || {};
    const done = APP.habits.filter(h => _isHabitDone(h, log)).length;
    if (APP.habits.length > 0 && done === APP.habits.length) {
      cur++;
      longest = Math.max(longest, cur);
    } else {
      cur = 0;
    }
  }
  return longest;
}

function _calcMonthlyRate() {
  if (!APP.habits.length) return 0;
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  let total = 0, done = 0;
  for (let i = 1; i <= Math.min(daysInMonth, now.getDate()); i++) {
    const dStr = `${y}-${String(m+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
    const log = APP.logs[dStr] || {};
    APP.habits.forEach(h => {
      total++;
      if (_isHabitDone(h, log)) done++;
    });
  }
  return total ? Math.round((done / total) * 100) : 0;
}

function _hadPerfectDay() {
  if (!APP.habits.length) return false;
  return Object.values(APP.logs).some(log => {
    return APP.habits.every(h => _isHabitDone(h, log));
  });
}

function _calcPerfectDaysStreak() {
  if (!APP.habits.length) return 0;
  let streak = 0;
  let d = _todayStr();
  for (let i = 0; i < 400; i++) {
    const log = APP.logs[d] || {};
    const done = APP.habits.filter(h => _isHabitDone(h, log)).length;
    if (done === APP.habits.length) {
      streak++;
      d = _dateAdd(d, -1);
    } else if (i === 0) {
      d = _dateAdd(d, -1);
    } else {
      break;
    }
  }
  return streak;
}

function _isEarlyBird() {
  // Check if any habit log was completed — this is approximated by checking if logs exist for days
  // We track via special early/late flag in log if available
  return Object.values(APP.logs).some(log => log._earlyBird);
}

function _isNightOwl() {
  return Object.values(APP.logs).some(log => log._nightOwl);
}

function _productivityBeast() {
  return Object.values(APP.logs).some(log => {
    const doneCount = APP.habits.filter(h => _isHabitDone(h, log)).length;
    return doneCount >= 5;
  });
}

function _focusMaster() {
  // Check if any time-goal habit has >= 30 minutes logged
  return Object.values(APP.logs).some(log => {
    return APP.habits.some(h => {
      if (h.type !== 'time') return false;
      const entry = log[h._id];
      return entry && (entry.value || 0) >= 30;
    });
  });
}

// ── HABIT COMPLETION SYSTEM (centralized) ───────────────────
const XP_HABIT_COMPLETE = 10;
const XP_HABIT_UNDO = 5;

/** Normalize habit type */
function _habitType(habit) {
  return habit.type || 'checkbox';
}

/** Goal target for numeric/time habits */
function _habitTarget(habit) {
  if (_habitType(habit) === 'numeric') return Math.max(1, habit.goalValue || 1);
  if (_habitType(habit) === 'time') return Math.max(1, habit.goalMinutes || 1);
  return 1;
}

/** Ensure daily log object exists */
function _ensureDayLog(dateStr) {
  if (!APP.logs[dateStr]) APP.logs[dateStr] = {};
  return APP.logs[dateStr];
}

/** Get habit log entry for a date */
function _getHabitEntry(dateStr, habitId) {
  return (APP.logs[dateStr] || {})[habitId] || {};
}

/**
 * calculateHabitCompletion — single source of truth for done/progress
 */
function calculateHabitCompletion(habit, entry) {
  if (!habit) return { done: false, value: 0, target: 1, pct: 0 };
  const type = _habitType(habit);
  const target = _habitTarget(habit);

  if (type === 'checkbox') {
    const done = !!(entry && entry.done);
    return { done, value: done ? 1 : 0, target: 1, pct: done ? 100 : 0 };
  }

  const value = Math.max(0, Number(entry?.value) || 0);
  const done = value >= target;
  const pct = target ? Math.min(100, Math.round((value / target) * 100)) : 0;
  return { done, value, target, pct };
}

/** Check if habit is done for a day's log map */
function _isHabitDone(habit, log) {
  if (!habit || !log) return false;
  return calculateHabitCompletion(habit, log[habit._id]).done;
}

/** Clamp progress value (no negatives; cap at target unless allowOver) */
function _clampProgressValue(habit, value, allowOver = false) {
  const v = Math.max(0, Math.round(Number(value) || 0));
  if (allowOver) return v;
  return Math.min(v, _habitTarget(habit));
}

/**
 * awardXP — habit completion XP only once per habit/day (xpAwarded on entry)
 */
function _applyHabitXpTransition(habitId, dateStr, wasDone, isDone) {
  const entry = _ensureDayLog(dateStr)[habitId] || {};
  if (isDone && !wasDone) {
    if (!entry.xpAwarded) {
      addXP(XP_HABIT_COMPLETE);
      entry.xpAwarded = true;
      entry.completedAt = new Date().toISOString();
      const hr = new Date().getHours();
      if (hr < 7) APP.logs[dateStr]._earlyBird = true;
      if (hr >= 22) APP.logs[dateStr]._nightOwl = true;
    }
  } else if (!isDone && wasDone && entry.xpAwarded) {
    addXP(-XP_HABIT_UNDO);
    entry.xpAwarded = false;
    delete entry.completedAt;
  }
  _ensureDayLog(dateStr)[habitId] = entry;
}

/** Refresh visible pages after habit data changes */
function _refreshAfterHabitChange(focusHabitId = null) {
  if (APP.currentPage === 'tracker') {
    renderTracker();
    if (focusHabitId) {
      const input = _el('tracker-list')?.querySelector(`.tracker-progress-input[data-hid="${focusHabitId}"]`);
      if (input) {
        input.focus();
        const len = String(input.value).length;
        try { input.setSelectionRange(len, len); } catch (e) {}
      }
    }
  }
  if (APP.currentPage === 'dashboard') renderDashboard();
  if (APP.currentPage === 'calendar') renderCalendar();
  validateAchievementUnlock(true);
}

/**
 * markHabitComplete — checkbox habits only; no-op if state unchanged
 */
async function markHabitComplete(habitId, dateStr, complete) {
  const habit = APP.habits.find(h => h._id === habitId);
  if (!habit || _habitType(habit) !== 'checkbox') return;

  const log = _ensureDayLog(dateStr);
  const prev = log[habitId] || {};
  const wasDone = !!prev.done;
  if (wasDone === complete) return;

  log[habitId] = { ...prev, done: complete };
  _applyHabitXpTransition(habitId, dateStr, wasDone, complete);
  await _saveLog(dateStr);
  _refreshAfterHabitChange();
  if (complete) showToast('✓ ' + habit.name, 'xp', 1500);
}

/**
 * updateHabitProgress — numeric & time habits (+/- / manual input)
 */
async function updateHabitProgress(habitId, dateStr, newValue, options = {}) {
  const habit = APP.habits.find(h => h._id === habitId);
  if (!habit) return;
  const type = _habitType(habit);
  if (type !== 'numeric' && type !== 'time') return;

  const log = _ensureDayLog(dateStr);
  const prevEntry = { ...(log[habitId] || {}) };
  const wasDone = calculateHabitCompletion(habit, prevEntry).done;

  const value = _clampProgressValue(habit, newValue, options.allowOver);
  const entry = { ...prevEntry, value };
  delete entry.done;
  log[habitId] = entry;

  const isDone = calculateHabitCompletion(habit, entry).done;
  _applyHabitXpTransition(habitId, dateStr, wasDone, isDone);

  await _saveLog(dateStr);

  if (isDone && !wasDone) showToast('✓ ' + habit.name + ' goal reached!', 'xp', 1800);
  _refreshAfterHabitChange(habitId);
}

/** Step progress by delta (+1, +5, etc.) */
async function adjustHabitProgress(habitId, dateStr, delta) {
  const habit = APP.habits.find(h => h._id === habitId);
  if (!habit) return;
  const entry = _getHabitEntry(dateStr, habitId);
  const cur = entry.value || 0;
  await updateHabitProgress(habitId, dateStr, cur + delta);
}

function _habitCompletionRate(habitId, days = 30) {
  const habit = APP.habits.find(h => h._id === habitId);
  if (!habit) return 0;
  let total = 0, done = 0;
  for (let i = 0; i < days; i++) {
    const d = _dateAdd(_todayStr(), -i);
    total++;
    const log = APP.logs[d] || {};
    if (_isHabitDone(habit, log)) done++;
  }
  return total ? Math.round((done / total) * 100) : 0;
}

// ── TOAST ─────────────────────────────────────────────────
function showToast(msg, type = '', duration = 2800) {
  const wrap = _el('toast-wrap');
  if (!wrap) return;
  const t = document.createElement('div');
  t.className = 'toast' + (type ? ' ' + type : '');
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transition = 'opacity .4s';
    setTimeout(() => t.remove(), 400);
  }, duration);
}

// ── XP & LEVELS ────────────────────────────────────────────
function addXP(amount) {
  APP.xp += amount;
  if (APP.xp < 0) APP.xp = 0;

  let leveled = false;
  while (APP.xp >= 100) {
    APP.xp -= 100;
    APP.level++;
    leveled = true;
  }

  if (leveled) {
    const banner = document.createElement('div');
    banner.className = 'levelup-banner';
    banner.textContent = `🎉 Level Up! You are now Level ${APP.level} — ${_levelName()}`;
    document.body.appendChild(banner);
    setTimeout(() => {
      banner.style.opacity = '0';
      banner.style.transition = 'opacity .5s';
      setTimeout(() => banner.remove(), 500);
    }, 3000);
    validateAchievementUnlock(true);
  }

  updateXPUI();
  _saveSettings();
}

function _levelName() {
  return LEVEL_NAMES[Math.min(APP.level - 1, LEVEL_NAMES.length - 1)] || 'Legend';
}

function updateXPUI() {
  const pct = APP.xp + '%';
  const lbl = 'Level ' + APP.level;
  const xpLbl = APP.xp + ' / 100 XP';

  const els = {
    'user-level-label': lbl,
    'user-xp-label': xpLbl,
    'level-badge': 'Lv.' + APP.level,
    'level-name': _levelName(),
    'level-xp-display': xpLbl,
  };
  Object.entries(els).forEach(([id, val]) => {
    const el = _el(id);
    if (el) el.textContent = val;
  });

  ['xp-fill', 'xp-fill-big'].forEach(id => {
    const el = _el(id);
    if (el) el.style.width = pct;
  });
}

// ── ACHIEVEMENTS ────────────────────────────────────────────
const _unlockedAch = new Set();

function _loadUnlockedAchievements(ids) {
  _unlockedAch.clear();
  if (Array.isArray(ids)) ids.forEach(id => _unlockedAch.add(id));
}

/** Persist unlocked achievements to settings (Firebase + localStorage) */
function _persistUnlockedAchievements() {
  _saveSettings();
}

/**
 * validateAchievementUnlock — only unlock when condition met; never duplicate
 */
function validateAchievementUnlock(showToasts = false) {
  const newly = [];
  ACHIEVEMENTS.forEach(ach => {
    if (_unlockedAch.has(ach.id)) return;
    try {
      if (!ach.check()) return;
    } catch (e) {
      return;
    }
    _unlockedAch.add(ach.id);
    newly.push(ach);
  });

  if (newly.length) {
    _persistUnlockedAchievements();
    if (showToasts) {
      newly.forEach(ach => {
        showToast(`${ach.icon} Achievement Unlocked: ${ach.name}!`, 'xp', 4000);
        if (ach.xp > 0) addXP(ach.xp);
      });
    }
  }
}

function checkAchievements(showToasts = false) {
  validateAchievementUnlock(showToasts);
}

// ── ACCENT COLOR ────────────────────────────────────────────
function applyAccentColor(hex) {
  if (!hex) return;
  document.documentElement.style.setProperty('--accent', hex);
  document.documentElement.style.setProperty('--accent-dim', hex + '22');
  document.documentElement.style.setProperty('--accent-glow', hex + '55');
  APP.settings.accentColor = hex;
}

// ── PERSISTENT SESSION ──────────────────────────────────────
const SESSION_KEY = 'habitpro_session';

function _saveSession(email) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email, ts: Date.now() }));
  } catch (e) {}
}

function _loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    const email = s.email || s.username || null;
    if (!email || (Date.now() - s.ts) > 90 * 24 * 3600 * 1000) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return email.trim().toLowerCase();
  } catch (e) {
    return null;
  }
}

function _clearSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
}

// ── DATA LAYER ──────────────────────────────────────────────
async function _loadAllData() {
  const u = APP.user;
  const [habits, tasks, journal, logsArr, setsArr] = await Promise.all([
    loadFromFirestore(u, 'habits'),
    loadFromFirestore(u, 'tasks'),
    loadFromFirestore(u, 'journal'),
    loadFromFirestore(u, 'logs'),
    loadFromFirestore(u, 'settings'),
  ]);

  APP.habits  = habits  || [];
  APP.tasks   = tasks   || [];
  APP.journal = journal || [];

  APP.logs = {};
  (logsArr || []).forEach(doc => {
    if (doc._id && doc.data) APP.logs[doc._id] = doc.data;
  });

  if (setsArr && setsArr.length > 0) {
    const s = setsArr[0];
    if (s.accentColor) APP.settings.accentColor = s.accentColor;
    APP.xp    = typeof s.xp    === 'number' ? s.xp    : 0;
    APP.level = typeof s.level === 'number' ? s.level : 1;
    if (Array.isArray(s.taskOrder)) APP.taskOrder = s.taskOrder;
    if (Array.isArray(s.unlockedAchievements)) _loadUnlockedAchievements(s.unlockedAchievements);
  }

  applyAccentColor(APP.settings.accentColor);
  updateXPUI();
  validateAchievementUnlock(false);
}

async function _save(collection, docId, data) {
  if (!APP.user) return;
  await saveToFirestore(APP.user, collection, docId, data);
}

async function _delete(collection, docId) {
  if (!APP.user) return;
  await deleteFromFirestore(APP.user, collection, docId);
}

async function _saveLog(dateStr) {
  const data = APP.logs[dateStr] || {};
  await _save('logs', dateStr, { data });
}

async function _saveSettings() {
  await _save('settings', 'main', {
    accentColor: APP.settings.accentColor,
    xp: APP.xp,
    level: APP.level,
    taskOrder: APP.taskOrder,
    unlockedAchievements: [..._unlockedAch],
  });
}

// ── AUTH FLOW ───────────────────────────────────────────────
async function initApp() {
  const email = _loadSession();

  if (email) {
    APP.user = email;
    await _loadAllData();
    _showApp(email);
    navigateTo('dashboard');
  } else {
    _showAuth();
  }
}

function _showAuth() {
  _el('auth-screen').classList.remove('hidden');
}

function _showApp(email) {
  _el('auth-screen').classList.add('hidden');
  _el('app').classList.remove('hidden');
  const uEls = ['sidebar-email', 'settings-email'];
  uEls.forEach(id => { const e = _el(id); if (e) e.textContent = email; });
  _updateSettingsStats();
}

async function handleLogin() {
  const btn = _el('btn-login');
  const email = (_el('login-email').value || '').trim();
  const pass = _el('login-password').value || '';
  const errEl = _el('login-error');
  errEl.classList.add('hidden');

  if (!email || !pass) {
    errEl.textContent = 'Please fill in both fields.';
    errEl.classList.remove('hidden');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Signing in…';

  try {
    const res = await loginUser(email, pass);
    if (!res.success) {
      errEl.textContent = res.error;
      errEl.classList.remove('hidden');
      btn.disabled = false;
      btn.textContent = 'Sign In';
      return;
    }

    APP.user = res.email || email.trim().toLowerCase();
    _saveSession(APP.user);
    await _loadAllData();
    _el('auth-screen').classList.add('hidden');
    _showApp(APP.user);
    navigateTo('dashboard');
  } catch (e) {
    errEl.textContent = 'An error occurred. Please try again.';
    errEl.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
}

async function handleSignup() {
  const btn = _el('btn-signup');
  const email = (_el('signup-email').value || '').trim();
  const pass = _el('signup-password').value || '';
  const conf = _el('signup-confirm').value || '';
  const errEl = _el('signup-error');
  errEl.classList.add('hidden');

  if (pass !== conf) {
    errEl.textContent = 'Passwords do not match.';
    errEl.classList.remove('hidden');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Creating…';

  try {
    const res = await registerUser(email, pass);
    if (!res.success) {
      errEl.textContent = res.error;
      errEl.classList.remove('hidden');
      btn.disabled = false;
      btn.textContent = 'Create Account';
      return;
    }

    const normalized = res.email || email.trim().toLowerCase();
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-panel').forEach(p => p.classList.add('hidden'));
    document.querySelector('.auth-tab[data-tab="login"]').classList.add('active');
    _el('panel-login').classList.remove('hidden');
    _el('login-email').value = normalized;
    _el('login-password').value = '';
    _el('login-password').focus();
    showToast('✅ Account created! Please sign in.', 'success', 3000);
  } catch (e) {
    errEl.textContent = 'Registration failed. Try again.';
    errEl.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Create Account';
  }
}

function handleSignOut() {
  if (!confirm('Sign out of HabitPro?')) return;
  _clearSession();
  APP.user = null;
  APP.habits = []; APP.logs = {}; APP.tasks = []; APP.journal = [];
  APP.xp = 0; APP.level = 1; APP.settings = { accentColor: '#7c6aff' };
  APP.taskOrder = [];
  _unlockedAch.clear();
  _destroyAllCharts();
  _el('app').classList.add('hidden');
  _el('auth-screen').classList.remove('hidden');
  _el('login-email').value = '';
  _el('login-password').value = '';
  document.querySelector('.auth-tab[data-tab="login"]').click();
}

// ── NAVIGATION ──────────────────────────────────────────────
const PAGE_TITLES = {
  dashboard: 'Dashboard', habits: 'My Habits', tracker: 'Today',
  scheduler: 'Scheduler', calendar: 'Calendar', analytics: 'Analytics',
  journal: 'Journal', achievements: 'Achievements', settings: 'Settings'
};

function navigateTo(page) {
  if (!PAGE_TITLES[page]) return;
  APP.currentPage = page;

  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  const target = _el('page-' + page);
  if (target) target.classList.remove('hidden');

  document.querySelectorAll('.nav-item').forEach(i => i.classList.toggle('active', i.dataset.page === page));
  document.querySelectorAll('.bnav-item').forEach(i => i.classList.toggle('active', i.dataset.page === page));

  const titleEl = _el('topbar-title');
  if (titleEl) titleEl.textContent = PAGE_TITLES[page];

  if (window.innerWidth <= 768) {
    _el('sidebar').classList.remove('open');
    _el('sidebar-overlay').classList.remove('visible');
  }

  const renders = {
    dashboard:    renderDashboard,
    habits:       renderHabits,
    tracker:      renderTracker,
    scheduler:    renderScheduler,
    calendar:     renderCalendar,
    analytics:    () => setTimeout(renderAnalytics, 60),
    journal:      renderJournal,
    achievements: renderAchievements,
    settings:     renderSettings,
  };
  if (renders[page]) renders[page]();
}

// ── DASHBOARD ───────────────────────────────────────────────
function renderDashboard() {
  const now = new Date();
  const h = now.getHours();
  let greet = 'Good evening';
  if (h < 12) greet = 'Good morning';
  else if (h < 17) greet = 'Good afternoon';

  const greetEl = _el('dashboard-greeting');
  if (greetEl) greetEl.textContent = greet + ' ✦';

  const dateEl = _el('today-date-label');
  if (dateEl) dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  const qEl = _el('motivational-quote');
  const aEl = _el('quote-author');
  if (qEl) qEl.textContent = q.text;
  if (aEl) aEl.textContent = '— ' + q.author;

  const trackerDate = _todayStr();
  const todayLog = APP.logs[trackerDate] || {};
  const doneCount = APP.habits.filter(hb => _isHabitDone(hb, todayLog)).length;
  const total = APP.habits.length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;

  _setText('stat-streak', _calcStreak());
  _setText('stat-score', pct + '%');
  _setText('stat-longest', _calcLongestStreak());
  _setText('stat-monthly', _calcMonthlyRate() + '%');

  const fillEl = _el('today-progress-fill');
  if (fillEl) fillEl.style.width = pct + '%';
  _setText('today-completion-badge', `${doneCount}/${total}`);

  const listEl = _el('today-habits-list');
  if (listEl) {
    listEl.innerHTML = '';
    if (!total) {
      listEl.innerHTML = `<div class="empty-state"><div class="empty-icon">◈</div><p>No habits yet.</p><button class="btn-primary small" id="dash-add-habit" style="margin-top:10px">Add Habit</button></div>`;
      const addBtn = listEl.querySelector('#dash-add-habit');
      if (addBtn) addBtn.onclick = () => openHabitModal();
    } else {
      APP.habits.forEach(hb => {
        const entry = todayLog[hb._id] || {};
        const comp = calculateHabitCompletion(hb, entry);
        const type = _habitType(hb);
        const item = document.createElement('div');
        item.className = 'habit-mini-item' + (comp.done ? ' done' : '');
        let progressHint = '';
        if (type === 'numeric' || type === 'time') {
          const unit = type === 'time' ? 'min' : (hb.goalUnit || '');
          progressHint = `<div class="habit-mini-progress">${comp.value}/${comp.target} ${unit}</div>`;
        }
        item.innerHTML = `
          <div class="habit-mini-icon" style="background:${hb.color||'var(--accent)'}22;color:${hb.color||'var(--accent)'}">${hb.icon || '◈'}</div>
          <div class="habit-mini-body">
            <div class="habit-mini-name">${_esc(hb.name)}</div>
            ${progressHint}
          </div>
          <div class="habit-mini-check ${comp.done ? 'checked' : ''}" data-role="check">${comp.done ? '✓' : ''}</div>
        `;
        item.addEventListener('click', async () => {
          if (type === 'checkbox') {
            await markHabitComplete(hb._id, trackerDate, !comp.done);
            renderDashboard();
          } else {
            navigateTo('tracker');
          }
        });
        listEl.appendChild(item);
      });
    }
  }

  _renderWeekBars();
}

function _renderWeekBars() {
  const el = _el('week-bars');
  if (!el) return;
  el.innerHTML = '';
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const now = new Date();
  const dow = (now.getDay() + 6) % 7;
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - (dow - (6 - i)));
    const dStr = _localDateStr(d);
    const log = APP.logs[dStr] || {};
    const done = APP.habits.filter(h => _isHabitDone(h, log)).length;
    const total = APP.habits.length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const wrap = document.createElement('div');
    wrap.className = 'week-bar-wrap';
    wrap.innerHTML = `
      <div class="week-bar-bg"><div class="week-bar-fill" style="height:${pct}%"></div></div>
      <div class="week-bar-label">${days[6 - i]}</div>
    `;
    el.appendChild(wrap);
  }
}

function _setText(id, val) {
  const el = _el(id);
  if (el) el.textContent = val;
}

function _esc(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── HABITS ──────────────────────────────────────────────────
let _habitFilter = 'all';
let _categoryFilter = '';

function renderHabits() {
  const grid = _el('habits-grid');
  if (!grid) return;
  grid.innerHTML = '';

  // Sync category filter dropdown with existing habits (for backward compat)
  // (no need to dynamically repopulate — categories are fixed in HTML)

  let habits = APP.habits.slice();
  if (_categoryFilter) habits = habits.filter(h => h.category === _categoryFilter);

  const srch = (_el('global-search')?.value || '').toLowerCase().trim();
  if (srch) habits = habits.filter(h => h.name.toLowerCase().includes(srch));

  if (!habits.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">◈</div><p>${APP.habits.length ? 'No habits match your filter.' : 'No habits yet.'}</p><button class="btn-primary small" style="margin-top:12px" onclick="openHabitModal()">Add Your First Habit</button></div>`;
    return;
  }

  habits.forEach(hb => {
    const cr = _habitCompletionRate(hb._id, 7);
    const card = document.createElement('div');
    card.className = 'habit-card';
    card.style.setProperty('--habit-color', hb.color || 'var(--accent)');

    const typeLabel = hb.type === 'numeric' ? 'Numeric' : hb.type === 'time' ? 'Time Goal' : 'Checkbox';
    let goalStr = '';
    if (hb.type === 'numeric' && hb.goalValue) goalStr = `Goal: ${hb.goalValue} ${hb.goalUnit || ''}`;
    if (hb.type === 'time' && hb.goalMinutes) goalStr = `Goal: ${hb.goalMinutes} min`;
    const notesPreview = hb.notes ? `<div class="habit-notes-preview">📝 ${_esc(hb.notes.slice(0, 80))}${hb.notes.length > 80 ? '…' : ''}</div>` : '';

    card.innerHTML = `
      <div class="habit-card-header">
        <div class="habit-card-icon" style="background:${hb.color||'var(--accent)'}22;color:${hb.color||'var(--accent)'}">${hb.icon || '◈'}</div>
        <div class="habit-card-info">
          <div class="habit-card-name">${_esc(hb.name)}</div>
          <div class="habit-card-cat">${_esc(hb.category || 'General')}</div>
        </div>
        <div class="habit-card-actions">
          <button class="habit-action-btn" data-edit="${hb._id}" title="Edit habit" aria-label="Edit habit">✏️</button>
          <button class="habit-action-btn del" data-del="${hb._id}" title="Delete habit" aria-label="Delete habit">🗑</button>
        </div>
      </div>
      <div class="habit-card-stats">
        <span class="habit-diff-badge ${hb.difficulty || 'medium'}">${hb.difficulty || 'medium'}</span>
        <span class="habit-type-badge">${typeLabel}</span>
        <span class="habit-streak">7d: ${cr}%</span>
      </div>
      ${goalStr ? `<div class="habit-goal-badge">${_esc(goalStr)}</div>` : ''}
      ${notesPreview}
    `;
    card.querySelector('[data-del]').addEventListener('click', e => {
      e.stopPropagation();
      deleteHabit(hb._id);
    });
    card.querySelector('[data-edit]').addEventListener('click', e => {
      e.stopPropagation();
      openHabitModal(hb._id);
    });
    grid.appendChild(card);
  });
}

async function deleteHabit(id) {
  if (!confirm('Delete this habit? All logs for this habit will be lost.')) return;
  APP.habits = APP.habits.filter(h => h._id !== id);
  Object.keys(APP.logs).forEach(d => { delete APP.logs[d][id]; });
  await _delete('habits', id);
  showToast('Habit deleted', '', 2000);
  renderHabits();
  if (APP.currentPage === 'dashboard') renderDashboard();
}

// ── HABIT MODAL ─────────────────────────────────────────────
function openHabitModal(editId) {
  const modal = _el('habit-modal-overlay');
  const title = _el('habit-modal-title');
  const idInput = _el('edit-habit-id');
  const nameInput = _el('habit-name');
  const iconInput = _el('habit-icon');
  const colorInput = _el('habit-color');
  const catInput = _el('habit-category');
  const typeInput = _el('habit-type');
  const notesInput = _el('habit-notes');

  if (editId) {
    const hb = APP.habits.find(h => h._id === editId);
    if (!hb) return;
    if (title) title.textContent = 'Edit Habit';
    if (idInput) idInput.value = editId;
    if (nameInput) nameInput.value = hb.name;
    if (iconInput) iconInput.value = hb.icon || '';
    if (colorInput) colorInput.value = hb.color || '#7c6aff';
    if (catInput) catInput.value = hb.category || 'Health';
    if (typeInput) typeInput.value = hb.type || 'checkbox';
    if (notesInput) notesInput.value = hb.notes || '';
    _el('habit-goal-value') && (_el('habit-goal-value').value = hb.goalValue || '');
    _el('habit-goal-unit') && (_el('habit-goal-unit').value = hb.goalUnit || '');
    _el('habit-goal-minutes') && (_el('habit-goal-minutes').value = hb.goalMinutes || '');
    document.querySelectorAll('.diff-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.diff === (hb.difficulty || 'medium'));
    });
  } else {
    if (title) title.textContent = 'Add Habit';
    if (idInput) idInput.value = '';
    if (nameInput) nameInput.value = '';
    if (iconInput) iconInput.value = '';
    if (colorInput) colorInput.value = APP.settings.accentColor || '#7c6aff';
    if (catInput) catInput.value = 'Health';
    if (typeInput) typeInput.value = 'checkbox';
    if (notesInput) notesInput.value = '';
    _el('habit-goal-value') && (_el('habit-goal-value').value = '');
    _el('habit-goal-unit') && (_el('habit-goal-unit').value = '');
    _el('habit-goal-minutes') && (_el('habit-goal-minutes').value = '');
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.toggle('active', b.dataset.diff === 'medium'));
  }

  _updateHabitTypeUI();
  modal.classList.remove('hidden');
  setTimeout(() => nameInput && nameInput.focus(), 100);
}

function _updateHabitTypeUI() {
  const type = _el('habit-type')?.value || 'checkbox';
  const goalWrap = _el('habit-goal-wrap');
  const numericWrap = _el('habit-numeric-wrap');
  const timeWrap = _el('habit-time-wrap');
  if (!goalWrap) return;
  if (type === 'checkbox') {
    goalWrap.classList.add('hidden');
    numericWrap && numericWrap.classList.add('hidden');
    timeWrap && timeWrap.classList.add('hidden');
  } else if (type === 'numeric') {
    goalWrap.classList.remove('hidden');
    numericWrap && numericWrap.classList.remove('hidden');
    timeWrap && timeWrap.classList.add('hidden');
  } else if (type === 'time') {
    goalWrap.classList.remove('hidden');
    numericWrap && numericWrap.classList.add('hidden');
    timeWrap && timeWrap.classList.remove('hidden');
  }
}

function closeHabitModal() {
  _el('habit-modal-overlay').classList.add('hidden');
}

async function saveHabit() {
  const name = (_el('habit-name')?.value || '').trim();
  if (!name) { showToast('Please enter a habit name.', 'error'); return; }

  const editId = _el('edit-habit-id')?.value;
  const diff = document.querySelector('.diff-btn.active')?.dataset.diff || 'medium';
  const type = _el('habit-type')?.value || 'checkbox';

  const hbData = {
    name,
    icon: _el('habit-icon')?.value || '◈',
    color: _el('habit-color')?.value || APP.settings.accentColor,
    category: _el('habit-category')?.value || 'Health',
    difficulty: diff,
    type,
    notes: (_el('habit-notes')?.value || '').trim(),
  };

  if (type === 'numeric') {
    const gv = parseInt(_el('habit-goal-value')?.value, 10);
    if (!gv || gv < 1) { showToast('Please enter a valid goal amount.', 'error'); return; }
    hbData.goalValue = gv;
    hbData.goalUnit  = (_el('habit-goal-unit')?.value || '').trim();
  } else if (type === 'time') {
    const gm = parseInt(_el('habit-goal-minutes')?.value, 10);
    if (!gm || gm < 1) { showToast('Please enter a valid duration.', 'error'); return; }
    hbData.goalMinutes = gm;
  }

  if (editId) {
    const idx = APP.habits.findIndex(h => h._id === editId);
    if (idx !== -1) {
      APP.habits[idx] = { ...APP.habits[idx], ...hbData };
      await _save('habits', editId, APP.habits[idx]);
    }
  } else {
    hbData._id = _uid();
    APP.habits.push(hbData);
    await _save('habits', hbData._id, hbData);
    addXP(15);
    checkAchievements(true);
  }

  closeHabitModal();
  showToast(editId ? 'Habit updated ✓' : 'Habit added ✓', 'success');
  if (APP.currentPage === 'habits') renderHabits();
  if (APP.currentPage === 'dashboard') renderDashboard();
}

// ── TRACKER ─────────────────────────────────────────────────
/** Build progress controls HTML for numeric/time habits */
function _trackerProgressHTML(hb, comp) {
  const hid = hb._id;
  const type = _habitType(hb);
  const unit = type === 'time' ? 'min' : _esc(hb.goalUnit || '');
  const label = type === 'time' ? `${comp.target} min` : `${comp.target} ${unit}`;

  const timeBtns = type === 'time'
    ? `<button type="button" class="progress-chip-btn" data-action="add-time" data-delta="5">+5</button>
       <button type="button" class="progress-chip-btn" data-action="add-time" data-delta="10">+10</button>`
    : '';

  return `
    <div class="tracker-progress-block" data-hid="${hid}">
      <div class="tracker-progress-controls">
        <button type="button" class="progress-btn" data-action="dec" aria-label="Decrease">−</button>
        <input type="number" class="tracker-progress-input" value="${comp.value}" min="0" max="${comp.target * 10}" data-hid="${hid}" aria-label="Progress" />
        <button type="button" class="progress-btn" data-action="inc" aria-label="Increase">+</button>
        ${timeBtns}
        <span class="tracker-progress-label">${comp.value} / ${label}</span>
      </div>
      <div class="tracker-progress-bar-wrap"><div class="tracker-progress-bar-fill" style="width:${comp.pct}%"></div></div>
    </div>`;
}

function renderTracker() {
  const dateEl = _el('tracker-date');
  const navLabel = _el('tracker-nav-label');
  const today = _todayStr();

  if (dateEl) dateEl.textContent = _fmtDate(APP.trackerDate);
  if (navLabel) navLabel.textContent = APP.trackerDate === today ? 'Today' : APP.trackerDate;

  const nextBtn = _el('tracker-next');
  if (nextBtn) {
    const atToday = _cmpDate(APP.trackerDate, today) >= 0;
    nextBtn.disabled = atToday;
    nextBtn.setAttribute('aria-disabled', atToday ? 'true' : 'false');
  }

  const dayLog = APP.logs[APP.trackerDate] || {};
  const listEl = _el('tracker-list');
  if (!listEl) return;

  listEl.innerHTML = '';
  if (!APP.habits.length) {
    listEl.innerHTML = `<div class="empty-state"><div class="empty-icon">◉</div><p>No habits to track.</p><button class="btn-primary small" style="margin-top:10px" onclick="openHabitModal()">Add Habit</button></div>`;
    return;
  }

  APP.habits.forEach(hb => {
    const entry = dayLog[hb._id] || {};
    const comp = calculateHabitCompletion(hb, entry);
    const type = _habitType(hb);
    const metaStr = type === 'numeric' ? `${hb.goalValue} ${hb.goalUnit || ''}` :
                    type === 'time' ? `${hb.goalMinutes} min` : '';

    const item = document.createElement('div');
    item.className = 'tracker-item' + (comp.done ? ' done' : '') + (type !== 'checkbox' ? ' has-progress' : '');
    item.dataset.hid = hb._id;
    item.dataset.type = type;

    const progressHTML = type !== 'checkbox' ? _trackerProgressHTML(hb, comp) : '';
    const checkHTML = type === 'checkbox'
      ? `<button type="button" class="check-box ${comp.done ? 'checked' : ''}" data-action="toggle-check" aria-label="Mark complete">${comp.done ? '✓' : ''}</button>`
      : `<div class="check-box status-only ${comp.done ? 'checked' : ''}" aria-hidden="true">${comp.done ? '✓' : ''}</div>`;

    item.innerHTML = `
      <div class="tracker-item-icon">${hb.icon || '◈'}</div>
      <div class="tracker-item-info">
        <div class="tracker-item-name">${_esc(hb.name)}</div>
        <div class="tracker-item-cat">${_esc(hb.category || '')}${metaStr ? ' · ' + _esc(metaStr) : ''}</div>
        ${progressHTML}
      </div>
      ${checkHTML}
    `;
    listEl.appendChild(item);
  });

  // Mood
  document.querySelectorAll('.mood-btn').forEach(b => {
    b.classList.toggle('selected', String(b.dataset.mood) === String(dayLog.mood || 0));
  });

  // Notes
  const notesEl = _el('day-notes');
  if (notesEl) notesEl.value = dayLog.notes || '';

  // Water
  const waterCount = dayLog.water || 0;
  _setText('water-count', waterCount);
  const glassesEl = _el('water-glasses');
  if (glassesEl) {
    glassesEl.innerHTML = '';
    for (let i = 0; i < 8; i++) {
      const g = document.createElement('div');
      g.className = 'water-glass' + (i < waterCount ? ' filled' : '');
      glassesEl.appendChild(g);
    }
  }
}

// ── SCHEDULER ────────────────────────────────────────────────
// Drag & drop state
let _dragSrcIdx = null;
let _taskOrderDirty = false;

function _getOrderedTasks() {
  // Apply custom order if available
  if (APP.taskOrder && APP.taskOrder.length) {
    const ordered = [];
    const remaining = APP.tasks.slice();
    APP.taskOrder.forEach(id => {
      const idx = remaining.findIndex(t => t._id === id);
      if (idx !== -1) { ordered.push(remaining[idx]); remaining.splice(idx, 1); }
    });
    // Add any new tasks not in order
    remaining.forEach(t => ordered.unshift(t)); // new tasks go to top
    return ordered;
  }
  // Default: sort by date+time, latest first
  return APP.tasks.slice().sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    const aKey = (a.date || '9999') + (a.start || '99:99');
    const bKey = (b.date || '9999') + (b.start || '99:99');
    return bKey.localeCompare(aKey); // descending = latest first
  });
}

function renderScheduler() {
  const listEl = _el('sched-task-list');
  if (!listEl) return;
  listEl.innerHTML = '';

  let tasks = _getOrderedTasks();

  const tab = APP.schedTab;
  if (tab === 'pending') tasks = tasks.filter(t => !t.done);
  if (tab === 'done') tasks = tasks.filter(t => t.done);

  const total = APP.tasks.length;
  const done = APP.tasks.filter(t => t.done).length;
  const pending = total - done;
  const pct = total ? Math.round((done / total) * 100) : 0;

  _setText('sched-total', total);
  _setText('sched-pending', pending);
  _setText('sched-done', done);
  const pfill = _el('sched-progress-fill');
  if (pfill) pfill.style.width = pct + '%';
  _setText('sched-progress-pct', pct + '%');
  _setText('sched-day-label', new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' }));

  if (!tasks.length) {
    listEl.innerHTML = `<div class="empty-state"><div class="empty-icon">▦</div><p>${tab==='all'?'No tasks yet.':tab==='pending'?'No pending tasks.':'No completed tasks.'}</p></div>`;
    return;
  }

  tasks.forEach((t, visIdx) => {
    const card = document.createElement('div');
    card.className = 'task-card' + (t.done ? ' done' : '');
    card.draggable = true;
    card.dataset.id = t._id;

    const timeStr = t.start ? (t.start + (t.end ? ' – ' + t.end : '')) : '';
    card.innerHTML = `
      <div class="drag-handle" title="Drag to reorder" aria-label="Drag handle">⠿</div>
      <button class="task-check-btn ${t.done ? 'checked' : ''}" aria-label="${t.done?'Uncheck':'Check'} task">
        ${t.done ? `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>` : ''}
      </button>
      <div class="task-title-text">${_esc(t.title)}</div>
      ${t.date ? `<div class="task-date-chip">${_esc(t.date)}</div>` : ''}
      ${timeStr ? `<div class="task-time-pill">${_esc(timeStr)}</div>` : ''}
      <button class="task-del-btn" aria-label="Delete task">✕</button>
    `;

    card.querySelector('.task-check-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      t.done = !t.done;
      addXP(t.done ? 5 : -5);
      await _save('tasks', t._id, t);
      renderScheduler();
      checkAchievements(true);
      if (t.done) showToast('✓ Task done!', 'success', 1800);
    });

    card.querySelector('.task-del-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      APP.tasks = APP.tasks.filter(x => x._id !== t._id);
      APP.taskOrder = APP.taskOrder.filter(id => id !== t._id);
      await _delete('tasks', t._id);
      await _saveSettings();
      renderScheduler();
      showToast('Task deleted', '', 1800);
    });

    // Drag & drop events
    card.addEventListener('dragstart', (e) => {
      _dragSrcIdx = visIdx;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', t._id);
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      document.querySelectorAll('.task-card.drag-over').forEach(c => c.classList.remove('drag-over'));
    });
    card.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (_dragSrcIdx !== visIdx) card.classList.add('drag-over');
    });
    card.addEventListener('dragleave', () => card.classList.remove('drag-over'));
    card.addEventListener('drop', async (e) => {
      e.preventDefault();
      card.classList.remove('drag-over');
      if (_dragSrcIdx === null || _dragSrcIdx === visIdx) return;
      // Reorder tasks
      const allOrdered = _getOrderedTasks();
      const filtered = tab === 'all' ? allOrdered : tab === 'pending' ? allOrdered.filter(t => !t.done) : allOrdered.filter(t => t.done);
      const srcId = filtered[_dragSrcIdx]?._id;
      const tgtId = filtered[visIdx]?._id;
      if (!srcId || !tgtId) return;
      // Move in the master ordered list
      const masterOrder = allOrdered.map(t => t._id);
      const fromMasterIdx = masterOrder.indexOf(srcId);
      const toMasterIdx = masterOrder.indexOf(tgtId);
      if (fromMasterIdx === -1 || toMasterIdx === -1) return;
      masterOrder.splice(fromMasterIdx, 1);
      masterOrder.splice(toMasterIdx, 0, srcId);
      APP.taskOrder = masterOrder;
      await _saveSettings();
      renderScheduler();
    });

    // Touch drag support (simple touch-based reorder)
    _addTouchDrag(card, t._id, listEl);

    listEl.appendChild(card);
  });
}

// Simple touch drag support
function _addTouchDrag(card, taskId, listEl) {
  let touchStartY = 0;
  let clone = null;

  card.addEventListener('touchstart', (e) => {
    if (!e.target.closest('.drag-handle')) return;
    touchStartY = e.touches[0].clientY;
    card.style.opacity = '0.5';
  }, { passive: true });

  card.addEventListener('touchmove', (e) => {
    if (card.style.opacity !== '0.5') return;
    e.preventDefault();
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const target = el?.closest('.task-card');
    document.querySelectorAll('.task-card.drag-over').forEach(c => c.classList.remove('drag-over'));
    if (target && target !== card) target.classList.add('drag-over');
  }, { passive: false });

  card.addEventListener('touchend', async (e) => {
    if (card.style.opacity !== '0.5') return;
    card.style.opacity = '';
    const touch = e.changedTouches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const target = el?.closest('.task-card');
    document.querySelectorAll('.task-card.drag-over').forEach(c => c.classList.remove('drag-over'));
    if (target && target !== card) {
      const tgtId = target.dataset.id;
      if (tgtId && tgtId !== taskId) {
        const ordered = _getOrderedTasks().map(t => t._id);
        const fromIdx = ordered.indexOf(taskId);
        const toIdx = ordered.indexOf(tgtId);
        if (fromIdx !== -1 && toIdx !== -1) {
          ordered.splice(fromIdx, 1);
          ordered.splice(toIdx, 0, taskId);
          APP.taskOrder = ordered;
          await _saveSettings();
          renderScheduler();
        }
      }
    }
  });
}

// ── TASK MODAL ───────────────────────────────────────────────
function openTaskModal() {
  const overlay = _el('task-modal-overlay');
  _el('edit-task-id').value = '';
  _el('task-title-input').value = '';
  _el('task-date-input').value = _todayStr();
  _el('task-start-input').value = '';
  _el('task-end-input').value = '';
  overlay.classList.remove('hidden');
  setTimeout(() => _el('task-title-input').focus(), 80);
}

function closeTaskModal() {
  _el('task-modal-overlay').classList.add('hidden');
}

async function saveTask() {
  const title = (_el('task-title-input')?.value || '').trim();
  if (!title) { showToast('Please enter a task title.', 'error'); return; }

  const task = {
    _id: _uid(),
    title,
    date: _el('task-date-input')?.value || '',
    start: _el('task-start-input')?.value || '',
    end: _el('task-end-input')?.value || '',
    done: false,
    createdAt: new Date().toISOString(),
  };

  APP.tasks.push(task);
  // Prepend to custom order
  APP.taskOrder = [task._id, ...APP.taskOrder];
  await _save('tasks', task._id, task);
  await _saveSettings();
  closeTaskModal();
  showToast('Task added ✓', 'success', 1800);
  if (APP.currentPage === 'scheduler') renderScheduler();
}

// ── CALENDAR ─────────────────────────────────────────────────
function renderCalendar() {
  _renderHeatmap();
  _renderCalGrid();
}

function _renderHeatmap() {
  const container = _el('heatmap-container');
  if (!container) return;
  const wrapper = document.createElement('div');
  wrapper.className = 'heatmap-grid';

  const today = new Date();
  const weeks = 13;
  const totalDays = weeks * 7;

  const cols = [];
  for (let w = 0; w < weeks; w++) cols.push([]);

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dStr = _localDateStr(d);
    const log = APP.logs[dStr] || {};
    const done = APP.habits.filter(h => _isHabitDone(h, log)).length;
    const total = APP.habits.length;
    let intensity = 0;
    if (total > 0) {
      const pct = done / total;
      if (pct > 0) intensity = 1;
      if (pct >= 0.33) intensity = 2;
      if (pct >= 0.67) intensity = 3;
      if (pct === 1) intensity = 4;
    }
    const weekIdx = Math.floor((totalDays - 1 - i) / 7);
    cols[weekIdx].push({ dStr, intensity });
  }

  cols.forEach(colCells => {
    const col = document.createElement('div');
    col.className = 'heatmap-col';
    colCells.forEach(({ dStr, intensity }) => {
      const cell = document.createElement('div');
      cell.className = `heat-cell heat-${intensity}`;
      cell.title = dStr;
      cell.addEventListener('click', () => {
        APP.trackerDate = dStr;
        navigateTo('tracker');
      });
      col.appendChild(cell);
    });
    wrapper.appendChild(col);
  });

  container.innerHTML = '';
  container.appendChild(wrapper);
}

function _renderCalGrid() {
  const grid = _el('calendar-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const y = APP.calendarMonth.getFullYear();
  const m = APP.calendarMonth.getMonth();
  const label = _el('cal-month-label');
  if (label) label.textContent = new Date(y, m).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const today = _todayStr();

  ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].forEach(d => {
    const h = document.createElement('div');
    h.className = 'cal-day-header';
    h.textContent = d;
    grid.appendChild(h);
  });

  const firstDow = (new Date(y, m, 1).getDay() + 6) % 7;
  for (let i = 0; i < firstDow; i++) {
    const empty = document.createElement('div');
    empty.className = 'cal-day empty';
    grid.appendChild(empty);
  }

  const daysInMonth = new Date(y, m + 1, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    const dStr = `${y}-${String(m+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
    const log = APP.logs[dStr] || {};
    const hasData = Object.keys(log).some(k => !['water','mood','notes','_earlyBird','_nightOwl'].includes(k) && (log[k]?.done || log[k]?.value));

    const cell = document.createElement('div');
    let cls = 'cal-day';
    if (dStr === today) cls += ' today';
    if (hasData) cls += ' has-data';
    cell.className = cls;
    cell.textContent = i;
    cell.title = dStr;
    cell.addEventListener('click', () => {
      APP.trackerDate = dStr;
      navigateTo('tracker');
    });
    grid.appendChild(cell);
  }
}

// ── ANALYTICS ────────────────────────────────────────────────
function _destroyAllCharts() {
  Object.values(APP.charts).forEach(c => { try { c.destroy(); } catch (e) {} });
  APP.charts = {};
}

function _getChartDefaults() {
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#7c6aff';
  return {
    accent,
    grid: 'rgba(255,255,255,0.06)',
    text: '#8888a0',
    bg2: '#21212e',
  };
}

function renderAnalytics() {
  if (typeof Chart === 'undefined') {
    showToast('Chart library not loaded.', 'error');
    return;
  }

  const cd = _getChartDefaults();

  ['chart-weekly','chart-habits','chart-monthly','chart-per-habit'].forEach(id => {
    if (APP.charts[id]) { try { APP.charts[id].destroy(); } catch (e) {} delete APP.charts[id]; }
  });

  const c1 = _el('chart-weekly');
  if (c1) {
    const labels = [], data = [];
    for (let i = 6; i >= 0; i--) {
      const d = _dateAdd(_todayStr(), -i);
      const log = APP.logs[d] || {};
      const done = APP.habits.filter(h => _isHabitDone(h, log)).length;
      const total = APP.habits.length;
      labels.push(new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }));
      data.push(total ? Math.round((done / total) * 100) : 0);
    }
    APP.charts['chart-weekly'] = new Chart(c1, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Completion %',
          data,
          borderColor: cd.accent,
          backgroundColor: cd.accent + '22',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: cd.accent,
          pointRadius: 4,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: cd.text }, grid: { color: cd.grid } },
          y: { ticks: { color: cd.text }, grid: { color: cd.grid }, min: 0, max: 100 }
        }
      }
    });
  }

  const c2 = _el('chart-habits');
  if (c2) {
    const labels = APP.habits.length ? APP.habits.map(h => h.name) : ['No Habits'];
    const data = APP.habits.length ? APP.habits.map(h => _habitCompletionRate(h._id, 30)) : [1];
    const colors = APP.habits.length ? APP.habits.map(h => h.color || cd.accent) : [cd.accent];
    APP.charts['chart-habits'] = new Chart(c2, {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 1, borderColor: '#1a1a24' }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'right', labels: { color: cd.text, font: { size: 11 }, boxWidth: 12 } } }
      }
    });
  }

  const c3 = _el('chart-monthly');
  if (c3) {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const labels = [], data = [];
    for (let i = 1; i <= Math.min(daysInMonth, now.getDate()); i++) {
      const dStr = `${y}-${String(m+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
      const log = APP.logs[dStr] || {};
      const done = APP.habits.filter(h => _isHabitDone(h, log)).length;
      const total = APP.habits.length;
      labels.push(i);
      data.push(total ? Math.round((done / total) * 100) : 0);
    }
    APP.charts['chart-monthly'] = new Chart(c3, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Completion %',
          data,
          backgroundColor: cd.accent + '88',
          borderColor: cd.accent,
          borderWidth: 1,
          borderRadius: 4,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: cd.text, maxTicksLimit: 10 }, grid: { color: cd.grid } },
          y: { ticks: { color: cd.text }, grid: { color: cd.grid }, min: 0, max: 100 }
        }
      }
    });
  }

  const c4 = _el('chart-per-habit');
  if (c4) {
    const habits = APP.habits.slice(0, 8);
    const labels = habits.length ? habits.map(h => h.name) : ['No Habits'];
    const data = habits.length ? habits.map(h => _habitCompletionRate(h._id, 30)) : [0];
    const colors = habits.length ? habits.map(h => h.color || cd.accent) : [cd.accent];
    APP.charts['chart-per-habit'] = new Chart(c4, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: '30-day %',
          data,
          backgroundColor: colors.map(c => c + 'bb'),
          borderColor: colors,
          borderWidth: 1,
          borderRadius: 4,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: cd.text }, grid: { color: cd.grid }, min: 0, max: 100 },
          y: { ticks: { color: cd.text, font: { size: 11 } }, grid: { color: cd.grid } }
        }
      }
    });
  }
}

// ── JOURNAL ──────────────────────────────────────────────────
function renderJournal() {
  const listEl = _el('journal-entries');
  if (!listEl) return;
  listEl.innerHTML = '';

  const sorted = APP.journal.slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  if (!sorted.length) {
    listEl.innerHTML = `<div class="empty-state"><div class="empty-icon">✦</div><p>No journal entries yet.</p></div>`;
  } else {
    sorted.forEach(j => {
      const card = document.createElement('div');
      card.className = 'journal-entry-card' + (j._id === APP.editingJournalId ? ' active' : '');
      card.innerHTML = `
        <div class="journal-entry-date">${_esc(j.date || 'No date')}</div>
        <div class="journal-entry-title">${_esc(j.text?.slice(0,60) || '')}…</div>
        ${j.gratitude ? `<div class="journal-entry-preview">🙏 ${_esc(j.gratitude)}</div>` : ''}
      `;
      card.addEventListener('click', () => {
        APP.editingJournalId = j._id;
        _el('journal-editor-title').textContent = 'Edit Entry';
        _el('journal-date').value = j.date || '';
        _el('journal-text').value = j.text || '';
        _el('journal-gratitude').value = j.gratitude || '';
        _el('journal-editor').classList.remove('hidden');
        document.querySelectorAll('.journal-entry-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        if (window.innerWidth <= 768) {
          _el('journal-editor').scrollIntoView({ behavior: 'smooth' });
        }
      });
      listEl.appendChild(card);
    });
  }

  _updateJournalDeleteBtn();
}

function _updateJournalDeleteBtn() {
  const editor = _el('journal-editor');
  if (!editor) return;
  let delBtn = editor.querySelector('#journal-delete-btn');
  if (APP.editingJournalId) {
    if (!delBtn) {
      delBtn = document.createElement('button');
      delBtn.id = 'journal-delete-btn';
      delBtn.className = 'btn-danger';
      delBtn.style.cssText = 'margin-top:8px;width:100%';
      delBtn.textContent = 'Delete Entry';
      delBtn.addEventListener('click', deleteJournalEntry);
      editor.querySelector('.editor-actions').after(delBtn);
    }
  } else {
    if (delBtn) delBtn.remove();
  }
}

async function deleteJournalEntry() {
  if (!APP.editingJournalId) return;
  if (!confirm('Delete this journal entry?')) return;
  APP.journal = APP.journal.filter(j => j._id !== APP.editingJournalId);
  await _delete('journal', APP.editingJournalId);
  APP.editingJournalId = null;
  _el('journal-editor').classList.add('hidden');
  showToast('Entry deleted', '', 2000);
  renderJournal();
}

function openJournalEditor() {
  APP.editingJournalId = null;
  _el('journal-editor-title').textContent = 'New Entry';
  _el('journal-date').value = _todayStr();
  _el('journal-text').value = '';
  _el('journal-gratitude').value = '';
  _el('journal-editor').classList.remove('hidden');
  document.querySelectorAll('.journal-entry-card').forEach(c => c.classList.remove('active'));
  _updateJournalDeleteBtn();
  setTimeout(() => _el('journal-text')?.focus(), 80);
}

async function saveJournal() {
  const txt = (_el('journal-text')?.value || '').trim();
  if (!txt) { showToast('Please write something first.', 'error'); return; }

  if (APP.editingJournalId) {
    const idx = APP.journal.findIndex(j => j._id === APP.editingJournalId);
    if (idx !== -1) {
      APP.journal[idx].date = _el('journal-date')?.value || _todayStr();
      APP.journal[idx].text = txt;
      APP.journal[idx].gratitude = (_el('journal-gratitude')?.value || '').trim();
      await _save('journal', APP.journal[idx]._id, APP.journal[idx]);
      showToast('Entry updated ✓', 'success');
    }
  } else {
    const entry = {
      _id: _uid(),
      date: _el('journal-date')?.value || _todayStr(),
      text: txt,
      gratitude: (_el('journal-gratitude')?.value || '').trim(),
      createdAt: new Date().toISOString(),
    };
    APP.journal.push(entry);
    await _save('journal', entry._id, entry);
    addXP(20);
    showToast('Entry saved ✓', 'success');
    checkAchievements(true);
  }

  APP.editingJournalId = null;
  _el('journal-editor').classList.add('hidden');
  renderJournal();
}

// ── ACHIEVEMENTS ─────────────────────────────────────────────
function renderAchievements() {
  updateXPUI();
  validateAchievementUnlock(false);
  const grid = _el('achievements-grid');
  if (!grid) return;
  grid.innerHTML = '';

  // Group by category
  const cats = [...new Set(ACHIEVEMENTS.map(a => a.cat))];
  cats.forEach(cat => {
    const catAchs = ACHIEVEMENTS.filter(a => a.cat === cat);
    const header = document.createElement('div');
    header.style.cssText = 'grid-column:1/-1;font-size:.72rem;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em;padding:8px 0 4px;border-bottom:1px solid var(--border);margin-bottom:4px;font-weight:600';
    header.textContent = cat;
    grid.appendChild(header);

    catAchs.forEach(ach => {
      const unlocked = _unlockedAch.has(ach.id);
      const card = document.createElement('div');
      card.className = 'achievement-card ' + (unlocked ? 'unlocked' : 'locked');

      let progressHTML = '';
      if (!unlocked && ach.progress) {
        const [cur, max] = ach.progress();
        const pct = Math.min(100, Math.round((cur / max) * 100));
        progressHTML = `
          <div class="achievement-progress">${cur} / ${max}</div>
          <div class="achievement-progress-bar"><div class="achievement-progress-fill" style="width:${pct}%"></div></div>
        `;
      }

      card.innerHTML = `
        <div class="achievement-icon">${ach.icon}</div>
        <div class="achievement-name">${_esc(ach.name)}</div>
        <div class="achievement-desc">${_esc(ach.desc)}</div>
        ${ach.xp ? `<div class="achievement-xp">+${ach.xp} XP</div>` : ''}
        ${progressHTML}
      `;
      grid.appendChild(card);
    });
  });
}

// ── SETTINGS ─────────────────────────────────────────────────
function _clearPasswordChangeForm() {
  ['pwd-current', 'pwd-new', 'pwd-confirm'].forEach(id => {
    const el = _el(id);
    if (el) { el.value = ''; el.type = 'password'; }
  });
  const err = _el('pwd-change-error');
  if (err) err.classList.add('hidden');
}

function _hidePasswordChangePanel() {
  const panel = _el('password-change-panel');
  const toggle = _el('btn-toggle-password-form');
  if (panel) panel.classList.add('hidden');
  if (toggle) toggle.textContent = 'Change Password';
  _clearPasswordChangeForm();
}

function _togglePasswordChangePanel() {
  const panel = _el('password-change-panel');
  const toggle = _el('btn-toggle-password-form');
  if (!panel || !toggle) return;
  const open = panel.classList.toggle('hidden');
  if (open) {
    _hidePasswordChangePanel();
  } else {
    toggle.textContent = 'Hide';
    _clearPasswordChangeForm();
    setTimeout(() => _el('pwd-current')?.focus(), 80);
  }
}

async function handleChangePassword() {
  if (!APP.user) {
    showToast('Please sign in again.', 'error');
    return;
  }

  const current = _el('pwd-current')?.value || '';
  const next = _el('pwd-new')?.value || '';
  const confirm = _el('pwd-confirm')?.value || '';
  const errEl = _el('pwd-change-error');
  const btn = _el('btn-save-password');

  if (errEl) errEl.classList.add('hidden');

  if (next !== confirm) {
    if (errEl) {
      errEl.textContent = 'New passwords do not match.';
      errEl.classList.remove('hidden');
    }
    return;
  }

  if (btn) { btn.disabled = true; btn.textContent = 'Updating…'; }

  try {
    const res = await changePassword(APP.user, current, next);
    if (!res.success) {
      if (errEl) {
        errEl.textContent = res.error;
        errEl.classList.remove('hidden');
      }
      return;
    }
    _hidePasswordChangePanel();
    showToast('Password updated successfully ✓', 'success', 3000);
  } catch (e) {
    if (errEl) {
      errEl.textContent = 'Could not update password. Try again.';
      errEl.classList.remove('hidden');
    }
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Update Password'; }
  }
}

function renderSettings() {
  _updateSettingsStats();
  _hidePasswordChangePanel();
  // Sync color picker with current accent
  const picker = _el('accent-color-picker');
  if (picker) picker.value = APP.settings.accentColor || '#7c6aff';
  document.querySelectorAll('.accent-swatch').forEach(s => {
    s.classList.toggle('active', s.dataset.color === APP.settings.accentColor);
  });
}

function _updateSettingsStats() {
  _setText('stat-total-habits', APP.habits.length);
  _setText('stat-total-tasks', APP.tasks.length);
  _setText('stat-total-journal', APP.journal.length);
  _setText('stat-total-xp', (APP.level - 1) * 100 + APP.xp);
  const un = APP.user || '—';
  _setText('settings-email', un);
  _setText('sidebar-email', un);
}

// ── SEARCH ───────────────────────────────────────────────────
let _searchTimer = null;

function handleSearch(query) {
  const resultsEl = _el('search-results');
  if (!resultsEl) return;

  if (!query.trim()) {
    resultsEl.classList.add('hidden');
    if (APP.currentPage === 'habits') renderHabits();
    return;
  }

  const q = query.toLowerCase();
  const matches = APP.habits.filter(h => h.name.toLowerCase().includes(q) || (h.category || '').toLowerCase().includes(q));

  if (!matches.length) {
    resultsEl.innerHTML = `<div class="search-result-item"><div class="search-result-name" style="color:var(--text-3)">No habits found</div></div>`;
  } else {
    resultsEl.innerHTML = '';
    matches.slice(0, 8).forEach(h => {
      const item = document.createElement('div');
      item.className = 'search-result-item';
      item.setAttribute('role', 'option');
      item.innerHTML = `
        <div class="search-result-icon">${h.icon || '◈'}</div>
        <div>
          <div class="search-result-name">${_esc(h.name)}</div>
          <div class="search-result-cat">${_esc(h.category || 'General')}</div>
        </div>
      `;
      item.addEventListener('click', () => {
        resultsEl.classList.add('hidden');
        _el('global-search').value = '';
        navigateTo('tracker');
      });
      resultsEl.appendChild(item);
    });
  }

  resultsEl.classList.remove('hidden');
  if (APP.currentPage === 'habits') renderHabits();
}

// ── EXPORT / IMPORT ──────────────────────────────────────────
function exportData() {
  const data = {
    habits: APP.habits, logs: APP.logs, tasks: APP.tasks,
    journal: APP.journal, settings: APP.settings,
    xp: APP.xp, level: APP.level, taskOrder: APP.taskOrder,
    unlockedAchievements: [..._unlockedAch]
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `habitpro_backup_${_todayStr()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('Data exported ✓', 'success');
}

async function importData(file) {
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!confirm('This will overwrite all your current data. Continue?')) return;

    if (data.habits)  APP.habits  = data.habits;
    if (data.logs)    APP.logs    = data.logs;
    if (data.tasks)   APP.tasks   = data.tasks;
    if (data.journal) APP.journal = data.journal;
    if (data.settings) { APP.settings = data.settings; applyAccentColor(data.settings.accentColor); }
    if (typeof data.xp === 'number')    APP.xp    = data.xp;
    if (typeof data.level === 'number') APP.level = data.level;
    if (Array.isArray(data.taskOrder))  APP.taskOrder = data.taskOrder;
    if (Array.isArray(data.unlockedAchievements)) _loadUnlockedAchievements(data.unlockedAchievements);
    else if (data.settings?.unlockedAchievements) _loadUnlockedAchievements(data.settings.unlockedAchievements);

    const saves = [];
    APP.habits.forEach(h => saves.push(_save('habits', h._id, h)));
    APP.tasks.forEach(t => saves.push(_save('tasks', t._id, t)));
    APP.journal.forEach(j => saves.push(_save('journal', j._id, j)));
    Object.entries(APP.logs).forEach(([d, logData]) => saves.push(_save('logs', d, { data: logData })));
    saves.push(_saveSettings());
    await Promise.all(saves);

    updateXPUI();
    navigateTo(APP.currentPage);
    showToast('Data imported ✓', 'success');
  } catch (e) {
    showToast('Import failed: ' + e.message, 'error', 4000);
  }
}

/** Mobile browsers: sync real viewport height (fixes 100vh clipping) */
function _initMobileViewport() {
  const setH = () => {
    const h = window.visualViewport?.height || window.innerHeight;
    document.documentElement.style.setProperty('--app-height', `${Math.round(h)}px`);
  };
  setH();
  window.addEventListener('resize', setH);
  window.addEventListener('orientationchange', setH);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', setH);
}

// ── BOOT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  _initMobileViewport();

  // ─ Auth events ──────────────────────────────────────────
  _el('btn-login').addEventListener('click', handleLogin);
  _el('btn-signup').addEventListener('click', handleSignup);

  _el('login-password').addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });
  _el('login-email').addEventListener('keydown', e => { if (e.key === 'Enter') _el('login-password').focus(); });
  _el('signup-confirm').addEventListener('keydown', e => { if (e.key === 'Enter') handleSignup(); });

  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.auth-panel').forEach(p => p.classList.add('hidden'));
      tab.classList.add('active');
      _el('panel-' + tab.dataset.tab).classList.remove('hidden');
    });
  });

  document.querySelectorAll('.pw-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const tgt = _el(btn.dataset.target);
      if (!tgt) return;
      const isPass = tgt.type === 'password';
      tgt.type = isPass ? 'text' : 'password';
      btn.textContent = isPass ? '🙈' : '👁';
    });
  });

  // ─ Sidebar / nav ────────────────────────────────────────
  _el('menu-btn').addEventListener('click', () => {
    _el('sidebar').classList.add('open');
    _el('sidebar-overlay').classList.add('visible');
  });
  _el('sidebar-close').addEventListener('click', () => {
    _el('sidebar').classList.remove('open');
    _el('sidebar-overlay').classList.remove('visible');
  });
  _el('sidebar-overlay').addEventListener('click', () => {
    _el('sidebar').classList.remove('open');
    _el('sidebar-overlay').classList.remove('visible');
  });

  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => { e.preventDefault(); navigateTo(item.dataset.page); });
  });
  document.querySelectorAll('.bnav-item').forEach(item => {
    item.addEventListener('click', e => { e.preventDefault(); navigateTo(item.dataset.page); });
  });

  // ─ Quick add ────────────────────────────────────────────
  _el('btn-quick-add').addEventListener('click', () => openHabitModal());
  _el('habits-add-btn').addEventListener('click', () => openHabitModal());
  _el('sched-add-btn').addEventListener('click', () => openTaskModal());

  // ─ Habit modal ──────────────────────────────────────────
  _el('close-habit-modal').addEventListener('click', closeHabitModal);
  _el('cancel-habit-modal').addEventListener('click', closeHabitModal);
  _el('save-habit-btn').addEventListener('click', saveHabit);
  _el('habit-modal-overlay').addEventListener('click', e => { if (e.target === _el('habit-modal-overlay')) closeHabitModal(); });
  _el('habit-name').addEventListener('keydown', e => { if (e.key === 'Enter') saveHabit(); });

  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Habit type change → show/hide dynamic fields
  _el('habit-type').addEventListener('change', _updateHabitTypeUI);

  // ─ Task modal ───────────────────────────────────────────
  _el('close-task-modal').addEventListener('click', closeTaskModal);
  _el('cancel-task-modal').addEventListener('click', closeTaskModal);
  _el('save-task-btn').addEventListener('click', saveTask);
  _el('task-modal-overlay').addEventListener('click', e => { if (e.target === _el('task-modal-overlay')) closeTaskModal(); });
  _el('task-title-input').addEventListener('keydown', e => { if (e.key === 'Enter') saveTask(); });

  // ─ Tracker ──────────────────────────────────────────────
  _el('tracker-prev').addEventListener('click', () => {
    APP.trackerDate = _dateAdd(APP.trackerDate, -1);
    renderTracker();
  });
  _el('tracker-next').addEventListener('click', () => {
    const today = _todayStr();
    const next = _dateAdd(APP.trackerDate, 1);
    if (_cmpDate(next, today) <= 0) {
      APP.trackerDate = next;
      renderTracker();
    } else {
      showToast("Can't navigate to future dates.", 'error', 1800);
    }
  });

  // Tracker: single delegated handler (avoids duplicate listeners on re-render)
  let _trackerInputDebounce = null;
  const trackerList = _el('tracker-list');
  if (trackerList) {
    trackerList.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const item = e.target.closest('.tracker-item');
      if (!item) return;
      const hid = item.dataset.hid;
      const dateStr = APP.trackerDate;
      const action = btn.dataset.action;

      if (action === 'toggle-check') {
        e.preventDefault();
        const habit = APP.habits.find(h => h._id === hid);
        if (!habit) return;
        const comp = calculateHabitCompletion(habit, _getHabitEntry(dateStr, hid));
        await markHabitComplete(hid, dateStr, !comp.done);
        return;
      }

      if (!e.target.closest('.tracker-progress-block')) return;
      e.stopPropagation();

      if (action === 'inc') await adjustHabitProgress(hid, dateStr, 1);
      else if (action === 'dec') await adjustHabitProgress(hid, dateStr, -1);
      else if (action === 'add-time') await adjustHabitProgress(hid, dateStr, parseInt(btn.dataset.delta, 10) || 5);
    });

    trackerList.addEventListener('input', (e) => {
      const input = e.target.closest('.tracker-progress-input');
      if (!input) return;
      clearTimeout(_trackerInputDebounce);
      _trackerInputDebounce = setTimeout(() => {
        updateHabitProgress(input.dataset.hid, APP.trackerDate, input.value);
      }, 450);
    });

    trackerList.addEventListener('change', (e) => {
      const input = e.target.closest('.tracker-progress-input');
      if (!input) return;
      clearTimeout(_trackerInputDebounce);
      updateHabitProgress(input.dataset.hid, APP.trackerDate, input.value);
    });
  }

  document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!APP.logs[APP.trackerDate]) APP.logs[APP.trackerDate] = {};
      APP.logs[APP.trackerDate].mood = btn.dataset.mood;
      await _saveLog(APP.trackerDate);
      document.querySelectorAll('.mood-btn').forEach(b => b.classList.toggle('selected', b === btn));
    });
  });

  _el('save-day-notes').addEventListener('click', async () => {
    if (!APP.logs[APP.trackerDate]) APP.logs[APP.trackerDate] = {};
    APP.logs[APP.trackerDate].notes = _el('day-notes').value;
    await _saveLog(APP.trackerDate);
    showToast('Notes saved ✓', 'success', 1800);
  });

  _el('water-inc').addEventListener('click', async () => {
    const log = _ensureDayLog(APP.trackerDate);
    const cur = log.water || 0;
    if (cur >= 8) { showToast('Goal reached! 🎉', 'xp', 1800); return; }
    log.water = cur + 1;
    if (log.water >= 8 && !log.waterXpAwarded) {
      log.waterXpAwarded = true;
      addXP(10);
      showToast('💧 Water goal reached! +10 XP', 'xp', 2500);
    }
    await _saveLog(APP.trackerDate);
    renderTracker();
  });

  _el('water-dec').addEventListener('click', async () => {
    if (!APP.logs[APP.trackerDate]) return;
    APP.logs[APP.trackerDate].water = Math.max(0, (APP.logs[APP.trackerDate].water || 0) - 1);
    await _saveLog(APP.trackerDate);
    renderTracker();
  });

  // ─ Scheduler tabs ───────────────────────────────────────
  _el('sched-tabs').addEventListener('click', e => {
    const btn = e.target.closest('.sched-tab');
    if (!btn) return;
    document.querySelectorAll('.sched-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    APP.schedTab = btn.dataset.stab;
    renderScheduler();
  });

  // ─ Calendar ─────────────────────────────────────────────
  _el('cal-prev').addEventListener('click', () => {
    APP.calendarMonth.setMonth(APP.calendarMonth.getMonth() - 1);
    _renderCalGrid();
  });
  _el('cal-next').addEventListener('click', () => {
    APP.calendarMonth.setMonth(APP.calendarMonth.getMonth() + 1);
    _renderCalGrid();
  });

  // ─ Habits filter ────────────────────────────────────────
  _el('category-filter').addEventListener('change', e => {
    _categoryFilter = e.target.value;
    if (APP.currentPage === 'habits') renderHabits();
  });
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _habitFilter = btn.dataset.filter;
      if (APP.currentPage === 'habits') renderHabits();
    });
  });

  // ─ Journal ──────────────────────────────────────────────
  _el('btn-new-journal').addEventListener('click', openJournalEditor);
  _el('save-journal').addEventListener('click', saveJournal);
  _el('cancel-journal').addEventListener('click', () => {
    APP.editingJournalId = null;
    _el('journal-editor').classList.add('hidden');
    renderJournal();
  });

  // ─ Settings ─────────────────────────────────────────────
  _el('btn-toggle-password-form')?.addEventListener('click', _togglePasswordChangePanel);
  _el('btn-cancel-password')?.addEventListener('click', _hidePasswordChangePanel);
  _el('btn-save-password')?.addEventListener('click', handleChangePassword);
  _el('pwd-confirm')?.addEventListener('keydown', e => { if (e.key === 'Enter') handleChangePassword(); });
  _el('btn-signout').addEventListener('click', handleSignOut);

  // Full color picker
  const colorPickerInput = _el('accent-color-picker');
  if (colorPickerInput) {
    let _colorDebounce;
    colorPickerInput.addEventListener('input', () => {
      clearTimeout(_colorDebounce);
      _colorDebounce = setTimeout(() => {
        applyAccentColor(colorPickerInput.value);
        _saveSettings();
        // Deactivate preset swatches
        document.querySelectorAll('.accent-swatch').forEach(s => s.classList.remove('active'));
      }, 60);
    });
  }

  // Preset accent swatches
  document.querySelectorAll('.accent-swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      applyAccentColor(btn.dataset.color);
      _saveSettings();
      showToast('Accent color updated ✓', '', 1800);
      document.querySelectorAll('.accent-swatch').forEach(s => s.classList.toggle('active', s === btn));
      const picker = _el('accent-color-picker');
      if (picker) picker.value = btn.dataset.color;
    });
  });

  _el('btn-export').addEventListener('click', exportData);

  _el('import-file').addEventListener('change', e => {
    if (e.target.files[0]) { importData(e.target.files[0]); e.target.value = ''; }
  });

  _el('btn-delete-data').addEventListener('click', async () => {
    if (!confirm('This will permanently delete all your HabitPro data. Are you sure?')) return;
    if (!confirm('Second confirmation: ALL data will be erased. Continue?')) return;
    await deleteAllUserData(APP.user);
    APP.habits = []; APP.logs = {}; APP.tasks = []; APP.journal = [];
    APP.xp = 0; APP.level = 1; APP.taskOrder = [];
    await _saveSettings();
    showToast('All data deleted.', 'error', 3000);
    navigateTo('dashboard');
  });

  // ─ Search ───────────────────────────────────────────────
  _el('global-search').addEventListener('input', e => {
    clearTimeout(_searchTimer);
    _searchTimer = setTimeout(() => handleSearch(e.target.value), 200);
  });

  _el('global-search').addEventListener('focus', e => {
    if (e.target.value) handleSearch(e.target.value);
  });

  document.addEventListener('click', e => {
    if (!_el('global-search').contains(e.target) && !_el('search-results').contains(e.target)) {
      _el('search-results').classList.add('hidden');
    }
  });

  // ─ Resize: re-render charts ─────────────────────────────
  let _resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(() => {
      if (APP.currentPage === 'analytics') renderAnalytics();
    }, 300);
  });

  // ─ Keyboard shortcut: Esc closes modals ─────────────────
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeHabitModal();
      closeTaskModal();
      _el('search-results').classList.add('hidden');
    }
  });

  // ─ Boot ─────────────────────────────────────────────────
  initApp();
});

// ── GLOBAL EXPORTS (for onclick in HTML) ────────────────────
window.openHabitModal  = openHabitModal;
window.closeHabitModal = closeHabitModal;
window.openTaskModal   = openTaskModal;
window.closeTaskModal  = closeTaskModal;
