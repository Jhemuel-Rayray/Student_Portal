// =============================================
// PROFILE.JS
// =============================================

async function loadProfile() {
  const user = getUser();
  if (!user) return;

  if (!user.studentId) {
    document.getElementById('profileIdCard').innerHTML = `<div class="empty-state" style="width:100%;text-align:center"><div class="empty-state-icon">👤</div><div class="empty-state-text">No student profile linked to your account.</div></div>`;
    hideSections();
    return;
  }

  try {
    const res = await apiCall(`/students/profile/${user.studentId}`);
    const s = res.data;

    renderIdCard(s);
    renderContactInfo(s);
    renderAcademicInfo(s, user.studentId);
  } catch (err) {
    showToast('Failed to load profile: ' + err.message, 'error');
  }
}

function renderIdCard(s) {
  const card = document.getElementById('profileIdCard');
  card.innerHTML = `
    <div class="profile-avatar-large">${s.name.charAt(0)}</div>
    <div class="profile-info">
      <div class="profile-name gradient-text">${s.name}</div>
      <div class="profile-course">${s.course || 'Course not set'}</div>
      <div>
        <span class="badge badge-blue" style="margin-right:8px">Student</span>
        <span class="badge badge-violet">${s.username}</span>
      </div>
      <div class="profile-meta-grid">
        <div class="profile-meta-item">
          <div class="profile-meta-label">Year Level</div>
          <div class="profile-meta-value">${s.year ? s.year + ordinal(s.year) + ' Year' : '—'}</div>
        </div>
        <div class="profile-meta-item">
          <div class="profile-meta-label">Section</div>
          <div class="profile-meta-value">${s.section || '—'}</div>
        </div>
        <div class="profile-meta-item">
          <div class="profile-meta-label">Status</div>
          <div class="profile-meta-value text-green">Active</div>
        </div>
      </div>
    </div>
  `;
}

function renderContactInfo(s) {
  const el = document.getElementById('contactInfoBody');
  el.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:16px">
      ${contactRow('✉️', 'Email', s.email || 'Not provided')}
      ${contactRow('📞', 'Phone', s.phone || 'Not provided')}
      ${contactRow('📍', 'Address', s.address || 'Not provided')}
    </div>
  `;
}

async function renderAcademicInfo(s, studentId) {
  let gradeInfo = '—';
  let subjectCount = '—';
  try {
    const res = await apiCall(`/grades/${studentId}`);
    const grades = res.data;
    subjectCount = grades.length;
    if (grades.length > 0) {
      const gpa = (grades.reduce((sum, g) => sum + parseFloat(g.grade), 0) / grades.length).toFixed(2);
      gradeInfo = `${gpa} (${getGpaRemark(parseFloat(gpa))})`;
    }
  } catch (_) {}

  const el = document.getElementById('academicInfoBody');
  el.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:16px">
      ${contactRow('🎓', 'Course', s.course || 'Not set')}
      ${contactRow('📅', 'Year & Section', `${s.year ? s.year + ordinal(s.year) + ' Year' : '—'} — Section ${s.section || '—'}`)}
      ${contactRow('📚', 'Enrolled Subjects', String(subjectCount))}
      ${contactRow('🏆', 'Current GPA', gradeInfo)}
    </div>
  `;
}

function contactRow(icon, label, value) {
  return `
    <div style="display:flex;align-items:flex-start;gap:14px">
      <div style="width:36px;height:36px;border-radius:10px;background:rgba(0,212,255,0.08);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">${icon}</div>
      <div>
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted);margin-bottom:2px">${label}</div>
        <div style="font-size:14px;font-weight:500">${value}</div>
      </div>
    </div>
  `;
}

function hideSections() {
  const grid = document.querySelector('.profile-grid');
  if (grid) grid.style.display = 'none';
}

function ordinal(n) { return ['th','st','nd','rd'][((n%100-20)%10)||n%100>10?0:n%10]||'th'; }
function getGpaRemark(g) {
  if (g <= 1.25) return 'Magna Cum Laude';
  if (g <= 1.5)  return 'Cum Laude';
  if (g <= 2.0)  return 'Good';
  if (g <= 3.0)  return 'Satisfactory';
  return 'Needs Improvement';
}

loadProfile();
