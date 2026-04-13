const router    = require('express').Router();
const { protect }   = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/roleMiddleware');
const { getAllUsers, getUserTasks, toggleUserStatus, deleteUser, getDashboard } = require('../controllers/adminController');

router.use(protect, adminOnly);
router.get('/dashboard',              getDashboard);
router.get('/users',                  getAllUsers);
router.get('/users/:userId/tasks',    getUserTasks);
router.patch('/users/:userId/toggle', toggleUserStatus);
router.delete('/users/:userId',       deleteUser);

module.exports = router;