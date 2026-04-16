// =============================================
// DASHBOARD.JS
// =============================================

async function loadDashboard() {
  const user = getUser();
  if (!user) return;

  // Greet user
  const greetEl = document.getElementById('topGreeting');
  if (greetEl) greetEl.textContent = user.name || user.username;

  try {
    const res = await apiCall('/students/dashboard');
    const { student, gradesSummary, scheduleCount, recentAnnouncements } = res.data;

    // Stats
    const elGpa = document.getElementById('statGPA');
    if (elGpa) elGpa.textContent = gradesSummary.gpa ?? '—';
    
    const elGpaSub = document.getElementById('statGPAStatus');
    if (elGpaSub) elGpaSub.textContent = gradesSummary.gpa ? getGpaRemark(gradesSummary.gpa) : 'No grades yet';
    
    const elSchedule = document.getElementById('statSchedule');
    if (elSchedule) elSchedule.textContent = scheduleCount;
    
    const elAnnounce = document.getElementById('statAnnouncements');
    if (elAnnounce) elAnnounce.textContent = recentAnnouncements.length;

    // Student Info
    const infoBody = document.getElementById('studentInfoBody');
    if (student && infoBody) {
      infoBody.innerHTML = `
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">
          <div style="width:60px;height:60px;border-radius:50%;background:var(--gradient-accent);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;box-shadow:var(--glow-violet)">
            ${student.name.charAt(0)}
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
    } else if (infoBody) {
      infoBody.innerHTML = `<div class="empty-state"><div class="empty-state-icon">👤</div><div class="empty-state-text">No student profile linked</div></div>`;
    }

    // Announcements
    const announceEl = document.getElementById('dashAnnouncements');
    if (announceEl) {
      if (recentAnnouncements.length === 0) {
        announceEl.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-text">No announcements</div></div>`;
      } else {
        announceEl.innerHTML = recentAnnouncements.map(a => `
          <div class="announcement-card" style="margin-bottom:0">
            <div class="announcement-header">
              <div class="announcement-title">${a.title}</div>
              <div class="announcement-date">${formatDate(a.date)}</div>
            </div>
            <div class="announcement-body">${truncate(a.content, 100)}</div>
          </div>
        `).join('');
      }
    }

    // Today's schedule
    await loadTodaySchedule(user.studentId);
    fetchAiMotivation();

  } catch (err) {
    showToast('Failed to load dashboard: ' + err.message, 'error');
  }
}

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

async function loadTodaySchedule(studentId) {
  if (!studentId) {
    document.getElementById('todayScheduleBody').innerHTML = `<div class="empty-state"><div class="empty-state-icon">📅</div><div class="empty-state-text">No schedule linked to your account</div></div>`;
    return;
  }
  try {
    const res = await apiCall(`/schedule/${studentId}`);
    const today = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];
    const todayClasses = res.data.filter(s => s.day === today);
    const bodyEl = document.getElementById('todayScheduleBody');

    if (todayClasses.length === 0) {
      bodyEl.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🎉</div><div class="empty-state-text">No classes today (${today})!</div></div>`;
    } else {
      bodyEl.innerHTML = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">
        ${todayClasses.map(s => `
          <div class="schedule-slot">
            <div class="schedule-subject">${s.subject}</div>
            <div class="schedule-time">🕐 ${s.time}</div>
            <div class="schedule-room">📍 ${s.room || 'TBA'}</div>
            <div class="schedule-instructor">👨‍🏫 ${s.instructor || 'TBA'}</div>
          </div>
        `).join('')}
      </div>`;
    }
  } catch (err) {
    document.getElementById('todayScheduleBody').innerHTML = `<div class="empty-state"><div class="empty-state-text">Could not load schedule</div></div>`;
  }
}

// ---- Helpers ----
function infoRow(label, value) {
  return `<div><div style="font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:2px">${label}</div><div style="font-size:14px;font-weight:600">${value}</div></div>`;
}
function ordinal(n) { return ['th','st','nd','rd'][((n%100-20)%10)||n%100>10?0:n%10]||'th'; }
function getGpaRemark(gpa) {
  const g = parseFloat(gpa);
  if (g <= 1.25) return '🏆 Magna Cum Laude';
  if (g <= 1.5)  return '⭐ Cum Laude';
  if (g <= 2.0)  return '✅ Good';
  if (g <= 3.0)  return '👍 Satisfactory';
  return '⚠️ Needs Improvement';
}
function formatDate(d) { return new Date(d).toLocaleDateString('en-PH', { month:'short', day:'numeric', year:'numeric' }); }
function truncate(str, n) { return str && str.length > n ? str.slice(0, n) + '...' : str; }

loadDashboard();
