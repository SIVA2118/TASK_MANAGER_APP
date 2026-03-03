const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
        return res.status(400).json({ message: 'Username already taken' });
    }

    try {
        const user = await User.create({
            username,
            email,
            password,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id),
                message: 'User registered successfully'
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/signin
const authUser = async (req, res) => {
    const { email, username, identifier, password } = req.body;

    const loginId = identifier || email || username;

    if (!loginId) {
        return res.status(400).json({ message: 'Please provide an email or username' });
    }

    const user = await User.findOne({
        $or: [
            { email: loginId },
            { username: loginId }
        ]
    });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id),
            message: 'Login successful'
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            fullName: user.fullName || '',
            bio: user.bio || '',
            profileImage: user.profileImage || '',
            company: user.company || '',
            avatarUrl: user.avatarUrl || '',
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.username = req.body.username || user.username;
            user.email = req.body.email || user.email;
            user.fullName = req.body.fullName || user.fullName;
            user.bio = req.body.bio || user.bio;
            user.profileImage = req.body.profileImage || user.profileImage;
            user.company = req.body.company || user.company;
            user.avatarUrl = req.body.avatarUrl || user.avatarUrl;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                fullName: updatedUser.fullName,
                bio: updatedUser.bio,
                profileImage: updatedUser.profileImage,
                company: updatedUser.company,
                avatarUrl: updatedUser.avatarUrl,
                token: generateToken(updatedUser._id),
                message: 'Profile updated'
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("Profile Update Error:", error);
        res.status(500).json({
            message: 'Server Error',
            error: error.message
        });
    }
};

module.exports = {
    registerUser,
    authUser,
    getUserProfile,
    updateUserProfile,
};
