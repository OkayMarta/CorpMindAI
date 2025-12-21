const router = require('express').Router();
const workspaceController = require('../controllers/workspaceController');
const authMiddleware = require('../middlewares/authMiddleware');

// Всі роути захищені (треба бути залогіненим)
router.use(authMiddleware);

router.post('/', workspaceController.createWorkspace);
router.get('/', workspaceController.getAllWorkspaces);
router.get('/:id', workspaceController.getWorkspaceById);

module.exports = router;
