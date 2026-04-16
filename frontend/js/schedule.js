// =============================================
// SCHEDULE.JS
// =============================================

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const DAY_COLORS = ['','violet','cyan','','violet','cyan'];

async function loadSchedule() {
  const user = getUser();
  if (!user || !user.studentId) {
    document.getElementById('scheduleGrid').innerHTML   = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">📅</div><div class="empty-state-text">No student profile linked</div></div>`;
    document.getElementById('scheduleTableBody').innerHTML = `<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted)">No schedule found.</td></tr>`;
    return;
  }

  // Set today label
  const today = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];
  const dayLabel = document.getElementById('currentDayLabel');
  if (dayLabel) dayLabel.textContent = `Today: ${today}`;

  try {
    const res = await apiCall(`/schedule/${user.studentId}`);
    const schedules = res.data;

    renderScheduleGrid(schedules, today);
    renderScheduleTable(schedules);
  } catch (err) {
    showToast('Failed to load schedule: ' + err.message, 'error');
  }
}

function renderScheduleGrid(schedules, today) {
  const grid = document.getElementById('scheduleGrid');
  const grouped = {};
  DAYS.forEach(d => { grouped[d] = []; });
  schedules.forEach(s => { if (grouped[s.day]) grouped[s.day].push(s); });

  const daysWithData = DAYS.filter(d => grouped[d].length > 0);

  if (daysWithData.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">📭</div><div class="empty-state-text">No schedule recorded</div></div>`;
    return;
  }

  grid.innerHTML = daysWithData.map((day, i) => `
    <div class="day-column">
      <div class="day-header ${day === today ? 'cyan' : (i % 3 === 1 ? 'violet' : '')}" style="${day === today ? 'box-shadow:0 0 20px rgba(6,255,212,0.4)' : ''}">
        ${day === today ? '📍 ' : ''}${day}
      </div>
      ${grouped[day].map(s => `
        <div class="schedule-slot">
          <div class="schedule-subject">${s.subject}</div>
          <div class="schedule-time">🕐 ${s.time || 'TBA'}</div>
          <div class="schedule-room">📍 ${s.room || 'TBA'}</div>
          <div class="schedule-instructor">👨‍🏫 ${s.instructor || 'TBA'}</div>
        </div>
      `).join('')}
    </div>
  `).join('');
}

function renderScheduleTable(schedules) {
  const tbody = document.getElementById('scheduleTableBody');
  if (schedules.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted)">No schedule found.</td></tr>`;
    return;
  }
  tbody.innerHTML = schedules.map((s, i) => `
    <tr class="fade-in" style="animation-delay:${i * 0.05}s">
      <td><strong>${s.subject}</strong></td>
      <td><span class="badge badge-blue">${s.day}</span></td>
      <td style="color:var(--neon-cyan)">${s.time || 'TBA'}</td>
      <td style="color:var(--text-secondary)">${s.room || 'TBA'}</td>
      <td style="color:var(--text-secondary)">${s.instructor || 'TBA'}</td>
    </tr>
  `).join('');
}

loadSchedule();
