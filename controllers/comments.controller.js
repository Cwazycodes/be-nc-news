const {
  fetchCommentsByArticleId,
  insertCommentByArticleId,
  removeCommentById
} = require("../models/comments.models");

const getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;

  fetchCommentsByArticleId(article_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};

const addCommentByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;

  insertCommentByArticleId(article_id, username, body)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

const deleteCommentById = (req,res,next) => {
  const {comment_id} = req.params

  removeCommentById(comment_id)
  .then(() => {
    res.status(204).send()
  })
  .catch(next)

}

module.exports = { getCommentsByArticleId, addCommentByArticleId, deleteCommentById };
