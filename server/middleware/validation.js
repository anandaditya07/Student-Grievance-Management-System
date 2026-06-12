// ===== Input Validation Middleware =====

/**
 * Sanitize string input — strip HTML tags
 */
function sanitize(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>/g, '').trim();
}

/**
 * Validate registration input
 */
exports.validateRegistration = (req, res, next) => {
  const errors = [];
  let { name, email, password, role, department } = req.body;

  // Sanitize inputs
  req.body.name = sanitize(name);
  req.body.email = sanitize(email);
  req.body.department = sanitize(department);

  name = req.body.name;
  email = req.body.email;

  // Name
  if (!name || name.length < 2) {
    errors.push('Full name is required (minimum 2 characters)');
  }

  // Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('A valid email address is required');
  }

  // Password strength
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters');
  } else {
    if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('Password must contain at least one number');
  }

  // Role
  if (role && !['student', 'admin'].includes(role)) {
    errors.push('Role must be either "student" or "admin"');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors[0], errors });
  }

  next();
};

/**
 * Validate login input
 */
exports.validateLogin = (req, res, next) => {
  const errors = [];
  let { email, password } = req.body;

  // Sanitize
  req.body.email = sanitize(email);
  email = req.body.email;

  if (!email) {
    errors.push('Email is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors[0], errors });
  }

  next();
};

/**
 * Validate grievance input
 */
exports.validateGrievance = (req, res, next) => {
  const errors = [];
  let { title, category, priority, description } = req.body;

  // Sanitize
  req.body.title = sanitize(title);
  req.body.description = sanitize(description);
  req.body.department = sanitize(req.body.department);

  title = req.body.title;
  description = req.body.description;

  if (!title || title.length < 3) {
    errors.push('Title is required (minimum 3 characters)');
  }

  const validCategories = ['Infrastructure', 'Academic', 'Administrative', 'Financial', 'Hostel', 'Library', 'Examination', 'Other'];
  if (!category || !validCategories.includes(category)) {
    errors.push('A valid category is required');
  }

  const validPriorities = ['Low', 'Medium', 'High', 'Critical'];
  if (!priority || !validPriorities.includes(priority)) {
    errors.push('A valid priority is required');
  }

  if (!description || description.length < 20) {
    errors.push('Description is required (minimum 20 characters)');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors[0], errors });
  }

  next();
};
