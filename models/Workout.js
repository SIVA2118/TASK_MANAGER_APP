const mongoose = require('mongoose');

const workoutSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        title: {
            type: String,
            required: true,
        },
        time: {
            type: String,
            required: true, // E.g., '10:00 AM'
        },
        duration: {
            type: Number, // In minutes
            default: 60,
        },
        description: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
);

const Workout = mongoose.model('Workout', workoutSchema);

module.exports = Workout;
