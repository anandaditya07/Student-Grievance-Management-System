// ===== Admin Module =====
// Handles admin dashboard, admin panel, manage grievances, charts

// Store all grievances for admin filtering
let adminGrievances = [];
let currentManageId = null;
let selectedStatus = null;

// Chart instances
let priorityChart = null;
let categoryChart = null;
let monthlyChart = null;

// ===========================
// Admin Dashboard Functions
// ===========================

/**
 * Load admin dashboard data
 */
async function loadAdminDashboard() {
  try {
    const data = await apiRequest('/grievances/stats');
    if (!data) return;

    // Update stat cards with animated count
    animateCounter('stat-total', data.total || 0);
    animateCounter('stat-pending', data.pending || 0);
    animateCounter('stat-progress', data.inProgress || 0);
    animateCounter('stat-resolved', data.resolved || 0);

    // Load charts
    renderPriorityChart(data.priority || {});
    renderCategoryChart(data.category || {});
    renderMonthlyChart(data.monthly || []);

    // Load recent grievances
    loadAdminRecentGrievances();

  } catch (err) {
    console.error('Failed to load admin dashboard:', err);
    showToast('Failed to load dashboard data', 'error');
  }
}

/**
 * Animate counter from 0 to target value
 */
function animateCounter(elementId, target) {
  const el = document.getElementById(elementId);
  if (!el) return;

  let current = 0;
  const increment = Math.ceil(target / 30);
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = current;
  }, 30);
}

/**
 * Load recent grievances for admin dashboard
 */
async function loadAdminRecentGrievances() {
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
        <td style="color: var(--text-primary); max-width: 180px; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(g.title)}</td>
        <td>${escapeHtml(g.student_name)}</td>
        <td><span class="badge badge-${getStatusClass(g.status)}">${escapeHtml(g.status)}</span></td>
        <td><span class="badge badge-${g.priority.toLowerCase()}">${escapeHtml(g.priority)}</span></td>
        <td>${formatDate(g.created_at)}</td>
      </tr>
    `).join('');

  } catch (err) {
    console.error('Failed to load recent grievances:', err);
  }
}

// ===========================
// Chart.js Rendering
// ===========================

/**
 * Render priority distribution doughnut chart
 */
function renderPriorityChart(priority) {
  const canvas = document.getElementById('priority-chart');
  if (!canvas) return;

  if (priorityChart) priorityChart.destroy();

  const ctx = canvas.getContext('2d');
  priorityChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Low', 'Medium', 'High', 'Critical'],
      datasets: [{
        data: [
          priority.Low || 0,
          priority.Medium || 0,
          priority.High || 0,
          priority.Critical || 0
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#94a3b8',
            font: { family: 'Inter', size: 12 },
            padding: 16,
            usePointStyle: true,
            pointStyleWidth: 10
          }
        }
      },
      cutout: '60%'
    }
  });
}

/**
 * Render category distribution bar chart
 */
function renderCategoryChart(category) {
  const canvas = document.getElementById('category-chart');
  if (!canvas) return;

  if (categoryChart) categoryChart.destroy();

  const labels = Object.keys(category);
  const values = Object.values(category);

  const ctx = canvas.getContext('2d');
  categoryChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Grievances',
        data: values,
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
        borderRadius: 6,
        maxBarThickness: 40
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: {
            color: '#94a3b8',
            font: { family: 'Inter', size: 11 },
            stepSize: 1
          }
        }
      }
    }
  });
}

/**
 * Render monthly trends line chart
 */
function renderMonthlyChart(monthly) {
  const canvas = document.getElementById('monthly-chart');
  if (!canvas) return;

  if (monthlyChart) monthlyChart.destroy();

  // Generate last 6 months labels if no data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let labels = [];
  let values = [];

  if (monthly && monthly.length > 0) {
    labels = monthly.map(m => m.month);
    values = monthly.map(m => m.count);
  } else {
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(months[d.getMonth()] + ' ' + d.getFullYear());
      values.push(0);
    }
  }

  const ctx = canvas.getContext('2d');
  monthlyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Grievances',
        data: values,
        borderColor: 'rgba(139, 92, 246, 1)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: 'rgba(139, 92, 246, 1)',
        pointBorderColor: '#151b2e',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: {
            color: '#94a3b8',
            font: { family: 'Inter', size: 11 },
            stepSize: 1
          }
        }
      }
    }
  });
}

// ===========================
// Admin Panel Functions
// ===========================

/**
 * Load all grievances for admin panel
 */
async function loadAdminGrievances() {
  try {
    const data = await apiRequest('/grievances');
    if (!data) return;

    adminGrievances = data.grievances || [];
    renderAdminTable(adminGrievances);

  } catch (err) {
    console.error('Failed to load grievances:', err);
    showToast('Failed to load grievances', 'error');
  }
}

/**
 * Render admin grievances table
 */
function renderAdminTable(grievances) {
  const tbody = document.getElementById('admin-tbody');
  const table = document.getElementById('admin-table');
  const emptyMsg = document.getElementById('no-admin-msg');

  if (!tbody) return;

  if (grievances.length === 0) {
    if (table) table.style.display = 'none';
    if (emptyMsg) emptyMsg.classList.remove('hidden');
    return;
  }

  if (table) table.style.display = 'table';
  if (emptyMsg) emptyMsg.classList.add('hidden');

  tbody.innerHTML = grievances.map(g => `
    <tr>
      <td>${escapeHtml(g.ticket_id)}</td>
      <td style="color: var(--text-primary); max-width: 180px; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(g.title)}</td>
      <td>${escapeHtml(g.student_name)}</td>
      <td>${escapeHtml(g.category)}</td>
      <td><span class="badge badge-${g.priority.toLowerCase()}">${escapeHtml(g.priority)}</span></td>
      <td><span class="badge badge-${getStatusClass(g.status)}">${escapeHtml(g.status)}</span></td>
      <td>${formatDate(g.created_at)}</td>
      <td><button class="action-btn" onclick="openManageModal('${g.id}')">Manage</button></td>
    </tr>
  `).join('');
}

/**
 * Filter admin grievances
 */
function filterAdminGrievances() {
  const search = document.getElementById('admin-search').value.toLowerCase().trim();
  const statusFilter = document.getElementById('admin-filter-status').value;
  const priorityFilter = document.getElementById('admin-filter-priority').value;

  let filtered = adminGrievances;

  if (search) {
    filtered = filtered.filter(g =>
      g.title.toLowerCase().includes(search) ||
      g.ticket_id.toLowerCase().includes(search) ||
      (g.student_name && g.student_name.toLowerCase().includes(search))
    );
  }

  if (statusFilter) {
    filtered = filtered.filter(g => g.status === statusFilter);
  }

  if (priorityFilter) {
    filtered = filtered.filter(g => g.priority === priorityFilter);
  }

  renderAdminTable(filtered);
}

/**
 * Open manage grievance modal
 */
async function openManageModal(id) {
  try {
    const data = await apiRequest(`/grievances/${id}`);
    if (!data || !data.grievance) return;

    const g = data.grievance;
    currentManageId = id;
    selectedStatus = g.status;

    // Populate details
    const detailsEl = document.getElementById('manage-details');
    detailsEl.innerHTML = `
      <div class="detail-item">
        <span class="detail-label">Ticket ID</span>
        <span class="detail-value" style="color: var(--text-accent); font-family: 'Inter', monospace;">${escapeHtml(g.ticket_id)}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Submitted By</span>
        <span class="detail-value">${escapeHtml(g.student_name)}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Category</span>
        <span class="detail-value">${escapeHtml(g.category)}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Current Status</span>
        <span class="detail-value"><span class="badge badge-${getStatusClass(g.status)}">${escapeHtml(g.status)}</span></span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Priority</span>
        <span class="detail-value"><span class="badge badge-${g.priority.toLowerCase()}">${escapeHtml(g.priority)}</span></span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Date</span>
        <span class="detail-value">${formatDate(g.created_at)}</span>
      </div>
    `;

    // Populate description
    document.getElementById('manage-description').textContent = g.description || '';

    // Set active status button
    document.querySelectorAll('.status-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.status === g.status) {
        btn.classList.add('active');
      }
    });

    // Set admin response
    document.getElementById('admin-response-text').value = g.admin_response || '';

    // Show modal
    document.getElementById('modal-overlay').classList.add('active');

  } catch (err) {
    showToast('Failed to load grievance details', 'error');
  }
}

/**
 * Select status button
 */
function selectStatus(status) {
  selectedStatus = status;
  document.querySelectorAll('.status-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.status === status) {
      btn.classList.add('active');
    }
  });
}

/**
 * Save admin response and status update
 */
async function saveResponse() {
  if (!currentManageId) return;

  const response = document.getElementById('admin-response-text').value.trim();
  const btn = document.getElementById('save-response-btn');

  btn.disabled = true;
  btn.textContent = 'Saving...';

  try {
    // Update status
    if (selectedStatus) {
      await apiRequest(`/grievances/${currentManageId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: selectedStatus })
      });
    }

    // Update response
    if (response) {
      await apiRequest(`/grievances/${currentManageId}/response`, {
        method: 'PUT',
        body: JSON.stringify({ admin_response: response })
      });
    }

    showToast('Grievance updated successfully', 'success');
    closeManageModal();

    // Reload table
    loadAdminGrievances();

  } catch (err) {
    showToast(err.message || 'Failed to update grievance', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Response';
  }
}

/**
 * Close manage modal
 */
function closeManageModal() {
  document.getElementById('modal-overlay').classList.remove('active');
  currentManageId = null;
  selectedStatus = null;
}

// ===========================
// Helper Functions
// ===========================

function getStatusClass(status) {
  const map = {
    'Pending': 'pending',
    'In Progress': 'in-progress',
    'Resolved': 'resolved',
    'Rejected': 'rejected'
  };
  return map[status] || 'pending';
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
