// ===== Grievance Controller =====
const { createClient } = require('@supabase/supabase-js');
const { sendGrievanceSubmitted, sendStatusChanged } = require('../utils/email');

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

/**
 * Generate unique ticket ID (GRV-XXXXXXX)
 */
function generateTicketId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'GRV-';
  for (let i = 0; i < 7; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Create a new grievance
 * POST /api/grievances
 */
exports.create = async (req, res) => {
  try {
    const { title, category, priority, department, description } = req.body;
    const user = req.user;

    // Generate unique ticket ID
    let ticket_id = generateTicketId();

    // Ensure uniqueness
    let exists = true;
    while (exists) {
      const { data } = await supabase
        .from('grievances')
        .select('id')
        .eq('ticket_id', ticket_id)
        .single();

      if (!data) {
        exists = false;
      } else {
        ticket_id = generateTicketId();
      }
    }

    // Insert grievance
    const { data: grievance, error } = await supabase
      .from('grievances')
      .insert({
        ticket_id,
        title,
        category,
        priority,
        department: department || '',
        description,
        student_id: user.id,
        student_name: user.name,
        student_email: user.email,
        status: 'Pending',
        admin_response: ''
      })
      .select()
      .single();

    if (error) {
      console.error('Create grievance error:', error);
      return res.status(500).json({ message: 'Failed to submit grievance' });
    }

    // Send email notification (non-blocking)
    sendGrievanceSubmitted(grievance).catch(err => {
      console.error('Email notification error:', err);
    });

    res.status(201).json({
      message: 'Grievance submitted successfully',
      grievance
    });

  } catch (err) {
    console.error('Create error:', err);
    res.status(500).json({ message: 'Server error while creating grievance' });
  }
};

/**
 * Get all grievances
 * GET /api/grievances
 */
exports.getAll = async (req, res) => {
  try {
    const user = req.user;
    const { limit, sort, order, status, priority, category, search } = req.query;

    let query = supabase.from('grievances').select('*');

    // If student, only show their own grievances
    if (user.role === 'student') {
      query = query.eq('student_id', user.id);
    }

    // Apply filters
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (category) query = query.eq('category', category);

    // Search
    if (search) {
      query = query.or(`title.ilike.%${search}%,ticket_id.ilike.%${search}%,student_name.ilike.%${search}%`);
    }

    // Sorting
    const sortField = sort || 'created_at';
    const sortOrder = order === 'asc' ? true : false;
    query = query.order(sortField, { ascending: sortOrder });

    // Limit
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data: grievances, error } = await query;

    if (error) {
      console.error('Get grievances error:', error);
      return res.status(500).json({ message: 'Failed to fetch grievances' });
    }

    res.json({ grievances: grievances || [] });

  } catch (err) {
    console.error('GetAll error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get single grievance
 * GET /api/grievances/:id
 */
exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const { data: grievance, error } = await supabase
      .from('grievances')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    // Students can only view their own grievances
    if (user.role === 'student' && grievance.student_id !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ grievance });

  } catch (err) {
    console.error('GetOne error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update grievance status
 * PUT /api/grievances/:id/status
 */
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'In Progress', 'Resolved', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const { data: grievance, error } = await supabase
      .from('grievances')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error || !grievance) {
      return res.status(500).json({ message: 'Failed to update status' });
    }

    // Send email notification (non-blocking)
    sendStatusChanged(grievance, status).catch(err => {
      console.error('Email notification error:', err);
    });

    res.json({
      message: 'Status updated successfully',
      grievance
    });

  } catch (err) {
    console.error('UpdateStatus error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Add admin response
 * PUT /api/grievances/:id/response
 */
exports.addResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_response } = req.body;

    if (!admin_response || admin_response.trim() === '') {
      return res.status(400).json({ message: 'Response text is required' });
    }

    const { data: grievance, error } = await supabase
      .from('grievances')
      .update({
        admin_response: admin_response.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !grievance) {
      return res.status(500).json({ message: 'Failed to save response' });
    }

    res.json({
      message: 'Response saved successfully',
      grievance
    });

  } catch (err) {
    console.error('AddResponse error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get dashboard statistics
 * GET /api/grievances/stats
 */
exports.getStats = async (req, res) => {
  try {
    const user = req.user;

    let query = supabase.from('grievances').select('*');

    // If student, only count their own
    if (user.role === 'student') {
      query = query.eq('student_id', user.id);
    }

    const { data: grievances, error } = await query;

    if (error) {
      console.error('Stats error:', error);
      return res.status(500).json({ message: 'Failed to fetch statistics' });
    }

    const all = grievances || [];

    // Status counts
    const total = all.length;
    const pending = all.filter(g => g.status === 'Pending').length;
    const inProgress = all.filter(g => g.status === 'In Progress').length;
    const resolved = all.filter(g => g.status === 'Resolved').length;
    const rejected = all.filter(g => g.status === 'Rejected').length;

    // Priority counts
    const priority = {
      Low: all.filter(g => g.priority === 'Low').length,
      Medium: all.filter(g => g.priority === 'Medium').length,
      High: all.filter(g => g.priority === 'High').length,
      Critical: all.filter(g => g.priority === 'Critical').length
    };

    // Category counts
    const categoryMap = {};
    all.forEach(g => {
      categoryMap[g.category] = (categoryMap[g.category] || 0) + 1;
    });

    // Department counts
    const departmentMap = {};
    all.forEach(g => {
      if (g.department) {
        departmentMap[g.department] = (departmentMap[g.department] || 0) + 1;
      }
    });

    // Monthly trends (last 6 months)
    const months = [];
    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const count = all.filter(g => {
        const gDate = new Date(g.created_at);
        return gDate.getFullYear() === d.getFullYear() && gDate.getMonth() === d.getMonth();
      }).length;

      months.push({
        month: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
        count
      });
    }

    res.json({
      total,
      pending,
      inProgress,
      resolved,
      rejected,
      priority,
      category: categoryMap,
      department: departmentMap,
      monthly: months
    });

  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
