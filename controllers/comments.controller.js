const { fetchCommentsByArticleId } = require("../models/comments.models");

const getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;

  if (isNaN(parseInt(article_id, 10))) {
    return next({ status: 400, msg: "Invalid article ID type" });
  }

  fetchCommentsByArticleId(article_id)
    .then((comments) => {
      res.status(200).json({ comments });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = { getCommentsByArticleId };
