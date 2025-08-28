const router = require("express").Router();
const {authMiddleware} = require("../middleware/authMiddleware");
const {createNewChat, getAllChats, clearUnreadMsg} = require('../controllers/chatController');

router.use(authMiddleware);
router.post('/chats', createNewChat);
router.get('/chats', getAllChats);
router.post('/clear-unread-msg', clearUnreadMsg)


module.exports = router;