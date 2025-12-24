const router = require('express').Router();
const workspaceController = require('../controllers/workspaceController');
const invitationController = require('../controllers/invitationController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/', workspaceController.createWorkspace);
router.get('/', workspaceController.getAllWorkspaces);
router.get('/:id', workspaceController.getWorkspaceById);
router.get('/:id/members', workspaceController.getWorkspaceMembers);

router.delete('/:id', workspaceController.deleteWorkspace); // Видалити весь чат
router.delete('/:id/leave', workspaceController.leaveWorkspace); // Вийти з чату

router.post('/:id/invite', invitationController.createInvitation);

module.exports = router;
