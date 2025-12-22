const router = require('express').Router();
const authMiddleware = require('../middlewares/authMiddleware');
const chatController = require('../controllers/chatController');

router.use(authMiddleware);

router.post('/', chatController.sendMessage); // POST /api/chat
router.get('/:workspaceId', chatController.getHistory); // GET /api/chat/:id

module.exports = router;
