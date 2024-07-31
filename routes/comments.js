const express = require('express');
const { deleteCommentById, patchCommentVotes } = require('../controllers/comments.controller');

const router = express.Router();

router.delete('/:comment_id', deleteCommentById);
router.patch('/:comment_id', patchCommentVotes)

module.exports = router;
