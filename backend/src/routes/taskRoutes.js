const router = require('express').Router();
const { getTasks, createTask, getTask, updateTask, deleteTask, getStats } = require('../controllers/taskController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);
router.get('/stats', getStats);
router.get('/',      getTasks);
router.post('/',     createTask);
router.get('/:id',   getTask);
router.put('/:id',   updateTask);
router.delete('/:id', deleteTask);

module.exports = router;