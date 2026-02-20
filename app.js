/**
 * 30-Day Skill Improvement Challenge - Application Logic
 * Plain HTML/CSS/JS - No frameworks
 */

if (typeof Chart !== 'undefined') {
  Chart.defaults.font.family = "'DM Sans', -apple-system, sans-serif";
  Chart.defaults.color = '#64748b';
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const STORAGE_PREFIX = '30day_challenge_';
const SESSION_KEY = `${STORAGE_PREFIX}session`;
const USER_DATA_PREFIX = `${STORAGE_PREFIX}user_`;
const MAX_DAYS = 30;

// 10 predefined users (username: password)
const USERS = [
  { username: 'user1', password: 'pass1' },
  { username: 'user2', password: 'pass2' },
  { username: 'user3', password: 'pass3' },
  { username: 'user4', password: 'pass4' },
  { username: 'user5', password: 'pass5' },
  { username: 'user6', password: 'pass6' },
  { username: 'user7', password: 'pass7' },
  { username: 'user8', password: 'pass8' },
  { username: 'user9', password: 'pass9' },
  { username: 'user10', password: 'pass10' },
];

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function parseDate(str) {
  const d = new Date(str);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getDayDifference(startDateStr, endDateStr) {
  const start = parseDate(startDateStr);
  const end = parseDate(endDateStr);
  const diffTime = end - start;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ═══════════════════════════════════════════════════════════════
// STORAGE HELPERS
// ═══════════════════════════════════════════════════════════════

function getSession() {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function setSession(username) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ username }));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function getUserData(username) {
  try {
    const data = localStorage.getItem(USER_DATA_PREFIX + username);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function saveUserData(username, userData) {
  localStorage.setItem(USER_DATA_PREFIX + username, JSON.stringify(userData));
}

function getOrCreateUserData(username) {
  let data = getUserData(username);
  if (!data) {
    const today = getTodayStr();
    data = {
      dayMode: 'auto',
      startDate: today,
      firstLoginDate: today, // for reverting to auto mode
      tasks: []
    };
    saveUserData(username, data);
  }
  if (!data.dayMode) data.dayMode = 'auto';
  if (!data.firstLoginDate) data.firstLoginDate = data.startDate || getTodayStr();
  return data;
}

// ═══════════════════════════════════════════════════════════════
// 30-DAY LOGIC (Auto + Manual)
// ═══════════════════════════════════════════════════════════════

function getStartDate(username) {
  const data = getOrCreateUserData(username);
  return data.startDate || getTodayStr();
}

function setStartDate(username, dateStr) {
  const data = getOrCreateUserData(username);
  data.startDate = dateStr;
  data.dayMode = 'manual';
  saveUserData(username, data);
}

function setDayMode(username, mode) {
  const data = getOrCreateUserData(username);
  data.dayMode = mode;
  if (mode === 'auto') {
    data.startDate = data.firstLoginDate || getTodayStr();
  }
  saveUserData(username, data);
}

function getCurrentDay(username) {
  const data = getOrCreateUserData(username);
  if (data.dayMode === 'manual' && data.startDate) {
    const diff = getDayDifference(data.startDate, getTodayStr());
    return Math.min(diff + 1, MAX_DAYS);
  }
  // Auto: first login date
  const startDate = data.startDate || getTodayStr();
  const diff = getDayDifference(startDate, getTodayStr());
  return Math.min(diff + 1, MAX_DAYS);
}

function getDateForDay(username, dayNum) {
  const startDate = getStartDate(username);
  const start = parseDate(startDate);
  const d = new Date(start);
  d.setDate(d.getDate() + (dayNum - 1));
  return d.toISOString().slice(0, 10);
}

// ═══════════════════════════════════════════════════════════════
// AUTHENTICATION
// ═══════════════════════════════════════════════════════════════

function validateLogin(username, password) {
  return USERS.some(u => u.username === username && u.password === password);
}

// ═══════════════════════════════════════════════════════════════
// TASK MANAGEMENT
// ═══════════════════════════════════════════════════════════════

function getTasks(username) {
  const data = getOrCreateUserData(username);
  return data.tasks || [];
}

function addTask(username, title) {
  const data = getOrCreateUserData(username);
  const task = {
    id: generateId(),
    title: title.trim(),
    completedDates: []
  };
  data.tasks.push(task);
  saveUserData(username, data);
  return task;
}

function removeTask(username, taskId) {
  const data = getOrCreateUserData(username);
  data.tasks = data.tasks.filter(t => t.id !== taskId);
  saveUserData(username, data);
}

function toggleTaskCompletion(username, taskId) {
  toggleTaskCompletionForDate(username, taskId, getTodayStr());
}

function toggleTaskCompletionForDate(username, taskId, dateStr) {
  const data = getOrCreateUserData(username);
  const task = data.tasks.find(t => t.id === taskId);
  if (!task) return;
  if (!task.completedDates) task.completedDates = [];
  const idx = task.completedDates.indexOf(dateStr);
  if (idx >= 0) {
    task.completedDates.splice(idx, 1);
  } else {
    task.completedDates.push(dateStr);
  }
  saveUserData(username, data);
}

function isTaskCompletedToday(task) {
  return isTaskCompletedOnDate(task, getTodayStr());
}

function getDayForDate(username, dateStr) {
  const start = getStartDate(username);
  const diff = getDayDifference(start, dateStr);
  return Math.min(diff + 1, MAX_DAYS);
}

function isDateInChallengeRange(username, dateStr) {
  const start = getStartDate(username);
  const startD = parseDate(start);
  const targetD = parseDate(dateStr);
  if (targetD < startD) return false;
  const diff = getDayDifference(start, dateStr);
  return diff < MAX_DAYS;
}

function getProgressCounts(username) {
  return getProgressCountsForDate(username, getTodayStr());
}

function getProgressCountsForDate(username, dateStr) {
  const tasks = getTasks(username);
  let completed = 0;
  for (const task of tasks) {
    if (isTaskCompletedOnDate(task, dateStr)) completed++;
  }
  const remaining = tasks.length - completed;
  return { completed, remaining, total: tasks.length };
}

function getTasksWithCompletionForDate(username, dateStr) {
  const tasks = getTasks(username);
  return tasks.map(t => ({
    ...t,
    completed: isTaskCompletedOnDate(t, dateStr)
  }));
}

function isTaskCompletedOnDate(task, dateStr) {
  return task.completedDates && task.completedDates.includes(dateStr);
}

function getCompletionPerDay(username) {
  const tasks = getTasks(username);
  const currentDay = getCurrentDay(username);
  const result = [];
  for (let d = 1; d <= currentDay; d++) {
    const dateStr = getDateForDay(username, d);
    let completed = 0;
    for (const task of tasks) {
      if (isTaskCompletedOnDate(task, dateStr)) completed++;
    }
    result.push({ day: d, date: dateStr, completed });
  }
  return result;
}

function getTaskCompletionPerDay(username, taskId) {
  const task = getTasks(username).find(t => t.id === taskId);
  if (!task) return [];
  const currentDay = getCurrentDay(username);
  const result = [];
  for (let d = 1; d <= currentDay; d++) {
    const dateStr = getDateForDay(username, d);
    result.push(isTaskCompletedOnDate(task, dateStr) ? 1 : 0);
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════
// DOM ELEMENTS
// ═══════════════════════════════════════════════════════════════

const loginView = document.getElementById('login-view');
const dashboardView = document.getElementById('dashboard-view');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const welcomeMsg = document.getElementById('welcome-msg');
const currentDayEl = document.getElementById('current-day');
const dayHeroNumberEl = document.getElementById('day-hero-number');
const dayHeroLabelEl = document.getElementById('day-hero-label');
const dayHeroSubEl = document.getElementById('day-hero-sub');
const logoutBtn = document.getElementById('logout-btn');
const newTaskInput = document.getElementById('new-task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const manualDateWrap = document.getElementById('manual-date-wrap');
const startDatePicker = document.getElementById('start-date-picker');
const saveStartDateBtn = document.getElementById('save-start-date-btn');
const dayInfoText = document.getElementById('day-info-text');
const startDateDisplay = document.getElementById('start-date-display');
const perTaskChartsContainer = document.getElementById('per-task-charts');
const viewDatePicker = document.getElementById('view-date-picker');
const todayBtn = document.getElementById('today-btn');
const dailyChartTitle = document.getElementById('daily-chart-title');
const dailySummary = document.getElementById('daily-summary');
const dailyTaskStatus = document.getElementById('daily-task-status');
const finalChartsSection = document.getElementById('final-charts-section');
const perTaskSection = document.getElementById('per-task-section');

let dailyChart = null;
let totalChart = null;
let finalShareChart = null;
let finalSuccessChart = null;
const perTaskChartInstances = {};
const finalPerTaskDonuts = {};
let currentUsername = null;
let selectedViewDate = null; // date string user is viewing/editing (null = today)

// ═══════════════════════════════════════════════════════════════
// RENDERING
// ═══════════════════════════════════════════════════════════════

function getViewDate(username) {
  const date = selectedViewDate || getTodayStr();
  if (!currentUsername) return getTodayStr();
  if (!isDateInChallengeRange(username, date)) return getTodayStr();
  return date;
}

function renderTaskList(username) {
  const tasks = getTasks(username);
  const viewDate = getViewDate(username);

  if (tasks.length === 0) {
    taskList.innerHTML = '<p class="empty-state">No tasks yet. Add one above!</p>';
    return;
  }

  taskList.innerHTML = tasks.map(task => {
    const completed = isTaskCompletedOnDate(task, viewDate);
    return `
      <li class="task-item ${completed ? 'completed' : ''}" data-task-id="${task.id}">
        <input type="checkbox" class="task-checkbox" ${completed ? 'checked' : ''} 
               aria-label="Mark task as completed for this day">
        <label class="task-label">${escapeHtml(task.title)}</label>
        <button type="button" class="task-delete" aria-label="Delete task">×</button>
      </li>
    `;
  }).join('');

  taskList.querySelectorAll('.task-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      const id = cb.closest('.task-item').dataset.taskId;
      toggleTaskCompletionForDate(username, id, viewDate);
      renderTaskList(username);
      updateAllCharts(username);
    });
  });

  taskList.querySelectorAll('.task-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.closest('.task-item').dataset.taskId;
      removeTask(username, id);
      renderTaskList(username);
      updateAllCharts(username);
    });
  });

  taskList.querySelectorAll('.task-label').forEach(label => {
    label.addEventListener('click', () => {
      const item = label.closest('.task-item');
      const cb = item.querySelector('.task-checkbox');
      cb.checked = !cb.checked;
      cb.dispatchEvent(new Event('change'));
    });
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function updateDailyChart(username) {
  const viewDate = getViewDate(username);
  const { completed, remaining, total } = getProgressCountsForDate(username, viewDate);
  const tasksWithStatus = getTasksWithCompletionForDate(username, viewDate);

  const dayNum = getDayForDate(username, viewDate);
  const isToday = viewDate === getTodayStr();
  dailyChartTitle.textContent = isToday ? 'Today' : `Day ${dayNum} (${formatDate(viewDate)})`;
  dailySummary.textContent = total > 0
    ? `${completed} of ${total} tasks done`
    : 'No tasks yet';

  dailyTaskStatus.innerHTML = tasksWithStatus.length > 0
    ? tasksWithStatus.map(t => `
        <span class="task-status-item ${t.completed ? 'done' : 'pending'}">
          ${t.completed ? '✓' : '○'} ${escapeHtml(t.title)}
        </span>
      `).join('')
    : '';

  const canvas = document.getElementById('daily-chart');
  if (!canvas) return;

  if (!dailyChart) {
    const ctx = canvas.getContext('2d');
    dailyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Completed', 'Remaining'],
        datasets: [{
          label: 'Tasks',
          data: [completed, remaining],
          backgroundColor: ['#0f766e', '#e2e8f0'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
      }
    });
  } else {
    dailyChart.data.datasets[0].data = [completed, remaining];
    dailyChart.update();
  }
}

function updateTotalChart(username) {
  const perDay = getCompletionPerDay(username);
  const labels = perDay.map(d => `Day ${d.day}`);
  const data = perDay.map(d => d.completed);
  const canvas = document.getElementById('total-chart');
  if (!canvas) return;

  if (!totalChart) {
    const ctx = canvas.getContext('2d');
    totalChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Tasks completed',
          data,
          borderColor: '#0f766e',
          backgroundColor: 'rgba(15, 118, 110, 0.08)',
          fill: true,
          tension: 0.3,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } },
          x: { max: 30 }
        }
      }
    });
  } else {
    totalChart.data.labels = labels;
    totalChart.data.datasets[0].data = data;
    totalChart.update();
  }
}

function renderPerTaskCharts(username) {
  const tasks = getTasks(username);
  const ids = Object.keys(perTaskChartInstances);
  ids.forEach(id => {
    try { perTaskChartInstances[id].destroy(); } catch (_) {}
    delete perTaskChartInstances[id];
  });

  if (tasks.length === 0) {
    perTaskChartsContainer.innerHTML = '<p class="empty-state">Add tasks to see per-task progress charts.</p>';
    return;
  }

  const currentDay = getCurrentDay(username);
  const dayLabels = [];
  for (let d = 1; d <= currentDay; d++) dayLabels.push(`Day ${d}`);

  perTaskChartsContainer.innerHTML = tasks.map(task => `
    <div class="per-task-chart-item" data-task-id="${task.id}">
      <h4>${escapeHtml(task.title)}</h4>
      <div class="chart-container">
        <canvas id="task-chart-${task.id}"></canvas>
      </div>
    </div>
  `).join('');

  tasks.forEach(task => {
    const vals = getTaskCompletionPerDay(username, task.id);
    const canvas = document.getElementById(`task-chart-${task.id}`);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    perTaskChartInstances[task.id] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dayLabels,
        datasets: [{
          label: 'Completed',
          data: vals,
          backgroundColor: vals.map(v => v ? '#0f766e' : '#e2e8f0'),
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            min: 0, max: 1,
            ticks: { callback: v => v ? '✓' : '—' }
          },
          x: { max: 30 }
        }
      }
    });
  });
}

function updateAllCharts(username) {
  updateDailyChart(username);
  updateTotalChart(username);
  const currentDay = getCurrentDay(username);
  if (currentDay >= MAX_DAYS) {
    finalChartsSection.classList.remove('hidden');
    perTaskSection.classList.add('hidden');
    renderFinalCharts(username);
  } else {
    finalChartsSection.classList.add('hidden');
    perTaskSection.classList.remove('hidden');
    renderPerTaskCharts(username);
  }
}

function getFinalTaskStats(username) {
  const tasks = getTasks(username);
  const currentDay = Math.min(getCurrentDay(username), MAX_DAYS);
  const totalPossible = tasks.length * currentDay;
  return tasks.map(task => {
    let completed = 0;
    for (let d = 1; d <= currentDay; d++) {
      const dateStr = getDateForDay(username, d);
      if (isTaskCompletedOnDate(task, dateStr)) completed++;
    }
    const rate = currentDay > 0 ? Math.round((completed / currentDay) * 100) : 0;
    return { task, completed, total: currentDay, rate };
  });
}

function renderFinalCharts(username) {
  const stats = getFinalTaskStats(username);
  const totalCompleted = stats.reduce((s, st) => s + st.completed, 0);
  const labels = stats.map(s => s.task.title);
  const data = stats.map(s => s.completed);
  const colors = ['#0f766e', '#14b8a6', '#0ea5e9', '#8b5cf6', '#d97706', '#ec4899', '#06b6d4', '#84cc16', '#6366f1', '#f43f5e'];

  const shareCanvas = document.getElementById('final-share-chart');
  const successCanvas = document.getElementById('final-success-chart');
  if (shareCanvas && stats.length > 0) {
    if (finalShareChart) finalShareChart.destroy();
    finalShareChart = new Chart(shareCanvas.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: data.length ? data : [1],
          backgroundColor: colors.slice(0, Math.max(labels.length, 1)),
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.raw} completions` } }
        }
      }
    });
  }

  if (successCanvas && stats.length > 0) {
    if (finalSuccessChart) finalSuccessChart.destroy();
    const rateData = stats.map(s => s.rate);
    finalSuccessChart = new Chart(successCanvas.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: stats.map(s => `${s.task.title} (${s.rate}%)`),
        datasets: [{
          data: rateData.length ? rateData : [0],
          backgroundColor: colors.slice(0, Math.max(labels.length, 1)),
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.raw}% success rate` } }
        }
      }
    });
  }

  const container = document.getElementById('final-per-task-donuts');
  if (!container) return;
  Object.values(finalPerTaskDonuts).forEach(c => { try { c.destroy(); } catch (_) {} });
  Object.keys(finalPerTaskDonuts).forEach(k => delete finalPerTaskDonuts[k]);

  if (stats.length === 0) {
    container.innerHTML = '<p class="empty-state">No tasks to show final results.</p>';
    return;
  }

  container.innerHTML = stats.map((s, i) => `
    <div class="final-task-donut-card">
      <h4>${escapeHtml(s.task.title)}</h4>
      <p class="final-task-stats">${s.completed}/${s.total} days (${s.rate}%)</p>
      <div class="chart-container chart-donut-sm">
        <canvas id="final-task-${s.task.id}"></canvas>
      </div>
    </div>
  `).join('');

  stats.forEach((s, i) => {
    const canvas = document.getElementById(`final-task-${s.task.id}`);
    if (!canvas) return;
    const completed = s.completed;
    const remaining = s.total - s.completed;
    finalPerTaskDonuts[s.task.id] = new Chart(canvas.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Done', 'Missed'],
        datasets: [{
          data: [completed, remaining],
          backgroundColor: ['#0f766e', '#e2e8f0'],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════

function renderDaySettings(username) {
  const data = getOrCreateUserData(username);
  const day = getCurrentDay(username);
  const startDate = getStartDate(username);

  document.querySelectorAll('input[name="day-mode"]').forEach(r => {
    r.checked = (r.value === data.dayMode);
  });

  if (data.dayMode === 'manual') {
    manualDateWrap.classList.remove('hidden');
    startDatePicker.value = startDate;
  } else {
    manualDateWrap.classList.add('hidden');
  }

  dayInfoText.textContent = `Day ${day} of ${MAX_DAYS}`;
  startDateDisplay.textContent = formatDate(startDate);
}

function formatDate(str) {
  if (!str) return '—';
  const d = new Date(str + 'T12:00:00');
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function setupViewDatePicker(username) {
  const startDate = getStartDate(username);
  const today = getTodayStr();
  viewDatePicker.min = startDate;
  viewDatePicker.max = today;
  viewDatePicker.value = selectedViewDate || today;
}

function updateDayDisplay(username) {
  if (!username) return;
  const viewDate = getViewDate(username);
  const dayNum = getDayForDate(username, viewDate);
  const isToday = viewDate === getTodayStr();

  if (dayHeroNumberEl) dayHeroNumberEl.textContent = `Day ${dayNum}`;
  if (dayHeroLabelEl) dayHeroLabelEl.textContent = isToday ? 'Today' : 'Logging for';
  if (dayHeroSubEl) dayHeroSubEl.textContent = isToday ? 'of 30-day challenge' : 'Click Today to return';
}

function showDashboard(username) {
  currentUsername = username;
  selectedViewDate = getTodayStr();
  loginView.classList.add('hidden');
  dashboardView.classList.remove('hidden');

  const day = getCurrentDay(username);
  welcomeMsg.textContent = username;
  currentDayEl.textContent = `Day ${day}`;

  renderDaySettings(username);
  setupViewDatePicker(username);
  updateDayDisplay(username);
  renderTaskList(username);
  updateAllCharts(username);
}

function showLogin() {
  currentUsername = null;
  selectedViewDate = null;
  dailyChart = null;
  totalChart = null;
  finalShareChart = null;
  finalSuccessChart = null;
  Object.values(perTaskChartInstances).forEach(c => { try { c.destroy(); } catch (_) {} });
  Object.values(finalPerTaskDonuts).forEach(c => { try { c.destroy(); } catch (_) {} });
  Object.keys(perTaskChartInstances).forEach(k => delete perTaskChartInstances[k]);
  Object.keys(finalPerTaskDonuts).forEach(k => delete finalPerTaskDonuts[k]);
  dashboardView.classList.add('hidden');
  loginView.classList.remove('hidden');
  loginError.textContent = '';
  usernameInput.value = '';
  passwordInput.value = '';
  usernameInput.focus();
}

// ═══════════════════════════════════════════════════════════════
// EVENT HANDLERS
// ═══════════════════════════════════════════════════════════════

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  loginError.textContent = '';

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    loginError.textContent = 'Please enter username and password.';
    return;
  }

  if (!validateLogin(username, password)) {
    loginError.textContent = 'Invalid username or password.';
    return;
  }

  setSession(username);
  showDashboard(username);
});

logoutBtn.addEventListener('click', () => {
  clearSession();
  showLogin();
});

document.querySelectorAll('input[name="day-mode"]').forEach(radio => {
  radio.addEventListener('change', () => {
    if (!currentUsername) return;
    const mode = radio.value;
    setDayMode(currentUsername, mode);
    renderDaySettings(currentUsername);
    if (mode === 'manual') {
      startDatePicker.value = getStartDate(currentUsername);
    }
    showDashboard(currentUsername);
  });
});

saveStartDateBtn.addEventListener('click', () => {
  if (!currentUsername) return;
  const dateStr = startDatePicker.value;
  if (!dateStr) return;
  setStartDate(currentUsername, dateStr);
  renderDaySettings(currentUsername);
  setupViewDatePicker(currentUsername);
  const day = getCurrentDay(currentUsername);
  currentDayEl.textContent = `Day ${day}`;
  updateDayDisplay(currentUsername);
  updateAllCharts(currentUsername);
});

function handleAddTask() {
  const title = newTaskInput.value.trim();
  if (!title || !currentUsername) return;

  addTask(currentUsername, title);
  newTaskInput.value = '';
  newTaskInput.focus();
  renderTaskList(currentUsername);
  updateAllCharts(currentUsername);
}

addTaskBtn.addEventListener('click', handleAddTask);

newTaskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleAddTask();
  }
});

viewDatePicker.addEventListener('change', () => {
  if (!currentUsername) return;
  selectedViewDate = viewDatePicker.value;
  updateDayDisplay(currentUsername);
  renderTaskList(currentUsername);
  updateAllCharts(currentUsername);
});

todayBtn.addEventListener('click', () => {
  if (!currentUsername) return;
  selectedViewDate = getTodayStr();
  viewDatePicker.value = selectedViewDate;
  updateDayDisplay(currentUsername);
  renderTaskList(currentUsername);
  updateAllCharts(currentUsername);
});

// ═══════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════

function init() {
  const session = getSession();
  if (session && session.username) {
    // Verify user still exists
    if (USERS.some(u => u.username === session.username)) {
      showDashboard(session.username);
      return;
    }
    clearSession();
  }
  showLogin();
}

init();
