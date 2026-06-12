// ===== Grievance Routes =====
const express = require('express');
const router = express.Router();
const grievanceController = require('../controllers/grievanceController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateGrievance } = require('../middleware/validation');

// All routes require authentication
router.use(protect);

// GET /api/grievances/stats — Dashboard statistics
router.get('/stats', grievanceController.getStats);

// POST /api/grievances — Create a new grievance (student only)
router.post('/', authorize('student'), validateGrievance, grievanceController.create);

// GET /api/grievances — Get all grievances (admin) or student's own
router.get('/', grievanceController.getAll);

// GET /api/grievances/:id — Get single grievance
router.get('/:id', grievanceController.getOne);

// PUT /api/grievances/:id/status — Update grievance status (admin only)
router.put('/:id/status', authorize('admin'), grievanceController.updateStatus);

// PUT /api/grievances/:id/response — Add admin response (admin only)
router.put('/:id/response', authorize('admin'), grievanceController.addResponse);

module.exports = router;
