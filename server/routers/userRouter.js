const router = require('express').Router();
const {authMiddleware} = require('../middleware/authMiddleware.js');
const {getLogedInUser, getAllUsers, uploadProfilePic} = require('../controllers/userController.js');

router.use(authMiddleware);
router.get('/me', getLogedInUser);
router.get('/users', getAllUsers);
router.post('/profile-pic', uploadProfilePic)

module.exports = router;