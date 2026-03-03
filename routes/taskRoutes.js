const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/taskController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
    .get(protect, getTasks)
    .post(protect, createTask);

router.route('/:id')
    .put(protect, updateTask)
    .delete(protect, deleteTask);

// Subtasks
router.route('/:id/subtasks')
    .get(protect, getSubtasks)
    .post(protect, addSubtask);

router.route('/:id/subtasks/:subtaskId')
    .put(protect, updateSubtask)
    .delete(protect, deleteSubtask);

// Comments
router.route('/:id/comments')
    .get(protect, getComments)
    .post(protect, addComment);

router.route('/:id/comments/:commentId')
    .delete(protect, deleteComment);

// Attachments
router.route('/:id/attachments')
    .get(protect, getAttachments)
    .post(protect, addAttachment);

router.route('/:id/attachments/:attachmentId')
    .delete(protect, deleteAttachment);

module.exports = router;
