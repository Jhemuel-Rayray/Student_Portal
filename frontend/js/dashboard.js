// =============================================
// DASHBOARD.JS (Updated with Security & Helpers)
// =============================================

async function loadDashboard() {
  const user = getUser();
  const token = localStorage.getItem('token');

  // 1. Security Check: Pag walang token, balik sa login
  if (!user || !token) {
    window.location.href = 'index.html';
    return;
  }

  // Greet user agad gamit ang data sa localStorage
  const greetEl = document.getElementById('topGreeting');
  if (greetEl) greetEl.textContent = user.name || user.username;

  try {
    // 2. API Call to Dashboard
    const res = await apiCall('/students/dashboard');

    if (!res.success) {
      // Kung expired ang token, logout agad
      if (res.message.toLowerCase().includes('token') || res.message.toLowerCase().includes('unauthorized')) {
        handleLogout();
        return;
      }
      throw new Error(res.message);
    }

    const { student, gradesSummary, scheduleCount, recentAnnouncements } = res.data;

    // 3. Render Stats (GPA, Schedule, etc.)
    renderStats(gradesSummary, scheduleCount, recentAnnouncements);

    // 4. Render Student Profile Info
    renderStudentInfo(student);

    // 5. Render Announcements
    renderAnnouncements(recentAnnouncements);

    // 6. Load Extra Features
    if (user.studentId || student?.id) {
      await loadTodaySchedule(user.studentId || student.id);
    }
    fetchAiMotivation();

  } catch (err) {
    console.error("Dashboard Load Error:", err);
    // Mas malinaw na error message para sa UI
    const errorMessage = err.message === 'Failed to fetch' ? 'Cannot connect to server' : err.message;
    showToast('Dashboard Error: ' + errorMessage, 'error');
  }
}

// --- Rendering Sub-functions ---

function renderStats(grades, schedules, announcements) {
  const elGpa = document.getElementById('statGPA');
  if (elGpa) elGpa.textContent = grades?.gpa ?? '—';

  const elGpaSub = document.getElementById('statGPAStatus');
  if (elGpaSub) elGpaSub.textContent = grades?.gpa ? getGpaRemark(grades.gpa) : 'No grades yet';

  const elSchedule = document.getElementById('statSchedule');
  if (elSchedule) elSchedule.textContent = schedules || 0;

  const elAnnounce = document.getElementById('statAnnouncements');
  if (elAnnounce) elAnnounce.textContent = announcements?.length || 0;
}

function renderStudentInfo(student) {
  const infoBody = document.getElementById('studentInfoBody');
  if (!infoBody) return;

  if (student) {
    infoBody.innerHTML = `
            <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">
                <div style="width:60px;height:60px;border-radius:50%;background:var(--gradient-accent);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;box-shadow:var(--glow-violet);color:white">
                    ${student.name ? student.name.charAt(0) : '?'}
                </div>
                <div>
                    <div style="font-size:18px;font-weight:700">${student.name}</div>
                    <div style="font-size:13px;color:var(--neon-cyan)">${student.course || 'Course not set'}</div>
                </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                ${infoRow('Year Level', student.year ? `${student.year}${ordinal(student.year)} Year` : '—')}
                ${infoRow('Section', student.section || '—')}
                ${infoRow('Email', student.email || '—')}
                ${infoRow('Phone', student.phone || '—')}
            </div>
        `;
  } else {
    infoBody.innerHTML = `<div class="empty-state"><div class="empty-state-icon">👤</div><div class="empty-state-text">No student profile linked</div></div>`;
  }
}

function renderAnnouncements(announcements) {
  const announceEl = document.getElementById('dashAnnouncements');
  if (!announceEl) return;

  if (!announcements || announcements.length === 0) {
    announceEl.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-text">No announcements</div></div>`;
  } else {
    announceEl.innerHTML = announcements.map(a => `
            <div class="announcement-card" style="margin-bottom:12px">
                <div class="announcement-header">
                    <div class="announcement-title">${a.title}</div>
                    <div class="announcement-date">${formatDate(a.date)}</div>
                </div>
                <div class="announcement-body" style="font-size:13px; color:var(--text-muted)">${truncate(a.content, 100)}</div>
            </div>
        `).join('');
  }
}

// --- Helper Functions ---

async function fetchAiMotivation() {
  const textEl = document.getElementById('aiMotivationText');
  if (!textEl) return;
  try {
    const res = await apiCall('/ai/motivation');
    if (res.success) {
      typeEffect(textEl, res.message);
    }
  } catch (err) {
    textEl.textContent = "Your journey is unique. Every grade is a data point for your future breakthrough.";
  }
}

async function loadTodaySchedule(studentId) {
  const bodyEl = document.getElementById('todayScheduleBody');
  if (!bodyEl) return;

  try {
    const res = await apiCall(`/schedule/${studentId}`);
    const today = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
    const todayClasses = res.data ? res.data.filter(s => s.day === today) : [];

    if (todayClasses.length === 0) {
      bodyEl.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🎉</div><div class="empty-state-text">No classes today (${today})!</div></div>`;
    } else {
      bodyEl.innerHTML = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">
                ${todayClasses.map(s => `
                    <div class="schedule-slot">
                        <div class="schedule-subject">${s.subject}</div>
                        <div class="schedule-time">🕐 ${s.time}</div>
                        <div class="schedule-room">📍 ${s.room || 'TBA'}</div>
                    </div>
                `).join('')}
            </div>`;
    }
  } catch (err) {
    bodyEl.innerHTML = `<div class="empty-state"><div class="empty-state-text">Could not load schedule</div></div>`;
  }
}

function typeEffect(el, text) {
  let i = 0;
  el.textContent = "";
  const timer = setInterval(() => {
    if (i < text.length) {
      el.textContent += text.charAt(i);
      i++;
    } else {
      clearInterval(timer);
    }
  }, 30);
}

function infoRow(label, value) {
  return `<div><div style="font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:2px">${label}</div><div style="font-size:14px;font-weight:600">${value}</div></div>`;
}

function ordinal(n) {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

function getGpaRemark(gpa) {
  const g = parseFloat(gpa);
  if (g <= 1.25) return '🏆 Magna Cum Laude';
  if (g <= 1.5) return '⭐ Cum Laude';
  if (g <= 3.0) return '✅ Passing';
  return '⚠️ Needs Improvement';
}

function formatDate(d) { return new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }); }

function truncate(str, n) { return str && str.length > n ? str.slice(0, n) + '...' : str; }

function handleLogout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

// Initialize
document.addEventListener('DOMContentLoaded', loadDashboard);