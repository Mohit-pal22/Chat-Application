const router = require("express").Router();
const {sendMessage, getAllMessages} = require("../controllers/messageController");
const {authMiddleware} = require("../middleware/authMiddleware");

router.use(authMiddleware);
router.post('/messages', sendMessage);
router.get('/messages/:chatId', getAllMessages);


module.exports = router;