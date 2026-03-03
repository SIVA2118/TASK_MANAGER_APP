const Workout = require('../models/Workout');

// @desc    Get all workouts for user
// @route   GET /api/workouts
const getWorkouts = async (req, res) => {
    try {
        const workouts = await Workout.find({ userId: req.user._id }).sort({ createdAt: -1 });

        const formattedWorkouts = workouts.map(workout => {
            const w = workout.toObject();
            w.id = w._id;
            return w;
        });

        res.json(formattedWorkouts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new workout
// @route   POST /api/workouts
const createWorkout = async (req, res) => {
    try {
        const { title, name, time, date, duration, description } = req.body;

        const workout = new Workout({
            userId: req.user._id,
            title: title || name,
            time: time || date,
            duration: duration || 60,
            description
        });

        const createdWorkout = await workout.save();
        const w = createdWorkout.toObject();
        w.id = w._id;

        res.status(201).json(w);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete workout
// @route   DELETE /api/workouts/:id
const deleteWorkout = async (req, res) => {
    try {
        const workout = await Workout.findById(req.params.id);

        if (!workout) {
            return res.status(404).json({ message: 'Workout not found' });
        }

        if (workout.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await workout.deleteOne();
        res.json({ message: 'Workout removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getWorkouts,
    createWorkout,
    deleteWorkout,
};
