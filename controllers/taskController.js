const Task = require('../models/Task');

// @desc    Get all tasks for user
// @route   GET /api/tasks
const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user._id }).sort({ createdAt: -1 });

        // Frontend expects id instead of _id for everything. We'll map it to be safe.
        // Or frontend can just use ._id from the backend. The frontend has `item.id`.
        const formattedTasks = tasks.map(task => {
            const t = task.toObject();
            t.id = t._id;
            t.subtasks = t.subtasks.map(s => ({ ...s, id: s._id }));
            t.comments = t.comments.map(c => ({ ...c, id: c._id }));
            t.attachments = t.attachments.map(a => ({ ...a, id: a._id }));
            return t;
        });

        res.json(formattedTasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new task
// @route   POST /api/tasks
const createTask = async (req, res) => {
    try {
        const { title, description, time, category, status, priority, reminder, reminderTime, dueDate } = req.body;

        const task = new Task({
            userId: req.user._id,
            title,
            description,
            time,
            category,
            status: status || 'TODO',
            priority,
            reminder,
            reminderTime,
            dueDate
        });

        const createdTask = await task.save();
        const t = createdTask.toObject();
        t.id = t._id;
        res.status(201).json(t);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (task.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        task.title = req.body.title || task.title;
        task.description = req.body.description !== undefined ? req.body.description : task.description;
        task.status = req.body.status || task.status;
        task.time = req.body.time || task.time;
        task.category = req.body.category || task.category;
        task.priority = req.body.priority || task.priority;
        task.reminder = req.body.reminder !== undefined ? req.body.reminder : task.reminder;
        task.reminderTime = req.body.reminderTime !== undefined ? req.body.reminderTime : task.reminderTime;
        task.dueDate = req.body.dueDate !== undefined ? req.body.dueDate : task.dueDate;

        const updatedTask = await task.save();
        const t = updatedTask.toObject();
        t.id = t._id;
        res.json(t);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (task.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await task.deleteOne();
        res.json({ message: 'Task removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- SUBTASKS ---

// @desc    Add subtask
// @route   POST /api/tasks/:id/subtasks
const addSubtask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const subtask = {
            title: req.body.title,
            completed: req.body.completed || false,
            timing: req.body.timing
        };

        task.subtasks.push(subtask);
        await task.save();

        const addedSubtask = task.subtasks[task.subtasks.length - 1].toObject();
        addedSubtask.id = addedSubtask._id;
        res.status(201).json(addedSubtask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update subtask
// @route   PUT /api/tasks/:id/subtasks/:subtaskId
const updateSubtask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const subtask = task.subtasks.id(req.params.subtaskId);
        if (!subtask) return res.status(404).json({ message: 'Subtask not found' });

        if (req.body.title !== undefined) subtask.title = req.body.title;
        if (req.body.completed !== undefined) subtask.completed = req.body.completed;
        if (req.body.timing !== undefined) subtask.timing = req.body.timing;

        await task.save();
        const updatedSubtask = subtask.toObject();
        updatedSubtask.id = updatedSubtask._id;
        res.json(updatedSubtask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete subtask
// @route   DELETE /api/tasks/:id/subtasks/:subtaskId
const deleteSubtask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        task.subtasks.pull({ _id: req.params.subtaskId });
        await task.save();
        res.json({ message: 'Subtask removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- COMMENTS ---

const addComment = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const comment = {
            content: req.body.content,
            username: req.body.username || req.user.username
        };

        task.comments.push(comment);
        await task.save();

        const addedComment = task.comments[task.comments.length - 1].toObject();
        addedComment.id = addedComment._id;
        res.status(201).json(addedComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteComment = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        task.comments.pull({ _id: req.params.commentId });
        await task.save();
        res.json({ message: 'Comment removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- ATTACHMENTS ---

const addAttachment = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const attachment = {
            name: req.body.name || req.body.fileName,
            url: req.body.url || req.body.fileUrl,
            type: req.body.type || req.body.fileType
        };

        task.attachments.push(attachment);
        await task.save();

        const addedAttachment = task.attachments[task.attachments.length - 1].toObject();
        addedAttachment.id = addedAttachment._id;
        res.status(201).json(addedAttachment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteAttachment = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        task.attachments.pull({ _id: req.params.attachmentId });
        await task.save();
        res.json({ message: 'Attachment removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// The frontend makes GET requests for subtasks/comments/attachments just to refresh them individually,
// but our task model already returns them all inside the task document. 
// We will still implement them to stick to the frontend's API contract.

const getSubtasks = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        const data = task.subtasks.map(i => { const obj = i.toObject(); obj.id = obj._id; return obj; });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getComments = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        const data = task.comments.map(i => { const obj = i.toObject(); obj.id = obj._id; return obj; });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getAttachments = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        const data = task.attachments.map(i => { const obj = i.toObject(); obj.id = obj._id; return obj; });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


module.exports = {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    addComment,
    deleteComment,
    addAttachment,
    deleteAttachment,
    getSubtasks,
    getComments,
    getAttachments
};
