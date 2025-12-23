const router = require('express').Router();
const invitationController = require('../controllers/invitationController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// Отримати список вхідних запрошень
router.get('/', invitationController.getMyInvitations);

// Прийняти або відхилити (body: { token, action: 'accept' | 'decline' })
router.post('/respond', invitationController.respondToInvitation);

module.exports = router;
