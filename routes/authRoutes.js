const express = require('express');
const router = express.Router();
const {
    registerUser,
    authUser,
    getUserProfile,
    updateUserProfile,
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/signup', registerUser);
router.post('/signin', authUser);

// Since frontend makes requests to /users/profile and /users/signup depending on the endpoint...
// Actually, looking at the grep, we have:
// POST /auth/signin
// POST /auth/signup
// GET /users/profile
// PUT /users/profile

module.exports = router;
