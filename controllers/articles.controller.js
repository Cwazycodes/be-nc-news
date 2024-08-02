const db = require("../db/connection");
const {
  fetchArticleById,
  fetchArticles,
  updateArticleVotes,
  addArticle,
  deleteArticleById,
} = require("../models/article.models");

const getArticleById = (req, res, next) => {
  const { article_id } = req.params;

  fetchArticleById(article_id)
    .then((article) => {
      if (!article) {
        return next({ status: 404, msg: "Not Found" });
      }
      res.status(200).send({ article });
    })
    .catch((err) => {
      console.error(err);
      next(err);
    });
};

const getArticles = (req, res, next) => {
  const { sort_by, order, topic } = req.query;
  fetchArticles(sort_by, order, topic)
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch(next);
};

const patchArticleById = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;

  updateArticleVotes(article_id, inc_votes)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

const postArticle = (req, res, next) => {
  const { author, title, body, topic, article_img_url } = req.body;

  if (!author || !title || !body || !topic) {
    return res.status(400).send({ message: "Missing required fields" });
  }
  addArticle({ author, title, body, topic, article_img_url })
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch(next);
};

const deleteArticle = (req, res, next) => {
  const { article_id } = req.params;

  deleteArticleById(article_id)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};

module.exports = {
  getArticleById,
  getArticles,
  patchArticleById,
  postArticle,
  deleteArticle,
};
