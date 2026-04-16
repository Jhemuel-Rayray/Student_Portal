// =============================================
// ANNOUNCEMENTS.JS
// =============================================

const CATEGORY_COLORS = {
  Academic:    'badge-blue',
  Examination: 'badge-violet',
  Financial:   'badge-green',
  Events:      'badge-cyan',
  General:     'badge-pink'
};

const CATEGORY_ICONS = {
  Academic:    '📚',
  Examination: '📝',
  Financial:   '💰',
  Events:      '🎉',
  General:     '📣'
};

let allAnnouncements = [];

async function loadAnnouncements() {
  try {
    const res = await apiCall('/announcements');
    allAnnouncements = res.data;
    renderAnnouncements(allAnnouncements);
  } catch (err) {
    showToast('Failed to load announcements: ' + err.message, 'error');
  }
}

function renderAnnouncements(items) {
  const feed = document.getElementById('announcementFeed');
  if (!feed) return;

  if (items.length === 0) {
    feed.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-text">No announcements found.</div></div>`;
    return;
  }

  feed.innerHTML = items.map((a, i) => {
    const colorClass = CATEGORY_COLORS[a.category] || 'badge-pink';
    const icon = CATEGORY_ICONS[a.category] || '📣';
    return `
      <div class="announcement-card fade-in" style="animation-delay:${i * 0.07}s">
        <div class="announcement-header">
          <div>
            <span class="badge ${colorClass}" style="margin-bottom:8px;display:inline-flex">${icon} ${a.category || 'General'}</span>
            <div class="announcement-title">${a.title}</div>
          </div>
          <div class="announcement-date">${formatDate(a.date)}</div>
        </div>
        <div class="announcement-body">${a.content}</div>
      </div>
    `;
  }).join('');
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-PH', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
}

// Category filter
const categoryFilter = document.getElementById('categoryFilter');
if (categoryFilter) {
  categoryFilter.addEventListener('change', () => {
    const val = categoryFilter.value;
    renderAnnouncements(val ? allAnnouncements.filter(a => a.category === val) : allAnnouncements);
  });
}

loadAnnouncements();
