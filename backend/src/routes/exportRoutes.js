const router = require('express').Router();
const { protect } = require('../middlewares/authMiddleware');
const { exportJSON, exportExcel, exportPDF, exportWord } = require('../controllers/exportController');

router.use(protect);
router.get('/json',  exportJSON);
router.get('/excel', exportExcel);
router.get('/pdf',   exportPDF);
router.get('/word',  exportWord);

module.exports = router;