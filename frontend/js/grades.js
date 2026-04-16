// =============================================
// GRADES.JS
// =============================================

let allGrades = [];

function getGradeClass(g) {
  if (g <= 1.5) return 'grade-excellent';
  if (g <= 2.0) return 'grade-good';
  if (g <= 3.0) return 'grade-average';
  return 'grade-poor';
}

function getGradeRemark(g) {
  if (g <= 1.0) return 'Excellent';
  if (g <= 1.5) return 'Very Good';
  if (g <= 2.0) return 'Good';
  if (g <= 2.5) return 'Satisfactory';
  if (g <= 3.0) return 'Passing';
  if (g <= 4.0) return 'Conditional';
  return 'Failed';
}

async function loadGrades() {
  const user = getUser();
  if (!user || !user.studentId) {
    document.getElementById('gradesTableBody').innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">No student profile linked to your account.</td></tr>`;
    return;
  }

  try {
    const res = await apiCall(`/grades/${user.studentId}`);
    allGrades = res.data;
    renderGrades(allGrades);
    updateGradeStats(allGrades);
    populateSemesterFilter(allGrades);
  } catch (err) {
    showToast('Failed to load grades: ' + err.message, 'error');
  }
}

function renderGrades(grades) {
  const tbody = document.getElementById('gradesTableBody');
  if (grades.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:60px;color:var(--text-muted)"><div style="font-size:36px;margin-bottom:10px">📭</div>No grades recorded yet.</td></tr>`;
    return;
  }
  tbody.innerHTML = grades.map((g, i) => `
    <tr class="fade-in" style="animation-delay:${i * 0.05}s">
      <td style="color:var(--text-muted)">${i + 1}</td>
      <td><strong>${g.subject}</strong></td>
      <td><span class="badge badge-violet">${g.semester || '—'}</span></td>
      <td style="color:var(--text-secondary)">${g.school_year || '—'}</td>
      <td><span class="grade-pill ${getGradeClass(parseFloat(g.grade))}">${parseFloat(g.grade).toFixed(2)}</span></td>
      <td style="color:var(--text-secondary);font-size:13px">${getGradeRemark(parseFloat(g.grade))}</td>
    </tr>
  `).join('');
}

function updateGradeStats(grades) {
  if (grades.length === 0) {
    ['gpaValue','subjectCount','highestGrade','lowestGrade'].forEach(id => document.getElementById(id).textContent = '—');
    return;
  }
  const vals = grades.map(g => parseFloat(g.grade));
  const gpa  = (vals.reduce((s,v) => s+v, 0) / vals.length).toFixed(2);
  const best = Math.min(...vals);
  const worst= Math.max(...vals);
  const bestG  = grades.find(g => parseFloat(g.grade) === best);
  const worstG = grades.find(g => parseFloat(g.grade) === worst);

  document.getElementById('gpaValue').textContent   = gpa;
  document.getElementById('gpaRemark').textContent  = getGradeRemark(parseFloat(gpa));
  document.getElementById('subjectCount').textContent = grades.length;
  document.getElementById('highestGrade').textContent = best.toFixed(2);
  document.getElementById('highestSubject').textContent = bestG?.subject || '—';
  document.getElementById('lowestGrade').textContent  = worst.toFixed(2);
  document.getElementById('lowestSubject').textContent = worstG?.subject || '—';
}

function populateSemesterFilter(grades) {
  const filter = document.getElementById('semesterFilter');
  const semesters = [...new Set(grades.map(g => g.semester).filter(Boolean))];
  semesters.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s; opt.textContent = s;
    filter.appendChild(opt);
  });
  filter.addEventListener('change', () => {
    const val = filter.value;
    renderGrades(val ? allGrades.filter(g => g.semester === val) : allGrades);
  });
}

loadGrades();
