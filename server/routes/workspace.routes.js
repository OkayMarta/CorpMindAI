const router = require('express').Router();
const workspaceController = require('../controllers/workspaceController');
const invitationController = require('../controllers/invitationController'); // Імпортуємо новий контролер
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/', workspaceController.createWorkspace);
router.get('/', workspaceController.getAllWorkspaces);
router.get('/:id', workspaceController.getWorkspaceById);
router.get('/:id/members', workspaceController.getWorkspaceMembers);

router.post('/:id/invite', invitationController.createInvitation);

module.exports = router;
