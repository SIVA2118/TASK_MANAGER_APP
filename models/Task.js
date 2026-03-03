const mongoose = require('mongoose');

const subtaskSchema = mongoose.Schema({
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    timing: { type: String },
}, { timestamps: true });

const commentSchema = mongoose.Schema({
    content: { type: String, required: true },
    username: { type: String, required: true },
}, { timestamps: true });

const attachmentSchema = mongoose.Schema({
    name: { type: String, required: true },
    url: { type: String }, // Optional, maybe we store type instead if it's just a dummy string from frontend
    type: { type: String },
});

const taskSchema = mongoose.Schema(
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
        description: {
            type: String,
        },
        status: {
            type: String,
            required: true,
            default: 'TODO', // Expected values: TODO, IN_PROGRESS, COMPLETED
        },
        time: {
            type: String, // E.g., '10:00 AM'
        },
        category: {
            type: String,
            default: 'General',
        },
        priority: {
            type: String, // e.g. High, Medium, Low. Added for completeness if frontend uses it later.
            default: 'Medium'
        },
        dueDate: {
            type: Date,
        },
        reminder: {
            type: Boolean,
            default: false,
        },
        reminderTime: {
            type: Date,
        },
        subtasks: [subtaskSchema],
        comments: [commentSchema],
        attachments: [attachmentSchema],
        createdAt: {
            type: Date,
            default: Date.now,
        }
    },
    {
        timestamps: true,
    }
);

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
