// ===== Student Dashboard Module =====
// Handles student dashboard stats, recent grievances, and priority distribution

/**
 * Load student dashboard data
 */
async function loadStudentDashboard() {
  try {
    const data = await apiRequest('/grievances/stats');
    if (!data) return;

    // Update stat cards
    document.getElementById('stat-total').textContent = data.total || 0;
    document.getElementById('stat-pending').textContent = data.pending || 0;
    document.getElementById('stat-progress').textContent = data.inProgress || 0;
    document.getElementById('stat-resolved').textContent = data.resolved || 0;

    // Update grievance count badge
    const badge = document.getElementById('grievance-count-badge');
    if (badge) badge.textContent = data.total || 0;

    // Update priority distribution bars
    updatePriorityBars(data.priority || {});

    // Load recent grievances
    loadRecentGrievances();

  } catch (err) {
    console.error('Failed to load dashboard:', err);
    showToast('Failed to load dashboard data', 'error');
  }
}

/**
 * Update animated priority bars
 */
function updatePriorityBars(priority) {
  const total = (priority.Low || 0) + (priority.Medium || 0) + (priority.High || 0) + (priority.Critical || 0);

  const priorities = ['low', 'medium', 'high', 'critical'];
  priorities.forEach(p => {
    const count = priority[p.charAt(0).toUpperCase() + p.slice(1)] || 0;
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

    const countEl = document.getElementById(`priority-${p}-count`);
    const barEl = document.getElementById(`priority-${p}-bar`);

    if (countEl) countEl.textContent = count;
    if (barEl) {
      // Animate after a short delay
      setTimeout(() => {
        barEl.style.width = percentage + '%';
      }, 200);
    }
  });
}

/**
 * Load recent grievances (latest 5)
 */
async function loadRecentGrievances() {
  try {
    const data = await apiRequest('/grievances?limit=5&sort=created_at&order=desc');
    if (!data || !data.grievances) return;

    const recentEmpty = document.getElementById('recent-empty');
    const recentTable = document.getElementById('recent-table');
    const tbody = document.getElementById('recent-tbody');

    if (data.grievances.length === 0) {
      if (recentEmpty) recentEmpty.style.display = 'block';
      if (recentTable) recentTable.style.display = 'none';
      return;
    }

    if (recentEmpty) recentEmpty.style.display = 'none';
    if (recentTable) recentTable.style.display = 'table';

    tbody.innerHTML = data.grievances.map(g => `
      <tr>
        <td>${escapeHtml(g.ticket_id)}</td>
        <td style="color: var(--text-primary); max-width: 200px; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(g.title)}</td>
        <td><span class="badge badge-${getStatusClass(g.status)}">${escapeHtml(g.status)}</span></td>
        <td><span class="badge badge-${g.priority.toLowerCase()}">${escapeHtml(g.priority)}</span></td>
        <td>${formatDate(g.created_at)}</td>
      </tr>
    `).join('');

  } catch (err) {
    console.error('Failed to load recent grievances:', err);
  }
}

/**
 * Get CSS class for status badge
 */
function getStatusClass(status) {
  const map = {
    'Pending': 'pending',
    'In Progress': 'in-progress',
    'Resolved': 'resolved',
    'Rejected': 'rejected'
  };
  return map[status] || 'pending';
}

/**
 * Format date to readable string
 */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
