const express = require('express');
const { deleteCommentById } = require('../controllers/comments.controller');

const router = express.Router();

router.delete('/:comment_id', deleteCommentById);

module.exports = router;
