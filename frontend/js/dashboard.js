// =============================================
// DASHBOARD.JS (Updated with Token Handling)
// =============================================

async function loadDashboard() {
  const user = getUser();
  // Kung walang user (o token) sa localstorage, balik sa login
  if (!user || !localStorage.getItem('token')) {
    window.location.href = 'index.html';
    return;
  }

  // Greet user
  const greetEl = document.getElementById('topGreeting');
  if (greetEl) greetEl.textContent = user.name || user.username;

  try {
    // Kinukuha ang dashboard data mula sa API
    const res = await apiCall('/students/dashboard');

    // Check kung naging matagumpay ang API call
    if (!res.success) {
      if (res.message.includes('token')) {
        handleLogout(); // I-logout kung invalid ang token
      }
      throw new Error(res.message);
    }

    const { student, gradesSummary, scheduleCount, recentAnnouncements } = res.data;

    // --- Stats Rendering ---
    const elGpa = document.getElementById('statGPA');
    if (elGpa) elGpa.textContent = gradesSummary?.gpa ?? '—';

    const elGpaSub = document.getElementById('statGPAStatus');
    if (elGpaSub) elGpaSub.textContent = gradesSummary?.gpa ? getGpaRemark(gradesSummary.gpa) : 'No grades yet';

    const elSchedule = document.getElementById('statSchedule');
    if (elSchedule) elSchedule.textContent = scheduleCount || 0;

    const elAnnounce = document.getElementById('statAnnouncements');
    if (elAnnounce) elAnnounce.textContent = recentAnnouncements?.length || 0;

    // --- Student Info Rendering ---
    const infoBody = document.getElementById('studentInfoBody');
    if (student && infoBody) {
      infoBody.innerHTML = `
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">
          <div style="width:60px;height:60px;border-radius:50%;background:var(--gradient-accent);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;box-shadow:var(--glow-violet);color:white">
            ${student.name ? student.name.charAt(0) : '?'}
          </div>
          <div>
            <div style="font-size:18px;font-weight:700">${student.name || 'Student Name'}</div>
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

    // --- Announcements Rendering ---
    const announceEl = document.getElementById('dashAnnouncements');
    if (announceEl) {
      if (!recentAnnouncements || recentAnnouncements.length === 0) {
        announceEl.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-text">No announcements</div></div>`;
      } else {
        announceEl.innerHTML = recentAnnouncements.map(a => `
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

    // --- Load Other Parts ---
    if (user.studentId) {
      await loadTodaySchedule(user.studentId);
    }
    fetchAiMotivation();

  } catch (err) {
    console.error("Dashboard Load Error:", err);
    showToast('Failed to load dashboard: ' + err.message, 'error');
  }
}

// ... (Rest of your helper functions: fetchAiMotivation, typeEffect, loadTodaySchedule, etc.)

function handleLogout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

// Siguraduhin na tinatawag ang dashboard pagka-load ng script
document.addEventListener('DOMContentLoaded', loadDashboard);