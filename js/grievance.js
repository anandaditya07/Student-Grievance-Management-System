// ===== Grievance Module =====
// Handles submit grievance, my grievances, search/filter, and view details

// Store all grievances for filtering
let allGrievances = [];

/**
 * Submit a new grievance
 */
async function submitGrievance() {
  const title = document.getElementById('grievance-title').value.trim();
  const category = document.getElementById('grievance-category').value;
  const priority = document.getElementById('grievance-priority').value;
  const department = document.getElementById('grievance-department').value.trim();
  const email = document.getElementById('grievance-email').value.trim();
  const description = document.getElementById('grievance-description').value.trim();

  // Reset errors
  document.querySelectorAll('.form-group').forEach(g => g.classList.remove('error'));

  // Validate
  let hasError = false;

  if (!title) {
    document.getElementById('title-group').classList.add('error');
    hasError = true;
  }
  if (!category) {
    document.getElementById('category-group').classList.add('error');
    hasError = true;
  }
  if (!priority) {
    document.getElementById('priority-group').classList.add('error');
    hasError = true;
  }
  if (!description || description.length < 20) {
    document.getElementById('description-group').classList.add('error');
    hasError = true;
  }

  if (hasError) return;

  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  btn.textContent = 'Submitting...';

  try {
    const data = await apiRequest('/grievances', {
      method: 'POST',
      body: JSON.stringify({
        title,
        category,
        priority,
        department,
        email,
        description
      })
    });

    if (data && data.grievance) {
      // Show success modal
      document.getElementById('success-ticket-id').textContent = data.grievance.ticket_id;
      document.getElementById('success-overlay').classList.remove('hidden');

      // Reset form
      document.getElementById('grievance-form').reset();

      // Re-fill auto-fill fields
      const user = getCurrentUser();
      if (user) {
        document.getElementById('grievance-email').value = user.email || '';
        document.getElementById('grievance-department').value = user.department || '';
      }
    }

  } catch (err) {
    showToast(err.message || 'Failed to submit grievance', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Submit Grievance';
  }
}

/**
 * Load all grievances for the current student
 */
async function loadMyGrievances() {
  try {
    const data = await apiRequest('/grievances');
    if (!data) return;

    allGrievances = data.grievances || [];
    renderGrievancesTable(allGrievances);

    // Update badge
    const badge = document.getElementById('grievance-count-badge');
    if (badge) badge.textContent = allGrievances.length;

  } catch (err) {
    console.error('Failed to load grievances:', err);
    showToast('Failed to load grievances', 'error');
  }
}

/**
 * Render grievances into table
 */
function renderGrievancesTable(grievances) {
  const tbody = document.getElementById('grievances-tbody');
  const table = document.getElementById('grievances-table');
  const emptyMsg = document.getElementById('no-grievances-msg');

  if (!tbody) return;

  if (grievances.length === 0) {
    table.style.display = 'none';
    emptyMsg.classList.remove('hidden');
    return;
  }

  table.style.display = 'table';
  emptyMsg.classList.add('hidden');

  tbody.innerHTML = grievances.map(g => `
    <tr>
      <td>${escapeHtml(g.ticket_id)}</td>
      <td style="color: var(--text-primary); max-width: 200px; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(g.title)}</td>
      <td>${escapeHtml(g.category)}</td>
      <td><span class="badge badge-${g.priority.toLowerCase()}">${escapeHtml(g.priority)}</span></td>
      <td><span class="badge badge-${getStatusClass(g.status)}">${escapeHtml(g.status)}</span></td>
      <td>${formatDate(g.created_at)}</td>
      <td><button class="action-btn" onclick="viewGrievanceDetails('${g.id}')">View Details</button></td>
    </tr>
  `).join('');
}

/**
 * Filter grievances based on search and dropdown filters
 */
function filterGrievances() {
  const search = document.getElementById('search-grievances').value.toLowerCase().trim();
  const statusFilter = document.getElementById('filter-status').value;
  const priorityFilter = document.getElementById('filter-priority').value;

  let filtered = allGrievances;

  if (search) {
    filtered = filtered.filter(g =>
      g.title.toLowerCase().includes(search) ||
      g.ticket_id.toLowerCase().includes(search)
    );
  }

  if (statusFilter) {
    filtered = filtered.filter(g => g.status === statusFilter);
  }

  if (priorityFilter) {
    filtered = filtered.filter(g => g.priority === priorityFilter);
  }

  renderGrievancesTable(filtered);
}

/**
 * View grievance details in modal
 */
async function viewGrievanceDetails(id) {
  try {
    const data = await apiRequest(`/grievances/${id}`);
    if (!data || !data.grievance) return;

    const g = data.grievance;
    const modalBody = document.getElementById('modal-body');

    modalBody.innerHTML = `
      <div class="detail-grid">
        <div class="detail-item">
          <span class="detail-label">Ticket ID</span>
          <span class="detail-value" style="color: var(--text-accent); font-family: 'Inter', monospace;">${escapeHtml(g.ticket_id)}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Title</span>
          <span class="detail-value">${escapeHtml(g.title)}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Status</span>
          <span class="detail-value"><span class="badge badge-${getStatusClass(g.status)}">${escapeHtml(g.status)}</span></span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Priority</span>
          <span class="detail-value"><span class="badge badge-${g.priority.toLowerCase()}">${escapeHtml(g.priority)}</span></span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Category</span>
          <span class="detail-value">${escapeHtml(g.category)}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Date Submitted</span>
          <span class="detail-value">${formatDate(g.created_at)}</span>
        </div>
      </div>

      <div class="detail-item full-width" style="margin-bottom: 1.2rem;">
        <span class="detail-label">Description</span>
        <div class="detail-description">${escapeHtml(g.description)}</div>
      </div>

      <div class="detail-item full-width">
        <span class="detail-label">Admin Response</span>
        ${g.admin_response
          ? `<div class="admin-response-box">${escapeHtml(g.admin_response)}</div>`
          : `<div class="admin-response-box no-response">No response yet</div>`
        }
      </div>
    `;

    // Show modal
    document.getElementById('modal-overlay').classList.add('active');

  } catch (err) {
    showToast('Failed to load grievance details', 'error');
  }
}

/**
 * Close modal
 */
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
}

/**
 * Helper: Get status CSS class
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
 * Helper: Format date
 */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Helper: Escape HTML
 */
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
