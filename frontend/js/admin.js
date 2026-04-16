// =============================================
// ADMIN.JS — Full CRUD for Admin Panel
// =============================================

let studentsList = [];
let currentDeleteFn = null;
let activeChatPeerId = null;
let chatPollingInterval = null;

// ---- Tab Logic ----
function switchTab(tab) {
  document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.admin-tab').forEach(el => el.classList.remove('active'));
  document.getElementById(`tab-${tab}`).style.display = 'block';
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

  if (tab === 'support') {
    loadConversations();
  } else {
    stopChatPolling();
  }
}

// ---- Modal Logic ----
function openModal(id) {
  document.getElementById(id).classList.add('active');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}
// Close on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(overlay.id); });
});

// =============================================
// STUDENTS CRUD
// =============================================

async function loadStudents() {
  try {
    const res = await apiCall('/students');
    studentsList = res.data;
    filterStudents(); // Use the filter function to render and count
    populateStudentDropdowns(studentsList);
  } catch (err) {
    showToast('Failed to load students: ' + err.message, 'error');
  }
}

function filterStudents() {
  const course = document.getElementById('filterCourse').value;
  const year = document.getElementById('filterYear').value;
  const section = document.getElementById('filterSection').value;

  const filtered = studentsList.filter(s => {
    return (!course || s.course === course) &&
      (!year || String(s.year) === year) &&
      (!section || s.section === section);
  });

  renderStudentsTable(filtered);
  const countEl = document.getElementById('filterCount');
  if (countEl) {
    countEl.textContent = `Showing ${filtered.length} of ${studentsList.length} students`;
  }
}

function renderStudentsTable(students) {
  const tbody = document.getElementById('studentsTableBody');
  if (students.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">No students found.</td></tr>`;
    return;
  }
  tbody.innerHTML = students.map(s => `
    <tr class="fade-in">
      <td style="color:var(--text-muted)">${s.id}</td>
      <td><strong>${s.name}</strong></td>
      <td style="color:var(--text-secondary)">${s.course || '—'}</td>
      <td style="color:var(--text-secondary)">${s.year ? s.year + ' Year' : '—'}</td>
      <td><span class="badge badge-blue">${s.section || '—'}</span></td>
      <td style="color:var(--neon-cyan)">${s.username || '—'}</td>
      <td>
        <div class="flex gap-8">
          <button class="btn btn-ghost btn-sm" onclick="editStudent(${s.id})">
            <i class="fa fa-pen"></i>
          </button>
          <button class="btn btn-danger btn-sm" onclick="confirmDelete('student', ${s.id}, '${s.name}')">
            <i class="fa fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function editStudent(id) {
  const s = studentsList.find(x => x.id === id);
  if (!s) return;
  document.getElementById('studentModalTitle').textContent = 'Edit Student';
  document.getElementById('studentEditId').value = s.id;
  document.getElementById('sName').value = s.name || '';
  document.getElementById('sUsername').value = s.username || '';
  document.getElementById('sPassword').value = '';
  document.getElementById('sCourse').value = s.course || '';
  document.getElementById('sYear').value = s.year || '';
  document.getElementById('sSection').value = s.section || '';
  document.getElementById('sEmail').value = s.email || '';
  document.getElementById('sPhone').value = s.phone || '';
  document.getElementById('sAddress').value = s.address || '';
  openModal('studentModal');
}

function openAddStudentModal() {
  document.getElementById('studentModalTitle').textContent = 'Add Student';
  document.getElementById('studentEditId').value = '';
  ['sName', 'sUsername', 'sPassword', 'sCourse', 'sSection', 'sEmail', 'sPhone', 'sAddress'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('sYear').value = '';
  openModal('studentModal');
}

async function saveStudent() {
  const id = document.getElementById('studentEditId').value;
  const body = {
    name: document.getElementById('sName').value.trim(),
    username: document.getElementById('sUsername').value.trim(),
    password: document.getElementById('sPassword').value,
    course: document.getElementById('sCourse').value.trim(),
    year: document.getElementById('sYear').value,
    section: document.getElementById('sSection').value.trim(),
    email: document.getElementById('sEmail').value.trim(),
    phone: document.getElementById('sPhone').value.trim(),
    address: document.getElementById('sAddress').value.trim()
  };
  if (!body.name) return showToast('Name is required', 'error');

  try {
    if (id) {
      await apiCall(`/students/${id}`, { method: 'PUT', body: JSON.stringify(body) });
      showToast('Student updated successfully', 'success');
    } else {
      if (!body.username || !body.password) return showToast('Username and password are required', 'error');
      await apiCall('/students', { method: 'POST', body: JSON.stringify(body) });
      showToast('Student created successfully', 'success');
    }
    closeModal('studentModal');
    loadStudents();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// =============================================
// GRADES CRUD
// =============================================

async function loadAdminGrades() {
  const studentId = document.getElementById('gradeStudentFilter').value;
  if (!studentId) return;
  try {
    const res = await apiCall(`/grades/${studentId}`);
    const student = studentsList.find(s => s.id == studentId);
    renderAdminGradesTable(res.data, student);
  } catch (err) {
    showToast('Failed to load grades: ' + err.message, 'error');
  }
}

function renderAdminGradesTable(grades, student) {
  const tbody = document.getElementById('gradesAdminTableBody');
  if (grades.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">No grades for this student.</td></tr>`;
    return;
  }
  tbody.innerHTML = grades.map(g => `
    <tr class="fade-in">
      <td style="color:var(--text-muted)">${g.id}</td>
      <td>${student?.name || '—'}</td>
      <td><strong>${g.subject}</strong></td>
      <td><span style="color:var(--neon-cyan);font-weight:700">${parseFloat(g.grade).toFixed(2)}</span></td>
      <td><span class="badge badge-violet">${g.semester || '—'}</span></td>
      <td style="color:var(--text-secondary)">${g.school_year || '—'}</td>
      <td>
        <div class="flex gap-8">
          <button class="btn btn-ghost btn-sm" onclick="editGrade(${JSON.stringify(g).replace(/"/g, '&quot;')})"><i class="fa fa-pen"></i></button>
          <button class="btn btn-danger btn-sm" onclick="confirmDelete('grade', ${g.id}, '${g.subject}')"><i class="fa fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function editGrade(g) {
  document.getElementById('gradeModalTitle').textContent = 'Edit Grade';
  document.getElementById('gradeEditId').value = g.id;
  document.getElementById('gStudentId').value = g.student_id;
  document.getElementById('gSubject').value = g.subject || '';
  document.getElementById('gGrade').value = g.grade || '';
  document.getElementById('gSemester').value = g.semester || '1st Semester';
  document.getElementById('gSchoolYear').value = g.school_year || '';
  openModal('gradeModal');
}

async function saveGrade() {
  const id = document.getElementById('gradeEditId').value;
  const body = {
    student_id: document.getElementById('gStudentId').value,
    subject: document.getElementById('gSubject').value.trim(),
    grade: parseFloat(document.getElementById('gGrade').value),
    semester: document.getElementById('gSemester').value,
    school_year: document.getElementById('gSchoolYear').value.trim()
  };
  if (!body.subject || isNaN(body.grade)) return showToast('Subject and grade are required', 'error');

  try {
    if (id) {
      await apiCall(`/grades/${id}`, { method: 'PUT', body: JSON.stringify(body) });
      showToast('Grade updated', 'success');
    } else {
      await apiCall('/grades', { method: 'POST', body: JSON.stringify(body) });
      showToast('Grade added', 'success');
    }
    closeModal('gradeModal');
    loadAdminGrades();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// =============================================
// SCHEDULES CRUD
// =============================================

async function loadAdminSchedules() {
  const studentId = document.getElementById('schedStudentFilter').value;
  if (!studentId) return;
  try {
    const res = await apiCall(`/schedule/${studentId}`);
    const student = studentsList.find(s => s.id == studentId);
    renderAdminSchedulesTable(res.data, student);
  } catch (err) {
    showToast('Failed to load schedules: ' + err.message, 'error');
  }
}

function renderAdminSchedulesTable(schedules, student) {
  const tbody = document.getElementById('schedulesAdminTableBody');
  if (schedules.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--text-muted)">No schedules for this student.</td></tr>`;
    return;
  }
  tbody.innerHTML = schedules.map(s => `
    <tr class="fade-in">
      <td style="color:var(--text-muted)">${s.id}</td>
      <td>${student?.name || '—'}</td>
      <td><strong>${s.subject}</strong></td>
      <td><span class="badge badge-blue">${s.day}</span></td>
      <td style="color:var(--neon-cyan)">${s.time || '—'}</td>
      <td style="color:var(--text-secondary)">${s.room || '—'}</td>
      <td style="color:var(--text-secondary)">${s.instructor || '—'}</td>
      <td>
        <div class="flex gap-8">
          <button class="btn btn-ghost btn-sm" onclick="editSchedule(${JSON.stringify(s).replace(/"/g, '&quot;')})"><i class="fa fa-pen"></i></button>
          <button class="btn btn-danger btn-sm" onclick="confirmDelete('schedule', ${s.id}, '${s.subject}')"><i class="fa fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function editSchedule(s) {
  document.getElementById('scheduleModalTitle').textContent = 'Edit Schedule';
  document.getElementById('scheduleEditId').value = s.id;
  document.getElementById('scStudentId').value = s.student_id;
  document.getElementById('scSubject').value = s.subject || '';
  document.getElementById('scDay').value = s.day || 'Monday';
  document.getElementById('scTime').value = s.time || '';
  document.getElementById('scRoom').value = s.room || '';
  document.getElementById('scInstructor').value = s.instructor || '';
  openModal('scheduleModal');
}

async function saveSchedule() {
  const id = document.getElementById('scheduleEditId').value;
  const body = {
    student_id: document.getElementById('scStudentId').value,
    subject: document.getElementById('scSubject').value.trim(),
    day: document.getElementById('scDay').value,
    time: document.getElementById('scTime').value.trim(),
    room: document.getElementById('scRoom').value.trim(),
    instructor: document.getElementById('scInstructor').value.trim()
  };
  if (!body.subject) return showToast('Subject is required', 'error');

  try {
    if (id) {
      await apiCall(`/schedule/${id}`, { method: 'PUT', body: JSON.stringify(body) });
      showToast('Schedule updated', 'success');
    } else {
      await apiCall('/schedule', { method: 'POST', body: JSON.stringify(body) });
      showToast('Schedule added', 'success');
    }
    closeModal('scheduleModal');
    loadAdminSchedules();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// =============================================
// ANNOUNCEMENTS CRUD
// =============================================

async function loadAdminAnnouncements() {
  try {
    const res = await apiCall('/announcements');
    renderAdminAnnouncementsTable(res.data);
  } catch (err) {
    showToast('Failed to load announcements: ' + err.message, 'error');
  }
}

function renderAdminAnnouncementsTable(items) {
  const tbody = document.getElementById('announcementsAdminTableBody');
  if (items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted)">No announcements.</td></tr>`;
    return;
  }
  tbody.innerHTML = items.map(a => `
    <tr class="fade-in">
      <td style="color:var(--text-muted)">${a.id}</td>
      <td><strong>${a.title}</strong></td>
      <td><span class="badge badge-cyan">${a.category || 'General'}</span></td>
      <td style="color:var(--text-secondary)">${new Date(a.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
      <td>
        <div class="flex gap-8">
          <button class="btn btn-ghost btn-sm" onclick="editAnnouncement(${JSON.stringify(a).replace(/"/g, '&quot;')})"><i class="fa fa-pen"></i></button>
          <button class="btn btn-danger btn-sm" onclick="confirmDelete('announcement', ${a.id}, '${a.title.replace(/'/g, "\\'")}')"><i class="fa fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function editAnnouncement(a) {
  document.getElementById('announcementModalTitle').textContent = 'Edit Announcement';
  document.getElementById('announcementEditId').value = a.id;
  document.getElementById('aTitle').value = a.title || '';
  document.getElementById('aCategory').value = a.category || 'General';
  document.getElementById('aContent').value = a.content || '';
  openModal('announcementModal');
}

async function saveAnnouncement() {
  const id = document.getElementById('announcementEditId').value;
  const body = {
    title: document.getElementById('aTitle').value.trim(),
    category: document.getElementById('aCategory').value,
    content: document.getElementById('aContent').value.trim()
  };
  if (!body.title || !body.content) return showToast('Title and content are required', 'error');

  try {
    if (id) {
      await apiCall(`/announcements/${id}`, { method: 'PUT', body: JSON.stringify(body) });
      showToast('Announcement updated', 'success');
    } else {
      await apiCall('/announcements', { method: 'POST', body: JSON.stringify(body) });
      showToast('Announcement published', 'success');
    }
    closeModal('announcementModal');
    loadAdminAnnouncements();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// =============================================
// CONFIRM DELETE
// =============================================

function confirmDelete(type, id, name) {
  document.getElementById('confirmMessage').textContent = `Are you sure you want to delete "${name}"? This action cannot be undone.`;
  currentDeleteFn = () => performDelete(type, id);
  openModal('confirmModal');
}

document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
  if (currentDeleteFn) { currentDeleteFn(); currentDeleteFn = null; }
  closeModal('confirmModal');
});

async function performDelete(type, id) {
  const endpoints = { student: '/students', grade: '/grades', schedule: '/schedule', announcement: '/announcements' };
  try {
    await apiCall(`${endpoints[type]}/${id}`, { method: 'DELETE' });
    showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`, 'success');
    if (type === 'student') loadStudents();
    else if (type === 'grade') loadAdminGrades();
    else if (type === 'schedule') loadAdminSchedules();
    else if (type === 'announcement') loadAdminAnnouncements();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// =============================================
// SUPPORT CHAT (FACULTY SIDE)
// =============================================

async function loadConversations() {
  try {
    const res = await apiCall('/chat/conversations');
    if (res.success) {
      renderConversationList(res.data);
    }
  } catch (err) {
    console.error('Chat lookup failure:', err);
  }
}

function renderConversationList(convos) {
  const container = document.getElementById('chatUserList');
  if (!container) return;
  if (!convos.length) {
    container.innerHTML = '<div class="text-muted" style="text-align:center; padding: 20px">No signals found.</div>';
    return;
  }
  container.innerHTML = convos.map(u => `
    <div class="sidebar-user ${activeChatPeerId == u.id ? 'active' : ''}" 
         style="margin-bottom: 8px; border: 1px solid var(--glass-border); ${activeChatPeerId == u.id ? 'background:rgba(14,165,233,0.1)' : ''}" 
         onclick="openChat(${u.id}, '${u.name}')">
      <div class="sidebar-avatar" style="background:var(--gradient-primary)">${u.name.charAt(0)}</div>
      <div class="sidebar-user-info">
        <div class="sidebar-user-name">${u.name}</div>
        <div class="sidebar-user-role">${u.course || 'BSCS'} ${u.year || ''}${u.section || ''}</div>
      </div>
    </div>
  `).join('');
}

async function openChat(peerId, name) {
  activeChatPeerId = peerId;
  const header = document.getElementById('chatHeader');
  if (header) header.innerHTML = `<div class="card-title"><i class="fa fa-comments"></i> Chatting with ${name}</div>`;
  const inputArea = document.getElementById('chatInputArea');
  if (inputArea) inputArea.style.display = 'flex';

  loadConversations();
  loadChatHistory();

  stopChatPolling();
  chatPollingInterval = setInterval(loadChatHistory, 5000);
}

async function loadChatHistory() {
  if (!activeChatPeerId) return;
  try {
    const res = await apiCall(`/chat/history/${activeChatPeerId}`);
    if (res.success) {
      renderChatMessages(res.data);
    }
  } catch (err) {
    console.error('History retrieval failure:', err);
  }
}

function renderChatMessages(msgs) {
  const container = document.getElementById('chatMessages');
  if (!container) return;
  const user = getUser();

  container.innerHTML = msgs.map(m => `
    <div style="display: flex; flex-direction: column; align-items: ${m.sender_id == user.id ? 'flex-end' : 'flex-start'}">
      <div style="max-width: 85%; padding: 12px 16px; border-radius: var(--radius-md); 
                  background: ${m.sender_id == user.id ? 'var(--gradient-primary)' : 'rgba(0,0,0,0.03)'}; 
                  color: ${m.sender_id == user.id ? 'white' : 'var(--text-primary)'};
                  box-shadow: 0 2px 8px rgba(0,0,0,0.05); font-size: 13.5px; line-height: 1.5; border: 1px solid var(--glass-border)">
        ${m.content}
      </div>
      <span style="font-size: 10px; color: var(--text-muted); margin-top: 5px; padding: 0 4px">
        ${new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  `).join('');
  container.scrollTop = container.scrollHeight;
}

async function sendFacultyMessage() {
  const input = document.getElementById('chatInput');
  const content = input.value.trim();
  if (!content || !activeChatPeerId) return;

  try {
    await apiCall('/chat/send', {
      method: 'POST',
      body: JSON.stringify({ receiverId: activeChatPeerId, content })
    });
    input.value = '';
    loadChatHistory();
  } catch (err) {
    showToast('Signal interruption', 'error');
  }
}

function stopChatPolling() {
  if (chatPollingInterval) {
    clearInterval(chatPollingInterval);
    chatPollingInterval = null;
  }
}

// =============================================
// POPULATE DROPDOWNS
// =============================================

function populateStudentDropdowns(students) {
  ['gStudentId', 'scStudentId', 'gradeStudentFilter', 'schedStudentFilter'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const isFilter = id.includes('Filter');
    el.innerHTML = isFilter ? '<option value="">Select Student...</option>' : '';
    students.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id; opt.textContent = `${s.name} (${s.course || 'N/A'})`;
      el.appendChild(opt);
    });
  });
}

// =============================================
// BULK UPLOAD LOGIC (EXCEL)
// =============================================

let selectedBulkFile = null;

function handleFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  selectedBulkFile = file;
  const display = document.getElementById('fileNameDisplay');
  display.textContent = `Selected: ${file.name}`;
  display.style.color = 'var(--neon-cyan)';
  display.parentElement.style.borderColor = 'var(--neon-blue)';
  document.getElementById('processBulkBtn').disabled = false;
}

// Function para sa Delete All Students
async function handleDeleteAllStudents() {
  // 1. Double Confirmation para sa safety
  const firstConfirm = confirm("⚠️ WARNING: Sigurado ka bang gusto mong BURAHIN LAHAT ng students?");
  if (!firstConfirm) return;

  const secondConfirm = confirm("Huling babala: Lahat ng student profiles at login accounts ay mawawala. Sigurado ka na ba?");
  if (!secondConfirm) return;

  try {
    // Kunin ang token (naka-depende kung paano ito kinuha sa auth.js mo)
    const token = localStorage.getItem('token');

    const response = await fetch('http://localhost:3000/api/students/all', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (result.success) {
      // Gumamit ng toast message kung meron ka nito sa admin.js, kung wala, alert na lang
      alert("Sytem Cleared: " + result.message);

      // I-refresh ang listahan o ang buong page
      if (typeof loadStudents === 'function') {
        loadStudents(); // Tawagin ang function na naglo-load ng table
      } else {
        location.reload();
      }
    } else {
      alert("Failed: " + result.message);
    }
  } catch (err) {
    console.error("Delete All Error:", err);
    alert("Error connecting to server. Make sure your backend is running.");
  }
}

async function processBulkUpload() {
  if (!selectedBulkFile) return;
  const btn = document.getElementById('processBulkBtn');
  const originalHtml = btn.innerHTML;
  btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Processing...';
  btn.disabled = true;

  try {
    const data = await selectedBulkFile.arrayBuffer();
    const workbook = XLSX.read(data);
    if (!workbook.SheetNames.length) throw new Error("Excel file is empty or invalid.");

    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const students = XLSX.utils.sheet_to_json(firstSheet);

    if (!students.length) throw new Error("No student data found in the first sheet.");

    const res = await apiCall('/students/bulk', {
      method: 'POST',
      body: JSON.stringify({ students })
    });

    showToast(res.message || 'Bulk upload successful!', 'success');
    closeModal('bulkModal');
    loadStudents();

    // Reset file input
    resetBulkUploadUI();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.innerHTML = originalHtml;
    btn.disabled = false;
  }
}

function resetBulkUploadUI() {
  selectedBulkFile = null;
  document.getElementById('xlsxFile').value = '';
  const display = document.getElementById('fileNameDisplay');
  display.textContent = 'Click to browse or drag and drop';
  display.style.color = '';
  display.parentElement.style.borderColor = '';
  document.getElementById('processBulkBtn').disabled = true;
}

function downloadTemplate() {
  const data = [
    {
      "Student Number": "20240001",
      "Full Name": "Jane Doe",
      "Course": "Bachelor of Science in Information Technology",
      "Year": 1,
      "Section": "A",
      "Email": "jane.doe@example.edu",
      "Phone": "09123456789",
      "Address": "Manila, Philippines"
    },
    {
      "Student Number": "20240002",
      "Full Name": "John Smith",
      "Course": "Bachelor of Science in Computer Science",
      "Year": 2,
      "Section": "B",
      "Email": "john.smith@example.edu",
      "Phone": "09876543210",
      "Address": "Cebu City, Philippines"
    }
  ];
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
  XLSX.writeFile(workbook, "AntiGravity_Student_Template.xlsx");
}

// =============================================
// Init Admin — require faculty role
// =============================================
(function init() {
  const user = getUser();
  if (!user || (user.role !== 'admin' && user.role !== 'professor')) {
    showToast('Faculty access required', 'error');
    setTimeout(() => window.location.href = '/dashboard.html', 1500);
    return;
  }

  // Hide Admin-only features for Professors
  if (user.role === 'professor') {
    document.querySelectorAll('.btn-violet, .btn-primary').forEach(btn => {
      if (btn.textContent.includes('Add Student') || btn.textContent.includes('Bulk Upload')) {
        btn.style.display = 'none';
      }
    });
  }

  loadStudents();
  loadAdminAnnouncements();
})();
